"use strict";

// eslint-disable-next-line import/no-unresolved
const express = require("express");
const { db } = require("./db");
const Test = require("./db/test");

const app = express();

app.use(express.json());

app.post("/user", async (req, res, next) => {
  try {
    // await db.sync({ force: true });
    console.log(req.body);
    const newUser = await Test.create(req.body);
    res.json(newUser);
  } catch (error) {
    next(error);
  }
});

// Routes
app.get("/*", async (req, res, next) => {
  try {
    res.send(
      `This app is deployed, bb! Request received: ${req.method} - ${req.path}`
    );
  } catch (error) {
    next(error);
  }
});

// Error handler
app.use((err, req, res) => {
  console.error(err);
  res.status(500).send(error);
});

module.exports = app;
