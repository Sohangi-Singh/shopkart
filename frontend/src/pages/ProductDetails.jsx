import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import SafeImage from "../components/SafeImage";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data.product);
        setLoading(false);
      })
      .catch(() => {
        setError("Product not found.");
        setLoading(false);
      });
  }, [id]);

  async function addToCart() {
    try {
      setMsg("Adding...");
      await api.post(`/cart/${id}`, { quantity: qty });
      setMsg("Added to cart ✓");
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not add to cart");
    }
  }

  async function addToWishlist() {
    try {
      setMsg("Saving to wishlist...");
      await api.post(`/wishlist/${id}`);
      setMsg("Saved to wishlist ♥");
    } catch (err) {
      if (err.response?.status === 409) setMsg("Already in wishlist ♥");
      else setMsg("Could not save to wishlist");
    }
  }

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
  if (error) return <p className="error" style={{ margin: 24 }}>{error}</p>;

  return (
    <>
      <Navbar />
      <div className="container">
        <Link className="link" to="/products">← Back to products</Link>
        <div className="card-panel" style={{ marginTop: 12 }}>
          <div className="detail-wrap">
            <SafeImage src={product.image} alt={product.name} style={{ width: "100%", borderRadius: 14, height: 340, objectFit: "cover" }} />
            <div>
              <span className="badge">{product.category}</span>
              <h2 className="page-title" style={{ marginTop: 8 }}>{product.name}</h2>
              <p style={{ color: "#64748b" }}>{product.description}</p>
              <div className="price" style={{ fontSize: 24 }}>Rs. {product.price?.toLocaleString("en-IN")}</div>
              <div className={`stock ${product.stock <= 5 ? "low" : ""}`}>
                {product.stock > 0 ? `${product.stock} units available` : "Out of stock"}
              </div>

              <div className="qty-row">
                <button className="btn-ghost btn-sm" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span className="qty-val">{qty}</span>
                <button className="btn-ghost btn-sm" onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))}>+</button>
                <span style={{ fontSize: 13, color: "#64748b" }}>Qty</span>
              </div>

              <div className="btn-row">
                <button onClick={addToCart} disabled={product.stock < 1}>🛒 Add to Cart</button>
                <button className="btn-ghost" onClick={addToWishlist}>♡ Wishlist</button>
              </div>
              {msg && <p style={{ color: "#4f46e5", fontWeight: 600 }}>{msg}</p>}
              <div className="btn-row">
                <button className="btn-success" onClick={() => { addToCart(); navigate("/cart"); }}>Buy Now →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductDetails;
