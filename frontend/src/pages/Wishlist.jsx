import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function fetchWishlist() {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/wishlist");
      setWishlist(res.data.wishlist);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate("/login"); // not logged in
      } else {
        setError("Unable to load wishlist.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWishlist();
  }, []);

  async function handleRemove(productId) {
    await api.delete(`/wishlist/${productId}`);
    fetchWishlist(); // refresh list
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>My Wishlist ({wishlist.length})</h2>

        {loading && <p>Loading your wishlist...</p>}

        {!loading && error && (
          <>
            <p className="error">{error}</p>
            <button onClick={fetchWishlist}>Try Again</button>
          </>
        )}

        {!loading && !error && wishlist.length === 0 && (
          <>
            <p>Your wishlist is empty ❤️</p>
            <Link to="/products">
              <button>Browse Products</button>
            </Link>
          </>
        )}

        <div className="grid">
          {wishlist.map((p) => (
            <div key={p._id} className="card">
              <img src={p.image} alt={p.name} />
              <h4>{p.name}</h4>
              <p>Rs. {p.price}</p>
              <p>{p.category}</p>
              <Link to={`/products/${p._id}`}>View Details</Link>
              <br />
              <br />
              <button onClick={() => handleRemove(p._id)}>Remove ♥</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Wishlist;
