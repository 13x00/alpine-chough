'use client'

import { LeftPanel } from './LeftPanel'
import { RightPanel } from './RightPanel'
import { ContentType, ViewType, Project, Article, Photography } from '@/types/content'

interface SplitLayoutProps {
  currentTab: ContentType
  currentView: ViewType
  selectedItem: Project | Article | Photography | null
  onTabChange: (tab: ContentType) => void
  onHomeClick: () => void
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
  imageItems,
  projectItems,
}: SplitLayoutProps) {
  const hasDetailOpen = selectedItem !== null && currentView !== 'portrait'

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Left Panel - Darkest (furthest back) */}
      <div className="w-full md:w-1/2 flex-shrink-0 relative z-10">
        <LeftPanel
          currentTab={currentTab}
          onTabChange={onTabChange}
          onHomeClick={onHomeClick}
          imageItems={imageItems}
          projectItems={projectItems}
        />
      </div>
      {/* Overlay: darkens left panel when detail is open so detail reads as on top */}
      {hasDetailOpen && (
        <div
          className="absolute left-0 top-0 bottom-0 w-full md:w-1/2 z-[15] bg-layer-bg/70 pointer-events-none transition-opacity duration-300"
          aria-hidden
        />
      )}
      {/* Right Panel - Detail surface is lightest (on top) */}
      <div className="hidden md:flex md:w-1/2 relative z-20">
        <RightPanel
          currentView={currentView}
          selectedItem={selectedItem}
          onBack={onHomeClick}
        />
      </div>
    </div>
  )
}
