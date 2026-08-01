# Neon Database Setup Guide

## Overview

This guide walks through creating a fresh Neon PostgreSQL database for Alpine Chough, applying the schema, and connecting it to the application. Follow this when setting up a new environment (local dev, staging, or production).

## What is Neon?

[Neon](https://neon.tech) is a serverless PostgreSQL platform. The free tier provides:

- 512 MB storage (metadata only — images are stored in Cloudflare R2)
- 0.5 CPU compute hours/month
- Automatic scaling to zero when idle
- Branching (useful for staging environments)

---

## Step 1: Create a Neon Account and Project

1. Go to [console.neon.tech](https://console.neon.tech) and sign up or log in
2. Click **New Project**
3. Fill in:
   - **Project name**: `alpine-chough` (or any name)
   - **Database name**: `alpine_chough`
   - **Region**: choose closest to your deployment region (e.g. `eu-west-2` for Europe)
   - **Postgres version**: 16 (or latest)
4. Click **Create Project**

Neon will provision a project with a default `main` branch and display your connection details.

---

## Step 2: Get the Connection String

1. In the Neon Console, go to your project dashboard
2. Click **Connect** (top right) or find the **Connection string** panel
3. Select:
   - **Branch**: `main`
   - **Database**: `alpine_chough`
   - **Role**: `neondb_owner`
   - **Connection type**: `Pooled connection` (recommended for serverless/edge)
4. Copy the connection string — it looks like:

```
postgresql://neondb_owner:<password>@<host>-pooler.eu-west-2.aws.neon.tech/alpine_chough?sslmode=require&channel_binding=require
```

> **Keep this string private.** It contains your database password. Never commit it to git.

---

## Step 3: Apply the Schema

The schema file at [`scripts/schema.sql`](../scripts/schema.sql) creates all required tables. Run it once against your new database.

### Option A — Neon SQL Editor (recommended, no local tools needed)

1. In the Neon Console, click **SQL Editor** in the left sidebar
2. Make sure the correct branch (`main`) and database (`alpine_chough`) are selected
3. Open [`scripts/schema.sql`](../scripts/schema.sql), copy the entire contents
4. Paste into the SQL Editor and click **Run**

You should see a success message with no errors.

### Option B — psql (local)

If you have `psql` installed:

```bash
psql "postgresql://neondb_owner:<password>@<host>-pooler.eu-west-2.aws.neon.tech/alpine_chough?sslmode=require" \
  -f scripts/schema.sql
```

### Verify the schema

Run this in the SQL Editor to confirm all tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected output:

```
 table_name
──────────────────────
 collection_images
 collections
 content_items
 drive_processed_files
 drive_webhook_channel
 images
 photos
```

---

## Step 4: Configure the Environment Variable

Add the connection string to your `.env.local` file at the project root:

```bash
# Neon Postgres (database: alpine_chough)
# Get your connection string from https://console.neon.tech
DATABASE_URL=postgresql://neondb_owner:<password>@<host>-pooler.eu-west-2.aws.neon.tech/alpine_chough?sslmode=require&channel_binding=require
```

### For Vercel deployment

Add `DATABASE_URL` to your Vercel project environment variables:

1. Go to [vercel.com](https://vercel.com) → Your Project → **Settings** → **Environment Variables**
2. Add `DATABASE_URL` with the connection string from Step 2
3. Set the environment scope to **Production**, **Preview**, and **Development** as needed
4. Redeploy for the variable to take effect

---

## Database Schema Reference

The following tables are created by [`scripts/schema.sql`](../scripts/schema.sql):

### `images`
Stores metadata and the Cloudflare R2 URL for each image. Binary data is **not** stored in the database.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `UUID` PK | Auto-generated identifier |
| `blob_url` | `TEXT NOT NULL` | Public Cloudflare R2 URL for the image file |
| `content_type` | `TEXT NOT NULL` | MIME type (e.g. `image/jpeg`) |
| `filename` | `TEXT` | Original filename, used to detect duplicates |

### `photos`
Individual photo entries.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `UUID` PK | Auto-generated identifier |
| `title` | `TEXT NOT NULL` | Display title |
| `image_id` | `UUID` FK → `images` | The associated image |
| `description` | `TEXT` | Optional caption |
| `date` | `DATE` | Optional photo date |
| `tags` | `TEXT[]` | Optional array of tags |
| `created_at` | `TIMESTAMPTZ` | Insertion timestamp |

### `collections`
Photo collections (galleries).

| Column | Type | Description |
|--------|------|-------------|
| `id` | `UUID` PK | Auto-generated identifier |
| `title` | `TEXT NOT NULL` | Display title |
| `slug` | `TEXT NOT NULL UNIQUE` | URL-safe identifier |
| `description` | `TEXT` | Optional description |
| `cover_image_id` | `UUID` FK → `images` | Cover image for the collection |
| `created_at` | `TIMESTAMPTZ` | Insertion timestamp |

### `collection_images`
Junction table linking images to collections, with ordering.

| Column | Type | Description |
|--------|------|-------------|
| `collection_id` | `UUID` FK → `collections` | The parent collection |
| `image_id` | `UUID` FK → `images` | The image in the gallery |
| `sort_order` | `INT` | Display order (ascending) |

### `content_items`
Global ordered list of all content — photos and collections interleaved.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `UUID` PK | Auto-generated identifier |
| `sort_order` | `INT NOT NULL` | Display order (ascending) |
| `item_type` | `TEXT` | Either `'photo'` or `'collection'` |
| `photo_id` | `UUID` FK → `photos` | Set when `item_type = 'photo'` |
| `collection_id` | `UUID` FK → `collections` | Set when `item_type = 'collection'` |

### `drive_processed_files`
Tracks Google Drive file IDs that have already been ingested, preventing duplicate processing.

| Column | Type | Description |
|--------|------|-------------|
| `drive_file_id` | `TEXT` PK | Google Drive file/folder ID |
| `filename` | `TEXT NOT NULL` | Original filename |
| `processed_at` | `TIMESTAMPTZ` | When it was ingested |

### `drive_webhook_channel`
Single-row table storing the active Google Drive push notification channel.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `INT` PK | Always `1` (single-row table) |
| `channel_id` | `TEXT NOT NULL` | Google Drive channel UUID |
| `resource_id` | `TEXT NOT NULL` | Google Drive resource ID |
| `expires_at` | `TIMESTAMPTZ NOT NULL` | When the channel expires |
| `updated_at` | `TIMESTAMPTZ` | Last renewal timestamp |

---

## Migrating an Existing Database

If you are migrating from an older version of this project that stored image binary data (`BYTEA`) in the database, follow the R2 migration guide:

1. **Add the `blob_url` column** — run [`scripts/migrate-add-blob-url.sql`](../scripts/migrate-add-blob-url.sql) in the Neon SQL Editor:

   ```sql
   ALTER TABLE images ADD COLUMN IF NOT EXISTS blob_url TEXT;
   ```

2. **Upload existing images to R2 and backfill URLs** — see the [Cloudflare R2 setup guide](./cloudflare-r2-setup.md) for prerequisites, then run:

   ```bash
   node scripts/migrate-images-to-r2.mjs
   ```

   This script uploads all BYTEA images to R2, writes the public URL back into `blob_url`, and drops the `data` column once every row is migrated. It is idempotent — safe to re-run if interrupted.

---

## Troubleshooting

### Connection refused / SSL errors

Ensure the connection string includes `?sslmode=require`. Neon requires TLS for all connections.

### "database does not exist"

The database name in the connection string must match exactly. The default Neon database is named `neondb` — if you created the database as `alpine_chough`, make sure that name appears in the URL path (`.../alpine_chough?...`).

### Schema already exists

The schema uses `CREATE TABLE IF NOT EXISTS` throughout, so re-running `schema.sql` on an existing database is safe — it will not overwrite or duplicate data.

### Checking storage usage

In the Neon Console, go to **Project Settings** → **Storage** to see current usage against the free tier limit. Because images are now stored in Cloudflare R2, only metadata (UUIDs, text fields, timestamps) counts against Neon storage — usage should stay well below the 512 MB free limit.

### Resetting the database (destructive)

To wipe all content and start fresh:

```sql
-- Run in the Neon SQL Editor — this deletes all data
TRUNCATE content_items, collection_images, collections, photos, images, drive_processed_files RESTART IDENTITY CASCADE;
DELETE FROM drive_webhook_channel;
```

Or drop and recreate all tables by running `schema.sql` after a manual `DROP TABLE` for each table.
