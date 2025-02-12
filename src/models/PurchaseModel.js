const mongoose = require("mongoose");

const purchaseSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Purchase name is required"],
      trim: true,
      lowercase: true, // Store name in lowercase for consistency
      minlength: [2, "Purchase name must be at least 2 characters long"],
      maxlength: [100, "Purchase name cannot exceed 100 characters"],
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
const PurchaseModel = new mongoose.model("Purchase", purchaseSchema);
module.exports = { PurchaseModel };
