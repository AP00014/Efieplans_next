"use client";

import { useState, useEffect } from "react";
import "../styles/components/OptimizedImage.css";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  onLoad?: () => void;
}

/**
 * Optimized Image Component with:
 * - Automatic Cloudinary transformations
 * - Progressive loading with blur effect
 * - WebP format optimization
 * - Responsive sizing
 * - Lazy loading (except priority images)
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = "",
  width,
  height,
  priority = false,
  sizes,
  onLoad,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>("");

  /**
   * Generate Cloudinary optimized URL with transformations
   * For non-Cloudinary URLs (Supabase), return different sizes
   */
  const getOptimizedUrl = (
    originalUrl: string,
    quality: "low" | "medium" | "high" = "high",
    targetWidth?: number
  ): string => {
    // Check if it's a Cloudinary URL
    if (originalUrl.includes("cloudinary.com")) {
      // Parse the Cloudinary URL
      const urlParts = originalUrl.split("/upload/");
      if (urlParts.length !== 2) {
        return originalUrl;
      }

      const transformations: string[] = [];

      // Quality settings
      const qualityMap = {
        low: "q_30,w_50,e_blur:1000", // Tiny blur placeholder
        medium: "q_60,f_auto", // Medium quality
        high: "q_auto:good,f_auto,dpr_auto", // High quality with auto format
      };

      transformations.push(qualityMap[quality]);

      // Add width/height if specified
      if (targetWidth || width) {
        transformations.push(`w_${targetWidth || width}`);
      }
      if (height && quality !== "low") {
        transformations.push(`h_${height}`);
      }

      // Add smart cropping for thumbnails
      if (quality === "medium" || quality === "low") {
        transformations.push("c_fill,g_auto");
      }

      const transformString = transformations.join(",");
      return `${urlParts[0]}/upload/${transformString}/${urlParts[1]}`;
    }

    // For Supabase Storage URLs, add transform parameters for optimization
    if (originalUrl.includes("supabase.co/storage")) {
      // Supabase Storage supports image transformations via query params
      const url = new URL(originalUrl);
      
      if (quality === "low") {
        // Return a lightweight placeholder
        return (
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
          (width || 400) +
          " " +
          (height || 300) +
          '"%3E%3Crect fill="%23f0f0f0" width="100%25" height="100%25"/%3E%3C/svg%3E'
        );
      }
      
      // For medium/high quality, add width parameter if specified
      if (targetWidth || width) {
        url.searchParams.set("width", String(targetWidth || width));
        url.searchParams.set("quality", quality === "medium" ? "75" : "85");
        url.searchParams.set("format", "webp"); // Use WebP for better compression
      }
      
      return url.toString();
    }

    // For other URLs, return as-is for browser-level optimization
    if (quality === "low") {
      return (
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
        (width || 400) +
        " " +
        (height || 300) +
        '"%3E%3Crect fill="%23f0f0f0" width="100%25" height="100%25"/%3E%3C/svg%3E'
      );
    }

    return originalUrl;
  };

  // Generate URLs
  const placeholderUrl = getOptimizedUrl(src, "low");
  const optimizedUrl = getOptimizedUrl(src, "high", width);

  useEffect(() => {
    // Start with placeholder for non-priority images
    if (!priority) {
      setCurrentSrc(placeholderUrl);
    }

    // Preload high-quality image
    const img = new Image();
    if (optimizedUrl) {
      // For priority images, load directly
      if (priority) {
        img.src = optimizedUrl;
        img.onload = () => {
          setCurrentSrc(optimizedUrl);
          setIsLoaded(true);
          onLoad?.();
        };
      } else {
        // For lazy images, wait a bit before loading
        const timer = setTimeout(() => {
          img.src = optimizedUrl;
        }, 100);

        img.onload = () => {
          setCurrentSrc(optimizedUrl);
          setIsLoaded(true);
          onLoad?.();
        };

        return () => {
          clearTimeout(timer);
          img.onload = null;
          img.onerror = null;
        };
      }

      img.onerror = () => {
        // Fallback to original URL if optimization fails
        setCurrentSrc(src);
        setIsLoaded(true);
        onLoad?.();
      };
    }

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, optimizedUrl, placeholderUrl, priority, onLoad]);

  return (
    <div className={`optimized-image-wrapper ${className}`}>
      <img
        src={currentSrc || undefined}
        alt={alt}
        className={`optimized-image ${isLoaded ? "loaded" : "loading"}`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        sizes={sizes}
        width={width}
        height={height}
        style={{
          maxWidth: width ? `${width}px` : "100%",
          maxHeight: height ? `${height}px` : "auto",
        }}
      />
      {!isLoaded && (
        <div className="image-skeleton">
          <div className="skeleton-shimmer"></div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
