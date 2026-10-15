import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SafeImage from "../components/SafeImage";
import { useCart } from "../context/CartContext";

function Cart() {
  // Lab 05: read from global state - single truth shared with Navbar
  const {
    cartItems: items, loading, error: ctxError,
    subtotal: total, cartCount: itemCount,
    refreshCart, updateQuantity: ctxUpdate, removeFromCart: ctxRemove, clearCart: ctxClear,
  } = useCart();
  const [localError, setLocalError] = useState("");
  const navigate = useNavigate();
  const error = localError || ctxError;

  useEffect(() => {
    refreshCart().catch((err) => {
      if (err.response?.status === 401) navigate("/login");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateQty(productId, quantity) {
    if (quantity < 1) return; // qty 1 uses Remove button (lab rule)
    try {
      setLocalError("");
      await ctxUpdate(productId, quantity); // PATCH /cart/:id
    } catch (err) {
      setLocalError(err.response?.data?.message || "Could not update quantity");
    }
  }

  async function removeItem(productId) {
    await ctxRemove(productId);
  }

  async function clearAll() {
    await ctxClear();
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h2 className="page-title">Shopping Cart 🧺 ({itemCount})</h2>
        <p className="page-sub">Review your items before entering delivery details.</p>

        {loading && <p>Loading your cart...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && items.length === 0 && (
          <div className="card-panel empty">
            <div style={{ fontSize: 40 }}>🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add products to see them here with a live total.</p>
            <Link to="/products"><button style={{ maxWidth: 240, margin: "10px auto" }}>Browse Products</button></Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="card-panel">
            {items.map(({ product, quantity, subtotal }) => (
              product && (
                <div key={product._id} className="cart-row">
                  <SafeImage src={product.image} alt={product.name} style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 10 }} />
                  <div>
                    <h4>{product.name}</h4>
                    <div style={{ color: "#64748b", fontSize: 13 }}>{product.category} • Rs. {product.price?.toLocaleString("en-IN")} each</div>
                    <div className="qty-row" style={{ margin: "8px 0 0" }}>
                      <button className="btn-ghost btn-sm" onClick={() => updateQty(product._id, quantity - 1)}>−</button>
                      <span className="qty-val">{quantity}</span>
                      <button className="btn-ghost btn-sm" onClick={() => updateQty(product._id, quantity + 1)}>+</button>
                      <button className="btn-danger btn-sm" onClick={() => removeItem(product._id)}>Remove</button>
                    </div>
                  </div>
                  <div className="price">Rs. {subtotal?.toLocaleString("en-IN")}</div>
                </div>
              )
            ))}

            <div className="summary">
              <div className="summary-row"><span>Items</span><span>{itemCount}</span></div>
              <div className="summary-row"><span>Delivery</span><span>FREE</span></div>
              <div className="summary-row total"><span>Total</span><span>Rs. {total?.toLocaleString("en-IN")}</span></div>
              <div className="btn-row" style={{ marginTop: 12 }}>
                <button className="btn-success" onClick={() => navigate("/checkout")}>Proceed to Checkout →</button>
                <button className="btn-danger" style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }} onClick={clearAll}>Clear</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Cart;
