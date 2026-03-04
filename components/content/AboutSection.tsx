import { cn } from '@/lib/utils'

interface AboutSectionProps {
  className?: string
}

export function AboutSection({ className }: AboutSectionProps) {
  return (
    <section className={cn('flex flex-col gap-4', className)}>
      <p className="text-xl leading-normal text-text-primary">
        <span>AM*</span>
        <span className="text-text-secondary">{' ( Andreas Mitchley )'}</span>
      </p>
      <p className="text-base leading-normal text-text-primary">
        A 22 year old designer and photographer from Oslo — Norway. Currently in my fourth year of a Master&apos;s in Design at The Oslo School of Architecture and Design. I specialise in Interaction and Service Design, Brand identity &amp; Logo marks.
      </p>
    </section>
  )
}
