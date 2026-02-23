'use client'

import { useEffect, useState, useRef } from 'react'
import { PortraitView } from '@/components/content/PortraitView'
import { ProjectDetail } from '@/components/content/ProjectDetail'
import { ArticleDetail } from '@/components/content/ArticleDetail'
import { PhotographyDetail } from '@/components/content/PhotographyDetail'
import { ImageCollectionDetail } from '@/components/content/ImageCollectionDetail'
import { BackButton } from '@/components/content/BackButton'
import { ViewType, Project, Article, Photography, ImageCollection } from '@/types/content'

const SLIDE_IN_DELAY_MS = 300
const SWAP_DURATION_MS = 300

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
  const [showDetail, setShowDetail] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [displayItem, setDisplayItem] = useState<import('@/types/content').DetailItem | null>(null)
  const [outgoingItem, setOutgoingItem] = useState<import('@/types/content').DetailItem | null>(null)
  const [swapAnimating, setSwapAnimating] = useState(false)
  const [displayView, setDisplayView] = useState<ViewType>('portrait')
  const detailRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const isPortrait = currentView === 'portrait'
  const hasDetail = selectedItem !== null && !isPortrait

  // Handle detail view entrance animation - two stages
  useEffect(() => {
    if (hasDetail && selectedItem) {
      const isSwitchingItem =
        displayItem && selectedItem.id !== displayItem.id && displayView !== 'portrait'

      if (isSwitchingItem) {
        // Switching to different item of same type:
        // Full section stays open; old full view slides out, new full view slides in
        setOutgoingItem(displayItem)
        setDisplayItem(selectedItem)
        setDisplayView(currentView)
        setSwapAnimating(false)

        const startTimer = requestAnimationFrame(() => {
          // next frame so both cards render in their starting positions
          requestAnimationFrame(() => setSwapAnimating(true))
        })

        const doneTimer = setTimeout(() => {
          setOutgoingItem(null)
          setSwapAnimating(false)
        }, SWAP_DURATION_MS)

        return () => {
          cancelAnimationFrame(startTimer)
          clearTimeout(doneTimer)
        }
      }

      // First open: set item, slide in, expand
      setOutgoingItem(null)
      setDisplayItem(selectedItem)
      setDisplayView(currentView)
      setIsExpanded(false)
      setShowDetail(false)
      const slideTimer = setTimeout(() => {
        setShowDetail(true)
        const expandTimer = setTimeout(() => {
          setIsExpanded(true)
        }, 300)
        return () => clearTimeout(expandTimer)
      }, SLIDE_IN_DELAY_MS)
      return () => clearTimeout(slideTimer)
    } else if (!hasDetail && (displayItem || outgoingItem)) {
      // Animate out: first shrink to card, then slide out
      setIsExpanded(false)
      setOutgoingItem(null)
      const shrinkTimer = setTimeout(() => {
        setShowDetail(false)
        const slideTimer = setTimeout(() => {
          setDisplayItem(null)
          onCloseAnimationComplete?.()
        }, 300)
        return () => clearTimeout(slideTimer)
      }, 300)
      return () => clearTimeout(shrinkTimer)
    }
  }, [hasDetail, selectedItem, currentView, onCloseAnimationComplete])

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
      className={`relative flex-1 overflow-hidden bg-layer-1 ${className || ''}`}
    >
      {/* Portrait View - stays in place, always rendered */}
      <div className="absolute inset-0 z-0">
        <PortraitView isVisible={isPortrait} />
      </div>

      {/* Backdrop overlay - clickable area to close */}
      {(displayItem || outgoingItem) && (
        <div
          className={`absolute inset-0 z-10 transition-opacity duration-300 bg-black/40 ${
            showDetail || outgoingItem ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={onBack}
        />
      )}

      {/* Outgoing detail - full section slides out when switching items */}
      {outgoingItem && (
        <div
          key={`outgoing-${currentView}-${outgoingItem.id}`}
          className={`absolute inset-0 z-20 transition-transform duration-300 ease-out ${
            swapAnimating
              ? direction === 'forward'
                ? '-translate-x-full'
                : 'translate-x-full'
              : 'translate-x-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full h-full bg-layer-surface overflow-y-auto shadow-lg">
            {currentView === 'project' && (
              <ProjectDetail project={outgoingItem as Project} onBack={onBack} />
            )}
            {currentView === 'article' && (
              <ArticleDetail article={outgoingItem as Article} onBack={onBack} />
            )}
            {currentView === 'photography' && (
              <PhotographyDetail photography={outgoingItem as Photography} onBack={onBack} />
            )}
            {currentView === 'collection' && (
              <ImageCollectionDetail collection={outgoingItem as ImageCollection} onBack={onBack} />
            )}
          </div>
        </div>
      )}

      {/* Detail Views - card that slides in, then expands to full section */}
      {displayItem && (
        <div
          ref={detailRef}
          key={`detail-${currentView}-${displayItem.id}`}
          className={`absolute inset-0 z-20 transition-all duration-300 ease-out ${
            outgoingItem
              ? swapAnimating
                ? 'translate-x-0'
                : direction === 'forward'
                  ? 'translate-x-full'
                  : '-translate-x-full'
              : showDetail
                ? 'translate-x-0 opacity-100'
                : 'translate-x-full opacity-0'
          } ${isExpanded && !outgoingItem ? 'p-0' : 'py-2 px-4 md:px-6 flex items-center justify-center'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`bg-layer-surface overflow-y-auto shadow-lg transition-all duration-300 ease-out ${
              isExpanded && !outgoingItem ? 'w-full h-full rounded-none' : 'h-full w-[85%] max-w-4xl rounded-xl'
            }`}
          >
            {currentView === 'project' && displayItem && (
              <ProjectDetail project={displayItem as Project} onBack={onBack} />
            )}
            {currentView === 'article' && displayItem && (
              <ArticleDetail article={displayItem as Article} onBack={onBack} />
            )}
            {currentView === 'photography' && displayItem && (
              <PhotographyDetail photography={displayItem as Photography} onBack={onBack} />
            )}
            {currentView === 'collection' && displayItem && (
              <ImageCollectionDetail collection={displayItem as ImageCollection} onBack={onBack} />
            )}
          </div>
        </div>
      )}

      {/* Status pill — floating bottom-right */}
      <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-lg">
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-blue-40" />
        <span className="text-xs text-layer-6 whitespace-nowrap">Currently working at Open Studio</span>
      </div>
    </div>
  )
}
