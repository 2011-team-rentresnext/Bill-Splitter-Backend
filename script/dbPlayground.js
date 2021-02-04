const db = require('../db');
const { User, Item, Receipt, ItemizedTransaction } = require('../db/models');

User.findByPk(1, {
  attributes: [
    'id',
    'firstName',
    'lastName',
    'fullName',
    'isAdmin',
    'phoneNumber',
    'email',
    'password',
    'salt',
    'googleId',
  ],
}).then((user) => {
  console.log(user.dataValues);
  console.log(user.fullName);
});
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
