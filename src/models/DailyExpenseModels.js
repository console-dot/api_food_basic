// models/DailySales.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const dailyExpenseSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    totalSales: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalTransactions: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

const DailyExpenseModel = new mongoose.model("DailyExpense", dailyExpenseSchema);
module.exports = { DailyExpenseModel };
