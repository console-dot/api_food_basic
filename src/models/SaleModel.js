// models/Sale.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const saleSchema = new Schema(
  {
    todaysPurchase: {
      type: String,
      required: true,
    },
    todaysExpense: {
      type: String,
      required: true,
    },
    cashInHand: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    soldAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
const SaleModel = new mongoose.model("Sale", saleSchema);
module.exports = { SaleModel };
