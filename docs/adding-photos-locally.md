# Adding Photos Locally

## Overview

This guide covers how to add photos to Alpine Chough from your local machine using the seed script. This is the recommended approach for initial database population or batch-adding photos outside of the Google Drive workflow.

The script reads photo metadata from [`public/content.json`](../public/content.json), reads the corresponding image files from `public/`, uploads each image to Cloudflare R2, and inserts the metadata into Neon Postgres. It is idempotent — re-running it skips anything already in the database.

---

## Prerequisites

Before running the script, ensure the following are in place:

1. **Schema applied** — `scripts/schema.sql` has been run against your Neon database  
   (see [Neon Database Setup](./neon-database-setup.md))

2. **Environment variables set** in `.env.local`:

   ```bash
   DATABASE_URL=postgresql://...
   R2_ACCOUNT_ID=...
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   R2_BUCKET_NAME=...
   R2_PUBLIC_URL=...
   ```

3. **Image files present** in `public/photos/` — the paths referenced in `content.json` must exist on disk

---

## Workflow

```
assets/originals/photos/    ← your original high-res files (gitignored)
        ↓
  npm run images:compress    ← compress + convert to WebP/JPEG
        ↓
public/photos/              ← compressed outputs committed to the repo
        ↓
  edit public/content.json   ← add entries for new photos
        ↓
  npm run db:seed            ← upload to R2, insert metadata into Neon
```

---

## Step 1: Add and compress the image

Place your original photo(s) in `assets/originals/photos/` (JPEG or PNG).

```bash
# Preview what would be compressed — no files written
npm run images:compress:dry

# Compress originals → writes .webp + .jpg outputs to public/photos/
npm run images:compress
```

This produces two files per original in `public/photos/`:
- `<name>.webp` — canonical format used by the site (quality 80)
- `<name>.jpg` — archive copy (quality 82, progressive)

Images are capped at 3840px on the longest edge, stripped of all EXIF/GPS metadata.

> The `.webp` file is the one you reference in `content.json`.

---

## Step 2: Edit `public/content.json`

Open [`public/content.json`](../public/content.json) and add an entry to the `items` array for each new photo.

### Adding a single photo

```json
{
  "type": "photo",
  "id": "unique-id",
  "title": "Sunset at the Ridge",
  "image": "/photos/DSC01234.webp",
  "description": "Golden hour looking west",
  "date": "2025-06-15",
  "tags": ["landscape", "sunset"]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | ✓ | Always `"photo"` |
| `id` | ✓ | Any unique string (used locally only, not stored in DB) |
| `title` | ✓ | Display title. Also used as the duplicate-detection key — must be unique |
| `image` | ✓ | Path to the `.webp` file under `public/` (must start with `/`) |
| `description` | | Optional caption |
| `date` | | Optional date in `YYYY-MM-DD` format |
| `tags` | | Optional array of tag strings |

### Adding a collection

To seed collections you must also set `ENABLE_COLLECTIONS=true` in `.env.local`.

```json
{
  "type": "collection",
  "id": "unique-id",
  "title": "Scotland Trip",
  "slug": "scotland-trip",
  "description": "A week in the Highlands",
  "coverImage": "/photos/DSC01200.webp",
  "images": [
    "/photos/DSC01200.webp",
    "/photos/DSC01201.webp",
    "/photos/DSC01202.webp"
  ]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | ✓ | Always `"collection"` |
| `id` | ✓ | Any unique string |
| `title` | ✓ | Display title |
| `slug` | ✓ | URL-safe identifier, must be unique (e.g. `scotland-trip`) |
| `description` | | Optional description |
| `coverImage` | ✓ | Path to the cover `.webp` file |
| `images` | ✓ | Ordered array of `.webp` paths for the gallery |

> The order of `items` in `content.json` determines the display order in the navigation. New items are appended after whatever is already in the database.

---

## Step 3: Run the seed script

```bash
npm run db:seed
```

Or pass a different content file:

```bash
npm run db:seed -- my-content.json        # reads public/my-content.json
npm run db:seed -- public/other.json      # path relative to project root
```

### What the script does

For each item in `content.json`:

1. Checks if an image with the same filename already exists in the database — skips the R2 upload if so
2. Uploads the image buffer to Cloudflare R2 and stores the public URL in Neon
3. Checks if a photo (by title) or collection (by slug) already exists — skips insert if so
4. Inserts the photo/collection metadata row
5. Adds a `content_items` entry to place it in the navigation order

### Example output

```
Seeding from /path/to/public/content.json
  42 content items (next sort_order starts at 0)...
  Photo inserted: Sunset at the Ridge (uuid...)
    content_item added at sort_order 0
  Photo inserted: Morning Mist (uuid...)
    content_item added at sort_order 1
  Photo exists (by title), skip insert: DSC00008
    content_item skipped (photo already in nav): DSC00008
  ...
Seed complete.
```

---

## Idempotency

The script is safe to re-run at any time:

| Scenario | Behaviour |
|----------|-----------|
| Image filename already in DB | Skips R2 upload, reuses existing `image_id` |
| Photo title already in DB | Skips photo insert, keeps existing metadata |
| Collection slug already in DB | Skips collection insert; replaces gallery images from JSON |
| `content_items` entry already exists for a photo/collection | Skips insert, no duplicate nav entry |

---

## Troubleshooting

### `Cannot read image /photos/DSC01234.webp`

The file `public/photos/DSC01234.webp` does not exist. Run `npm run images:compress` first to generate the compressed output from the original in `assets/originals/photos/`.

### `Missing required R2 environment variables`

One or more of the five `R2_*` variables is not set in `.env.local`. Check that all five are present and non-empty.

### `DATABASE_URL is not set`

Add `DATABASE_URL` to `.env.local`. The connection string is available from [console.neon.tech](https://console.neon.tech) — see [Neon Database Setup](./neon-database-setup.md).

### Photo appears in the database but not on the site

Check that:
1. The app is pointing at the correct `DATABASE_URL` (production vs local)
2. `ENABLE_COLLECTIONS=true` is set if the item is a collection
3. The Neon database has the schema applied (`scripts/schema.sql`)

### Uploaded to R2 but the image does not load

Verify that `R2_PUBLIC_URL` matches the public base URL shown in the Cloudflare R2 dashboard under the bucket's **Public access** settings. It should look like `https://pub-<hash>.r2.dev` (no trailing slash needed, the script handles that).
