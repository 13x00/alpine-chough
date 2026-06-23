# Duplicate Content Items Fix

## Problem

When multiple Google Drive webhook notifications arrived simultaneously (within milliseconds), the system would create duplicate `content_items` entries for the same photos or collections. This happened because:

1. **Concurrent Webhook Processing**: Google Drive sends multiple webhook notifications when files are uploaded in quick succession
2. **No Concurrency Control**: Each webhook spawned a separate ingest process via `after()` with no coordination
3. **Race Condition in `nextSortOrder()`**: Multiple processes would query for the next sort_order simultaneously, getting the same value
4. **No Database Constraints**: The database had no unique constraints to prevent duplicate photo_id or collection_id entries

### Evidence from Logs

The log file showed:
- Multiple webhook notifications arriving within milliseconds (e.g., 13:33:51.745, 13:33:52.225, 13:33:52.685)
- Same photos being processed multiple times by different concurrent processes
- Photos like DSC02132, DSC01958, DSC02119 being added with different sort_orders (74, 78, 80, 84, 87, 89, 91, 92, 93)
- Messages like "Photo already in DB (by title), skipping insert" followed by "Added content_item at sort_order X" indicating the photo existed but a new content_item was still created

## Solution

The fix implements a **defense-in-depth** approach with three layers:

### 1. Application-Level Mutex (Primary Defense)

**File**: `app/api/drive/webhook/route.ts`

Added an in-memory mutex to serialize ingest operations:

```typescript
let ingestInProgress = false
let pendingIngest = false
```

**How it works**:
- When a webhook arrives, check if an ingest is already running
- If yes, mark `pendingIngest = true` and return immediately
- The running ingest checks `pendingIngest` after completion and runs again if needed
- This ensures only one ingest runs at a time, processing all pending changes in batches

**Benefits**:
- Prevents concurrent database access
- Reduces unnecessary work (multiple ingests scanning the same files)
- Maintains responsiveness (webhooks return 200 immediately)

### 2. Database-Level Constraints (Safety Net)

**File**: `scripts/add-content-items-constraints.sql`

Added unique partial indexes on the `content_items` table:

```sql
CREATE UNIQUE INDEX content_items_photo_id_unique
ON content_items (photo_id)
WHERE photo_id IS NOT NULL;

CREATE UNIQUE INDEX content_items_collection_id_unique
ON content_items (collection_id)
WHERE collection_id IS NOT NULL;
```

**How it works**:
- Partial indexes enforce uniqueness only for non-NULL values
- Database rejects any attempt to insert duplicate photo_id or collection_id
- Works even if the application-level mutex fails

**Benefits**:
- Guarantees data integrity at the database level
- Protects against bugs, race conditions, or future code changes
- Zero performance impact (partial indexes are efficient)

### 3. Graceful Error Handling (Resilience)

**File**: `lib/ingest.ts`

Updated insert logic to handle conflicts gracefully:

```typescript
await sql`
  INSERT INTO content_items (sort_order, item_type, photo_id, collection_id)
  VALUES (${sortOrder}, 'photo', ${photoId}::uuid, NULL)
  ON CONFLICT (photo_id) WHERE photo_id IS NOT NULL DO NOTHING
`
```

**How it works**:
- Uses PostgreSQL's `ON CONFLICT ... DO NOTHING` to silently skip duplicates
- Verifies if the insert succeeded and logs appropriately
- Catches and logs any unexpected errors without failing the entire ingest

**Benefits**:
- Ingest continues even if a duplicate is encountered
- Clear logging for debugging
- No data loss or corruption

## Migration Steps

### 1. Apply Database Constraints

Run the migration script to clean up existing duplicates and add constraints:

```bash
psql $DATABASE_URL -f scripts/add-content-items-constraints.sql
```

This will:
1. Remove any existing duplicate content_items (keeping the first one by sort_order)
2. Add unique partial indexes to prevent future duplicates
3. Verify no duplicates remain

### 2. Deploy Code Changes

The code changes are backward compatible and can be deployed immediately:
- `app/api/drive/webhook/route.ts` - Adds mutex logic
- `lib/ingest.ts` - Adds conflict handling

### 3. Verify

After deployment, monitor logs for:
- `[drive/webhook] Ingest already in progress, marking pending` - Shows mutex is working
- `[drive/ingest] Pending ingest detected, running again...` - Shows batching is working
- No more duplicate content_items being created

## Testing

### Manual Test

1. Upload multiple files to Google Drive upload/ folder simultaneously
2. Check logs for mutex messages
3. Verify only one ingest runs at a time
4. Confirm no duplicate content_items are created

### Database Verification

```sql
-- Check for duplicate photos in content_items
SELECT photo_id, COUNT(*) as count
FROM content_items
WHERE photo_id IS NOT NULL
GROUP BY photo_id
HAVING COUNT(*) > 1;

-- Check for duplicate collections in content_items
SELECT collection_id, COUNT(*) as count
FROM content_items
WHERE collection_id IS NOT NULL
GROUP BY collection_id
HAVING COUNT(*) > 1;

-- Both queries should return 0 rows
```

## Performance Impact

- **Positive**: Fewer concurrent database operations reduce load
- **Positive**: Batching multiple webhook notifications into one ingest is more efficient
- **Neutral**: Mutex adds negligible overhead (simple boolean check)
- **Neutral**: Partial indexes have no performance impact on queries

## Future Improvements

If the application scales to multiple server instances, consider:

1. **Distributed Lock**: Use Redis or database-based locking instead of in-memory mutex
2. **Queue System**: Use a job queue (e.g., BullMQ) to serialize ingest operations across instances
3. **Idempotency Keys**: Add unique identifiers to webhook notifications for deduplication

For now, the in-memory mutex is sufficient for a single-instance deployment.

## Related Files

- `app/api/drive/webhook/route.ts` - Webhook handler with mutex
- `lib/ingest.ts` - Ingest logic with conflict handling
- `scripts/add-content-items-constraints.sql` - Database migration
- `docs/google-drive-integration.md` - Overall Drive integration docs