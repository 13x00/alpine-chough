'use client'

import { useEffect, useState, useRef, useCallback, useMemo, lazy, Suspense } from 'react'
import { PortraitView } from '@/components/content/PortraitView'
import { BackButton } from '@/components/content/BackButton'
import { ViewType, Project, Article, Photography, ImageCollection } from '@/types/content'

// Lazy load detail components to reduce initial bundle size
const ProjectDetail = lazy(() => import('@/components/content/ProjectDetail').then(m => ({ default: m.ProjectDetail })))
const ArticleDetail = lazy(() => import('@/components/content/ArticleDetail').then(m => ({ default: m.ArticleDetail })))
const PhotographyDetail = lazy(() => import('@/components/content/PhotographyDetail').then(m => ({ default: m.PhotographyDetail })))
const ImageCollectionDetail = lazy(() => import('@/components/content/ImageCollectionDetail').then(m => ({ default: m.ImageCollectionDetail })))

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

  // Memoize expensive computations
  const detailContent = useMemo(() => {
    if (!displayItem) return null
    
    return {
      project: currentView === 'project' ? displayItem as Project : null,
      article: currentView === 'article' ? displayItem as Article : null,
      photography: currentView === 'photography' ? displayItem as Photography : null,
      collection: currentView === 'collection' ? displayItem as ImageCollection : null,
    }
  }, [displayItem, currentView])

  const outgoingContent = useMemo(() => {
    if (!outgoingItem) return null
    
    return {
      project: currentView === 'project' ? outgoingItem as Project : null,
      article: currentView === 'article' ? outgoingItem as Article : null,
      photography: currentView === 'photography' ? outgoingItem as Photography : null,
      collection: currentView === 'collection' ? outgoingItem as ImageCollection : null,
    }
  }, [outgoingItem, currentView])

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

  // Memoize event handlers
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && currentView !== 'portrait') {
      onBack()
    }
  }, [currentView, onBack])

  const handleClickOutside = useCallback((e: MouseEvent) => {
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
  }, [currentView, onBack])

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onBack()
  }, [onBack])

  const handleDetailClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  // Escape key handler
  useEffect(() => {
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [handleEscape])

  // Click outside handler
  useEffect(() => {
    if (currentView !== 'portrait') {
      document.addEventListener('click', handleClickOutside, true)
      return () => document.removeEventListener('click', handleClickOutside, true)
    }
  }, [currentView, handleClickOutside])

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
          onClick={handleBackdropClick}
        />
      )}

      {/* Outgoing detail - full section slides out when switching items */}
      {outgoingItem && outgoingContent && (
        <div
          key={`outgoing-${currentView}-${outgoingItem.id}`}
          className={`absolute inset-0 z-20 will-change-transform transition-transform duration-300 ease-out ${
            swapAnimating
              ? direction === 'forward'
                ? '-translate-x-full'
                : 'translate-x-full'
              : 'translate-x-0'
          }`}
          onClick={handleDetailClick}
        >
          <div className="w-full h-full bg-layer-surface overflow-y-auto shadow-lg">
            <Suspense fallback={<div className="p-8">Loading...</div>}>
              {outgoingContent.project && (
                <ProjectDetail project={outgoingContent.project} onBack={onBack} />
              )}
              {outgoingContent.article && (
                <ArticleDetail article={outgoingContent.article} onBack={onBack} />
              )}
              {outgoingContent.photography && (
                <PhotographyDetail photography={outgoingContent.photography} onBack={onBack} />
              )}
              {outgoingContent.collection && (
                <ImageCollectionDetail collection={outgoingContent.collection} onBack={onBack} />
              )}
            </Suspense>
          </div>
        </div>
      )}

      {/* Detail Views - card that slides in, then expands to full section */}
      {displayItem && detailContent && (
        <div
          ref={detailRef}
          key={`detail-${currentView}-${displayItem.id}`}
          className={`absolute inset-0 z-20 will-change-transform transition-all duration-300 ease-out ${
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
          onClick={handleDetailClick}
        >
          <div
            className={`bg-layer-surface overflow-y-auto shadow-lg transition-all duration-300 ease-out ${
              isExpanded && !outgoingItem ? 'w-full h-full rounded-none' : 'h-full w-[85%] max-w-4xl rounded-xl'
            }`}
          >
            <Suspense fallback={<div className="p-8">Loading...</div>}>
              {detailContent.project && (
                <ProjectDetail project={detailContent.project} onBack={onBack} />
              )}
              {detailContent.article && (
                <ArticleDetail article={detailContent.article} onBack={onBack} />
              )}
              {detailContent.photography && (
                <PhotographyDetail photography={detailContent.photography} onBack={onBack} />
              )}
              {detailContent.collection && (
                <ImageCollectionDetail collection={detailContent.collection} onBack={onBack} />
              )}
            </Suspense>
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
