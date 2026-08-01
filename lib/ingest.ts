/**
 * lib/ingest.ts
 *
 * Google Drive → Neon DB ingestion pipeline.
 *
 * Scans the Drive `upload/` folder for:
 *   - Flat image files → individual `photos` rows
 *   - Subfolders       → `collections` rows (images inside = gallery items)
 *   - metadata.json at root of upload/ → per-photo title/description/date/tags
 *   - collection.json inside a subfolder → collection metadata and image order
 *
 * After a successful DB insert each Drive file/folder is moved to `processed/`.
 * Drive file IDs are recorded in `drive_processed_files` to prevent re-ingestion.
 */

import sharp from 'sharp'
import { neon } from '@neondatabase/serverless'
import type { NeonQueryFunction } from '@neondatabase/serverless'
import { uploadToR2 } from './r2'
import {
  getDriveClient,
  listFolder,
  downloadFile,
  downloadText,
  moveFile,
  isImageMime,
  isJsonFile,
  isFolder,
  type DriveFile,
} from './drive'
import type { drive_v3 } from 'googleapis'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PhotoMeta {
  title?: string
  description?: string
  date?: string
  tags?: string[]
}

/** Shape of an optional metadata.json at the root of the upload folder. */
interface RootMetadata {
  [filename: string]: PhotoMeta
}

/** Shape of an optional collection.json inside a collection subfolder. */
interface CollectionMeta {
  title?: string
  slug?: string
  description?: string
  cover?: string
  order?: string[]
}

export interface IngestResult {
  processed: number
  skipped: number
  errors: string[]
}

// ---------------------------------------------------------------------------
// Helpers — image quality mirrors compress-images.mjs settings
// Sharp strips metadata by default (no withMetadata() call needed).
// ---------------------------------------------------------------------------

/**
 * Compresses an image buffer using Sharp and returns the output buffer.
 * WebP originals stay as WebP; everything else is converted to JPEG.
 */
async function compressImage(
  input: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; contentType: string }> {
  const base = sharp(input).resize(3840, 3840, {
    fit: 'inside',
    withoutEnlargement: true,
  })

  if (mimeType === 'image/webp') {
    const buffer = await base.webp({ quality: 80, effort: 6 }).toBuffer()
    return { buffer, contentType: 'image/webp' }
  }
  const buffer = await base
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toBuffer()
  return { buffer, contentType: 'image/jpeg' }
}

// ---------------------------------------------------------------------------
// Helpers — Neon DB (mirrors seed-from-json.mjs logic)
// ---------------------------------------------------------------------------

type Sql = NeonQueryFunction<false, false>

async function isAlreadyProcessed(sql: Sql, driveFileId: string): Promise<boolean> {
  const rows = (await sql`
    SELECT 1 FROM drive_processed_files WHERE drive_file_id = ${driveFileId} LIMIT 1
  `) as unknown[]
  return rows.length > 0
}

async function markProcessed(sql: Sql, driveFileId: string, filename: string): Promise<void> {
  await sql`
    INSERT INTO drive_processed_files (drive_file_id, filename)
    VALUES (${driveFileId}, ${filename})
    ON CONFLICT DO NOTHING
  `
}

async function ensureImageInDb(
  sql: Sql,
  buffer: Buffer,
  contentType: string,
  filename: string
): Promise<string> {
  const existing = (await sql`
    SELECT id FROM images WHERE filename = ${filename} LIMIT 1
  `) as { id: string }[]
  if (existing[0]) return existing[0].id

  const blobUrl = await uploadToR2(buffer, contentType, filename)

  const rows = (await sql`
    INSERT INTO images (blob_url, content_type, filename)
    VALUES (${blobUrl}, ${contentType}, ${filename})
    RETURNING id
  `) as { id: string }[]
  return rows[0].id
}

async function findPhotoIdByTitle(sql: Sql, title: string): Promise<string | null> {
  const rows = (await sql`SELECT id FROM photos WHERE title = ${title} LIMIT 1`) as {
    id: string
  }[]
  return rows[0]?.id ?? null
}

async function findCollectionIdBySlug(sql: Sql, slug: string): Promise<string | null> {
  const rows = (await sql`
    SELECT id FROM collections WHERE slug = ${slug} LIMIT 1
  `) as { id: string }[]
  return rows[0]?.id ?? null
}

async function contentItemExistsForPhoto(sql: Sql, photoId: string): Promise<boolean> {
  const rows = (await sql`
    SELECT 1 FROM content_items WHERE photo_id = ${photoId}::uuid LIMIT 1
  `) as unknown[]
  return rows.length > 0
}

async function contentItemExistsForCollection(
  sql: Sql,
  collectionId: string
): Promise<boolean> {
  const rows = (await sql`
    SELECT 1 FROM content_items WHERE collection_id = ${collectionId}::uuid LIMIT 1
  `) as unknown[]
  return rows.length > 0
}

async function nextSortOrder(sql: Sql): Promise<number> {
  const rows = (await sql`
    SELECT COALESCE(MAX(sort_order), -1) AS m FROM content_items
  `) as { m: number | string }[]
  return Number(rows[0].m) + 1
}

// ---------------------------------------------------------------------------
// Photo ingestion
// ---------------------------------------------------------------------------

async function ingestPhoto(
  sql: Sql,
  drive: drive_v3.Drive,
  file: DriveFile,
  uploadFolderId: string,
  processedFolderId: string,
  meta: PhotoMeta,
  log: (msg: string) => void
): Promise<void> {
  const filename = file.name!
  const title = meta.title ?? filename.replace(/\.[^.]+$/, '')

  log(`  Photo: ${filename} → "${title}"`)

  const rawBuffer = await downloadFile(drive, file.id!)
  const mimeType = file.mimeType ?? 'image/jpeg'
  const { buffer, contentType } = await compressImage(rawBuffer, mimeType)

  const imageId = await ensureImageInDb(sql, buffer, contentType, `drive/${filename}`)

  let photoId = await findPhotoIdByTitle(sql, title)
  if (photoId) {
    log(`    Photo already in DB (by title), skipping insert`)
  } else {
    const rows = (await sql`
      INSERT INTO photos (title, image_id, description, date, tags)
      VALUES (
        ${title},
        ${imageId}::uuid,
        ${meta.description ?? null},
        ${meta.date ?? null},
        ${meta.tags?.length ? meta.tags : null}
      )
      RETURNING id
    `) as { id: string }[]
    photoId = rows[0].id
    log(`    Inserted photo ${photoId}`)
  }

  if (await contentItemExistsForPhoto(sql, photoId)) {
    log(`    content_item already exists, skipping`)
  } else {
    const sortOrder = await nextSortOrder(sql)
    try {
      // Try with ON CONFLICT first (requires unique index from migration)
      await sql`
        INSERT INTO content_items (sort_order, item_type, photo_id, collection_id)
        VALUES (${sortOrder}, 'photo', ${photoId}::uuid, NULL)
        ON CONFLICT (photo_id) WHERE photo_id IS NOT NULL DO NOTHING
      `
      log(`    Added content_item at sort_order ${sortOrder}`)
    } catch (err) {
      // If ON CONFLICT fails (no index yet), try without it
      const errMsg = err instanceof Error ? err.message : String(err)
      if (errMsg.includes('no unique or exclusion constraint')) {
        try {
          // Double-check it doesn't exist before inserting
          if (!(await contentItemExistsForPhoto(sql, photoId))) {
            await sql`
              INSERT INTO content_items (sort_order, item_type, photo_id, collection_id)
              VALUES (${sortOrder}, 'photo', ${photoId}::uuid, NULL)
            `
            log(`    Added content_item at sort_order ${sortOrder}`)
          } else {
            log(`    content_item was created by another process, skipping`)
          }
        } catch (insertErr) {
          log(`    Warning: content_item insert failed: ${insertErr instanceof Error ? insertErr.message : String(insertErr)}`)
        }
      } else {
        log(`    Warning: content_item insert failed: ${errMsg}`)
      }
    }
  }

  await markProcessed(sql, file.id!, filename)
  await moveFile(drive, file.id!, uploadFolderId, processedFolderId)
  log(`    Moved to processed/`)
}

// ---------------------------------------------------------------------------
// Collection ingestion
// ---------------------------------------------------------------------------

async function ingestCollection(
  sql: Sql,
  drive: drive_v3.Drive,
  folder: DriveFile,
  uploadFolderId: string,
  processedFolderId: string,
  log: (msg: string) => void
): Promise<void> {
  const folderName = folder.name!
  log(`  Collection folder: ${folderName}`)

  const children = await listFolder(drive, folder.id!)

  // Load optional collection.json
  const metaFile = children.find((f) => isJsonFile(f.name))
  let meta: CollectionMeta = {}
  if (metaFile?.id) {
    try {
      meta = JSON.parse(await downloadText(drive, metaFile.id)) as CollectionMeta
    } catch {
      log(`    Warning: could not parse ${metaFile.name}, using defaults`)
    }
  }

  const title = meta.title ?? folderName
  const slug =
    meta.slug ??
    folderName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

  // Collect image files, respecting explicit order from collection.json
  const imageFiles = children.filter((f) => isImageMime(f.mimeType))
  const orderedImages = meta.order
    ? [
        ...meta.order
          .map((name) => imageFiles.find((f) => f.name === name))
          .filter((f): f is DriveFile => f !== undefined),
        ...imageFiles.filter((f) => !meta.order!.includes(f.name!)),
      ]
    : imageFiles

  const coverName = meta.cover ?? orderedImages[0]?.name
  const coverFile = imageFiles.find((f) => f.name === coverName) ?? orderedImages[0]

  if (!coverFile) {
    log(`    No images found in collection folder "${folderName}", skipping`)
    return
  }

  const coverBuffer = await downloadFile(drive, coverFile.id!)
  const coverMime = coverFile.mimeType ?? 'image/jpeg'
  const { buffer: coverCompressed, contentType: coverContentType } = await compressImage(
    coverBuffer,
    coverMime
  )
  const coverImageId = await ensureImageInDb(
    sql,
    coverCompressed,
    coverContentType,
    `drive/${folderName}/${coverFile.name}`
  )

  let collectionId = await findCollectionIdBySlug(sql, slug)
  if (collectionId) {
    log(`    Collection already exists (slug: ${slug}), updating gallery`)
  } else {
    const rows = (await sql`
      INSERT INTO collections (title, slug, description, cover_image_id)
      VALUES (
        ${title},
        ${slug},
        ${meta.description ?? null},
        ${coverImageId}::uuid
      )
      RETURNING id
    `) as { id: string }[]
    collectionId = rows[0].id
    log(`    Inserted collection ${collectionId}`)
  }

  // Replace gallery images
  await sql`DELETE FROM collection_images WHERE collection_id = ${collectionId}::uuid`

  for (let i = 0; i < orderedImages.length; i++) {
    const imgFile = orderedImages[i]
    const imgBuffer = await downloadFile(drive, imgFile.id!)
    const imgMime = imgFile.mimeType ?? 'image/jpeg'
    const { buffer: imgCompressed, contentType: imgContentType } = await compressImage(
      imgBuffer,
      imgMime
    )
    const imgId = await ensureImageInDb(
      sql,
      imgCompressed,
      imgContentType,
      `drive/${folderName}/${imgFile.name}`
    )
    await sql`
      INSERT INTO collection_images (collection_id, image_id, sort_order)
      VALUES (${collectionId}::uuid, ${imgId}::uuid, ${i})
    `
  }
  log(`    Gallery rows: ${orderedImages.length}`)

  if (await contentItemExistsForCollection(sql, collectionId)) {
    log(`    content_item already exists, skipping`)
  } else {
    const sortOrder = await nextSortOrder(sql)
    try {
      // Try with ON CONFLICT first (requires unique index from migration)
      await sql`
        INSERT INTO content_items (sort_order, item_type, photo_id, collection_id)
        VALUES (${sortOrder}, 'collection', NULL, ${collectionId}::uuid)
        ON CONFLICT (collection_id) WHERE collection_id IS NOT NULL DO NOTHING
      `
      log(`    Added content_item at sort_order ${sortOrder}`)
    } catch (err) {
      // If ON CONFLICT fails (no index yet), try without it
      const errMsg = err instanceof Error ? err.message : String(err)
      if (errMsg.includes('no unique or exclusion constraint')) {
        try {
          // Double-check it doesn't exist before inserting
          if (!(await contentItemExistsForCollection(sql, collectionId))) {
            await sql`
              INSERT INTO content_items (sort_order, item_type, photo_id, collection_id)
              VALUES (${sortOrder}, 'collection', NULL, ${collectionId}::uuid)
            `
            log(`    Added content_item at sort_order ${sortOrder}`)
          } else {
            log(`    content_item was created by another process, skipping`)
          }
        } catch (insertErr) {
          log(`    Warning: content_item insert failed: ${insertErr instanceof Error ? insertErr.message : String(insertErr)}`)
        }
      } else {
        log(`    Warning: content_item insert failed: ${errMsg}`)
      }
    }
  }

  await markProcessed(sql, folder.id!, folderName)
  await moveFile(drive, folder.id!, uploadFolderId, processedFolderId)
  log(`    Moved to processed/`)
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Runs the full ingest pipeline.
 * Pass a `logger` for custom output (defaults to console.log).
 */
export async function runIngest(
  logger: (msg: string) => void = console.log
): Promise<IngestResult> {
  const uploadFolderId = process.env.GOOGLE_DRIVE_UPLOAD_FOLDER_ID
  const processedFolderId = process.env.GOOGLE_DRIVE_PROCESSED_FOLDER_ID
  const databaseUrl = process.env.DATABASE_URL

  if (!uploadFolderId) throw new Error('GOOGLE_DRIVE_UPLOAD_FOLDER_ID is not set')
  if (!processedFolderId) throw new Error('GOOGLE_DRIVE_PROCESSED_FOLDER_ID is not set')
  if (!databaseUrl) throw new Error('DATABASE_URL is not set')

  const drive = getDriveClient()
  const sql = neon(databaseUrl)

  const files = await listFolder(drive, uploadFolderId)
  logger(`Drive ingest: ${files.length} item(s) in upload/`)

  const result: IngestResult = { processed: 0, skipped: 0, errors: [] }

  // Parse optional root-level metadata.json first
  const metaFile = files.find((f) => isJsonFile(f.name) && !isFolder(f.mimeType))
  let rootMeta: RootMetadata = {}
  if (metaFile?.id) {
    try {
      rootMeta = JSON.parse(await downloadText(drive, metaFile.id)) as RootMetadata
      logger(`  Loaded metadata.json`)
    } catch {
      logger(`  Warning: could not parse metadata.json`)
    }
  }

  for (const file of files) {
    if (isJsonFile(file.name)) continue

    try {
      if (isFolder(file.mimeType)) {
        if (await isAlreadyProcessed(sql, file.id!)) {
          logger(`  Skipping (already processed): ${file.name}/`)
          result.skipped++
          continue
        }
        await ingestCollection(sql, drive, file, uploadFolderId, processedFolderId, logger)
        result.processed++
      } else if (isImageMime(file.mimeType)) {
        if (await isAlreadyProcessed(sql, file.id!)) {
          logger(`  Skipping (already processed): ${file.name}`)
          result.skipped++
          continue
        }
        const meta: PhotoMeta = rootMeta[file.name!] ?? {}
        await ingestPhoto(sql, drive, file, uploadFolderId, processedFolderId, meta, logger)
        result.processed++
      } else {
        logger(`  Skipping unsupported file: ${file.name} (${file.mimeType})`)
        result.skipped++
      }
    } catch (err) {
      const msg = `Error processing "${file.name}": ${err instanceof Error ? err.message : String(err)}`
      logger(`  [error] ${msg}`)
      result.errors.push(msg)
    }
  }

  logger(
    `Ingest complete — processed: ${result.processed}, skipped: ${result.skipped}, errors: ${result.errors.length}`
  )
  return result
}
