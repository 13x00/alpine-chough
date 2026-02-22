'use client'

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
        'min-w-[48px] min-h-[48px] flex items-center justify-center',
        'bg-layer-2 border border-layer-3 rounded-full',
        'text-layer-7 hover:text-layer-8 hover:bg-layer-3',
        'transition-all duration-fast',
        'focus:outline-none focus:ring-2 focus:ring-layer-8 focus:ring-offset-2',
        className
      )}
      aria-label="Go back"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
      >
        <path
          d="M12.5 15L7.5 10L12.5 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
