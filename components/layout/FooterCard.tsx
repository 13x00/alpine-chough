'use client'

import { useState } from 'react'
import { Surface } from '@/components/ui/Surface'

const bracketLabel =
  'inline-flex items-center justify-center rounded-sm px-[length:var(--cds-spacing-02)] py-[length:var(--cds-spacing-01)] text-sm font-normal leading-[var(--line-height-normal)] text-text-primary transition-[background-color] duration-fast [transition-timing-function:var(--easing-standard)] group-hover:bg-blue-60'

const bracketWrap =
  'group touch-target inline-flex min-h-[length:var(--cds-size-large)] shrink-0 items-center justify-center gap-[length:var(--cds-spacing-02)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus'

const bracketBrace =
  'shrink-0 whitespace-nowrap text-sm font-normal leading-[var(--line-height-normal)] text-text-primary'

/**
 * Bracketed link (Figma AM-Website node 425:194).
 * `group` on the <a> drives `group-hover:bg-blue-60` on the inner label.
 */
function BracketLink({
  href,
  external,
  children,
}: {
  href: string
  external?: boolean
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={bracketWrap}
    >
      <span className={bracketBrace}>[</span>
      <span className={bracketLabel}>{children}</span>
      <span className={bracketBrace}>]</span>
    </a>
  )
}

/** Copy-to-clipboard bracket button — same visual treatment as BracketLink. */
function BracketButton({
  value,
  children,
}: {
  value: string
  children: React.ReactNode
}) {
  const [copied, setCopied] = useState(false)

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard not available — silent fail
    }
  }

  return (
    <button type="button" onClick={handleClick} className={bracketWrap}>
      <span className={bracketBrace}>[</span>
      <span className={bracketLabel}>{copied ? 'Copied!' : children}</span>
      <span className={bracketBrace}>]</span>
    </button>
  )
}

export function FooterCard() {
  return (
    <Surface
      as="footer"
      padding="none"
      className="footer-card-layout @container flex min-h-[length:var(--cds-size-large)] shrink-0 flex-row flex-wrap items-center justify-between gap-[length:var(--cds-spacing-04)] px-[length:var(--cds-spacing-07)] py-[length:var(--cds-spacing-03)]"
    >
      <div className="flex min-w-0 flex-wrap items-center gap-[length:var(--cds-spacing-03)]">
        <BracketLink href="mailto:andreas.mitchley@occstudio.com">Contact</BracketLink>
        <BracketLink href="https://linkedin.com" external>
          LinkedIn
        </BracketLink>
      </div>
      <BracketButton value="932 150 840">Org Nr: 932 150 840</BracketButton>
    </Surface>
  )
}
