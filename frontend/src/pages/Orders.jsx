import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/orders")
      .then((res) => {
        setOrders(res.data.orders || []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response?.status === 401) navigate("/login");
        else {
          setError("Unable to load orders.");
          setLoading(false);
        }
      });
  }, [navigate]);

  return (
    <>
      <Navbar />
      <div className="container">
        <h2 className="page-title">My Orders ({orders.length})</h2>
        <p className="page-sub">Your ShopKart purchase history, saved with purchase-time prices.</p>

        {loading && <p>Loading orders...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className="card-panel empty">
            <div style={{ fontSize: 40 }}>📦</div>
            <h3>No orders yet</h3>
            <p>You have not placed any orders yet.</p>
            <Link to="/products"><button style={{ maxWidth: 240, margin: "10px auto" }}>Start Shopping</button></Link>
          </div>
        )}

        {orders.map((o) => (
          <div key={o._id} className="order-card">
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <b>🧾 Order #{o._id.slice(-8).toUpperCase()}</b>
              <span style={{ color: "#64748b", fontSize: 13 }}>{new Date(o.createdAt).toLocaleDateString()}</span>
            </div>
            <div style={{ margin: "8px 0", display: "grid", gap: 6 }}>
              {o.items.map((it, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span>{it.name} × {it.quantity}</span>
                  <span>Rs. {(it.price * it.quantity).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, borderTop: "1px solid #e2e8f0", paddingTop: 8 }}>
              <span>Total ({o.itemCount} items)</span>
              <span>₹ {(o.totalAmount ?? o.total)?.toLocaleString("en-IN")}</span>
            </div>
            <div className="order-card-footer"><span className={`status-pill ${o.status === "PLACED" ? "paid" : ""}`}>{o.status || "PLACED"}</span><Link className="link" to={`/orders/${o._id}`}>View details →</Link></div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Orders;
