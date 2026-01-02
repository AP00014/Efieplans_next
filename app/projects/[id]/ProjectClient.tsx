"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  FaPlay,
  FaPause,
  FaArrowLeft,
  FaImages,
  FaVideo,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
} from "react-icons/fa";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import "../../../styles/pages/ProjectDetail.css";
import { supabase } from "../../../lib/supabase";
import { projectsCache } from "../../../lib/projectsCache";
import type { MediaItem, VideoSource } from "../../../types";
import type { Project } from "../../../types/index";
import OptimizedImage from "../../../components/OptimizedImage";

// Import FacebookStyleVideoPlayer from BlogPage
const FacebookStyleVideoPlayer: React.FC<{
  videoUrl: string;
  poster?: string;
}> = ({ videoUrl, poster }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setShowControls(true);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        // Try to play with user interaction
        await video.play();
        setIsPlaying(true);
        setShowControls(true);

        // Auto-hide controls after 3 seconds when playing
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Video play failed:", error);
      // If autoplay fails, try with muted
      if (!isMuted) {
        video.muted = true;
        setIsMuted(true);
        try {
          await video.play();
          setIsPlaying(true);
          setShowControls(true);
        } catch (retryError) {
          console.error("Video play retry failed:", retryError);
        }
      }
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={containerRef}
      className="facebook-video-player"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        if (isPlaying && controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        if (!isPlaying) {
          setShowControls(false);
        }
      }}
      onClick={(e) => {
        // Only show controls if clicking on the video area, not on controls
        if (e.target === e.currentTarget || e.target === videoRef.current) {
          setShowControls(true);
        }
      }}
    >
      <video
        ref={videoRef}
        src={videoUrl || undefined}
        poster={poster}
        preload="metadata"
        playsInline
        muted={isMuted}
        crossOrigin="anonymous"
        className="facebook-video-element"
        onError={(e) => {
          console.error("Video load error:", videoUrl, e);
          // Try to reload with different CORS settings
          const video = e.currentTarget;
          if (video.src !== videoUrl) {
            video.src = videoUrl;
            video.load();
          }
        }}
      />

      {/* Play Button Overlay */}
      {!isPlaying && (
        <div className="video-play-overlay" onClick={togglePlay}>
          <div className="play-button">
            <FaPlay size={60} fill="white" stroke="white" strokeWidth={1} />
          </div>
        </div>
      )}

      {/* Video Controls */}
      <div className={`video-controls ${showControls ? "visible" : ""}`}>
        {/* Progress Bar */}
        <div className="progress-container" onClick={handleProgressClick}>
          <div
            className="progress-bar"
            style={{
              width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
            }}
          />
          <div className="progress-background" />
        </div>

        {/* Control Buttons */}
        <div className="control-buttons">
          <button className="control-btn play-pause" onClick={togglePlay}>
            {isPlaying ? <FaPause size={24} /> : <FaPlay size={24} />}
          </button>

          <div className="time-display">
            <span className="current-time">{formatTime(currentTime)}</span>
            <span className="time-separator">/</span>
            <span className="duration">{formatTime(duration)}</span>
          </div>

          <button className="control-btn volume" onClick={toggleMute}>
            {isMuted ? <FaVolumeMute size={24} /> : <FaVolumeUp size={24} />}
          </button>

          <button className="control-btn fullscreen" onClick={toggleFullscreen}>
            <FaExpand size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

const MediaGrid = ({
  items,
  mediaType,
}: {
  items: (MediaItem | VideoSource)[];
  mediaType: "image" | "video";
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="media-grid">
      {items.map((item, index) => (
        <div
          key={index}
          className="media-thumbnail"
          onClick={() => {
            setSelectedIndex(index);
            setShowModal(true);
          }}
        >
          {mediaType === "video" && (
            <div className="video-overlay">
              <FaPlay className="play-icon" />
            </div>
          )}
          <OptimizedImage
            src={item.thumbnail}
            alt={`${mediaType} thumbnail ${index + 1}`}
            className="thumbnail-img"
            width={400}
            height={300}
          />
        </div>
      ))}

      {showModal && (
        <div className="media-modal">
          <button className="close-button" onClick={() => setShowModal(false)}>
            &times;
          </button>

          {mediaType === "image" ? (
            <ImageGallery
              items={(items as MediaItem[]).map((item) => ({
                original: item.url,
                thumbnail: item.thumbnail,
              }))}
              startIndex={selectedIndex}
              showPlayButton={false}
              showFullscreenButton={true}
              lazyLoad={true}
            />
          ) : (
            items[selectedIndex] &&
            "type" in items[selectedIndex] &&
            ((items[selectedIndex] as VideoSource).type === "local" ? (
              <FacebookStyleVideoPlayer
                videoUrl={items[selectedIndex].url}
                poster={items[selectedIndex].thumbnail}
              />
            ) : (
              <iframe
                className="external-video"
                src={items[selectedIndex].url || undefined}
                title="Video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

const ProjectDetail = () => {
  const { id } = useParams() as { id: string };
  const [activeTab, setActiveTab] = useState<"images" | "videos">("images");
  const [isSticky, setIsSticky] = useState(false);
  const [item, setItem] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mediaSectionRef = useRef<HTMLElement>(null);

  // Handle sticky tabs when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (mediaSectionRef.current) {
        const rect = mediaSectionRef.current.getBoundingClientRect();
        const navbarHeight = 80; // Default navbar height
        setIsSticky(rect.top <= navbarHeight);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch project from database or cache
  useEffect(() => {
    if (!id) {
      setError("Project ID is missing");
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      try {
        setLoading(true);
        
        // Try to get from cache first
        if (projectsCache.isReady()) {
          const cachedProject = projectsCache.getProject(id);
          if (cachedProject) {
            setItem(cachedProject);
            setError(null);
            setLoading(false);
            return;
          }
        }

        // If not in cache, wait for cache or fetch directly
        await projectsCache.prefetchAllProjects();
        
        if (projectsCache.isReady()) {
          const cachedProject = projectsCache.getProject(id);
          if (cachedProject) {
            setItem(cachedProject);
            setError(null);
            setLoading(false);
            return;
          }
        }

        // Fallback to direct query if not in cache
        const { data, error: fetchError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;

        if (!data) {
          setError("Project not found");
          setLoading(false);
          return;
        }

        // Transform database data to match Project type
        const transformedProject: Project = {
          id: data.id,
          title: data.title,
          description: data.description,
          status: data.status as "completed" | "ongoing",
          image: data.image,
          location: data.location,
          category: data.category || undefined,
          details: data.details || {
            timeline: undefined,
            materials: undefined,
            features: undefined,
            imageGallery: undefined,
            blueprints: undefined,
            videos: undefined,
            virtualTour: undefined,
          },
          created_at: data.created_at,
          updated_at: data.updated_at,
          created_by: data.created_by,
        };

        setItem(transformedProject);
        setError(null);
      } catch (err: unknown) {
        console.error("Error fetching project:", err);
        setError(err instanceof Error ? err.message : "Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="error-state">
        <div className="loading-spinner"></div>
        <p>Loading project...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="error-state">
        <h2>{error || "Project Not Found"}</h2>
        <Link href="/projects" className="back-button">
          <FaArrowLeft /> Return to Projects
        </Link>
      </div>
    );
  }

  // Normalize media data
  const normalizeMedia = (urls?: string[]): MediaItem[] =>
    (urls || []).map((url) => ({ url, thumbnail: url }));

  const imageGallery = normalizeMedia(item.details.imageGallery);
  const videos = item.details.videos || [];

  return (
    <div className="project-detail">
      {/* Hero Section with Background Image */}
      <section
        className="project-hero"
        style={{
          backgroundImage: `url(${item.image})`,
          backgroundSize: "auto 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="hero-overlay">
          <div className="hero-content-wrapper">
            <div className="hero-text-content">
              <h1 className="hero-title">{item.title}</h1>
              <div className="meta-info">
                {item.category && (
                  <span className="category">{item.category}</span>
                )}
                <span className={`status ${item.status}`}>
                  {item.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="project-content">
        <section className="content-section">
          <h2>Project Overview</h2>
          <div className="project-description">
            <p>{item.description}</p>
          </div>

          {/* Location Section */}
          <div className="specs-section">
            <h3 className="section-subtitle">Project Location</h3>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="label">Location</span>
                <span className="value">{item.location}</span>
              </div>
            </div>
          </div>

          {/* Features Section */}
          {item.details.features && item.details.features.length > 0 && (
            <div className="features-section">
              <h3 className="section-subtitle">Project Features</h3>
              <div className="features-grid">
                {item.details.features.map((feature, i) => (
                  <div key={i} className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {(imageGallery.length > 0 || videos.length > 0) && (
          <section className="media-section" ref={mediaSectionRef}>
            <h2>Project Gallery</h2>

            {/* Tab Navigation */}
            <div className={`media-tabs ${isSticky ? "sticky" : ""}`}>
              <button
                className={`media-tab ${
                  activeTab === "images" ? "active" : ""
                }`}
                onClick={() => setActiveTab("images")}
                disabled={imageGallery.length === 0}
              >
                <FaImages className="tab-icon" />
                Images ({imageGallery.length})
              </button>
              <button
                className={`media-tab ${
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
            <div className="media-tab-content">
              {activeTab === "images" && imageGallery.length > 0 && (
                <MediaGrid items={imageGallery} mediaType="image" />
              )}
              {activeTab === "videos" && videos.length > 0 && (
                <MediaGrid items={videos} mediaType="video" />
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ProjectDetail;
