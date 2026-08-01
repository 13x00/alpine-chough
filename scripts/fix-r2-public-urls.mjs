#!/usr/bin/env node
/**
 * scripts/fix-r2-public-urls.mjs
 *
 * One-off fix: updates all blob_url values in the images table that use the
 * private R2 storage endpoint to use the correct public R2 CDN URL instead.
 *
 * Run this after setting the correct R2_PUBLIC_URL in .env.local.
 *
 * Usage:
 *   node scripts/fix-r2-public-urls.mjs
 */

import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const { DATABASE_URL, R2_PUBLIC_URL } = process.env

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}
if (!R2_PUBLIC_URL) {
  console.error('R2_PUBLIC_URL is not set')
  process.exit(1)
}

const publicUrl = R2_PUBLIC_URL.replace(/\/$/, '')

// Detect if URLs look like the private storage endpoint (no pub- prefix, ends in r2.cloudflarestorage.com)
if (publicUrl.includes('r2.cloudflarestorage.com')) {
  console.error(
    'R2_PUBLIC_URL still points at the private storage endpoint.\n' +
    'Go to the Cloudflare dashboard → R2 → your bucket → Settings → Public access,\n' +
    'enable it, and copy the pub-*.r2.dev URL into R2_PUBLIC_URL in .env.local.'
  )
  process.exit(1)
}

const sql = neon(DATABASE_URL)

// Find all rows whose blob_url uses the private storage endpoint
const rows = await sql`
  SELECT id, blob_url, filename
  FROM images
  WHERE blob_url LIKE '%r2.cloudflarestorage.com%'
`

if (rows.length === 0) {
  console.log('No rows need fixing.')
  process.exit(0)
}

console.log(`Found ${rows.length} row(s) to fix.\n`)

for (const row of rows) {
  const key = row.filename ?? row.blob_url.split('/').slice(3).join('/')
  const newUrl = `${publicUrl}/${key}`
  await sql`UPDATE images SET blob_url = ${newUrl} WHERE id = ${row.id}::uuid`
  console.log(`  ${row.blob_url}\n  → ${newUrl}\n`)
}

console.log(`Fixed ${rows.length} row(s).`)
