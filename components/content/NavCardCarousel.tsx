'use client'

import { useEffect, useRef, useMemo, useCallback } from 'react'
import { NavCard } from './NavCard'
import { cn } from '@/lib/utils'

const CAROUSEL_PADDING_Y = 20 // py-5 = 20px top + bottom
const CARD_GAP = 16 // space-y-4

interface NavCardCarouselProps {
  items: Array<{
    id: string
    title: string
    category?: string
    image: string
    onClick: () => void
  }>
  pauseAutoScroll?: boolean
  /** When false, auto-scroll is paused and scroll position is not updated (e.g. when tab is hidden) */
  isActive?: boolean
  className?: string
  autoScrollSpeed?: number // milliseconds between scrolls
}

export function NavCardCarousel({
  items,
  pauseAutoScroll = false,
  isActive = true,
  className,
  autoScrollSpeed = 2000,
}: NavCardCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const dimensionsRef = useRef<{ step: number; maxScroll: number }>({ step: 0, maxScroll: 0 })

  // Memoize dimension calculation function
  const calculateDimensions = useCallback(() => {
    const container = containerRef.current
    if (!container) return { step: 0, maxScroll: 0 }
    
    const cardHeight = container.clientWidth / 2
    const step = cardHeight + CARD_GAP
    const maxScroll = container.scrollHeight - container.clientHeight
    
    return { step, maxScroll }
  }, [])

  // When this carousel becomes active (tab selected), scroll to top
  useEffect(() => {
    if (isActive && containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [isActive])

  // Memoized scroll function
  const performScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    // Use cached dimensions or recalculate if needed
    if (dimensionsRef.current.step === 0) {
      dimensionsRef.current = calculateDimensions()
    }
    
    const { step, maxScroll } = dimensionsRef.current
    if (maxScroll <= 0) return

    const current = container.scrollTop
    const next = Math.round(current / step) * step + step

    if (next >= maxScroll) {
      container.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      container.scrollTo({ top: next, behavior: 'smooth' })
    }
  }, [calculateDimensions])

  useEffect(() => {
    const shouldPause = pauseAutoScroll || !isActive
    if (shouldPause) {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current)
        scrollIntervalRef.current = null
      }
      return
    }
    
    const container = containerRef.current
    if (!container || items.length === 0) return

    // Calculate dimensions once when starting
    dimensionsRef.current = calculateDimensions()

    scrollIntervalRef.current = setInterval(performScroll, autoScrollSpeed)

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current)
      }
    }
  }, [items.length, autoScrollSpeed, pauseAutoScroll, isActive, calculateDimensions, performScroll])

  const handleMouseEnter = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (pauseAutoScroll || !isActive) return
    const container = containerRef.current
    if (!container || items.length === 0) return

    // Recalculate dimensions when resuming
    dimensionsRef.current = calculateDimensions()
    scrollIntervalRef.current = setInterval(performScroll, autoScrollSpeed)
  }, [pauseAutoScroll, isActive, items.length, autoScrollSpeed, calculateDimensions, performScroll])

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'overflow-y-auto scrollbar-hide',
        'h-full',
        'snap-y snap-mandatory',
        'space-y-4',
        className
      )}
    >
      <div className="h-5 shrink-0" aria-hidden="true" />
      {items.map((item) => (
        <div key={item.id} className="snap-start shrink-0">
          <NavCard
            title={item.title}
            category={item.category}
            image={item.image}
            onClick={item.onClick}
          />
        </div>
      ))}
      <div className="h-5 shrink-0" aria-hidden="true" />
    </div>
  )
}
