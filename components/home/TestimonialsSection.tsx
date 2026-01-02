'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuoteLeft, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../../styles/components/TestimonialsSection.css';

// Sample testimonials data
const testimonials = [
  {
    id: 1,
    name: 'Samuel Osei',
    position: 'Property Developer',
    company: 'Accra Estates',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    quote: 'Efie-plans Construction delivered our residential complex on time and within budget. Their attention to detail and quality workmanship exceeded our expectations. We will definitely work with them again on future projects.',
    rating: 5
  },
  {
    id: 2,
    name: 'Abena Mensah',
    position: 'CEO',
    company: 'Mensah Hotels',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    quote: 'The construction of our hotel was a complex project, but Efie-plans handled it with professionalism and expertise. Their team was responsive to our needs and delivered exceptional results that have impressed our guests.',
    rating: 5
  },
  {
    id: 3,
    name: 'Kwame Boateng',
    position: 'Director',
    company: 'Boateng Retail Group',
    image: 'https://randomuser.me/api/portraits/men/62.jpg',
    quote: 'We hired Efie-plans for our shopping mall construction and were impressed by their project management skills. They navigated challenges effectively and maintained high standards throughout the project.',
    rating: 4
  },
  {
    id: 4,
    name: 'Akosua Darko',
    position: 'Homeowner',
    company: '',
    image: 'https://randomuser.me/api/portraits/women/58.jpg',
    quote: 'Efie-plans transformed our home with their construction expertise. The team was professional, clean, and respectful of our space. The final result exceeded our expectations and was completed ahead of schedule.',
    rating: 5
  },
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Auto-rotate testimonials
  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setActiveIndex((current) => {
          const next = (current + 1) % testimonials.length;
          console.log('Carousel auto-rotating to index:', next, 'from:', current);
          return next;
        });
      }, 6000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying]);

  // Handle manual navigation
  const goToSlide = (index: number) => {
    console.log('Manually navigating to slide:', index);
    setActiveIndex(index);
  };

  const nextSlide = () => {
    const next = (activeIndex + 1) % testimonials.length;
    console.log('Next slide:', next);
    setActiveIndex(next);
  };

  const prevSlide = () => {
    const prev = activeIndex === 0 ? testimonials.length - 1 : activeIndex - 1;
    console.log('Previous slide:', prev);
    setActiveIndex(prev);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    console.log('Touch start at:', touchStartX.current);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    console.log('Touch end at:', touchEndX.current, 'diff:', diff);

    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  // Pause on hover
  const handleMouseEnter = () => {
    console.log('Pausing auto-play on hover');
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    console.log('Resuming auto-play on mouse leave');
    setIsAutoPlaying(true);
  };

  return (
    <section className="testimonials-section">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="testimonials-header"
        >
          <h2 className="testimonials-title">
            Client <span className="testimonials-title-highlight">Testimonials</span>
          </h2>
          <p className="testimonials-description">
            Don't just take our word for it. Here's what our clients have to say about working with Efie-plans Construction.
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div
          className="testimonials-carousel"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="testimonials-carousel-container">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="testimonial-slide"
              >
                <div className="testimonial-card">
                  <FaQuoteLeft className="testimonial-quote-icon" />
                  <p className="testimonial-text">
                    "{testimonials[activeIndex].quote}"
                  </p>
                  <div className="testimonial-author">
                    <div className="testimonial-author-info">
                      <h4 className="testimonial-author-name">{testimonials[activeIndex].name}</h4>
                      <p className="testimonial-author-position">
                        {testimonials[activeIndex].position}{testimonials[activeIndex].company && `, ${testimonials[activeIndex].company}`}
                      </p>
                      <div className="testimonial-rating">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`testimonial-star ${i < testimonials[activeIndex].rating ? 'active' : 'inactive'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <button
            className="carousel-nav carousel-nav-prev"
            onClick={prevSlide}
            aria-label="Previous testimonial"
          >
            <FaChevronLeft />
          </button>
          <button
            className="carousel-nav carousel-nav-next"
            onClick={nextSlide}
            aria-label="Next testimonial"
          >
            <FaChevronRight />
          </button>

          {/* Carousel Indicators */}
          <div className="testimonials-indicators">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`testimonial-indicator ${activeIndex === index ? 'active' : ''}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;