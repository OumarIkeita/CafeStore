import React from "react";
import { Coffee, MapPin, Clock, Mail, ArrowUpRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link
              to="/"
              className="footer-brand-link"
              aria-label="Okeit Stack home"
            >
              <span className="footer-brand-mark">
                <Coffee size={25} strokeWidth={1.8} />
              </span>

              <span className="footer-brand-text">
                <strong>Okeit_Stack</strong>
                <small>COFFEE · COMFORT · COMMUNITY</small>
              </span>
            </Link>

            <p className="footer-brand-description">
              Good coffee, fresh bites, and a welcoming place to pause. Make
              room for a little good in every day.
            </p>

            <Link to="/about" className="footer-story-link">
              Discover our story <ArrowUpRight size={16} />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="footer-navigation" aria-label="Footer navigation">
            <h4>Explore</h4>
            <Link to="/menu">Our menu</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/about">Our story</Link>
            <Link to="/">Home</Link>
          </nav>

          {/* Visit */}
          <div className="footer-visit">
            <h4>Come say hello</h4>

            <div className="footer-info-item">
              <span className="footer-info-icon">
                <Clock size={17} />
              </span>
              <div>
                <strong>Opening hours</strong>
                <p>Monday – Sunday</p>
                <p>8:00 AM – 8:00 PM</p>
              </div>
            </div>

            <div className="footer-info-item">
              <span className="footer-info-icon">
                <MapPin size={17} />
              </span>
              <div>
                <strong>Find us</strong>
                <p>Add your café address</p>
              </div>
            </div>

            <div className="footer-info-item">
              <span className="footer-info-icon">
                <Mail size={17} />
              </span>
              <div>
                <strong>Email us</strong>
                <a href="mailto:hello@okeitstack.com">hello@okeitstack.com</a>
              </div>
            </div>
          </div>

          {/* Closing message */}
          <div className="footer-note">
            <span className="footer-note-icon">
              <Heart size={21} />
            </span>
            <p className="footer-note-label">A LITTLE REMINDER</p>
            <h3>Take a breath. Sip something good.</h3>
            <Link to="/menu" className="footer-menu-button">
              Find your favourite <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>© {new Date().getFullYear()} Okeit_Stack. All rights reserved.</p>

          <p className="footer-made-with">
            Made with <Heart size={14} fill="currentColor" /> and coffee.
          </p>
        </div>
      </div>
    </footer>
  );
}
