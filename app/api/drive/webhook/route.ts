import { NextRequest, NextResponse } from 'next/server'
import { after } from 'next/server'
import { runIngest } from '@/lib/ingest'

/**
 * In-memory mutex to prevent concurrent ingest operations.
 * When multiple webhooks arrive simultaneously, only one should process.
 */
let ingestInProgress = false
let pendingIngest = false

/**
 * POST /api/drive/webhook
 *
 * Receives Google Drive push notifications for the upload/ folder.
 * Drive sends a header-only POST — no body contains file data.
 * The notification simply tells us "something changed"; we re-scan the folder.
 *
 * Security: Drive includes the channel token we set during watch registration
 * in the X-Goog-Channel-Token header. We reject requests that don't match.
 *
 * Processing runs after the 200 response via next/server `after()` so Drive's
 * HTTP timeout is not a concern for large image batches.
 *
 * Concurrency: Uses an in-memory mutex to prevent multiple simultaneous ingests.
 * If an ingest is already running, we mark that another is pending and skip
 * starting a new one. The running ingest will trigger another pass when done.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = process.env.GOOGLE_DRIVE_WEBHOOK_SECRET
  if (!secret) {
    console.error('[drive/webhook] GOOGLE_DRIVE_WEBHOOK_SECRET is not set')
    return new NextResponse('Server misconfiguration', { status: 500 })
  }

  const channelToken = request.headers.get('x-goog-channel-token')
  if (channelToken !== secret) {
    console.warn('[drive/webhook] Invalid channel token, rejecting request')
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Google Drive sends a "sync" message when a channel is first registered —
  // no files to process yet, just acknowledge.
  const resourceState = request.headers.get('x-goog-resource-state')
  if (resourceState === 'sync') {
    return new NextResponse(null, { status: 200 })
  }

  const channelId = request.headers.get('x-goog-channel-id') ?? 'unknown'
  console.log(`[drive/webhook] Notification received — channel: ${channelId}, state: ${resourceState}`)

  // Check if an ingest is already running
  if (ingestInProgress) {
    console.log('[drive/webhook] Ingest already in progress, marking pending')
    pendingIngest = true
    return new NextResponse(null, { status: 200 })
  }

  // Respond immediately; run the ingest pipeline after the response is sent.
  after(async () => {
    // Process ingests in a loop until no more are pending
    while (true) {
      ingestInProgress = true
      pendingIngest = false

      try {
        console.log('[drive/ingest] Starting ingest...')
        const result = await runIngest((msg) => console.log(`[drive/ingest] ${msg}`))
        if (result.errors.length > 0) {
          console.error('[drive/ingest] Errors:', result.errors)
        }
      } catch (err) {
        console.error('[drive/ingest] Fatal error:', err)
      } finally {
        ingestInProgress = false
      }

      // If another webhook arrived while we were processing, run again
      if (pendingIngest) {
        console.log('[drive/ingest] Pending ingest detected, running again...')
        continue
      }

      // No more pending ingests, exit the loop
      break
    }
  })

  return new NextResponse(null, { status: 200 })
}
