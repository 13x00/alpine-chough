# Alpine Chough Portfolio

A style-first single-page portfolio built with Next.js, TypeScript, and Tailwind CSS. Content (photos and collections) is loaded from a Neon Postgres database when `DATABASE_URL` is configured; the UI fetches JSON from the app’s API routes.

## Features

- **Split-screen layout**: Left panel (about, ordered list, contact), right panel (portrait home and detail views)
- **Navigation list**: Scrollable cards for photos and collections (2:1 thumbnails)
- **Detail views**: Full-screen-style photo and collection detail with motion transitions
- **Portrait home**: Cycling portrait images on the home surface
- **REST API**: `GET /api/content` (ordered items + metadata) and `GET /api/images/[id]` (image bytes from the database)
- **Keyboard**: Arrow keys move between items while a detail is open (Left/Up = previous, Right/Down = next); Escape closes the detail

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. **Database (recommended for real content)**  
   Create a Neon Postgres database, run [`scripts/schema.sql`](scripts/schema.sql) in the Neon SQL Editor (or `psql`), set `DATABASE_URL` in `.env.local` (connection string from Neon), then seed from [`public/content.json`](public/content.json):

```bash
export DATABASE_URL="postgresql://..."   # or rely on your shell loading .env.local
npm run db:seed
```

Without `DATABASE_URL`, API routes cannot query the database and the home page will show a content error after load.

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app` - Next.js App Router (pages, global styles, [`app/api`](app/api) routes)
- `/components` - Reusable React components
  - `/ui` - Base UI (Typography, Surface, etc.)
  - `/layout` - SplitLayout, LeftPanel, RightPanel, detail overlay motion
  - `/content` - Portrait, detail views, nav, theme toggle
- `/hooks` - Custom hooks (e.g. `useContent`)
- `/lib` - Shared utilities ([`lib/db.ts`](lib/db.ts) — Neon client via `DATABASE_URL`)
- `/public` - Static assets, [`public/content.json`](public/content.json) (source for the seed script), portrait cycle images under `Portrait_cycle/`
- `/scripts` - [`schema.sql`](scripts/schema.sql), [`seed-from-json.mjs`](scripts/seed-from-json.mjs), image tooling
- `/types` - TypeScript definitions for content shapes

## Database model

Postgres (Neon). Canonical DDL lives in [`scripts/schema.sql`](scripts/schema.sql).

| Table | Role |
|--------|------|
| **images** | Binary image data (`data` BYTEA), `content_type`, optional `filename`. Referenced by photos and collections. |
| **photos** | `title`, `image_id` → `images`, optional `description`, `date`, `tags` (text array). |
| **collections** | `title`, unique `slug`, `description`, `cover_image_id` → `images`. |
| **collection_images** | Gallery rows: `collection_id`, `image_id`, `sort_order` (many images per collection). Primary key `(collection_id, image_id)`. |
| **content_items** | Single ordered list mixing photos and collections: `sort_order`, `item_type` (`photo` \| `collection`), and exactly one of `photo_id` or `collection_id` (enforced by a CHECK constraint). |

Indexes: `content_items(sort_order)`, `collection_images(collection_id, sort_order)`.

The app reads this structure in [`app/api/content/route.ts`](app/api/content/route.ts) and serves files from [`app/api/images/[id]/route.ts`](app/api/images/[id]/route.ts).

## Content and seeding

- Edit **[`public/content.json`](public/content.json)** to describe photos, collections, and their order (see existing entries for shape).
- Place image files under **`public/`** at the paths referenced in the JSON.
- After schema is applied and `DATABASE_URL` is set, run **`npm run db:seed`** (see [`scripts/seed-from-json.mjs`](scripts/seed-from-json.mjs)). Optional file: **`npm run db:seed -- content-collection.json`** uses `public/content-collection.json`; omit the argument to use `public/content.json`. The seed script loads **`DATABASE_URL` from `.env.local`** at the project root (via `dotenv`); you can still `export DATABASE_URL` in the shell to override.

**Idempotent seed behaviour**

- **`images`**: If a row with the same `filename` (normalized JSON path) exists, it is reused; the file is not read again. Replacing the file on disk without changing the path does **not** update stored bytes.
- **`photos`**: If a row with the same **`title`** exists, the photo is not inserted again; existing `image_id` and metadata are kept.
- **`collections`**: If a row with the same **`slug`** exists, the collection row is not inserted again; **`collection_images`** for that collection are deleted and re-inserted from the JSON gallery list each time that item is processed.
- **`content_items`**: The table is **not** cleared. New nav rows use `sort_order` values after the current maximum. A **`content_items` row is skipped** if that `photo_id` or `collection_id` is already present (avoids duplicate sidebar entries when re-seeding). You can append **only new** items in JSON and run seed again to add them at the end of the nav order.
- **Full reorder** of the whole list is not handled by the seed script alone (use SQL or another workflow if you need to rewrite order).

The home page ([`app/page.tsx`](app/page.tsx)) loads content with `fetch('/api/content')`; it does not embed mock arrays.

## Design System

The project uses a token-based design system defined in `app/styles/tokens.css`. Components reference these tokens through Tailwind CSS custom properties.

## Customization

1. **Portrait home**: Edit the `portraitImages` paths in [`components/content/PortraitView.tsx`](components/content/PortraitView.tsx) and add files under `public/` (e.g. `public/Portrait_cycle/`).
2. **Portfolio content**: Update [`public/content.json`](public/content.json) and re-run **`npm run db:seed`** (or update the database directly). Thumbnails and detail images for list items come from API URLs (`/api/images/...`) after seeding.
3. **About / copy**: Adjust [`components/content/AboutSection.tsx`](components/content/AboutSection.tsx) and related content components as needed.
4. **Design tokens**: Change colors, type, and spacing in `app/styles/tokens.css`.
5. **Layout and motion**: Tweak [`components/layout`](components/layout) and Framer Motion settings to match your taste.

## Next Steps

1. Run `npm install`.
2. Provision Neon, apply [`scripts/schema.sql`](scripts/schema.sql), set `DATABASE_URL`, and run `npm run db:seed`.
3. Customize `public/content.json`, portrait images, and about text.
4. Adjust design tokens in `app/styles/tokens.css`.
5. Run `npm run dev` for local development.
