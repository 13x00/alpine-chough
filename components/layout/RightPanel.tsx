'use client'

import { useEffect, useRef, useState } from 'react'
import { PortraitView } from '@/components/content/PortraitView'
import { DetailOverlayMotion } from '@/components/layout/DetailOverlayMotion'
import { PhotoDetail } from '@/components/content/PhotoDetail'
import { CollectionDetail } from '@/components/content/CollectionDetail'
import { ViewType, DetailItem, Photo, Collection } from '@/types/content'

function isTypingTarget(target: EventTarget | null): boolean {
  if (target == null || !(target instanceof Element)) return false
  const el = target as HTMLElement
  if (el.isContentEditable) return true
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

interface RightPanelProps {
  currentView: ViewType
  selectedItem: import('@/types/content').DetailItem | null
  onBack: () => void
  onCloseAnimationComplete?: () => void
  className?: string
  direction?: 'forward' | 'backward'
  onNavigateAdjacent?: (delta: -1 | 1) => void
  onToggleLeftPanel?: () => void
}

export function RightPanel({
  currentView,
  selectedItem,
  onBack,
  onCloseAnimationComplete,
  className,
  direction = 'forward',
  onNavigateAdjacent,
  onToggleLeftPanel,
}: RightPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const isPortrait = currentView === 'portrait'
  const hasDetail = selectedItem !== null && !isPortrait

  // --- Motion overlay state ---
  const [motionIsOpen, setMotionIsOpen] = useState(false)
  const [motionIsExpanded, setMotionIsExpanded] = useState(false)
  const [motionDisplayItem, setMotionDisplayItem] = useState<DetailItem | null>(null)
  const [motionDisplayView, setMotionDisplayView] = useState<ViewType>('portrait')

  // Refs to detect transitions without adding stale-closure deps
  const prevHasDetailRef = useRef(false)
  const prevItemIdRef = useRef<string | null>(null)

  useEffect(() => {
    const wasOpen = prevHasDetailRef.current
    const prevId  = prevItemIdRef.current

    // Update refs first so re-runs see the latest values
    prevHasDetailRef.current = hasDetail
    prevItemIdRef.current    = selectedItem?.id ?? null

    if (hasDetail && selectedItem) {
      if (!wasOpen) {
        // First open — let DetailOverlayMotion run its card→expand sequence
        setMotionDisplayItem(selectedItem)
        setMotionDisplayView(currentView)
        setMotionIsExpanded(false)
        setMotionIsOpen(true)
      } else if (selectedItem.id !== prevId) {
        // Swap to a different item — update content; AnimatePresence handles push
        setMotionDisplayItem(selectedItem)
        setMotionDisplayView(currentView)
        // isExpanded stays true so the container remains full during swap
      }
      // else: same item re-selected — no-op
    } else if (wasOpen && !hasDetail) {
      // Close — motionDisplayItem intentionally kept so AnimatePresence can exit
      setMotionIsOpen(false)
      setMotionIsExpanded(false)
    }
  }, [hasDetail, selectedItem, currentView])

  function renderDetail(view: ViewType, item: DetailItem, onBack: () => void) {
    switch (view) {
      case 'photo':
        return <PhotoDetail photo={item as Photo} onBack={onBack} />
      case 'collection':
        return <CollectionDetail collection={item as Collection} onBack={onBack} />
      default:
        return null
    }
  }

  // Escape closes detail; arrow keys navigate the content list (when not typing in a field)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentView === 'portrait') return

      if (e.key === 'Escape') {
        onBack()
        return
      }

      if (isTypingTarget(document.activeElement)) return

      if (e.code === 'Space' && onToggleLeftPanel) {
        e.preventDefault()
        onToggleLeftPanel()
        return
      }

      if (currentView === 'collection' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault()
        const root = document.querySelector<HTMLElement>('[data-detail-scroll-root]')
        if (root) {
          const step = Math.max(120, Math.round(root.clientHeight * 0.85))
          const delta = e.key === 'ArrowUp' ? -step : step
          root.scrollBy({ top: delta, behavior: 'smooth' })
        }
        return
      }

      if (!onNavigateAdjacent) return

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        onNavigateAdjacent(-1)
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        onNavigateAdjacent(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentView, onBack, onNavigateAdjacent, onToggleLeftPanel])

  // Click outside handler - close when clicking on left panel (but not when clicking a card to open another item)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (currentView !== 'portrait' && containerRef.current) {
        const target = e.target as Node
        // Don't close when clicking a nav card — let that click open the other project/image
        if ((target as Element).closest?.('[data-nav-card]')) return
        // Don't close when clicking UI chrome like the theme toggle
        if ((target as Element).closest?.('[data-ignore-outside]')) return
        // Close if click is outside the right panel container (e.g., on left panel background)
        if (!containerRef.current.contains(target)) {
          e.stopPropagation()
          onBack()
        }
      }
    }

    if (currentView !== 'portrait') {
      document.addEventListener('click', handleClickOutside, true)
      return () => document.removeEventListener('click', handleClickOutside, true)
    }
  }, [currentView, onBack])

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 overflow-hidden bg-layer-01 ${className || ''}`}
    >
      {/* Portrait View - stays in place, always rendered */}
      <div className="absolute inset-0 z-0">
        <PortraitView isVisible={isPortrait} />
      </div>

      <DetailOverlayMotion
        isOpen={motionIsOpen}
        isExpanded={motionIsExpanded}
        setIsExpanded={setMotionIsExpanded}
        displayItem={motionDisplayItem}
        displayView={motionDisplayView}
        direction={direction}
        onBack={onBack}
        renderDetail={renderDetail}
        onExited={() => {
          setMotionDisplayItem(null)
          setMotionIsExpanded(false)
          onCloseAnimationComplete?.()
        }}
      />
    </div>
  )
}
