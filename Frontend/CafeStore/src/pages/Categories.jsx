import React from "react";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Search } from "lucide-react";
import api from "../api/client";
import "./Categories.css";

const descriptions = [
  "From rich espresso to silky cappuccino, find your perfect warm cup.",
  "Iced coffee and cool refreshments for a bright, refreshing break.",
  "Gentle, aromatic teas for slow mornings and peaceful afternoons.",
  "Freshly baked pastries and sweet treats to pair with your drink.",
];

const getCategoryEmoji = (categoryName = "") => {
  const name = categoryName.toLowerCase().trim();

  const emojiMap = {
    coffee: "☕",
    espresso: "☕",
    cappuccino: "☕",
    latte: "🥛",
    tea: "🍵",
    matcha: "🍵",
    juice: "🧃",
    smoothie: "🥤",
    drinks: "🥤",
    beverage: "🥤",
    beverages: "🥤",
    iced: "🧊",
    cold: "🧊",
    water: "💧",
    bakery: "🥐",
    pastry: "🥐",
    pastries: "🥐",
    cake: "🍰",
    cakes: "🎂",
    dessert: "🍰",
    desserts: "🍨",
    chocolate: "🍫",
    sandwich: "🥪",
    sandwiches: "🥪",
    burger: "🍔",
    burgers: "🍔",
    pizza: "🍕",
    breakfast: "🍳",
    snacks: "🍿",
    snack: "🍿",
    fruit: "🍎",
    fruits: "🍓",
    salad: "🥗",
    salads: "🥗",
    ice: "🧊",
    milk: "🥛",
  };

  // Match a category name that contains a keyword.
  const match = Object.keys(emojiMap).find((keyword) => name.includes(keyword));

  return match ? emojiMap[match] : "🍽️";
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await api.get("categories/");
        const data = response.data;

        setCategories(Array.isArray(data) ? data : (data.results ?? []));
      } catch (err) {
        console.error("Error loading categories:", err);
        setError("Could not load categories from the server.");
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((category) => {
    const query = search.trim().toLowerCase();

    return (
      category.name?.toLowerCase().includes(query) ||
      category.description?.toLowerCase().includes(query)
    );
  });

  return (
    <main className="page-shell">
      <section className="page-hero">
        <p className="eyebrow">FIND YOUR KIND OF COMFORT</p>
        <h1>Browse categories</h1>
        <p>Something warming, something refreshing, something sweet.</p>
      </section>

      <section className="container section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="search"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search categories"
          />
        </div>

        {loading && <p>Loading categories...</p>}

        {error && <p role="alert">{error}</p>}

        {!loading && !error && filteredCategories.length === 0 && (
          <p>No categories match "{search}".</p>
        )}

        {!loading && !error && filteredCategories.length > 0 && (
          <div className="category-grid category-grid-large">
            {filteredCategories.map((category, index) => (
              <Link
                className={`category-card category-${index % 4}`}
                key={category.id}
                to={`/menu?category=${category.id}`}
              >
                <span className="category-emoji">
                  {getCategoryEmoji(category.name)}
                </span>

                <p className="eyebrow">
                  CATEGORY {String(index + 1).padStart(2, "0")}
                </p>

                <h2>{category.name}</h2>

                <p>
                  {category.description ||
                    descriptions[index % descriptions.length]}
                </p>

                <span className="category-arrow">
                  <ArrowUpRight size={20} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
