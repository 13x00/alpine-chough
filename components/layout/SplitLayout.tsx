'use client'

import { LeftPanel } from './LeftPanel'
import { RightPanel } from './RightPanel'
import { ContentType, ViewType, DetailItem } from '@/types/content'

interface SplitLayoutProps {
  currentTab: ContentType
  currentView: ViewType
  selectedItem: DetailItem | null
  onTabChange: (tab: ContentType) => void
  onHomeClick: () => void
  useNarrowLayout?: boolean
  onDetailCloseComplete?: () => void
  detailDirection?: 'forward' | 'backward'
  imageItems: Array<{
    id: string
    title: string
    category?: string
    image: string
    onClick: () => void
  }>
  projectItems: Array<{
    id: string
    title: string
    category?: string
    image: string
    onClick: () => void
  }>
}

export function SplitLayout({
  currentTab,
  currentView,
  selectedItem,
  onTabChange,
  onHomeClick,
  useNarrowLayout = false,
  onDetailCloseComplete,
  detailDirection,
  imageItems,
  projectItems,
}: SplitLayoutProps) {
  const hasDetailOpen = selectedItem !== null && currentView !== 'portrait'
  const leftWidth = useNarrowLayout ? 'md:w-1/3' : 'md:w-1/2'
  const rightWidth = useNarrowLayout ? 'md:w-2/3' : 'md:w-1/2'
  const transitionClass = 'transition-[width] duration-300 ease-out'

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Left Panel - Darkest (furthest back) */}
      <div className={`w-full ${leftWidth} flex-shrink-0 relative z-10 ${transitionClass}`}>
        <LeftPanel
          currentTab={currentTab}
          onTabChange={onTabChange}
          onHomeClick={onHomeClick}
          isDetailOpen={hasDetailOpen}
          imageItems={imageItems}
          projectItems={projectItems}
        />
      </div>
      {/* Right Panel - Detail surface is lightest (on top) */}
      <div className={`hidden md:flex ${rightWidth} relative z-20 ${transitionClass}`}>
        <RightPanel
          currentView={currentView}
          selectedItem={selectedItem}
          onBack={onHomeClick}
          onCloseAnimationComplete={onDetailCloseComplete}
          direction={detailDirection}
        />
      </div>
    </div>
  )
}
