import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/client";
import { Coffee } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const message = location.state?.message;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("login/", {
        username,
        password,
      });

      const { access, refresh, user } = response.data;

      if (!access || !refresh) {
        throw new Error(
          "The login API did not return access and refresh tokens.",
        );
      }

      if (!user?.role) {
        console.error(
          "Login response is missing the user role:",
          response.data,
        );
        throw new Error(
          "Login succeeded, but Django did not return the user's role. Update the Django login serializer.",
        );
      }

      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        navigate("/admin/orders", { replace: true });
      } else {
        navigate("/menu", { replace: true });
      }
    } catch (err) {
      console.error("Login failed:", err);

      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : err.message || "Could not connect to the login API.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark">
            <Coffee size={27} />
          </span>
          <p className="eyebrow">WELCOME BACK</p>
          <h1>Good to see you.</h1>
          <p className="muted">Log in to continue your CafeStore experience.</p>
        </div>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            Username
            <input
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button
            className="button button-primary button-full"
            disabled={loading}
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className="auth-switch">
          New to CafeStore? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
