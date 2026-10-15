const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        image: String,
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine1: String,
      city: String,
      state: String,
      pincode: String,
    },
    // `total` and `itemCount` remain for existing Lab 05 order records/UI.
    total: { type: Number, required: true },
    itemCount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["PENDING", "PAID", "FAILED"], default: "PENDING" },
    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"],
      default: "PENDING_PAYMENT",
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
  },
  { timestamps: true }
);

// Expose the lab spec's totalAmount name while retaining compatibility with older clients.
orderSchema.virtual("totalAmount").get(function getTotalAmount() {
  return this.total;
});
orderSchema.set("toJSON", { virtuals: true });
orderSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Order", orderSchema);
