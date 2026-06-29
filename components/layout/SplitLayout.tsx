'use client'

import { LeftPanel } from './LeftPanel'
import { MobileLayout } from './MobileLayout'
import { RightPanel } from './RightPanel'
import { Logo } from '@/components/content/Logo'
import { ThemeToggle } from '@/components/content/ThemeToggle'
import { ViewType, DetailItem } from '@/types/content'
import { cn } from '@/lib/utils'

interface SplitLayoutProps {
  currentView: ViewType
  selectedItem: DetailItem | null
  onCloseDetail: () => void
  leftPanelHidden?: boolean
  onToggleLeftPanel?: () => void
  useNarrowLayout?: boolean
  onDetailCloseComplete?: () => void
  detailDirection?: 'forward' | 'backward'
  onNavigateAdjacent?: (delta: -1 | 1) => void
  projectItems: Array<{
    id: string
    title: string
    category?: string
    year?: string
    image: string
    onClick: () => void
  }>
}

function LeftColumnHeader({ onCloseDetail }: { onCloseDetail: () => void }) {
  return (
    <div
      className="flex h-14 shrink-0 items-start gap-2"
      data-ignore-outside="true"
    >
      <div className="flex min-w-0 flex-1 items-center justify-between overflow-hidden rounded-base p-1">
        <Logo onClick={onCloseDetail} />
        <ThemeToggle />
      </div>
    </div>
  )
}

export function SplitLayout({
  currentView,
  selectedItem,
  onCloseDetail,
  leftPanelHidden = false,
  onToggleLeftPanel,
  useNarrowLayout = false,
  onDetailCloseComplete,
  detailDirection,
  onNavigateAdjacent,
  projectItems,
}: SplitLayoutProps) {
  const leftWidth = useNarrowLayout ? 'md:w-1/3' : 'md:w-1/2'
  const rightWidth = useNarrowLayout ? 'md:w-2/3' : 'md:w-1/2'
  const transitionClass =
    'transition-[width,opacity] duration-300 ease-out motion-reduce:transition-none'
  const hasDetailOpen = selectedItem !== null && currentView !== 'portrait'
  const hideLeftColumn = hasDetailOpen && leftPanelHidden

  const bodyLeftClass = hideLeftColumn
    ? `w-full md:w-0 md:min-w-0 md:overflow-hidden md:opacity-0 md:pointer-events-none shrink-0 relative z-10 ${transitionClass}`
    : `w-full ${leftWidth} shrink-0 relative z-10 ${transitionClass}`

  const bodyRightClass = hideLeftColumn
    ? `hidden md:flex flex-1 min-w-0 relative z-20 ${transitionClass}`
    : `hidden md:flex ${rightWidth} relative z-20 ${transitionClass}`

  const rowGapClass = hideLeftColumn
    ? 'gap-0 transition-[gap] duration-300 ease-out motion-reduce:transition-none'
    : 'gap-2 transition-[gap] duration-300 ease-out motion-reduce:transition-none'

  return (
    <>
      <div className="md:hidden">
        <MobileLayout
          currentView={currentView}
          selectedItem={selectedItem}
          onCloseDetail={onCloseDetail}
          onNavigateAdjacent={onNavigateAdjacent}
          projectItems={projectItems}
        />
      </div>

      <div className="hidden md:flex h-dvh flex-col overflow-hidden bg-background">
      <div className="flex min-h-0 flex-1 flex-col px-2 pb-2 pt-2">
        <div className={cn('relative flex h-full min-h-0 overflow-hidden', rowGapClass)}>
          <div className={bodyLeftClass}>
            <div className="flex h-full min-h-0 flex-col gap-2">
              <LeftColumnHeader onCloseDetail={onCloseDetail} />
              <LeftPanel
                projectItems={projectItems}
                selectedItemId={selectedItem?.id ?? null}
                className="min-h-0 flex-1"
              />
            </div>
          </div>

          <div className={bodyRightClass}>
            <RightPanel
              currentView={currentView}
              selectedItem={selectedItem}
              onBack={onCloseDetail}
              onCloseAnimationComplete={onDetailCloseComplete}
              direction={detailDirection}
              onNavigateAdjacent={onNavigateAdjacent}
              onToggleLeftPanel={onToggleLeftPanel}
              leftPanelHidden={leftPanelHidden}
              className="rounded-base border border-border-subtle-00"
            />
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
