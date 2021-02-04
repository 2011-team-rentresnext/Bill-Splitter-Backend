const User = require("./user");
console.log(User);
const Item = require("./item");
console.log(Item);
const ItemizedTransaction = require("./itemizedTransaction");
const Receipt = require("./receipt");
console.log(ItemizedTransaction);

User.hasMany(Receipt);
Receipt.belongsTo(User, { as: "creditor" });

Receipt.hasMany(Item);
Item.belongsTo(Receipt);

User.belongsToMany(Item, {
  through: ItemizedTransaction,
  foreignKey: "debtorId",
});

Item.belongsToMany(User, {
  through: ItemizedTransaction,
  otherKey: "debtorId",
});

Item.hasMany(ItemizedTransaction);
ItemizedTransaction.belongsTo(User, { as: "debtor" });

module.exports = {
  User,
  Item,
  ItemizedTransaction,
  Receipt,
};
