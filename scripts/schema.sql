-- Neon Postgres schema for alpine_chough
-- Run this in the Neon SQL Editor (or via psql) against database alpine_chough

-- Images: binary data and metadata
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data BYTEA NOT NULL,
  content_type TEXT NOT NULL,
  filename TEXT
);

-- Photos: single image per row
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_id UUID NOT NULL REFERENCES images(id) ON DELETE RESTRICT,
  description TEXT,
  date DATE,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Collections: cover image + many images via junction
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_id UUID NOT NULL REFERENCES images(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Collection gallery images (order preserved)
CREATE TABLE IF NOT EXISTS collection_images (
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  image_id UUID NOT NULL REFERENCES images(id) ON DELETE RESTRICT,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (collection_id, image_id)
);

-- Global content list order: photos and collections in one ordered list
CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order INT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('photo', 'collection')),
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  CONSTRAINT content_items_ref CHECK (
    (item_type = 'photo' AND photo_id IS NOT NULL AND collection_id IS NULL) OR
    (item_type = 'collection' AND collection_id IS NOT NULL AND photo_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_content_items_sort ON content_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_collection_images_sort ON collection_images(collection_id, sort_order);

-- Tracks Drive file/folder IDs that have been successfully ingested.
-- Prevents re-processing on repeated webhook pings for the same files.
CREATE TABLE IF NOT EXISTS drive_processed_files (
  drive_file_id TEXT PRIMARY KEY,
  processed_at  TIMESTAMPTZ DEFAULT now()
);

-- Stores the single active Drive push notification channel.
-- The cron renewal reads the old channel from here, stops it, registers
-- a new one, then upserts the new details back into this row.
CREATE TABLE IF NOT EXISTS drive_webhook_channel (
  id          INT PRIMARY KEY DEFAULT 1, -- always 1; single-row table
  channel_id  TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now()
);
