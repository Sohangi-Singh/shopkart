import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/customers/login", { email, password });
      navigate("/home");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand" style={{ color: "#0f172a" }}>
          <span className="brand-mark">🛒</span> ShopKart
        </div>
        <h2>Welcome back</h2>
        <p className="muted">Log in to shop, track orders and manage your wishlist.</p>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label className="lbl">Email</label>
          <input placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className="lbl">Password</label>
          <input placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        </form>
        <p style={{ fontSize: 14 }}>
          No account? <Link className="link" to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
