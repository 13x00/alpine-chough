#!/usr/bin/env tsx
/**
 * drive-ingest.ts
 *
 * Manual trigger for the Google Drive ingestion pipeline.
 * Runs the same logic as POST /api/drive/webhook — useful for initial seeding,
 * debugging, or re-processing without waiting for a webhook notification.
 *
 * Usage:
 *   npm run drive:ingest
 *   npx tsx scripts/drive-ingest.ts [--dry-run]
 *
 * Options:
 *   --dry-run   List files in upload/ without downloading or inserting anything
 *
 * Required env vars (loaded from .env.local automatically):
 *   DATABASE_URL
 *   GOOGLE_SERVICE_ACCOUNT_JSON
 *   GOOGLE_DRIVE_UPLOAD_FOLDER_ID
 *   GOOGLE_DRIVE_PROCESSED_FOLDER_ID
 */

import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const DRY_RUN = process.argv.includes('--dry-run')

if (process.argv.includes('-h') || process.argv.includes('--help')) {
  console.log(`Usage: npm run drive:ingest [-- --dry-run]

Manually runs the Google Drive → Neon DB ingestion pipeline.

Options:
  --dry-run   List upload/ folder contents without processing anything

Required env vars (loaded from .env.local):
  DATABASE_URL
  GOOGLE_SERVICE_ACCOUNT_JSON
  GOOGLE_DRIVE_UPLOAD_FOLDER_ID
  GOOGLE_DRIVE_PROCESSED_FOLDER_ID
`)
  process.exit(0)
}

// Validate env before running
const required = [
  'DATABASE_URL',
  'GOOGLE_SERVICE_ACCOUNT_JSON',
  'GOOGLE_DRIVE_UPLOAD_FOLDER_ID',
  'GOOGLE_DRIVE_PROCESSED_FOLDER_ID',
]
const missing = required.filter((k) => !process.env[k])
if (missing.length > 0) {
  console.error('Missing required environment variables:')
  missing.forEach((k) => console.error(`  ${k}`))
  console.error('\nAdd them to .env.local and re-run.')
  process.exit(1)
}

if (DRY_RUN) {
  const { getDriveClient, listFolder } = await import('../lib/drive.js')
  const drive = getDriveClient()
  const files = await listFolder(drive, process.env.GOOGLE_DRIVE_UPLOAD_FOLDER_ID!)

  console.log(`=== DRY RUN — ${files.length} item(s) in upload/ ===\n`)
  for (const f of files) {
    const size = f.size ? `${(Number(f.size) / 1024).toFixed(1)} KB` : '(folder)'
    console.log(`  [${f.mimeType}]  ${f.name}  ${size}`)
  }
  console.log('\nNo changes made. Remove --dry-run to run the full pipeline.')
  process.exit(0)
}

console.log('=== Google Drive Manual Ingest ===\n')

const { runIngest } = await import('../lib/ingest.js')

try {
  const result = await runIngest((msg) => console.log(msg))
  if (result.errors.length > 0) {
    console.error('\nErrors encountered:')
    result.errors.forEach((e: string) => console.error(`  ${e}`))
    process.exit(1)
  }
} catch (err) {
  console.error('\nFatal error:', err instanceof Error ? err.message : err)
  process.exit(1)
}
