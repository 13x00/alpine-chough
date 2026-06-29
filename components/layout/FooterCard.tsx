'use client'

import { useState } from 'react'
import { Copy, ArrowUpRight } from '@carbon/icons-react'

const footerBtn =
  'inline-flex h-12 shrink-0 items-center gap-2 rounded-base pl-6 pr-4 text-sm text-text-primary transition-colors hover:bg-layer-hover-01 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus'

function FooterCopyButton({
  label,
  value,
  copiedLabel = 'Copied!',
}: {
  label: string
  value: string
  copiedLabel?: string
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
    <button type="button" onClick={handleClick} className={footerBtn}>
      <span>{copied ? copiedLabel : label}</span>
      <Copy aria-hidden className="size-[1em] shrink-0 text-text-primary" />
    </button>
  )
}

function FooterLinkButton({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={footerBtn}
    >
      <span>{label}</span>
      <ArrowUpRight aria-hidden className="size-[1em] shrink-0 text-text-primary" />
    </a>
  )
}

/** Footer actions — Figma AM-Website node 543:1902 */
export function FooterCard() {
  return (
    <footer className="flex min-h-12 shrink-0 items-center justify-between overflow-hidden rounded-base">
      <div className="flex items-start gap-1">
        <FooterCopyButton label="Contact" value="andreas.mitchley@occstudio.com" />
        <FooterLinkButton label="LinkedIn" href="https://linkedin.com" />
      </div>
      <FooterCopyButton label="Org Nr: 932 150 840" value="932 150 840" />
    </footer>
  )
}
