import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface TabButtonProps {
  children: ReactNode
  active?: boolean
  onClick: () => void
  className?: string
}

export function TabButton({ children, active, onClick, className }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 text-sm font-medium transition-colors duration-fast',
        'border-b-2',
        active
          ? 'border-layer-8 text-layer-8'
          : 'border-transparent text-layer-6 hover:text-layer-7 hover:border-layer-4',
        className
      )}
    >
      {children}
    </button>
  )
}
