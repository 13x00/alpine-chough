import { NextRequest, NextResponse } from 'next/server'
import { getDriveClient, registerWatchChannel, stopWatchChannel } from '@/lib/drive'
import { getSql } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/cron/renew-webhook
 *
 * Called by Vercel Cron once a day (configured in vercel.json).
 *
 * Renewal sequence (avoids duplicate active channels):
 *   1. Read current active channel from drive_webhook_channel table
 *   2. Register a brand-new channel with Google
 *   3. Stop the old channel (404s are silently ignored)
 *   4. Upsert new channel details back into the DB
 *
 * Security: Vercel automatically adds Authorization: Bearer <CRON_SECRET>
 * on scheduled invocations. Manual calls without the correct token are rejected.
 *
 * Required env vars:
 *   CRON_SECRET                       Random string — set in Vercel env
 *   DATABASE_URL                      Neon connection string
 *   GOOGLE_SERVICE_ACCOUNT_JSON       Service account credentials
 *   GOOGLE_DRIVE_UPLOAD_FOLDER_ID     The upload/ folder to watch
 *   GOOGLE_DRIVE_WEBHOOK_SECRET       Token sent with Drive push notifications
 *   WEBHOOK_BASE_URL                  Public app URL (no trailing slash)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('[cron/renew-webhook] CRON_SECRET is not set')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const uploadFolderId = process.env.GOOGLE_DRIVE_UPLOAD_FOLDER_ID
  const webhookSecret = process.env.GOOGLE_DRIVE_WEBHOOK_SECRET
  const baseUrl = process.env.WEBHOOK_BASE_URL

  if (!uploadFolderId || !webhookSecret || !baseUrl) {
    const missing = [
      !uploadFolderId && 'GOOGLE_DRIVE_UPLOAD_FOLDER_ID',
      !webhookSecret && 'GOOGLE_DRIVE_WEBHOOK_SECRET',
      !baseUrl && 'WEBHOOK_BASE_URL',
    ].filter(Boolean)
    console.error('[cron/renew-webhook] Missing env vars:', missing)
    return NextResponse.json({ error: 'Missing env vars', missing }, { status: 500 })
  }

  const sql = getSql()
  if (!sql) {
    return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 503 })
  }

  const webhookUrl = `${baseUrl.replace(/\/$/, '')}/api/drive/webhook`

  try {
    const drive = getDriveClient()

    // 1. Read the current channel from DB (may not exist on first run)
    const existing = (await sql`
      SELECT channel_id, resource_id FROM drive_webhook_channel WHERE id = 1 LIMIT 1
    `) as { channel_id: string; resource_id: string }[]

    // 2. Register the new channel first
    const next = await registerWatchChannel(drive, uploadFolderId, webhookUrl, webhookSecret)
    console.log(`[cron/renew-webhook] New channel registered — id: ${next.channelId}, expires: ${next.expiration}`)

    // 3. Stop the old channel (only if one was stored)
    if (existing[0]) {
      await stopWatchChannel(drive, existing[0].channel_id, existing[0].resource_id)
      console.log(`[cron/renew-webhook] Old channel stopped — id: ${existing[0].channel_id}`)
    }

    // 4. Upsert new channel into DB
    await sql`
      INSERT INTO drive_webhook_channel (id, channel_id, resource_id, expires_at, updated_at)
      VALUES (1, ${next.channelId}, ${next.resourceId}, ${next.expiration}, now())
      ON CONFLICT (id) DO UPDATE SET
        channel_id  = EXCLUDED.channel_id,
        resource_id = EXCLUDED.resource_id,
        expires_at  = EXCLUDED.expires_at,
        updated_at  = now()
    `

    return NextResponse.json({ ok: true, ...next })
  } catch (err) {
    console.error('[cron/renew-webhook] Failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
