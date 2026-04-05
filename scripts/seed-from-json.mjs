#!/usr/bin/env node
/**
 * seed-from-json.mjs
 *
 * One-off seed: reads public/content.json and public image files, inserts
 * into Neon Postgres (images, photos, collections, collection_images, content_items).
 *
 * Prereqs:
 *   1. Run scripts/schema.sql in Neon (SQL Editor) for database alpine_chough.
 *   2. Set DATABASE_URL (e.g. in .env.local or export before running).
 *
 * Usage: node scripts/seed-from-json.mjs
 *        (from project root; DATABASE_URL must be set)
 */

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { neon } from '@neondatabase/serverless'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const root = join(__dirname, '..')
const publicDir = join(root, 'public')

const CONTENT_JSON_PATH = join(publicDir, 'content.json')

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

/** Resolve JSON path (e.g. /photos/x.webp) to absolute file path under public/ */
function resolvePublicPath(jsonPath) {
  const relative = jsonPath.startsWith('/') ? jsonPath.slice(1) : jsonPath
  return join(publicDir, relative)
}

async function ensureImage(sql, jsonPath) {
  const filePath = resolvePublicPath(jsonPath)
  let data
  try {
    data = await readFile(filePath)
  } catch (err) {
    throw new Error(`Cannot read image ${jsonPath} at ${filePath}: ${err.message}`)
  }
  const content_type = contentTypeFromPath(filePath)
  const filename = jsonPath.replace(/^\//, '')
  const rows = await sql`
    INSERT INTO images (data, content_type, filename)
    VALUES (${data}, ${content_type}, ${filename})
    RETURNING id
  `
  return rows[0].id
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set. Set it in .env.local or export it before running.')
    process.exit(1)
  }

  const sql = neon(databaseUrl)

  let content
  try {
    const raw = await readFile(CONTENT_JSON_PATH, 'utf-8')
    content = JSON.parse(raw)
  } catch (err) {
    console.error('Failed to read or parse content.json:', err.message)
    process.exit(1)
  }

  const items = content.items
  if (!Array.isArray(items)) {
    console.error('content.json must have an "items" array.')
    process.exit(1)
  }

  console.log(`Seeding ${items.length} content items...`)

  for (let sortOrder = 0; sortOrder < items.length; sortOrder++) {
    const item = items[sortOrder]
    if (item.type === 'photo') {
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
      const photoId = photoRows[0].id
      await sql`
        INSERT INTO content_items (sort_order, item_type, photo_id, collection_id)
        VALUES (${sortOrder}, 'photo', ${photoId}::uuid, NULL)
      `
      console.log(`  Photo: ${item.title} (${photoId})`)
    } else if (item.type === 'collection') {
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
      const collectionId = collectionRows[0].id
      const imageIds = []
      for (const imgPath of item.images ?? []) {
        const imgId = await ensureImage(sql, imgPath)
        imageIds.push(imgId)
      }
      for (let i = 0; i < imageIds.length; i++) {
        await sql`
          INSERT INTO collection_images (collection_id, image_id, sort_order)
          VALUES (${collectionId}::uuid, ${imageIds[i]}::uuid, ${i})
        `
      }
      await sql`
        INSERT INTO content_items (sort_order, item_type, photo_id, collection_id)
        VALUES (${sortOrder}, 'collection', NULL, ${collectionId}::uuid)
      `
      console.log(`  Collection: ${item.title} (${collectionId}), ${imageIds.length} images`)
    } else {
      console.warn(`  Unknown item type "${item.type}" at index ${sortOrder}, skipping.`)
    }
  }

  console.log('Seed complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
