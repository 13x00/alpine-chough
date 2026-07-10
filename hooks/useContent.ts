'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ContentItem, DetailItem, ViewType } from '@/types/content'

export function contentHref(item: ContentItem): string {
  return item.type === 'photo'
    ? `/p/${encodeURIComponent(item.title)}`
    : `/c/${encodeURIComponent(item.slug)}`
}

function viewHref(view: ViewType, item?: DetailItem): string {
  if (view === 'photo' && item && 'image' in item) {
    return `/p/${encodeURIComponent(item.title)}`
  }
  if (view === 'collection' && item && 'slug' in item) {
    return `/c/${encodeURIComponent(item.slug)}`
  }
  return '/'
}

function selectionFromPathname(
  pathname: string,
  items: ContentItem[]
): { currentView: ViewType; selectedItem: DetailItem | null } {
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
}

type SetViewOptions = {
  history?: 'push' | 'replace'
  /** Defer URL bar updates — use for rapid keyboard navigation. */
  deferUrl?: boolean
}

export function useContent(items: ContentItem[] = []) {
  const [currentView, setCurrentView] = useState<ViewType>('portrait')
  const [selectedItem, setSelectedItem] = useState<DetailItem | null>(null)
  const hydratedRef = useRef(false)
  const urlSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingHrefRef = useRef<string | null>(null)

  // Hydrate selection once from the URL (direct link or refresh).
  useEffect(() => {
    if (!items.length || hydratedRef.current) return
    hydratedRef.current = true
    const fromUrl = selectionFromPathname(window.location.pathname, items)
    setCurrentView(fromUrl.currentView)
    setSelectedItem(fromUrl.selectedItem)
  }, [items])

  // Browser back/forward.
  useEffect(() => {
    const onPopState = () => {
      const fromUrl = selectionFromPathname(window.location.pathname, items)
      setCurrentView(fromUrl.currentView)
      setSelectedItem(fromUrl.selectedItem)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [items])

  useEffect(() => {
    return () => {
      if (urlSyncTimerRef.current) clearTimeout(urlSyncTimerRef.current)
    }
  }, [])

  const writeUrl = useCallback((href: string, history: 'push' | 'replace') => {
    if (typeof window === 'undefined' || href === window.location.pathname) return
    if (history === 'push') {
      window.history.pushState(window.history.state, '', href)
    } else {
      window.history.replaceState(window.history.state, '', href)
    }
  }, [])

  const scheduleUrl = useCallback(
    (href: string, history: 'push' | 'replace') => {
      pendingHrefRef.current = href
      if (urlSyncTimerRef.current) clearTimeout(urlSyncTimerRef.current)
      urlSyncTimerRef.current = setTimeout(() => {
        const nextHref = pendingHrefRef.current
        if (nextHref) writeUrl(nextHref, history)
        pendingHrefRef.current = null
        urlSyncTimerRef.current = null
      }, 300)
    },
    [writeUrl]
  )

  const setView = useCallback(
    (view: ViewType, item?: DetailItem, options?: SetViewOptions) => {
      const nextView = view === 'portrait' || !item ? 'portrait' : view
      const nextItem = view === 'portrait' || !item ? null : item

      setCurrentView(nextView)
      setSelectedItem(nextItem)

      const href = viewHref(view, item)
      const history = options?.history ?? 'replace'

      if (options?.deferUrl) {
        scheduleUrl(href, history)
        return
      }

      if (urlSyncTimerRef.current) clearTimeout(urlSyncTimerRef.current)
      pendingHrefRef.current = null
      writeUrl(href, history)
    },
    [scheduleUrl, writeUrl]
  )

  const goHome = useCallback(() => {
    setCurrentView('portrait')
    setSelectedItem(null)
    if (urlSyncTimerRef.current) clearTimeout(urlSyncTimerRef.current)
    pendingHrefRef.current = null
    writeUrl('/', 'push')
  }, [writeUrl])

  return {
    currentView,
    selectedItem,
    setView,
    goHome,
  }
}
