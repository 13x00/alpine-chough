'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { SplitLayout } from '@/components/layout/SplitLayout'
import { PageLoader } from '@/components/transition/PageLoader'
import { useContent } from '@/hooks/useContent'
import { Photo, ContentData } from '@/types/content'

export default function Home() {
  const { currentView, selectedItem, setView, goHome } = useContent()
  const [isDetailClosing, setIsDetailClosing] = useState(false)
  const [leftPanelHidden, setLeftPanelHidden] = useState(false)
  const [detailDirection, setDetailDirection] = useState<'forward' | 'backward'>('forward')

  const [contentData, setContentData] = useState<ContentData | null>(null)
  const [contentError, setContentError] = useState<Error | null>(null)
  const [contentLoading, setContentLoading] = useState(true)

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
        if (!cancelled) {
          setContentData(data)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setContentError(err instanceof Error ? err : new Error(String(err)))
        }
      })
      .finally(() => {
        if (!cancelled) {
          setContentLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const hasDetailOpen = selectedItem !== null && currentView !== 'portrait'
  const useNarrowLayout = hasDetailOpen || isDetailClosing

  const handleHomeClick = () => {
    setLeftPanelHidden(false)
    if (hasDetailOpen) setIsDetailClosing(true)
    goHome()
  }

  const toggleLeftPanel = () => setLeftPanelHidden((v) => !v)

  const showError = !contentLoading && contentError
  const showLayout = !contentLoading && contentData && !contentError

  // Photos only in nav until collections are ready to ship (API may still return collection rows).
  const photoEntries = useMemo(
    () =>
      contentData?.items
        .filter((item) => item.type === 'photo')
        .map((item) => ({
          id: item.id,
          title: item.title,
          view: 'photo' as const,
          item: item as Photo,
        })) ?? [],
    [contentData]
  )

  const navigateAdjacent = useCallback(
    (delta: -1 | 1) => {
      if (!selectedItem || photoEntries.length === 0) return
      const currentIndex = photoEntries.findIndex((e) => e.id === selectedItem.id)
      if (currentIndex === -1) return
      const nextIndex = currentIndex + delta
      if (nextIndex < 0 || nextIndex >= photoEntries.length) return
      const nextEntry = photoEntries[nextIndex]
      setDetailDirection(nextIndex > currentIndex ? 'forward' : 'backward')
      setView(nextEntry.view, nextEntry.item)
    },
    [photoEntries, selectedItem, setView]
  )

  const projectItems = photoEntries.map((entry, nextIndex) => ({
    id: entry.id,
    title: entry.title,
    category: 'Photo',
    image: entry.item.image,
    onClick: () => {
      if ((currentView === 'photo' || currentView === 'collection') && selectedItem) {
        const currentIndex = photoEntries.findIndex((e) => e.id === selectedItem.id)
        if (currentIndex !== -1 && nextIndex !== currentIndex) {
          setDetailDirection(nextIndex > currentIndex ? 'forward' : 'backward')
        } else {
          setDetailDirection('forward')
        }
      } else {
        setDetailDirection('forward')
      }
      setView(entry.view, entry.item)
    },
  }))

  return (
    <>
      {/* Page-load intro animation — fixed overlay, unmounts after completion */}
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
