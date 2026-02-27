'use client'

import { Typography } from '@/components/ui/Typography'
import { BackButton } from '@/components/content/BackButton'
import Image from 'next/image'
import { Article } from '@/types/content'

interface ArticleDetailProps {
  article: Article
  onBack: () => void
  className?: string
}

export function ArticleDetail({ article, onBack, className }: ArticleDetailProps) {
  return (
    <div className={`relative space-y-6 p-6 md:p-8 overflow-y-auto h-full ${className || ''}`}>
      <BackButton onClick={onBack} />
      
      {article.image && (
        <div className="relative w-full aspect-video overflow-hidden rounded-lg">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Typography variant="heading" as="h1" className="text-3xl md:text-4xl">
            {article.title}
          </Typography>
          {article.date && (
            <Typography variant="caption" className="mt-2">
              {new Date(article.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>
          )}
        </div>

        <Typography variant="body" className="text-text-secondary">
          {article.description}
        </Typography>

        <div className="prose prose-neutral max-w-none pt-4">
          <Typography variant="body" className="whitespace-pre-line leading-relaxed">
            {article.content}
          </Typography>
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {article.tags.map((tag) => (
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
