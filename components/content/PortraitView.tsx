'use client'

import Image from 'next/image'
import { useState, useEffect, useMemo } from 'react'

const portraitImages = [
  '/Portrait_cycle/4839201756.webp',
  '/Portrait_cycle/0834672130.webp',
  '/Portrait_cycle/2916473820.webp',
  '/Portrait_cycle/7382019564.webp',
  '/Portrait_cycle/5102938471.webp',
  '/Portrait_cycle/9247150638.webp',
  '/Portrait_cycle/1563847290.webp',
]

// 7 seconds — long enough to settle into, short enough to feel alive
const CYCLE_DURATION = 7000
// Crossfade duration
const FADE_DURATION = 1200

interface PortraitViewProps {
  image?: string
  className?: string
  isVisible?: boolean // Pause cycle when not visible
}

export function PortraitView({ className, isVisible = true }: PortraitViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState(1)
  const [fading, setFading] = useState(false)

  // Memoize image sources to avoid recalculation
  const currentImage = useMemo(() => portraitImages[currentIndex], [currentIndex])
  const nextImage = useMemo(() => portraitImages[nextIndex], [nextIndex])

  // Preload all portrait images on mount for instant cycling
  useEffect(() => {
    portraitImages.forEach((src) => {
      const img = new window.Image()
      img.src = src
    })
  }, [])

  useEffect(() => {
    if (!isVisible) return // Pause cycle when not visible

    const interval = setInterval(() => {
      const next = (currentIndex + 1) % portraitImages.length
      setNextIndex(next)
      setFading(true)

      setTimeout(() => {
        setCurrentIndex(next)
        setFading(false)
      }, FADE_DURATION)
    }, CYCLE_DURATION)

    return () => clearInterval(interval)
  }, [currentIndex, isVisible])

  return (
    <div className={`relative w-full h-full overflow-hidden ${className || ''}`}>
      {/* Current image */}
      <Image
        key={currentImage}
        src={currentImage}
        alt="Portrait"
        fill
        className="object-cover"
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
      />

      {/* Next image fading in */}
      <Image
        key={`next-${nextImage}`}
        src={nextImage}
        alt="Portrait"
        fill
        className="object-cover will-change-opacity"
        style={{
          opacity: fading ? 1 : 0,
          transitionDuration: `${FADE_DURATION}ms`,
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          transitionProperty: 'opacity',
        }}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  )
}
