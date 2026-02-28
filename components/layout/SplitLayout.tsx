'use client'

import { LeftPanel } from './LeftPanel'
import { RightPanel } from './RightPanel'
import { Logo } from '@/components/content/Logo'
import { ThemeToggle } from '@/components/content/ThemeToggle'
import { ViewType, DetailItem } from '@/types/content'

interface SplitLayoutProps {
  currentView: ViewType
  selectedItem: DetailItem | null
  onCloseDetail: () => void
  useNarrowLayout?: boolean
  onDetailCloseComplete?: () => void
  detailDirection?: 'forward' | 'backward'
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
  onCloseDetail,
  useNarrowLayout = false,
  onDetailCloseComplete,
  detailDirection,
  projectItems,
}: SplitLayoutProps) {
  const leftWidth = useNarrowLayout ? 'md:w-1/3' : 'md:w-1/2'
  const rightWidth = useNarrowLayout ? 'md:w-2/3' : 'md:w-1/2'
  const transitionClass = 'transition-[width] duration-300 ease-out'

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar — logo + theme toggle, aligned with Figma header */}
      <header className="px-2 pt-2">
        <div className="flex items-center justify-between px-1 py-1">
          <Logo onClick={onCloseDetail} />
          <ThemeToggle />
        </div>
      </header>

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
              onBack={onCloseDetail}
              onCloseAnimationComplete={onDetailCloseComplete}
              direction={detailDirection}
              className="rounded-lg border border-border-subtle-00"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
