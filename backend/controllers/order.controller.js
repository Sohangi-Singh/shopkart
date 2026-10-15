const crypto = require("crypto");
const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");

const requiredAddressFields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];

function validateAddress(input) {
  if (!input || typeof input !== "object") return "Shipping address is required";
  const address = {};
  for (const field of requiredAddressFields) {
    if (typeof input[field] !== "string" || !input[field].trim()) {
      return `${field} is required`;
    }
    address[field] = input[field].trim();
  }
  const phoneDigits = address.phone.replace(/[\s()+-]/g, "");
  if (!/^\d{10,15}$/.test(phoneDigits)) return "Enter a valid phone number";
  address.phone = phoneDigits;
  if (!/^\d{6}$/.test(address.pincode)) return "Pincode must contain 6 digits";
  return address;
}

function createRazorpayClient() {
  if (!process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_") || !process.env.RAZORPAY_KEY_SECRET) return null;
  const Razorpay = require("razorpay");
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}

async function createPaymentOrder(req, res) {
  const address = validateAddress(req.body.shippingAddress);
  if (typeof address === "string") {
    return res.status(400).json({ success: false, message: address });
  }

  const razorpay = createRazorpayClient();
  if (!razorpay) {
    return res.status(503).json({ success: false, message: "Razorpay Test Mode keys (rzp_test_…) are not configured on the server" });
  }

  let order;
  try {
    const customer = await Customer.findById(req.user._id);
    if (!customer || customer.cart.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty" });
    }

    const orderItems = [];
    let total = 0;
    for (const cartItem of customer.cart) {
      const product = await Product.findById(cartItem.product);
      if (!product) {
        return res.status(400).json({ success: false, message: "A product in your cart is no longer available" });
      }
      if (!Number.isInteger(cartItem.quantity) || cartItem.quantity < 1 || product.stock < cartItem.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}.` });
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: cartItem.quantity,
      });
      total += product.price * cartItem.quantity;
    }

    // Persist the pending ShopKart order first; the cart remains untouched until verified payment.
    order = await Order.create({
      customer: customer._id,
      items: orderItems,
      shippingAddress: address,
      total: Number(total.toFixed(2)),
      itemCount: orderItems.reduce((sum, item) => sum + item.quantity, 0),
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    const paymentOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100),
      currency: "INR",
      receipt: order._id.toString(),
    });
    order.razorpayOrderId = paymentOrder.id;
    await order.save();

    return res.status(201).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: paymentOrder.id,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    // Leave a persisted pending order for audit if Razorpay creation fails; it cannot be paid or clear the cart.
    return res.status(500).json({ success: false, message: err.error?.description || err.message || "Could not start payment" });
  }
}

async function verifyPayment(req, res) {
  const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!mongoose.isValidObjectId(shopKartOrderId) || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: "Payment details are incomplete" });
  }
  if (!process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_") || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ success: false, message: "Razorpay is not configured on the server" });
  }

  try {
    const order = await Order.findOne({ _id: shopKartOrderId, customer: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: "Payment order does not match" });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest("hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");
    if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // Idempotent retries also repair a cart clear if it failed after the order save.
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();
    await Customer.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });
    return res.json({ success: true, message: "Payment verified and order placed", order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Could not verify payment" });
  }
}

module.exports = { createPaymentOrder, verifyPayment };
