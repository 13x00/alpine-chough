'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

const portraitImages = [
  '/Portrait_cycle/AM_Portrait.jpg',
  '/Portrait_cycle/118_1808_Original.jpg',
  '/Portrait_cycle/DSC02816 2 10.png',
  '/Portrait_cycle/DSC02816 2 7.png',
  '/Portrait_cycle/DSC02816 2 8.png',
  '/Portrait_cycle/DSC02816 2 9.png',
  '/Portrait_cycle/IMG_6396.jpg',
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
        key={portraitImages[currentIndex]}
        src={portraitImages[currentIndex]}
        alt="Portrait"
        fill
        className="object-cover"
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
      />

      {/* Next image fading in */}
      <Image
        key={`next-${portraitImages[nextIndex]}`}
        src={portraitImages[nextIndex]}
        alt="Portrait"
        fill
        className="object-cover transition-opacity"
        style={{
          opacity: fading ? 1 : 0,
          transitionDuration: `${FADE_DURATION}ms`,
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  )
}
