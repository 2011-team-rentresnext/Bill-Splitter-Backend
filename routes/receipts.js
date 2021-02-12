const router = require('express').Router({mergeParams: true})
const {Op} = require('sequelize')
const {Receipt, Item, ItemizedTransaction, User} = require('../db/models')
const callGoogleVisionAsync = require('../utils/parser')
const notify = require('../utils/notify')

module.exports = router

// Receipt.create({total, req.user.id})
// items.forEach(item => {
//   Item.create({})
// })

// API/RECEIPTS/
router.post('/', async (req, res, next) => {
  try {
    const receiptObj = await callGoogleVisionAsync(req.body.base64)
    // make sequelize objects
    const seqReceipt = await Receipt.create({
      total: receiptObj.total,
      creditorId: req.user.id,
    })

    const items = []

    for (let i = 0; i < receiptObj.items.length; i++) {
      const item = receiptObj.items[i]
      const seqItem = await Item.create({
        name: item.name,
        price: item.price,
        receiptId: seqReceipt.id,
      })
      const {id, name, price} = seqItem
      items.push({id, name, price})
    }

    const returnReceipt = await Receipt.findByPk(seqReceipt.id, {
      include: [
        {
          model: Item,
          attributes: ['id', 'name', 'price'],
        },
      ],
    })
    res.json(returnReceipt)
  } catch (err) {
    next(err)
  }
})

/*
Takes in a receipt ID and returns the receipt with nested models (Creditor, Items, Itemized transactions, Debtors)
*/
//route not being used
router.get('/:receiptId', async (req, res, next) => {
  try {
    const receipt = await Receipt.findByPk(+req.params.receiptId, {
      include: [
        {
          model: Item,
          include: [
            {
              model: ItemizedTransaction,
              attributes: [
                ['id', 'itemizedTransactionId'],
                'amountOwed',
                'paid',
              ],
              include: {
                model: User,
                as: 'debtor',
                attributes: [['id', 'debtorId'], 'firstName', 'lastName'],
              },
            },
          ],
        },
        {
          model: User,
          attributes: [['id', 'creditorId'], 'firstName', 'lastName'],
        },
      ],
    })
    res.json(receipt)
  } catch (err) {
    console.log(err)
    throw err
  }
})

// assigns users to receipt
/*
Example request:
[
    {
        "userId": 102,
        "assignedItems": [
            {
                "itemId": 270,
                "price": 2487
            },
            {
                "itemId": 271,
                "price": 1922
            }
        ]
    },
    {
        "userId": 103,
        "assignedItems": [
            {
                "itemId": 272,
                "price": 3127
            }
        ]
    }
]
*/
router.post('/:receiptId/assign', async (req, res, next) => {
  try {
    const users = {} // {id: items}
    for (let i = 0; i < req.body.length; i++) {
      let currentAssignment = req.body[i]
      let currentUser = currentAssignment.userId
      users[currentUser] = currentAssignment.assignedItems

      for (let j = 0; j < currentAssignment.assignedItems.length; j++) {
        let currentItem = currentAssignment.assignedItems[j]
        await ItemizedTransaction.create({
          amountOwed: currentItem.price,
          debtorId: currentUser,
          itemId: currentItem.itemId,
        })
      }
    }
    await notify(users)
    res.send('Success')
  } catch (err) {
    console.log(err)
    next(err)
  }
})

/*
Takes in a receipt ID and settles the debt on that receipt for a logged in user (settling debt means changing itemized transaction to paid = true)
*/
router.put('/:receiptId/settle', async (req, res, next) => {
  try {
    console.log('Settling for user: ', req.user.id)
    //look up receipt where id matches user and paid is false
    const receipt = await Receipt.findByPk(+req.params.receiptId, {
      include: [
        {
          model: Item,
          include: [
            {
              model: ItemizedTransaction,
              where: {
                debtorId: req.user.id,
                paid: false,
              },
            },
          ],
        },
        {
          model: User,
        },
      ],
    })

    if (!receipt) next(new Error('No receipt found'))

    // check that items were found
    if (receipt.items.length) {
      //loop over every item
      for (let i = 0; i < receipt.items.length; i++) {
        let currentItem = receipt.items[i]
        // check if item has itemizedTransactions
        if (currentItem.itemizedTransactions.length) {
          // loop over itemized transactions
          for (let j = 0; j < currentItem.itemizedTransactions.length; j++) {
            let currentItemizedTransaction = currentItem.itemizedTransactions[j]
            // check that debtor id matches the user
            if (currentItemizedTransaction.debtorId === req.user.id) {
              // set status of transaction to paid
              await currentItemizedTransaction.update({paid: true})
              console.log(
                'Updated itemized transaction: ',
                currentItemizedTransaction.id,
                ' for user: ',
                req.user.id
              )
            }
          }
        }
      }
    } else {
      // If there are no items found that match criteria
      res.status(400).send('No outstanding debts found for that receipt')
      return
    }

    res.send('success')
  } catch (err) {
    console.log(err)
    next(err)
  }
})
