"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "../../components/layout/Navbar";
import { supabase } from "../../lib/supabase";
import { blogCache } from "../../lib/blogCache";
import type { SupabasePost, Profile, SupabaseComment } from "../../types/index";
import {
  Heart,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
} from "lucide-react";
import "../../styles/pages/BlogPage.css";

interface PostWithMeta extends SupabasePost {
  author: Profile | null;
  likesCount: number;
  commentsCount: number;
  userLiked: boolean;
}

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<PostWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setCurrentUser(profile);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Try to use cache first
        if (blogCache.isReady()) {
          const cachedPosts = blogCache.getPosts(20);
          setPosts(cachedPosts);
          setLoading(false);
          return;
        }

        // If cache not ready, wait for it or fetch directly
        await blogCache.prefetchAllPosts();
        
        if (blogCache.isReady()) {
          const cachedPosts = blogCache.getPosts(20);
          setPosts(cachedPosts);
          setLoading(false);
          return;
        }

        // Fallback to direct query if cache fails
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select(
            `
            id, title, content, image_url, video_url, tags, category, user_id, created_at, updated_at,
            profiles: user_id (id, username, full_name, avatar_url)
          `
          )
          .order("created_at", { ascending: false })
          .limit(20);

        if (postsError) throw postsError;

        // Get current user for like status
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // Fetch likes and comments counts for each post in parallel
        const postsWithMeta = await Promise.all(
          (postsData || []).map(async (post) => {
            const [likesResult, commentsResult, likeStatus] = await Promise.all([
              supabase
                .from("likes")
                .select("*", { count: "exact", head: true })
                .eq("post_id", post.id),
              supabase
                .from("comments")
                .select("*", { count: "exact", head: true })
                .eq("post_id", post.id),
              user
                ? supabase
                    .from("likes")
                    .select("id")
                    .eq("post_id", post.id)
                    .eq("user_id", user.id)
                    .maybeSingle()
                : Promise.resolve({ data: null }),
            ]);

            return {
              ...post,
              author: post.profiles || null,
              likesCount: likesResult.count || 0,
              commentsCount: commentsResult.count || 0,
              userLiked: !!likeStatus.data,
            };
          })
        );

        setPosts(postsWithMeta);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleLike = async (postId: string) => {
    if (!currentUser) {
      alert("Please log in to like posts");
      return;
    }

    try {
      const { data: existingLike } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (existingLike) {
        // Unlike
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", currentUser.id);

        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, likesCount: p.likesCount - 1, userLiked: false }
              : p
          )
        );
        
        // Update cache
        if (blogCache.isReady()) {
          const cachedPost = blogCache.getPost(postId);
          if (cachedPost) {
            cachedPost.likesCount = Math.max(0, cachedPost.likesCount - 1);
            cachedPost.userLiked = false;
            blogCache.saveToLocalStorage();
          }
        }
      } else {
        // Like
        await supabase
          .from("likes")
          .insert({ post_id: postId, user_id: currentUser.id });

        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, likesCount: p.likesCount + 1, userLiked: true }
              : p
          )
        );
        
        // Update cache
        if (blogCache.isReady()) {
          const cachedPost = blogCache.getPost(postId);
          if (cachedPost) {
            cachedPost.likesCount = cachedPost.likesCount + 1;
            cachedPost.userLiked = true;
            blogCache.saveToLocalStorage();
          }
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleShare = async (post: PostWithMeta) => {
    const postUrl = `${window.location.origin}/blog/post/${post.id}`;
    const shareData = {
      title: post.title || "Check out this post",
      text: post.content
        ? post.content.substring(0, 150) +
          (post.content.length > 150 ? "..." : "")
        : "Check out this interesting post",
      url: postUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        // The share API doesn't return a result, but if we get here without error, it was successful
        showShareSuccess();
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // User cancelled the share - don't show any message
          return;
        } else {
          console.error("Error sharing:", error);
          // Fallback to clipboard
          await fallbackToClipboard(postUrl);
        }
      }
    } else {
      // Fallback: copy to clipboard
      await fallbackToClipboard(postUrl);
    }
  };

  const showShareSuccess = () => {
    // Create and show a temporary success message
    const successToast = document.createElement("div");
    successToast.className = "share-success-toast";
    successToast.innerHTML = `
      <div class="share-success-content">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 2L11 13"></path>
          <path d="M22 2L15 22 11 13 2 9 22 2Z"></path>
        </svg>
        <span>Post shared successfully!</span>
      </div>
    `;
    document.body.appendChild(successToast);

    // Remove after animation
    setTimeout(() => {
      if (successToast.parentNode) {
        successToast.parentNode.removeChild(successToast);
      }
    }, 3000);
  };

  const fallbackToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showShareSuccess();
      // Also show a more detailed message for clipboard copy
      const clipboardToast = document.createElement("div");
      clipboardToast.className = "share-success-toast clipboard-toast";
      clipboardToast.innerHTML = `
        <div class="share-success-content">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 4h.01"></path>
            <path d="M16 20h.01"></path>
            <path d="M8 8h.01"></path>
            <path d="M8 16h.01"></path>
            <rect x="4" y="4" width="16" height="16" rx="2"></rect>
            <path d="M9 12l2 2 4-4"></path>
          </svg>
          <span>Link copied to clipboard!</span>
        </div>
      `;
      document.body.appendChild(clipboardToast);

      setTimeout(() => {
        if (clipboardToast.parentNode) {
          clipboardToast.parentNode.removeChild(clipboardToast);
        }
      }, 3000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      // Final fallback: show the URL in an alert
      alert(`Share this link: ${url}`);
    }
  };

  return (
    <div className="blog-page">
      <main className="post-content">
        <div className="container">
          <div className="posts-feed">
            {loading ? (
              <div className="loading-spinner"></div>
            ) : posts.length === 0 ? (
              <p className="no-posts">No posts available.</p>
            ) : (
              posts.map((post) => (
                <FacebookPostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onLike={handleLike}
                  onShare={handleShare}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Facebook-style Video Player Component
const FacebookStyleVideoPlayer: React.FC<{
  videoUrl: string;
  poster?: string;
  index: number;
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
        src={videoUrl}
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
            <Play size={60} fill="white" stroke="white" strokeWidth={1} />
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
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <div className="time-display">
            <span className="current-time">{formatTime(currentTime)}</span>
            <span className="time-separator">/</span>
            <span className="duration">{formatTime(duration)}</span>
          </div>

          <button className="control-btn volume" onClick={toggleMute}>
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>

          <button className="control-btn fullscreen" onClick={toggleFullscreen}>
            <Maximize size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Facebook-style Post Card Component
const FacebookPostCard: React.FC<{
  post: PostWithMeta;
  currentUser: Profile | null;
  onLike: (postId: string) => void;
  onShare: (post: PostWithMeta) => void;
}> = ({ post, currentUser, onLike, onShare }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<
    (SupabaseComment & { profiles: Profile | null })[]
  >([]);
  const [commentText, setCommentText] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Parse image URLs from JSON string
  const imageUrls = post.image_url ? JSON.parse(post.image_url) : [];
  const hasMultipleImages = imageUrls.length > 1;

  // Parse video URLs from JSON string or handle single URL string
  const parseVideoUrl = (videoUrl: string | undefined): string[] => {
    if (!videoUrl) return [];
    try {
      // Try to parse as JSON first (new format)
      const parsed = JSON.parse(videoUrl);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      // If parsing fails, treat as single URL string (legacy format)
      return [videoUrl];
    }
  };
  const videoUrls = parseVideoUrl(post.video_url);
  const hasVideos = videoUrls.length > 0;

  // Debug logging for video URLs (removed for production)

  // Check if URL is a direct video file or external video platform
  const isDirectVideoFile = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.toLowerCase();
      return /\.(mp4|webm|ogg|avi|mov|wmv|flv|m4v|3gp)$/i.test(pathname);
    } catch {
      return false;
    }
  };

  // Check if URL is an external video platform (YouTube, Vimeo, etc.)
  const isExternalVideo = (url: string): boolean => {
    if (isDirectVideoFile(url)) return false;
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      return (
        hostname.includes("youtube.com") ||
        hostname.includes("youtu.be") ||
        hostname.includes("vimeo.com") ||
        hostname.includes("dailymotion.com") ||
        hostname.includes("tiktok.com") ||
        hostname.includes("instagram.com") ||
        hostname.includes("facebook.com") ||
        hostname.includes("twitter.com") ||
        hostname.includes("x.com")
      );
    } catch {
      return false;
    }
  };

  // Convert external video URLs to embed format
  const getEmbedUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      // YouTube
      if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
        let videoId = urlObj.searchParams.get("v");

        if (!videoId && hostname.includes("youtu.be")) {
          videoId = urlObj.pathname.split("/").pop() || null;
        } else if (!videoId) {
          // Try to extract from pathname like /watch?v=VIDEO_ID or /embed/VIDEO_ID
          const pathMatch = urlObj.pathname.match(
            /\/(?:watch|embed)\/([^/?]+)/
          );
          if (pathMatch) {
            videoId = pathMatch[1];
          }
        }

        if (videoId) {
          // Add autoplay=0 to prevent autoplay, enablejsapi=1 for better control
          return `https://www.youtube.com/embed/${videoId}?autoplay=0&enablejsapi=1&modestbranding=1&rel=0`;
        }
      }

      // Vimeo
      if (hostname.includes("vimeo.com")) {
        const videoId = urlObj.pathname.split("/").pop();
        if (videoId && /^\d+$/.test(videoId)) {
          return `https://player.vimeo.com/video/${videoId}?autoplay=0`;
        }
      }

      // TikTok
      if (hostname.includes("tiktok.com")) {
        const pathParts = urlObj.pathname.split("/");
        const videoIndex = pathParts.findIndex((part) => part === "video");
        if (videoIndex !== -1 && pathParts[videoIndex + 1]) {
          const videoId = pathParts[videoIndex + 1];
          return `https://www.tiktok.com/embed/${videoId}`;
        }
      }

      // Instagram
      if (hostname.includes("instagram.com")) {
        if (
          urlObj.pathname.includes("/reel/") ||
          urlObj.pathname.includes("/p/")
        ) {
          return `https://www.instagram.com${urlObj.pathname}/embed/`;
        }
      }

      // Facebook
      if (hostname.includes("facebook.com")) {
        if (urlObj.pathname.includes("/videos/")) {
          return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
            url
          )}&show_text=false`;
        }
      }

      // Twitter/X
      if (hostname.includes("twitter.com") || hostname.includes("x.com")) {
        const statusMatch = urlObj.pathname.match(/\/status\/(\d+)/);
        if (statusMatch) {
          const tweetId = statusMatch[1];
          return `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`;
        }
      }

      // DailyMotion
      if (hostname.includes("dailymotion.com")) {
        const videoMatch = urlObj.pathname.match(/\/video\/([a-zA-Z0-9]+)/);
        if (videoMatch) {
          const videoId = videoMatch[1];
          return `https://www.dailymotion.com/embed/video/${videoId}`;
        }
      }

      return "";
    } catch (error) {
      console.error("Error parsing video URL:", url, error);
      return "";
    }
  };

  const fetchComments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          *,
          profiles: user_id (username, full_name, avatar_url)
        `
        )
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }, [post.id]);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, fetchComments]);

  const handleAddComment = async () => {
    if (!currentUser || !commentText.trim()) return;

    try {
      const { error } = await supabase.from("comments").insert({
        post_id: post.id,
        user_id: currentUser.id,
        content: commentText.trim(),
      });

      if (error) throw error;

      setCommentText("");
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + imageUrls.length) % imageUrls.length
    );
  };

  const openImageModal = (index: number = 0) => {
    setModalImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const nextModalImage = () => {
    setModalImageIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const prevModalImage = () => {
    setModalImageIndex(
      (prev) => (prev - 1 + imageUrls.length) % imageUrls.length
    );
  };

  return (
    <article className="facebook-post-card">
      {/* Post Header */}
      <div className="post-header">
        <div className="author-info">
          <div className="author-avatar">
            {post.author?.avatar_url ? (
              <img src={post.author.avatar_url} alt={post.author.username} />
            ) : (
              <User size={32} />
            )}
          </div>
          <div className="author-details">
            <h3 className="author-name">
              {post.author?.full_name || post.author?.username || "Anonymous"}
            </h3>
            <span className="post-time">
              <Clock size={14} />
              {new Date(post.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="post-content">
        {post.title && <h4 className="post-title">{post.title}</h4>}
        <div className="post-text-container">
          <div
            className={`post-text-wrapper ${!isExpanded ? "truncated" : ""}`}
          >
            <p className="post-text">{post.content}</p>
            {!isExpanded && post.content && post.content.length > 100 && (
              <button
                className="read-more-btn"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                Read More
              </button>
            )}
          </div>
          {isExpanded && post.content && post.content.length > 100 && (
            <button
              className="read-more-btn read-less-btn"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              Read Less
            </button>
          )}
        </div>
      </div>

      {/* Media Section */}
      {imageUrls.length > 0 && (
        <div className="post-media">
          <div className="media-container">
            <img
              src={imageUrls[currentImageIndex]}
              alt={`Post media ${currentImageIndex + 1}`}
              className="post-media-image"
              onClick={() => openImageModal(currentImageIndex)}
              style={{ cursor: "pointer" }}
            />

            {hasMultipleImages && (
              <>
                {/* Navigation Arrows */}
                <button className="media-nav prev" onClick={prevImage}>
                  <ChevronLeft size={24} />
                </button>
                <button className="media-nav next" onClick={nextImage}>
                  <ChevronRight size={24} />
                </button>

                {/* Image Indicators */}
                <div className="image-indicators">
                  {imageUrls.map((_: string, index: number) => (
                    <button
                      key={index}
                      className={`indicator ${
                        index === currentImageIndex ? "active" : ""
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>

                {/* Image Counter */}
                <div className="image-counter">
                  {currentImageIndex + 1} / {imageUrls.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Video Section */}
      {hasVideos && (
        <div className="post-media">
          {videoUrls.map((videoUrl, index) => {
            const isDirectVideo = isDirectVideoFile(videoUrl);
            const isExternal = isExternalVideo(videoUrl);
            const embedUrl = isExternal ? getEmbedUrl(videoUrl) : "";

            return (
              <div key={index} className="post-video-container">
                {isDirectVideo ? (
                  <FacebookStyleVideoPlayer
                    videoUrl={videoUrl}
                    poster={imageUrls.length > 0 ? imageUrls[0] : undefined}
                    index={index}
                  />
                ) : embedUrl ? (
                  <div className="external-video-wrapper">
                    <iframe
                      src={embedUrl}
                      className="post-media-video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`Video ${index + 1}`}
                      onLoad={() => {}}
                      onError={(e) =>
                        console.error("External video iframe error:", e)
                      }
                    />
                    {/* Debug info */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "5px",
                        right: "5px",
                        background: "rgba(0,0,0,0.7)",
                        color: "white",
                        padding: "2px 6px",
                        borderRadius: "3px",
                        fontSize: "10px",
                        zIndex: 10,
                      }}
                    >
                      External Video
                    </div>
                  </div>
                ) : (
                  <div className="video-error">
                    Unable to load video. Unsupported URL format.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tags Section */}
      {post.tags && post.tags.length > 0 && (
        <div className="post-tags">
          {post.tags.map((tag: string, index: number) => (
            <span key={index} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Post Stats */}
      <div className="post-stats">
        <div className="stats-info">
          {post.likesCount > 0 && (
            <span className="likes-count">
              <Heart size={16} fill="currentColor" />
              {post.likesCount}
            </span>
          )}
          {currentUser && post.commentsCount > 0 && (
            <span
              className="comments-count"
              onClick={() => setShowComments(!showComments)}
            >
              {post.commentsCount} comments
            </span>
          )}
          {!currentUser && post.commentsCount > 0 && (
            <span className="comments-count disabled">
              {post.commentsCount} comments
            </span>
          )}
        </div>
      </div>

      {/* Post Actions */}
      <div className="post-actions">
        <button
          className={`action-btn like ${post.userLiked ? "liked" : ""}`}
          onClick={() => onLike(post.id)}
        >
          <Heart size={18} fill={post.userLiked ? "currentColor" : "none"} />
          Like
        </button>
        {currentUser ? (
          <button
            className="action-btn comment"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle size={18} />
            Comment
          </button>
        ) : (
          <button
            className="action-btn comment disabled"
            onClick={() => alert("Please log in to view comments")}
          >
            <MessageCircle size={18} />
            Comment
          </button>
        )}
        <button className="action-btn share" onClick={() => onShare(post)}>
          <Share2 size={18} />
          Share
        </button>
      </div>

      {/* Comments Section */}
      {showComments && currentUser && (
        <div className="comments-section">
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-avatar">
                  {comment.profiles?.avatar_url ? (
                    <img
                      src={comment.profiles.avatar_url}
                      alt={comment.profiles.username}
                    />
                  ) : (
                    <User size={24} />
                  )}
                </div>
                <div className="comment-content">
                  <div className="comment-bubble">
                    <strong>
                      {comment.profiles?.full_name ||
                        comment.profiles?.username ||
                        "Anonymous"}
                    </strong>
                    <p>{comment.content}</p>
                  </div>
                  <span className="comment-time">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="add-comment">
            <div className="comment-avatar">
              {currentUser.avatar_url ? (
                <img src={currentUser.avatar_url} alt={currentUser.username} />
              ) : (
                <User size={24} />
              )}
            </div>
            <div className="comment-input-container">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="post-comment-btn"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close-btn" onClick={closeImageModal}>
              ×
            </button>

            <div className="modal-image-container">
              <img
                src={imageUrls[modalImageIndex]}
                alt={`Modal image ${modalImageIndex + 1}`}
                className="modal-image"
              />

              {imageUrls.length > 1 && (
                <>
                  <button className="modal-nav prev" onClick={prevModalImage}>
                    ‹
                  </button>
                  <button className="modal-nav next" onClick={nextModalImage}>
                    ›
                  </button>

                  <div className="modal-indicators">
                    {imageUrls.map((_: string, index: number) => (
                      <button
                        key={index}
                        className={`modal-indicator ${
                          index === modalImageIndex ? "active" : ""
                        }`}
                        onClick={() => setModalImageIndex(index)}
                      />
                    ))}
                  </div>

                  <div className="modal-counter">
                    {modalImageIndex + 1} / {imageUrls.length}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default BlogPage;
