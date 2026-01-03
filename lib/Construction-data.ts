/**
 * Construction Media Library
 * 
 * A comprehensive library of construction-related images and videos
 * organized by categories for easy access and management.
 * 
 * @module Construction-data
 */

// ============================================
// Type Definitions
// ============================================

export type ConstructionCategory = 
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'infrastructure'
  | 'renovation'
  | 'foundation'
  | 'framing'
  | 'finishing'
  | 'safety'
  | 'equipment'
  | 'team'
  | 'process';

export type MediaType = 'image' | 'video';

export type VideoSource = 'youtube' | 'vimeo' | 'local' | 'external';

export interface ConstructionImage {
  id: string;
  type: 'image';
  url: string;
  thumbnail?: string;
  alt: string;
  title: string;
  description?: string;
  category: ConstructionCategory;
  tags: string[];
  width?: number;
  height?: number;
  featured?: boolean;
  createdAt?: string;
}

export interface ConstructionVideo {
  id: string;
  type: 'video';
  url: string;
  thumbnail: string;
  title: string;
  description?: string;
  category: ConstructionCategory;
  tags: string[];
  source: VideoSource;
  duration?: string;
  featured?: boolean;
  createdAt?: string;
}

export type ConstructionMedia = ConstructionImage | ConstructionVideo;

export interface ConstructionMediaLibrary {
  images: ConstructionImage[];
  videos: ConstructionVideo[];
  categories: {
    [key in ConstructionCategory]: {
      name: string;
      description: string;
      icon?: string;
    };
  };
}

// ============================================
// Category Definitions
// ============================================

const categories = {
  residential: {
    name: 'Residential Construction',
    description: 'Homes, apartments, and residential complexes',
    icon: '🏠',
  },
  commercial: {
    name: 'Commercial Construction',
    description: 'Office buildings, retail centers, and commercial facilities',
    icon: '🏢',
  },
  industrial: {
    name: 'Industrial Construction',
    description: 'Factories, warehouses, and industrial facilities',
    icon: '🏭',
  },
  infrastructure: {
    name: 'Infrastructure',
    description: 'Roads, bridges, and public infrastructure projects',
    icon: '🌉',
  },
  renovation: {
    name: 'Renovation & Remodeling',
    description: 'Home and building renovations and remodeling projects',
    icon: '🔨',
  },
  foundation: {
    name: 'Foundation Work',
    description: 'Foundation construction, excavation, and structural work',
    icon: '🏗️',
  },
  framing: {
    name: 'Framing & Structure',
    description: 'Structural framing, steel work, and framework',
    icon: '🔩',
  },
  finishing: {
    name: 'Finishing & Interior',
    description: 'Interior finishing, painting, and final touches',
    icon: '✨',
  },
  safety: {
    name: 'Safety & Compliance',
    description: 'Safety protocols, equipment, and compliance measures',
    icon: '🦺',
  },
  equipment: {
    name: 'Equipment & Machinery',
    description: 'Construction equipment, tools, and machinery',
    icon: '🚜',
  },
  team: {
    name: 'Team & Workforce',
    description: 'Our construction team, workers, and professionals',
    icon: '👷',
  },
  process: {
    name: 'Construction Process',
    description: 'Step-by-step construction processes and workflows',
    icon: '📋',
  },
} as const;

// ============================================
// Construction Images Library
// ============================================

const images: ConstructionImage[] = [
  // Residential Construction
  {
    id: 'res-001',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop',
    alt: 'Modern residential home construction',
    title: 'Luxury Residential Home',
    description: 'Beautiful modern home under construction with attention to detail',
    category: 'residential',
    tags: ['home', 'modern', 'luxury', 'residential'],
    width: 2070,
    height: 1380,
    featured: true,
    createdAt: '2024-01-15',
  },
  {
    id: 'res-002',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=400&auto=format&fit=crop',
    alt: 'Apartment complex construction',
    title: 'Multi-Family Residential Complex',
    description: 'Large-scale apartment complex construction project',
    category: 'residential',
    tags: ['apartment', 'multi-family', 'complex', 'residential'],
    width: 2053,
    height: 1369,
    featured: false,
    createdAt: '2024-01-20',
  },
  {
    id: 'res-003',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?q=80&w=400&auto=format&fit=crop',
    alt: 'Residential building exterior',
    title: 'Residential Building Exterior',
    description: 'Completed residential building with modern architectural design',
    category: 'residential',
    tags: ['exterior', 'completed', 'architecture', 'residential'],
    width: 2070,
    height: 1380,
    featured: false,
    createdAt: '2024-01-25',
  },

  // Commercial Construction
  {
    id: 'com-001',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=400&auto=format&fit=crop',
    alt: 'Modern office building construction',
    title: 'Commercial Office Building',
    description: 'State-of-the-art office building under construction',
    category: 'commercial',
    tags: ['office', 'commercial', 'business', 'modern'],
    width: 2070,
    height: 1380,
    featured: true,
    createdAt: '2024-02-01',
  },
  {
    id: 'com-002',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=400&auto=format&fit=crop',
    alt: 'Retail center construction',
    title: 'Retail Shopping Center',
    description: 'Large retail shopping center construction project',
    category: 'commercial',
    tags: ['retail', 'shopping', 'commercial', 'center'],
    width: 2069,
    height: 1379,
    featured: false,
    createdAt: '2024-02-05',
  },
  {
    id: 'com-003',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=400&auto=format&fit=crop',
    alt: 'Commercial construction site',
    title: 'Active Construction Site',
    description: 'Busy commercial construction site with heavy machinery',
    category: 'commercial',
    tags: ['site', 'active', 'machinery', 'commercial'],
    width: 2070,
    height: 1380,
    featured: true,
    createdAt: '2024-02-10',
  },

  // Industrial Construction
  {
    id: 'ind-001',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=400&auto=format&fit=crop',
    alt: 'Industrial warehouse construction',
    title: 'Industrial Warehouse Facility',
    description: 'Large-scale industrial warehouse construction',
    category: 'industrial',
    tags: ['warehouse', 'industrial', 'facility', 'large-scale'],
    width: 2070,
    height: 1380,
    featured: true,
    createdAt: '2024-02-15',
  },
  {
    id: 'ind-002',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=400&auto=format&fit=crop',
    alt: 'Manufacturing plant construction',
    title: 'Manufacturing Plant',
    description: 'Modern manufacturing plant construction',
    category: 'industrial',
    tags: ['manufacturing', 'plant', 'industrial', 'factory'],
    width: 2070,
    height: 1380,
    featured: false,
    createdAt: '2024-02-20',
  },

  // Foundation Work
  {
    id: 'fnd-001',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1931&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=400&auto=format&fit=crop',
    alt: 'Foundation excavation work',
    title: 'Foundation Excavation',
    description: 'Professional foundation excavation and preparation',
    category: 'foundation',
    tags: ['foundation', 'excavation', 'groundwork', 'structural'],
    width: 1931,
    height: 1287,
    featured: true,
    createdAt: '2024-03-01',
  },
  {
    id: 'fnd-002',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400&auto=format&fit=crop',
    alt: 'Concrete foundation pouring',
    title: 'Concrete Foundation Pouring',
    description: 'Precision concrete pouring for strong foundation',
    category: 'foundation',
    tags: ['concrete', 'pouring', 'foundation', 'structural'],
    width: 2070,
    height: 1380,
    featured: false,
    createdAt: '2024-03-05',
  },

  // Framing & Structure
  {
    id: 'frm-001',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=400&auto=format&fit=crop',
    alt: 'Steel frame construction',
    title: 'Steel Frame Structure',
    description: 'Robust steel frame construction for commercial building',
    category: 'framing',
    tags: ['steel', 'frame', 'structure', 'commercial'],
    width: 2070,
    height: 1380,
    featured: true,
    createdAt: '2024-03-10',
  },
  {
    id: 'frm-002',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400&auto=format&fit=crop',
    alt: 'Wood framing construction',
    title: 'Wood Frame Construction',
    description: 'Traditional wood framing for residential construction',
    category: 'framing',
    tags: ['wood', 'frame', 'residential', 'traditional'],
    width: 2070,
    height: 1380,
    featured: false,
    createdAt: '2024-03-15',
  },

  // Finishing & Interior
  {
    id: 'fin-001',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=400&auto=format&fit=crop',
    alt: 'Interior finishing work',
    title: 'Interior Finishing',
    description: 'High-quality interior finishing and detailing',
    category: 'finishing',
    tags: ['interior', 'finishing', 'detail', 'quality'],
    width: 2053,
    height: 1369,
    featured: true,
    createdAt: '2024-03-20',
  },
  {
    id: 'fin-002',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?q=80&w=400&auto=format&fit=crop',
    alt: 'Exterior finishing',
    title: 'Exterior Finishing',
    description: 'Professional exterior finishing and cladding',
    category: 'finishing',
    tags: ['exterior', 'finishing', 'cladding', 'professional'],
    width: 2070,
    height: 1380,
    featured: false,
    createdAt: '2024-03-25',
  },

  // Equipment & Machinery
  {
    id: 'eqp-001',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=400&auto=format&fit=crop',
    alt: 'Construction crane and equipment',
    title: 'Heavy Construction Equipment',
    description: 'Modern construction equipment and machinery on site',
    category: 'equipment',
    tags: ['equipment', 'machinery', 'crane', 'heavy'],
    width: 2070,
    height: 1380,
    featured: true,
    createdAt: '2024-04-01',
  },
  {
    id: 'eqp-002',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400&auto=format&fit=crop',
    alt: 'Construction tools and equipment',
    title: 'Professional Construction Tools',
    description: 'High-quality construction tools and equipment',
    category: 'equipment',
    tags: ['tools', 'equipment', 'professional', 'quality'],
    width: 2070,
    height: 1380,
    featured: false,
    createdAt: '2024-04-05',
  },

  // Team & Workforce
  {
    id: 'tam-001',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400&auto=format&fit=crop',
    alt: 'Construction team at work',
    title: 'Professional Construction Team',
    description: 'Our skilled construction team working on site',
    category: 'team',
    tags: ['team', 'workers', 'professional', 'skilled'],
    width: 2070,
    height: 1380,
    featured: true,
    createdAt: '2024-04-10',
  },
  {
    id: 'tam-002',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=400&auto=format&fit=crop',
    alt: 'Construction workers collaboration',
    title: 'Team Collaboration',
    description: 'Construction workers collaborating on project',
    category: 'team',
    tags: ['collaboration', 'teamwork', 'workers', 'professional'],
    width: 2070,
    height: 1380,
    featured: false,
    createdAt: '2024-04-15',
  },
];

// ============================================
// Construction Videos Library
// ============================================

const videos: ConstructionVideo[] = [
  {
    id: 'vid-001',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1280&auto=format&fit=crop',
    title: 'Residential Construction Process',
    description: 'Complete walkthrough of our residential construction process from foundation to finish',
    category: 'residential',
    tags: ['residential', 'process', 'walkthrough', 'construction'],
    source: 'youtube',
    duration: '15:30',
    featured: true,
    createdAt: '2024-01-10',
  },
  {
    id: 'vid-002',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1280&auto=format&fit=crop',
    title: 'Commercial Building Construction',
    description: 'Time-lapse of commercial office building construction',
    category: 'commercial',
    tags: ['commercial', 'timelapse', 'office', 'building'],
    source: 'youtube',
    duration: '8:45',
    featured: true,
    createdAt: '2024-01-18',
  },
  {
    id: 'vid-003',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1280&auto=format&fit=crop',
    title: 'Foundation Construction Techniques',
    description: 'Expert techniques for foundation construction and concrete pouring',
    category: 'foundation',
    tags: ['foundation', 'techniques', 'concrete', 'expert'],
    source: 'youtube',
    duration: '12:20',
    featured: false,
    createdAt: '2024-02-12',
  },
  {
    id: 'vid-004',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1280&auto=format&fit=crop',
    title: 'Steel Frame Construction',
    description: 'Detailed process of steel frame construction for commercial buildings',
    category: 'framing',
    tags: ['steel', 'frame', 'commercial', 'process'],
    source: 'youtube',
    duration: '10:15',
    featured: false,
    createdAt: '2024-02-18',
  },
  {
    id: 'vid-005',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1280&auto=format&fit=crop',
    title: 'Interior Finishing Excellence',
    description: 'Showcase of our interior finishing work and attention to detail',
    category: 'finishing',
    tags: ['interior', 'finishing', 'detail', 'excellence'],
    source: 'youtube',
    duration: '7:30',
    featured: true,
    createdAt: '2024-03-08',
  },
  {
    id: 'vid-006',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1280&auto=format&fit=crop',
    title: 'Construction Equipment Showcase',
    description: 'Overview of our modern construction equipment and machinery',
    category: 'equipment',
    tags: ['equipment', 'machinery', 'modern', 'showcase'],
    source: 'youtube',
    duration: '6:45',
    featured: false,
    createdAt: '2024-03-12',
  },
  {
    id: 'vid-007',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1280&auto=format&fit=crop',
    title: 'Safety Protocols on Site',
    description: 'Comprehensive guide to construction site safety and compliance',
    category: 'safety',
    tags: ['safety', 'protocols', 'compliance', 'site'],
    source: 'youtube',
    duration: '9:20',
    featured: true,
    createdAt: '2024-03-22',
  },
  {
    id: 'vid-008',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1280&auto=format&fit=crop',
    title: 'Industrial Warehouse Construction',
    description: 'Complete construction process of large-scale industrial warehouse',
    category: 'industrial',
    tags: ['industrial', 'warehouse', 'large-scale', 'process'],
    source: 'youtube',
    duration: '18:00',
    featured: true,
    createdAt: '2024-04-08',
  },
];

// ============================================
// Main Library Export
// ============================================

export const constructionMediaLibrary: ConstructionMediaLibrary = {
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
export const getAllMedia = (): ConstructionMedia[] => {
  return [...images, ...videos];
};

/**
 * Get media by category
 */
export const getMediaByCategory = (
  category: ConstructionCategory
): ConstructionMedia[] => {
  return getAllMedia().filter((item) => item.category === category);
};

/**
 * Get featured media items
 */
export const getFeaturedMedia = (): ConstructionMedia[] => {
  return getAllMedia().filter((item) => item.featured === true);
};

/**
 * Get images only
 */
export const getImages = (): ConstructionImage[] => {
  return images;
};

/**
 * Get videos only
 */
export const getVideos = (): ConstructionVideo[] => {
  return videos;
};

/**
 * Get media by tags
 */
export const getMediaByTags = (tags: string[]): ConstructionMedia[] => {
  return getAllMedia().filter((item) =>
    tags.some((tag) => item.tags.includes(tag))
  );
};

/**
 * Search media by title or description
 */
export const searchMedia = (query: string): ConstructionMedia[] => {
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
export const getMediaById = (id: string): ConstructionMedia | undefined => {
  return getAllMedia().find((item) => item.id === id);
};

/**
 * Get random media items
 */
export const getRandomMedia = (count: number = 5): ConstructionMedia[] => {
  const allMedia = getAllMedia();
  const shuffled = [...allMedia].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

/**
 * Get category information
 */
export const getCategoryInfo = (
  category: ConstructionCategory
): { name: string; description: string; icon?: string } => {
  return categories[category];
};

/**
 * Get all categories
 */
export const getAllCategories = (): ConstructionCategory[] => {
  return Object.keys(categories) as ConstructionCategory[];
};

// ============================================
// Default Export
// ============================================

export default constructionMediaLibrary;

