import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import api from "../api/client";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function checkout() {
    setMessage("");
    if (!localStorage.getItem("accessToken")) {
      navigate("/login", {
        state: { message: "Please log in before checking out." },
      });
      return;
    }
    setLoading(true);
    try {
      // Adjust this payload to match your Django OrderSerializer fields.
      const payload = {
        items: items.map((item) => ({
          product: item.id,
          quantity: item.quantity,
        })),
      };

      await api.post("/orders/", payload);
      clearCart();
      setMessage("Order placed successfully!");
    } catch (error) {
      setMessage(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Checkout endpoint unavailable. Check your Django /orders/ route and serializer.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="page-hero compact-hero">
        <p className="eyebrow">YOUR GOODIES</p>
        <h1>Your cart</h1>
        <p>Everything you need for a lovely little break.</p>
      </section>
      <section className="container section cart-layout">
        <div className="cart-items">
          {message && (
            <p
              className={
                message.includes("successfully") ? "success-message" : "notice"
              }
            >
              {message}
            </p>
          )}
          {!items.length ? (
            <div className="empty-state">
              <ShoppingBag size={38} />
              <h2>Your cart is waiting</h2>
              <p>Find something delicious on our menu.</p>
              <Link to="/menu" className="button button-primary">
                Explore menu
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <article className="cart-item" key={item.id}>
                <div className="cart-item-art">☕</div>
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p>${Number(item.price).toFixed(2)} each</p>
                  <strong>
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </strong>
                </div>
                <div className="quantity-control">
                  <button
                    aria-label="Decrease quantity"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus size={15} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    aria-label="Increase quantity"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus size={15} />
                  </button>
                </div>
                <button
                  className="remove-button"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 size={17} />
                </button>
              </article>
            ))
          )}
          {items.length > 0 && (
            <Link to="/menu" className="text-link">
              ← Continue shopping
            </Link>
          )}
        </div>
        {items.length > 0 && (
          <aside className="order-summary">
            <h2>Order summary</h2>
            <div>
              <span>Subtotal</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <div>
              <span>Tax</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <button
              className="button button-primary button-full"
              disabled={loading}
              onClick={checkout}
            >
              {loading ? "Placing order…" : "Checkout"}
            </button>
            <p className="muted small">
              You may need to adjust the checkout payload to match your Django
              serializer.
            </p>
          </aside>
        )}
      </section>
    </main>
  );
}
