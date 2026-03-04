'use client'

import { useEffect, useState } from 'react'
import { Typography } from '@/components/ui/Typography'
import { BackButton } from '@/components/content/BackButton'
import Image from 'next/image'
import { Photo } from '@/types/content'

// TODO: enable once Photo detail metadata design is finalised in Figma
const SHOW_META = false

interface PhotoDetailProps {
  photo: Photo
  onBack: () => void
  className?: string
}

export function PhotoDetail({ photo, onBack, className }: PhotoDetailProps) {
  // null = not yet measured (defaults to landscape layout to avoid jump on most photos)
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null)

  // Reset orientation measurement whenever the displayed photo changes
  useEffect(() => {
    setIsPortrait(null)
  }, [photo.id])

  function handleLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = e.currentTarget
    setIsPortrait(naturalHeight > naturalWidth)
  }

  return (
    <div className={`relative flex flex-col h-full p-4 ${className || ''}`}>
      <BackButton onClick={onBack} className="rounded" />

      {/* Image area — fills all remaining height, centers the photo */}
      <div className="flex flex-1 items-center justify-center min-h-0 min-w-0">
        <Image
          src={photo.image}
          alt={photo.title}
          width={1200}
          height={800}
          onLoad={handleLoad}
          className="max-h-full max-w-full rounded-xs object-cover"
          style={
            isPortrait
              ? { height: '100%', width: 'auto' }
              : { width: '100%', height: 'auto' }
          }
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Metadata — hidden until design is confirmed */}
      {SHOW_META && (
        <div className="space-y-4 pt-6">
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
      )}
    </div>
  )
}
