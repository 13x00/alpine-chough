'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface NavCardProps {
  title: string
  category?: string
  image: string
  onClick: () => void
  className?: string
}

export function NavCard({ title, category, image, onClick, className }: NavCardProps) {
  return (
    <div
      data-nav-card
      onClick={onClick}
      className={cn(
        'w-full aspect-[2/1] overflow-hidden rounded-xl cursor-pointer group',
        'border border-layer-3 bg-layer-2',
        'transition-all duration-300 hover:border-layer-4',
        className
      )}
    >
      <div className="relative w-full h-full">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-3 py-3">
          <p className="text-sm font-normal text-white leading-tight">{title}</p>
          {category && (
            <p className="text-xs text-white/60 mt-0.5">{category}</p>
          )}
        </div>
      </div>
    </div>
  )
}
