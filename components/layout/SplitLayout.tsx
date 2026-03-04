'use client'

import { LeftPanel } from './LeftPanel'
import { RightPanel } from './RightPanel'
import { Logo } from '@/components/content/Logo'
import { ThemeToggle } from '@/components/content/ThemeToggle'
import { ViewType, DetailItem } from '@/types/content'
import { Close, SidePanelClose } from '@carbon/icons-react'

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

  const hasDetailOpen = selectedItem !== null && currentView !== 'portrait'

  return (
    <div className="flex h-dvh overflow-hidden flex-col bg-background">
      {/* Top bar — logo + theme toggle + button group */}
      <header className="px-2 pt-2">
        <div className="flex items-center gap-2">
          {/* Logo + ThemeToggle — mirrors left panel width */}
          <div className={`w-full ${leftWidth} flex-shrink-0 flex items-center justify-between px-1 py-1 ${transitionClass}`}>
            <Logo onClick={onCloseDetail} />
            <ThemeToggle />
          </div>

          {/* Right column header — mirrors right panel width, button group hugs its content */}
          <div className={`hidden md:flex ${rightWidth} items-center ${transitionClass}`}>
            {hasDetailOpen && (
              <div
                className="rounded-base bg-layer-01 border border-border-subtle-00 inline-flex items-center gap-2 p-1"
                data-ignore-outside="true"
              >
                <button
                  onClick={onCloseDetail}
                  aria-label="Close detail"
                  className="flex h-12 w-12 items-center justify-center rounded-xs text-text-primary hover:bg-background-hover transition-colors cursor-pointer"
                >
                  <Close size={20} />
                </button>
                <button
                  onClick={onCloseDetail}
                  aria-label="Close panel"
                  className="flex h-12 w-12 items-center justify-center rounded-xs text-text-primary hover:bg-background-hover transition-colors cursor-pointer"
                >
                  <SidePanelClose size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content row */}
      <div className="flex-1 min-h-0 px-2 pb-2 pt-2">
        <div className="relative flex h-full min-h-0 gap-2 overflow-hidden">
          {/* Left column — about, project list, contact */}
          <div className={`w-full ${leftWidth} flex-shrink-0 relative z-10 ${transitionClass}`}>
            <LeftPanel projectItems={projectItems} selectedItemId={selectedItem?.id ?? null} />
          </div>

          {/* Right column — portrait / detail surface */}
          <div className={`hidden md:flex ${rightWidth} relative z-20 ${transitionClass}`}>
            <RightPanel
              currentView={currentView}
              selectedItem={selectedItem}
              onBack={onCloseDetail}
              onCloseAnimationComplete={onDetailCloseComplete}
              direction={detailDirection}
              className="rounded-base border border-border-subtle-00"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
