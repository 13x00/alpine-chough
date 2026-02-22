'use client'

import { Typography } from '@/components/ui/Typography'
import { BackButton } from '@/components/content/BackButton'
import Image from 'next/image'
import { Photography } from '@/types/content'

interface PhotographyDetailProps {
  photography: Photography
  onBack: () => void
  className?: string
}

export function PhotographyDetail({ photography, onBack, className }: PhotographyDetailProps) {
  return (
    <div className={`relative space-y-6 p-6 md:p-8 overflow-y-auto h-full ${className || ''}`}>
      <BackButton onClick={onBack} />
      
      <div className="relative w-full aspect-auto overflow-hidden rounded-lg">
        <Image
          src={photography.image}
          alt={photography.title}
          width={1200}
          height={800}
          className="w-full h-auto object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div className="space-y-4">
        <Typography variant="heading" as="h1" className="text-3xl md:text-4xl">
          {photography.title}
        </Typography>

        {photography.description && (
          <Typography variant="body" className="text-layer-7">
            {photography.description}
          </Typography>
        )}

        {photography.date && (
          <Typography variant="caption">
            {new Date(photography.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
        )}

        {photography.tags && photography.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {photography.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium bg-layer-5 text-layer-7 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
