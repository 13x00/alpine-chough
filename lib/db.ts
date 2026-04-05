import { neon } from '@neondatabase/serverless'

let cached: ReturnType<typeof neon> | null = null

/** Returns a Neon sql client, or null if DATABASE_URL is not set. Lazy-init so build can succeed without env. */
export function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) return null
  if (!cached) cached = neon(url)
  return cached
}
