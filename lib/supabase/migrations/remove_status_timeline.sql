-- Migration: Remove status and timeline from projects table
-- Run this migration in your Supabase SQL editor

-- Step 1: Drop the status index (must be done before dropping the column)
DROP INDEX IF EXISTS projects_status_idx;

-- Step 2: Drop the status column from projects table
ALTER TABLE projects DROP COLUMN IF EXISTS status;

-- Step 3: Remove timeline from all existing project details JSONB
-- This updates all existing projects to remove the timeline field from their details JSONB
UPDATE projects
SET details = details - 'timeline'
WHERE details ? 'timeline';

-- Note: The timeline field in the details JSONB will no longer be saved
-- by the application code, so new projects won't have it either.

