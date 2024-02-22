const express = require("express");
const app = express();
const fs = require("fs");
const TransactionSchema = require("./schema/Transaction");
const mongoose = require("mongoose");
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

app.listen(3000, () => {
  console.log("Server is running on port 3000");
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

// POST route
app.post("/post", (req, res) => {
  res.send("POST request received");
});

TransactionSchema.updateMany(
  {},
  { $set: { Category: "" } },
  { multi: true, upsert: true }
)
  .then((result) => console.log(result))
  .catch((err) => console.error(err));
