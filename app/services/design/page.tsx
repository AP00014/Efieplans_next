"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import "../../../styles/pages/construction.css";
import {
  FaPencilRuler,
  FaCheckCircle,
  FaPlay,
  FaImages,
  FaVideo,
  FaTimes,
} from "react-icons/fa";
import { 
  getRandomMedia, 
  getFeaturedMedia,
  getAllCategories,
  getCategoryInfo,
  getMediaByCategory,
  type DesignMedia 
} from "../../../lib/Design-data";
import OptimizedImage from "../../../components/OptimizedImage";

const DesignPage = () => {
  const [galleryMedia, setGalleryMedia] = useState<DesignMedia[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"images" | "videos">("images");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<DesignMedia | null>(null);

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
            Visionary <span className="text-primary">Architectural Design</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Where art meets engineering. We craft functional, sustainable, and
            aesthetically stunning spaces tailored to your lifestyle.
          </motion.p>
        </div>
      </section>

      {/* Intro Text Section */}
      <section className="construction-intro">
        <div className="container-custom">
          <div className="construction-intro-content">
            <div className="construction-intro-text">
              <h2>Designing for the Future</h2>
              <p>
                Great architecture goes beyond aesthetics; it shapes how we live, work,
                and interact. Our design team combines creativity with technical
                expertise to deliver innovative solutions that stand the test of time.
              </p>
              <p>
                We leverage the latest technology, including BIM (Building Information
                Modeling) and 3D rendering, to ensure precision and collaboration
                throughout the design process. Whether it's a private residence or a
                corporate headquarters, we bring your vision to life with clarity and
                purpose.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Media Gallery Section */}
      <section className="construction-media-section">
        <div className="container-custom">
          <h2 className="media-section-title">Our Design Portfolio</h2>

          {/* Media Tabs */}
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
                      alt={item.alt || item.title}
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
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "videos" && videos.length > 0 && (
              <div className="construction-media-grid">
                {videos.map((item) => (
                  <div
                    key={item.id}
                    className="construction-media-thumbnail"
                    onClick={() => {
                      setSelectedIndex(
                        videos.findIndex((v) => v.id === item.id)
                      );
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
        </div>
      </section>

      {/* Video Modal */}
      {showModal && videos.length > 0 && (
        <div className="construction-media-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="construction-media-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="construction-close-button"
              onClick={() => setShowModal(false)}
            >
              <FaTimes />
            </button>
            <iframe
              src={videos[selectedIndex].url}
              title={videos[selectedIndex].title}
              className="construction-video-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignPage;
