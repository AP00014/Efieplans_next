"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { supabase } from "../../lib/supabase";
import "../../styles/components/Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage({ type: "error", text: "Please enter your email address." });
      return;
    }

    if (!validateEmail(email)) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("email_subscriptions")
        .insert([{ email: email.trim() }]);

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation
          setMessage({
            type: "error",
            text: "This email is already subscribed to our newsletter.",
          });
        } else {
          setMessage({
            type: "error",
            text: "Failed to subscribe. Please try again.",
          });
        }
      } else {
        setMessage({
          type: "success",
          text: "Thank you for subscribing! You'll receive our latest updates.",
        });
        setEmail("");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="footer" role="contentinfo">
      <div className="container-custom">
        <div className="footer-grid">
          {/* Company Info */}
          <section
            className="footer-company-info"
            aria-labelledby="company-info-heading"
          >
            <div className="footer-logo">
              <Link href="/" className="footer-logo-link">
                <img
                  src="https://res.cloudinary.com/dpzndrhse/image/upload/v1750667944/efieplans_logo_edited_kq1tmo.avif"
                  alt="Efie Plans Logo"
                  className="footer-logo-image"
                  loading="lazy"
                />
              </Link>
            </div>
           
            <nav aria-label="Social media links">
              <div className="footer-social">
                <a
                  href="#"
                  className="footer-social-link"
                  aria-label="Visit our Facebook page"
                >
                  <FaFacebook size={20} />
                </a>
                <a
                  href="#"
                  className="footer-social-link"
                  aria-label="Visit our Twitter page"
                >
                  <FaTwitter size={20} />
                </a>
                <a
                  href="#"
                  className="footer-social-link"
                  aria-label="Visit our Instagram page"
                >
                  <FaInstagram size={20} />
                </a>
                <a
                  href="#"
                  className="footer-social-link"
                  aria-label="Visit our LinkedIn page"
                >
                  <FaLinkedin size={20} />
                </a>
              </div>
            </nav>
          </section>

          {/* Quick Links */}
          <nav className="footer-links" aria-labelledby="quick-links-heading">
            <h3 id="quick-links-heading" className="footer-heading">
              Quick Links
            </h3>
            <ul className="footer-links-list">
              <li>
                <Link href="/" className="footer-link">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="footer-link">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="footer-link">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="footer-link">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/contact" className="footer-link">
                  Contact Us
                </Link>
              </li>
            </ul>
          </nav>

          {/* Services */}
          <nav className="footer-services" aria-labelledby="services-heading">
            <h3 id="services-heading" className="footer-heading">
              Our Services
            </h3>
            <ul className="footer-links-list">
              <li>
                <Link href="/services/construction" className="footer-link">
                  Building Construction
                </Link>
              </li>
              <li>
                <Link href="/services/design" className="footer-link">
                  Architectural Design
                </Link>
              </li>
              <li>
                <Link href="/services/interior-design" className="footer-link">
                  Interior Design
                </Link>
              </li>

            </ul>
          </nav>

          {/* Contact Info */}
          <address className="footer-contact" aria-labelledby="contact-heading">
            <h3 id="contact-heading" className="footer-heading">
              Contact Us
            </h3>
            <ul className="footer-contact-list">
              <li className="footer-contact-item">
                <FaMapMarkerAlt
                  className="footer-contact-icon"
                  aria-hidden="true"
                />
                <span>Accra, Ghana</span>
              </li>
              <li className="footer-contact-item">
                <FaPhone className="footer-contact-icon" aria-hidden="true" />
                <span>+233 123 456 789</span>
              </li>
              <li className="footer-contact-item">
                <FaEnvelope
                  className="footer-contact-icon"
                  aria-hidden="true"
                />
                <a
                  href="mailto:info@efieplans.com"
                  className="footer-contact-link"
                >
                  info@efieplans.com
                </a>
              </li>
            </ul>
          </address>

          {/* Newsletter Signup */}
          <section
            className="footer-newsletter"
            aria-labelledby="newsletter-heading"
          >
            <h3 id="newsletter-heading" className="footer-heading">
              Stay Updated
            </h3>
            <form
              onSubmit={handleNewsletterSubmit}
              className="footer-newsletter-form"
              role="form"
              aria-labelledby="newsletter-heading"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                type="email"
                id="newsletter-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="footer-newsletter-input"
                required
                aria-describedby="newsletter-description"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="footer-newsletter-button"
                aria-label="Subscribe to newsletter"
                disabled={isLoading}
              >
                {isLoading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
            {message && (
              <div
                className={`footer-message ${
                  message.type === "success"
                    ? "footer-message-success"
                    : "footer-message-error"
                }`}
                role="alert"
                aria-live="polite"
              >
                {message.text}
              </div>
            )}
            <p id="newsletter-description" className="sr-only">
              We'll send you updates about our design services and projects.
            </p>
          </section>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-container">
            <p className="footer-copyright">
              &copy; {currentYear} Efie Plans. All rights reserved.
            </p>
            <div className="footer-legal">
              <ul className="footer-legal-list">
                <li>
                  <Link href="/privacy" className="footer-legal-link">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="footer-legal-link">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/sitemap" className="footer-legal-link">
                    Sitemap
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
