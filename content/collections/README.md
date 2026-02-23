# Image collections

Each collection has:

- **`content/collections/<slug>/collection.json`** — Metadata: `id`, `title`, `slug`, `description`, `coverImage`, `images` (array of paths).
- **`public/collections/<slug>/`** — Image files for that collection. Paths in `collection.json` are relative to `public` (e.g. `/collections/image-collection-01/01.jpg`).

## Adding images to a collection

1. Put image files in `public/collections/<slug>/` (e.g. `public/collections/image-collection-01/`).
2. Optionally list them in `collection.json` under `images`, e.g. `["/collections/image-collection-01/01.jpg", ...]`, or leave `images` empty to auto-display all assets in that folder.

## Image collection 01

- **Slug:** `image-collection-01`
- **Description:** British GP photo collection — panning shots, rain, crowd and pit lane; Lewis Hamilton victory.
