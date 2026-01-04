"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import "../../../styles/pages/construction.css";
import {
  FaHardHat,
  FaCheckCircle,
  FaPlay,
  FaImages,
  FaVideo,
  FaArrowRight,
  FaTimes,
} from "react-icons/fa";
import { 
  getRandomMedia, 
  getFeaturedMedia,
  getAllCategories,
  getCategoryInfo,
  getMediaByCategory,
  type ConstructionMedia 
} from "../../../lib/Construction-data";
import OptimizedImage from "../../../components/OptimizedImage";

const ConstructionPage = () => {
  const [galleryMedia, setGalleryMedia] = useState<ConstructionMedia[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"images" | "videos">("images");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ConstructionMedia | null>(null);

  useEffect(() => {
    // Load random media for gallery
    const randomMedia = getRandomMedia(20);
    setGalleryMedia(randomMedia);
  }, []);

  // Close overlay when clicking outside
  useEffect(() => {
    if (showImageModal) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.construction-image-overlay') && !target.closest('.construction-media-thumbnail')) {
          setShowImageModal(false);
          setSelectedImage(null);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showImageModal]);

  const handleCategoryFilter = (category: string | null) => {
    if (category === null) {
      const randomMedia = getRandomMedia(20);
      setGalleryMedia(randomMedia);
    } else {
      const categoryMedia = getMediaByCategory(category as any);
      setGalleryMedia(categoryMedia.slice(0, 20));
    }
    setSelectedCategory(category);
  };

  // Separate images and videos
  const images = galleryMedia.filter(item => item.type === 'image');
  const videos = galleryMedia.filter(item => item.type === 'video');

  // Prepare image gallery items
  const imageGalleryItems = images.map((item) => ({
    original: item.url,
    thumbnail: item.thumbnail || item.url,
  }));

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <section className="construction-hero">
        <div className="container-custom">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Building Construction <span className="text-primary">Excellence</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Turning your vision into concrete reality with precision, quality, and
            unmatched expertise.
          </motion.p>
        </div>
      </section>

      {/* Introduction */}
      <section className="construction-intro">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="construction-intro-text"
          >
            <h4>Our Expertise</h4>
            <h2>We Build Structures That Stand the Test of Time</h2>
            <p>
              At Efie Plans, construction is more than just pouring concrete and
              erecting steel. It's about creating spaces where life happens, businesses
              thrive, and communities grow. Our team brings decades of combined
              experience to every project, ensuring that every detail is executed to perfection.
            </p>
            <p>
              From the initial ground-breaking to the final ribbon-cutting, we oversee
              every aspect of the construction process with rigorous project management,
              strict safety protocols, and a commitment to sustainability.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Start Your Project <FaHardHat />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Media Gallery Section */}
      <section className="construction-media-section">
        <div className="container-custom">
          <h2 className="media-section-title">Construction Gallery</h2>

          {/* Tab Navigation */}
          <div className="construction-media-tabs">
            <button
              className={`construction-media-tab ${
                activeTab === "images" ? "active" : ""
              }`}
              onClick={() => setActiveTab("images")}
              disabled={images.length === 0}
            >
              <FaImages className="tab-icon" />
              Images ({images.length})
            </button>
            <button
              className={`construction-media-tab ${
                activeTab === "videos" ? "active" : ""
              }`}
              onClick={() => setActiveTab("videos")}
              disabled={videos.length === 0}
            >
              <FaVideo className="tab-icon" />
              Videos ({videos.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="construction-media-tab-content">
            {activeTab === "images" && images.length > 0 && (
              <div className="construction-media-grid">
                {images.map((item, index) => (
                  <div
                    key={item.id}
                    className="construction-media-thumbnail"
                    onClick={() => {
                      if (item.type === 'image') {
                        setSelectedImage(item);
                        setShowImageModal(true);
                      }
                    }}
                  >
                    <OptimizedImage
                      src={item.url}
                      alt={item.type === 'image' ? item.alt : item.title}
                      className="thumbnail-img"
                      width={400}
                      height={300}
                    />
                    <div 
                      className={`construction-image-overlay ${selectedImage?.id === item.id && showImageModal ? 'active' : ''}`}
                    >
                      <h3>{item.title}</h3>
                      {item.description && (
                        <p>{item.description.length > 80 ? item.description.substring(0, 80) + '...' : item.description}</p>
                      )}
                      <div className="construction-overlay-actions">
                        <Link
                          href={`/services/construction/${item.id}`}
                          className="construction-view-link primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowImageModal(false);
                          }}
                        >
                          View Details <FaArrowRight />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "videos" && videos.length > 0 && (
              <div className="construction-media-grid">
                {videos.map((item, index) => (
                  <div
                    key={item.id}
                    className="construction-media-thumbnail"
                    onClick={() => {
                      setSelectedIndex(index);
                      setShowModal(true);
                    }}
                  >
                    <OptimizedImage
                      src={item.thumbnail}
                      alt={item.title}
                      className="thumbnail-img"
                      width={400}
                      height={300}
                    />
                    <div className="construction-video-overlay">
                      <FaPlay className="construction-play-icon" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>


          {/* Full Screen Modal for Videos */}
          {showModal && activeTab === "videos" && (
            <div className="construction-media-modal">
              <button
                className="construction-close-button"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
              {videos[selectedIndex] && (
                <iframe
                  className="construction-external-video"
                  src={videos[selectedIndex].url}
                  title="Video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ConstructionPage;
