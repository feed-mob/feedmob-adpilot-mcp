-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create campaigns table for storing campaign data across MCP tool calls
CREATE TABLE IF NOT EXISTS campaigns (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Campaign data as JSONB for flexible schema storage
  parameters JSONB,
  research JSONB,
  ad_copy JSONB,
  images JSONB,
  mixed_media JSONB,
  
  -- User selections for variations
  selected_ad_copy_variation VARCHAR(1) CHECK (selected_ad_copy_variation IN ('A', 'B')),
  selected_image_variation VARCHAR(1) CHECK (selected_image_variation IN ('A', 'B')),
  
  -- Main timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Component-level timestamps for tracking progress
  parameters_updated_at TIMESTAMPTZ,
  research_updated_at TIMESTAMPTZ,
  ad_copy_updated_at TIMESTAMPTZ,
  images_updated_at TIMESTAMPTZ,
  mixed_media_updated_at TIMESTAMPTZ
);

-- Index for efficient lookups by campaign ID
CREATE INDEX IF NOT EXISTS idx_campaigns_id ON campaigns(id);

-- Trigger function to auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE campaigns IS 'Stores campaign data across MCP tool calls';
COMMENT ON COLUMN campaigns.id IS 'Unique campaign identifier (UUID)';
COMMENT ON COLUMN campaigns.parameters IS 'Campaign parameters from parseAdRequirements';
COMMENT ON COLUMN campaigns.research IS 'Campaign research report from conductAdResearch';
COMMENT ON COLUMN campaigns.ad_copy IS 'Ad copy variations from generateAdCopy';
COMMENT ON COLUMN campaigns.images IS 'Image variations from generateAdImages';
COMMENT ON COLUMN campaigns.mixed_media IS 'Mixed media result from generateMixedMediaCreative';
COMMENT ON COLUMN campaigns.selected_ad_copy_variation IS 'User-selected ad copy variation (A or B)';
COMMENT ON COLUMN campaigns.selected_image_variation IS 'User-selected image variation (A or B)';
