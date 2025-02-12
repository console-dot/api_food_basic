// models/DailyPurchases.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const dailyPurchasesSchema = new Schema(
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

const DailyPurchaseModel = new mongoose.model("DailyPurchase", dailyPurchasesSchema);
module.exports = { DailyPurchaseModel };
