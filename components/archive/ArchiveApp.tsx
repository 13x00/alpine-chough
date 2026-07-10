'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SplitLayout } from '@/components/layout/SplitLayout'
import { PageLoader } from '@/components/transition/PageLoader'
import { useContent } from '@/hooks/useContent'
import { preloadImage } from '@/lib/image-preload'
import { yearFromDate } from '@/lib/utils'
import type { Collection, ContentData, ContentItem, Photo } from '@/types/content'

const KEYBOARD_PRELOAD_AHEAD = 8

function itemImage(item: ContentItem): string {
  return item.type === 'photo' ? item.image : item.coverImage
}

export function ArchiveApp() {
  const [isDetailClosing, setIsDetailClosing] = useState(false)
  const [leftPanelHidden, setLeftPanelHidden] = useState(false)
  const [detailDirection, setDetailDirection] = useState<'forward' | 'backward'>('forward')
  const [contentData, setContentData] = useState<ContentData | null>(null)
  const [contentError, setContentError] = useState<Error | null>(null)
  const [contentLoading, setContentLoading] = useState(true)
  const navigationIndexRef = useRef(-1)

  const { currentView, selectedItem, setView, goHome } = useContent(contentData?.items)

  useEffect(() => {
    let cancelled = false
    setContentLoading(true)
    setContentError(null)
    fetch('/api/content')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load content: ${res.status}`)
        return res.json()
      })
      .then((data: ContentData) => {
        if (!cancelled) setContentData(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setContentError(err instanceof Error ? err : new Error(String(err)))
        }
      })
      .finally(() => {
        if (!cancelled) setContentLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const hasDetailOpen = selectedItem !== null && currentView !== 'portrait'
  const useNarrowLayout = hasDetailOpen || isDetailClosing

  const handleHomeClick = useCallback(() => {
    setLeftPanelHidden(false)
    if (hasDetailOpen) setIsDetailClosing(true)
    navigationIndexRef.current = -1
    goHome()
  }, [goHome, hasDetailOpen])

  const toggleLeftPanel = () => setLeftPanelHidden((value) => !value)
  const showError = !contentLoading && contentError
  const showLayout = !contentLoading && contentData && !contentError

  const allEntries = useMemo(
    () =>
      contentData?.items.map((item) => ({
        id: item.id,
        title: item.title,
        view: item.type,
        item: item.type === 'photo' ? (item as Photo) : (item as Collection),
        image: itemImage(item),
      })) ?? [],
    [contentData]
  )

  useEffect(() => {
    navigationIndexRef.current = selectedItem
      ? allEntries.findIndex((entry) => entry.id === selectedItem.id)
      : -1
  }, [allEntries, selectedItem])

  const navigateAdjacent = useCallback(
    (delta: -1 | 1) => {
      if (allEntries.length === 0) return

      const selectedIndex = selectedItem
        ? allEntries.findIndex((entry) => entry.id === selectedItem.id)
        : -1
      const currentIndex =
        navigationIndexRef.current >= 0 ? navigationIndexRef.current : selectedIndex
      if (currentIndex === -1) return

      const nextIndex = currentIndex + delta
      if (nextIndex < 0 || nextIndex >= allEntries.length) return

      const nextEntry = allEntries[nextIndex]
      navigationIndexRef.current = nextIndex
      setDetailDirection(delta > 0 ? 'forward' : 'backward')

      preloadImage(nextEntry.image)
      for (let offset = 1; offset <= KEYBOARD_PRELOAD_AHEAD; offset++) {
        const ahead = allEntries[nextIndex + offset * delta]
        if (ahead) preloadImage(ahead.image)
      }

      setView(nextEntry.view, nextEntry.item, { deferUrl: true })
    },
    [allEntries, selectedItem, setView]
  )

  const projectItems = useMemo(
    () =>
      allEntries.map((entry, nextIndex) => ({
        id: entry.id,
        title: entry.title,
        category: entry.view === 'photo' ? 'Photo' : 'Collection',
        year: entry.view === 'photo' ? yearFromDate((entry.item as Photo).date) : undefined,
        image: entry.image,
        onClick: () => {
          const currentIndex = selectedItem
            ? allEntries.findIndex((candidate) => candidate.id === selectedItem.id)
            : -1
          setDetailDirection(
            currentIndex !== -1 && nextIndex < currentIndex ? 'backward' : 'forward'
          )
          navigationIndexRef.current = nextIndex
          setView(entry.view, entry.item, { history: 'push' })
        },
      })),
    [allEntries, selectedItem, setView]
  )

  return (
    <>
      <PageLoader />
      {showError && (
        <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center gap-4 bg-background p-8">
          <p className="text-center text-text-primary">Failed to load content.</p>
          <p className="text-center text-sm text-text-secondary">{contentError!.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md bg-layer-02 px-4 py-2 text-text-primary hover:bg-layer-hover-01"
          >
            Retry
          </button>
        </div>
      )}
      {showLayout && (
        <SplitLayout
          currentView={currentView}
          selectedItem={selectedItem}
          onCloseDetail={handleHomeClick}
          leftPanelHidden={leftPanelHidden}
          onToggleLeftPanel={toggleLeftPanel}
          useNarrowLayout={useNarrowLayout}
          onDetailCloseComplete={() => setIsDetailClosing(false)}
          detailDirection={detailDirection}
          onNavigateAdjacent={navigateAdjacent}
          projectItems={projectItems}
        />
      )}
    </>
  )
}
