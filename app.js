"use strict";

// eslint-disable-next-line import/no-unresolved
const express = require("express");
const { db } = require("./db");

const app = express();

app.use(express.json());

app.use("/api", require("./routes"));

app.get("/syncDb", async (req, res, next) => {
  try {
    if (req.query.force) {
      await db.sync({ force: true });
    } else {
      await db.sync();
    }
    res.send("successfully synced!");
  } catch (err) {
    next(err);
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
