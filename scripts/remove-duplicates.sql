-- Remove Duplicate Photos Script
-- This script removes duplicate photos, keeping only the oldest one for each title
-- Run this in Neon SQL Editor

-- Step 1: Preview duplicates before deleting
-- Run this first to see what will be removed
SELECT 
  title,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ') as photo_ids,
  MIN(created_at) as oldest_created,
  MAX(created_at) as newest_created
FROM photos
GROUP BY title
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, title;

-- Step 2: Remove duplicate photos (keeps the oldest one for each title)
-- IMPORTANT: Review the preview above before running this!
-- Uncomment the DELETE statement below when ready:

/*
DELETE FROM photos
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      title,
      ROW_NUMBER() OVER (
        PARTITION BY title 
        ORDER BY created_at ASC, id ASC
      ) as row_num
    FROM photos
  ) ranked
  WHERE row_num > 1
);
*/

-- Step 3: Clean up orphaned content_items
-- These are content_items that reference deleted photos
-- Uncomment when ready:

/*
DELETE FROM content_items
WHERE photo_id IS NOT NULL
  AND photo_id NOT IN (SELECT id FROM photos);
*/

-- Step 4: Verify cleanup
-- Run this after deletion to confirm no duplicates remain
SELECT 
  title,
  COUNT(*) as count
FROM photos
GROUP BY title
HAVING COUNT(*) > 1;

-- Step 5: Check content_items integrity
-- Verify all content_items reference valid photos/collections
SELECT 
  ci.id,
  ci.item_type,
  ci.photo_id,
  ci.collection_id,
  CASE 
    WHEN ci.item_type = 'photo' AND p.id IS NULL THEN 'ORPHANED PHOTO'
    WHEN ci.item_type = 'collection' AND c.id IS NULL THEN 'ORPHANED COLLECTION'
    ELSE 'OK'
  END as status
FROM content_items ci
LEFT JOIN photos p ON ci.photo_id = p.id
LEFT JOIN collections c ON ci.collection_id = c.id
WHERE 
  (ci.item_type = 'photo' AND p.id IS NULL) OR
  (ci.item_type = 'collection' AND c.id IS NULL);

-- Step 6: Reorder content_items (optional)
-- If you want to fix gaps in sort_order after cleanup
-- Uncomment when ready:

/*
WITH ordered_items AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY sort_order, created_at) - 1 as new_order
  FROM content_items
)
UPDATE content_items
SET sort_order = ordered_items.new_order
FROM ordered_items
WHERE content_items.id = ordered_items.id;
*/

-- Summary query - run at the end to see final state
SELECT 
  'Total photos' as metric,
  COUNT(*) as count
FROM photos
UNION ALL
SELECT 
  'Unique titles' as metric,
  COUNT(DISTINCT title) as count
FROM photos
UNION ALL
SELECT 
  'Content items' as metric,
  COUNT(*) as count
FROM content_items
UNION ALL
SELECT 
  'Photos in content' as metric,
  COUNT(*) as count
FROM content_items
WHERE item_type = 'photo';

-- Made with Bob
