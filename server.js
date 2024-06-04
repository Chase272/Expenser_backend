const express = require("express");
const app = express();
const fs = require("fs");
const TransactionSchema = require("./schema/Transaction");
const mongoose = require("mongoose");
const cors = require("cors");

const UserSchema = require("./schema/UserSchema");
require("dotenv").config();

let transactions = {};
let count = 0;

const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL);
const db = mongoose.connection;

db.on("connected", function () {
  console.log("connection is sucessfull");
});

db.on("error", console.error.bind(console, "connection error:"));
app.use(cors());
app.use(express.json());

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});

app.get("/top-transactions", (req, res) => {
  TransactionSchema.aggregate([
    {
      $addFields: {
        total: { $add: ["$Credit", "$Debit"] },
      },
    },
    {
      $sort: {
        total: -1,
      },
    },
    {
      $limit: 5,
    },
  ])
    .then((result) => res.send(result))
    .catch((err) => res.status(500).send(err));
});

app.get("/transactions/debit", (req, res) => {
  TransactionSchema.aggregate([
    { $match: { Transaction_Type: "Debit" } },
    {
      $sort: {
        Debit: -1,
      },
    },
  ])
    .then((result) => res.send(result))
    .catch((err) => res.status(500).send(err));
});

app.get("/transactions/credit", (req, res) => {
  TransactionSchema.aggregate([
    { $match: { Transaction_Type: "Credit" } },
    {
      $sort: {
        Credit: -1,
      },
    },
  ])
    .then((result) => res.send(result))
    .catch((err) => res.status(500).send(err));
});

app.get("/transactions/byDate", (req, res) => {
  TransactionSchema.aggregate([
    {
      $group: {
        _id: { $toDate: "$Date" },
        transactions: { $push: "$$ROOT" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ])
    .then((result) => res.send(result))
    .catch((err) => console.error(err));
});

app.get("/charts/transactions", (req, res) => {
  TransactionSchema.aggregate([
    {
      $group: {
        _id: {
          // week: { $week: "$Date" },
          month: { $month: "$Date" },
          year: { $year: "$Date" },
        },
        income: { $sum: "$Credit" },
        expense: { $sum: "$Debit" },
      },
    },
    {
      $project: {
        _id: 0,
        // week: "$_id.week",
        month: "$_id.month",
        year: "$_id.year",
        income: 1,
        expense: 1,
      },
    },
  ])
    .then((result) => {
      console.log(result);
      res.send(result);
    })
    .catch((err) => console.error(err));
});

// POST route
app.post("/post", (req, res) => {
  res.send("POST request received");
});

app.post("/signIn", (req, res) => {
  const { username, password } = req.body;

  UserSchema.findOne({ Username: username }).then((user) => {
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.Password == password) {
      // Passwords match
      res.json({ msg: "Success" });
    } else {
      // Passwords don't match
      res.status(400).json({ error: "Invalid credentials" });
    }
  });
});

app.post("/logIn", (req, res) => {
  const { username, password } = req.body;

  UserSchema.findOne({ Username: username }).then((user) => {
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.Password == password) {
      // Passwords match
      res.json({ msg: "Success" });
    } else {
      // Passwords don't match
      res.status(400).json({ error: "Invalid credentials" });
    }
  });
});
