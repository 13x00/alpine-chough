'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Close, SidePanelClose, SidePanelOpen } from '@carbon/icons-react'
import { PortraitView } from '@/components/content/PortraitView'
import { DetailOverlayMotion } from '@/components/layout/DetailOverlayMotion'
import { PhotoDetail } from '@/components/content/PhotoDetail'
import { CollectionDetail } from '@/components/content/CollectionDetail'
import { ViewType, DetailItem, Photo, Collection } from '@/types/content'
import { cn } from '@/lib/utils'

/** Hide detail chrome after this many ms without pointer/keyboard activity */
const CHROME_IDLE_MS = 2500

function isImageNavigationKey(key: string) {
  return (
    key === 'ArrowLeft' ||
    key === 'ArrowRight' ||
    key === 'ArrowUp' ||
    key === 'ArrowDown'
  )
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (target == null || !(target instanceof Element)) return false
  const el = target as HTMLElement
  if (el.isContentEditable) return true
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

interface RightPanelProps {
  currentView: ViewType
  selectedItem: import('@/types/content').DetailItem | null
  onBack: () => void
  onCloseAnimationComplete?: () => void
  className?: string
  direction?: 'forward' | 'backward'
  onNavigateAdjacent?: (delta: -1 | 1) => void
  onToggleLeftPanel?: () => void
  leftPanelHidden?: boolean
}

function ChromeIconButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      aria-label={label}
      data-ignore-outside="true"
      className="flex h-12 w-12 items-center justify-center rounded-xs text-text-primary hover:bg-background-hover transition-colors cursor-pointer"
    >
      {children}
    </button>
  )
}

function useIdleChromeVisibility(active: boolean) {
  const [visible, setVisible] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pinnedRef = useRef(false)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const scheduleHide = useCallback(() => {
    clearTimer()
    if (!active || pinnedRef.current) return
    timerRef.current = setTimeout(() => setVisible(false), CHROME_IDLE_MS)
  }, [active, clearTimer])

  const reveal = useCallback(() => {
    setVisible(true)
    scheduleHide()
  }, [scheduleHide])

  useEffect(() => {
    if (!active) {
      clearTimer()
      setVisible(true)
      pinnedRef.current = false
      return
    }

    setVisible(true)
    scheduleHide()

    const onActivity = () => reveal()

    const onKeyDown = (e: KeyboardEvent) => {
      if (isImageNavigationKey(e.key)) return
      reveal()
    }

    window.addEventListener('mousemove', onActivity, { passive: true })
    window.addEventListener('mousedown', onActivity, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('touchstart', onActivity, { passive: true })
    window.addEventListener('wheel', onActivity, { passive: true })

    return () => {
      clearTimer()
      window.removeEventListener('mousemove', onActivity)
      window.removeEventListener('mousedown', onActivity)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('touchstart', onActivity)
      window.removeEventListener('wheel', onActivity)
    }
  }, [active, reveal, scheduleHide, clearTimer])

  const onChromeEnter = useCallback(() => {
    pinnedRef.current = true
    clearTimer()
    setVisible(true)
  }, [clearTimer])

  const onChromeLeave = useCallback(() => {
    pinnedRef.current = false
    scheduleHide()
  }, [scheduleHide])

  return { visible, onChromeEnter, onChromeLeave }
}

/** Figma 528:80 — close + side panel controls overlaid on the right card */
function DetailChromeBar({
  onBack,
  onToggleLeftPanel,
  leftPanelHidden,
  visible,
  onMouseEnter,
  onMouseLeave,
}: {
  onBack: () => void
  onToggleLeftPanel?: () => void
  leftPanelHidden: boolean
  visible: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  return (
    <div
      className={cn(
        'absolute left-0 top-0 z-30 flex items-center gap-1 p-1 transition-opacity duration-normal ease-[var(--easing-standard)] motion-reduce:transition-none',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
      data-ignore-outside="true"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <ChromeIconButton onClick={onBack} label="Close detail">
        <Close size={24} />
      </ChromeIconButton>
      {onToggleLeftPanel && (
        <ChromeIconButton
          onClick={onToggleLeftPanel}
          label={leftPanelHidden ? 'Show left panel' : 'Hide left panel'}
        >
          {leftPanelHidden ? (
            <SidePanelOpen size={24} />
          ) : (
            <SidePanelClose size={24} />
          )}
        </ChromeIconButton>
      )}
    </div>
  )
}

export function RightPanel({
  currentView,
  selectedItem,
  onBack,
  onCloseAnimationComplete,
  className,
  direction = 'forward',
  onNavigateAdjacent,
  onToggleLeftPanel,
  leftPanelHidden = false,
}: RightPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const isPortrait = currentView === 'portrait'
  const hasDetail = selectedItem !== null && !isPortrait
  const {
    visible: chromeVisible,
    onChromeEnter,
    onChromeLeave,
  } = useIdleChromeVisibility(hasDetail)

  // --- Motion overlay state ---
  const [motionIsOpen, setMotionIsOpen] = useState(false)
  const [motionIsExpanded, setMotionIsExpanded] = useState(false)
  const [motionDisplayItem, setMotionDisplayItem] = useState<DetailItem | null>(null)
  const [motionDisplayView, setMotionDisplayView] = useState<ViewType>('portrait')

  // Refs to detect transitions without adding stale-closure deps
  const prevHasDetailRef = useRef(false)
  const prevItemIdRef = useRef<string | null>(null)

  useEffect(() => {
    const wasOpen = prevHasDetailRef.current
    const prevId  = prevItemIdRef.current

    // Update refs first so re-runs see the latest values
    prevHasDetailRef.current = hasDetail
    prevItemIdRef.current    = selectedItem?.id ?? null

    if (hasDetail && selectedItem) {
      if (!wasOpen) {
        // First open — let DetailOverlayMotion run its card→expand sequence
        setMotionDisplayItem(selectedItem)
        setMotionDisplayView(currentView)
        setMotionIsExpanded(false)
        setMotionIsOpen(true)
      } else if (selectedItem.id !== prevId) {
        // Swap to a different item — update content; AnimatePresence handles push
        setMotionDisplayItem(selectedItem)
        setMotionDisplayView(currentView)
        // isExpanded stays true so the container remains full during swap
      }
      // else: same item re-selected — no-op
    } else if (wasOpen && !hasDetail) {
      // Close — motionDisplayItem intentionally kept so AnimatePresence can exit
      setMotionIsOpen(false)
      setMotionIsExpanded(false)
    }
  }, [hasDetail, selectedItem, currentView])

  function renderDetail(view: ViewType, item: DetailItem, onBack: () => void) {
    switch (view) {
      case 'photo':
        return <PhotoDetail photo={item as Photo} onBack={onBack} />
      case 'collection':
        return <CollectionDetail collection={item as Collection} onBack={onBack} />
      default:
        return null
    }
  }

  // Escape closes detail; arrow keys navigate the content list (when not typing in a field)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentView === 'portrait') return

      if (e.key === 'Escape') {
        onBack()
        return
      }

      if (isTypingTarget(document.activeElement)) return

      if (e.code === 'Space' && onToggleLeftPanel) {
        e.preventDefault()
        onToggleLeftPanel()
        return
      }

      if (currentView === 'collection' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault()
        const root = document.querySelector<HTMLElement>('[data-detail-scroll-root]')
        if (root) {
          const step = Math.max(120, Math.round(root.clientHeight * 0.85))
          const delta = e.key === 'ArrowUp' ? -step : step
          root.scrollBy({ top: delta, behavior: 'smooth' })
        }
        return
      }

      if (!onNavigateAdjacent) return

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        onNavigateAdjacent(-1)
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        onNavigateAdjacent(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentView, onBack, onNavigateAdjacent, onToggleLeftPanel])

  // Click outside handler — desktop only (RightPanel stays mounted but hidden on mobile)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (window.matchMedia('(max-width: 767px)').matches) return
      if (currentView === 'portrait' || !containerRef.current) return

      const target = e.target
      if (target == null || !(target instanceof Element)) return

      if (target.closest('[data-nav-card]')) return
      if (target.closest('[data-ignore-outside]')) return

      if (!containerRef.current.contains(target)) {
        onBack()
      }
    }

    if (currentView !== 'portrait') {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [currentView, onBack])

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 overflow-hidden bg-layer-01 ${className || ''}`}
    >
      {hasDetail && (
        <DetailChromeBar
          onBack={onBack}
          onToggleLeftPanel={onToggleLeftPanel}
          leftPanelHidden={leftPanelHidden}
          visible={chromeVisible}
          onMouseEnter={onChromeEnter}
          onMouseLeave={onChromeLeave}
        />
      )}

      {/* Portrait View - stays in place, always rendered */}
      <div className="absolute inset-0 z-0">
        <PortraitView isVisible={isPortrait} />
      </div>

      <DetailOverlayMotion
        isOpen={motionIsOpen}
        isExpanded={motionIsExpanded}
        setIsExpanded={setMotionIsExpanded}
        displayItem={motionDisplayItem}
        displayView={motionDisplayView}
        direction={direction}
        onBack={onBack}
        renderDetail={renderDetail}
        onExited={() => {
          setMotionDisplayItem(null)
          setMotionIsExpanded(false)
          onCloseAnimationComplete?.()
        }}
      />
    </div>
  )
}
