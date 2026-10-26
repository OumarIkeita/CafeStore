import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return <main className="empty-state not-found"><span>☕</span><p className="eyebrow">404 · PAGE NOT FOUND</p><h1>Looks like this cup is empty.</h1><p>We couldn't find the page you were looking for.</p><Link to="/" className="button button-primary">Back home</Link></main>;
}
