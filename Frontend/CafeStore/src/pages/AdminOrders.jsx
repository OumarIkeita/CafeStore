import React, { useCallback, useEffect, useState } from "react";
import {
  CheckCircle,
  CheckCheck,
  RefreshCw,
  Package,
  UserRound,
  Trash2,
  Printer,
  CalendarDays,
  ShoppingBag,
  CircleDollarSign,
  Armchair,
  AlertCircle,
  Coffee,
} from "lucide-react";
import api from "../api/client";
import "./AdminOrders.css";

const money = (value) => {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
};

const normalizeStatus = (status) => String(status ?? "").toLowerCase();

const isConfirmed = (status) =>
  ["confirmed", "completed"].includes(normalizeStatus(status));

const getTableNumber = (order) =>
  order.table_number ??
  order.cafe_table_number ??
  order.table?.table_number ??
  order.cafe_table?.table_number ??
  null;

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char];
  });

const getList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [bulkAction, setBulkAction] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchOrders = useCallback(async () => {
    const response = await api.get("orders/");
    setOrders(getList(response.data));
  }, []);

  const fetchVacantTables = useCallback(async () => {
    const response = await api.get("tables/vacant/");
    setTables(getList(response.data));
  }, []);

  const loadPage = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) setLoading(true);
        setError("");

        const results = await Promise.allSettled([
          fetchOrders(),
          fetchVacantTables(),
        ]);

        const orderResult = results[0];
        const tableResult = results[1];

        if (orderResult.status === "rejected") {
          throw orderResult.reason;
        }

        if (tableResult.status === "rejected") {
          console.error(
            "Could not load vacant tables:",
            tableResult.reason?.response?.data || tableResult.reason,
          );
          setError(
            "Orders loaded, but vacant tables could not be loaded. Check the tables/vacant/ endpoint.",
          );
        }
      } catch (err) {
        console.error("Could not load orders:", err.response?.data || err);
        setError(
          err.response?.data?.detail ||
            "Could not load orders. Check your login and admin permissions.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchOrders, fetchVacantTables],
  );

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  async function confirmOrder(orderId) {
    const tableId = selectedTables[orderId];

    if (!tableId) {
      setError("Please select a vacant table before confirming this order.");
      setMessage("");
      return;
    }

    try {
      setConfirmingId(orderId);
      setError("");
      setMessage("");

      const response = await api.post(`orders/${orderId}/confirm/`, {
        table: tableId,
      });

      const savedOrder = response.data;

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, ...savedOrder } : order,
        ),
      );

      setSelectedTables((current) => {
        const next = { ...current };
        delete next[orderId];
        return next;
      });

      setMessage(`Order #${orderId} confirmed and table assigned.`);
      await Promise.all([fetchOrders(), fetchVacantTables()]);
    } catch (err) {
      console.error("Could not confirm order:", err.response?.data || err);

      const data = err.response?.data;
      const detail =
        data?.table ||
        data?.error ||
        data?.detail ||
        "Failed to confirm the order. Check your backend endpoint.";

      setError(typeof detail === "string" ? detail : JSON.stringify(detail));

      await fetchVacantTables().catch(() => {});
    } finally {
      setConfirmingId(null);
    }
  }

  async function confirmAllPending() {
    setError("");
    setMessage(
      "Assign a vacant table to each pending order before confirming it.",
    );
  }

  async function deleteAllPending() {
    const pendingCount = orders.filter(
      (order) => normalizeStatus(order.status) === "pending",
    ).length;

    if (!pendingCount) {
      setMessage("There are no pending orders to delete.");
      return;
    }

    if (
      !window.confirm(
        `Permanently delete all ${pendingCount} pending orders? This cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      setBulkAction(true);
      setError("");
      setMessage("");

      const response = await api.delete("orders/delete-pending/");

      setOrders((current) =>
        current.filter((order) => normalizeStatus(order.status) !== "pending"),
      );

      setMessage(
        response.data?.message || "Pending orders deleted successfully.",
      );
      await fetchVacantTables();
    } catch (err) {
      console.error(
        "Could not delete pending orders:",
        err.response?.data || err,
      );

      setError(
        err.response?.data?.detail || "Failed to delete pending orders.",
      );
    } finally {
      setBulkAction(false);
    }
  }

  async function deleteOrder(orderId) {
    if (
      !window.confirm(
        `Permanently delete Order #${orderId}? This cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      setDeletingId(orderId);
      setError("");
      setMessage("");

      await api.delete(`orders/${orderId}/delete/`);

      setOrders((current) => current.filter((order) => order.id !== orderId));

      setMessage(`Order #${orderId} deleted successfully.`);
      await fetchVacantTables();
    } catch (err) {
      console.error("Could not delete order:", err.response?.data || err);

      setError(err.response?.data?.detail || "Failed to delete the order.");
    } finally {
      setDeletingId(null);
    }
  }

  function printOrderReceipt(order) {
    if (!isConfirmed(order.status)) {
      setError("Confirm this order before printing its receipt.");
      return;
    }

    const receiptWindow = window.open("", "_blank", "width=600,height=750");

    if (!receiptWindow) {
      setError("Allow pop-ups in your browser to print receipts.");
      return;
    }

    const tableNumber = getTableNumber(order) ?? "Not assigned";
    const customerName =
      order.customer_name || order.customer_username || "Guest Customer";
    const items = Array.isArray(order.items) ? order.items : [];

    const itemRows = items
      .map((item) => {
        const quantity = Number(item.quantity || 0);
        const unitPrice = Number(item.unit_price || 0);
        const itemName = item.product_name || `Product #${item.product ?? ""}`;

        return `
          <tr>
            <td>
              ${escapeHtml(itemName)}
              <small>Quantity: ${escapeHtml(quantity)}</small>
            </td>
            <td>${money(unitPrice)}</td>
            <td>${money(unitPrice * quantity)}</td>
          </tr>
        `;
      })
      .join("");

    const orderDate = order.created_at
      ? new Date(order.created_at).toLocaleString()
      : "Not available";

    const receiptHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Okeit_Stack Receipt - Order #${escapeHtml(order.id)}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            max-width: 420px;
            margin: 24px auto;
            padding: 22px;
            color: #2b1b16;
            background: #fff;
            font-family: Arial, sans-serif;
            font-size: 13px;
          }
          header { text-align: center; margin-bottom: 22px; }
          header h1 {
            margin: 0 0 7px;
            font-family: Georgia, serif;
            font-size: 27px;
          }
          header p { margin: 5px 0; color: #76645a; }
          .receipt-label {
            margin-top: 15px;
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 2px;
          }
          .divider {
            border: 0;
            border-top: 1px dashed #b7a89c;
            margin: 16px 0;
          }
          .details p {
            display: flex;
            justify-content: space-between;
            gap: 14px;
            margin: 10px 0;
          }
          .details strong { flex-shrink: 0; }
          .details span {
            text-align: right;
            overflow-wrap: anywhere;
          }
          table { width: 100%; border-collapse: collapse; }
          th, td {
            padding: 10px 4px;
            text-align: left;
            vertical-align: top;
            border-bottom: 1px solid #eee4da;
          }
          th {
            color: #76645a;
            font-size: 10px;
            text-transform: uppercase;
          }
          th:nth-child(n+2), td:nth-child(n+2) {
            text-align: right;
            white-space: nowrap;
          }
          td small {
            display: block;
            margin-top: 5px;
            color: #76645a;
          }
          .total {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            font-size: 18px;
            font-weight: bold;
          }
          footer {
            margin-top: 28px;
            text-align: center;
            line-height: 1.7;
          }
          @page { margin: 10mm; }
          @media print {
            body { margin: 0 auto; padding: 5px; }
          }
        </style>
      </head>
      <body>
        <header>
          <h1>Okeit_Stack</h1>
          <p>COFFEE · COMFORT · COMMUNITY</p>
          <p class="receipt-label">CUSTOMER RECEIPT</p>
        </header>

        <hr class="divider">

        <section class="details">
          <p><strong>Order number</strong><span>#${escapeHtml(order.id)}</span></p>
          <p><strong>Customer</strong><span>${escapeHtml(customerName)}</span></p>
          <p><strong>Table number</strong><span>${escapeHtml(tableNumber)}</span></p>
          <p><strong>Date</strong><span>${escapeHtml(orderDate)}</span></p>
          <p><strong>Status</strong><span>${escapeHtml(order.status)}</span></p>
        </section>

        <hr class="divider">

        <table>
          <thead>
            <tr><th>Item</th><th>Unit price</th><th>Amount</th></tr>
          </thead>
          <tbody>
            ${itemRows || '<tr><td colspan="3">No order items found</td></tr>'}
          </tbody>
        </table>

        <hr class="divider">

        <div class="total">
          <span>Total</span>
          <span>${money(order.total_amount)}</span>
        </div>

        <footer>
          Thank you for choosing Okeit_Stack!<br>
          We hope to serve you again.
        </footer>
      </body>
      </html>
    `;

    receiptWindow.addEventListener(
      "load",
      () => {
        receiptWindow.focus();
        receiptWindow.print();
      },
      { once: true },
    );

    receiptWindow.document.open();
    receiptWindow.document.write(receiptHtml);
    receiptWindow.document.close();
  }

  const pendingCount = orders.filter(
    (order) => normalizeStatus(order.status) === "pending",
  ).length;

  const confirmedCount = orders.filter((order) =>
    isConfirmed(order.status),
  ).length;

  const totalValue = orders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0,
  );

  if (loading) {
    return (
      <main className="admin-orders-page">
        <div className="orders-loading">
          <span className="loading-spinner" />
          <p>Loading customer orders...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-orders-page">
      <header className="admin-orders-header">
        <div className="admin-orders-title">
          <p className="eyebrow">OKEIT_STACK MANAGEMENT</p>
          <h1>Customer Orders</h1>
          <p>
            Review orders, assign tables, confirm purchases, and print receipts.
          </p>
        </div>

        <div className="admin-orders-actions">
          <button
            type="button"
            className="confirm-all-button"
            disabled={pendingCount === 0 || bulkAction}
            onClick={confirmAllPending}
          >
            <CheckCheck size={17} />
            Confirming requires tables
          </button>

          <button
            type="button"
            className="delete-pending-button"
            disabled={pendingCount === 0 || bulkAction}
            onClick={deleteAllPending}
          >
            <Trash2 size={17} />
            Delete Pending
          </button>

          <button
            type="button"
            className="refresh-orders-button"
            disabled={refreshing || bulkAction}
            onClick={() => {
              setRefreshing(true);
              setMessage("");
              loadPage(false);
            }}
          >
            <RefreshCw
              size={17}
              className={refreshing ? "refresh-spinning" : ""}
            />
            Refresh
          </button>
        </div>
      </header>

      {error && (
        <div role="alert" className="order-notice order-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {message && (
        <div role="status" className="order-notice order-success">
          <CheckCircle size={18} />
          <span>{message}</span>
          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      <section className="orders-summary">
        <div className="orders-summary-card">
          <div className="summary-icon summary-icon-brown">
            <Package size={21} />
          </div>
          <div>
            <span>Total orders</span>
            <strong>{orders.length}</strong>
          </div>
        </div>

        <div className="orders-summary-card">
          <div className="summary-icon summary-icon-green">
            <CheckCircle size={21} />
          </div>
          <div>
            <span>Confirmed / completed</span>
            <strong>{confirmedCount}</strong>
          </div>
        </div>

        <div className="orders-summary-card">
          <div className="summary-icon summary-icon-amber">
            <CalendarDays size={21} />
          </div>
          <div>
            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>

        <div className="orders-summary-card">
          <div className="summary-icon summary-icon-gold">
            <CircleDollarSign size={21} />
          </div>
          <div>
            <span>Total order value</span>
            <strong>{money(totalValue)}</strong>
          </div>
        </div>
      </section>

      <div className="orders-section-heading">
        <div>
          <h2>Order queue</h2>
          <p>Assign a vacant table before confirming each pending order.</p>
        </div>
        <span className="orders-count">{orders.length} orders</span>
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <div className="empty-icon">
            <ShoppingBag size={34} />
          </div>
          <h2>No customer orders yet</h2>
          <p>New customer orders will appear here.</p>
        </div>
      ) : (
        <div className="admin-orders-list">
          {orders.map((order) => {
            const status = normalizeStatus(order.status);
            const tableNumber = getTableNumber(order);

            return (
              <article className="admin-order-card" key={order.id}>
                <div className="admin-order-top">
                  <div className="admin-order-heading">
                    <div className="order-number-line">
                      <span className="order-icon">
                        <Coffee size={19} />
                      </span>
                      <div>
                        <span className="order-kicker">CUSTOMER ORDER</span>
                        <h3>Order #{order.id}</h3>
                      </div>
                    </div>

                    <div className="admin-customer-info">
                      <span className="customer-icon">
                        <UserRound size={18} />
                      </span>
                      <div>
                        <strong>
                          {order.customer_name ||
                            order.customer_username ||
                            "Guest Customer"}
                        </strong>
                        {order.customer_username && (
                          <p>@{order.customer_username}</p>
                        )}
                      </div>
                    </div>

                    <p className="order-date">
                      <CalendarDays size={15} />
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString()
                        : "Date unavailable"}
                    </p>
                  </div>

                  <span
                    className={`order-status status-${status || "unknown"}`}
                  >
                    <span className="status-dot" />
                    {order.status || "Unknown"}
                  </span>
                </div>

                <div className="order-table-banner">
                  <Armchair size={18} />
                  <span>Assigned table</span>
                  <strong>
                    {tableNumber !== null && tableNumber !== undefined
                      ? `Table ${tableNumber}`
                      : "Not assigned"}
                  </strong>
                </div>

                {status === "pending" && (
                  <div className="order-table-assignment">
                    <label htmlFor={`table-${order.id}`}>
                      Assign a vacant table
                    </label>
                    <select
                      id={`table-${order.id}`}
                      value={selectedTables[order.id] || ""}
                      onChange={(event) =>
                        setSelectedTables((previous) => ({
                          ...previous,
                          [order.id]: event.target.value,
                        }))
                      }
                      disabled={confirmingId !== null || bulkAction}
                    >
                      <option value="">Choose a table...</option>
                      {tables.map((table) => (
                        <option key={table.id} value={table.id}>
                          Table {table.table_number} · Seats {table.capacity}
                        </option>
                      ))}
                    </select>

                    {tables.length === 0 && (
                      <p className="table-help">
                        No vacant tables found. Check the table status in your
                        database.
                      </p>
                    )}

                    <button
                      type="button"
                      className="confirm-order-button"
                      disabled={
                        !selectedTables[order.id] ||
                        confirmingId !== null ||
                        bulkAction ||
                        deletingId !== null
                      }
                      onClick={() => confirmOrder(order.id)}
                    >
                      <CheckCircle size={18} />
                      {confirmingId === order.id
                        ? "Assigning and confirming..."
                        : "Assign Table & Confirm"}
                    </button>
                  </div>
                )}

                <div className="admin-order-items">
                  <div className="order-items-heading">
                    <h4>Order items</h4>
                    <span>{order.items?.length ?? 0} items</span>
                  </div>

                  {order.items?.length ? (
                    order.items.map((item, index) => (
                      <div
                        className="admin-order-item"
                        key={item.id ?? `${order.id}-${item.product}-${index}`}
                      >
                        <div className="order-item-description">
                          <span className="item-bullet">
                            <Coffee size={15} />
                          </span>
                          <div>
                            <strong>
                              {item.product_name ||
                                `Product #${item.product ?? ""}`}
                            </strong>
                            <span>Quantity: {item.quantity}</span>
                          </div>
                        </div>

                        <div className="order-item-prices">
                          <span>{money(item.unit_price)} each</span>
                          <strong>
                            {money(
                              Number(item.unit_price || 0) *
                                Number(item.quantity || 0),
                            )}
                          </strong>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-order-items">
                      No order items were returned by the API.
                    </p>
                  )}
                </div>

                <div className="admin-order-bottom">
                  <div className="order-total">
                    <span>Total amount</span>
                    <strong>{money(order.total_amount)}</strong>
                  </div>

                  <div className="order-card-actions">
                    {isConfirmed(order.status) && (
                      <button
                        type="button"
                        className="print-receipt-button"
                        onClick={() => printOrderReceipt(order)}
                      >
                        <Printer size={17} />
                        Print Receipt
                      </button>
                    )}

                    {status === "completed" && (
                      <span className="order-status-note">Order completed</span>
                    )}

                    {status === "cancelled" && (
                      <span className="order-status-note">Order cancelled</span>
                    )}

                    <button
                      type="button"
                      className="delete-order-button"
                      disabled={
                        bulkAction ||
                        confirmingId !== null ||
                        deletingId !== null
                      }
                      onClick={() => deleteOrder(order.id)}
                    >
                      <Trash2 size={17} />
                      {deletingId === order.id ? "Deleting..." : "Delete Order"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
