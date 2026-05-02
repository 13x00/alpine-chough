#!/usr/bin/env node
/**
 * drive-setup.mjs
 *
 * One-time setup script for the Google Drive ingestion pipeline.
 *
 * What it does:
 *   1. Creates (or finds) the root Drive folder, then "prep/", "upload/", and
 *      "processed/" subfolders within it.
 *   2. Registers a Google Drive push notification channel (webhook) on the
 *      "upload/" folder so that your deployed app receives a POST when files
 *      change.
 *   3. Prints the folder IDs and channel details to stdout — copy these into
 *      your .env.local.
 *
 * Prerequisites:
 *   - GOOGLE_SERVICE_ACCOUNT_JSON  : service account key JSON (full file, stringified)
 *   - GOOGLE_DRIVE_WEBHOOK_SECRET  : random secret token you choose (min 16 chars)
 *   - WEBHOOK_BASE_URL             : public HTTPS URL of your deployment
 *                                    (e.g. https://yourdomain.com)
 *
 * Optional:
 *   - GOOGLE_DRIVE_ROOT_FOLDER_ID  : if you already have a root folder, provide
 *                                    its ID to skip creating it. Otherwise a new
 *                                    "alpine-chough" folder is created in My Drive.
 *
 * Usage:
 *   node scripts/drive-setup.mjs [--root-folder-name <name>]
 *   npm run drive:setup
 *
 * Webhook channels expire after ~7 days. Re-run this script before expiry to
 * renew (a new channel ID is registered; the old one simply expires).
 */

import { google } from 'googleapis'
import { join, fileURLToPath } from 'node:path'
import dotenv from 'dotenv'
import crypto from 'node:crypto'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const root = join(__dirname, '..')
dotenv.config({ path: join(root, '.env.local') })

// ── Argument parsing ──────────────────────────────────────────────────────────

const args = process.argv.slice(2)
let rootFolderName = 'alpine-chough'
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--root-folder-name' && args[i + 1]) {
    rootFolderName = args[i + 1]
    i++
  } else if (args[i] === '-h' || args[i] === '--help') {
    console.log(`Usage: node scripts/drive-setup.mjs [--root-folder-name <name>]

Creates the Google Drive folder structure and registers a webhook channel.
Prints folder IDs and channel info to copy into .env.local.

Required env vars:
  GOOGLE_SERVICE_ACCOUNT_JSON   Service account key (full JSON stringified)
  GOOGLE_DRIVE_WEBHOOK_SECRET   Random secret token (you choose, min 16 chars)
  WEBHOOK_BASE_URL              Public HTTPS URL of your deployment

Optional env vars:
  GOOGLE_DRIVE_ROOT_FOLDER_ID   Skip root folder creation if already exists
`)
    process.exit(0)
  }
}

// ── Validation ────────────────────────────────────────────────────────────────

const errors = []
if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) errors.push('GOOGLE_SERVICE_ACCOUNT_JSON')
if (!process.env.GOOGLE_DRIVE_WEBHOOK_SECRET) errors.push('GOOGLE_DRIVE_WEBHOOK_SECRET')
if (!process.env.WEBHOOK_BASE_URL) errors.push('WEBHOOK_BASE_URL')

if (errors.length > 0) {
  console.error('Missing required environment variables:')
  errors.forEach((e) => console.error(`  ${e}`))
  console.error('\nAdd them to .env.local at the project root and re-run.')
  process.exit(1)
}

const webhookSecret = process.env.GOOGLE_DRIVE_WEBHOOK_SECRET
if (webhookSecret.length < 16) {
  console.error('GOOGLE_DRIVE_WEBHOOK_SECRET must be at least 16 characters.')
  process.exit(1)
}

const webhookUrl = `${process.env.WEBHOOK_BASE_URL.replace(/\/$/, '')}/api/drive/webhook`

// ── Drive client ──────────────────────────────────────────────────────────────

let credentials
try {
  credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
} catch {
  console.error('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON.')
  process.exit(1)
}

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive'],
})
const drive = google.drive({ version: 'v3', auth })

// ── Folder helpers ────────────────────────────────────────────────────────────

async function findOrCreateFolder(name, parentId) {
  const q = parentId
    ? `name = '${name}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    : `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`

  const list = await drive.files.list({ q, fields: 'files(id, name)', pageSize: 1 })
  if (list.data.files?.[0]) {
    console.log(`  Found existing folder "${name}" → ${list.data.files[0].id}`)
    return list.data.files[0].id
  }

  const body = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  }
  if (parentId) body.parents = [parentId]

  const created = await drive.files.create({ requestBody: body, fields: 'id' })
  console.log(`  Created folder "${name}" → ${created.data.id}`)
  return created.data.id
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Google Drive Pipeline Setup ===\n')

  // 1. Root folder
  let rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID
  if (rootFolderId) {
    console.log(`Using existing root folder: ${rootFolderId}`)
  } else {
    console.log(`Creating root folder "${rootFolderName}"...`)
    rootFolderId = await findOrCreateFolder(rootFolderName, null)
  }

  // 2. prep/, upload/, and processed/ subfolders
  console.log('\nCreating subfolders...')
  const prepFolderId = await findOrCreateFolder('prep', rootFolderId)
  const uploadFolderId = await findOrCreateFolder('upload', rootFolderId)
  const processedFolderId = await findOrCreateFolder('processed', rootFolderId)

  // 3. Register webhook channel on upload/
  console.log('\nRegistering push notification channel on upload/ folder...')
  const channelId = crypto.randomUUID()
  const expireMs = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days from now

  const watchRes = await drive.files.watch({
    fileId: uploadFolderId,
    requestBody: {
      id: channelId,
      type: 'web_hook',
      address: webhookUrl,
      token: webhookSecret,
      expiration: String(expireMs),
    },
  })

  const channel = watchRes.data
  const expiryDate = new Date(Number(channel.expiration)).toISOString()

  console.log(`  Channel registered:`)
  console.log(`    ID       : ${channel.id}`)
  console.log(`    Resource : ${channel.resourceId}`)
  console.log(`    Expires  : ${expiryDate}`)
  console.log(`    Endpoint : ${webhookUrl}`)

  // 4. Print .env.local additions
  console.log('\n─────────────────────────────────────────────────────')
  console.log('Add these to your .env.local:\n')
  console.log(`GOOGLE_DRIVE_PREP_FOLDER_ID=${prepFolderId}`)
  console.log(`GOOGLE_DRIVE_UPLOAD_FOLDER_ID=${uploadFolderId}`)
  console.log(`GOOGLE_DRIVE_PROCESSED_FOLDER_ID=${processedFolderId}`)
  console.log(`# Webhook channel (renew before ${expiryDate}):`)
  console.log(`# GOOGLE_DRIVE_CHANNEL_ID=${channel.id}`)
  console.log(`# GOOGLE_DRIVE_CHANNEL_RESOURCE_ID=${channel.resourceId}`)
  console.log('─────────────────────────────────────────────────────')
  console.log('\nWorkflow:')
  console.log('  1. Upload files to prep/ — stage everything here first')
  console.log('  2. Move the batch from prep/ → upload/ when ready')
  console.log('  3. The webhook fires and the pipeline runs automatically')
  console.log('\nSetup complete.')
  console.log(`\nReminder: re-run "npm run drive:setup" before ${expiryDate} to renew the channel.`)
}

main().catch((err) => {
  console.error('\nSetup failed:', err.message ?? err)
  process.exit(1)
})
