import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import SafeImage from "./SafeImage";
import { useCart } from "../context/CartContext";

// Small card used in Products page
function ProductCard({ product }) {
  const [wish, setWish] = useState("idle"); // idle | saving | added | error
  const [cartMsg, setCartMsg] = useState(""); // feedback for cart
  const [adding, setAdding] = useState(false);
  const { addToCart: addToGlobalCart } = useCart();

  async function addToWishlist() {
    try {
      setWish("saving");
      await api.post(`/wishlist/${product._id}`);
      setWish("added");
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setWish("added");
      } else {
        setWish("error");
      }
    }
  }

  async function addToCart() {
    try {
      setAdding(true);
      setCartMsg("Adding...");
      await addToGlobalCart(product._id, 1); // shared state -> Navbar updates instantly
      setCartMsg("Added to cart ✓");
      setTimeout(() => setCartMsg(""), 2000);
    } catch (err) {
      setCartMsg(err.response?.data?.message || "Could not add to cart");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="card">
      <SafeImage src={product.image} alt={product.name} />
      <div className="card-body">
        <span className="badge">{product.category}</span>
        <h4>{product.name}</h4>
        <div className="price">Rs. {product.price?.toLocaleString("en-IN")}</div>
        <div className={`stock ${product.stock <= 5 ? "low" : ""}`}>
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </div>
        <Link className="link" to={`/products/${product._id}`}>View Details →</Link>
        <div className="card-actions">
          <button className="icon-btn" onClick={addToCart} disabled={product.stock < 1 || adding}>
            {adding ? "Adding..." : "🛒 Add to Cart"}
          </button>
          <button
            className="icon-btn btn-ghost"
            onClick={addToWishlist}
            disabled={wish === "saving" || wish === "added"}
          >
            {wish === "idle" && "♡"}
            {wish === "saving" && "..."}
            {wish === "added" && "♥ Saved"}
            {wish === "error" && "Retry"}
          </button>
        </div>
        {cartMsg && <div style={{ fontSize: 13, color: "#4f46e5" }}>{cartMsg}</div>}
      </div>
    </div>
  );
}

export default ProductCard;
