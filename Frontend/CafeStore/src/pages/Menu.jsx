import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Coffee,
  RefreshCw,
} from "lucide-react";
import "./Menu.css";
import api from "../api/client";
import { useCart } from "../context/CartContext";

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [orderMessage, setOrderMessage] = useState("");

  const {
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    count,
    total,
  } = useCart();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedCategory = searchParams.get("category");

  // Load products and categories from Django REST Framework.
  async function fetchMenu() {
    try {
      setLoading(true);
      setError("");

      const [productsResponse, categoriesResponse] = await Promise.all([
        api.get("products/"),
        api.get("categories/"),
      ]);

      const productData = productsResponse.data;
      const categoryData = categoriesResponse.data;

      setProducts(
        Array.isArray(productData) ? productData : (productData.results ?? []),
      );

      setCategories(
        Array.isArray(categoryData)
          ? categoryData
          : (categoryData.results ?? []),
      );
    } catch (err) {
      console.error("Error loading menu:", err);
      setError("Could not load the menu. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMenu();
  }, []);

  // Find the selected category name.
  const selectedCategoryName = categories.find(
    (category) => String(category.id) === String(selectedCategory),
  )?.name;

  // Search and filter products.
  const filteredProducts = products.filter((product) => {
    const productCategoryId =
      typeof product.category === "object"
        ? product.category?.id
        : product.category;

    const matchesCategory =
      !selectedCategory ||
      String(productCategoryId) === String(selectedCategory);

    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      product.name?.toLowerCase().includes(searchText) ||
      product.description?.toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

  // Add a product to the shared CartContext.
  function handleAddToCart(product) {
    if (product.is_available === false) return;

    addToCart({
      ...product,
      price: Number(product.price),
    });

    setError("");
    setOrderMessage("");
  }

  // Change quantity in the shared cart.
  function handleQuantityChange(item, amount) {
    updateQuantity(item.id, item.quantity + amount);
    setOrderMessage("");
  }

  // Remove an item from the shared cart.
  function handleRemoveItem(id) {
    removeFromCart(id);
    setOrderMessage("");
  }

  // Submit the order to Django.
  async function placeOrder() {
    if (items.length === 0) {
      setError("Please add at least one product to your cart.");
      return;
    }

    if (!localStorage.getItem("accessToken")) {
      navigate("/login", {
        state: {
          message: "Please log in before placing your order.",
        },
      });
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");
      setOrderMessage("");

      await api.post("orders/", {
        items: items.map((item) => ({
          product: item.id,
          quantity: item.quantity,
        })),
      });

      // Clear the cart only after the server accepts the order.
      clearCart();

      navigate("/orders", {
        state: {
          message: "Your order was placed successfully!",
        },
      });
    } catch (err) {
      console.error("Error placing order:", err.response?.data || err);

      if (err.response?.status === 401) {
        setError("Your session may have expired. Please log in again.");
      } else if (err.response?.data?.items) {
        setError(JSON.stringify(err.response.data.items));
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Could not place your order. Please try again.");
      }
    } finally {
      setPlacingOrder(false);
    }
  }

  // Loading screen.
  if (loading) {
    return (
      <main className="page-shell">
        <section className="menu-state">
          <Coffee size={36} />
          <h2>Preparing your menu...</h2>
          <p>Please wait while we load our products.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      {/* Hero */}
      <section className="page-hero">
        <p className="eyebrow">FRESHLY MADE FOR YOU</p>

        <h1>{selectedCategoryName || "Our Cafe Menu"}</h1>

        <p>Discover your favorite coffee, drinks, and delicious treats.</p>
      </section>

      <section className="container section">
        {/* Search and refresh */}
        <div className="menu-toolbar">
          <div className="search-box">
            <Search size={20} />

            <input
              type="search"
              placeholder="Search coffee, drinks, pastries..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search menu products"
            />
          </div>

          <button
            type="button"
            className="refresh-menu-button"
            onClick={fetchMenu}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* Category filters */}
        <div className="menu-categories">
          <button
            type="button"
            className={!selectedCategory ? "active" : ""}
            onClick={() => setSearchParams({})}
          >
            All Products
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={
                String(category.id) === String(selectedCategory) ? "active" : ""
              }
              onClick={() => setSearchParams({ category: String(category.id) })}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Error messages */}
        {error && (
          <div className="menu-error" role="alert">
            <p>{error}</p>

            {products.length === 0 && (
              <button type="button" onClick={fetchMenu}>
                Try Again
              </button>
            )}
          </div>
        )}

        {orderMessage && (
          <p className="menu-success" role="status">
            {orderMessage}
          </p>
        )}

        {/* Product count */}
        <div className="menu-section-heading">
          <div>
            <h2>{selectedCategoryName || "Explore Our Products"}</h2>
            <p>
              {filteredProducts.length} product
              {filteredProducts.length === 1 ? "" : "s"} found
            </p>
          </div>
        </div>

        {/* Products grid */}
        {filteredProducts.length === 0 ? (
          <div className="menu-empty">
            <Coffee size={38} />
            <h3>No products found</h3>
            <p>Try another search or select a different category.</p>

            <button
              type="button"
              className="add-order-button"
              onClick={() => {
                setSearch("");
                setSearchParams({});
              }}
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => {
              const categoryId =
                typeof product.category === "object"
                  ? product.category?.id
                  : product.category;

              const categoryName =
                product.category_name ||
                (typeof product.category === "object"
                  ? product.category?.name
                  : null) ||
                categories.find(
                  (category) => String(category.id) === String(categoryId),
                )?.name ||
                "Uncategorized";

              const available = product.is_available !== false;

              const cartItem = items.find((item) => item.id === product.id);

              return (
                <article className="product-card" key={product.id}>
                  <div className="product-icon">
                    <Coffee size={30} />
                  </div>

                  <div className="product-card-content">
                    <span className="product-category-label">
                      {categoryName}
                    </span>

                    <h3>{product.name}</h3>

                    {product.description && (
                      <p className="product-description">
                        {product.description}
                      </p>
                    )}

                    <p className="product-price">
                      {Number(product.price).toFixed(2)}
                    </p>

                    <p
                      className={
                        available ? "product-available" : "product-unavailable"
                      }
                    >
                      <span className="availability-dot" />
                      {available ? "Available" : "Currently unavailable"}
                    </p>

                    {available ? (
                      <button
                        type="button"
                        className="add-order-button"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart size={18} />

                        {cartItem
                          ? `Add Another (${cartItem.quantity})`
                          : "Add to Cart"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="add-order-button"
                        disabled
                      >
                        Unavailable
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {selectedCategory && (
          <p className="back-to-categories">
            <Link to="/categories">← Back to categories</Link>
          </p>
        )}

        {/* Shared cart and order summary */}
        <section className="customer-cart" id="customer-cart">
          <div className="cart-heading">
            <div className="cart-heading-icon">
              <ShoppingCart size={23} />
            </div>

            <div className="cart-heading-text">
              <h2>Your Cart</h2>
              <p>Review your items before checking out.</p>
            </div>

            <span className="cart-count">{count}</span>
          </div>

          {items.length === 0 ? (
            <div className="cart-empty">
              <ShoppingCart size={34} />
              <h3>Your cart is empty</h3>
              <p>Add something delicious from our menu!</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {items.map((item) => (
                  <article className="cart-item" key={item.id}>
                    <div className="cart-item-icon">
                      <Coffee size={22} />
                    </div>

                    <div className="cart-item-info">
                      <h3>{item.name}</h3>
                      <p>{Number(item.price).toFixed(2)} each</p>
                      <strong>
                        {(Number(item.price) * item.quantity).toFixed(2)}
                      </strong>
                    </div>

                    <div className="cart-item-actions">
                      <button
                        type="button"
                        aria-label={`Decrease ${item.name} quantity`}
                        onClick={() => handleQuantityChange(item, -1)}
                      >
                        <Minus size={15} />
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        aria-label={`Increase ${item.name} quantity`}
                        onClick={() => handleQuantityChange(item, 1)}
                      >
                        <Plus size={15} />
                      </button>

                      <button
                        type="button"
                        className="remove-cart-item"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="cart-summary">
                <div className="cart-summary-row">
                  <span>Total items</span>
                  <span>{count}</span>
                </div>

                <div className="cart-total">
                  <span>Estimated total</span>
                  <strong>{total.toFixed(2)}</strong>
                </div>

                <p className="cart-note">
                  The final order total is calculated by the server.
                </p>

                <button
                  type="button"
                  className="place-order-button"
                  onClick={placeOrder}
                  disabled={placingOrder || items.length === 0}
                >
                  {placingOrder ? "Placing Your Order..." : "Place Order"}
                </button>

                <button
                  type="button"
                  className="clear-cart-button"
                  onClick={clearCart}
                  disabled={placingOrder}
                >
                  <Trash2 size={16} />
                  Clear Cart
                </button>
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
