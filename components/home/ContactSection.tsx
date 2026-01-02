"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaCheck,
  FaExclamationTriangle,
  FaSpinner,
  FaYoutube,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";
import { supabase } from "../../lib/supabase";
import "../../styles/components/ContactSection.css";

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
}

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const formRef = useRef<HTMLFormElement>(null);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2)
          return "Name must be at least 2 characters";
        return "";
      case "email": {
        if (!value.trim()) return "Email address is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value))
          return "Please enter a valid email address";
        return "";
      }
      case "phone":
        if (
          value &&
          !/^[+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-()]/g, ""))
        ) {
          return "Please enter a valid phone number";
        }
        return "";
      case "service":
        if (!value) return "Please select a service";
        return "";
      case "message":
        if (!value.trim()) return "Message is required";
        if (value.trim().length < 10)
          return "Message must be at least 10 characters";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key as keyof FormErrors] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce(
      (acc, key) => ({
        ...acc,
        [key]: true,
      }),
      {}
    );
    setTouched(allTouched);

    // Validate all fields
    if (!validateForm()) {
      // Focus first error field
      const firstErrorField = Object.keys(errors)[0];
      const element = formRef.current?.querySelector(
        `[name="${firstErrorField}"]`
      ) as HTMLElement;
      element?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          subject: `Service Inquiry: ${formData.service}`,
          message: formData.message,
          phone: formData.phone,
        }]);

      if (error) {
        setSubmitError(
          "There was an error submitting the form. Please try again."
        );
        console.error("Contact form submission failed:", error);
      } else {
        // Send notification email after successful database insert
        try {
          const { error: functionError } = await supabase.functions.invoke(
            "send-contact-notification",
            {
              body: {
                record: {
                  name: formData.name,
                  email: formData.email,
                  subject: `Service Inquiry: ${formData.service}`,
                  message: formData.message,
                  phone: formData.phone,
                },
              },
            }
          );

          if (functionError) {
            console.warn(
              "Email notification failed, but message was saved:",
              functionError
            );
            // Don't show error to user since the main action (saving message) succeeded
          }
        } catch (emailError) {
          console.warn(
            "Email notification failed, but message was saved:",
            emailError
          );
          // Don't show error to user since the main action (saving message) succeeded
        }

        setSubmitSuccess(true);

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          service: "",
          message: "",
        });
        setTouched({});
        setErrors({});

        // Reset success message after 5 seconds
        setTimeout(() => setSubmitSuccess(false), 5000);
      }
    } catch (error) {
      setSubmitError(
        "There was an error submitting the form. Please try again."
      );
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="contact-section"
      aria-labelledby="contact-title"
    >
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="contact-header"
        >
          <h2 id="contact-title" className="contact-title">
            Contact <span className="contact-title-highlight">Us</span>
          </h2>
          <p className="contact-description">
            Ready to start your construction project? Get in touch with our team
            for a free consultation and quote.
          </p>
        </motion.div>

        <div className="contact-layout">
          {/* Main Content Grid */}
          <div className="contact-main-grid">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className="contact-form-container"
              role="region"
              aria-labelledby="form-title"
            >
              <motion.h3
                id="form-title"
                className="contact-form-title"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Send Us a Message
              </motion.h3>

              {submitSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="form-success-message"
                  role="alert"
                  aria-live="polite"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <FaCheck aria-hidden="true" />
                  </motion.div>
                  <span>Message sent successfully! 🎉</span>
                </motion.div>
              )}

              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="form-error-message"
                  role="alert"
                  aria-live="polite"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <FaExclamationTriangle aria-hidden="true" />
                  </motion.div>
                  <span>{submitError}</span>
                </motion.div>
              )}

              <form
                ref={formRef}
                onSubmit={handleSubmit}
                noValidate
                aria-describedby={submitSuccess ? "success-message" : undefined}
              >
                <motion.div
                  className="form-row"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    className="form-group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.label
                      htmlFor="name"
                      className="form-label"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      Full Name <span aria-label="required">*</span>
                    </motion.label>
                    <motion.input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-input ${errors.name ? "error" : ""}`}
                      aria-describedby={errors.name ? "name-error" : undefined}
                      aria-invalid={!!errors.name}
                      required
                      autoComplete="name"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                      viewport={{ once: true }}
                      whileFocus={{
                        scale: 1.02,
                        boxShadow: "0 0 0 3px rgba(255, 107, 0, 0.1)",
                      }}
                      whileHover={{ y: -2 }}
                    />
                    {errors.name && (
                      <motion.div
                        id="name-error"
                        className="form-error-message"
                        role="alert"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FaExclamationTriangle aria-hidden="true" />
                        {errors.name}
                      </motion.div>
                    )}
                  </motion.div>
                  <motion.div
                    className="form-group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.label
                      htmlFor="email"
                      className="form-label"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      Email Address <span aria-label="required">*</span>
                    </motion.label>
                    <motion.input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-input ${errors.email ? "error" : ""}`}
                      aria-describedby={
                        errors.email ? "email-error" : undefined
                      }
                      aria-invalid={!!errors.email}
                      required
                      autoComplete="email"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                      viewport={{ once: true }}
                      whileFocus={{
                        scale: 1.02,
                        boxShadow: "0 0 0 3px rgba(255, 107, 0, 0.1)",
                      }}
                      whileHover={{ y: -2 }}
                    />
                    {errors.email && (
                      <motion.div
                        id="email-error"
                        className="form-error-message"
                        role="alert"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FaExclamationTriangle aria-hidden="true" />
                        {errors.email}
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>

                <motion.div
                  className="form-row"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    className="form-group"
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.label
                      htmlFor="phone"
                      className="form-label"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                      viewport={{ once: true }}
                    >
                      Phone Number
                    </motion.label>
                    <motion.input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-input ${errors.phone ? "error" : ""}`}
                      aria-describedby={
                        errors.phone ? "phone-error" : undefined
                      }
                      aria-invalid={!!errors.phone}
                      autoComplete="tel"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                      viewport={{ once: true }}
                      whileFocus={{
                        scale: 1.02,
                        boxShadow: "0 0 0 3px rgba(255, 107, 0, 0.1)",
                      }}
                      whileHover={{ y: -2 }}
                    />
                    {errors.phone && (
                      <motion.div
                        id="phone-error"
                        className="form-error-message"
                        role="alert"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FaExclamationTriangle aria-hidden="true" />
                        {errors.phone}
                      </motion.div>
                    )}
                  </motion.div>
                  <motion.div
                    className="form-group"
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.label
                      htmlFor="service"
                      className="form-label"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                      viewport={{ once: true }}
                    >
                      Service Interested In <span aria-label="required">*</span>
                    </motion.label>
                    <div className="custom-select-wrapper">
                      <motion.select
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`custom-select ${
                          errors.service ? "error" : ""
                        }`}
                        aria-describedby={
                          errors.service ? "service-error" : undefined
                        }
                        aria-invalid={!!errors.service}
                        required
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.6 }}
                        viewport={{ once: true }}
                        whileFocus={{
                          scale: 1.02,
                          boxShadow: "0 0 0 3px rgba(255, 107, 0, 0.1)",
                        }}
                        whileHover={{ y: -2 }}
                      >
                        <option value="">Select a service</option>
                        <option value="construction">
                          🏗️ Building Construction
                        </option>
                        <option value="management">
                          📋 Construction Management
                        </option>
                        <option value="design">🎨 Architectural Design</option>
                        <option value="consultation">
                          💬 Project Consultation
                        </option>
                      </motion.select>
                    </div>
                    {errors.service && (
                      <motion.div
                        id="service-error"
                        className="form-error-message"
                        role="alert"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FaExclamationTriangle aria-hidden="true" />
                        {errors.service}
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>

                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.01 }}
                >
                  <motion.label
                    htmlFor="message"
                    className="form-label"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    viewport={{ once: true }}
                  >
                    Your Message <span aria-label="required">*</span>
                  </motion.label>
                  <motion.textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-textarea ${errors.message ? "error" : ""}`}
                    aria-describedby={
                      errors.message ? "message-error" : undefined
                    }
                    aria-invalid={!!errors.message}
                    rows={5}
                    required
                    autoComplete="off"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                    viewport={{ once: true }}
                    whileFocus={{
                      scale: 1.01,
                      boxShadow: "0 0 0 3px rgba(255, 107, 0, 0.1)",
                    }}
                    whileHover={{ y: -1 }}
                  />
                  {errors.message && (
                    <motion.div
                      id="message-error"
                      className="form-error-message"
                      role="alert"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FaExclamationTriangle aria-hidden="true" />
                      {errors.message}
                    </motion.div>
                  )}
                </motion.div>

                <motion.button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={isSubmitting}
                  aria-describedby={
                    isSubmitting ? "submitting-status" : undefined
                  }
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 8px 24px rgba(255, 107, 0, 0.4)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="flex items-center justify-center gap-2"
                    animate={
                      isSubmitting ? { opacity: [1, 0.7, 1] } : { opacity: 1 }
                    }
                    transition={{
                      duration: 1.5,
                      repeat: isSubmitting ? Infinity : 0,
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <FaSpinner aria-hidden="true" />
                        </motion.div>
                        <span id="submitting-status">Sending...</span>
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </motion.div>
                </motion.button>
              </form>
            </motion.div>

            {/* Contact Information & Map Container */}
            <div className="contact-info-map-wrapper">
              {/* Social Media Links */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                role="region"
                aria-labelledby="social-links-title"
              >
                <div className="social-links-container">
                  <h3 id="social-links-title" className="social-links-title">
                    Follow Us
                  </h3>
                  <div className="social-links-grid" role="list">
                    <a
                      href="https://youtube.com/@stoneedge"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link social-youtube"
                      aria-label="Follow us on YouTube"
                      role="listitem"
                    >
                      <FaYoutube className="social-icon" aria-hidden="true" />
                      <span className="social-label">YouTube</span>
                    </a>
                    <a
                      href="https://facebook.com/stoneedge"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link social-facebook"
                      aria-label="Follow us on Facebook"
                      role="listitem"
                    >
                      <FaFacebook className="social-icon" aria-hidden="true" />
                      <span className="social-label">Facebook</span>
                    </a>
                    <a
                      href="https://twitter.com/stoneedge"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link social-twitter"
                      aria-label="Follow us on Twitter"
                      role="listitem"
                    >
                      <FaTwitter className="social-icon" aria-hidden="true" />
                      <span className="social-label">Twitter</span>
                    </a>
                    <a
                      href="https://instagram.com/stoneedge"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link social-instagram"
                      aria-label="Follow us on Instagram"
                      role="listitem"
                    >
                      <FaInstagram className="social-icon" aria-hidden="true" />
                      <span className="social-label">Instagram</span>
                    </a>
                    <a
                      href="https://tiktok.com/@stoneedge"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link social-tiktok"
                      aria-label="Follow us on TikTok"
                      role="listitem"
                    >
                      <FaTiktok className="social-icon" aria-hidden="true" />
                      <span className="social-label">TikTok</span>
                    </a>
                    <a
                      href="https://wa.me/233123456789"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link social-whatsapp"
                      aria-label="Contact us on WhatsApp"
                      role="listitem"
                    >
                      <FaWhatsapp className="social-icon" aria-hidden="true" />
                      <span className="social-label">WhatsApp</span>
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* Google Maps Integration */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                className="map-container-wrapper"
                role="application"
                aria-label="Interactive map showing Stone Edge Construction location"
              >
                <div className="map-container">
                  {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY &&
                  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== "DEMO_KEY" ? (
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=123+Construction+Avenue,Accra,Ghana&zoom=15&maptype=roadmap`}
                      width="100%"
                      height="100%"
                      style={{ border: 0, borderRadius: "inherit" }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Stone Edge Construction Location Map"
                      aria-label="Google Maps showing 123 Construction Avenue, Accra, Ghana"
                    />
                  ) : (
                    <div className="map-placeholder">
                      <div className="map-placeholder-content">
                        <h4>📍 Our Location</h4>
                        <p>
                          123 Construction Avenue
                          <br />
                          Accra, Ghana
                        </p>
                        <p className="map-placeholder-note">
                          Interactive map requires Google Maps API key
                        </p>
                      </div>
                    </div>
                  )}
                  {(!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
                    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ===
                      "DEMO_KEY") && (
                    <div className="map-overlay-notice">
                      <div className="map-notice-content">
                        <h4>Map Preview</h4>
                        <p>
                          To enable real Google Maps, add your API key to
                          environment variables.
                        </p>
                        <code>VITE_GOOGLE_MAPS_API_KEY=your_api_key_here</code>
                        <p className="map-notice-small">
                          Get your API key from{" "}
                          <a
                            href="https://console.cloud.google.com/google/maps-apis"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="map-link"
                          >
                            Google Cloud Console
                          </a>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
