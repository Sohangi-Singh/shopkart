import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/customers/register", { fullName, email, password, phone });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
        <h2>Create account</h2>
        <p className="muted">Join ShopKart for faster checkout and order history.</p>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label className="lbl">Full name</label>
          <input placeholder="Aarav Sharma" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <label className="lbl">Email</label>
          <input placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className="lbl">Password (min 6 chars)</label>
          <input placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <label className="lbl">Phone</label>
          <input placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Account"}</button>
        </form>
        <p style={{ fontSize: 14 }}>
          Already have an account? <Link className="link" to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
