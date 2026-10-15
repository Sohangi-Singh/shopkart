const express = require("express");
const Order = require("../models/order.model");
const protect = require("../middlewares/auth.middleware");
const { createPaymentOrder, verifyPayment } = require("../controllers/order.controller");

const router = express.Router();

router.post("/create-payment-order", protect, createPaymentOrder);
router.post("/verify-payment", protect, verifyPayment);

// GET /orders (protected) - my order history
router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /orders/:id (protected)
router.get("/:id", protect, async (req, res) => {
  try {
    const mongoose = require("mongoose");
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
