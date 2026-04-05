import { NextRequest, NextResponse } from 'next/server'
import { getSql } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sql = getSql()
  if (!sql) {
    return new NextResponse('Database not configured', { status: 503 })
  }

  const { id } = await params
  if (!id) {
    return new NextResponse('Missing image id', { status: 400 })
  }

  try {
    const rows = await sql`
      SELECT data, content_type
      FROM images
      WHERE id = ${id}::uuid
      LIMIT 1
    `

    const row = (rows as { data: Buffer; content_type: string }[])[0]
    if (!row) {
      return new NextResponse('Not found', { status: 404 })
    }

    const raw =
      row.data instanceof Buffer
        ? row.data
        : Buffer.from(row.data as unknown as ArrayBufferLike)
    const body = new Uint8Array(raw)
    const contentType = row.content_type || 'application/octet-stream'

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err) {
    console.error('GET /api/images/[id]:', err)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
