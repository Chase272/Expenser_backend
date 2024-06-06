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
      // console.log(result);
      res.send(result);
    })
    .catch((err) => console.error(err));
});

app.get("/category/byGroup", (req, res) => {
  TransactionSchema.aggregate([
    { $match: { Transaction_Type: "Debit" } },
    {
      $group: {
        _id: {
          Category: "$Category",
        },

        totalDebit: { $sum: "$Debit" },
      },
    },
    {
      $sort: {
        totalDebit: -1,
      },
    },
    {
      $group: {
        _id: null,
        totalDebitAll: { $sum: "$totalDebit" },
        categories: { $push: "$$ROOT" },
      },
    },
    {
      $unwind: "$categories",
    },
    {
      $project: {
        _id: 0,
        category: "$categories._id.Category",
        totalDebit: "$categories.totalDebit",
        percentage: {
          $multiply: [
            { $divide: ["$categories.totalDebit", "$totalDebitAll"] },
            100,
          ],
        },
      },
    },
  ])
    .then((result) => res.send(result))
    .catch((err) => res.status(500).send(err));
});

app.post("/details/multiple/category", (req, res) => {
  const { name, detailCardCategory } = req.body;

  console.log(name);
  TransactionSchema.updateMany(
    { Name: name },
    { $set: { Category: detailCardCategory } }
  )
    .then((updateResult) => {
      res.status(200).send("Document updated successfully!");
      console.log("Documents updated:", updateResult.modifiedCount);
    })
    .catch((error) => {
      res.status(404).send("Server Error");
      console.error("Error updating documents:", error);
    });
});

app.post("/details/single/category", (req, res) => {
  const { description, detailCardCategory } = req.body;

  // console.log("hit");

  TransactionSchema.findOne({ Description: description })
    .then((transaction) => {
      if (!transaction) {
        return res.status(404).json({ error: "Tranasction Not Found" });
      } else {
        transaction.Category = detailCardCategory;
        return transaction.save();
      }
    })
    .then(() => {
      console.log("Document updated successfully!");
      res.status(200).send("Document updated successfully!");
    })
    .catch((error) => {
      res.status(404).send("Server Error");
      console.error("Error finding or saving document:", error);
    });
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
