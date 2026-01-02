// Projects Cache - In-memory cache for prefetched projects with localStorage persistence
import type { Project } from "../types/index";

interface CachedData {
  projects: Project[];
  details: Record<string, Project["details"]>;
  timestamp: number;
  version: string;
}

class ProjectsCache {
  private projects: Project[] = [];
  private detailsCache: Map<string, Project["details"]> = new Map();
  private isLoading = false;
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;
  private readonly CACHE_KEY = "efie_projects_cache";
  private readonly CACHE_VERSION = "1.0";
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private imagePreloadQueue: string[] = [];
  private preloadedImages = new Set<string>();

  async prefetchAllProjects() {
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
    this.loadPromise = this._loadAllProjects();
    
    try {
      await this.loadPromise;
      this.isLoaded = true;
      this._saveToLocalStorage();
    } catch (error) {
      console.error("Error prefetching projects:", error);
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

      const data: CachedData = JSON.parse(cached);
      
      // Check if cache is valid and not expired
      const age = Date.now() - data.timestamp;
      if (age > this.CACHE_DURATION || data.version !== this.CACHE_VERSION) {
        localStorage.removeItem(this.CACHE_KEY);
        return false;
      }

      // Restore from cache
      this.projects = data.projects;
      this.detailsCache = new Map(Object.entries(data.details));
      
      // Preload images from cache
      this._preloadImages();
      
      console.log("✅ Loaded projects from localStorage cache");
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
      const data: CachedData = {
        projects: this.projects,
        details: Object.fromEntries(this.detailsCache),
        timestamp: Date.now(),
        version: this.CACHE_VERSION,
      };
      
      const jsonString = JSON.stringify(data);
      
      // Compress data if it's too large (localStorage has ~5-10MB limit)
      // For very large datasets, we could use compression, but for now just check size
      const sizeInMB = new Blob([jsonString]).size / (1024 * 1024);
      
      if (sizeInMB > 4) {
        console.warn("Cache data is large, consider optimizing");
        // Only save essential data if too large
        const essentialData: CachedData = {
          projects: this.projects.map(p => ({
            ...p,
            description: p.description.substring(0, 200), // Truncate long descriptions
          })),
          details: Object.fromEntries(this.detailsCache),
          timestamp: Date.now(),
          version: this.CACHE_VERSION,
        };
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(essentialData));
      } else {
        localStorage.setItem(this.CACHE_KEY, jsonString);
      }
      
      console.log("✅ Saved projects to localStorage cache");
    } catch (error) {
      // If quota exceeded, try to clear old cache and retry
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        console.warn("localStorage quota exceeded, clearing old cache");
        try {
          localStorage.clear();
          const data: CachedData = {
            projects: this.projects,
            details: Object.fromEntries(this.detailsCache),
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
        await this._loadAllProjects();
        this._saveToLocalStorage();
      } catch (error) {
        console.error("Background refresh failed:", error);
      }
    }, 1000);
  }

  private async _loadAllProjects() {
    const { supabase } = await import("./supabase");
    
    // Parallel fetching: Fetch projects and details simultaneously
    const [projectsResult, detailsResult] = await Promise.all([
      // Fetch all projects with basic info
      supabase
        .from("projects")
        .select("id, title, description, status, image, location, category, created_at, updated_at")
        .order("created_at", { ascending: false }),
      
      // Fetch all details in parallel
      supabase
        .from("projects")
        .select("id, details")
        .order("created_at", { ascending: false }),
    ]);

    if (projectsResult.error) {
      throw projectsResult.error;
    }

    // Transform and cache projects
    this.projects = (projectsResult.data || []).map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status as "completed" | "ongoing",
      image: project.image,
      location: project.location,
      category: project.category || undefined,
      details: {}, // Will be populated from detailsResult
      created_at: project.created_at,
      updated_at: project.updated_at,
      created_by: undefined,
    }));

    // Cache details
    if (!detailsResult.error && detailsResult.data) {
      detailsResult.data.forEach((project) => {
        if (project.details) {
          this.detailsCache.set(project.id, project.details as Project["details"]);
        }
      });
    }
    
    // Start aggressive image preloading
    this._preloadImagesAggressively();
  }

  private _preloadImages() {
    // Preload images from cache (called when loading from localStorage)
    this.projects.forEach((project) => {
      if (project.image && !this.preloadedImages.has(project.image)) {
        this._preloadSingleImage(project.image);
      }
    });
  }

  private _preloadImagesAggressively() {
    // Aggressive parallel image preloading with priority queue
    const imageUrls: string[] = [];
    const priorityUrls: string[] = []; // First 6 images (above the fold)
    
    this.projects.forEach((project, index) => {
      if (project.image && !this.preloadedImages.has(project.image)) {
        // Prioritize first 6 images (likely to be visible immediately)
        if (index < 6) {
          priorityUrls.push(project.image);
        } else {
          imageUrls.push(project.image);
        }
        
        // For Supabase URLs, also queue optimized versions
        if (project.image.includes("supabase.co/storage")) {
          try {
            const url = new URL(project.image);
            url.searchParams.set("width", "800");
            url.searchParams.set("quality", "75");
            url.searchParams.set("format", "webp");
            const optimizedUrl = url.toString();
            
            if (index < 6) {
              priorityUrls.push(optimizedUrl);
            } else {
              imageUrls.push(optimizedUrl);
            }
          } catch (e) {
            // Ignore URL parsing errors
          }
        }
      }
    });

    // Immediately preload priority images (above the fold)
    priorityUrls.forEach((url) => this._preloadSingleImage(url));

    // Preload remaining images in batches using requestIdleCallback for non-blocking
    const batchSize = 15; // Larger batches for better performance
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
        }, i * 5); // Faster staggering
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
    
    // Strategy 3: Image object for immediate loading (works in parallel with prefetch)
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

  getProjects(): Project[] {
    return this.projects.map((project) => ({
      ...project,
      details: this.detailsCache.get(project.id) || project.details,
    }));
  }

  getProject(id: string): Project | undefined {
    const project = this.projects.find((p) => p.id === id);
    if (!project) return undefined;

    return {
      ...project,
      details: this.detailsCache.get(id) || project.details,
    };
  }

  getProjectsByCategory(category: string): Project[] {
    if (category === "all") {
      return this.getProjects();
    }
    return this.getProjects().filter((p) => p.category === category);
  }

  getCount(): number {
    return this.projects.length;
  }

  isReady(): boolean {
    return this.isLoaded;
  }

  clear() {
    this.projects = [];
    this.detailsCache.clear();
    this.isLoaded = false;
    this.isLoading = false;
    this.loadPromise = null;
  }
}

// Singleton instance
export const projectsCache = new ProjectsCache();

