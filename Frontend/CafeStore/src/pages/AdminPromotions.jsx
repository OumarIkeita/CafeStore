import React, { useEffect, useState } from "react";
import { Tag, Coffee, PlusCircle, RefreshCw } from "lucide-react";
import api from "../api/client";
import "./AdminPromotions.css";

function getList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export default function AdminPromotions() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [offer, setOffer] = useState({
    title: "",
    description: "",
    product: "",
    discount_percentage: 10,
    start_date: "",
    end_date: "",
    is_active: true,
  });

  const [daily, setDaily] = useState({
    date: new Date().toLocaleDateString("en-CA"),
    title: "Daily Menu",
    description: "",
    products: [],
    is_published: false,
  });

  async function loadProducts() {
    try {
      const response = await api.get("products/");
      setProducts(getList(response.data));
    } catch (error) {
      console.error("Could not load products:", error);
      setMessage("Could not load products. Check your API connection.");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function submitOffer(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await api.post("admin/special-offers/", {
        ...offer,
        product: Number(offer.product),
        discount_percentage: Number(offer.discount_percentage),
      });

      setMessage("Special offer created successfully!");
      setOffer({
        title: "",
        description: "",
        product: "",
        discount_percentage: 10,
        start_date: "",
        end_date: "",
        is_active: true,
      });
    } catch (error) {
      console.error(error.response?.data || error);
      setMessage(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Could not create the offer.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function submitDailyMenu(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await api.post("admin/daily-menu/", {
        ...daily,
        products: daily.products.map(Number),
      });

      setMessage("Daily menu created successfully!");
      setDaily((previous) => ({
        ...previous,
        title: "Daily Menu",
        description: "",
        products: [],
        is_published: false,
      }));
    } catch (error) {
      console.error(error.response?.data || error);
      setMessage(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Could not create the daily menu.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-promotions">
      <header className="promotions-header">
        <div>
          <span className="promotions-eyebrow">CAFE MANAGEMENT</span>
          <h1>Offers & Daily Menu</h1>
          <p>Create offers and publish your cafe's daily menu.</p>
        </div>

        <button
          className="refresh-products"
          type="button"
          onClick={loadProducts}
        >
          <RefreshCw size={16} /> Refresh products
        </button>
      </header>

      {message && (
        <div className="promotion-message" role="status">
          {message}
        </div>
      )}

      <div className="promotion-forms">
        <form className="promotion-card" onSubmit={submitOffer}>
          <div className="promotion-card-heading">
            <Tag size={22} />
            <div>
              <h2>Create Special Offer</h2>
              <p>Give a product a limited-time discount.</p>
            </div>
          </div>

          <label>Offer title</label>
          <input
            required
            value={offer.title}
            onChange={(e) => setOffer({ ...offer, title: e.target.value })}
            placeholder="e.g. Cappuccino Happy Hour"
          />

          <label>Description</label>
          <textarea
            value={offer.description}
            onChange={(e) =>
              setOffer({ ...offer, description: e.target.value })
            }
            placeholder="Describe this offer..."
          />

          <label>Product</label>
          <select
            required
            value={offer.product}
            onChange={(e) => setOffer({ ...offer, product: e.target.value })}
          >
            <option value="">Choose a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} — ₺{product.price}
              </option>
            ))}
          </select>

          <label>Discount percentage</label>
          <input
            type="number"
            required
            min="1"
            max="100"
            value={offer.discount_percentage}
            onChange={(e) =>
              setOffer({
                ...offer,
                discount_percentage: e.target.value,
              })
            }
          />

          <div className="promotion-date-grid">
            <div>
              <label>Starts</label>
              <input
                type="datetime-local"
                required
                value={offer.start_date}
                onChange={(e) =>
                  setOffer({ ...offer, start_date: e.target.value })
                }
              />
            </div>

            <div>
              <label>Ends</label>
              <input
                type="datetime-local"
                required
                value={offer.end_date}
                onChange={(e) =>
                  setOffer({ ...offer, end_date: e.target.value })
                }
              />
            </div>
          </div>

          <label className="promotion-checkbox">
            <input
              type="checkbox"
              checked={offer.is_active}
              onChange={(e) =>
                setOffer({ ...offer, is_active: e.target.checked })
              }
            />
            Activate this offer
          </label>

          <button className="promotion-submit" disabled={loading}>
            <PlusCircle size={17} />
            {loading ? "Saving..." : "Create Special Offer"}
          </button>
        </form>

        <form className="promotion-card" onSubmit={submitDailyMenu}>
          <div className="promotion-card-heading">
            <Coffee size={22} />
            <div>
              <h2>Create Daily Menu</h2>
              <p>Choose products customers can see today.</p>
            </div>
          </div>

          <label>Menu title</label>
          <input
            required
            value={daily.title}
            onChange={(e) => setDaily({ ...daily, title: e.target.value })}
          />

          <label>Menu date</label>
          <input
            type="date"
            required
            value={daily.date}
            onChange={(e) => setDaily({ ...daily, date: e.target.value })}
          />

          <label>Description</label>
          <textarea
            value={daily.description}
            onChange={(e) =>
              setDaily({ ...daily, description: e.target.value })
            }
            placeholder="Today's cafe selections..."
          />

          <label>Choose products</label>
          <select
            multiple
            required
            className="daily-product-select"
            value={daily.products.map(String)}
            onChange={(e) =>
              setDaily({
                ...daily,
                products: Array.from(
                  e.target.selectedOptions,
                  (option) => option.value,
                ),
              })
            }
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} — ₺{product.price}
              </option>
            ))}
          </select>
          <small>
            Hold Ctrl (Windows) or Command (Mac) to select multiple products.
          </small>

          <label className="promotion-checkbox">
            <input
              type="checkbox"
              checked={daily.is_published}
              onChange={(e) =>
                setDaily({
                  ...daily,
                  is_published: e.target.checked,
                })
              }
            />
            Publish for customers immediately
          </label>

          <button className="promotion-submit" disabled={loading}>
            <PlusCircle size={17} />
            {loading ? "Saving..." : "Save Daily Menu"}
          </button>
        </form>
      </div>
    </main>
  );
}
