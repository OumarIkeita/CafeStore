import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PackageCheck, Trash2 } from "lucide-react";
import api from "../api/client";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await api.get("orders/");
        const data = response.data;

        setOrders(Array.isArray(data) ? data : (data.results ?? []));
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(
          err.response?.data?.detail ||
            "Could not load your orders. Please log in and try again.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  async function handleDelete(orderId, status) {
    if (status !== "pending") {
      setError("Only pending orders can be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete order #${orderId}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setError("");
      setDeletingId(orderId);

      await api.delete(`orders/${orderId}/`);

      // Remove the deleted order from the screen
      setOrders((currentOrders) =>
        currentOrders.filter((order) => order.id !== orderId),
      );
    } catch (err) {
      console.error("Error deleting order:", err);
      setError(
        err.response?.data?.detail ||
          "Could not delete this order. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function formatPrice(amount) {
    const value = Number(amount);
    return Number.isFinite(value) ? value.toFixed(2) : "0.00";
  }

  if (loading) {
    return (
      <main className="page-shell container section">
        <p>Loading your orders...</p>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="page-hero compact-hero">
        <p className="eyebrow">YOUR CAFE HISTORY</p>
        <h1>My orders</h1>
        <p>Keep track of your CafeStore orders.</p>
      </section>

      <section className="container section">
        {error && (
          <p className="notice" role="alert">
            {error}
          </p>
        )}

        {orders.length === 0 ? (
          <div className="empty-state">
            <PackageCheck size={40} />
            <h2>No orders yet</h2>
            <p>Your next favourite is waiting on the menu.</p>
            <Link className="button button-primary" to="/menu">
              Browse menu
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <article className="order-row" key={order.id}>
                <div>
                  <p className="eyebrow">ORDER #{order.id}</p>
                  <strong>
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString()
                      : "Date unavailable"}
                  </strong>
                </div>

                <span className={`status status-${order.status}`}>
                  {order.status}
                </span>

                <strong>${formatPrice(order.total_amount)}</strong>

                {order.status === "pending" && (
                  <button
                    type="button"
                    className="button button-danger"
                    disabled={deletingId === order.id}
                    onClick={() => handleDelete(order.id, order.status)}
                  >
                    <Trash2 size={16} />
                    {deletingId === order.id ? "Deleting..." : "Delete"}
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
