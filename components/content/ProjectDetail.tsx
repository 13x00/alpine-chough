'use client'

import { Typography } from '@/components/ui/Typography'
import { BackButton } from '@/components/content/BackButton'
import Image from 'next/image'
import { Project } from '@/types/content'

interface ProjectDetailProps {
  project: Project
  onBack: () => void
  className?: string
}

export function ProjectDetail({ project, onBack, className }: ProjectDetailProps) {
  return (
    <div className={`relative space-y-6 p-4 md:p-4 overflow-y-auto h-full ${className || ''}`}>
      <BackButton onClick={onBack} />
      
      <div className="relative w-full aspect-video overflow-hidden rounded-lg" style={{ marginTop: 0 }}>
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      
      <div className="space-y-4">
        <div>
          <Typography variant="heading" as="h1" className="text-3xl md:text-4xl">
            {project.title}
          </Typography>
          {project.category && (
            <Typography variant="caption" className="mt-2">
              {project.category}
            </Typography>
          )}
        </div>

        <Typography variant="body" className="text-text-secondary">
          {project.description}
        </Typography>

        {project.content && (
          <div className="prose prose-neutral max-w-none">
            <Typography variant="body" className="whitespace-pre-line">
              {project.content}
            </Typography>
          </div>
        )}

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {project.tags.map((tag) => (
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
