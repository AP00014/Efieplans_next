-- Add showcase_position column to projects table
-- This allows admins to manually select which projects appear in the home page showcase
-- Position values: 1-6 (corresponds to showcase_img_1 through showcase_img_6)
-- NULL means the project is not featured in the showcase

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS showcase_position INTEGER CHECK (showcase_position >= 1 AND showcase_position <= 6);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS projects_showcase_position_idx ON projects(showcase_position) WHERE showcase_position IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN projects.showcase_position IS 'Position in the home page showcase (1-6). NULL means not featured. Only one project can have each position.';

