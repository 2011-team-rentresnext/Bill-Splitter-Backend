const db = require('../db')
const {Op, Sequelize} = require('sequelize')

const {User, Item, Receipt, ItemizedTransaction} = require('../db/models')

async function play() {
  try {
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
