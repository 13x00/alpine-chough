import { cn } from '@/lib/utils'

interface AboutSectionProps {
  className?: string
}

export function AboutSection({ className }: AboutSectionProps) {
  const year = new Date().getFullYear()
  return (
    <section className={cn('flex flex-col items-start gap-12', className)}>
      <div className="flex flex-col items-start gap-4">
        <p className="whitespace-nowrap text-xl leading-normal text-text-primary">
          <span>AM *</span>
          <span className="text-text-secondary">{' ARCHIVE'}</span>
        </p>
        <p className="max-w-sm text-base leading-normal text-text-primary">
          An archive of photos by Andreas Mitchley. A place to browse and revisit selected work — single images and collections — without the noise of a feed. The archive grows over time; everything stays available.
        </p>
      </div>
      <p className="text-base leading-normal text-text-primary">
        © {year} Andreas Mitchley. All rights reserved.
      </p>
    </section>
  )
}
