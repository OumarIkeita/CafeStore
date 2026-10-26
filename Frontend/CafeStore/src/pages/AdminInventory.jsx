import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Package,
  Search,
  RefreshCw,
  AlertTriangle,
  CircleCheck,
  PackageX,
  Boxes,
} from "lucide-react";
import api from "../api/client";
import "./AdminInventory.css";

const LOW_STOCK_LIMIT = 10;

function getStock(item) {
  return Number(
    item.quantity ??
      item.stock_quantity ??
      item.units_available ??
      item.quantity_in_stock ??
      item.stock ??
      0,
  );
}

function getProductName(item) {
  return (
    item.product_name ||
    item.product?.name ||
    item.name ||
    item.item_name ||
    "Unnamed product"
  );
}

function getStockStatus(quantity) {
  if (quantity <= 0) return "Out of stock";
  if (quantity <= LOW_STOCK_LIMIT) return "Low stock";
  return "In stock";
}

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const isAdmin =
    user?.role === "admin" ||
    user?.is_staff === true ||
    user?.is_superuser === true;

  async function fetchInventory(isRefresh = false) {
    setError("");

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await api.get("inventory/");
      const data = response.data;

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
          ? data.results
          : Array.isArray(data.inventory)
            ? data.inventory
            : [];

      setInventory(items);
    } catch (err) {
      console.error("Failed to load inventory:", err);
      setError(
        err.response?.data?.detail ||
          "Could not load inventory. Check your API endpoint and permissions.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchInventory();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const summary = useMemo(() => {
    const totalUnits = inventory.reduce(
      (total, item) => total + getStock(item),
      0,
    );

    const lowStock = inventory.filter((item) => {
      const quantity = getStock(item);
      return quantity > 0 && quantity <= LOW_STOCK_LIMIT;
    }).length;

    const outOfStock = inventory.filter((item) => getStock(item) <= 0).length;

    const inStock = inventory.filter(
      (item) => getStock(item) > LOW_STOCK_LIMIT,
    ).length;

    return {
      products: inventory.length,
      totalUnits,
      lowStock,
      outOfStock,
      inStock,
    };
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const name = getProductName(item).toLowerCase();
      const query = search.trim().toLowerCase();
      const quantity = getStock(item);

      const matchesSearch =
        name.includes(query) || String(item.id ?? "").includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "in-stock" && quantity > LOW_STOCK_LIMIT) ||
        (filter === "low-stock" &&
          quantity > 0 &&
          quantity <= LOW_STOCK_LIMIT) ||
        (filter === "out-of-stock" && quantity <= 0);

      return matchesSearch && matchesFilter;
    });
  }, [inventory, search, filter]);

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="inventory-page">
      <header className="inventory-header">
        <div>
          <span className="inventory-eyebrow">CAFESTORE ADMIN</span>
          <h1>Inventory</h1>
          <p>
            Monitor stock levels and identify products that need restocking.
          </p>
        </div>

        <button
          className="inventory-refresh"
          onClick={() => fetchInventory(true)}
          disabled={loading || refreshing}
        >
          <RefreshCw
            size={17}
            className={refreshing ? "inventory-spinning" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {error && (
        <div className="inventory-error" role="alert">
          <AlertTriangle size={19} />
          <span>{error}</span>
          <button onClick={() => fetchInventory(true)}>Try again</button>
        </div>
      )}

      <section className="inventory-stats">
        <article className="inventory-stat">
          <span className="inventory-stat-icon purple">
            <Boxes size={21} />
          </span>
          <div>
            <p>Total products</p>
            <h2>{loading ? "—" : summary.products}</h2>
          </div>
        </article>

        <article className="inventory-stat">
          <span className="inventory-stat-icon green">
            <CircleCheck size={21} />
          </span>
          <div>
            <p>In stock</p>
            <h2>{loading ? "—" : summary.inStock}</h2>
          </div>
        </article>

        <article className="inventory-stat">
          <span className="inventory-stat-icon orange">
            <AlertTriangle size={21} />
          </span>
          <div>
            <p>Low stock</p>
            <h2>{loading ? "—" : summary.lowStock}</h2>
          </div>
        </article>

        <article className="inventory-stat">
          <span className="inventory-stat-icon red">
            <PackageX size={21} />
          </span>
          <div>
            <p>Out of stock</p>
            <h2>{loading ? "—" : summary.outOfStock}</h2>
          </div>
        </article>
      </section>

      <section className="inventory-table-card">
        <div className="inventory-table-heading">
          <div>
            <h2>Stock overview</h2>
            <p>
              {loading
                ? "Loading inventory..."
                : `${filteredInventory.length} item(s) displayed`}
            </p>
          </div>
          <span className="inventory-total-units">
            {loading ? "—" : summary.totalUnits} total units
          </span>
        </div>

        <div className="inventory-toolbar">
          <label className="inventory-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search product or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <select
            aria-label="Filter inventory by stock status"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All stock</option>
            <option value="in-stock">In stock</option>
            <option value="low-stock">Low stock</option>
            <option value="out-of-stock">Out of stock</option>
          </select>
        </div>

        <div className="inventory-table-scroll">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Inventory ID</th>
                <th>Quantity</th>
                <th>Stock status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="inventory-empty">
                    Loading inventory...
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="4" className="inventory-empty">
                    <Package size={28} />
                    <strong>No inventory items found</strong>
                    <span>Try another search or stock filter.</span>
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item, index) => {
                  const quantity = getStock(item);
                  const status = getStockStatus(quantity);

                  return (
                    <tr key={item.id ?? `${getProductName(item)}-${index}`}>
                      <td>
                        <div className="inventory-product">
                          <span className="inventory-product-icon">
                            <Package size={19} />
                          </span>
                          <strong>{getProductName(item)}</strong>
                        </div>
                      </td>
                      <td>#{item.id ?? "—"}</td>
                      <td>
                        <strong>{quantity}</strong>
                        <span className="inventory-unit-label"> units</span>
                      </td>
                      <td>
                        <span
                          className={`inventory-status ${
                            quantity <= 0
                              ? "status-out"
                              : quantity <= LOW_STOCK_LIMIT
                                ? "status-low"
                                : "status-in"
                          }`}
                        >
                          <span className="inventory-status-dot" />
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <footer className="inventory-table-footer">
          <span>
            Low stock means {LOW_STOCK_LIMIT} units or fewer, excluding zero.
          </span>
        </footer>
      </section>
    </main>
  );
}
