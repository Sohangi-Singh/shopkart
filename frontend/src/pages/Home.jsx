import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Home() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ products: 0, wishlist: 0, cart: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const me = await api.get("/customers/me");
        setUser(me.data);
        // Fetch counts in parallel; ignore failures
        const [prod, wish, cart, orders] = await Promise.allSettled([
          api.get("/products"),
          api.get("/wishlist"),
          api.get("/cart"),
          api.get("/orders"),
        ]);
        setStats({
          products: prod.status === "fulfilled" ? prod.value.data.count ?? prod.value.data.products?.length ?? 0 : 0,
          wishlist: wish.status === "fulfilled" ? wish.value.data.count ?? wish.value.data.wishlist?.length ?? 0 : 0,
          cart: cart.status === "fulfilled" ? cart.value.data.itemCount ?? 0 : 0,
          orders: orders.status === "fulfilled" ? orders.value.data.count ?? 0 : 0,
        });
      } catch {
        navigate("/login");
        return;
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="hero">
          <h1>Welcome, {user.fullName}! 👋</h1>
          <p>Everything you need — products, wishlist, cart and orders — in one clean dashboard. Start shopping below.</p>
          <div className="hero-actions">
            <Link to="/products"><button className="btn-sm" style={{ background: "#fff", color: "#0f172a", width: "auto" }}>🛍️ Shop products</button></Link>
            <Link to="/cart"><button className="btn-sm" style={{ background: "rgba(255,255,255,0.18)", width: "auto" }}>🧺 Go to cart ({stats.cart})</button></Link>
          </div>
          <div className="stat-row">
            <div className="stat"><b>{stats.products}</b><span>Products live</span></div>
            <div className="stat"><b>{stats.wishlist}</b><span>In wishlist</span></div>
            <div className="stat"><b>{stats.cart}</b><span>Items in cart</span></div>
            <div className="stat"><b>{stats.orders}</b><span>Orders placed</span></div>
          </div>
        </div>

        <div className="card-panel">
          <h3 style={{ marginTop: 0 }}>Your profile</h3>
          <p style={{ color: "#64748b", margin: "4px 0" }}>Email: <b style={{ color: "#0f172a" }}>{user.email}</b></p>
          <p style={{ color: "#64748b", margin: "4px 0" }}>Phone: <b style={{ color: "#0f172a" }}>{user.phone}</b></p>
          <div className="btn-row" style={{ marginTop: 12 }}>
            <Link to="/products" style={{ flex: 1 }}><button className="btn-ghost">Browse catalog</button></Link>
            <Link to="/orders" style={{ flex: 1 }}><button className="btn-ghost">View orders</button></Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
