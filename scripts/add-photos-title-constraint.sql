-- Remove duplicate photo rows before enforcing unique titles.
-- The oldest row for each title is retained; dependent content_items are
-- removed automatically through their ON DELETE CASCADE foreign key.
WITH ranked_photos AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY title
      ORDER BY created_at ASC NULLS LAST, id ASC
    ) AS duplicate_rank
  FROM photos
)
DELETE FROM photos
WHERE id IN (
  SELECT id
  FROM ranked_photos
  WHERE duplicate_rank > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS photos_title_unique
ON photos (title);
