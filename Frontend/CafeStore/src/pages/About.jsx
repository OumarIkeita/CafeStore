import React from "react";
import {
  Coffee,
  Heart,
  Leaf,
  Sparkles,
  ArrowUpRight,
  MapPin,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./About.css";

const values = [
  {
    icon: Coffee,
    number: "01",
    title: "Crafted with care",
    description:
      "From the first pour to the final detail, we believe quality comes from doing the simple things exceptionally well.",
  },
  {
    icon: Heart,
    number: "02",
    title: "People come first",
    description:
      "We want every guest to feel welcome, comfortable, and part of a community that values good company.",
  },
  {
    icon: Leaf,
    number: "03",
    title: "Thoughtful choices",
    description:
      "We celebrate fresh favourites, considered ingredients, and a menu made for different tastes and moments.",
  },
  {
    icon: Sparkles,
    number: "04",
    title: "Joy in the everyday",
    description:
      "A favourite drink, a friendly smile, or a quiet moment can turn an ordinary day into something special.",
  },
];

export default function About() {
  return (
    <main className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-pattern" />

        <div className="about-container about-hero-content">
          <Link to="/" className="about-brand" aria-label="Okeit Stack home">
            <span className="about-brand-icon">
              <Coffee size={27} strokeWidth={1.8} />
            </span>
            <span className="about-brand-text">
              <strong>Okeit_Stack</strong>
              <small>COFFEE · COMFORT · COMMUNITY</small>
            </span>
          </Link>

          <div className="about-hero-copy">
            <p className="about-eyebrow">
              <span />A CAFÉ WITH HEART
            </p>

            <h1>
              Good coffee.
              <br />
              <span>Meaningful moments.</span>
            </h1>

            <p className="about-hero-description">
              Life moves quickly. We create a place to slow down, enjoy
              something wonderful, and reconnect with the moments that matter.
            </p>

            <div className="about-hero-actions">
              <Link to="/menu" className="about-button about-button-primary">
                Explore our menu <ArrowUpRight size={18} />
              </Link>
              <a href="#our-story" className="about-text-link">
                Discover our story
              </a>
            </div>

            <div className="about-hero-note">
              <span className="about-note-icon">
                <Heart size={16} />
              </span>
              <p>Made for your everyday moments.</p>
            </div>
          </div>

          <div className="about-hero-art" aria-label="A warm cup of coffee">
            <div className="about-art-circle about-art-circle-one" />
            <div className="about-art-circle about-art-circle-two" />

            <div className="about-coffee-card">
              <div className="about-coffee-card-top">
                <span>YOUR DAILY RITUAL</span>
                <Sparkles size={17} />
              </div>

              <div className="about-coffee-illustration">
                <div className="about-coffee-steam steam-one" />
                <div className="about-coffee-steam steam-two" />
                <div className="about-coffee-steam steam-three" />
                <div className="about-cup">
                  <div className="about-cup-coffee">
                    <span>O</span>
                  </div>
                </div>
                <div className="about-cup-handle" />
                <div className="about-cup-saucer" />
              </div>

              <div className="about-coffee-card-bottom">
                <div>
                  <strong>A little pause.</strong>
                  <span>A better kind of day.</span>
                </div>
                <Coffee size={25} />
              </div>
            </div>

            <div className="about-floating-badge">
              <Heart size={17} fill="currentColor" />
              <span>Served with warmth</span>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="about-story-section" id="our-story">
        <div className="about-container about-story-grid">
          <div className="about-story-visual">
            <div className="about-story-photo">
              <div className="about-story-photo-overlay" />
              <div className="about-story-emblem">
                <Coffee size={35} strokeWidth={1.5} />
                <span>TAKE A MOMENT</span>
                <strong>Stay a little.</strong>
              </div>
              <span className="about-story-caption">YOUR PLACE TO PAUSE</span>
            </div>

            <div className="about-story-side-note">
              <span className="about-side-note-line" />
              <span>Good things take a little time.</span>
            </div>
          </div>

          <div className="about-story-copy">
            <p className="about-eyebrow">
              <span />
              OUR STORY
            </p>

            <h2>
              More than a café.
              <br />
              <span>A feeling you can return to.</span>
            </h2>

            <p>
              At Okeit_Stack, we believe a café should offer more than a drink.
              It should be a welcoming space where mornings begin, friendships
              grow, ideas take shape, and busy days find a gentler rhythm.
            </p>

            <p>
              Our philosophy is simple: thoughtful preparation, friendly
              service, and favourites worth coming back for. Whether you are
              meeting a friend, taking a break, or finding a quiet corner for
              yourself, there is room for you here.
            </p>

            <div className="about-story-signature">
              <span className="about-signature-icon">
                <Coffee size={23} />
              </span>
              <div>
                <strong>Okeit_Stack</strong>
                <span>A little warmth in every visit.</span>
              </div>
            </div>

            <Link to="/categories" className="about-inline-link">
              Find your favourite <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values-section">
        <div className="about-container">
          <div className="about-section-heading">
            <div>
              <p className="about-eyebrow">
                <span />
                WHAT MATTERS TO US
              </p>
              <h2>
                The little things
                <br />
                <span>make the difference.</span>
              </h2>
            </div>
            <p className="about-section-intro">
              Everything we do comes back to one idea: making your time with us
              feel worthwhile.
            </p>
          </div>

          <div className="about-values-grid">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <article className="about-value-card" key={value.number}>
                  <div className="about-value-card-top">
                    <span className="about-value-icon">
                      <Icon size={24} strokeWidth={1.7} />
                    </span>
                    <span className="about-value-number">{value.number}</span>
                  </div>

                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                  <div className="about-value-rule" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="about-experience-section">
        <div className="about-container about-experience-grid">
          <div>
            <p className="about-eyebrow">
              <span />
              YOUR MOMENT STARTS HERE
            </p>
            <h2>
              Come for the coffee.
              <br />
              <span>Stay for the feeling.</span>
            </h2>
            <p className="about-experience-description">
              Discover your next favourite drink, something delicious to pair
              with it, and a reason to make time for yourself.
            </p>
            <Link to="/menu" className="about-button about-button-light">
              Browse the menu <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="about-experience-details">
            <div className="about-detail-item">
              <span>
                <Coffee size={21} />
              </span>
              <div>
                <strong>Made with intention</strong>
                <p>Thoughtful preparation, one order at a time.</p>
              </div>
            </div>

            <div className="about-detail-item">
              <span>
                <ShieldCheck size={21} />
              </span>
              <div>
                <strong>A welcoming experience</strong>
                <p>Comfort, friendliness, and care in every visit.</p>
              </div>
            </div>

            <div className="about-detail-item">
              <span>
                <Clock size={21} />
              </span>
              <div>
                <strong>Your time, your way</strong>
                <p>A place for a quick stop or a longer pause.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing brand */}
      <section className="about-closing">
        <div className="about-container about-closing-content">
          <span className="about-closing-logo">
            <Coffee size={27} />
          </span>
          <p className="about-eyebrow">YOUR TABLE IS WAITING</p>
          <h2>Make room for a little good.</h2>
          <Link to="/menu" className="about-inline-link">
            Find your next favourite <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
