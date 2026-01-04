"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiExternalLink } from "react-icons/fi";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../styles/pages/Portfolio.css";
import { supabase } from "../../lib/supabase";
import { projectsCache } from "../../lib/projectsCache";
import OptimizedImage from "../../components/OptimizedImage";
import { useRouter } from "next/navigation";
import Pagination from "../../components/common/Pagination";

const ProjectGrid = ({ projects }) => {
  // Get description snippet for overlay
  const getDescriptionSnippet = (description) => {
    if (!description) return "Innovative architectural solutions";
    return description.length > 80
      ? description.substring(0, 80) + "..."
      : description;
  };

  return (
    <motion.div
      className="projects-grid"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="projects-container">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            className="project-card"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              ease: "easeOut",
            }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{
              y: -10,
              transition: { duration: 0.3 },
            }}
          >
            <div className="project-image-wrapper">
              <OptimizedImage
                src={project.image}
                alt={project.title}
                className="project-image"
                width={400}
                height={300}
                priority={index < 3}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="project-info">
                <h3>{project.title}</h3>
                <p>{getDescriptionSnippet(project.description)}</p>
                <Link
                  href={`/projects/${project.id}`}
                  className="view-link"
                >
                  View Details <FiExternalLink />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const categories = [
  { id: "all", label: "All Projects" },
  { id: "residential", label: "Residential" },
  { id: "commercial", label: "Commercial" },
  { id: "town-houses", label: "Town Houses" },
  { id: "group-dwelling", label: "Group Dwelling" },
];

const CategoryFilter = ({ projects }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedCategory = searchParams.get("category") || "all";
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollTimeout, setScrollTimeout] = useState(null);

  const handleCategoryChange = (categoryId) => {
    router.push(
      categoryId === "all" ? "/projects" : `/projects?category=${categoryId}`
    );
  };

  // Handle scroll behavior - hide on scroll down, show on scroll stop
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const navbarHeight = 80; // Navbar height
      const threshold = navbarHeight + 50; // Show filter after scrolling past navbar

      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // If scrolled past threshold
      if (currentScrollY > threshold) {
        // Scrolling down - hide filter
        if (currentScrollY > lastScrollY) {
          setIsVisible(false);
        } 
        // Scrolling up - show filter
        else if (currentScrollY < lastScrollY) {
          setIsVisible(true);
        }
      } else {
        // Always show when near top
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);

      // Show filter when scrolling stops
      const timeout = setTimeout(() => {
        setIsVisible(true);
      }, 150); // Show after 150ms of no scrolling

      setScrollTimeout(timeout);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [lastScrollY, scrollTimeout]);

  const getSlidesToShow = useCallback(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth <= 480) return Math.min(categories.length, 3);
      if (window.innerWidth <= 768) return Math.min(categories.length, 3);
      if (window.innerWidth <= 1024) return Math.min(categories.length, 3);
      return Math.min(categories.length, 4);
    }
    return Math.min(categories.length, 4);
  }, []);

  const [slidesToShow, setSlidesToShow] = useState(getSlidesToShow());

  useEffect(() => {
    const handleResize = () => {
      setSlidesToShow(getSlidesToShow());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getSlidesToShow]);

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(categories.length, 3),
          arrows: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(categories.length, 3),
          arrows: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: Math.min(categories.length, 3),
          arrows: true,
        },
      },
    ],
  };

  return (
    <motion.div
      className="category-filter"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <motion.div
        className={`filter-tabs sticky-filter ${isVisible ? "visible" : "hidden"}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : -20,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Slider {...sliderSettings}>
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1 + 0.3,
                ease: "easeOut",
              }}
              viewport={{ once: true }}
            >
              <button
                className={`filter-tab ${
                  selectedCategory === category.id ? "active" : ""
                }`}
                onClick={() => handleCategoryChange(category.id)}
                style={{
                  width: "100%",
                  margin: "0 5px",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "25px",
                  backgroundColor:
                    selectedCategory === category.id ? "#007bff" : "#f8f9fa",
                  color: selectedCategory === category.id ? "#fff" : "#333",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category.id) {
                    e.currentTarget.style.backgroundColor = "#e9ecef";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category.id) {
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                  }
                }}
              >
                {category.label}
              </button>
            </motion.div>
          ))}
        </Slider>
      </motion.div>
      <ProjectGrid projects={projects} />
    </motion.div>
  );
};

const Projects = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedCategory = searchParams.get("category") || "all";
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const PROJECTS_PER_PAGE = 12;

  const fetchProjects = useCallback(
    async (page = 1, category = "all") => {
      try {
        setLoading(true);

        const from = (page - 1) * PROJECTS_PER_PAGE;
        const to = from + PROJECTS_PER_PAGE - 1;

        // Filter projects by category if needed
        let filteredProjects = [];
        let totalCount = 0;

        // Try to use cache first
        if (projectsCache.isReady()) {
          const cachedProjects = projectsCache.getProjects();
          filteredProjects = category === "all" 
            ? cachedProjects 
            : cachedProjects.filter((p) => p.category === category);
          totalCount = filteredProjects.length;
        } else {
          // If cache not ready, wait for it or fetch directly
          await projectsCache.prefetchAllProjects();
          
          if (projectsCache.isReady()) {
            const cachedProjects = projectsCache.getProjects();
            filteredProjects = category === "all" 
              ? cachedProjects 
              : cachedProjects.filter((p) => p.category === category);
            totalCount = filteredProjects.length;
          }
        }

        // If we have cached data, use it
        if (filteredProjects.length > 0) {
          const paginatedProjects = filteredProjects.slice(from, to + 1);
          const calculatedTotalPages = Math.ceil(totalCount / PROJECTS_PER_PAGE);
          
          setProjects(paginatedProjects);
          setTotalProjects(totalCount);
          setTotalPages(calculatedTotalPages);
          setError(null);
          setLoading(false);
          return;
        }

        // Fallback to direct query if cache fails
        let query = supabase
          .from("projects")
          .select("id, title, description, status, image, location, category, created_at, updated_at", { count: "exact" })
          .order("created_at", { ascending: false });

        // Apply category filter if needed
        if (category !== "all") {
          query = query.eq("category", category);
        }

        const {
          data,
          error: fetchError,
          count,
        } = await query.range(from, to);

        if (fetchError) throw fetchError;

        // Transform database data to match Project type
        // Note: details are not fetched here to improve performance
        // They will be fetched on-demand when viewing individual project
        const transformedProjects = (data || []).map((project) => ({
          id: project.id,
          title: project.title,
          description: project.description,
          status: project.status,
          image: project.image,
          location: project.location,
          category: project.category || undefined,
          details: {}, // Empty details for list view - fetched on detail page
          created_at: project.created_at,
          updated_at: project.updated_at,
        }));

        const calculatedTotalPages = Math.ceil((count || 0) / PROJECTS_PER_PAGE);

        setProjects(transformedProjects);
        setTotalProjects(count || 0);
        setTotalPages(calculatedTotalPages);
        setError(null);
      } catch (err) {
        console.error("Error fetching projects:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load projects";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Track if we're updating the URL to prevent infinite loops
  const isUpdatingUrl = useRef(false);
  const urlPageParam = searchParams.get("page");

  // Read page from URL on mount and when URL changes (e.g., browser back button)
  useEffect(() => {
    if (isUpdatingUrl.current) {
      isUpdatingUrl.current = false;
      return;
    }
    const urlPage = parseInt(urlPageParam || "1", 10);
    // Only update if URL page is different and valid
    if (urlPage >= 1 && urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
  }, [urlPageParam, currentPage]);

  // Update URL when page changes
  useEffect(() => {
    const currentUrlPage = parseInt(urlPageParam || "1", 10);
    
    // Only update URL if page actually changed
    if (currentUrlPage === currentPage) {
      return;
    }
    
    const params = new URLSearchParams(searchParams.toString());
    if (currentPage === 1) {
      params.delete("page");
    } else {
      params.set("page", currentPage.toString());
    }
    
    isUpdatingUrl.current = true;
    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/projects${newUrl}`, { scroll: false });
  }, [currentPage, router, searchParams, urlPageParam]);

  // Reset to page 1 when category changes (but preserve page if category is the same)
  const prevCategoryRef = useRef(selectedCategory);
  useEffect(() => {
    // Only reset if category actually changed, not on initial load or when coming back
    if (prevCategoryRef.current !== selectedCategory && prevCategoryRef.current !== undefined) {
      setCurrentPage(1);
    }
    prevCategoryRef.current = selectedCategory;
  }, [selectedCategory]);

  useEffect(() => {
    fetchProjects(currentPage, selectedCategory);
  }, [currentPage, selectedCategory, fetchProjects]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of projects section when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <motion.div
        className="projects-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <div className="loading-spinner" style={{ margin: "0 auto" }}></div>
          <p>Loading projects...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="projects-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <p style={{ color: "red" }}>Error: {error}</p>
          <button
            onClick={() => fetchProjects()}
            style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
          >
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="projects-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* <motion.section
        className="headerSliderContainer"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="headerSliderTrack" style={{ height: '40vh' }}>
          <motion.div
            className="headerControls"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <motion.button
              className="headerControlBtn"
              onClick={() => handleNavigation('prev')}
              whileHover={{
                scale: 1.1,
                backgroundColor: "rgba(255, 140, 0, 0.8)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <FiArrowLeft />
            </motion.button>
            <motion.button
              className="headerControlBtn"
              onClick={() => handleNavigation('next')}
              whileHover={{
                scale: 1.1,
                backgroundColor: "rgba(255, 140, 0, 0.8)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <FiArrowRight />
            </motion.button>
          </motion.div>

          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={activeSlide}
              className="headerSlide"
              initial={{ opacity: 0, x: slideDirection === 'next' ? '100%' : '-100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: slideDirection === 'next' ? '-100%' : '100%' }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              <motion.div
                className="headerSlideVisual"
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.img
                  src={featuredProjects[activeSlide].image}
                  alt=""
                  className="headerSlideImg"
                  loading="lazy"
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8 }}
                />
                <motion.span
                  className={`headerStatus ${featuredProjects[activeSlide].status}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  {featuredProjects[activeSlide].status}
                </motion.span>
              </motion.div>

              <motion.div
                className="headerSlideContent"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <motion.h3
                  className="headerSlideTitle"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {featuredProjects[activeSlide].title}
                </motion.h3>
                <motion.p
                  className="headerSlideDesc"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {featuredProjects[activeSlide].description}
                </motion.p>
                <motion.div
                  className="headerSlideMeta"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <span className="headerLocation">📍 {featuredProjects[activeSlide].location}</span>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to={`/projects/${featuredProjects[activeSlide].id}`}
                      className="slide-view-more"
                      state={{ projectData: featuredProjects[activeSlide] }}
                    >
                      View More →
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          className="headerProgress"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          viewport={{ once: true }}
        >
          {featuredProjects.map((_, index) => (
            <motion.button
              key={index}
              className={`headerProgressDot ${index === activeSlide ? 'active' : ''}`}
              onClick={() => setActiveSlide(index)}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1 + 0.9,
                type: "spring",
                stiffness: 200
              }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
            />
          ))}
        </motion.div>
      </motion.section> */}
      <CategoryFilter projects={projects} />

      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          loading={loading}
        />
      )}
    </motion.div>
  );
};

const ProjectsPage = () => {
  return (
    <Suspense fallback={
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <div className="loading-spinner" style={{ margin: "0 auto" }}></div>
        <p>Loading projects...</p>
      </div>
    }>
      <Projects />
    </Suspense>
  );
};

export default ProjectsPage;
