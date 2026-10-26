import React, { useState } from "react";
import logo from "../../../assets/okeit-stack-logo.png";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Coffee,
  ShoppingCart,
  Menu,
  X,
  UserRound,
  LogOut,
  ClipboardList,
  Settings,
  Package,
  Tag,
  ChevronRight,
} from "lucide-react";

import { useCart } from "../../context/CartContext";
import "./Navbar.css";

const links = [
  { label: "Home", to: "/" },
  { label: "Menu", to: "/menu" },
  { label: "Categories", to: "/categories" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const navigate = useNavigate();

  const accessToken = localStorage.getItem("accessToken");
  const loggedIn = Boolean(accessToken);

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const isAdmin = Boolean(
    user?.role === "admin" ||
    user?.is_staff === true ||
    user?.is_superuser === true,
  );

  function closeMenu() {
    setOpen(false);
  }

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    closeMenu();
    navigate("/login");
  }

  const adminLinks = [
    {
      label: "Manage Cafe",
      to: "/admin/manage",
      icon: Settings,
    },
    {
      label: "Inventory",
      to: "/admin/inventory",
      icon: Package,
    },
    {
      label: "Admin Orders",
      to: "/admin/orders",
      icon: ClipboardList,
    },
    {
      label: "Promotions",
      to: "/admin/promotions",
      icon: Tag,
    },
  ];

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="brand" onClick={closeMenu}>
          <img src={logo} alt="Okeit_Stack logo" className="brand-logo" />

          <span className="brand-text">
            <strong>Okeit_Stack</strong>
            <small>Good coffee, great moments</small>
          </span>
        </Link>

        {/* Main navigation */}
        <nav
          className={`nav-links ${open ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              onClick={closeMenu}
            >
              {link.label}
            </NavLink>
          ))}

          {/* Admin-only navigation */}
          {loggedIn && isAdmin && (
            <div className="mobile-admin-links">
              <p className="nav-section-label">ADMINISTRATION</p>

              {adminLinks.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `nav-link admin-nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMenu}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                  <ChevronRight size={15} className="admin-chevron" />
                </NavLink>
              ))}
            </div>
          )}

          {/* Mobile account actions */}
          <div className="mobile-nav-actions">
            {loggedIn ? (
              <>
                <Link
                  className="button button-outline"
                  to={isAdmin ? "/admin/orders" : "/orders"}
                  onClick={closeMenu}
                >
                  <ClipboardList size={17} />
                  {isAdmin ? "Manage Orders" : "My Orders"}
                </Link>

                <Link
                  className="button button-outline"
                  to="/cart"
                  onClick={closeMenu}
                >
                  <ShoppingCart size={17} />
                  Cart ({count})
                </Link>

                <button
                  type="button"
                  className="button button-primary"
                  onClick={logout}
                >
                  <LogOut size={17} />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  className="button button-outline"
                  to="/login"
                  onClick={closeMenu}
                >
                  <UserRound size={17} />
                  Login
                </Link>

                <Link
                  className="button button-primary"
                  to="/register"
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Desktop actions */}
        <div className="nav-actions">
          {loggedIn && isAdmin && (
            <div className="desktop-admin-links">
              {adminLinks.map(({ label, to, icon: Icon }) => (
                <Link
                  key={to}
                  className="button button-outline desktop-action"
                  to={to}
                  title={label}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          )}

          {loggedIn && !isAdmin && (
            <Link className="button button-outline desktop-action" to="/orders">
              <ClipboardList size={16} />
              My Orders
            </Link>
          )}

          {/* Cart for all logged-in users */}
          {loggedIn && (
            <Link
              className="cart-link"
              to="/cart"
              aria-label={`Cart with ${count} items`}
            >
              <ShoppingCart size={20} />
              <span>Cart</span>
              <b className="cart-count">{count}</b>
            </Link>
          )}

          {loggedIn ? (
            <button
              type="button"
              className="button button-primary desktop-action"
              onClick={logout}
            >
              <LogOut size={16} />
              Log out
            </button>
          ) : (
            <>
              <Link
                className="button button-outline desktop-action"
                to="/login"
              >
                <UserRound size={16} />
                Login
              </Link>

              <Link
                className="button button-primary desktop-action"
                to="/register"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="menu-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>
    </header>
  );
}
