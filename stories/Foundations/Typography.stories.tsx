import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { ThemeCompare, SectionHeading, StoryLayout } from '../_utils/ThemeCompare'

const fontSizes = [
  { name: 'text-xs', value: '12px', sample: 'The quick brown fox' },
  { name: 'text-sm', value: '14px', sample: 'The quick brown fox' },
  { name: 'text-base', value: '16px', sample: 'The quick brown fox' },
  { name: 'text-lg', value: '18px', sample: 'The quick brown fox' },
  { name: 'text-xl', value: '20px', sample: 'The quick brown fox' },
  { name: 'text-2xl', value: '24px', sample: 'The quick brown fox' },
  { name: 'text-3xl', value: '30px', sample: 'The quick brown fox' },
  { name: 'text-4xl', value: '36px', sample: 'Heading text' },
  { name: 'text-5xl', value: '48px', sample: 'Display' },
]

const fontWeights = [
  { name: 'font-normal', weight: 400, sample: 'Normal 400' },
  { name: 'font-medium', weight: 500, sample: 'Medium 500' },
  { name: 'font-semibold', weight: 600, sample: 'Semibold 600' },
  { name: 'font-bold', weight: 700, sample: 'Bold 700' },
]

const lineHeights = [
  { name: 'leading-tight', value: '1.25', sample: 'Tight leading. Used for headings. Extra line.' },
  { name: 'leading-normal', value: '1.5', sample: 'Normal leading. Used for body text. Extra line.' },
  { name: 'leading-relaxed', value: '1.75', sample: 'Relaxed leading. Used for captions. Extra line.' },
]

const fontFamilies = [
  { name: 'font-sans', sample: 'Sans-serif — primary UI font (IBM Plex Sans)' },
  { name: 'font-mono', sample: 'Monospace — code, counters, version strings' },
]

function TypographyAudit() {
  return (
    <StoryLayout>
      <SectionHeading>Font Families</SectionHeading>
      <div className="space-y-2">
        {fontFamilies.map((f) => (
          <div key={f.name} className="flex items-baseline gap-4">
            <span className="text-xs text-text-helper font-mono w-24 flex-shrink-0">{f.name}</span>
            <span className={`${f.name} text-base text-text-primary`}>{f.sample}</span>
          </div>
        ))}
      </div>

      <SectionHeading>Font Sizes</SectionHeading>
      <div className="space-y-1">
        {fontSizes.map((fs) => (
          <div key={fs.name} className="flex items-baseline gap-4">
            <span className="text-xs text-text-helper font-mono w-24 flex-shrink-0">
              {fs.name}
            </span>
            <span className="text-xs text-text-helper font-mono w-12 flex-shrink-0">
              {fs.value}
            </span>
            <span className={`${fs.name} text-text-primary leading-tight`}>{fs.sample}</span>
          </div>
        ))}
      </div>

      <SectionHeading>Font Weights</SectionHeading>
      <div className="space-y-1">
        {fontWeights.map((fw) => (
          <div key={fw.name} className="flex items-baseline gap-4">
            <span className="text-xs text-text-helper font-mono w-32 flex-shrink-0">{fw.name}</span>
            <span className={`${fw.name} text-base text-text-primary`}>{fw.sample}</span>
          </div>
        ))}
      </div>

      <SectionHeading>Line Heights</SectionHeading>
      <div className="space-y-4">
        {lineHeights.map((lh) => (
          <div key={lh.name} className="flex gap-4">
            <div className="w-36 flex-shrink-0 pt-0.5">
              <span className="text-xs text-text-helper font-mono block">{lh.name}</span>
              <span className="text-xs text-text-helper font-mono block">{lh.value}</span>
            </div>
            <p className={`${lh.name} text-sm text-text-primary max-w-xs`}>{lh.sample}</p>
          </div>
        ))}
      </div>

      <SectionHeading>Tracking</SectionHeading>
      <div className="space-y-1">
        {[
          { name: 'tracking-tight', sample: 'Tight letter spacing' },
          { name: 'tracking-normal', sample: 'Normal letter spacing' },
          { name: 'tracking-wide', sample: 'Wide letter spacing' },
          { name: 'tracking-widest', sample: 'Widest — used for section labels' },
        ].map((t) => (
          <div key={t.name} className="flex items-baseline gap-4">
            <span className="text-xs text-text-helper font-mono w-36 flex-shrink-0">{t.name}</span>
            <span className={`${t.name} text-sm text-text-primary uppercase`}>{t.sample}</span>
          </div>
        ))}
      </div>
    </StoryLayout>
  )
}

const meta: Meta = {
  title: 'Foundations/Typography',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj

export const Scale: Story = {
  render: () => <TypographyAudit />,
}

export const Compare: Story = {
  name: 'Theme Compare',
  render: () => <ThemeCompare>{() => <TypographyAudit />}</ThemeCompare>,
}
