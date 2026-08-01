# Cloudflare R2 Migration Plan

## Overview

Currently all photo binary data (BYTEA) is stored in the `images` table in Neon PostgreSQL.
This causes the free tier data limit to be hit quickly because every image read and write
passes through the database.

The goal is to move all image binary data out of Postgres and into Cloudflare R2, which is
purpose-built for object storage. R2's free tier provides 10 GB storage, 10M reads/month, and
zero egress fees — far more generous than alternatives. Postgres will only hold lightweight
metadata (UUIDs, URLs, titles, etc.). Image reads will go directly to R2's CDN, bypassing
the database entirely. The `/api/images/[id]` proxy route becomes unnecessary.

### What changes
- `images` table loses its `data BYTEA` column; gains a `blob_url TEXT` column instead
- Ingest pipeline uploads to Cloudflare R2 instead of inserting bytes into Postgres
- `/api/content` returns R2 public URLs directly instead of `/api/images/{id}` proxy URLs
- `/api/images/[id]` route is deleted (no longer needed)
- A one-off migration script uploads all existing BYTEA images to R2, writes their
  URLs back, then removes the `data` column

### What does NOT change
- `photos`, `collections`, `collection_images`, `content_items`, `drive_processed_files`,
  `drive_webhook_channel` tables are untouched
- Google Drive ingest trigger and webhook flow are untouched
- All content metadata (titles, descriptions, dates, tags, slugs) stays in Postgres
- No changes to the frontend components

---

## Cloudflare R2 Setup (one-time, manual)

Before running any sub-task, complete these steps in the Cloudflare dashboard:

1. Create a Cloudflare account (free) at dash.cloudflare.com
2. Go to **R2 Object Storage** → **Create bucket** → name it e.g. `alpine-chough`
3. Under bucket settings, enable **Public access** to get a public URL like
   `https://pub-<hash>.r2.dev` (or connect a custom domain)
4. Go to **R2 → Manage R2 API tokens** → create a token with **Object Read & Write**
   permission scoped to the bucket
5. Note down:
   - `R2_ACCOUNT_ID` — your Cloudflare account ID (top-right of dashboard)
   - `R2_ACCESS_KEY_ID` — from the API token
   - `R2_SECRET_ACCESS_KEY` — from the API token
   - `R2_BUCKET_NAME` — the bucket name (e.g. `alpine-chough`)
   - `R2_PUBLIC_URL` — the public base URL (e.g. `https://pub-<hash>.r2.dev`)

R2 is S3-compatible, so the AWS SDK (`@aws-sdk/client-s3`) is used to interact with it.

---

## Sub-Tasks

---

### Sub-Task 1 — Install AWS S3 SDK and add environment variables

**Intent**  
Add the `@aws-sdk/client-s3` package to the project (R2 is S3-compatible) and document
the five required R2 environment variables. This unblocks all subsequent sub-tasks.

**Expected Outcomes**  
- `@aws-sdk/client-s3` appears in `package.json` dependencies
- `.env.local` has placeholder entries for all five R2 variables with comments
- README or `.env.local` documents where to obtain each value

**Todo List**  
1. Run `npm install @aws-sdk/client-s3`
2. Add the following to `.env.local` with comments explaining each:
   ```
   R2_ACCOUNT_ID=
   R2_ACCESS_KEY_ID=
   R2_SECRET_ACCESS_KEY=
   R2_BUCKET_NAME=
   R2_PUBLIC_URL=
   ```
3. Add the same variable names to any `.env.example` or documented env list if one exists

**Relevant Context**  
- `package.json` — add dependency here
- `.env.local` — add env vars here

**Status** — `[ ] pending`

---

### Sub-Task 2 — Schema migration: replace BYTEA with blob_url

**Intent**  
Alter the `images` table so it stores an R2 public URL string instead of raw binary data.
This is the minimal database change required. The column `data BYTEA` is dropped and
`blob_url TEXT NOT NULL` is added.

**Expected Outcomes**  
- `scripts/schema.sql` is updated to reflect the new table shape (for future fresh installs)
- A new migration SQL file (`scripts/migrate-add-blob-url.sql`) exists that can be run against
  the live Neon database to perform the alteration safely

**Todo List**  
1. Create `scripts/migrate-add-blob-url.sql` with:
   - `ALTER TABLE images ADD COLUMN IF NOT EXISTS blob_url TEXT`
   - (The `data` column is NOT dropped here — the data migration script in Sub-Task 3 needs it)
2. Update `scripts/schema.sql` to replace `data BYTEA NOT NULL` with `blob_url TEXT NOT NULL`
   and remove any related comments about binary data

**Relevant Context**  
- `scripts/schema.sql` lines 5-10 — `images` table definition
- Sub-Task 3 depends on `data` still being present; do not drop it yet

**Status** — `[ ] pending`

---

### Sub-Task 3 — One-off data migration script

**Intent**  
Write a script that reads every row from `images` where `blob_url` is NULL (i.e. all existing
images), uploads each buffer to Cloudflare R2, writes the returned public URL back into
`blob_url`, then drops the `data` column once all rows are migrated. This is a one-time operation.

**Expected Outcomes**  
- `scripts/migrate-images-to-r2.mjs` exists and is runnable via `node scripts/migrate-images-to-r2.mjs`
- After the script runs: every `images` row has a non-null `blob_url`
- After the script runs: the `data` BYTEA column is dropped from `images`
- The script is idempotent: re-running after partial failure skips already-migrated rows

**Todo List**  
1. Create `scripts/migrate-images-to-r2.mjs`:
   - Read `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`,
     `R2_PUBLIC_URL`, and `DATABASE_URL` from environment
   - Create an S3Client pointed at `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
   - Connect to Neon using `DATABASE_URL`
   - Query all rows where `blob_url IS NULL`:
     `SELECT id, data, content_type, filename FROM images WHERE blob_url IS NULL`
   - For each row: call `PutObjectCommand` with the buffer, then construct the public URL as
     `${R2_PUBLIC_URL}/${filename}`
   - Update the row: `UPDATE images SET blob_url = $url WHERE id = $id`
   - Log progress per image
   - After all rows migrated: `ALTER TABLE images DROP COLUMN IF EXISTS data`
2. Test locally with a small subset before running against production

**Relevant Context**  
- `lib/ingest.ts` `ensureImageInDb()` lines 112-129 — shows current insert pattern with `data` BYTEA
- `app/api/images/[id]/route.ts` — shows how `data` is currently read back
- R2 S3 endpoint format: `https://${accountId}.r2.cloudflarestorage.com`
- R2 S3Client config requires `endpoint`, `region: 'auto'`, and `credentials`

**Status** — `[ ] pending`

---

### Sub-Task 4 — Update ingest pipeline to write to Cloudflare R2

**Intent**  
Change `lib/ingest.ts` so that after compressing an image with Sharp, it uploads the buffer
to Cloudflare R2 and stores the returned public URL in `images.blob_url` instead of inserting
binary data into `images.data`.

**Expected Outcomes**  
- `ensureImageInDb()` in `lib/ingest.ts` no longer writes a BYTEA buffer to Postgres
- New images are uploaded to R2; only the public URL is stored in Postgres
- Existing images (already migrated) are correctly detected by filename and their URL reused

**Todo List**  
1. Create `lib/r2.ts` — a small module that exports:
   - `getR2Client()` — returns a configured `S3Client` pointed at the R2 endpoint, using the
     five R2 environment variables
   - `uploadToR2(buffer, contentType, filename)` — calls `PutObjectCommand` and returns the
     public URL as `${R2_PUBLIC_URL}/${filename}`
2. In `lib/ingest.ts`, import `uploadToR2` from `./r2`
3. Rewrite `ensureImageInDb()`:
   - Check for existing row by `filename` (unchanged)
   - If not found: call `uploadToR2()`, then `INSERT INTO images (blob_url, content_type, filename) VALUES (...)`
   - Return the image `id` as before (callers are unchanged)
4. Remove the `buffer` parameter from the DB insert — it is no longer written to Postgres

**Relevant Context**  
- `lib/ingest.ts` lines 112-129 — `ensureImageInDb()` to rewrite
- `lib/ingest.ts` lines 72-89 — `compressImage()` returns `{ buffer, contentType }`, unchanged
- Callers of `ensureImageInDb`: `ingestPhoto()` (line 191), `ingestCollection()` (lines 314, 350)

**Status** — `[ ] pending`

---

### Sub-Task 5 — Update `/api/content` to return R2 URLs

**Intent**  
`/api/content` currently returns `/api/images/{id}` proxy URLs constructed by the local
`imageUrl()` helper. After the migration, `images.blob_url` holds the direct R2 CDN URL.
The route should return these direct URLs so the frontend fetches images straight from
R2 — eliminating all image-serving database reads.

**Expected Outcomes**  
- `GET /api/content` returns direct R2 URLs for `image`, `coverImage`, and `images[]`
- The local `imageUrl()` helper function is removed
- No more `SELECT data FROM images` queries happen at runtime

**Todo List**  
1. Update the SQL query in `app/api/content/route.ts` to JOIN `images` and select `blob_url`:
   - For photos: join `images` on `p.image_id = img.id`, select `img.blob_url AS p_image_url`
   - For collections (cover): join `images` on `c.cover_image_id = img_cover.id`, select
     `img_cover.blob_url AS c_cover_url`
   - For collection gallery images: select `img.blob_url` from `collection_images` join `images`
2. Replace `imageUrl(r.p_image_id)` with `r.p_image_url` in the items mapping
3. Replace `imageUrl(r.c_cover_id)` with `r.c_cover_url`
4. Replace `imageUrl(row.image_id)` with the blob URL from the gallery query
5. Delete the `imageUrl()` helper function

**Relevant Context**  
- `app/api/content/route.ts` lines 6-8 — `imageUrl()` helper to remove
- `app/api/content/route.ts` lines 20-29 — main SELECT query to extend with JOIN
- `app/api/content/route.ts` lines 41-56 — gallery images query to extend with JOIN
- `app/api/content/route.ts` lines 65-89 — items mapping to update

**Status** — `[ ] pending`

---

### Sub-Task 6 — Delete the `/api/images/[id]` proxy route

**Intent**  
Now that images are served directly from Cloudflare R2, the `/api/images/[id]` route which
read BYTEA from the database is entirely redundant. Deleting it removes the main source of
heavy database reads.

**Expected Outcomes**  
- `app/api/images/[id]/route.ts` is deleted
- No code in the project references `/api/images/` anymore

**Todo List**  
1. Delete `app/api/images/[id]/route.ts`
2. Search the codebase for any remaining references to `/api/images/` and remove or update them

**Relevant Context**  
- `app/api/images/[id]/route.ts` — file to delete
- `app/api/content/route.ts` — previously contained `imageUrl()` which built these URLs (removed in Sub-Task 5)

**Status** — `[ ] pending`

---

### Sub-Task 7 — Run migration against production and verify

**Intent**  
Execute the schema migration SQL and data migration script against the production Neon
database, verify all images are accessible via R2 public URLs, and confirm the `data`
column has been dropped.

**Expected Outcomes**  
- All `images` rows have a non-null `blob_url`
- `images.data` column no longer exists
- The live site loads all photos correctly from R2 URLs
- Neon storage usage has dropped significantly

**Todo List**  
1. Complete the Cloudflare R2 one-time setup (bucket, public access, API token) described above
2. Run `scripts/migrate-add-blob-url.sql` in the Neon SQL Editor to add the `blob_url` column
3. Set all five `R2_*` environment variables in the production Vercel environment
   (Dashboard → Project → Settings → Environment Variables)
4. Deploy the updated application code (Sub-Tasks 4 and 5) to Vercel
5. Run `node scripts/migrate-images-to-r2.mjs` locally pointing at the production `DATABASE_URL`
   and R2 credentials
6. Verify: open the live site and confirm images load from R2 URLs
7. Verify: check Neon storage usage has decreased
8. The `data` column will have been dropped automatically by the migration script

**Relevant Context**  
- `scripts/migrate-add-blob-url.sql` — schema migration (Sub-Task 2)
- `scripts/migrate-images-to-r2.mjs` — data migration (Sub-Task 3)
- `.env.local` — all R2 env vars must be set before running the data migration

**Status** — `[ ] pending`
