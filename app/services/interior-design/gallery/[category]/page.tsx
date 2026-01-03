"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaArrowLeft, FaImages } from "react-icons/fa";
import { 
  getMediaByCategory,
  getCategoryInfo,
  type InteriorMedia,
  type InteriorCategory
} from "../../../../../lib/InteriorDesign-data";
import OptimizedImage from "../../../../../components/OptimizedImage";
import "../../../../../styles/pages/construction.css";

const InteriorDesignGalleryPage = () => {
  const params = useParams();
  const category = params.category as string;
  const [images, setImages] = useState<InteriorMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showFullGallery, setShowFullGallery] = useState(false);

  useEffect(() => {
    if (category) {
      const categoryMedia = getMediaByCategory(category as InteriorCategory);
      const categoryImages = categoryMedia.filter(item => item.type === 'image');
      setImages(categoryImages);
      setLoading(false);
    }
  }, [category]);

  const categoryInfo = category ? getCategoryInfo(category as InteriorCategory) : null;

  const imageGalleryItems = images.map((item) => ({
    original: item.url,
    thumbnail: item.thumbnail || item.url,
    description: item.description || item.title,
  }));

  if (loading) {
    return (
      <div className="construction-gallery-loading">
        <div className="loading-spinner"></div>
        <p>Loading gallery...</p>
      </div>
    );
  }

  if (!categoryInfo || images.length === 0) {
    return (
      <div className="construction-gallery-error">
        <h2>Gallery Not Found</h2>
        <p>No images found for this category.</p>
        <Link href="/services/interior-design" className="back-link">
          <FaArrowLeft /> Back to Interior Design
        </Link>
      </div>
    );
  }

  return (
    <div className="construction-gallery-page">
      {/* Header */}
      <div className="construction-gallery-header">
        <Link href="/services/interior-design" className="gallery-back-button">
          <FaArrowLeft /> Back
        </Link>
        <div className="gallery-header-content">
          <div className="gallery-header-icon">
            {categoryInfo.icon}
          </div>
          <div>
            <h1 className="gallery-page-title">{categoryInfo.name}</h1>
            <p className="gallery-page-subtitle">{categoryInfo.description}</p>
            <p className="gallery-page-count">{images.length} Images</p>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="container-custom">
        <div className="construction-gallery-grid-full">
          {images.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="construction-gallery-item-full"
              onClick={() => {
                setSelectedIndex(index);
                setShowFullGallery(true);
              }}
            >
              <OptimizedImage
                src={item.url}
                alt={item.alt || item.title}
                className="gallery-item-image-full"
                width={600}
                height={450}
              />
              <div className="gallery-item-overlay-full">
                <h3 className="gallery-item-title-full">{item.title}</h3>
                {item.description && (
                  <p className="gallery-item-desc-full">{item.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Full Gallery Modal */}
      {showFullGallery && (
        <div className="construction-full-gallery-modal">
          <button
            className="construction-full-gallery-close"
            onClick={() => setShowFullGallery(false)}
          >
            &times;
          </button>
          <ImageGallery
            items={imageGalleryItems}
            startIndex={selectedIndex}
            showPlayButton={false}
            showFullscreenButton={true}
            showBullets={true}
            showThumbnails={true}
            lazyLoad={true}
          />
        </div>
      )}
    </div>
  );
};

export default InteriorDesignGalleryPage;

