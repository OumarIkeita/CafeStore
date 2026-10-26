import React, { useState } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    // Connect this form to a Django contact endpoint or email service when available.
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  }

  return (
    <main className="page-shell">
      <section className="page-hero">
        <p className="eyebrow">WE WOULD LOVE TO HEAR FROM YOU</p>
        <h1>Let's talk coffee.</h1>
        <p>
          Questions, feedback, or just want to say hello? Send us a message.
        </p>
      </section>
      <section className="container contact-layout section">
        <div className="contact-details">
          <p className="eyebrow">GET IN TOUCH</p>
          <h2>Come say hello.</h2>
          <p className="muted">contact information.</p>
          <div className="contact-detail">
            <span>
              <MapPin />
            </span>
            <div>
              <strong>Visit us</strong>
              <p>Yenikent Boulver</p>
            </div>
          </div>
          <div className="contact-detail">
            <span>
              <Clock />
            </span>
            <div>
              <strong>Opening hours</strong>
              <p>Monday – Sunday, 8:00 AM – 8:00 PM</p>
            </div>
          </div>
          <div className="contact-detail">
            <span>
              <Mail />
            </span>
            <div>
              <strong>Email</strong>
              <p>keitaumar122499@gmail.com</p>
            </div>
          </div>
          <div className="contact-detail">
            <span>
              <Phone />
            </span>
            <div>
              <strong>Phone</strong>
              <p>+90 (548) 879 24 12</p>
            </div>
          </div>
        </div>
        <form className="form-card contact-form" onSubmit={handleSubmit}>
          <h2>Send a message</h2>
          <p className="muted">We will get back to you as soon as we can.</p>
          {sent && (
            <p className="success-message">
              Thanks! Your message has been captured in this demo. Connect a
              backend endpoint to deliver it.
            </p>
          )}
          {error && <p className="error-message">{error}</p>}
          <label>
            Your name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
            />
          </label>
          <label>
            Email address
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Subject
            <input
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="What is this about?"
            />
          </label>
          <label>
            Message
            <textarea
              required
              rows="5"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Write your message..."
            />
          </label>
          <button className="button button-primary button-full" type="submit">
            Send message
          </button>
        </form>
      </section>
    </main>
  );
}
