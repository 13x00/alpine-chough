'use client'

import { useEffect, useRef } from 'react'
import { PortraitView } from '@/components/content/PortraitView'
import { DetailOverlay } from '@/components/layout/DetailOverlay'
import { ArticleDetail } from '@/components/content/ArticleDetail'
import { PhotographyDetail } from '@/components/content/PhotographyDetail'
import { ImageCollectionDetail } from '@/components/content/ImageCollectionDetail'
import { BackButton } from '@/components/content/BackButton'
import { useDetailAnimation } from '@/hooks/useDetailAnimation'
import { ViewType, DetailItem, Project, Article, Photography, ImageCollection } from '@/types/content'

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

  const {
    showDetail,
    isExpanded,
    displayItem,
    outgoingItem,
    swapAnimating,
    displayView,
    outgoingView,
  } = useDetailAnimation({
    hasDetail,
    selectedItem,
    currentView,
    onCloseAnimationComplete,
  })

  function renderDetail(view: ViewType, item: DetailItem, onBack: () => void) {
    switch (view) {
      case 'project':
        return <ProjectProjectFrame project={item as Project} onBack={onBack} />
      case 'article':
        return <ArticleDetail article={item as Article} onBack={onBack} />
      case 'photography':
        return <PhotographyDetail photography={item as Photography} onBack={onBack} />
      case 'collection':
        return <ImageCollectionDetail collection={item as ImageCollection} onBack={onBack} />
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

      <DetailOverlay
        showDetail={showDetail}
        isExpanded={isExpanded}
        displayItem={displayItem}
        outgoingItem={outgoingItem}
        swapAnimating={swapAnimating}
        displayView={displayView}
        outgoingView={outgoingView}
        direction={direction}
        onBack={onBack}
        renderDetail={renderDetail}
      />
    </div>
  )
}

interface ProjectProjectFrameProps {
  project: Project
  onBack: () => void
}

function ProjectProjectFrame({ project, onBack }: ProjectProjectFrameProps) {
  // TEMP DEBUG — visual differentiation only
  const BLUE_BG_TOKENS = ['bg-blue-60', 'bg-blue-50', 'bg-blue-40', 'bg-blue-30'] as const
  const idIndex = (() => {
    const n = parseInt(project.id, 10)
    if (!Number.isNaN(n)) return n
    return [...project.id].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  })()
  const blueBgClass = BLUE_BG_TOKENS[Math.abs(idIndex) % BLUE_BG_TOKENS.length]

  return (
    <div className="flex h-full flex-col">
      {/* Top bar with back arrow, matching Figma-inspired layout */}
      <div className="flex h-12 items-center justify-end border-b border-layer-02 bg-layer-01 px-0">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="flex h-12 w-12 items-center justify-center rounded-none text-text-secondary hover:text-text-primary hover:bg-layer-hover-01 transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
          >
            <path
              d="M12.5 15L7.5 10L12.5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Full-bleed project image */}
      <div className="relative flex-1">
        <div className={`absolute inset-0 ${blueBgClass}`} />
      </div>
    </div>
  )
}
