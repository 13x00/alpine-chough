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
        'relative z-10 flex-1 px-4 py-2 text-sm font-medium transition-colors duration-fast',
        'border-b-2 border-transparent',
        active
          ? 'text-text-primary'
          : 'text-text-helper hover:text-text-secondary',
        className
      )}
    >
      {children}
    </button>
  )
}
