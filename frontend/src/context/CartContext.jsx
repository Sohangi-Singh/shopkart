import { createContext, useContext, useState, useCallback, useMemo } from "react";
import api from "../services/api";

// Lab 05 Task 6: one shared source of truth for cart.
// Navbar, ProductCard, Cart Page all read from here - no separate fetches.
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]); // [{product, quantity, subtotal}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Apply a backend cart payload to state (supports both `items` and `cart` keys)
  function applyCart(data) {
    setCartItems(data.items || data.cart || []);
  }

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/cart");
      applyCart(res.data);
    } catch (err) {
      if (err.response?.status !== 401) setError("Unable to load cart.");
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    const res = await api.post(`/cart/${productId}`, { quantity });
    applyCart(res.data);
    return res.data;
  }, []);

  const updateQuantity = useCallback(async (productId, quantity) => {
    // Lab spec uses PATCH
    const res = await api.patch(`/cart/${productId}`, { quantity });
    applyCart(res.data);
    return res.data;
  }, []);

  const removeFromCart = useCallback(async (productId) => {
    const res = await api.delete(`/cart/${productId}`);
    applyCart(res.data);
    return res.data;
  }, []);

  const clearCart = useCallback(async () => {
    const res = await api.delete("/cart");
    applyCart(res.data);
    return res.data;
  }, []);

  // Derived state (Lab 05 Sec 15): never stored in DB, always calculated
  const value = useMemo(() => {
    const subtotal = cartItems.reduce((sum, i) => sum + (i.subtotal ?? i.product?.price * i.quantity ?? 0), 0);
    const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0); // total units for Navbar
    return {
      cartItems, setCartItems, loading, error,
      subtotal, total: subtotal, cartCount, itemCount: cartCount,
      refreshCart, addToCart, updateQuantity, removeFromCart, clearCart,
    };
  }, [cartItems, loading, error, refreshCart, addToCart, updateQuantity, removeFromCart, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
