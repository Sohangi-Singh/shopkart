import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import SafeImage from "../components/SafeImage";
import { useCart } from "../context/CartContext";

const initialAddress = { fullName: "", phone: "", addressLine1: "", city: "", state: "", pincode: "" };
const fields = [
  ["fullName", "Full name"], ["phone", "Phone number"], ["addressLine1", "Address"],
  ["city", "City"], ["state", "State"], ["pincode", "Pincode"],
];

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Checkout() {
  const { cartItems, subtotal, loading, refreshCart, setCartItems } = useCart();
  const [address, setAddress] = useState(initialAddress);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    refreshCart().catch((err) => { if (err.response?.status === 401) navigate("/login"); });
  }, [refreshCart, navigate]);

  function validate() {
    const next = {};
    fields.forEach(([key, label]) => { if (!address[key].trim()) next[key] = `${label} is required.`; });
    const phone = address.phone.replace(/[\s()+-]/g, "");
    if (address.phone.trim() && !/^\d{10,15}$/.test(phone)) next.phone = "Enter a valid phone number.";
    if (address.pincode.trim() && !/^\d{6}$/.test(address.pincode.trim())) next.pincode = "Pincode must contain 6 digits.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function placeOrder(event) {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;
    setPlacing(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Unable to load Razorpay Checkout. Check your connection and try again.");
      const { data } = await api.post("/orders/create-payment-order", { shippingAddress: address });
      const checkout = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: "ShopKart order payment",
        order_id: data.razorpayOrderId,
        prefill: { name: address.fullName, contact: address.phone },
        theme: { color: "#4f46e5" },
        handler: async (response) => {
          try {
            const verified = await api.post("/orders/verify-payment", {
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setCartItems([]);
            navigate(`/order-success/${verified.data.order._id}`, { state: { order: verified.data.order } });
          } catch (err) {
            setFormError(err.response?.data?.message || "Payment could not be verified. Your cart is still available.");
          } finally {
            setPlacing(false);
          }
        },
        modal: { ondismiss: () => setPlacing(false) },
      });
      checkout.on("payment.failed", (response) => {
        setFormError(response.error?.description || "Payment failed. Your cart has not been cleared. Please try again.");
        setPlacing(false);
      });
      checkout.open();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || "Could not start checkout.");
      setPlacing(false);
    }
  }

  return <>
    <Navbar />
    <main className="container">
      <h1 className="page-title">Checkout</h1>
      <p className="page-sub">Add your delivery details and review your ShopKart order.</p>
      {formError && <p className="error" role="alert">{formError}</p>}
      {loading ? <p>Loading your cart…</p> : cartItems.length === 0 ? (
        <div className="card-panel empty"><h3>Your cart is empty</h3><p>Add something before checkout.</p><Link to="/products"><button>Browse Products</button></Link></div>
      ) : <form className="checkout-layout" onSubmit={placeOrder} noValidate>
        <section className="card-panel">
          <h2>Shipping details</h2>
          <div className="checkout-fields">
            {fields.map(([key, label]) => <div key={key}>
              <label className="lbl" htmlFor={key}>{label}</label>
              <input id={key} name={key} value={address[key]} autoComplete={key === "addressLine1" ? "street-address" : key} onChange={(e) => setAddress({ ...address, [key]: e.target.value })} aria-invalid={Boolean(errors[key])} />
              {errors[key] && <small className="field-error">{errors[key]}</small>}
            </div>)}
          </div>
        </section>
        <aside className="card-panel checkout-summary">
          <h2>Order summary</h2>
          {cartItems.map(({ product, quantity }) => product && <div className="checkout-item" key={product._id}>
            <SafeImage src={product.image} alt={product.name} />
            <div><b>{product.name}</b><small>Qty {quantity}</small></div>
            <strong>₹{(product.price * quantity).toLocaleString("en-IN")}</strong>
          </div>)}
          <div className="checkout-total"><span>Total</span><strong>₹{subtotal.toLocaleString("en-IN")}</strong></div>
          <p className="muted">Final price and stock are checked securely before payment.</p>
          <button className="btn-success" type="submit" disabled={placing}>{placing ? "Preparing secure payment…" : "Place Order & Pay"}</button>
          <Link className="link" to="/cart">← Return to cart</Link>
        </aside>
      </form>}
    </main>
  </>;
}

export default Checkout;
