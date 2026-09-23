import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Navbar() {
  const navigate = useNavigate();

  async function handleLogout() {
    await api.post("/customers/logout");
    navigate("/login");
  }

  return (
    <nav>
      <b>ShopKart</b>
      <Link to="/home">Home</Link>
      <Link to="/products">Products</Link>
      <Link to="/wishlist">Wishlist</Link>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}

export default Navbar;
