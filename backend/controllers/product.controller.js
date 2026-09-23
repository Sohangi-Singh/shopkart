const mongoose = require("mongoose");
const Product = require("../models/product.model");

// POST /products
async function createProduct(req, res) {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // 1. All fields required
    if (!name || !description || !price || !category || !image || stock === undefined) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // 2. Price must be > 0
    if (price <= 0) {
      return res.status(400).json({ success: false, message: "Price must be greater than 0" });
    }

    // 3. Stock cannot be negative
    if (stock < 0) {
      return res.status(400).json({ success: false, message: "Stock cannot be negative" });
    }

    const product = await Product.create({ name, description, price, category, image, stock });
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /products?search=...&category=...
async function getProducts(req, res) {
  try {
    const { search, category } = req.query;

    // Build query dynamically
    const query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" }; // case-insensitive
    }
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query);
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /products/:id
async function getProductById(req, res) {
  try {
    // Invalid MongoDB id
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { createProduct, getProducts, getProductById };
