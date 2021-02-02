const Sequelize = require("sequelize");

const db = new Sequelize("", process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: 5432,
  logging: console.log,
  maxConcurrentQueries: 100,
  dialect: "postgres",
  ssl: "Amazon RDS",
  pool: { maxConnections: 5, maxIdleTime: 30 },
  language: "en",
});

module.exports = {
  db,
  Sequelize,
};
