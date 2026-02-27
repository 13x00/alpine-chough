import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface TypographyProps {
  children: ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
  variant?: 'heading' | 'body' | 'caption' | 'small'
}

export function Typography({
  children,
  className,
  as,
  variant = 'body',
}: TypographyProps) {
  const variantStyles = {
    heading: 'text-4xl font-bold leading-tight text-text-primary',
    body: 'text-base leading-normal text-text-secondary',
    caption: 'text-sm leading-relaxed text-text-helper',
    small: 'text-xs leading-normal text-text-helper',
  }

  const Component = as || 'p'

  return (
    <Component className={cn(variantStyles[variant], className)}>
      {children}
    </Component>
  )
}
