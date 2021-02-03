const Sequelize = require('sequelize');
const db = require('../db');

const ItemizedTransaction = db.define('itemizedTransaction', {
  // id: {
  //   type: Sequelize.INTEGER,
  //   primaryKey: true,
  //   autoIncrement: true,
  //   allowNull: false
  // },
  // amount: {
  //   type: Sequelize.VIRTUAL,
  //   get() {
  //     // return ?????;
  //   },
  // },
  amountOwed: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  paid: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  // percentage: {
  //   type: Sequelize.INTEGER,
  //   // allowNull: false,
  //   // validate: {
  //   //   notEmpty: true
  //   // }
  // },
});

module.exports = ItemizedTransaction;
