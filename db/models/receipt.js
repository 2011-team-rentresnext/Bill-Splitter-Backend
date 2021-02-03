const Sequelize = require('sequelize');
const db = require('../db');

const Receipt = db.define('receipt', {
  total: {
    type: Sequelize.INTEGER,
  },
  // date: {
  //   type: Sequelize.DATE,
  //   allowNull: false,
  //   validate: {
  //     notEmpty: true
  //   }
  // },
  // location: {
  //   type: Sequelize.STRING,
  //   allowNull: false,
  //   validate: {
  //     notEmpty: true
  //   }
  // },
});

module.exports = Receipt;
