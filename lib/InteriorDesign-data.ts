/**
 * Interior Design Media Library
 * 
 * A comprehensive library of interior design-related images and videos
 * organized by categories for easy access and management.
 * 
 * @module InteriorDesign-data
 */

// ============================================
// Type Definitions
// ============================================

export type InteriorCategory = 
  | 'space-planning'
  | 'color-consultation'
  | 'furniture-selection'
  | 'lighting-design'
  | 'custom-millwork'
  | 'material-selection'
  | 'residential-interior'
  | 'commercial-interior';

export type MediaType = 'image' | 'video';

export type VideoSource = 'youtube' | 'vimeo' | 'local' | 'external';

export interface InteriorImage {
  id: string;
  type: 'image';
  url: string;
  thumbnail?: string;
  alt: string;
  title: string;
  description?: string;
  category: InteriorCategory;
  tags: string[];
  width?: number;
  height?: number;
  featured?: boolean;
  createdAt?: string;
}

export interface InteriorVideo {
  id: string;
  type: 'video';
  url: string;
  thumbnail: string;
  title: string;
  description?: string;
  category: InteriorCategory;
  tags: string[];
  source: VideoSource;
  duration?: string;
  featured?: boolean;
  createdAt?: string;
}

export type InteriorMedia = InteriorImage | InteriorVideo;

// ============================================
// Category Definitions
// ============================================

const categories = {
  'space-planning': {
    name: 'Space Planning',
    description: 'Optimized layouts for flow, functionality, and aesthetics',
    icon: '📐',
  },
  'color-consultation': {
    name: 'Color Consultation',
    description: 'Expert color palettes and mood creation',
    icon: '🎨',
  },
  'furniture-selection': {
    name: 'Furniture Selection',
    description: 'Curated furniture pieces for style and comfort',
    icon: '🛋️',
  },
  'lighting-design': {
    name: 'Lighting Design',
    description: 'Strategic lighting plans for ambiance and functionality',
    icon: '💡',
  },
  'custom-millwork': {
    name: 'Custom Millwork',
    description: 'Bespoke cabinetry and built-ins',
    icon: '🪚',
  },
  'material-selection': {
    name: 'Material & Finish Selection',
    description: 'Premium materials, fabrics, and finishes',
    icon: '✨',
  },
  'residential-interior': {
    name: 'Residential Interior',
    description: 'Home interior design and styling',
    icon: '🏡',
  },
  'commercial-interior': {
    name: 'Commercial Interior',
    description: 'Office and commercial space design',
    icon: '🏢',
  },
};

// ============================================
// Interior Design Images Library
// ============================================

const images: InteriorImage[] = [
  {
    id: 'int-001',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=400&auto=format&fit=crop',
    alt: 'Modern living room interior',
    title: 'Contemporary Living Room Design',
    description: 'Elegant living space with modern furniture and sophisticated color palette',
    category: 'residential-interior',
    tags: ['living-room', 'modern', 'residential', 'furniture'],
    width: 2000,
    height: 1333,
    featured: true,
    createdAt: '2024-01-10',
  },
  {
    id: 'int-002',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2058&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=400&auto=format&fit=crop',
    alt: 'Kitchen interior design',
    title: 'Luxury Kitchen Design',
    description: 'High-end kitchen with custom cabinetry and premium finishes',
    category: 'custom-millwork',
    tags: ['kitchen', 'cabinetry', 'luxury', 'custom'],
    width: 2058,
    height: 1372,
    featured: true,
    createdAt: '2024-01-15',
  },
  {
    id: 'int-003',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=400&auto=format&fit=crop',
    alt: 'Bedroom interior design',
    title: 'Serene Bedroom Design',
    description: 'Peaceful bedroom with carefully selected colors and lighting',
    category: 'color-consultation',
    tags: ['bedroom', 'color', 'serene', 'residential'],
    width: 2053,
    height: 1369,
    featured: true,
    createdAt: '2024-01-20',
  },
  {
    id: 'int-004',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?q=80&w=400&auto=format&fit=crop',
    alt: 'Office interior design',
    title: 'Modern Office Space Design',
    description: 'Productive workspace with optimal lighting and furniture arrangement',
    category: 'commercial-interior',
    tags: ['office', 'commercial', 'workspace', 'modern'],
    width: 2070,
    height: 1380,
    featured: false,
    createdAt: '2024-01-25',
  },
  {
    id: 'int-005',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1931&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=400&auto=format&fit=crop',
    alt: 'Dining room with lighting',
    title: 'Elegant Dining Room Lighting',
    description: 'Sophisticated dining space with strategic lighting design',
    category: 'lighting-design',
    tags: ['dining', 'lighting', 'elegant', 'residential'],
    width: 1931,
    height: 1287,
    featured: true,
    createdAt: '2024-02-01',
  },
  {
    id: 'int-006',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400&auto=format&fit=crop',
    alt: 'Luxury materials and finishes',
    title: 'Premium Material Selection',
    description: 'High-quality materials and finishes for sophisticated interiors',
    category: 'material-selection',
    tags: ['materials', 'finishes', 'premium', 'luxury'],
    width: 2070,
    height: 1380,
    featured: false,
    createdAt: '2024-02-05',
  },
  {
    id: 'int-007',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=400&auto=format&fit=crop',
    alt: 'Furniture showroom',
    title: 'Curated Furniture Collection',
    description: 'Carefully selected furniture pieces for modern interiors',
    category: 'furniture-selection',
    tags: ['furniture', 'curated', 'modern', 'selection'],
    width: 2070,
    height: 1380,
    featured: true,
    createdAt: '2024-02-10',
  },
  {
    id: 'int-008',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=400&auto=format&fit=crop',
    alt: 'Open floor plan design',
    title: 'Optimized Space Planning',
    description: 'Intelligent floor plan maximizing functionality and flow',
    category: 'space-planning',
    tags: ['space-planning', 'layout', 'functionality', 'flow'],
    width: 2070,
    height: 1380,
    featured: false,
    createdAt: '2024-02-15',
  },
];

// ============================================
// Interior Design Videos Library
// ============================================

const videos: InteriorVideo[] = [
  {
    id: 'int-vid-001',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1280&auto=format&fit=crop',
    title: 'Interior Design Process',
    description: 'Complete guide to our interior design process from consultation to completion',
    category: 'space-planning',
    tags: ['process', 'interior', 'design', 'guide'],
    source: 'youtube',
    duration: '14:20',
    featured: true,
    createdAt: '2024-01-12',
  },
  {
    id: 'int-vid-002',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1280&auto=format&fit=crop',
    title: 'Color Theory in Interior Design',
    description: 'Understanding color psychology and creating harmonious color schemes',
    category: 'color-consultation',
    tags: ['color', 'theory', 'psychology', 'schemes'],
    source: 'youtube',
    duration: '11:45',
    featured: true,
    createdAt: '2024-01-18',
  },
  {
    id: 'int-vid-003',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1280&auto=format&fit=crop',
    title: 'Lighting Design Essentials',
    description: 'Mastering ambient, task, and accent lighting for beautiful interiors',
    category: 'lighting-design',
    tags: ['lighting', 'design', 'ambient', 'task'],
    source: 'youtube',
    duration: '9:30',
    featured: false,
    createdAt: '2024-02-08',
  },
];

// ============================================
// Main Library Export
// ============================================

export const interiorDesignMediaLibrary = {
  images,
  videos,
  categories,
};

// ============================================
// Utility Functions
// ============================================

/**
 * Get all media items (images and videos)
 */
export const getAllMedia = (): InteriorMedia[] => {
  return [...images, ...videos];
};

/**
 * Get media by category
 */
export const getMediaByCategory = (
  category: InteriorCategory
): InteriorMedia[] => {
  return getAllMedia().filter((item) => item.category === category);
};

/**
 * Get featured media items
 */
export const getFeaturedMedia = (): InteriorMedia[] => {
  return getAllMedia().filter((item) => item.featured === true);
};

/**
 * Get images only
 */
export const getImages = (): InteriorImage[] => {
  return images;
};

/**
 * Get videos only
 */
export const getVideos = (): InteriorVideo[] => {
  return videos;
};

/**
 * Get media by tags
 */
export const getMediaByTags = (tags: string[]): InteriorMedia[] => {
  return getAllMedia().filter((item) =>
    tags.some((tag) => item.tags.includes(tag))
  );
};

/**
 * Search media by title or description
 */
export const searchMedia = (query: string): InteriorMedia[] => {
  const lowerQuery = query.toLowerCase();
  return getAllMedia().filter(
    (item) =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery) ||
      item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Get media by ID
 */
export const getMediaById = (id: string): InteriorMedia | undefined => {
  return getAllMedia().find((item) => item.id === id);
};

/**
 * Get random media items
 */
export const getRandomMedia = (count: number = 5): InteriorMedia[] => {
  const allMedia = getAllMedia();
  const shuffled = [...allMedia].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

/**
 * Get category information
 */
export const getCategoryInfo = (
  category: InteriorCategory
): { name: string; description: string; icon?: string } => {
  return categories[category];
};

/**
 * Get all categories
 */
export const getAllCategories = (): InteriorCategory[] => {
  return Object.keys(categories) as InteriorCategory[];
};

export default interiorDesignMediaLibrary;

