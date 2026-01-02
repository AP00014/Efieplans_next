"use client";

import { motion } from "framer-motion";

// Import components for each section
import HeroSection from "../components/home/HeroSection";
import AboutSection from "../components/home/AboutSection";
import PortfolioSection from "../components/home/PortfolioSection";
import TestimonialsSection from "../components/home/TestimonialsSection";
import ContactSection from "../components/home/ContactSection";

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <HeroSection />

      {/* About Section */}
      <AboutSection />

      {/* CTA Section */}
      <motion.div
        className="cta-section"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
      ></motion.div>

      {/* Services Section
      <ServicesSection />*/}

      {/* Portfolio Section */}
      <PortfolioSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Contact Section */}
      <ContactSection />
    </div>
  );
};

export default Home;
