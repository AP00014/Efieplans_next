/**
 * Design Media Library
 * 
 * A comprehensive library of architectural design-related images and videos
 * organized by categories for easy access and management.
 * 
 * @module Design-data
 */

// ============================================
// Type Definitions
// ============================================

export type DesignCategory = 
  | 'conceptual'
  | 'visualization'
  | 'documentation'
  | 'landscape'
  | 'sustainable'
  | 'residential-design'
  | 'commercial-design'
  | '3d-modeling';

export type MediaType = 'image' | 'video';

export type VideoSource = 'youtube' | 'vimeo' | 'local' | 'external';

export interface DesignImage {
  id: string;
  type: 'image';
  url: string;
  thumbnail?: string;
  alt: string;
  title: string;
  description?: string;
  category: DesignCategory;
  tags: string[];
  width?: number;
  height?: number;
  featured?: boolean;
  createdAt?: string;
}

export interface DesignVideo {
  id: string;
  type: 'video';
  url: string;
  thumbnail: string;
  title: string;
  description?: string;
  category: DesignCategory;
  tags: string[];
  source: VideoSource;
  duration?: string;
  featured?: boolean;
  createdAt?: string;
}

export type DesignMedia = DesignImage | DesignVideo;

// ============================================
// Category Definitions
// ============================================

const categories = {
  conceptual: {
    name: 'Conceptual Design',
    description: 'Initial design concepts, sketches, and mood boards',
    icon: '✏️',
  },
  visualization: {
    name: '3D Visualization',
    description: 'Photorealistic renderings and visualizations',
    icon: '🎨',
  },
  documentation: {
    name: 'Construction Documentation',
    description: 'Technical drawings, blueprints, and specifications',
    icon: '📐',
  },
  landscape: {
    name: 'Landscape Architecture',
    description: 'Outdoor spaces and landscape design',
    icon: '🌳',
  },
  sustainable: {
    name: 'Sustainable Design',
    description: 'Eco-friendly and green building designs',
    icon: '🌱',
  },
  'residential-design': {
    name: 'Residential Design',
    description: 'Homes and residential architectural designs',
    icon: '🏠',
  },
  'commercial-design': {
    name: 'Commercial Design',
    description: 'Office buildings and commercial facilities',
    icon: '🏢',
  },
  '3d-modeling': {
    name: '3D Modeling',
    description: '3D models and BIM designs',
    icon: '💻',
  },
};

// ============================================
// Design Images Library
// ============================================

const images: DesignImage[] = [
  {
    id: 'des-001',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=400&auto=format&fit=crop',
    alt: 'Modern architectural design concept',
    title: 'Contemporary Office Building Design',
    description: 'Innovative architectural design for modern office spaces with sustainable features',
    category: 'commercial-design',
    tags: ['office', 'modern', 'sustainable', 'commercial'],
    width: 2070,
    height: 1380,
    featured: true,
    createdAt: '2024-01-10',
  },
  {
    id: 'des-002',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop',
    alt: 'Residential home design',
    title: 'Luxury Residential Home Design',
    description: 'Elegant residential design combining modern aesthetics with traditional elements',
    category: 'residential-design',
    tags: ['residential', 'luxury', 'modern', 'home'],
    width: 2070,
    height: 1380,
    featured: true,
    createdAt: '2024-01-15',
  },
  {
    id: 'des-003',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=400&auto=format&fit=crop',
    alt: '3D architectural visualization',
    title: '3D Architectural Visualization',
    description: 'Photorealistic 3D rendering showcasing interior and exterior design',
    category: 'visualization',
    tags: ['3d', 'rendering', 'visualization', 'interior'],
    width: 2069,
    height: 1379,
    featured: true,
    createdAt: '2024-01-20',
  },
  {
    id: 'des-004',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=400&auto=format&fit=crop',
    alt: 'Architectural blueprint',
    title: 'Technical Construction Documentation',
    description: 'Detailed architectural blueprints and construction drawings',
    category: 'documentation',
    tags: ['blueprint', 'technical', 'documentation', 'drawings'],
    width: 2070,
    height: 1380,
    featured: false,
    createdAt: '2024-01-25',
  },
  {
    id: 'des-005',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1931&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=400&auto=format&fit=crop',
    alt: 'Landscape architecture design',
    title: 'Landscape Architecture Design',
    description: 'Beautiful landscape design integrating nature with built environment',
    category: 'landscape',
    tags: ['landscape', 'nature', 'outdoor', 'sustainable'],
    width: 1931,
    height: 1287,
    featured: true,
    createdAt: '2024-02-01',
  },
  {
    id: 'des-006',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400&auto=format&fit=crop',
    alt: 'Sustainable building design',
    title: 'Sustainable Building Design',
    description: 'Eco-friendly architectural design with green building features',
    category: 'sustainable',
    tags: ['sustainable', 'green', 'eco-friendly', 'energy-efficient'],
    width: 2070,
    height: 1380,
    featured: true,
    createdAt: '2024-02-05',
  },
  {
    id: 'des-007',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=400&auto=format&fit=crop',
    alt: 'Conceptual design sketch',
    title: 'Conceptual Design Development',
    description: 'Initial design concepts and sketches for project development',
    category: 'conceptual',
    tags: ['concept', 'sketch', 'design', 'development'],
    width: 2070,
    height: 1380,
    featured: false,
    createdAt: '2024-02-10',
  },
  {
    id: 'des-008',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=400&auto=format&fit=crop',
    alt: '3D modeling project',
    title: '3D Building Information Modeling',
    description: 'Advanced BIM modeling for comprehensive building design',
    category: '3d-modeling',
    tags: ['bim', '3d', 'modeling', 'building'],
    width: 2053,
    height: 1369,
    featured: true,
    createdAt: '2024-02-15',
  },
];

// ============================================
// Design Videos Library
// ============================================

const videos: DesignVideo[] = [
  {
    id: 'des-vid-001',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1280&auto=format&fit=crop',
    title: 'Architectural Design Process',
    description: 'Complete walkthrough of our architectural design process from concept to completion',
    category: 'conceptual',
    tags: ['process', 'design', 'architecture', 'walkthrough'],
    source: 'youtube',
    duration: '12:30',
    featured: true,
    createdAt: '2024-01-12',
  },
  {
    id: 'des-vid-002',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1280&auto=format&fit=crop',
    title: '3D Visualization Techniques',
    description: 'Expert techniques for creating photorealistic 3D architectural visualizations',
    category: 'visualization',
    tags: ['3d', 'visualization', 'techniques', 'rendering'],
    source: 'youtube',
    duration: '15:45',
    featured: true,
    createdAt: '2024-01-18',
  },
  {
    id: 'des-vid-003',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1280&auto=format&fit=crop',
    title: 'Sustainable Design Principles',
    description: 'Introduction to sustainable architecture and green building design principles',
    category: 'sustainable',
    tags: ['sustainable', 'green', 'principles', 'architecture'],
    source: 'youtube',
    duration: '10:20',
    featured: false,
    createdAt: '2024-02-08',
  },
];

// ============================================
// Main Library Export
// ============================================

export const designMediaLibrary = {
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
export const getAllMedia = (): DesignMedia[] => {
  return [...images, ...videos];
};

/**
 * Get media by category
 */
export const getMediaByCategory = (
  category: DesignCategory
): DesignMedia[] => {
  return getAllMedia().filter((item) => item.category === category);
};

/**
 * Get featured media items
 */
export const getFeaturedMedia = (): DesignMedia[] => {
  return getAllMedia().filter((item) => item.featured === true);
};

/**
 * Get images only
 */
export const getImages = (): DesignImage[] => {
  return images;
};

/**
 * Get videos only
 */
export const getVideos = (): DesignVideo[] => {
  return videos;
};

/**
 * Get media by tags
 */
export const getMediaByTags = (tags: string[]): DesignMedia[] => {
  return getAllMedia().filter((item) =>
    tags.some((tag) => item.tags.includes(tag))
  );
};

/**
 * Search media by title or description
 */
export const searchMedia = (query: string): DesignMedia[] => {
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
export const getMediaById = (id: string): DesignMedia | undefined => {
  return getAllMedia().find((item) => item.id === id);
};

/**
 * Get random media items
 */
export const getRandomMedia = (count: number = 5): DesignMedia[] => {
  const allMedia = getAllMedia();
  const shuffled = [...allMedia].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

/**
 * Get category information
 */
export const getCategoryInfo = (
  category: DesignCategory
): { name: string; description: string; icon?: string } => {
  return categories[category];
};

/**
 * Get all categories
 */
export const getAllCategories = (): DesignCategory[] => {
  return Object.keys(categories) as DesignCategory[];
};

export default designMediaLibrary;


