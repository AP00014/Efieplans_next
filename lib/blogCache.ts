// Blog Cache - In-memory cache for prefetched blog posts with localStorage persistence
import type { SupabasePost, Profile } from "../types/index";

interface PostWithMeta extends SupabasePost {
  author: Profile | null;
  likesCount: number;
  commentsCount: number;
  userLiked: boolean;
}

interface CachedBlogData {
  posts: PostWithMeta[];
  timestamp: number;
  version: string;
}

class BlogCache {
  private posts: PostWithMeta[] = [];
  private isLoading = false;
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;
  private readonly CACHE_KEY = "efie_blog_cache";
  private readonly CACHE_VERSION = "1.0";
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private imagePreloadQueue: string[] = [];
  private preloadedImages = new Set<string>();

  async prefetchAllPosts() {
    // If already loading, return the existing promise
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // If already loaded, return immediately
    if (this.isLoaded) {
      return Promise.resolve();
    }

    // Try to load from localStorage first (instant)
    if (this._loadFromLocalStorage()) {
      this.isLoaded = true;
      // Refresh in background without blocking
      this._refreshInBackground();
      return Promise.resolve();
    }

    // If currently loading, wait for it
    if (this.isLoading) {
      return this.loadPromise;
    }

    this.isLoading = true;
    this.loadPromise = this._loadAllPosts();
    
    try {
      await this.loadPromise;
      this.isLoaded = true;
      this._saveToLocalStorage();
    } catch (error) {
      console.error("Error prefetching blog posts:", error);
    } finally {
      this.isLoading = false;
      this.loadPromise = null;
    }
  }

  private _loadFromLocalStorage(): boolean {
    if (typeof window === "undefined") return false;
    
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return false;

      const data: CachedBlogData = JSON.parse(cached);
      
      // Check if cache is valid and not expired
      const age = Date.now() - data.timestamp;
      if (age > this.CACHE_DURATION || data.version !== this.CACHE_VERSION) {
        localStorage.removeItem(this.CACHE_KEY);
        return false;
      }

      // Restore from cache
      this.posts = data.posts;
      
      // Preload images from cache
      this._preloadImages();
      
      console.log("✅ Loaded blog posts from localStorage cache");
      return true;
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      localStorage.removeItem(this.CACHE_KEY);
      return false;
    }
  }

  private _saveToLocalStorage() {
    if (typeof window === "undefined") return;
    
    try {
      const data: CachedBlogData = {
        posts: this.posts,
        timestamp: Date.now(),
        version: this.CACHE_VERSION,
      };
      
      const jsonString = JSON.stringify(data);
      const sizeInMB = new Blob([jsonString]).size / (1024 * 1024);
      
      if (sizeInMB > 4) {
        console.warn("Blog cache data is large, consider optimizing");
        // Only save essential data if too large
        const essentialData: CachedBlogData = {
          posts: this.posts.map(p => ({
            ...p,
            content: p.content ? p.content.substring(0, 500) : p.content, // Truncate long content
          })),
          timestamp: Date.now(),
          version: this.CACHE_VERSION,
        };
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(essentialData));
      } else {
        localStorage.setItem(this.CACHE_KEY, jsonString);
      }
      
      console.log("✅ Saved blog posts to localStorage cache");
    } catch (error) {
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        console.warn("localStorage quota exceeded, clearing old cache");
        try {
          localStorage.removeItem(this.CACHE_KEY);
          const data: CachedBlogData = {
            posts: this.posts,
            timestamp: Date.now(),
            version: this.CACHE_VERSION,
          };
          localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
        } catch (retryError) {
          console.error("Error saving to localStorage after clear:", retryError);
        }
      } else {
        console.error("Error saving to localStorage:", error);
      }
    }
  }

  private async _refreshInBackground() {
    // Refresh cache in background without blocking
    setTimeout(async () => {
      try {
        await this._loadAllPosts();
        this._saveToLocalStorage();
      } catch (error) {
        console.error("Background refresh failed:", error);
      }
    }, 1000);
  }

  private async _loadAllPosts() {
    const { supabase } = await import("./supabase");
    
    // Get current user for like status
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Optimized parallel fetching: Fetch posts, likes, and comments counts
    const { data: postsData, error: postsError } = await supabase
      .from("posts")
      .select(
        "id, title, content, image_url, video_url, tags, category, user_id, created_at, updated_at, profiles:user_id(id, username, full_name, avatar_url)"
      )
      .order("created_at", { ascending: false })
      .limit(50); // Limit to 50 posts for performance

    if (postsError) {
      throw postsError;
    }

    // Fetch all likes and comments counts in parallel for all posts
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
        } as PostWithMeta;
      })
    );

    this.posts = postsWithMeta;
    
    // Start aggressive image preloading
    this._preloadImagesAggressively();
  }

  private _preloadImages() {
    // Preload images from cache (called when loading from localStorage)
    this.posts.forEach((post) => {
      if (post.image_url) {
        try {
          const imageUrls = JSON.parse(post.image_url);
          if (Array.isArray(imageUrls)) {
            imageUrls.forEach((url: string) => {
              if (url && !this.preloadedImages.has(url)) {
                this._preloadSingleImage(url);
              }
            });
          }
        } catch {
          // If not JSON, treat as single URL
          if (!this.preloadedImages.has(post.image_url)) {
            this._preloadSingleImage(post.image_url);
          }
        }
      }
    });
  }

  private _preloadImagesAggressively() {
    // Aggressive parallel image preloading with priority queue
    const imageUrls: string[] = [];
    const priorityUrls: string[] = []; // First 10 images (above the fold)
    
    this.posts.forEach((post, index) => {
      if (post.image_url) {
        try {
          const parsedUrls = JSON.parse(post.image_url);
          const imageUrlsArray = Array.isArray(parsedUrls) ? parsedUrls : [parsedUrls];
          
          imageUrlsArray.forEach((url: string) => {
            if (url && !this.preloadedImages.has(url)) {
              if (index < 5) {
                priorityUrls.push(url);
              } else {
                imageUrls.push(url);
              }
            }
          });
        } catch {
          // If not JSON, treat as single URL
          if (post.image_url && !this.preloadedImages.has(post.image_url)) {
            if (index < 5) {
              priorityUrls.push(post.image_url);
            } else {
              imageUrls.push(post.image_url);
            }
          }
        }
      }
    });

    // Immediately preload priority images (above the fold)
    priorityUrls.forEach((url) => this._preloadSingleImage(url));

    // Preload remaining images in batches using requestIdleCallback for non-blocking
    const batchSize = 15;
    for (let i = 0; i < imageUrls.length; i += batchSize) {
      const batch = imageUrls.slice(i, i + batchSize);
      
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        requestIdleCallback(() => {
          batch.forEach((url) => this._preloadSingleImage(url));
        }, { timeout: 5000 });
      } else {
        // Fallback: stagger batches
        setTimeout(() => {
          batch.forEach((url) => this._preloadSingleImage(url));
        }, i * 5);
      }
    }
  }

  private _preloadSingleImage(url: string) {
    if (this.preloadedImages.has(url)) return;
    
    this.preloadedImages.add(url);
    
    // Use multiple preloading strategies for maximum browser optimization
    if (typeof document !== "undefined") {
      // Strategy 1: Link prefetch (browser-level optimization)
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "image";
      link.href = url;
      if ("fetchPriority" in link) {
        (link as any).fetchPriority = "high";
      }
      document.head.appendChild(link);
      
      // Strategy 2: Preload for critical images (first 12)
      if (this.preloadedImages.size <= 12) {
        const preloadLink = document.createElement("link");
        preloadLink.rel = "preload";
        preloadLink.as = "image";
        preloadLink.href = url;
        if ("fetchPriority" in preloadLink) {
          (preloadLink as any).fetchPriority = "high";
        }
        document.head.appendChild(preloadLink);
      }
    }
    
    // Strategy 3: Image object for immediate loading
    const img = new Image();
    img.src = url;
    img.loading = "eager";
    if ("fetchPriority" in img) {
      (img as any).fetchPriority = "high";
    }
    
    // Pre-decode image for faster rendering
    if ("decode" in img) {
      img.decode().catch(() => {
        // Ignore decode errors
      });
    }
  }

  getPosts(limit?: number): PostWithMeta[] {
    if (limit) {
      return this.posts.slice(0, limit);
    }
    return this.posts;
  }

  getPost(id: string): PostWithMeta | undefined {
    return this.posts.find((p) => p.id === id);
  }

  getCount(): number {
    return this.posts.length;
  }

  // Public method to save cache (for external updates)
  saveToLocalStorage() {
    this._saveToLocalStorage();
  }

  isReady(): boolean {
    return this.isLoaded;
  }

  clear() {
    this.posts = [];
    this.isLoaded = false;
    this.isLoading = false;
    this.loadPromise = null;
    this.preloadedImages.clear();
    this.imagePreloadQueue = [];
    
    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.CACHE_KEY);
    }
  }

  // Force refresh cache
  async refresh() {
    this.clear();
    await this.prefetchAllPosts();
  }
}

// Singleton instance
export const blogCache = new BlogCache();

