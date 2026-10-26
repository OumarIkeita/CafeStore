import { useEffect, useState } from "react";
import api from "../../api/client";
import "./SpecialOffers.css";

export default function SpecialOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("special-offers/")
      .then((response) => {
        setOffers(response.data.results ?? response.data);
      })
      .catch(() => {
        setError("Unable to load special offers.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading special offers...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section className="special-offers">
      <div className="offers-heading">
        <span className="offers-eyebrow">A LITTLE SOMETHING SPECIAL</span>
        <h2>Special Offers</h2>
        <p>Enjoy your café favorites for a little less.</p>
      </div>

      {offers.length === 0 ? (
        <p className="no-offers">No special offers available right now.</p>
      ) : (
        <div className="offers-grid">
          {offers.map((offer) => (
            <article className="offer-card" key={offer.id}>
              <span className="offer-discount">
                {offer.discount_percentage}% OFF
              </span>

              <div className="offer-content">
                <h3>{offer.title}</h3>
                <p>{offer.description}</p>
                <p className="offer-product">{offer.product_name}</p>

                <div className="offer-prices">
                  <strong>₺{Number(offer.discounted_price).toFixed(2)}</strong>
                  <del>₺{Number(offer.original_price).toFixed(2)}</del>
                </div>

                <small>
                  Valid until {new Date(offer.end_date).toLocaleDateString()}
                </small>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
