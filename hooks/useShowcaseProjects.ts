"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Project } from "../types/index";

/**
 * useShowcaseProjects - Hook that fetches projects based on showcase_position
 * Returns projects ordered by showcase_position (1-6)
 */
export const useShowcaseProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShowcaseProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch projects with showcase_position, ordered by position
      const { data, error: fetchError } = await supabase
        .from("projects")
        .select("id, title, description, image, location, category, created_at, updated_at, showcase_position")
        .not("showcase_position", "is", null)
        .order("showcase_position", { ascending: true })
        .limit(6);

      if (fetchError) throw fetchError;

      // Transform database data to match Project type
      const transformedProjects = (data || []).map((project) => ({
        id: project.id,
        title: project.title,
        description: project.description,
        image: project.image,
        location: project.location,
        category: project.category || undefined,
        details: {}, // Empty details for showcase view
        created_at: project.created_at,
        updated_at: project.updated_at,
        showcase_position: project.showcase_position,
      }));

      // Sort by showcase_position to ensure correct order
      transformedProjects.sort((a, b) => (a.showcase_position || 0) - (b.showcase_position || 0));

      // Create array with 6 slots, filling in available projects
      const showcaseArray: (Project | null)[] = new Array(6).fill(null);
      transformedProjects.forEach((project) => {
        const position = project.showcase_position;
        if (position && position >= 1 && position <= 6) {
          showcaseArray[position - 1] = project;
        }
      });

      // Filter out null values and convert to Project array
      const finalProjects = showcaseArray.filter((p): p is Project => p !== null);
      
      setProjects(finalProjects);
    } catch (err) {
      console.error("Error fetching showcase projects:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch showcase projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShowcaseProjects();
  }, [fetchShowcaseProjects]);

  return {
    projects,
    loading,
    error,
    refetch: fetchShowcaseProjects,
  };
};

