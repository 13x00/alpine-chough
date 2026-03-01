'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { ViewType, DetailItem } from '@/types/content'

export type OverlayPhase = 'closed' | 'card' | 'full' | 'closing-shrink' | 'closing-depart'

export interface DetailOverlayMotionCleanProps {
  isOpen: boolean
  displayItem: DetailItem | null
  displayView: ViewType
  direction: 'forward' | 'backward'
  onBack: () => void
  onExited?: () => void
  renderDetail: (view: ViewType, item: DetailItem, onBack: () => void) => React.ReactNode
}

// ─── Tokens ────────────────────────────────────────────────────────────────────
const CARD_PADDING = '24px'
const FULL_PADDING = '0px'
const CARD_RADIUS = '14px'

const CARD_ARRIVE = { duration: 0.32, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
const OPACITY_IN = { duration: 0.12, ease: 'easeOut' as const }
const EXPAND_TWEEN = { duration: 0.26, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
const SHRINK_TWEEN = { duration: 0.24, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
const DEPART_TWEEN = { duration: 0.28, ease: [0.4, 0, 1, 1] as [number, number, number, number] }
const BACKDROP_IN = { duration: 0.14, ease: 'linear' as const }
const CONTENT_TWEEN = { duration: 0.26, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }

const CARD_ARRIVE_HOLD_MS = 100

export function DetailOverlayMotionClean({
  isOpen,
  displayItem,
  displayView,
  direction,
  onBack,
  onExited,
  renderDetail,
}: DetailOverlayMotionCleanProps) {
  const skipMotion = Boolean(useReducedMotion())
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [entryX, setEntryX] = useState(220)
  const [exitX, setExitX] = useState(600)
  const [phase, setPhase] = useState<OverlayPhase>('closed')

  // Refs for synchronous access inside callbacks and timers
  const phaseRef = useRef<OverlayPhase>('closed')
  const isOpenRef = useRef<boolean>(false)
  const displayIdRef = useRef<string | null>(null)
  const arriveHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep refs in sync
  useLayoutEffect(() => {
    phaseRef.current = phase
  }, [phase])
  useLayoutEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])
  useLayoutEffect(() => {
    displayIdRef.current = displayItem?.id ?? null
  }, [displayItem?.id])

  // Measure wrapper for off-canvas distances
  useLayoutEffect(() => {
    const measure = () => {
      const w = wrapperRef.current?.getBoundingClientRect().width
      if (w) {
        setEntryX(Math.min(w * 0.55 + 24, 220))
        setExitX(w + 40)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [isOpen])

  function clearArriveHold() {
    if (arriveHoldTimerRef.current) clearTimeout(arriveHoldTimerRef.current)
    arriveHoldTimerRef.current = null
  }

  // Clear arrive-hold timer whenever we leave the 'card' phase
  useLayoutEffect(() => {
    if (phase !== 'card') {
      clearArriveHold()
    }
  }, [phase])

  // Global cleanup on unmount
  useLayoutEffect(() => {
    return () => clearArriveHold()
  }, [])

  // Open: closed → card; close: card|full → closing-shrink
  useLayoutEffect(() => {
    if (isOpen && displayItem && phase === 'closed') {
      setPhase('card')
    }
    if (!isOpen && (phase === 'card' || phase === 'full')) {
      clearArriveHold()
      setPhase('closing-shrink')
    }
  }, [isOpen, displayItem, phase])

  // Reduced motion: skip card phase and go straight to full when opening
  useLayoutEffect(() => {
    if (skipMotion && isOpen && displayItem && phase === 'card') {
      setPhase('full')
    }
  }, [skipMotion, isOpen, displayItem, phase])

  // Gate on ref so rapid repeated clicks before React flushes state don't slip through
  const handleBack = () => {
    if (phaseRef.current === 'closing-shrink' || phaseRef.current === 'closing-depart') return
    onBack()
  }

  const handleOuterAnimationComplete = () => {
    // Use phaseRef so late completion events don't advance phase incorrectly
    if (phaseRef.current === 'closing-shrink') {
      setPhase('closing-depart')
    } else if (phaseRef.current === 'closing-depart') {
      setPhase('closed')
      onExited?.()
    }
  }

  const isClosing = phase === 'closing-shrink' || phase === 'closing-depart'
  const shouldRender = phase !== 'closed' && displayItem != null

  const outerPadding =
    phase === 'full' && !isClosing ? FULL_PADDING : CARD_PADDING
  const outerAnimate =
    phase === 'closing-depart'
      ? { padding: CARD_PADDING, x: exitX, scale: 0.985, opacity: 0 }
      : { padding: outerPadding }
  const outerTransition =
    phase === 'closing-depart'
      ? DEPART_TWEEN
      : phase === 'closing-shrink'
      ? SHRINK_TWEEN
      : undefined

  const isFullExpanded = phase === 'full' && !isClosing
  const isCardPhase = phase === 'card' && !isClosing
  const surfaceInitial =
    isCardPhase
      ? { opacity: 0, x: entryX, scale: 0.985, borderRadius: CARD_RADIUS }
      : isFullExpanded
      ? { opacity: 1, x: 0, scale: 1, borderRadius: '0px' }
      : { opacity: 1, x: 0, scale: 1, borderRadius: isFullExpanded || isClosing ? '0px' : CARD_RADIUS }
  const surfaceAnimate = {
    opacity: 1,
    x: 0,
    scale: 1,
    borderRadius: isFullExpanded ? '0px' : CARD_RADIUS,
  }
  const surfaceTransition = isFullExpanded
    ? EXPAND_TWEEN
    : isCardPhase
    ? { ...CARD_ARRIVE, opacity: OPACITY_IN }
    : isClosing
    ? phase === 'closing-depart'
      ? DEPART_TWEEN
      : SHRINK_TWEEN
    : EXPAND_TWEEN

  const contentVariants = {
    enter: (dir: 'forward' | 'backward') => ({
      x: dir === 'forward' ? '100%' : '-100%',
      opacity: 0.92,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 'forward' | 'backward') => ({
      x: dir === 'forward' ? '-100%' : '100%',
      opacity: 0.92,
    }),
  }
  const swapTransition = skipMotion ? { duration: 0.15 } : CONTENT_TWEEN

  return (
    <div ref={wrapperRef} className="absolute inset-0 pointer-events-none">
      <AnimatePresence onExitComplete={undefined}>
        {shouldRender && (
          <>
            <motion.div
              key="backdrop"
              className="absolute inset-0 z-10 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === 'closing-depart' ? 0 : 1 }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={phase === 'closing-depart' ? DEPART_TWEEN : BACKDROP_IN}
              style={{ pointerEvents: isClosing ? 'none' : 'auto' }}
              onClick={handleBack}
            />
            <motion.div
              key="outer"
              className="absolute inset-0 z-20 flex items-center justify-center"
              initial={{ padding: CARD_PADDING }}
              animate={outerAnimate}
              transition={outerTransition}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              onAnimationComplete={handleOuterAnimationComplete}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="w-full h-full bg-layer-02 shadow-lg overflow-hidden relative"
                initial={surfaceInitial}
                animate={surfaceAnimate}
                transition={surfaceTransition}
                onAnimationComplete={() => {
                  // Only schedule card→full if still in 'card', still open, same display item. Use refs.
                  const id = displayItem?.id ?? null
                  if (
                    !skipMotion &&
                    phaseRef.current === 'card' &&
                    isOpenRef.current === true &&
                    id != null &&
                    displayIdRef.current === id
                  ) {
                    arriveHoldTimerRef.current = setTimeout(() => {
                      if (
                        phaseRef.current === 'card' &&
                        isOpenRef.current === true &&
                        displayIdRef.current === id
                      ) {
                        setPhase('full')
                      }
                    }, CARD_ARRIVE_HOLD_MS)
                  }
                }}
              >
                <div className="absolute inset-0 overflow-hidden">
                  <AnimatePresence custom={direction} mode="sync" initial={false}>
                    <motion.div
                      key={`${displayView}-${displayItem.id}`}
                      className="absolute inset-0 overflow-y-auto"
                      custom={direction}
                      variants={contentVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={swapTransition}
                    >
                      {renderDetail(displayView, displayItem, onBack)}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
