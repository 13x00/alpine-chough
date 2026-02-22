'use client'

import { useEffect, useRef } from 'react'
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
  className?: string
  autoScrollSpeed?: number // milliseconds between scrolls
}

export function NavCardCarousel({
  items,
  className,
  autoScrollSpeed = 2000,
}: NavCardCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || items.length === 0) return

    // Card height from aspect-[2/1]: height = width/2. Step = one card + gap for alignment.
    const getStep = () => {
      const cardHeight = container.clientWidth / 2
      return cardHeight + CARD_GAP
    }

    const scroll = () => {
      const step = getStep()
      const maxScroll = container.scrollHeight - container.clientHeight
      if (maxScroll <= 0) return

      // Round to nearest step so we land on card boundaries, then advance one step
      const current = container.scrollTop
      const next = Math.round(current / step) * step + step

      if (next >= maxScroll) {
        container.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        container.scrollTo({ top: next, behavior: 'smooth' })
      }
    }

    scrollIntervalRef.current = setInterval(scroll, autoScrollSpeed)

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current)
      }
    }
  }, [items.length, autoScrollSpeed])

  const handleMouseEnter = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
    }
  }

  const handleMouseLeave = () => {
    const container = containerRef.current
    if (!container || items.length === 0) return

    const step = container.clientWidth / 2 + CARD_GAP
    const maxScroll = container.scrollHeight - container.clientHeight
    if (maxScroll <= 0) return

    const scroll = () => {
      const pos = container.scrollTop
      const nextPos = Math.round(pos / step) * step + step
      if (nextPos >= maxScroll) {
        container.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        container.scrollTo({ top: nextPos, behavior: 'smooth' })
      }
    }

    scrollIntervalRef.current = setInterval(scroll, autoScrollSpeed)
  }

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
