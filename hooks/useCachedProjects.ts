"use client";

import { useState, useEffect, useCallback } from "react";
import { projectsCache } from "../lib/projectsCache";
import type { Project } from "../types/index";

/**
 * useCachedProjects - Hook that uses prefetched projects from cache
 * Falls back to direct fetch if cache is not ready yet
 */
export const useCachedProjects = (limit: number = 6) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if cache is ready
      if (projectsCache.isReady()) {
        // Use cached data
        const cachedProjects = projectsCache.getProjects();
        const limitedProjects = cachedProjects.slice(0, limit);
        setProjects(limitedProjects);
        setLoading(false);
        return;
      }

      // If cache is not ready, wait for it or fetch directly
      await projectsCache.prefetchAllProjects();
      
      if (projectsCache.isReady()) {
        const cachedProjects = projectsCache.getProjects();
        const limitedProjects = cachedProjects.slice(0, limit);
        setProjects(limitedProjects);
      } else {
        throw new Error("Failed to load projects");
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
  };
};
