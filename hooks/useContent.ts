'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { ContentItem, DetailItem, ViewType } from '@/types/content'

export function contentHref(item: ContentItem): string {
  return item.type === 'photo'
    ? `/p/${encodeURIComponent(item.title)}`
    : `/c/${encodeURIComponent(item.slug)}`
}

export function useContent(items: ContentItem[] = []) {
  const pathname = usePathname()
  const router = useRouter()

  const { currentView, selectedItem } = useMemo<{
    currentView: ViewType
    selectedItem: DetailItem | null
  }>(() => {
    const photoMatch = pathname.match(/^\/p\/([^/]+)$/)
    if (photoMatch) {
      const title = decodeURIComponent(photoMatch[1])
      return {
        currentView: 'photo',
        selectedItem:
          items.find((item) => item.type === 'photo' && item.title === title) ?? null,
      }
    }

    const collectionMatch = pathname.match(/^\/c\/([^/]+)$/)
    if (collectionMatch) {
      const slug = decodeURIComponent(collectionMatch[1])
      return {
        currentView: 'collection',
        selectedItem:
          items.find((item) => item.type === 'collection' && item.slug === slug) ?? null,
      }
    }

    return { currentView: 'portrait', selectedItem: null }
  }, [items, pathname])

  const setView = useCallback(
    (view: ViewType, item?: DetailItem) => {
      if (view === 'photo' && item && 'image' in item) {
        router.push(`/p/${encodeURIComponent(item.title)}`, { scroll: false })
        return
      }
      if (view === 'collection' && item && 'slug' in item) {
        router.push(`/c/${encodeURIComponent(item.slug)}`, { scroll: false })
        return
      }
      router.push('/', { scroll: false })
    },
    [router]
  )

  const goHome = useCallback(() => {
    router.push('/', { scroll: false })
  }, [router])

  return {
    currentView,
    selectedItem,
    setView,
    goHome,
  }
}
