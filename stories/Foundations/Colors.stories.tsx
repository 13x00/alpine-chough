import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { ThemeCompare, TokenRow, SectionHeading, StoryLayout } from '../_utils/ThemeCompare'

/* ─────────────────────────────────────────────────────────────────────────────
   Token definitions — names map directly to Tailwind aliases from tailwind.config.ts
   ───────────────────────────────────────────────────────────────────────────── */

const surfaceTokens = [
  { label: 'background', cssVar: '--cds-background', bg: 'bg-background' },
  { label: 'background-hover', cssVar: '--cds-background-hover', bg: 'bg-background-hover' },
  { label: 'layer-01', cssVar: '--cds-layer-01', bg: 'bg-layer-01' },
  { label: 'layer-02', cssVar: '--cds-layer-02', bg: 'bg-layer-02' },
  { label: 'layer-03', cssVar: '--cds-layer-03', bg: 'bg-layer-03' },
  { label: 'layer-background-01', cssVar: '--cds-layer-background-01', bg: 'bg-layer-background-01' },
  { label: 'layer-hover-01', cssVar: '--cds-layer-hover-01', bg: 'bg-layer-hover-01' },
]

const textTokens = [
  { label: 'text-primary', cssVar: '--cds-text-primary', bg: 'bg-text-primary' },
  { label: 'text-secondary', cssVar: '--cds-text-secondary', bg: 'bg-text-secondary' },
  { label: 'text-helper', cssVar: '--cds-text-helper', bg: 'bg-text-helper' },
]

const borderTokens = [
  { label: 'border-subtle-00', cssVar: '--cds-border-subtle-00', bg: 'bg-border-subtle-00' },
  { label: 'border-subtle-01', cssVar: '--cds-border-subtle-01', bg: 'bg-border-subtle-01' },
  { label: 'border-strong-01', cssVar: '--cds-border-strong-01', bg: 'bg-border-strong-01' },
]

const interactiveTokens = [
  { label: 'interactive', cssVar: '--cds-interactive', bg: 'bg-interactive' },
  { label: 'focus', cssVar: '--cds-focus', bg: 'bg-focus' },
]

const supportTokens = [
  { label: 'support-info', cssVar: '--cds-support-info', bg: 'bg-support-info' },
  { label: 'support-warning', cssVar: '--cds-support-warning', bg: 'bg-support-warning' },
  { label: 'support-success', cssVar: '--cds-support-success', bg: 'bg-support-success' },
  { label: 'support-error', cssVar: '--cds-support-error', bg: 'bg-support-error' },
]

function Swatch({ bg }: { bg: string }) {
  return (
    <div
      className={`${bg} w-10 h-10 rounded flex-shrink-0 border border-border-subtle-01`}
    />
  )
}

function TokenGroup({
  heading,
  tokens,
}: {
  heading: string
  tokens: { label: string; cssVar: string; bg: string }[]
}) {
  return (
    <div>
      <SectionHeading>{heading}</SectionHeading>
      <div className="space-y-0.5">
        {tokens.map((t) => (
          <TokenRow key={t.label} label={t.label} cssVar={t.cssVar}>
            <Swatch bg={t.bg} />
          </TokenRow>
        ))}
      </div>
    </div>
  )
}

function ColorAudit() {
  return (
    <StoryLayout>
      <TokenGroup heading="Surface" tokens={surfaceTokens} />
      <TokenGroup heading="Text" tokens={textTokens} />
      <TokenGroup heading="Border" tokens={borderTokens} />
      <TokenGroup heading="Interactive" tokens={interactiveTokens} />
      <TokenGroup heading="Support / Status" tokens={supportTokens} />
    </StoryLayout>
  )
}

/* ─── Stories ──────────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Foundations/Colors',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj

export const Swatches: Story = {
  name: 'Semantic Swatches',
  render: () => <ColorAudit />,
}

export const Compare: Story = {
  name: 'Theme Compare',
  render: () => (
    <ThemeCompare>{() => <ColorAudit />}</ThemeCompare>
  ),
}
