import sharp from 'sharp'

/** Parse EXIF buffer for DateTimeOriginal → `YYYY-MM-DD` (Postgres DATE). */
export function parseExifDate(exif: Buffer | undefined): string | null {
  if (!exif?.length) return null
  let str: string
  try {
    str = exif
      .toString('ascii', 0, Math.min(exif.length, 8192))
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
  } catch {
    return null
  }
  const match = str.match(/\d{4}:\d{2}:\d{2}\s+\d{2}:\d{2}:\d{2}/)
  if (!match) return null
  const [datePart] = match[0].split(' ')
  return datePart.replace(/:/g, '-')
}

/** Read DateTimeOriginal from a raw image buffer (before Sharp strips EXIF on output). */
export async function extractImageDate(rawBuffer: Buffer): Promise<string | null> {
  try {
    const { exif } = await sharp(rawBuffer).metadata()
    return parseExifDate(exif)
  } catch {
    return null
  }
}
