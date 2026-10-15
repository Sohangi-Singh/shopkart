import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  // Lab 05 Sec 16: cart count comes from shared state, not a separate fetch
  const { cartCount, refreshCart, setCartItems } = useCart();

  useEffect(() => {
    // Load once per navigation; CartContext holds the single truth
    refreshCart().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  async function handleLogout() {
    try {
      await api.post("/customers/logout");
    } catch {
      // ignore - still go to login
    }
    setCartItems([]);
    navigate("/login");
  }

  const isActive = (p) => (location.pathname === p ? "active" : "");

  return (
    <nav className="topnav">
      <Link to="/home" className="brand">
        <span className="brand-mark">🛒</span> ShopKart
      </Link>
      <div className="nav-links">
        <Link to="/home" className={isActive("/home")}>Home</Link>
        <Link to="/products" className={isActive("/products")}>Products</Link>
        <Link to="/wishlist" className={isActive("/wishlist")}>Wishlist</Link>
        <Link to="/cart" className={isActive("/cart")}>
          Cart{cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>
        <Link to="/orders" className={isActive("/orders")}>Orders</Link>
      </div>
      <button className="nav-btn btn-sm" onClick={handleLogout}>Logout</button>
    </nav>
  );
}

export default Navbar;
