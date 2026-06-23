-- Add unique constraints to prevent duplicate content_items
-- This prevents race conditions where multiple concurrent ingests try to create
-- the same content_item for a photo or collection.

-- First, let's check if there are any existing duplicates and remove them
-- (keeping the one with the lowest sort_order for each photo/collection)

-- Remove duplicate photo content_items (keep the first one by sort_order)
DELETE FROM content_items
WHERE id IN (
  SELECT ci.id
  FROM content_items ci
  INNER JOIN (
    SELECT photo_id, MIN(sort_order) as min_sort
    FROM content_items
    WHERE photo_id IS NOT NULL
    GROUP BY photo_id
    HAVING COUNT(*) > 1
  ) dups ON ci.photo_id = dups.photo_id
  WHERE ci.sort_order > dups.min_sort
);

-- Remove duplicate collection content_items (keep the first one by sort_order)
DELETE FROM content_items
WHERE id IN (
  SELECT ci.id
  FROM content_items ci
  INNER JOIN (
    SELECT collection_id, MIN(sort_order) as min_sort
    FROM content_items
    WHERE collection_id IS NOT NULL
    GROUP BY collection_id
    HAVING COUNT(*) > 1
  ) dups ON ci.collection_id = dups.collection_id
  WHERE ci.sort_order > dups.min_sort
);

-- Now add unique partial indexes to prevent future duplicates
-- Partial indexes are used because photo_id and collection_id can be NULL

-- Ensure each photo appears at most once in content_items
CREATE UNIQUE INDEX IF NOT EXISTS content_items_photo_id_unique
ON content_items (photo_id)
WHERE photo_id IS NOT NULL;

-- Ensure each collection appears at most once in content_items
CREATE UNIQUE INDEX IF NOT EXISTS content_items_collection_id_unique
ON content_items (collection_id)
WHERE collection_id IS NOT NULL;

-- Verify the constraints
SELECT 
  'Duplicate photos' as check_type,
  COUNT(*) as count
FROM (
  SELECT photo_id
  FROM content_items
  WHERE photo_id IS NOT NULL
  GROUP BY photo_id
  HAVING COUNT(*) > 1
) dups
UNION ALL
SELECT 
  'Duplicate collections' as check_type,
  COUNT(*) as count
FROM (
  SELECT collection_id
  FROM content_items
  WHERE collection_id IS NOT NULL
  GROUP BY collection_id
  HAVING COUNT(*) > 1
) dups;

-- Made with Bob
