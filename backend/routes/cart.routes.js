const express = require("express");
const {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");
const protect = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", protect, getCart);
router.delete("/", protect, clearCart);
router.post("/:productId", protect, addToCart);
router.put("/:productId", protect, updateQuantity);
router.patch("/:productId", protect, updateQuantity); // Lab 05 spec uses PATCH
router.delete("/:productId", protect, removeFromCart);

module.exports = router;
