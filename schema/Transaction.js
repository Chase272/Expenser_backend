const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true
  },
  Description: {
    type: String,
    required: true
  },
  Credit: {
    type: Number,
    required: true
  },
  Debit: {
    type: Number,
    required: true
  },
  Balance: {
    type: Number,
    required: true
  },
  Transaction_Type: {
    type: String,
    enum: ['Credit', 'Debit'],
    required: true
  },
  Date: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);