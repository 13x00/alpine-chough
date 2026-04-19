#!/usr/bin/env node
/**
 * seed-from-json.mjs
 *
 * Reads a content JSON file (default public/content.json) and public image files, inserts into Neon Postgres
 * (images, photos, collections, collection_images, content_items).
 *
 * Idempotent / append-friendly:
 * - images: reuse row by filename (same path as stored in DB); no re-read if found.
 *   If the file on disk changes but the path is unchanged, the DB blob is not updated.
 * - photos: reuse row by title; skips insert if title exists (keeps existing image_id/metadata).
 * - collections: reuse row by slug; skips insert if slug exists; gallery rows are replaced
 *   from JSON (DELETE collection_images for that id, then INSERT).
 * - content_items: does NOT wipe the table. New rows use sort_order after current MAX.
 *   Skips INSERT if that photo_id or collection_id is already in content_items (no duplicate nav).
 *
 * Prereqs:
 *   1. Run scripts/schema.sql in Neon (SQL Editor) for database alpine_chough.
 *   2. DATABASE_URL: loaded from .env.local at project root (via dotenv), or export in the shell.
 *   Optional: ENABLE_COLLECTIONS=true seeds collection entries (default skips them).
 *
 * Usage: node scripts/seed-from-json.mjs [path-to-content.json]
 *        (from project root; DATABASE_URL must be set)
 *
 * Content file:
 *   - Omit argument → public/content.json
 *   - Bare filename (no slash) → public/<filename> (e.g. content-collection.json)
 *   - Relative path with / or ./ → resolved from project root (e.g. public/foo.json)
 *   - Absolute path → used as-is
 *
 * npm: npm run db:seed -- public/content-collection.json
 */

import { readFile } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { neon } from '@neondatabase/serverless'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const root = join(__dirname, '..')
const publicDir = join(root, 'public')

dotenv.config({ path: join(root, '.env.local') })

/** @param {string | undefined} arg process.argv[2] after filtering flags */
function resolveContentJsonPath(arg) {
  if (!arg) return join(publicDir, 'content.json')
  if (isAbsolute(arg)) return arg
  if (arg.includes('/') || arg.startsWith('.')) return resolve(root, arg)
  return join(publicDir, arg)
}

const MIME_BY_EXT = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
}

function contentTypeFromPath(filePath) {
  const ext = filePath.slice(filePath.lastIndexOf('.'))
  return MIME_BY_EXT[ext] ?? 'application/octet-stream'
}

/** Same normalization as stored `images.filename` */
function jsonPathToFilename(jsonPath) {
  return jsonPath.replace(/^\//, '')
}

/** Resolve JSON path (e.g. /photos/x.webp) to absolute file path under public/ */
function resolvePublicPath(jsonPath) {
  const relative = jsonPath.startsWith('/') ? jsonPath.slice(1) : jsonPath
  return join(publicDir, relative)
}

async function ensureImage(sql, jsonPath) {
  const filename = jsonPathToFilename(jsonPath)
  const existing = await sql`
    SELECT id FROM images WHERE filename = ${filename} LIMIT 1
  `
  if (existing[0]) return existing[0].id

  const filePath = resolvePublicPath(jsonPath)
  let data
  try {
    data = await readFile(filePath)
  } catch (err) {
    throw new Error(`Cannot read image ${jsonPath} at ${filePath}: ${err.message}`)
  }
  const content_type = contentTypeFromPath(filePath)
  const rows = await sql`
    INSERT INTO images (data, content_type, filename)
    VALUES (${data}, ${content_type}, ${filename})
    RETURNING id
  `
  return rows[0].id
}

async function findPhotoIdByTitle(sql, title) {
  const rows = await sql`SELECT id FROM photos WHERE title = ${title} LIMIT 1`
  return rows[0]?.id ?? null
}

async function findCollectionIdBySlug(sql, slug) {
  const rows = await sql`SELECT id FROM collections WHERE slug = ${slug} LIMIT 1`
  return rows[0]?.id ?? null
}

async function contentItemExistsForPhoto(sql, photoId) {
  const rows = await sql`
    SELECT 1 FROM content_items WHERE photo_id = ${photoId}::uuid LIMIT 1
  `
  return rows.length > 0
}

async function contentItemExistsForCollection(sql, collectionId) {
  const rows = await sql`
    SELECT 1 FROM content_items WHERE collection_id = ${collectionId}::uuid LIMIT 1
  `
  return rows.length > 0
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== '--')
  if (args[0] === '-h' || args[0] === '--help') {
    console.log(`Usage: node scripts/seed-from-json.mjs [path-to-content.json]

  (no arg)     → public/content.json
  my.json      → public/my.json
  public/x.json → project-root/public/x.json

npm run db:seed -- content-collection.json`)
    process.exit(0)
  }
  if (args.length > 1) {
    console.error('Too many arguments. Pass at most one content JSON path.')
    process.exit(1)
  }

  const contentJsonPath = resolveContentJsonPath(args[0])

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error(
      'DATABASE_URL is not set. Add it to .env.local at the project root (loaded automatically) or export it before running.'
    )
    process.exit(1)
  }

  const sql = neon(databaseUrl)

  let content
  try {
    const raw = await readFile(contentJsonPath, 'utf-8')
    content = JSON.parse(raw)
  } catch (err) {
    console.error(`Failed to read or parse ${contentJsonPath}:`, err.message)
    process.exit(1)
  }

  const items = content.items
  if (!Array.isArray(items)) {
    console.error(`"${contentJsonPath}" must contain an "items" array.`)
    process.exit(1)
  }

  const collectionsEnabled = process.env.ENABLE_COLLECTIONS === 'true'
  const collectionSkipCount = items.filter((x) => x.type === 'collection').length
  if (!collectionsEnabled && collectionSkipCount > 0) {
    console.log(
      `  Note: ${collectionSkipCount} collection entries skipped (set ENABLE_COLLECTIONS=true to seed them).`
    )
  }

  const maxRows = await sql`
    SELECT COALESCE(MAX(sort_order), -1) AS m FROM content_items
  `
  let nextSort = Number(maxRows[0].m) + 1

  console.log(`Seeding from ${contentJsonPath}`)
  console.log(`  ${items.length} content items (next sort_order starts at ${nextSort})...`)

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.type === 'photo') {
      let photoId = await findPhotoIdByTitle(sql, item.title)
      if (photoId) {
        console.log(`  Photo exists (by title), skip insert: ${item.title}`)
      } else {
        const imageId = await ensureImage(sql, item.image)
        const photoRows = await sql`
          INSERT INTO photos (title, image_id, description, date, tags)
          VALUES (
            ${item.title},
            ${imageId}::uuid,
            ${item.description || null},
            ${item.date || null},
            ${item.tags?.length ? item.tags : null}
          )
          RETURNING id
        `
        photoId = photoRows[0].id
        console.log(`  Photo inserted: ${item.title} (${photoId})`)
      }

      if (await contentItemExistsForPhoto(sql, photoId)) {
        console.log(`    content_item skipped (photo already in nav): ${item.title}`)
        continue
      }
      await sql`
        INSERT INTO content_items (sort_order, item_type, photo_id, collection_id)
        VALUES (${nextSort}, 'photo', ${photoId}::uuid, NULL)
      `
      console.log(`    content_item added at sort_order ${nextSort}`)
      nextSort += 1
    } else if (item.type === 'collection') {
      if (!collectionsEnabled) continue
      let collectionId = await findCollectionIdBySlug(sql, item.slug)
      if (collectionId) {
        console.log(`  Collection exists (by slug), skip insert: ${item.slug}`)
      } else {
        const coverImageId = await ensureImage(sql, item.coverImage)
        const collectionRows = await sql`
          INSERT INTO collections (title, slug, description, cover_image_id)
          VALUES (
            ${item.title},
            ${item.slug},
            ${item.description || null},
            ${coverImageId}::uuid
          )
          RETURNING id
        `
        collectionId = collectionRows[0].id
        console.log(`  Collection inserted: ${item.title} (${collectionId})`)
      }

      await sql`
        DELETE FROM collection_images WHERE collection_id = ${collectionId}::uuid
      `
      const imageIds = []
      for (const entry of item.images ?? []) {
        const imgPath = typeof entry === 'string' ? entry : entry?.image
        if (!imgPath) {
          console.warn(`    Skipping invalid gallery entry in ${item.slug}`)
          continue
        }
        const imgId = await ensureImage(sql, imgPath)
        imageIds.push(imgId)
      }
      for (let j = 0; j < imageIds.length; j++) {
        await sql`
          INSERT INTO collection_images (collection_id, image_id, sort_order)
          VALUES (${collectionId}::uuid, ${imageIds[j]}::uuid, ${j})
        `
      }
      console.log(`    Gallery rows: ${imageIds.length}`)

      if (await contentItemExistsForCollection(sql, collectionId)) {
        console.log(`    content_item skipped (collection already in nav): ${item.slug}`)
        continue
      }
      await sql`
        INSERT INTO content_items (sort_order, item_type, photo_id, collection_id)
        VALUES (${nextSort}, 'collection', NULL, ${collectionId}::uuid)
      `
      console.log(`    content_item added at sort_order ${nextSort}`)
      nextSort += 1
    } else {
      console.warn(`  Unknown item type "${item.type}" at index ${i}, skipping.`)
    }
  }

  console.log('Seed complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
