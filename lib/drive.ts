import { google } from 'googleapis'
import type { drive_v3 } from 'googleapis'

export type DriveFile = drive_v3.Schema$File

/** Returns an authenticated Google Drive v3 client using the service account. */
export function getDriveClient(): drive_v3.Drive {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not set')

  const credentials = JSON.parse(raw)
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  })
  return google.drive({ version: 'v3', auth })
}

/**
 * Lists all files and subfolders directly inside `folderId`.
 * Returns only non-trashed items.
 */
export async function listFolder(
  drive: drive_v3.Drive,
  folderId: string
): Promise<DriveFile[]> {
  const results: DriveFile[] = []
  let pageToken: string | undefined

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType, size)',
      pageSize: 1000,
      pageToken,
    })
    results.push(...(res.data.files ?? []))
    pageToken = res.data.nextPageToken ?? undefined
  } while (pageToken)

  return results
}

/**
 * Downloads a Drive file and returns its content as a Buffer.
 * Uses alt=media for binary files (images), export for Google Workspace docs.
 */
export async function downloadFile(
  drive: drive_v3.Drive,
  fileId: string
): Promise<Buffer> {
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  )
  return Buffer.from(res.data as ArrayBuffer)
}

/**
 * Downloads a Drive file as a UTF-8 string (for JSON metadata files).
 */
export async function downloadText(
  drive: drive_v3.Drive,
  fileId: string
): Promise<string> {
  const buf = await downloadFile(drive, fileId)
  return buf.toString('utf-8')
}

/**
 * Moves `fileId` into `destinationFolderId` by adding the new parent
 * and removing the old one.
 */
export async function moveFile(
  drive: drive_v3.Drive,
  fileId: string,
  sourceFolderId: string,
  destinationFolderId: string
): Promise<void> {
  await drive.files.update({
    fileId,
    addParents: destinationFolderId,
    removeParents: sourceFolderId,
    fields: 'id, parents',
  })
}

/**
 * Creates a subfolder inside `parentId` and returns its Drive file ID.
 * If a folder with the same name already exists, returns its ID instead.
 */
export async function createFolder(
  drive: drive_v3.Drive,
  name: string,
  parentId: string
): Promise<string> {
  const existing = await drive.files.list({
    q: `name = '${name}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id)',
  })
  if (existing.data.files?.[0]?.id) return existing.data.files[0].id

  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  })
  if (!res.data.id) throw new Error(`Failed to create folder "${name}"`)
  return res.data.id
}

export interface WatchChannelResult {
  channelId: string
  resourceId: string
  expiration: string
}

/**
 * Registers a new Drive push notification channel on `folderId`.
 * Google caps files.watch channels at 24 hours; call this daily.
 * Returns the new channel details.
 */
export async function registerWatchChannel(
  drive: drive_v3.Drive,
  folderId: string,
  webhookUrl: string,
  secret: string
): Promise<WatchChannelResult> {
  const { randomUUID } = await import('crypto')
  // Request just under 24 hours — Google clamps files.watch to 1 day max.
  const expireMs = Date.now() + 23 * 60 * 60 * 1000

  const res = await (drive.files.watch({
    fileId: folderId,
    requestBody: {
      id: randomUUID(),
      type: 'web_hook',
      address: webhookUrl,
      token: secret,
      expiration: String(expireMs),
    },
  }) as Promise<{ data: { id?: string | null; resourceId?: string | null; expiration?: string | null } }>)

  return {
    channelId: res.data.id ?? '',
    resourceId: res.data.resourceId ?? '',
    expiration: new Date(Number(res.data.expiration ?? 0)).toISOString(),
  }
}

/**
 * Stops an active Drive push notification channel.
 * Safe to call with stale IDs — a 404 from Google is ignored.
 */
export async function stopWatchChannel(
  drive: drive_v3.Drive,
  channelId: string,
  resourceId: string
): Promise<void> {
  try {
    await drive.channels.stop({ requestBody: { id: channelId, resourceId } })
  } catch (err: unknown) {
    // 404 means the channel already expired — nothing to do.
    const status = (err as { code?: number })?.code
    if (status !== 404) throw err
  }
}

/** Returns true if the MIME type is a supported image format. */
export function isImageMime(mimeType: string | null | undefined): boolean {
  return (
    mimeType === 'image/jpeg' ||
    mimeType === 'image/png' ||
    mimeType === 'image/webp'
  )
}

/** Returns true if the file is a JSON metadata file. */
export function isJsonFile(name: string | null | undefined): boolean {
  return (name ?? '').toLowerCase().endsWith('.json')
}

/** Returns true if the file is a Drive folder. */
export function isFolder(mimeType: string | null | undefined): boolean {
  return mimeType === 'application/vnd.google-apps.folder'
}
