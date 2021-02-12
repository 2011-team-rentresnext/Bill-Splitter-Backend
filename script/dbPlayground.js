const db = require('../db')
const {Op, Sequelize} = require('sequelize')

const {User, Item, Receipt, ItemizedTransaction} = require('../db/models')

async function play() {
  try {
    // const user = await User.findByPk(85)
    // const its = await user.getItems()
    // const recs = await user.getReceipts()
    // console.log('itcssssss', its)
    // console.log('reeeecs', recs)
    // const rec = await Receipt.create({creditorId: 85, total: 5000})
    receiptsAsDebtor = await Receipt.findAll({
      // where: {creditorId: 85},
      include: {
        model: Item,
        where: {},
        include: {
          model: ItemizedTransaction,
          where: {
            debtorId: 85,
            // [Op.not]: [{debtorId: Sequelize.col('receipt.creditorId')}],
          },
        },
      },
    })
    const receiptsAsCreditor = await Receipt.findAll({
      where: {creditorId: 85},
    })
    const ids = receiptsAsCreditor.map((receipt) => receipt.id)
    const filtered = receiptsAsDebtor.filter(
      (receipt) => !ids.includes(receipt.id)
    )
    const allfiltered = [...receiptsAsCreditor, ...filtered]
    allfiltered.sort((a, b) => b.id - a.id)
    // allfiltered.forEach((r) => console.log(r.id))
    // console.log('debitorrrr', receipts)
    // console.log('creditorrrrrrr', receiptsAsCreditor)
  } catch (error) {
    console.log(error)
  }
}

play()
// Receipt.findByPk(1, {
//   attributes: [['id', 'receiptId'], 'total'],
//   include: [
//     {
//       model: Item,
//       attributes: ['id', 'itemId', 'name', 'price', 'quantity'],
//       include: [
//         {
//           model: ItemizedTransaction,
//           attributes: ['id', 'itemizedTransactionId', 'amountOwed', 'paid'],
//           include: {
//             model: User,
//             attributes: ['id', 'debtorId', 'fullName'],
//           },
//         },
//       ],
//     },
//     {
//       model: User,
//       attributes: ['id', 'creditorId', 'fullName'],
//     },
//   ],
// }).then((receipt) => console.log(receipt));
// console.log(receipt);
