/**
 * lib/r2.ts
 *
 * Cloudflare R2 client and upload helper.
 * R2 is S3-compatible, so @aws-sdk/client-s3 is used.
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

let client: S3Client | null = null

export function getR2Client(): S3Client {
  if (client) return client

  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2_ACCOUNT_ID, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY must be set')
  }

  client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })

  return client
}

/**
 * Uploads a buffer to Cloudflare R2 and returns the public URL.
 * The key is the filename (e.g. "drive/photo.jpg").
 */
export async function uploadToR2(
  buffer: Buffer,
  contentType: string,
  filename: string
): Promise<string> {
  const bucketName = process.env.R2_BUCKET_NAME
  const publicUrl = process.env.R2_PUBLIC_URL

  if (!bucketName || !publicUrl) {
    throw new Error('R2_BUCKET_NAME and R2_PUBLIC_URL must be set')
  }

  const r2 = getR2Client()

  await r2.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
    })
  )

  return `${publicUrl.replace(/\/$/, '')}/${filename}`
}
