'use client'

import { Typography } from '@/components/ui/Typography'
import { BackButton } from '@/components/content/BackButton'
import Image from 'next/image'
import { ImageCollection } from '@/types/content'

interface ImageCollectionDetailProps {
  collection: ImageCollection
  onBack: () => void
  className?: string
}

export function ImageCollectionDetail({ collection, onBack, className }: ImageCollectionDetailProps) {
  return (
    <div className={`relative space-y-6 p-6 md:p-8 overflow-y-auto h-full ${className || ''}`}>
      <BackButton onClick={onBack} />

      <div className="relative w-full aspect-[16/10] overflow-hidden rounded-lg bg-layer-2">
        <Image
          src={collection.coverImage}
          alt={collection.title}
          width={1200}
          height={750}
          className="w-full h-full object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div className="space-y-4">
        <Typography variant="heading" as="h1" className="text-3xl md:text-4xl">
          {collection.title}
        </Typography>

        {collection.description && (
          <Typography variant="body" className="text-layer-7 whitespace-pre-line">
            {collection.description}
          </Typography>
        )}
      </div>

      {collection.images && collection.images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          {collection.images.map((src, i) => (
            <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-layer-2">
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
