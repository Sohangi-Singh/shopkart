import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

// Small card used in Products page
function ProductCard({ product }) {
  const [status, setStatus] = useState("idle"); // idle | saving | added | error

  async function addToWishlist() {
    try {
      setStatus("saving");
      await api.post(`/wishlist/${product._id}`);
      setStatus("added");
    } catch (err) {
      // Duplicate (409) also shows as added
      if (err.response && err.response.status === 409) {
        setStatus("added");
      } else {
        setStatus("error");
      }
    }
  }

  return (
    <div className="card">
      <img src={product.image} alt={product.name} />
      <h4>{product.name}</h4>
      <p>{product.category}</p>
      <p>Rs. {product.price}</p>
      <p>{product.stock} units left</p>
      <Link to={`/products/${product._id}`}>View Details</Link>
      <br />
      <br />
      <button onClick={addToWishlist} disabled={status === "saving" || status === "added"}>
        {status === "idle" && "♡ Add to Wishlist"}
        {status === "saving" && "Saving..."}
        {status === "added" && "♥ Added to Wishlist"}
        {status === "error" && "Retry Wishlist"}
      </button>
      {status === "error" && <p className="error">Unable to save. Try again.</p>}
    </div>
  );
}

export default ProductCard;
