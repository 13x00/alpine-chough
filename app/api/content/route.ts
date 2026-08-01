import { NextResponse } from 'next/server'
import { collectionsEnabled } from '@/lib/features'
import { getSql } from '@/lib/db'
import type { ContentData, ContentItem } from '@/types/content'

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
        p.id AS p_id, p.title AS p_title, p.description AS p_desc, p.date AS p_date, p.tags AS p_tags,
        img_p.blob_url AS p_image_url,
        c.id AS c_id, c.title AS c_title, c.slug AS c_slug, c.description AS c_desc,
        img_c.blob_url AS c_cover_url
      FROM content_items ci
      LEFT JOIN photos p ON ci.photo_id = p.id
      LEFT JOIN images img_p ON p.image_id = img_p.id
      LEFT JOIN collections c ON ci.collection_id = c.id
      LEFT JOIN images img_c ON c.cover_image_id = img_c.id
      WHERE (${collectionsEnabled} OR ci.item_type = 'photo')
      ORDER BY ci.sort_order ASC
    `

    const collectionIds = [
      ...new Set(
        (rows as { collection_id: string | null }[])
          .filter((r) => r.collection_id != null)
          .map((r) => r.collection_id!)
      ),
    ]

    let collectionImages: { collection_id: string; blob_url: string; sort_order: number }[] = []
    if (collectionsEnabled && collectionIds.length > 0) {
      const ciRows = await sql`
        SELECT ci.collection_id, img.blob_url, ci.sort_order
        FROM collection_images ci
        JOIN images img ON ci.image_id = img.id
        WHERE ci.collection_id IN (
          SELECT collection_id FROM content_items WHERE item_type = 'collection'
        )
        ORDER BY ci.collection_id, ci.sort_order ASC
      `
      collectionImages = (ciRows as { collection_id: string; blob_url: string; sort_order: number }[]).map(
        (r) => ({
          collection_id: r.collection_id,
          blob_url: r.blob_url,
          sort_order: Number(r.sort_order),
        })
      )
    }

    const collectionImagesByCollection = new Map<string, string[]>()
    for (const row of collectionImages) {
      const list = collectionImagesByCollection.get(row.collection_id) ?? []
      list.push(row.blob_url)
      collectionImagesByCollection.set(row.collection_id, list)
    }

    const items: ContentItem[] = (rows as any[]).map((r) => {
      if (r.item_type === 'photo' && r.p_id) {
        return {
          type: 'photo' as const,
          id: r.p_id,
          title: r.p_title,
          image: r.p_image_url,
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
          coverImage: r.c_cover_url,
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
