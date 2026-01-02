// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading?: boolean;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  category?: string;
  tags?: string[];
  author?: string;
  featured?: boolean;
  published?: boolean;
}

// Pagination Types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Form Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  loading: boolean;
}

// Real-time Subscription Types
export interface RealtimeEvent<T> {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T | null;
  old: T | null;
  table: string;
}
// Post and Comment Types (legacy)
export interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: string;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  images: string[];
  videos: string[];
  categories: string[];
  likes: number;
  comments: Comment[];
}

// Supabase-compatible types
export interface SupabasePost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url?: string;
  video_url?: string;
  tags: string[];
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

// Profile type for admin management
export interface Profile {
  id: string;
  username: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  role: "user" | "admin";
  is_banned?: boolean;
  banned_at?: string;
  ban_reason?: string;
  created_at: string;
  updated_at: string;
}

// Post with profile info for admin management
export interface PostWithProfile {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  image_url?: string;
  video_url?: string;
  tags: string[];
  category?: string;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string;
    full_name?: string;
  } | null;
  likes: number;
  comments: number;
}
// Contact Message Types
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface EmailSubscription {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

export interface NewsletterSend {
  id: string;
  subject: string;
  content: string;
  sent_at?: string;
  recipient_count: number;
}

// Media types for project gallery
export interface MediaItem {
  url: string;
  thumbnail: string;
}

export interface VideoSource {
  url: string;
  type: "local" | "external";
  thumbnail: string;
}

// Project type for admin management
export interface Project {
  id: string;
  title: string;
  description: string;
  status: "completed" | "ongoing";
  image: string;
  location: string;
  category?: string;
  details: {
    timeline?: string;
    materials?: string[];
    features?: string[];
    imageGallery?: string[];
    blueprints?: string[];
    videos?: VideoSource[];
    virtualTour?: string;
  };
  created_at: string;
  updated_at: string;
  created_by?: string;
}
