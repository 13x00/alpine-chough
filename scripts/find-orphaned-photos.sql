-- Find photos that are missing content_item records
-- These photos exist in the photos table but have no corresponding entry in content_items

-- Photos without content_items
SELECT 
  p.id,
  p.title,
  p.date,
  p.created_at,
  i.filename
FROM photos p
LEFT JOIN content_items ci ON ci.photo_id = p.id
LEFT JOIN images i ON i.id = p.image_id
WHERE ci.id IS NULL
ORDER BY p.created_at DESC;

-- Summary count
SELECT 
  COUNT(*) as orphaned_photos_count
FROM photos p
LEFT JOIN content_items ci ON ci.photo_id = p.id
WHERE ci.id IS NULL;

-- Collections without content_items (for completeness)
SELECT 
  c.id,
  c.title,
  c.slug,
  c.created_at
FROM collections c
LEFT JOIN content_items ci ON ci.collection_id = c.id
WHERE ci.id IS NULL
ORDER BY c.created_at DESC;

-- Summary count for collections
SELECT 
  COUNT(*) as orphaned_collections_count
FROM collections c
LEFT JOIN content_items ci ON ci.collection_id = c.id
WHERE ci.id IS NULL;

-- Made with Bob
