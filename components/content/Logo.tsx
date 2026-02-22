'use client'

import { cn } from '@/lib/utils'

interface LogoProps {
  onClick: () => void
  className?: string
}

export function Logo({ onClick, className }: LogoProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-lg font-normal tracking-tight transition-[color,opacity] duration-fast',
        'text-layer-8 hover:opacity-90 focus:outline-none',
        'hover:font-bold group',
        className
      )}
      aria-label="Home"
    >
      <span className="logo-gradient-text">AM*</span>
    </button>
  )
}
