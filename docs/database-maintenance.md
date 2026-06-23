# Database Maintenance Guide

This guide covers common database maintenance tasks for the Alpine-Chough application.

## Table of Contents

1. [Removing Duplicate Photos](#removing-duplicate-photos)
2. [Removing Duplicate Content Items](#removing-duplicate-content-items)
3. [Database Integrity Checks](#database-integrity-checks)
4. [Troubleshooting](#troubleshooting)

---

## Removing Duplicate Photos

Duplicate photos occur when the same image is processed multiple times, creating multiple rows in the `photos` table with the same title.

### When This Happens

- Manual re-seeding from `content.json`
- Webhook processing the same file multiple times
- Manual database insertions

### Detection Query

Run this in **Neon SQL Editor** to find duplicates:

```sql
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
```

### Removal Process

**Step 1: Preview what will be deleted**

Review the detection query results above to see which photos will be affected.

**Step 2: Delete duplicates (keeps oldest)**

```sql
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
```

**What it does:**
- Groups photos by title
- Keeps the **oldest** photo (earliest `created_at`)
- Deletes all newer duplicates

**Step 3: Clean up orphaned content_items**

After deleting photos, remove navigation entries that point to deleted photos:

```sql
DELETE FROM content_items
WHERE photo_id IS NOT NULL
  AND photo_id NOT IN (SELECT id FROM photos);
```

**Step 4: Verify cleanup**

```sql
SELECT 
  title,
  COUNT(*) as count
FROM photos
GROUP BY title
HAVING COUNT(*) > 1;
```

Should return **0 rows** if successful.

---

## Removing Duplicate Content Items

Duplicate content items occur when the same photo appears multiple times in the navigation list. This is more common than duplicate photos because the ingestion process prevents photo duplicates but can create multiple navigation entries.

### When This Happens

- Files not moved from `upload/` to `processed/` (permission issues)
- Webhook fires multiple times for the same files
- Each processing creates a new `content_items` entry
- But photo itself isn't duplicated (title check prevents it)

### Symptoms

- Same photo appears multiple times in the UI navigation
- `content_items` count > `photos` count
- Example: 64 photos but 84 content_items (20 duplicates)

### Detection Query

```sql
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
```

### Removal Process

**Step 1: Preview what will be kept vs deleted**

```sql
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
```

**Step 2: Remove duplicate content_items**

Keeps the entry with the lowest `sort_order` for each photo:

```sql
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
```

**Step 3: Check for duplicate collections**

```sql
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
```

**Step 4: Remove duplicate collection entries (if any)**

```sql
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
```

**Step 5: Reorder content_items**

After removing duplicates, renumber `sort_order` sequentially to fix gaps:

```sql
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
```

**Step 6: Verify cleanup**

```sql
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
```

Should return **0** for both checks.

---

## Database Integrity Checks

### Check for Orphaned Content Items

Content items that reference deleted photos or collections:

```sql
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
```

### Check for Orphaned Images

Images not referenced by any photo or collection:

```sql
SELECT i.id, i.filename, i.content_type
FROM images i
WHERE i.id NOT IN (
  SELECT image_id FROM photos
  UNION
  SELECT cover_image_id FROM collections
  UNION
  SELECT image_id FROM collection_images
);
```

### Database Summary

Get an overview of your database state:

```sql
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
  'Total images' as metric,
  COUNT(*) as count
FROM images
UNION ALL
SELECT 
  'Content items' as metric,
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
WHERE item_type = 'collection'
UNION ALL
SELECT 
  'Processed Drive files' as metric,
  COUNT(*) as count
FROM drive_processed_files;
```

**Expected relationships:**
- `content_items (photo)` should equal `photos` count
- `content_items (collection)` should equal `collections` count
- `content_items (total)` = photos + collections

---

## Troubleshooting

### More Content Items Than Photos

**Symptom:** `content_items` count > `photos` count

**Causes:**
1. Duplicate content_items (same photo appears multiple times in nav)
2. Collections are included in content_items
3. Orphaned content_items (pointing to deleted photos)

**Solution:** Use the [Removing Duplicate Content Items](#removing-duplicate-content-items) process above.

### Photos Not Appearing in UI

**Symptom:** Photos exist in database but don't show in navigation

**Cause:** Missing `content_items` entry

**Check:**
```sql
SELECT p.id, p.title
FROM photos p
LEFT JOIN content_items ci ON ci.photo_id = p.id
WHERE ci.id IS NULL;
```

**Fix:** Add missing content_items:
```sql
INSERT INTO content_items (sort_order, item_type, photo_id, collection_id)
SELECT 
  (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM content_items),
  'photo',
  p.id,
  NULL
FROM photos p
LEFT JOIN content_items ci ON ci.photo_id = p.id
WHERE ci.id IS NULL;
```

### Duplicate Photos After Re-seeding

**Symptom:** Running `npm run db:seed` creates duplicates

**Cause:** Seed script checks for existing photos by title, but if titles changed, duplicates are created

**Prevention:** 
- Don't change photo titles in `content.json` after initial seed
- Or manually delete old photos before re-seeding

**Fix:** Use the [Removing Duplicate Photos](#removing-duplicate-photos) process.

### Files Processed Multiple Times

**Symptom:** Same file creates multiple database entries

**Cause:** Files not moved from `upload/` to `processed/` folder

**Check:**
```sql
SELECT filename, COUNT(*) as times_processed
FROM drive_processed_files
GROUP BY filename
HAVING COUNT(*) > 1;
```

**Root cause:** Permission issues preventing file moves (see [Google Drive Integration Guide](./google-drive-integration.md))

**Temporary fix:** Clear processed files table to allow reprocessing:
```sql
TRUNCATE TABLE drive_processed_files;
```

**Permanent fix:** Fix Google Drive permissions so files can be moved

---

## Maintenance Scripts

Pre-written SQL scripts are available in the `scripts/` directory:

- **`scripts/remove-duplicates.sql`** - Remove duplicate photos
- **`scripts/remove-duplicate-content-items.sql`** - Remove duplicate navigation entries

These scripts include:
- ✅ Preview queries (safe to run)
- ✅ Commented DELETE statements (uncomment when ready)
- ✅ Verification queries
- ✅ Step-by-step instructions

---

## Best Practices

1. **Always preview before deleting** - Run detection queries first
2. **Backup before major changes** - Neon has point-in-time recovery
3. **Run one step at a time** - Don't uncomment all DELETEs at once
4. **Verify after each step** - Check results before proceeding
5. **Fix root causes** - Don't just clean up symptoms

---

## Regular Maintenance Schedule

### Weekly
- Check for duplicate content_items
- Verify database summary looks correct

### Monthly
- Check for orphaned images
- Review processed files count

### After Issues
- Run full integrity checks
- Clean up duplicates if found
- Investigate root cause

---

## Getting Help

If you encounter issues not covered here:

1. Check Vercel logs for error messages
2. Run the database summary query
3. Check the [Google Drive Integration Guide](./google-drive-integration.md)
4. Review the [Application Analysis](../AUDIT.md)