const User = require('./user')
const Item = require('./item')
const ItemizedTransaction = require('./itemizedTransaction')
const Receipt = require('./receipt')

User.hasMany(Receipt, {foreignKey: 'creditorId'})
Receipt.belongsTo(User, {foreignKey: 'creditorId'})

Receipt.hasMany(Item)
Item.belongsTo(Receipt)

User.belongsToMany(Item, {
  through: ItemizedTransaction,
  foreignKey: 'debtorId',
})

Item.belongsToMany(User, {
  through: ItemizedTransaction,
  otherKey: 'debtorId',
})

Item.hasMany(ItemizedTransaction)
ItemizedTransaction.belongsTo(User, {as: 'debtor'})

module.exports = {
  User,
  Item,
  ItemizedTransaction,
  Receipt,
}
