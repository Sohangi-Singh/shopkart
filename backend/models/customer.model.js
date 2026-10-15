const mongoose = require("mongoose");

// Customer schema - Lab 01 + Lab 04 (wishlist field added in Lab 04)
const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    // Lab 04: wishlist stores Product IDs (reference, not full product)
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    // Lab 05: cart stores product + quantity (reference, not full product)
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
          min: 1,
        },
      },
    ],
  },
  { timestamps: true } // creates createdAt automatically
);

module.exports = mongoose.model("Customer", customerSchema);
