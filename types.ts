export interface VideoSource {
  url: string;
  type: 'local' | 'external';
  thumbnail: string;
};

export interface MediaItem {
  url: string;
  thumbnail: string;
}

export interface ProjectItem {
  id: string | number; // Supports both UUID strings and numeric IDs for backward compatibility
  title: string;
  description: string;
  status: 'completed' | 'ongoing';
  image: string;
  location: string;
  category?: string;
  details: {
    specifications: Record<string, string>;

    timeline?: string;
    materials?: string[];
    features?: string[];
    imageGallery?: string[];
    blueprints?: string[];
    videos?: VideoSource[];
    virtualTour?: string;
  };
};

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author_id: string;
  published_at?: string;
  is_published: boolean;
  featured: boolean;
  tags: string[];
  category?: string;
  read_time?: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
  author?: {
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
};