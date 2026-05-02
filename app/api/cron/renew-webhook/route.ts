import { NextRequest, NextResponse } from 'next/server'
import { getDriveClient, renewWatchChannel } from '@/lib/drive'

/**
 * GET /api/cron/renew-webhook
 *
 * Called by Vercel Cron once a day (configured in vercel.json).
 * Re-registers the Drive push notification channel on the upload/ folder
 * before the previous one expires (Google caps files.watch at 24 hours).
 *
 * Security: Vercel automatically adds Authorization: Bearer <CRON_SECRET>
 * on scheduled invocations. Manual calls without the correct token are rejected.
 *
 * Required env vars:
 *   CRON_SECRET                       Random string — set in Vercel env
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

  const webhookUrl = `${baseUrl.replace(/\/$/, '')}/api/drive/webhook`

  try {
    const drive = getDriveClient()
    const result = await renewWatchChannel(drive, uploadFolderId, webhookUrl, webhookSecret)
    console.log(
      `[cron/renew-webhook] Channel renewed — id: ${result.channelId}, expires: ${result.expiration}`
    )
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[cron/renew-webhook] Failed to renew channel:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
