'use client'

import { useEffect, useRef, useState } from 'react'
import { PortraitView } from '@/components/content/PortraitView'
import { DetailOverlay } from '@/components/layout/DetailOverlay'
import { DetailOverlayMotion } from '@/components/layout/DetailOverlayMotion'
import { PhotoDetail } from '@/components/content/PhotoDetail'
import { CollectionDetail } from '@/components/content/CollectionDetail'
import { useDetailAnimation } from '@/hooks/useDetailAnimation'
import { ViewType, DetailItem, Photo, Collection } from '@/types/content'

const USE_MOTION_OVERLAY = true

interface RightPanelProps {
  currentView: ViewType
  selectedItem: import('@/types/content').DetailItem | null
  onBack: () => void
  onCloseAnimationComplete?: () => void
  className?: string
  direction?: 'forward' | 'backward'
}

export function RightPanel({
  currentView,
  selectedItem,
  onBack,
  onCloseAnimationComplete,
  className,
  direction = 'forward',
}: RightPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const isPortrait = currentView === 'portrait'
  const hasDetail = selectedItem !== null && !isPortrait

  // Legacy animation hook — disabled when USE_MOTION_OVERLAY is true but always
  // called (React rules prohibit conditional hook calls).
  const legacyAnimation = useDetailAnimation({
    hasDetail: USE_MOTION_OVERLAY ? false : hasDetail,
    selectedItem: USE_MOTION_OVERLAY ? null : selectedItem,
    currentView,
    onCloseAnimationComplete: USE_MOTION_OVERLAY ? undefined : onCloseAnimationComplete,
  })

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

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentView !== 'portrait') {
        onBack()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [currentView, onBack])

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

      {USE_MOTION_OVERLAY ? (
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
      ) : (
        <DetailOverlay
          showDetail={legacyAnimation.showDetail}
          isExpanded={legacyAnimation.isExpanded}
          displayItem={legacyAnimation.displayItem}
          outgoingItem={legacyAnimation.outgoingItem}
          swapAnimating={legacyAnimation.swapAnimating}
          displayView={legacyAnimation.displayView}
          outgoingView={legacyAnimation.outgoingView}
          direction={direction}
          onBack={onBack}
          renderDetail={renderDetail}
        />
      )}
    </div>
  )
}
