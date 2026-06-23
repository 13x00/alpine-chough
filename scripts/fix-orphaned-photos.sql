-- Fix orphaned photos by creating missing content_item records
-- This script adds content_items for any photos that are missing them

-- First, show what will be fixed
SELECT 
  'Photos that will get content_items:' as action,
  COUNT(*) as count
FROM photos p
LEFT JOIN content_items ci ON ci.photo_id = p.id
WHERE ci.id IS NULL;

-- Create content_items for orphaned photos
-- Uses the next available sort_order values
INSERT INTO content_items (sort_order, item_type, photo_id, collection_id)
SELECT 
  (SELECT COALESCE(MAX(sort_order), -1) FROM content_items) + ROW_NUMBER() OVER (ORDER BY p.created_at) as sort_order,
  'photo' as item_type,
  p.id as photo_id,
  NULL as collection_id
FROM photos p
LEFT JOIN content_items ci ON ci.photo_id = p.id
WHERE ci.id IS NULL
ORDER BY p.created_at;

-- Show results
SELECT 
  'Content items created:' as result,
  COUNT(*) as count
FROM photos p
INNER JOIN content_items ci ON ci.photo_id = p.id
WHERE ci.created_at > NOW() - INTERVAL '1 minute';

-- Verify no orphans remain
SELECT 
  'Remaining orphaned photos:' as verification,
  COUNT(*) as count
FROM photos p
LEFT JOIN content_items ci ON ci.photo_id = p.id
WHERE ci.id IS NULL;

-- Made with Bob
