"use strict";

// eslint-disable-next-line import/no-unresolved
const express = require("express");
const db = require("./db");
const session = require("express-session");
const passport = require("passport");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const sessionStore = new SequelizeStore({ db });
sessionStore.sync();

const app = express();

// middleware
app.use(express.json());
// passport registration
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.models.user.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default secret goes here",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  console.log("Session:", req.session);
  console.log("Session ID:", req.session.id);
  if (req.session.passport) {
    console.log("user ID:", req.session.passport.user);
  } else {
    console.log("user ID: undefined");
  }
  next();
});
app.use(passport.initialize());
app.use(passport.session());

// API ROUTES
app.use("/api", require("./routes"));

// Default Route
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
