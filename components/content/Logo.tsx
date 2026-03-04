'use client'

import Image from 'next/image'
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
        'touch-target inline-flex h-12 w-12 items-center justify-center rounded-base transition-colors',
        'hover:bg-background-hover focus:outline-none',
        className
      )}
      aria-label="Home"
    >
      <span className="relative block h-12 w-12">
        <Image
          src="/am-asterisk-light.svg"
          alt=""
          width={48}
          height={48}
          className="logo-svg logo-svg-light absolute inset-0 h-full w-full object-contain"
        />
        <Image
          src="/am-asterisk-dark.svg"
          alt=""
          width={48}
          height={48}
          className="logo-svg logo-svg-dark absolute inset-0 h-full w-full object-contain"
        />
      </span>
    </button>
  )
}
