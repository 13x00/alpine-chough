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
        'inline-flex h-12 w-fit items-center justify-center px-3 text-lg font-normal tracking-tight transition-[color,opacity] duration-fast',
        'text-text-primary hover:bg-background-hover focus:outline-none',
        'hover:font-bold group',
        className
      )}
      aria-label="Home"
    >
      <span className="logo-gradient-text">AM*</span>
    </button>
  )
}
