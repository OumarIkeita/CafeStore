import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Coffee, Tags, Armchair, PlusCircle } from "lucide-react";
import api from "../api/client";
import "./AdminManagement.css";

export default function AdminManagement() {
  const [activeTab, setActiveTab] = useState("product");
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [product, setProduct] = useState({
    name: "",
    category: "",
    price: "",
    is_available: true,
  });

  const [category, setCategory] = useState({
    name: "",
  });

  const [cafeTable, setCafeTable] = useState({
    table_number: "",
    capacity: 4,
    is_available: true,
  });

  // Check the role saved after login.
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAdmin) {
      setLoadingCategories(false);
      return;
    }

    async function loadCategories() {
      try {
        const response = await api.get("categories/");
        const data = response.data;
        const list = Array.isArray(data) ? data : (data.results ?? []);

        setCategories(list);
        if (list.length > 0) {
          setProduct((current) => ({
            ...current,
            category: current.category || String(list[0].id),
          }));
        }
      } catch (err) {
        console.error("Could not load categories:", err);
        setError("Could not load categories. Check your API permissions.");
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, [isAdmin]);

  function changeTab(tab) {
    setActiveTab(tab);
    setError("");
    setMessage("");
  }

  async function handleProductSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await api.post("products/", {
        name: product.name.trim(),
        category: Number(product.category),
        price: Number(product.price),
        is_available: product.is_available,
      });

      setProduct({
        name: "",
        category: product.category,
        price: "",
        is_available: true,
      });

      setMessage("Product added successfully.");
    } catch (err) {
      console.error("Product creation failed:", err.response?.data || err);
      setError(JSON.stringify(err.response?.data || "Could not add product."));
    } finally {
      setSaving(false);
    }
  }

  async function handleCategorySubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("categories/", {
        name: category.name.trim(),
      });

      setCategories((current) => [...current, response.data]);
      setProduct((current) => ({
        ...current,
        category: String(response.data.id),
      }));

      setCategory({ name: "" });
      setMessage("Category added successfully.");
    } catch (err) {
      console.error("Category creation failed:", err.response?.data || err);
      setError(JSON.stringify(err.response?.data || "Could not add category."));
    } finally {
      setSaving(false);
    }
  }

  async function handleTableSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await api.post("cafe-tables/", {
        table_number: String(cafeTable.table_number).trim(),
        capacity: Number(cafeTable.capacity),
        is_available: cafeTable.is_available,
      });

      setCafeTable({
        table_number: "",
        capacity: 4,
        is_available: true,
      });

      setMessage("Cafe table added successfully.");
    } catch (err) {
      console.error("Table creation failed:", err.response?.data || err);
      setError(
        JSON.stringify(err.response?.data || "Could not add cafe table."),
      );
    } finally {
      setSaving(false);
    }
  }

  if (!isAdmin) {
    return (
      <main className="admin-management-page">
        <section className="admin-access-denied">
          <h1>Administrator access required</h1>
          <p>
            Only administrators can add products, categories, or cafe tables.
          </p>
          <Link to="/login">Go to login</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-management-page">
      <header className="management-header">
        <p className="management-eyebrow">CAFESTORE MANAGEMENT</p>
        <h1>Manage Your Cafe</h1>
        <p>Add menu products, organize categories, and manage seating.</p>
      </header>

      <nav className="management-tabs" aria-label="Management forms">
        <button
          type="button"
          className={activeTab === "product" ? "active" : ""}
          onClick={() => changeTab("product")}
        >
          <Coffee size={18} /> Add Product
        </button>

        <button
          type="button"
          className={activeTab === "category" ? "active" : ""}
          onClick={() => changeTab("category")}
        >
          <Tags size={18} /> Add Category
        </button>

        <button
          type="button"
          className={activeTab === "table" ? "active" : ""}
          onClick={() => changeTab("table")}
        >
          <Armchair size={18} /> Add Cafe Table
        </button>
      </nav>

      {error && (
        <div className="management-alert error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="management-alert success" role="status">
          {message}
        </div>
      )}

      <section className="management-form-card">
        {activeTab === "product" && (
          <form onSubmit={handleProductSubmit}>
            <div className="form-heading">
              <Coffee size={24} />
              <div>
                <h2>Add New Product</h2>
                <p>Add a drink or food item to the cafe menu.</p>
              </div>
            </div>

            <label htmlFor="product-name">Product name</label>
            <input
              id="product-name"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
              placeholder="e.g. Cappuccino"
              required
            />

            <label htmlFor="product-category">Category</label>
            <select
              id="product-category"
              value={product.category}
              onChange={(e) =>
                setProduct({ ...product, category: e.target.value })
              }
              required
              disabled={loadingCategories || categories.length === 0}
            >
              <option value="">
                {loadingCategories
                  ? "Loading categories..."
                  : "Select category"}
              </option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            {!loadingCategories && categories.length === 0 && (
              <p className="form-hint">
                Add a category first using the Add Category tab.
              </p>
            )}

            <label htmlFor="product-price">Price</label>
            <input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              value={product.price}
              onChange={(e) =>
                setProduct({ ...product, price: e.target.value })
              }
              placeholder="0.00"
              required
            />

            <label className="management-checkbox">
              <input
                type="checkbox"
                checked={product.is_available}
                onChange={(e) =>
                  setProduct({ ...product, is_available: e.target.checked })
                }
              />
              Product is available for ordering
            </label>

            <button
              className="management-submit"
              type="submit"
              disabled={saving || loadingCategories || categories.length === 0}
            >
              <PlusCircle size={18} />
              {saving ? "Saving..." : "Add Product"}
            </button>
          </form>
        )}

        {activeTab === "category" && (
          <form onSubmit={handleCategorySubmit}>
            <div className="form-heading">
              <Tags size={24} />
              <div>
                <h2>Add New Category</h2>
                <p>Group similar products together.</p>
              </div>
            </div>

            <label htmlFor="category-name">Category name</label>
            <input
              id="category-name"
              value={category.name}
              onChange={(e) => setCategory({ name: e.target.value })}
              placeholder="e.g. Hot Drinks"
              required
            />

            <button
              className="management-submit"
              type="submit"
              disabled={saving}
            >
              <PlusCircle size={18} />
              {saving ? "Saving..." : "Add Category"}
            </button>
          </form>
        )}

        {activeTab === "table" && (
          <form onSubmit={handleTableSubmit}>
            <div className="form-heading">
              <Armchair size={24} />
              <div>
                <h2>Add Cafe Table</h2>
                <p>Register a table and its seating capacity.</p>
              </div>
            </div>

            <label htmlFor="table-number">Table number or label</label>
            <input
              id="table-number"
              value={cafeTable.table_number}
              onChange={(e) =>
                setCafeTable({
                  ...cafeTable,
                  table_number: e.target.value,
                })
              }
              placeholder="e.g. T01"
              required
            />

            <label htmlFor="table-capacity">Seating capacity</label>
            <input
              id="table-capacity"
              type="number"
              min="1"
              value={cafeTable.capacity}
              onChange={(e) =>
                setCafeTable({
                  ...cafeTable,
                  capacity: e.target.value,
                })
              }
              required
            />

            <label className="management-checkbox">
              <input
                type="checkbox"
                checked={cafeTable.is_available}
                onChange={(e) =>
                  setCafeTable({
                    ...cafeTable,
                    is_available: e.target.checked,
                  })
                }
              />
              Table is available
            </label>

            <button
              className="management-submit"
              type="submit"
              disabled={saving}
            >
              <PlusCircle size={18} />
              {saving ? "Saving..." : "Add Cafe Table"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
