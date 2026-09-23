const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// POST /wishlist/:productId (protected)
async function addToWishlist(req, res) {
  try {
    const { productId } = req.params;

    // 1. Validate id
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    // 2. Product must exist
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // 3. Get logged-in user (from auth middleware)
    const customer = await Customer.findById(req.user._id);

    // 4. Prevent duplicates
    if (customer.wishlist.includes(productId)) {
      return res.status(409).json({ success: false, message: "Already in wishlist" });
    }

    // 5. Save reference (only ObjectId, not full product)
    customer.wishlist.push(productId);
    await customer.save();

    res.json({ success: true, message: "Product added to wishlist" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /wishlist (protected)
async function getWishlist(req, res) {
  try {
    // populate() replaces ObjectIds with real product data
    const customer = await Customer.findById(req.user._id).populate(
      "wishlist",
      "name price category image stock"
    );

    res.json({ success: true, count: customer.wishlist.length, wishlist: customer.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /wishlist/:productId (protected)
async function removeFromWishlist(req, res) {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const customer = await Customer.findById(req.user._id);

    // Product must be in wishlist
    if (!customer.wishlist.includes(productId)) {
      return res.status(404).json({ success: false, message: "Product not in wishlist" });
    }

    // Remove the id from array
    customer.wishlist = customer.wishlist.filter((id) => id.toString() !== productId);
    await customer.save();

    res.json({ success: true, message: "Product removed from wishlist" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { addToWishlist, getWishlist, removeFromWishlist };
