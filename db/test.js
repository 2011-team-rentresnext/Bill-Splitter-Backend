const Sequelize = require("sequelize");
const { db } = require("./index");

const Test = db.define("test", {
  name: {
    type: Sequelize.STRING,
  },
});

module.exports = Test;
