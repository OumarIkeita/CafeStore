import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Coffee,
  Heart,
  Leaf,
  Clock3,
  Tag,
  Sparkles,
  RefreshCw,
  CalendarDays,
  UtensilsCrossed,
} from "lucide-react";

import ProductCard from "../components/productCard/ProductCard";
import api from "../api/client";
import "./Home.css";

const getList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const formatPrice = (price) => {
  const value = Number(price);
  return Number.isFinite(value) ? `₺${value.toFixed(2)}` : "Price unavailable";
};

const formatDate = (date) => {
  if (!date) return "";

  const parsedDate = new Date(`${date}`.slice(0, 10) + "T12:00:00");

  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function SectionMessage({ loading, error, empty, onRetry }) {
  if (loading) {
    return (
      <div className="home-message">
        <span className="home-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-message home-message-error">
        <p>{error}</p>
        {onRetry && (
          <button className="home-retry-button" onClick={onRetry}>
            <RefreshCw size={16} />
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="home-message">
      <p>{empty}</p>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [dailyMenus, setDailyMenus] = useState([]);

  const [productsLoading, setProductsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(true);
  const [dailyMenuLoading, setDailyMenuLoading] = useState(true);

  const [productsError, setProductsError] = useState("");
  const [categoriesError, setCategoriesError] = useState("");
  const [offersError, setOffersError] = useState("");
  const [dailyMenuError, setDailyMenuError] = useState("");

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError("");

    try {
      const response = await api.get("products/");
      setProducts(getList(response.data));
    } catch (error) {
      console.error("Failed to load products:", error);
      setProductsError("We couldn't load the products.");
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError("");

    try {
      const response = await api.get("categories/");
      setCategories(getList(response.data));
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategoriesError("We couldn't load the categories.");
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const fetchOffers = useCallback(async () => {
    setOffersLoading(true);
    setOffersError("");

    try {
      const response = await api.get("special-offers/");
      setOffers(getList(response.data));
    } catch (error) {
      console.error("Failed to load special offers:", error);
      setOffersError("We couldn't load special offers.");
    } finally {
      setOffersLoading(false);
    }
  }, []);

  const fetchDailyMenu = useCallback(async () => {
    setDailyMenuLoading(true);
    setDailyMenuError("");

    try {
      const response = await api.get("daily-menu/");
      const menus = getList(response.data);

      // The public API should already return published menus.
      // This also supports APIs that return is_published in each item.
      setDailyMenus(
        menus.filter(
          (menu) =>
            menu.is_published === undefined || menu.is_published === true,
        ),
      );
    } catch (error) {
      console.error("Failed to load daily menu:", error);
      setDailyMenuError("We couldn't load today's menu.");
    } finally {
      setDailyMenuLoading(false);
    }
  }, []);

  const refreshHome = useCallback(() => {
    fetchProducts();
    fetchCategories();
    fetchOffers();
    fetchDailyMenu();
  }, [fetchProducts, fetchCategories, fetchOffers, fetchDailyMenu]);

  useEffect(() => {
    refreshHome();
  }, [refreshHome]);

  const featuredProducts = products
    .filter((product) => product.is_available !== false)
    .slice(0, 4);

  const visibleCategories = categories.slice(0, 4);

  const visibleOffers = offers.filter(
    (offer) => offer.is_active === undefined || offer.is_active === true,
  );

  const visibleDailyMenus = dailyMenus.slice(0, 2);

  return (
    <main className="home-page">
      {/* HERO */}
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-eyebrow">
            <Coffee size={16} />
            YOUR DAILY COFFEE RITUAL
          </span>

          <h1>
            Good coffee.
            <br />
            <span>Good moments.</span>
          </h1>

          <p className="home-hero-description">
            Discover handcrafted coffee, delicious treats, and little moments of
            happiness at CafeStore.
          </p>

          <div className="home-hero-actions">
            <Link to="/menu" className="home-button home-button-primary">
              Explore our menu
              <ArrowRight size={18} />
            </Link>

            <Link to="/categories" className="home-button home-button-outline">
              Browse categories
            </Link>
          </div>

          <div className="home-hero-benefits">
            <span>
              <Heart size={17} />
              Made with care
            </span>
            <span>
              <Leaf size={17} />
              Fresh ingredients
            </span>
            <span>
              <Clock3 size={17} />
              Your moment, anytime
            </span>
          </div>
        </div>

        <div className="home-hero-art" aria-hidden="true">
          <div className="home-coffee-circle">
            <div className="home-coffee-cup">
              <Coffee size={104} strokeWidth={1.1} />
            </div>
            <span className="home-art-label">BREWED FOR YOU</span>
          </div>
          <div className="home-art-spark home-art-spark-one">✦</div>
          <div className="home-art-spark home-art-spark-two">✧</div>
          <div className="home-art-dot" />
        </div>
      </section>

      {/* QUICK BENEFITS */}
      <section className="home-benefits-strip">
        <div>
          <Coffee size={22} />
          <span>
            <strong>Quality coffee</strong>
            <small>Every cup matters</small>
          </span>
        </div>

        <div>
          <Leaf size={22} />
          <span>
            <strong>Fresh every day</strong>
            <small>Prepared with care</small>
          </span>
        </div>

        <div>
          <Heart size={22} />
          <span>
            <strong>Made for you</strong>
            <small>Your café favorites</small>
          </span>
        </div>
      </section>

      {/* SPECIAL OFFERS */}
      <section className="home-section home-offers-section">
        <div className="home-section-heading">
          <div>
            <span className="home-eyebrow">
              <Tag size={15} />A LITTLE SOMETHING SPECIAL
            </span>
            <h2>Special Offers</h2>
            <p>Enjoy your café favorites for a little less.</p>
          </div>

          <Link to="/menu" className="home-text-link">
            Explore menu <ArrowRight size={17} />
          </Link>
        </div>

        {offersLoading || offersError ? (
          <SectionMessage
            loading={offersLoading}
            error={offersError}
            empty=""
            onRetry={fetchOffers}
          />
        ) : visibleOffers.length === 0 ? (
          <div className="home-empty-card">
            <div className="home-empty-icon">
              <Tag size={25} />
            </div>
            <h3>Something special is brewing</h3>
            <p>
              There are no active offers right now. Check back soon for a
              delicious deal.
            </p>
          </div>
        ) : (
          <div className="home-offers-grid">
            {visibleOffers.slice(0, 3).map((offer) => (
              <article className="home-offer-card" key={offer.id}>
                <div className="home-offer-top">
                  <span className="home-offer-badge">
                    {offer.discount_percentage}% OFF
                  </span>
                  <Sparkles size={23} />
                </div>

                <div className="home-offer-body">
                  <span className="home-card-kicker">LIMITED-TIME TREAT</span>
                  <h3>{offer.title}</h3>
                  <p className="home-offer-description">
                    {offer.description || "Enjoy a special café favorite."}
                  </p>

                  {offer.product_name && (
                    <p className="home-offer-product">
                      <Coffee size={16} />
                      {offer.product_name}
                    </p>
                  )}

                  <div className="home-offer-prices">
                    <strong>{formatPrice(offer.discounted_price)}</strong>
                    {offer.original_price != null && (
                      <del>{formatPrice(offer.original_price)}</del>
                    )}
                  </div>

                  {offer.end_date && (
                    <small className="home-offer-validity">
                      Valid until {formatDate(offer.end_date)}
                    </small>
                  )}

                  <Link to="/menu" className="home-offer-link">
                    Get the offer <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* DAILY MENU */}
      <section className="home-section home-daily-section">
        <div className="home-section-heading">
          <div>
            <span className="home-eyebrow">
              <CalendarDays size={15} />
              FRESHLY SELECTED FOR YOU
            </span>
            <h2>Daily Menu</h2>
            <p>Discover today's café selections.</p>
          </div>

          <Link to="/menu" className="home-text-link">
            View full menu <ArrowRight size={17} />
          </Link>
        </div>

        {dailyMenuLoading || dailyMenuError ? (
          <SectionMessage
            loading={dailyMenuLoading}
            error={dailyMenuError}
            empty=""
            onRetry={fetchDailyMenu}
          />
        ) : visibleDailyMenus.length === 0 ? (
          <div className="home-empty-card">
            <div className="home-empty-icon">
              <UtensilsCrossed size={25} />
            </div>
            <h3>Today's menu is being prepared</h3>
            <p>
              Our team is preparing the daily selections. Please check back soon
              or explore our regular menu.
            </p>
            <Link to="/menu" className="home-button home-button-primary">
              Explore the menu <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <div className="home-daily-grid">
            {visibleDailyMenus.map((dailyMenu) => {
              const menuProducts = Array.isArray(dailyMenu.product_details)
                ? dailyMenu.product_details
                : Array.isArray(dailyMenu.products)
                  ? dailyMenu.products.filter(
                      (product) =>
                        typeof product === "object" && product !== null,
                    )
                  : [];

              return (
                <article className="home-daily-card" key={dailyMenu.id}>
                  <div className="home-daily-card-heading">
                    <span className="home-daily-icon">
                      <UtensilsCrossed size={22} />
                    </span>
                    <div>
                      <span className="home-card-kicker">CAFE SELECTION</span>
                      <h3>{dailyMenu.title || "Daily Menu"}</h3>
                    </div>
                  </div>

                  {dailyMenu.date && (
                    <p className="home-daily-date">
                      <CalendarDays size={15} />
                      {formatDate(dailyMenu.date)}
                    </p>
                  )}

                  {dailyMenu.description && (
                    <p className="home-daily-description">
                      {dailyMenu.description}
                    </p>
                  )}

                  {menuProducts.length > 0 ? (
                    <div className="home-daily-products">
                      {menuProducts.slice(0, 4).map((product) => (
                        <div className="home-daily-product" key={product.id}>
                          <span>{product.name}</span>
                          {product.price != null && (
                            <strong>{formatPrice(product.price)}</strong>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="home-daily-note">
                      Discover the selections available on our full menu.
                    </p>
                  )}

                  <Link to="/menu" className="home-daily-link">
                    Explore selections <ArrowRight size={16} />
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* CATEGORIES */}
      <section className="home-section home-categories-section">
        <div className="home-section-heading">
          <div>
            <span className="home-eyebrow">FIND YOUR FAVORITE</span>
            <h2>Explore Categories</h2>
            <p>Something delicious for every kind of day.</p>
          </div>

          <Link to="/categories" className="home-text-link">
            All categories <ArrowRight size={17} />
          </Link>
        </div>

        {categoriesLoading || categoriesError ? (
          <SectionMessage
            loading={categoriesLoading}
            error={categoriesError}
            empty=""
            onRetry={fetchCategories}
          />
        ) : visibleCategories.length === 0 ? (
          <div className="home-empty-card">
            <h3>No categories available yet</h3>
            <p>Our menu categories will appear here when they are available.</p>
          </div>
        ) : (
          <div className="home-categories-grid">
            {visibleCategories.map((category, index) => (
              <Link
                to={`/menu?category=${encodeURIComponent(category.id)}`}
                className="home-category-card"
                key={category.id}
              >
                <span className={`home-category-number category-tone-${index}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="home-category-icon">
                  <Coffee size={25} />
                </span>

                <h3>{category.name}</h3>
                <p>
                  {category.description ||
                    "Discover delicious favorites in this category."}
                </p>

                <span className="home-category-link">
                  Explore <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="home-section home-featured-section">
        <div className="home-section-heading">
          <div>
            <span className="home-eyebrow">
              <Sparkles size={15} />
              CUSTOMER FAVORITES
            </span>
            <h2>Featured Products</h2>
            <p>Discover something you will love.</p>
          </div>

          <Link to="/menu" className="home-text-link">
            View all products <ArrowRight size={17} />
          </Link>
        </div>

        {productsLoading || productsError ? (
          <SectionMessage
            loading={productsLoading}
            error={productsError}
            empty=""
            onRetry={fetchProducts}
          />
        ) : featuredProducts.length === 0 ? (
          <div className="home-empty-card">
            <div className="home-empty-icon">
              <Coffee size={25} />
            </div>
            <h3>Fresh favorites coming soon</h3>
            <p>Products will appear here once they are added to your menu.</p>
          </div>
        ) : (
          <div className="home-featured-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="home-cta-section">
        <div className="home-cta-icon">
          <Coffee size={30} />
        </div>
        <div className="home-cta-copy">
          <span className="home-eyebrow">YOUR NEXT FAVORITE IS WAITING</span>
          <h2>Make today a little more delicious.</h2>
          <p>Find your favorite coffee, snack, or something new to try.</p>
        </div>
        <Link to="/menu" className="home-button home-button-light">
          Order from our menu <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}
