'use client'

import { useEffect, useState, useRef } from 'react'
import { PortraitView } from '@/components/content/PortraitView'
import { ProjectDetail } from '@/components/content/ProjectDetail'
import { ArticleDetail } from '@/components/content/ArticleDetail'
import { PhotographyDetail } from '@/components/content/PhotographyDetail'
import { BackButton } from '@/components/content/BackButton'
import { ViewType, Project, Article, Photography } from '@/types/content'

interface RightPanelProps {
  currentView: ViewType
  selectedItem: Project | Article | Photography | null
  onBack: () => void
  className?: string
}

export function RightPanel({
  currentView,
  selectedItem,
  onBack,
  className,
}: RightPanelProps) {
  const [showDetail, setShowDetail] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [displayItem, setDisplayItem] = useState<Project | Article | Photography | null>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const isPortrait = currentView === 'portrait'
  const hasDetail = selectedItem !== null && !isPortrait

  // Handle detail view entrance animation - two stages
  useEffect(() => {
    if (hasDetail && selectedItem) {
      // Set item first
      setDisplayItem(selectedItem)
      setIsExpanded(false)
      // Start off-screen, then slide in as card
      setShowDetail(false)
      const slideTimer = setTimeout(() => {
        setShowDetail(true)
        // After slide-in completes, expand to full section
        const expandTimer = setTimeout(() => {
          setIsExpanded(true)
        }, 300) // Wait for slide animation to complete
        return () => clearTimeout(expandTimer)
      }, 10)
      return () => clearTimeout(slideTimer)
    } else if (!hasDetail && displayItem) {
      // Animate out: first shrink to card, then slide out
      setIsExpanded(false)
      const shrinkTimer = setTimeout(() => {
        setShowDetail(false)
        const slideTimer = setTimeout(() => {
          setDisplayItem(null)
        }, 300) // Wait for slide animation
        return () => clearTimeout(slideTimer)
      }, 300) // Wait for shrink animation
      return () => clearTimeout(shrinkTimer)
    }
  }, [hasDetail, selectedItem, displayItem])

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

  // Click outside handler - close when clicking on left panel
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (currentView !== 'portrait' && containerRef.current) {
        const target = e.target as Node
        // Close if click is outside the right panel container (e.g., on left panel)
        if (!containerRef.current.contains(target)) {
          e.stopPropagation()
          onBack()
        }
      }
    }

    if (currentView !== 'portrait') {
      // Use capture phase to catch clicks before they bubble
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
      {displayItem && (
        <div
          className={`absolute inset-0 z-10 transition-opacity duration-300 bg-black/40 ${
            showDetail ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={onBack}
        />
      )}

      {/* Detail Views - card that slides in, then expands to full section */}
      {displayItem && (
        <div
          ref={detailRef}
          key={`detail-${currentView}-${displayItem.id}`}
          className={`absolute inset-0 z-20 transition-all duration-300 ease-out ${
            showDetail ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          } ${isExpanded ? 'p-0' : 'py-2 px-4 md:px-6 flex items-center justify-center'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`bg-layer-surface overflow-y-auto shadow-lg transition-all duration-300 ease-out ${
              isExpanded
                ? 'w-full h-full rounded-none'
                : 'h-full w-[85%] max-w-4xl rounded-xl'
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
          </div>
        </div>
      )}
    </div>
  )
}
