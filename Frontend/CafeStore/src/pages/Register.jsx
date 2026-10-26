import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { Coffee } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({ username: "", first_name: "", last_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function change(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // The Django serializer should call set_password() before saving.
      await api.post("/user/", form);
      navigate("/login", { state: { message: "Registration successful! Please log in." } });
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : "Could not connect to the registration API.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="auth-page"><section className="auth-card auth-card-wide"><div className="auth-brand"><span className="brand-mark"><Coffee size={27} /></span><p className="eyebrow">JOIN THE CAFE</p><h1>Create your account.</h1><p className="muted">Sign up for a smoother CafeStore experience.</p></div>{error && <p className="error-message">{error}</p>}<form className="stack-form" onSubmit={handleSubmit}><div className="two-fields"><label>First name<input name="first_name" value={form.first_name} onChange={change} required /></label><label>Last name<input name="last_name" value={form.last_name} onChange={change} required /></label></div><label>Username<input name="username" autoComplete="username" value={form.username} onChange={change} required /></label><label>Email address<input type="email" name="email" autoComplete="email" value={form.email} onChange={change} required /></label><label>Password<input type="password" name="password" autoComplete="new-password" minLength="8" value={form.password} onChange={change} required /><small>Use at least 8 characters.</small></label><button className="button button-primary button-full" disabled={loading}>{loading ? "Creating account…" : "Create account"}</button></form><p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p></section></main>;
}
