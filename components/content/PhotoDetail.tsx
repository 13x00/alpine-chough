'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { Typography } from '@/components/ui/Typography'
import Image from 'next/image'
import { Photo } from '@/types/content'

// API-served images use native img to avoid Next.js Image config for /api/* URLs
const isApiImage = (src: string) => src.startsWith('/api/')

// TODO: enable once Photo detail metadata design is finalised in Figma
const SHOW_META = false

interface PhotoDetailProps {
  photo: Photo
  onBack: () => void
  className?: string
}

export function PhotoDetail({ photo, className }: PhotoDetailProps) {
  const [loaded, setLoaded] = useState(false)
  const apiImgRef = useRef<HTMLImageElement | null>(null)

  useLayoutEffect(() => {
    setLoaded(false)
    if (!isApiImage(photo.image)) return
    const el = apiImgRef.current
    if (el?.complete && el.naturalWidth > 0) {
      setLoaded(true)
    }
  }, [photo.id, photo.image])

  return (
    <div className={`relative flex flex-col h-full p-4 ${className || ''}`}>

      {/* Image area — flex container provides the height reference for max-h-full */}
      <div className="flex flex-1 min-h-0 min-w-0 items-center justify-center">
        {isApiImage(photo.image) ? (
          <img
            src={photo.image}
            alt={photo.title}
            ref={apiImgRef}
            onLoad={() => setLoaded(true)}
            className={`block h-auto w-auto max-h-full max-w-full object-contain rounded-xs transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : (
          <Image
            src={photo.image}
            alt={photo.title}
            width={1200}
            height={800}
            onLoadingComplete={() => setLoaded(true)}
            className={`block h-auto w-auto max-h-full max-w-full object-contain rounded-xs transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
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
