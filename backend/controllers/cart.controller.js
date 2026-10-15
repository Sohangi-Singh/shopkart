const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// Helper: load cart with product details + totals
async function getPopulatedCart(customerId) {
  const customer = await Customer.findById(customerId).populate(
    "cart.product",
    "name price category image stock description"
  );
  const items = customer.cart.map((c) => ({
    product: c.product,
    quantity: c.quantity,
    subtotal: c.product ? c.product.price * c.quantity : 0,
  }));
  // .reduce() = many items -> one total value
  const total = items.reduce((sum, i) => sum + i.subtotal, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  return { items, total, itemCount };
}

// POST /cart/:productId  body: { quantity? } (default 1, protected)
async function addToCart(req, res) {
  try {
    const { productId } = req.params;
    const qty = Number(req.body.quantity) || 1;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    if (qty < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    if (product.stock < 1) {
      return res.status(400).json({ success: false, message: "Product is out of stock" });
    }

    const customer = await Customer.findById(req.user._id);
    const existing = customer.cart.find((c) => c.product.toString() === productId);

    if (existing) {
      const newQty = existing.quantity + qty;
      if (newQty > product.stock) {
        return res
          .status(400)
          .json({ success: false, message: `Only ${product.stock} units available` });
      }
      existing.quantity = newQty;
    } else {
      if (qty > product.stock) {
        return res
          .status(400)
          .json({ success: false, message: `Only ${product.stock} units available` });
      }
      customer.cart.push({ product: productId, quantity: qty });
    }

    await customer.save();
    const cart = await getPopulatedCart(req.user._id);
    res.json({ success: true, message: "Added to cart", cart: cart.items, ...cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /cart (protected)
async function getCart(req, res) {
  try {
    const cart = await getPopulatedCart(req.user._id);
    res.json({ success: true, cart: cart.items, ...cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PUT/PATCH /cart/:productId  body: { quantity } (protected)
async function updateQuantity(req, res) {
  try {
    const { productId } = req.params;
    const qty = Number(req.body.quantity);

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    if (!qty || qty < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    if (qty > product.stock) {
      return res
        .status(400)
        .json({ success: false, message: `Only ${product.stock} units available` });
    }

    const customer = await Customer.findById(req.user._id);
    const item = customer.cart.find((c) => c.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Product not in cart" });
    }

    item.quantity = qty;
    await customer.save();
    const cart = await getPopulatedCart(req.user._id);
    res.json({ success: true, message: "Quantity updated", cart: cart.items, ...cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /cart/:productId (protected)
async function removeFromCart(req, res) {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const customer = await Customer.findById(req.user._id);
    const before = customer.cart.length;
    customer.cart = customer.cart.filter((c) => c.product.toString() !== productId);
    if (customer.cart.length === before) {
      return res.status(404).json({ success: false, message: "Product not in cart" });
    }

    await customer.save();
    const cart = await getPopulatedCart(req.user._id);
    res.json({ success: true, message: "Removed from cart", cart: cart.items, ...cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /cart (clear all, protected)
async function clearCart(req, res) {
  try {
    const customer = await Customer.findById(req.user._id);
    customer.cart = [];
    await customer.save();
    res.json({ success: true, message: "Cart cleared", items: [], total: 0, itemCount: 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { addToCart, getCart, updateQuantity, removeFromCart, clearCart };
