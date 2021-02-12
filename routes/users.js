const router = require('express').Router({mergeParams: true})
const {Op} = require('sequelize')
const {User, ItemizedTransaction, Receipt, Item} = require('../db/models')

module.exports = router

// /api/users/search?name=<NAME>
/*
Takes in a name (search term) and searches for users in the DB that match that name, returns an array of users matching the search term
*/
router.get('/search', async (req, res, next) => {
  try {
    if (req.query.name) {
      let users = await User.findAll({
        where: {
          [Op.or]: [
            {firstName: {[Op.iLike]: `%${req.query.name}%`}},
            {lastName: {[Op.iLike]: `%${req.query.name}%`}},
          ],
        },
      })
      res.json(users)
    }
  } catch (err) {
    next(err)
  }
})

//users debts route

router.get('/:userId/debts', async (req, res, next) => {
  try {
    let debts = await ItemizedTransaction.findAll({
      raw: true,
      nest: true,
      where: {
        debtorId: req.params.userId,
        paid: false,
      },
      include: [
        {
          model: Item,
          include: {
            model: Receipt,
            include: {
              model: User,
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
          },
        },
      ],
    })
    res.json(arrangeDebtsByReceipt(debts))
  } catch (error) {
    next(error)
  }
})

const arrangeDebtsByReceipt = (queryResponse) => {
  const arrangedObj = queryResponse.reduce((resultObj, itemizedTransaction) => {
    const receiptId = itemizedTransaction.item.receiptId
    const creditor = itemizedTransaction.item.receipt.user
    let item = itemizedTransaction.item
    let receipt = itemizedTransaction.item.receipt
    delete item.receipt
    delete receipt.user
    if (resultObj[receiptId]) {
      // add to receipt
      resultObj[receiptId].items.push(item)
    } else {
      // create new receipt
      resultObj[receiptId] = {
        creditor,
        receipt,
        items: [item],
      }
    }
    return resultObj
  }, {})
  return Object.keys(arrangedObj).map((key) => {
    arrangedObj[key].totalDebt = arrangedObj[key].items.reduce(
      (total, item) => {
        return total + item.price
      },
      0
    )
    return arrangedObj[key]
  })
}
