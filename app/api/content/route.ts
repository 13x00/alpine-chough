import { NextResponse } from 'next/server'
import { collectionsEnabled } from '@/lib/features'
import { getSql } from '@/lib/db'
import type { ContentData, ContentItem } from '@/types/content'

function imageUrl(imageId: string): string {
  return `/api/images/${imageId}`
}

export async function GET() {
  const sql = getSql()
  if (!sql) {
    return NextResponse.json(
      { error: 'DATABASE_URL not configured' },
      { status: 503 }
    )
  }

  try {
    const rows = await sql`
      SELECT ci.sort_order, ci.item_type, ci.photo_id, ci.collection_id,
        p.id AS p_id, p.title AS p_title, p.image_id AS p_image_id, p.description AS p_desc, p.date AS p_date, p.tags AS p_tags,
        c.id AS c_id, c.title AS c_title, c.slug AS c_slug, c.description AS c_desc, c.cover_image_id AS c_cover_id
      FROM content_items ci
      LEFT JOIN photos p ON ci.photo_id = p.id
      LEFT JOIN collections c ON ci.collection_id = c.id
      WHERE (${collectionsEnabled} OR ci.item_type = 'photo')
      ORDER BY p.date DESC NULLS LAST, ci.sort_order ASC
    `

    const collectionIds = [
      ...new Set(
        (rows as { collection_id: string | null }[])
          .filter((r) => r.collection_id != null)
          .map((r) => r.collection_id!)
      ),
    ]

    let collectionImages: { collection_id: string; image_id: string; sort_order: number }[] = []
    if (collectionsEnabled && collectionIds.length > 0) {
      const ciRows = await sql`
        SELECT collection_id, image_id, sort_order
        FROM collection_images
        WHERE collection_id IN (
          SELECT collection_id FROM content_items WHERE item_type = 'collection'
        )
        ORDER BY collection_id, sort_order ASC
      `
      collectionImages = (ciRows as { collection_id: string; image_id: string; sort_order: number }[]).map(
        (r) => ({
          collection_id: r.collection_id,
          image_id: r.image_id,
          sort_order: Number(r.sort_order),
        })
      )
    }

    const collectionImagesByCollection = new Map<string, string[]>()
    for (const row of collectionImages) {
      const list = collectionImagesByCollection.get(row.collection_id) ?? []
      list.push(imageUrl(row.image_id))
      collectionImagesByCollection.set(row.collection_id, list)
    }

    const items: ContentItem[] = (rows as any[]).map((r) => {
      if (r.item_type === 'photo' && r.p_id) {
        return {
          type: 'photo' as const,
          id: r.p_id,
          title: r.p_title,
          image: imageUrl(r.p_image_id),
          description: r.p_desc ?? undefined,
          date: r.p_date ? new Date(r.p_date).toISOString().slice(0, 10) : undefined,
          tags: r.p_tags ?? undefined,
        }
      }
      if (r.item_type === 'collection' && r.c_id) {
        return {
          type: 'collection' as const,
          id: r.c_id,
          title: r.c_title,
          slug: r.c_slug,
          description: r.c_desc ?? undefined,
          coverImage: imageUrl(r.c_cover_id),
          images: collectionImagesByCollection.get(r.c_id) ?? [],
        }
      }
      throw new Error(`Invalid content_items row: ${JSON.stringify(r)}`)
    })

    const data: ContentData = { items }
    return NextResponse.json(data)
  } catch (err) {
    console.error('GET /api/content:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load content' },
      { status: 500 }
    )
  }
}
