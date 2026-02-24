'use client'

import { LeftPanel } from './LeftPanel'
import { RightPanel } from './RightPanel'
import { Logo } from '@/components/content/Logo'
import { ThemeToggle } from '@/components/content/ThemeToggle'
import { ViewType, DetailItem } from '@/types/content'

interface SplitLayoutProps {
  currentView: ViewType
  selectedItem: DetailItem | null
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
  currentView,
  selectedItem,
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
    <div className="flex h-screen flex-col bg-layer-bg">
      {/* Top bar — logo + theme toggle, shared across layout */}
      <div className="px-2 pt-2">
        <div
          className="flex items-center justify-between rounded-lg bg-layer-2 border border-layer-3 px-1 py-1"
          style={{ height: 'fit-content' }}
        >
          <Logo onClick={onHomeClick} />
          <ThemeToggle />
        </div>
      </div>

      {/* Main content row */}
      <div className="flex-1 px-2 pb-2 pt-2">
        <div className="flex h-full gap-2 overflow-hidden relative">
          {/* Left column — about, project list, contact */}
          <div className={`w-full ${leftWidth} flex-shrink-0 relative z-10 ${transitionClass}`}>
            <LeftPanel projectItems={projectItems} />
          </div>

          {/* Right column — portrait / detail surface */}
          <div className={`hidden md:flex ${rightWidth} relative z-20 ${transitionClass}`}>
            <RightPanel
              currentView={currentView}
              selectedItem={selectedItem}
              onBack={onHomeClick}
              onCloseAnimationComplete={onDetailCloseComplete}
              direction={detailDirection}
              className="rounded-lg border border-layer-3"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
