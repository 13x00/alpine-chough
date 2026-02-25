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
        'min-w-[3rem] min-h-[3rem] flex items-center justify-center',
        'bg-layer-2 border border-layer-3 rounded-full',
        'text-layer-7 hover:text-layer-8 hover:bg-layer-3',
        'transition-all duration-fast',
        'focus:outline-none focus:ring-2 focus:ring-layer-8 focus:ring-offset-2',
        className
      )}
      aria-label="Go back"
    >
      <ArrowLeft size={20} className="text-current" />
    </button>
  )
}
