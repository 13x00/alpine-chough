'use client'

import { useEffect, useMemo, useState } from 'react'
import { LeftPanel } from './LeftPanel'
import { MobileImagePanel } from './MobileImagePanel'
import { Logo } from '@/components/content/Logo'
import { ThemeToggle } from '@/components/content/ThemeToggle'
import { ViewType, DetailItem, Photo, Collection, ProjectListItem } from '@/types/content'

interface MobileLayoutProps {
  currentView: ViewType
  selectedItem: DetailItem | null
  onCloseDetail: () => void
  onNavigateAdjacent?: (delta: -1 | 1) => void
  projectItems: ProjectListItem[]
}

function MobileHeader({ onCloseDetail }: { onCloseDetail: () => void }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between rounded-base p-1">
      <Logo onClick={onCloseDetail} />
      <ThemeToggle />
    </header>
  )
}

function detailImage(item: DetailItem, view: ViewType): string {
  if (view === 'photo') return (item as Photo).image
  return (item as Collection).coverImage
}

function detailTitle(item: DetailItem): string {
  return item.title
}

/** Figma 547:969 — single-column mobile: browse / preview / fullscreen */
export function MobileLayout({
  currentView,
  selectedItem,
  onCloseDetail,
  onNavigateAdjacent,
  projectItems,
}: MobileLayoutProps) {
  const [mobileFullscreen, setMobileFullscreen] = useState(false)

  const hasDetail = selectedItem !== null && currentView !== 'portrait'

  useEffect(() => {
    if (!hasDetail) setMobileFullscreen(false)
  }, [hasDetail, selectedItem?.id])

  const imageMeta = useMemo(() => {
    if (!hasDetail || !selectedItem) return null
    return {
      src: detailImage(selectedItem, currentView),
      title: detailTitle(selectedItem),
    }
  }, [hasDetail, selectedItem, currentView])

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background" data-ignore-outside="true">
      <div className="flex min-h-0 flex-1 flex-col gap-2 px-2 pb-2 pt-2">
        <MobileHeader onCloseDetail={onCloseDetail} />

        <div className="flex min-h-0 flex-1 flex-col gap-2">
          {hasDetail && imageMeta && (
            <MobileImagePanel
              imageSrc={imageMeta.src}
              title={imageMeta.title}
              isFullscreen={mobileFullscreen}
              onFullscreenChange={setMobileFullscreen}
              onNavigate={mobileFullscreen ? onNavigateAdjacent : undefined}
            />
          )}

          <LeftPanel
            variant="mobile"
            projectItems={projectItems}
            selectedItemId={selectedItem?.id ?? null}
            showAbout={!hasDetail}
            showList={!mobileFullscreen}
            className={mobileFullscreen ? 'shrink-0' : 'min-h-0 flex-1'}
          />
        </div>
      </div>
    </div>
  )
}
