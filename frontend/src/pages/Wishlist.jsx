import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import SafeImage from "../components/SafeImage";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  async function fetchWishlist() {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/wishlist");
      setWishlist(res.data.wishlist);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate("/login");
      } else {
        setError("Unable to load wishlist.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRemove(productId) {
    await api.delete(`/wishlist/${productId}`);
    fetchWishlist();
  }

  async function moveToCart(p) {
    try {
      await api.post(`/cart/${p._id}`, { quantity: 1 });
      setMsg(`${p.name} moved to cart ✓`);
      setTimeout(() => setMsg(""), 2000);
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not move to cart");
    }
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h2 className="page-title">My Wishlist ({wishlist.length})</h2>
        <p className="page-sub">Your saved items. Move them to cart when ready.</p>
        {msg && <div className="success-box">{msg}</div>}

        {loading && <p>Loading your wishlist...</p>}

        {!loading && error && (
          <>
            <p className="error">{error}</p>
            <button onClick={fetchWishlist}>Try Again</button>
          </>
        )}

        {!loading && !error && wishlist.length === 0 && (
          <div className="card-panel empty">
            <div style={{ fontSize: 40 }}>🤍</div>
            <h3>Your wishlist is empty</h3>
            <p>Tap the heart on any product to save it here.</p>
            <Link to="/products"><button style={{ maxWidth: 240, margin: "10px auto" }}>Browse Products</button></Link>
          </div>
        )}

        <div className="grid">
          {wishlist.map((p) => (
            <div key={p._id} className="card">
              <SafeImage src={p.image} alt={p.name} />
              <div className="card-body">
                <span className="badge">{p.category}</span>
                <h4>{p.name}</h4>
                <div className="price">Rs. {p.price?.toLocaleString("en-IN")}</div>
                <Link className="link" to={`/products/${p._id}`}>View Details →</Link>
                <div className="card-actions">
                  <button className="icon-btn" onClick={() => moveToCart(p)}>🛒 Move to Cart</button>
                  <button className="icon-btn btn-danger" onClick={() => handleRemove(p._id)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Wishlist;
