import { cn } from '@/lib/utils'

interface AboutSectionProps {
  className?: string
}

export function AboutSection({ className }: AboutSectionProps) {
  return (
    <section className={cn('flex flex-col gap-4', className)}>
      <p className="text-xl leading-normal text-text-primary">
        <span>AM *</span>
        <span className="text-text-secondary">{' ARCHIVE'}</span>
      </p>
      <p className="text-base leading-normal text-text-primary">
      An archive of photos by Andreas Mitchley. A place to browse and revisit selected work — single images and collections — without the noise of a feed. The archive grows over time; everything stays available.
      </p>
    </section>
  )
}
