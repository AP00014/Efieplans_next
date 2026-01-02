-- ============================================
-- Supabase Storage Bucket Setup for Projects
-- ============================================
-- This schema creates a storage bucket for project media files (images, videos, thumbnails, blueprints)
-- with Row Level Security (RLS) policies that allow:
-- - Everyone (including unauthenticated users) to view/read all project media
-- - Only ADMIN users to upload, update, or delete project media files
-- ============================================

-- Create the storage bucket for projects
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
   'portfolio',
   'portfolio',
   true, -- Public bucket so everyone can read
   null, -- No file size limit (or set to 104857600 for 100MB limit)
   ARRAY[
     'image/jpeg',
     'image/jpg',
     'image/png',
     'image/gif',
     'image/webp',
     'image/svg+xml',
     'video/mp4',
     'video/avi',
     'video/mov',
     'video/wmv',
     'video/webm',
     'video/quicktime',
     'application/pdf', -- For blueprints
     'application/zip', -- For blueprint archives
     'application/x-zip-compressed'
   ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- RLS Policies for Projects Storage
-- ============================================

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean re-run)
DROP POLICY IF EXISTS "Public Access: Anyone can view project media files" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload: Only admins can upload project media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update: Only admins can update project media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete: Only admins can delete project media" ON storage.objects;

-- Policy 1: Allow everyone (including unauthenticated) to SELECT (view/read) all project files
-- This allows all users to see all project media without authentication
CREATE POLICY "Public Access: Anyone can view project media files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'portfolio');

-- Policy 2: Allow only ADMIN users to INSERT (upload) files to portfolio bucket
-- Only users with admin role in profiles table can upload project media
-- Folder structure: portfolio/{project_id}/images/, portfolio/{project_id}/videos/,
--                   portfolio/{project_id}/thumbnails/, portfolio/{project_id}/blueprints/
CREATE POLICY "Admin Upload: Only admins can upload project media"
ON storage.objects
FOR INSERT
WITH CHECK (
   bucket_id = 'portfolio'
   AND auth.role() = 'authenticated'
   AND EXISTS (
     SELECT 1 FROM profiles
     WHERE profiles.id = auth.uid()
     AND profiles.role = 'admin'
   )
);

-- Policy 3: Allow only ADMIN users to UPDATE files in portfolio bucket
-- Only admins can update/overwrite project media files
CREATE POLICY "Admin Update: Only admins can update project media"
ON storage.objects
FOR UPDATE
USING (
   bucket_id = 'portfolio'
   AND auth.role() = 'authenticated'
   AND EXISTS (
     SELECT 1 FROM profiles
     WHERE profiles.id = auth.uid()
     AND profiles.role = 'admin'
   )
)
WITH CHECK (
   bucket_id = 'portfolio'
   AND auth.role() = 'authenticated'
   AND EXISTS (
     SELECT 1 FROM profiles
     WHERE profiles.id = auth.uid()
     AND profiles.role = 'admin'
   )
);

-- Policy 4: Allow only ADMIN users to DELETE files from portfolio bucket
-- Only admins can delete project media files
CREATE POLICY "Admin Delete: Only admins can delete project media"
ON storage.objects
FOR DELETE
USING (
   bucket_id = 'portfolio'
   AND auth.role() = 'authenticated'
   AND EXISTS (
     SELECT 1 FROM profiles
     WHERE profiles.id = auth.uid()
     AND profiles.role = 'admin'
   )
);

-- ============================================
-- Storage Path Structure Documentation
-- ============================================
-- The portfolio bucket uses the following folder structure:
--
-- portfolio/
--   {project_id}/
--     images/
--       {filename}.jpg
--       {filename}.png
--       ...
--     videos/
--       {filename}.mp4
--       {filename}.webm
--       ...
--     thumbnails/
--       {filename}.jpg
--       {filename}.png
--       ...
--     blueprints/
--       {filename}.pdf
--       {filename}.zip
--       ...
--
-- Example paths:
-- - Main thumbnail: portfolio/{project_id}/thumbnails/main-thumbnail.jpg
-- - Gallery image: portfolio/{project_id}/images/gallery-image-1.jpg
-- - Video: portfolio/{project_id}/videos/project-video.mp4
-- - Video thumbnail: portfolio/{project_id}/thumbnails/video-thumbnail.jpg
-- - Blueprint: portfolio/{project_id}/blueprints/floor-plan.pdf
--
-- Public URL format (if bucket is public):
-- https://{supabase-project-id}.supabase.co/storage/v1/object/public/portfolio/{project_id}/images/{filename}
--
-- ============================================
-- Notes:
-- ============================================
-- 1. The bucket is set to PUBLIC, which means files are accessible via public URLs
-- 2. Everyone can view/read all project media files (authenticated or not) - Public access
-- 3. Only ADMIN users (role = 'admin' in profiles table) can upload files
-- 4. Only ADMIN users can update/overwrite project media files
-- 5. Only ADMIN users can delete project media files
-- 6. No file size limit set (unlimited) - consider setting a limit for production
-- 7. Only specific MIME types are allowed for security (images, videos, PDFs, ZIPs)
-- 8. The folder structure organizes files by project ID and media type
-- 9. The policies check the profiles table to verify the user has admin role
-- 10. The bucket name is 'portfolio' to match the projects table
-- 11. URLs stored in the database can be either Supabase Storage paths or external URLs
-- 12. When uploading, use the format: portfolio/{project_id}/{media_type}/{filename}
-- ============================================