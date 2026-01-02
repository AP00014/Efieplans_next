'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../../styles/components/HeroSection.css";

const HeroSection = () => {
  // Array of carousel images (reduced to 5 for optimal performance)
  const carouselImages = [
    "https://res.cloudinary.com/dpzndrhse/image/upload/v1750667824/81945302_2141154495987458_8142382399708200960_n_cpcfed.jpg",
    "https://res.cloudinary.com/dpzndrhse/image/upload/v1750637742/Joseph_s_final-1_hz8afy.jpg",
    "https://res.cloudinary.com/dpzndrhse/image/upload/v1750637687/front_angle_pdw9fc.jpg",
    "https://res.cloudinary.com/dpzndrhse/image/upload/v1750637713/pc4_yja63i.jpg",
    "https://res.cloudinary.com/dpzndrhse/image/upload/v1750636841/master_bed_ru1iki.jpg"
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000); // 4 second intervals

    return () => clearInterval(interval);
  }, [isAutoPlaying, carouselImages.length]);

  // Navigation functions
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <section id="home" className="hero-section">
      {/* Image Carousel Background */}
      <div className="hero-carousel" onMouseEnter={() => setIsAutoPlaying(false)} onMouseLeave={() => setIsAutoPlaying(true)}>
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`hero-carousel-slide ${index === currentSlide ? 'active' : ''}`}
            style={{
              backgroundImage: `url(${image})`,
              transform: `translateX(${(index - currentSlide) * 100}%)`
            }}
          >
            <img
              src={image}
              alt={`Hero slide ${index + 1}`}
              loading="lazy"
              style={{ display: 'none' }}
            />
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          className="hero-carousel-arrow hero-carousel-arrow-left"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <FaChevronLeft />
        </button>
        <button
          className="hero-carousel-arrow hero-carousel-arrow-right"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <FaChevronRight />
        </button>

        {/* Navigation Dots */}
        <div className="hero-carousel-dots">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              className={`hero-carousel-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Background Overlay */}
        <div className="hero-background-overlay" />
      </div>

      {/* Content */}
      <div className="hero-content container-custom">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hero-title"
        >
          Building <span className="hero-title-highlight">Excellence</span> in
          Ghana & Beyond
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hero-description"
        >
          With over 20 years of experience in construction and international
          operations, Efie_plans delivers exceptional quality and craftsmanship
          to every project.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.4 }}
          className="hero-buttons"
        >
          <Link href="/#contact" className="btn btn-primary">
            Get in Touch
          </Link>
          <Link
            href="/projects"
            className="btn btn-outline hero-secondary-button"
          >
            View Our Projects
          </Link>
        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
     
    </section>
  );
};

export default HeroSection;
