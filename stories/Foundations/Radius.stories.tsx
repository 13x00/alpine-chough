import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { ThemeCompare, SectionHeading, StoryLayout } from '../_utils/ThemeCompare'

const radiusTokens = [
  { name: 'rounded-sm', cssVar: '--radius-sm', value: '2px', twClass: 'rounded-sm' },
  { name: 'rounded', cssVar: '--radius-sm (DEFAULT)', value: '2px', twClass: 'rounded' },
  { name: 'rounded-md', cssVar: '--radius-md', value: '6px', twClass: 'rounded-md' },
  { name: 'rounded-lg', cssVar: '--radius-lg', value: '12px', twClass: 'rounded-lg' },
  { name: 'rounded-xl', cssVar: '--radius-xl', value: '16px', twClass: 'rounded-xl' },
  { name: 'rounded-control', cssVar: '--radius-control', value: '8px', twClass: 'rounded-control' },
  { name: 'rounded-full', cssVar: '--radius-full', value: '9999px', twClass: 'rounded-full' },
]

function RadiusAudit() {
  return (
    <StoryLayout>
      <SectionHeading>Border Radius Tokens</SectionHeading>
      <p className="text-xs text-text-helper mb-4">
        All border-radius values are tokenised CSS vars. <code className="font-mono">rounded-control</code> is
        used for interactive elements inside cards/nav (e.g.{' '}
        <code className="font-mono">ThemeToggle</code>).
      </p>

      <div className="flex flex-wrap gap-6">
        {radiusTokens.map(({ name, cssVar, value, twClass }) => (
          <div key={name} className="flex flex-col items-center gap-2">
            <div
              className={`${twClass} w-20 h-20 bg-layer-02 border border-border-subtle-01`}
            />
            <div className="text-center space-y-0.5">
              <p className="text-xs font-medium text-text-primary font-mono">{name}</p>
              <p className="text-xs text-text-helper font-mono">{value}</p>
              <p className="text-xs text-text-helper">{cssVar}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionHeading>Usage in Components</SectionHeading>
      <div className="space-y-3">
        {[
          { label: 'Card', cls: 'rounded-lg', desc: 'rounded-lg — cards, panels, surface containers' },
          { label: 'ThemeToggle / BackButton', cls: 'rounded-control', desc: 'rounded-control — interactive controls inside panels' },
          { label: 'Status pill', cls: 'rounded-full', desc: 'rounded-full — pill badges' },
        ].map(({ label, cls, desc }) => (
          <div key={label} className="flex items-center gap-4">
            <div className={`${cls} w-12 h-12 bg-interactive flex-shrink-0`} />
            <div>
              <p className="text-sm font-medium text-text-primary">{label}</p>
              <p className="text-xs text-text-helper font-mono">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </StoryLayout>
  )
}

const meta: Meta = {
  title: 'Foundations/Radius',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj

export const Tokens: Story = {
  render: () => <RadiusAudit />,
}

export const Compare: Story = {
  name: 'Theme Compare',
  render: () => <ThemeCompare>{() => <RadiusAudit />}</ThemeCompare>,
}
