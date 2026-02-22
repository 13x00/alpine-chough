interface AboutSectionProps {
  className?: string
}

export function AboutSection({ className }: AboutSectionProps) {
  return (
    <section className={className}>
      <p className="text-[13px] leading-[1.6] text-layer-7">
        I&apos;m <span className="font-bold text-layer-8">Andreas Slapgård Mitchley</span>, a 22 year old designer and
        photographer from Oslo — Norway. Currently in my fourth year of a
        Master&apos;s in Design at The Oslo School of Architecture and Design. I
        specialise in Interaction and Service Design, Brand
        identity &amp; Logo marks.
      </p>
    </section>
  )
}
