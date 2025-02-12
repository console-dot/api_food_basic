const mongoose = require("mongoose");
const { Schema } = mongoose;

const DarftSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    todayexpense: {
      type: Number,
      default: 0,
      min: 0,
    },
    todaypurchase: {
      type: Number,
      default: 0,
      min: 0,
    },

  },
  { timestamps: true }
);

const DarftModels = new mongoose.model("Darft", DarftSchema);
module.exports = { DarftModels };
