'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'framer-motion'
import type { ViewType, DetailItem } from '@/types/content'

export interface DetailOverlayMotionProps {
  /** Whether the overlay is open */
  isOpen: boolean
  /** Whether the surface has completed its card→full expansion */
  isExpanded: boolean
  /** Called by the component once the expand animation completes */
  setIsExpanded: (val: boolean) => void
  displayItem: DetailItem | null
  displayView: ViewType
  direction: 'forward' | 'backward'
  onBack: () => void
  renderDetail: (view: ViewType, item: DetailItem, onBack: () => void) => React.ReactNode
  /** Called after the overlay surface has fully exited (all exit animations complete) */
  onExited?: () => void
}

// ─── Motion token set ────────────────────────────────────────────────────────
// Glidey tween for the first-open card slide-in: legible travel without whip.
const SLIDE_IN_TWEEN = { duration: 0.34, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
// Snappy spring for expand / swap corrections.
const SURFACE_SPRING = { type: 'spring', stiffness: 520, damping: 42, mass: 0.9 } as const
// Cubic-bezier tween for content push-slides.
const CONTENT_TWEEN  = { duration: 0.26, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
// Quick entry opacity fade (settles well before the slide ends).
const OPACITY_IN  = { duration: 0.12, ease: 'easeOut' as const }
// Fast linear fade-in for backdrop.
const BACKDROP_IN = { duration: 0.14, ease: 'linear' as const }

// Phase A (shrink): easeOut so it decelerates into the card shape.
const SHRINK_TWEEN = { duration: 0.22, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
// Phase B (depart): easeIn so it accelerates away to the right.
const DEPART_TWEEN = { duration: 0.28, ease: [0.4, 0, 1, 1] as [number, number, number, number] }

// Symmetric inset padding while in card phase.
const CARD_PADDING = '24px'
const FULL_PADDING = '0px'

// Card border-radius in px (rounded-xl-ish).
const CARD_RADIUS = '14px'

const ARRIVE_HOLD_MS = 120

export function DetailOverlayMotion({
  isOpen,
  isExpanded,
  setIsExpanded,
  displayItem,
  displayView,
  direction,
  onBack,
  renderDetail,
  onExited,
}: DetailOverlayMotionProps) {
  const skipMotion = Boolean(useReducedMotion())

  // ── Measurement ─────────────────────────────────────────────────────────────
  const wrapperRef = useRef<HTMLDivElement>(null)
  // entryX: bounded glide (off-canvas but readable travel distance)
  const [entryX, setEntryX] = useState<number>(220)
  // exitX: full panel width + margin so card leaves completely before unmount
  const [exitX, setExitX] = useState<number>(600)

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

  // ── Close-phase FSM ──────────────────────────────────────────────────────────
  // isVisible keeps the subtree mounted during the 2-phase close so AnimatePresence
  // only removes it after we finish animating (it only becomes false at the end).
  const [isVisible, setIsVisible]     = useState(false)
  const [isClosing, setIsClosing]     = useState(false)
  const [isDeparting, setIsDeparting] = useState(false)

  // Refs for use inside animation callbacks (avoids stale closures).
  const isClosingRef   = useRef(false)
  const isDepartingRef = useRef(false)
  const prevIsOpenRef  = useRef(false)
  // Explicit phase label used by onAnimationComplete to ignore unrelated fires
  // (e.g. padding changes during normal open/expand).
  const phaseRef = useRef<'idle' | 'open' | 'closing-shrink' | 'closing-depart'>('idle')

  // Open: become visible and cancel any in-flight close.
  useLayoutEffect(() => {
    if (isOpen && displayItem) {
      setIsVisible(true)
      setIsClosing(false)
      isClosingRef.current = false
      setIsDeparting(false)
      isDepartingRef.current = false
      phaseRef.current = 'open'
    }
  }, [isOpen, displayItem?.id])

  // Close: detect the isOpen true → false transition and start phase A.
  // useLayoutEffect fires before paint so isVisible stays true on the same render
  // that isOpen becomes false — the subtree is never torn down prematurely.
  useLayoutEffect(() => {
    const wasOpen = prevIsOpenRef.current
    prevIsOpenRef.current = isOpen
    if (!isOpen && wasOpen && displayItem && phaseRef.current !== 'closing-shrink' && phaseRef.current !== 'closing-depart') {
      setIsClosing(true)
      isClosingRef.current = true
      setIsDeparting(false)
      isDepartingRef.current = false
      phaseRef.current = 'closing-shrink'
      setDidArrive(false)
      setIsExpanded(false) // reverting isExpanded drives the phase A shrink animation
    }
  }, [isOpen])

  // ── Arrival gate (entry sequence) ───────────────────────────────────────────
  const [didArrive, setDidArrive] = useState(false)

  useEffect(() => {
    if (isOpen && displayItem) setDidArrive(false)
  }, [isOpen, displayItem?.id])

  // Reduced-motion: skip card phase and expand immediately.
  useEffect(() => {
    if (skipMotion && isOpen && displayItem && !isExpanded) setIsExpanded(true)
  }, [skipMotion, isOpen, displayItem?.id, isExpanded, setIsExpanded])

  // After slide-in completes, hold briefly then expand.
  useEffect(() => {
    if (!didArrive || skipMotion) return
    const t = setTimeout(() => setIsExpanded(true), ARRIVE_HOLD_MS)
    return () => clearTimeout(t)
  }, [didArrive, skipMotion, setIsExpanded])

  // ── Derived animation values ─────────────────────────────────────────────────

  const shouldRender = isVisible && Boolean(displayItem)

  // Surface initial: off-canvas right for entry; snapped to full if already expanded (swap).
  const surfaceInitial = isExpanded
    ? { opacity: 1, x: 0, scale: 1, borderRadius: '0px' }
    : { opacity: 0, x: entryX, scale: 0.985, borderRadius: CARD_RADIUS }

  // Surface animate: x/scale/opacity are always "at rest" for the surface itself.
  // Phase A uses the parent's borderRadius change; phase B uses the parent's x.
  const surfaceAnimate = {
    opacity: 1,
    x: 0,
    scale: 1,
    borderRadius: isExpanded ? '0px' : CARD_RADIUS,
  }

  // Surface transition: SURFACE_SPRING when expanded/snapping; SLIDE_IN_TWEEN on entry;
  // SHRINK_TWEEN during close phase A so it matches the outer wrapper timing.
  const surfaceTransition = isExpanded
    ? SURFACE_SPRING
    : isClosing
    ? SHRINK_TWEEN
    : { ...SLIDE_IN_TWEEN, opacity: OPACITY_IN }

  // Outer wrapper animate: only padding during normal open/shrink so no stray x/scale/opacity
  // values linger in the same coordinate space before phase B kicks in.
  const outerAnimate = isDeparting
    ? { padding: CARD_PADDING, x: exitX, scale: 0.985, opacity: 0 }
    : { padding: isExpanded ? FULL_PADDING : CARD_PADDING }

  // Outer wrapper transition: switches per close phase.
  const outerTransition = isDeparting
    ? DEPART_TWEEN
    : isClosing
    ? SHRINK_TWEEN
    : undefined // normal open/expand uses Framer Motion default spring

  // ── Guarded close handler ────────────────────────────────────────────────────
  // If a close transaction is already in flight, additional calls are no-ops so
  // rapid backdrop/escape clicks cannot restart or wedge the sequence.
  const handleBack = () => {
    if (isClosingRef.current || isDepartingRef.current) return
    onBack()
  }

  // ── Phase A/B completion handler ─────────────────────────────────────────────

  const handleOuterAnimationComplete = () => {
    if (phaseRef.current === 'closing-shrink') {
      // Phase A (shrink) complete → begin phase B (depart)
      phaseRef.current = 'closing-depart'
      setIsDeparting(true)
      isDepartingRef.current = true
    } else if (phaseRef.current === 'closing-depart') {
      // Phase B (depart) complete → allow AnimatePresence to unmount
      phaseRef.current = 'idle'
      setIsVisible(false)
      setIsClosing(false)
      setIsDeparting(false)
      isClosingRef.current = false
      isDepartingRef.current = false
    }
    // All other phases (e.g. 'open'): ignore padding/expand animation completions.
  }

  // ── Content push-slide variants (swap, unchanged) ────────────────────────────
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
  } as const

  const swapTransition = skipMotion ? { duration: 0.15 } : CONTENT_TWEEN

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div ref={wrapperRef} className="absolute inset-0 pointer-events-none">
      <AnimatePresence onExitComplete={onExited}>
        {shouldRender && (
          <>
            {/*
             * Backdrop: stays at opacity 1 during phase A (shrink), fades out during
             * phase B (depart) so backdrop and card disappear together.
             */}
            <motion.div
              key="overlay-backdrop"
              className="absolute inset-0 z-10 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: isDeparting ? 0 : 1 }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={isDeparting ? DEPART_TWEEN : BACKDROP_IN}
              style={{ pointerEvents: isClosing || isDeparting ? 'none' : 'auto' }}
              onClick={handleBack}
            />

            {/*
             * Outer wrapper — padding animates card↔full-bleed; x/scale/opacity drive
             * phase B (depart). onAnimationComplete sequences phase A → phase B → unmount.
             */}
            <motion.div
              key="overlay-outer"
              className="absolute inset-0 z-20 flex min-h-0 flex-col items-stretch pointer-events-auto"
              initial={{ padding: CARD_PADDING, x: 0 }}
              animate={outerAnimate}
              transition={outerTransition}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              onAnimationComplete={handleOuterAnimationComplete}
              onClick={(e) => e.stopPropagation()}
            >
              {/*
               * Surface — entry slide/opacity driven here; borderRadius shrinks in phase A.
               * flex-1 min-h-0 so it takes remaining space but can shrink for scroll.
               */}
              <motion.div
                className="flex min-h-0 flex-1 flex-col overflow-hidden bg-layer-02 shadow-lg relative"
                initial={surfaceInitial}
                animate={surfaceAnimate}
                transition={surfaceTransition}
                onAnimationComplete={() => {
                  // Guard: do not trigger arrival gate during close sequence
                  if (!isExpanded && !isClosingRef.current) setDidArrive(true)
                }}
              >
                {/* Clip shell — absolute fill, clips only horizontal overflow for push animation */}
                <div className="absolute inset-0 overflow-x-hidden">
                  {/*
                   * Content — absolute fill gives a fixed height so overflow-y-auto scrolls
                   * when the detail content is taller than the panel.
                   */}
                  <AnimatePresence custom={direction} mode="sync" initial={false}>
                    <motion.div
                      key={`${displayView}-${displayItem!.id}`}
                      className="absolute inset-0 overflow-y-auto"
                      custom={direction}
                      variants={contentVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={swapTransition}
                    >
                      {renderDetail(displayView, displayItem!, onBack)}
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
