'use client'

import { useState, useEffect } from 'react'
import { SplitLayout } from '@/components/layout/SplitLayout'
import { PageLoader } from '@/components/transition/PageLoader'
import { useContent } from '@/hooks/useContent'
import { Photo, Collection, ContentData } from '@/types/content'

export default function Home() {
  const { currentView, selectedItem, setView, goHome } = useContent()
  const [isDetailClosing, setIsDetailClosing] = useState(false)
  const [detailDirection, setDetailDirection] = useState<'forward' | 'backward'>('forward')

  const [contentData, setContentData] = useState<ContentData | null>(null)
  const [contentError, setContentError] = useState<Error | null>(null)
  const [contentLoading, setContentLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setContentLoading(true)
    setContentError(null)
    fetch('/content.json')
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
    if (hasDetailOpen) setIsDetailClosing(true)
    goHome()
  }

  if (contentLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-text-secondary">Loading…</p>
      </div>
    )
  }

  if (contentError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background p-8">
        <p className="text-center text-text-primary">Failed to load content.</p>
        <p className="text-center text-sm text-text-secondary">{contentError.message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md bg-layer-02 px-4 py-2 text-text-primary hover:bg-layer-hover-01"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!contentData) {
    return null
  }

  // items array preserves order from content.json (photos and collections in any order)
  const allEntries = contentData.items.map((item) => ({
    id: item.id,
    title: item.title,
    view: item.type,
    item: item.type === 'photo' ? (item as Photo) : (item as Collection),
  }))

  const projectItems = allEntries.map((entry, nextIndex) => ({
    id: entry.id,
    title: entry.title,
    category: entry.view === 'photo' ? 'Photo' : 'Collection',
    image: entry.view === 'photo' ? (entry.item as Photo).image : (entry.item as Collection).coverImage,
    onClick: () => {
      if ((currentView === 'photo' || currentView === 'collection') && selectedItem) {
        const currentIndex = allEntries.findIndex((e) => e.id === selectedItem.id)
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
      <SplitLayout
        currentView={currentView}
        selectedItem={selectedItem}
        onCloseDetail={handleHomeClick}
        useNarrowLayout={useNarrowLayout}
        onDetailCloseComplete={() => setIsDetailClosing(false)}
        detailDirection={detailDirection}
        projectItems={projectItems}
      />
    </>
  )
}
