#!/usr/bin/env node
/**
 * drive-stop-channel.mjs
 *
 * Stops a Google Drive push notification channel.
 *
 * Usage:
 *   node scripts/drive-stop-channel.mjs <channelId> <resourceId>
 *
 * Both values are printed by npm run drive:setup in the output block:
 *   # GOOGLE_DRIVE_CHANNEL_ID=<channelId>
 *   # GOOGLE_DRIVE_CHANNEL_RESOURCE_ID=<resourceId>
 */

import { google } from 'googleapis'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const [channelId, resourceId] = process.argv.slice(2)

if (!channelId || !resourceId) {
  console.error('Usage: node scripts/drive-stop-channel.mjs <channelId> <resourceId>')
  console.error('\nBoth values are in the output of npm run drive:setup:')
  console.error('  # GOOGLE_DRIVE_CHANNEL_ID=...')
  console.error('  # GOOGLE_DRIVE_CHANNEL_RESOURCE_ID=...')
  process.exit(1)
}

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive'],
})
const drive = google.drive({ version: 'v3', auth })

try {
  await drive.channels.stop({
    requestBody: { id: channelId, resourceId },
  })
  console.log(`Channel stopped: ${channelId}`)
} catch (err) {
  console.error('Failed to stop channel:', err.message ?? err)
  process.exit(1)
}
