#!/usr/bin/env node
/**
 * scripts/migrate-images-to-r2.mjs
 *
 * One-off migration: reads all images where blob_url IS NULL from Neon Postgres,
 * uploads each buffer to Cloudflare R2, writes the public URL back to the row,
 * then drops the `data` BYTEA column once all rows are migrated.
 *
 * Idempotent: re-running after a partial failure skips already-migrated rows.
 *
 * Prerequisites:
 *   1. Run scripts/migrate-add-blob-url.sql against the Neon database first
 *   2. Set all required environment variables (see below)
 *
 * Usage:
 *   node scripts/migrate-images-to-r2.mjs
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { neon } from '@neondatabase/serverless'

// ---------------------------------------------------------------------------
// Environment validation
// ---------------------------------------------------------------------------

const required = [
  'DATABASE_URL',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_PUBLIC_URL',
]

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`)
    process.exit(1)
  }
}

const {
  DATABASE_URL,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} = process.env

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

const sql = neon(DATABASE_URL)

// ---------------------------------------------------------------------------
// Migration
// ---------------------------------------------------------------------------

async function main() {
  console.log('Fetching images with no blob_url...')

  const rows = await sql`
    SELECT id, data, content_type, filename
    FROM images
    WHERE blob_url IS NULL
  `

  if (rows.length === 0) {
    console.log('No images to migrate.')
  } else {
    console.log(`Found ${rows.length} image(s) to migrate.\n`)

    for (const row of rows) {
      const { id, data, content_type, filename } = row
      const key = filename ?? id

      process.stdout.write(`  Uploading ${key} ... `)

      const buffer = data instanceof Buffer ? data : Buffer.from(data)

      await s3.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: content_type ?? 'application/octet-stream',
        })
      )

      const publicUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`

      await sql`
        UPDATE images SET blob_url = ${publicUrl} WHERE id = ${id}::uuid
      `

      console.log(`done → ${publicUrl}`)
    }

    console.log(`\nMigrated ${rows.length} image(s).`)
  }

  // Verify no rows remain without a blob_url before dropping the column
  const remaining = await sql`SELECT COUNT(*) AS n FROM images WHERE blob_url IS NULL`
  const count = Number(remaining[0].n)

  if (count > 0) {
    console.error(`\n${count} row(s) still have no blob_url — not dropping data column. Fix errors and re-run.`)
    process.exit(1)
  }

  console.log('\nDropping data BYTEA column...')
  await sql`ALTER TABLE images DROP COLUMN IF EXISTS data`
  console.log('Done. Migration complete.')
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
