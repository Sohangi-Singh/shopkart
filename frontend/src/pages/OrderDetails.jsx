import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function OrderDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState("");
  const successPage = location.pathname.startsWith("/order-success/");

  useEffect(() => {
    if (order) return;
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order)).catch((err) => {
      if (err.response?.status === 401) navigate("/login");
      else setError(err.response?.data?.message || "Unable to load this order.");
    }).finally(() => setLoading(false));
  }, [id, navigate, order]);

  return <><Navbar /><main className="container">
    {loading && <p>Loading order…</p>}
    {error && <p className="error">{error}</p>}
    {order && <>
      <div className="success-box"><h1>{successPage ? "✅ Order placed successfully" : "Order details"}</h1><p>{successPage ? "Your payment was verified and your order has been saved." : "Here are the details for your ShopKart order."}</p></div>
      <section className="card-panel order-detail">
        <div className="order-detail-heading"><div><span className="muted">Order ID</span><h2>{order._id}</h2></div><span className={`status-pill ${order.status === "PLACED" ? "paid" : ""}`}>{order.status || "PLACED"}</span></div>
        <p className="muted">Placed {new Date(order.createdAt).toLocaleString()}</p>
        <h3>Items</h3>
        {order.items?.map((item, index) => <div className="order-line" key={`${item.product}-${index}`}><span>{item.name} × {item.quantity}</span><strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong></div>)}
        <div className="checkout-total"><span>Total</span><strong>₹{(order.totalAmount ?? order.total)?.toLocaleString("en-IN")}</strong></div>
        {order.shippingAddress?.addressLine1 && <div className="shipping-address"><h3>Delivering to</h3><p>{order.shippingAddress.fullName}<br />{order.shippingAddress.addressLine1}<br />{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}<br />{order.shippingAddress.phone}</p></div>}
      </section>
      <div className="btn-row order-actions"><Link to="/orders"><button className="btn-ghost">View My Orders</button></Link><Link to="/products"><button>Continue Shopping</button></Link></div>
    </>}
  </main></>;
}

export default OrderDetails;
