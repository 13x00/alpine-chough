'use client'

import { createElement, type ElementType } from 'react'

const VARIANT_CLASSES = {
  default: 'rounded-lg bg-layer-01 border border-border-subtle-00',
  elevated: 'rounded-lg bg-layer-01 border border-border-subtle-00',
  outlined: 'rounded-lg bg-layer-01 border border-border-subtle-00',
} as const

const PADDING_CLASSES = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
} as const

interface SurfaceProps {
  children: React.ReactNode
  className?: string
  as?: ElementType
  padding?: keyof typeof PADDING_CLASSES
  variant?: keyof typeof VARIANT_CLASSES
}

export function Surface({
  children,
  className = '',
  as: Component = 'div',
  padding = 'md',
  variant = 'default',
}: SurfaceProps) {
  const base = VARIANT_CLASSES[variant]
  const paddingClass = PADDING_CLASSES[padding]
  const combined = [base, paddingClass, className].filter(Boolean).join(' ')
  return createElement(Component, { className: combined }, children)
}
