-- Migration: add blob_url column to images table
-- Run this in the Neon SQL Editor before running scripts/migrate-images-to-r2.mjs
--
-- NOTE: This does NOT drop the `data` BYTEA column yet.
-- The data migration script (migrate-images-to-r2.mjs) needs it to read existing images.
-- It will drop the column automatically once all rows have been migrated to R2.

ALTER TABLE images ADD COLUMN IF NOT EXISTS blob_url TEXT;
