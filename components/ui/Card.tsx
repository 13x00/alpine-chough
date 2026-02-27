import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  variant?: 'default' | 'elevated' | 'outlined'
}

export function Card({ children, className, onClick, variant = 'default' }: CardProps) {
  const baseStyles = 'rounded-lg transition-all duration-normal'

  const variantStyles = {
    default: 'bg-layer-01 border border-border-subtle-01',
    elevated: 'bg-layer-02 shadow-md',
    outlined: 'bg-transparent border-2 border-border-strong-01',
  }

  const interactiveStyles = onClick
    ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]'
    : ''

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], interactiveStyles, className)}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
