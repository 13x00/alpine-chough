'use client'

import { useEffect, useState, CSSProperties } from 'react'

// ─── Phase timing (ms) ───────────────────────────────────────────────────────
// Phase 1   — gradient ambient, fullscreen, scrim invisible
// Phase 2   — compress to card + scrim fade in
// Phase 2.5 — hold so the card "lands"
// Phase 3   — swipe up off-screen, scrim fades out in the last 120 ms
// done      — unmount
const P1_MS  = 1600
const P2_MS  =  450
const P25_MS =   90
const P3_MS  =  600

// ─── Easing curves ───────────────────────────────────────────────────────────
const EASE_COMPRESS = 'cubic-bezier(0.2, 0.9, 0.2, 1)'   // strong impulse → soft land
const EASE_DISMISS  = 'cubic-bezier(0.12, 0.75, 0.2, 1)' // quick launch → smooth glide

type Phase = 'phase1' | 'phase2' | 'phase25' | 'phase3' | 'done'

export function PageLoader() {
  const [phase, setPhase]     = useState<Phase>('phase1')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Skip entirely for users who prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Guard: only render on the client (avoids SSR/hydration mismatch)
    setVisible(true)

    const t1 = setTimeout(() => setPhase('phase2'),  P1_MS)
    const t2 = setTimeout(() => setPhase('phase25'), P1_MS + P2_MS)
    const t3 = setTimeout(() => setPhase('phase3'),  P1_MS + P2_MS + P25_MS)
    const t4 = setTimeout(() => setPhase('done'),    P1_MS + P2_MS + P25_MS + P3_MS)

    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [])

  if (!visible || phase === 'done') return null

  const isCard       = phase !== 'phase1'
  const isDismissing = phase === 'phase3'

  // ─── Scrim styles ─────────────────────────────────────────────────────────
  // Opacity + transition are driven entirely by phase; background-color is fixed.
  const scrimOpacity: Record<Phase, number> = {
    phase1: 0, phase2: 1, phase25: 1, phase3: 0, done: 0,
  }
  const scrimTransition: Record<Phase, string> = {
    phase1:  'none',
    phase2:  `opacity ${P2_MS}ms ${EASE_COMPRESS}`,
    phase25: 'none',
    // Delay the fade-out until the last 120 ms of the 600 ms dismiss sweep
    phase3:  'opacity 120ms linear 480ms',
    done:    'none',
  }
  const scrimStyle: CSSProperties = {
    position:        'absolute',
    inset:           0,
    zIndex:          0,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    opacity:         scrimOpacity[phase],
    transition:      scrimTransition[phase],
  }

  // ─── Gradient card styles ─────────────────────────────────────────────────
  // We individually animate top/right/bottom/left rather than the `inset`
  // shorthand for broadest browser support.
  const inset = isCard ? '1.5rem' : '0'

  // During Phase 2, animate geometry properties with the compress easing.
  // During Phase 3, animate transform/opacity with the dismiss easing.
  // In all other phases, no transition (snap to value instantly).
  let cardTransition: string = 'none'
  if (isDismissing) {
    cardTransition = [
      `transform ${P3_MS}ms ${EASE_DISMISS}`,
      `opacity   ${P3_MS}ms ${EASE_DISMISS}`,
    ].join(', ')
  } else if (phase === 'phase2') {
    cardTransition = [
      'top', 'right', 'bottom', 'left', 'border-radius', 'box-shadow',
    ].map(p => `${p} ${P2_MS}ms ${EASE_COMPRESS}`).join(', ')
  }

  const cardStyle: CSSProperties = {
    position:     'absolute',
    top:          inset,
    right:        inset,
    bottom:       inset,
    left:         inset,
    zIndex:       10,
    overflow:     'hidden',
    willChange:   'transform',
    // Geometry: card shape appears in Phase 2
    borderRadius: isCard ? 'var(--radius-xl)' : '0',
    // Elevation: inlined to avoid CSS-var interpolation issues during transition
    boxShadow:    isCard
      ? '0 20px 40px rgba(0, 0, 0, 0.40), 0 8px 16px rgba(0, 0, 0, 0.25)'
      : 'none',
    // Dismiss motion
    transform:    isDismissing ? 'translateY(-110%)' : 'translateY(0)',
    opacity:      isDismissing ? 0.98 : 1,
    // AM gradient — exact same stops as Logo dark-mode hover.
    // Source: --am-gradient in globals.css (180deg, blue-100 0%/25% → blue-30 75%/100%).
    // backgroundSize 100% 400% makes the gradient 4× the element height so
    // logo-gradient-run can sweep background-position 0%→100% through it.
    backgroundImage:   'var(--am-gradient)',
    backgroundSize:    '100% 400%',
    // Same keyframe as the Logo dark-mode hover; duration stretched to fill Phase 1.
    // 'forwards' keeps the end state (blue-30 dominant) through Phase 2 + 3.
    animation:         'logo-gradient-run 1.6s ease-out forwards',
    transition:        cardTransition,
  }

  return (
    // Overlay sits above everything; pointer-events: none so the app is usable
    // even while the animation is running (no blocking render).
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}
    >
      {/* Layer 1 — scrim (z-0): darkens viewport to lift the card */}
      <div style={scrimStyle} />

      {/* Layer 2 — gradient card (z-10): AM-blue gradient that compresses and swipes away */}
      <div style={cardStyle} />
    </div>
  )
}
