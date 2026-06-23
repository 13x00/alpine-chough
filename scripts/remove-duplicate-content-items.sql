-- Remove Duplicate Content Items Script
-- This removes duplicate entries in the navigation list (content_items)
-- where the same photo appears multiple times

-- Step 1: Find duplicate content_items (same photo appearing multiple times)
SELECT 
  p.title,
  ci.photo_id,
  COUNT(*) as appearances_in_nav,
  STRING_AGG(ci.id::text, ', ') as content_item_ids,
  STRING_AGG(ci.sort_order::text, ', ') as sort_orders
FROM content_items ci
JOIN photos p ON ci.photo_id = p.id
WHERE ci.item_type = 'photo'
GROUP BY p.title, ci.photo_id
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC, p.title;

-- Step 2: Preview what will be kept vs deleted
-- This shows which content_item will be kept (lowest sort_order) for each photo
SELECT 
  p.title,
  ci.id as content_item_id,
  ci.sort_order,
  ci.photo_id,
  CASE 
    WHEN ci.id = (
      SELECT id 
      FROM content_items ci2 
      WHERE ci2.photo_id = ci.photo_id 
      ORDER BY ci2.sort_order ASC, ci2.id ASC 
      LIMIT 1
    ) THEN 'KEEP'
    ELSE 'DELETE'
  END as action
FROM content_items ci
JOIN photos p ON ci.photo_id = p.id
WHERE ci.item_type = 'photo'
  AND ci.photo_id IN (
    SELECT photo_id 
    FROM content_items 
    WHERE item_type = 'photo'
    GROUP BY photo_id 
    HAVING COUNT(*) > 1
  )
ORDER BY p.title, ci.sort_order;

-- Step 3: Remove duplicate content_items
-- Keeps the one with the lowest sort_order for each photo
-- IMPORTANT: Review the preview above before running!
-- Uncomment when ready:

/*
DELETE FROM content_items
WHERE id IN (
  SELECT ci.id
  FROM content_items ci
  WHERE ci.item_type = 'photo'
    AND ci.id NOT IN (
      -- Keep the content_item with lowest sort_order for each photo
      SELECT DISTINCT ON (photo_id) id
      FROM content_items
      WHERE item_type = 'photo'
      ORDER BY photo_id, sort_order ASC, id ASC
    )
);
*/

-- Step 4: Also check for duplicate collections in content_items
SELECT 
  c.title,
  ci.collection_id,
  COUNT(*) as appearances_in_nav,
  STRING_AGG(ci.id::text, ', ') as content_item_ids
FROM content_items ci
JOIN collections c ON ci.collection_id = c.id
WHERE ci.item_type = 'collection'
GROUP BY c.title, ci.collection_id
HAVING COUNT(*) > 1;

-- Step 5: Remove duplicate collection content_items (if any)
-- Uncomment when ready:

/*
DELETE FROM content_items
WHERE id IN (
  SELECT ci.id
  FROM content_items ci
  WHERE ci.item_type = 'collection'
    AND ci.id NOT IN (
      SELECT DISTINCT ON (collection_id) id
      FROM content_items
      WHERE item_type = 'collection'
      ORDER BY collection_id, sort_order ASC, id ASC
    )
);
*/

-- Step 6: Reorder content_items to fix gaps
-- After removing duplicates, renumber sort_order sequentially
-- Uncomment when ready:

/*
WITH ordered_items AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY sort_order, id) - 1 as new_order
  FROM content_items
)
UPDATE content_items
SET sort_order = ordered_items.new_order
FROM ordered_items
WHERE content_items.id = ordered_items.id;
*/

-- Step 7: Verify cleanup
-- Should show no duplicates
SELECT 
  'Duplicate photos in nav' as check_type,
  COUNT(*) as count
FROM (
  SELECT photo_id
  FROM content_items
  WHERE item_type = 'photo'
  GROUP BY photo_id
  HAVING COUNT(*) > 1
) duplicates
UNION ALL
SELECT 
  'Duplicate collections in nav' as check_type,
  COUNT(*) as count
FROM (
  SELECT collection_id
  FROM content_items
  WHERE item_type = 'collection'
  GROUP BY collection_id
  HAVING COUNT(*) > 1
) duplicates;

-- Step 8: Final summary
SELECT 
  'Total photos' as metric,
  COUNT(*) as count
FROM photos
UNION ALL
SELECT 
  'Total collections' as metric,
  COUNT(*) as count
FROM collections
UNION ALL
SELECT 
  'Content items (should equal photos + collections)' as metric,
  COUNT(*) as count
FROM content_items
UNION ALL
SELECT 
  'Photo content items' as metric,
  COUNT(*) as count
FROM content_items
WHERE item_type = 'photo'
UNION ALL
SELECT 
  'Collection content items' as metric,
  COUNT(*) as count
FROM content_items
WHERE item_type = 'collection';

-- Made with Bob
