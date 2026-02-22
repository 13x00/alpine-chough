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
    heading: 'text-4xl font-bold leading-tight text-layer-8',
    body: 'text-base leading-normal text-layer-7',
    caption: 'text-sm leading-relaxed text-layer-6',
    small: 'text-xs leading-normal text-layer-5',
  }

  const Component = as || 'p'

  return (
    <Component className={cn(variantStyles[variant], className)}>
      {children}
    </Component>
  )
}
