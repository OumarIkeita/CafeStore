import React from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext";

const art = {
  1: "☕",
  2: "🥐",
  3: "🧋",
  4: "🍵",
  5: "🥐",
  6: "🍫",
  7: "🧊",
  8: "🍵",
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const unavailable = product.is_available === false;
  return (
    <article className="product-card">
      <div className={`product-art product-art-${Number(product.id) % 4}`}>
        {product.image && !product.image.includes("not-used") ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <span aria-hidden="true">{art[product.id] || "☕"}</span>
        )}
        {!unavailable && <span className="product-tag">Cafe favourite</span>}
      </div>
      <div className="product-info">
        <p className="eyebrow">{product.category_name || "Freshly made"}</p>
        <h3>{product.name}</h3>
        <p className="product-description">
          {product.description || "Made fresh and served with care."}
        </p>
        <div className="product-bottom">
          <strong className="price">${Number(product.price).toFixed(2)}</strong>
          <button
            className="add-button"
            disabled={unavailable}
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag size={17} /> {unavailable ? "Unavailable" : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
}
