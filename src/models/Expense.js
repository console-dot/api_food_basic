const mongoose = require("mongoose");

const expenseSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      lowercase: true, // Store name in lowercase for consistency
      minlength: [2, "Product name must be at least 2 characters long"],
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);
const ExpenseModel = new mongoose.model("Expense", expenseSchema);
module.exports = { ExpenseModel };
