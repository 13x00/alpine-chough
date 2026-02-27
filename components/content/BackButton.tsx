'use client'

import { ArrowLeft } from '@carbon/icons-react'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  onClick: () => void
  className?: string
}

export function BackButton({ onClick, className }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'absolute top-4 right-4 z-50',
        'touch-target flex items-center justify-center',
        'bg-layer-01 border border-border-subtle-01 rounded-full',
        'text-text-secondary hover:text-text-primary hover:bg-layer-hover-01',
        'transition-all duration-fast',
        'focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2',
        className
      )}
      aria-label="Go back"
    >
      <ArrowLeft size={20} className="text-current" />
    </button>
  )
}
