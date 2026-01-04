"use client";

import { motion } from "framer-motion";
import ContactSection from "../../components/home/ContactSection";

const Contact = () => {
  return (
    <div className="contact-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container-custom py-16"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Get in touch with us for your construction and architectural needs.
          </p>
        </div>

        <ContactSection />
      </motion.div>
    </div>
  );
};

export default Contact;
