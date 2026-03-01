'use client'

import { Typography } from '@/components/ui/Typography'
import { BackButton } from '@/components/content/BackButton'
import Image from 'next/image'
import { Photo } from '@/types/content'

interface PhotoDetailProps {
  photo: Photo
  onBack: () => void
  className?: string
}

export function PhotoDetail({ photo, onBack, className }: PhotoDetailProps) {
  return (
    <div className={`relative space-y-6 p-6 md:p-8 ${className || ''}`}>
      <BackButton onClick={onBack} />
      
      <div className="relative w-full aspect-auto overflow-hidden rounded-lg">
        <Image
          src={photo.image}
          alt={photo.title}
          width={1200}
          height={800}
          className="w-full h-auto object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div className="space-y-4">
        <Typography variant="heading" as="h1" className="text-3xl md:text-4xl">
          {photo.title}
        </Typography>

        {photo.description && (
          <Typography variant="body" className="text-text-secondary">
            {photo.description}
          </Typography>
        )}

        {photo.date && (
          <Typography variant="caption">
            {new Date(photo.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
        )}

        {photo.tags && photo.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {photo.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium bg-layer-01 text-text-secondary rounded-full"
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
