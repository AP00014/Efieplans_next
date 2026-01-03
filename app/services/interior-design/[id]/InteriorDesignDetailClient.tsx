"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { 
  FaArrowLeft,
  FaPlay,
} from "react-icons/fa";
import { 
  getMediaById,
  getMediaByCategory,
  getCategoryInfo,
  type InteriorMedia,
  type InteriorCategory
} from "../../../../lib/InteriorDesign-data";
import OptimizedImage from "../../../../components/OptimizedImage";
import "../../../../styles/pages/construction.css";

const InteriorDesignDetailClient = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [media, setMedia] = useState<InteriorMedia | null>(null);
  const [relatedMedia, setRelatedMedia] = useState<InteriorMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullImage, setShowFullImage] = useState(false);

  useEffect(() => {
    if (id) {
      const mediaItem = getMediaById(id);
      if (mediaItem) {
        setMedia(mediaItem);
        // Get related media from same category
        const related = getMediaByCategory(mediaItem.category)
          .filter(item => item.id !== id && item.type === mediaItem.type)
          .slice(0, 6);
        setRelatedMedia(related);
        setLoading(false);
      } else {
        setError("Media not found");
        setLoading(false);
      }
    }
  }, [id]);

  if (loading) {
    return (
      <div className="construction-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading media...</p>
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="construction-detail-error">
        <h2>{error || "Media Not Found"}</h2>
        <p>The requested interior design media could not be found.</p>
        <Link href="/services/interior-design" className="back-link">
          <FaArrowLeft /> Back to Interior Design Gallery
        </Link>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(media.category);
  const isVideo = media.type === 'video';

  return (
    <div className="construction-detail-page">
      {/* Header */}
      <div className="construction-detail-header">
        <div className="container-custom">
          <div className="detail-header-actions">
            <Link href="/services/interior-design" className="detail-back-button">
              <FaArrowLeft /> Back
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom">
        <div className="construction-detail-content">
          {/* Media Section */}
          <motion.div 
            className="construction-detail-media"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {isVideo ? (
              <div className="construction-detail-video">
                <iframe
                  className="detail-video-player"
                  src={media.url}
                  title={media.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div 
                className="construction-detail-image"
                onClick={() => setShowFullImage(true)}
              >
                <OptimizedImage
                  src={media.url}
                  alt={media.alt || media.title}
                  className="detail-main-image"
                  width={1200}
                  height={800}
                />
                <div className="detail-image-overlay">
                  <span className="detail-zoom-hint">Click to view full size</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Info Section */}
          <motion.div 
            className="construction-detail-info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="detail-title">{media.title}</h1>
            
            {media.description && (
              <p className="detail-description">{media.description}</p>
            )}
          </motion.div>
        </div>

        {/* Related Media */}
        {relatedMedia.length > 0 && (
          <section className="construction-detail-related">
            <h2 className="related-title">Related {isVideo ? 'Videos' : 'Images'}</h2>
            <div className="construction-related-grid">
              {relatedMedia.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="construction-related-item"
                  onClick={() => router.push(`/services/interior-design/${item.id}`)}
                >
                  <OptimizedImage
                    src={item.type === 'image' ? item.url : item.thumbnail}
                    alt={item.title}
                    className="related-item-image"
                    width={400}
                    height={300}
                  />
                  {item.type === 'video' && (
                    <div className="related-video-overlay">
                      <FaPlay className="related-play-icon" />
                    </div>
                  )}
                  <div className="related-item-overlay">
                    <h3 className="related-item-title">{item.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Full Image Modal */}
      {showFullImage && !isVideo && media.type === 'image' && (
        <div className="construction-detail-image-modal">
          <button
            className="detail-image-modal-close"
            onClick={() => setShowFullImage(false)}
          >
            &times;
          </button>
          <ImageGallery
            items={[{
              original: media.url,
              thumbnail: media.thumbnail || media.url,
              description: media.description || media.title,
            }]}
            startIndex={0}
            showPlayButton={false}
            showFullscreenButton={true}
            showBullets={false}
            showThumbnails={false}
          />
        </div>
      )}
    </div>
  );
};

export default InteriorDesignDetailClient;

