import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { SectionHeading, StoryLayout } from '../_utils/ThemeCompare'

/* Spacing steps defined in tokens.css — Tailwind default scale maps 1→0.25rem */
const spacingSteps = [
  { token: '--spacing-1', twClass: 'p-1', label: '1', px: '4px', rem: '0.25rem' },
  { token: '--spacing-2', twClass: 'p-2', label: '2', px: '8px', rem: '0.5rem' },
  { token: '--spacing-3', twClass: 'p-3', label: '3', px: '12px', rem: '0.75rem' },
  { token: '--spacing-4', twClass: 'p-4', label: '4', px: '16px', rem: '1rem' },
  { token: '--spacing-5', twClass: 'p-5', label: '5', px: '20px', rem: '1.25rem' },
  { token: '--spacing-6', twClass: 'p-6', label: '6', px: '24px', rem: '1.5rem' },
  { token: '--spacing-8', twClass: 'p-8', label: '8', px: '32px', rem: '2rem' },
  { token: '--spacing-10', twClass: 'p-10', label: '10', px: '40px', rem: '2.5rem' },
  { token: '--spacing-12', twClass: 'p-12', label: '12', px: '48px', rem: '3rem' },
  { token: '--spacing-16', twClass: 'p-16', label: '16', px: '64px', rem: '4rem' },
  { token: '--spacing-20', twClass: 'p-20', label: '20', px: '80px', rem: '5rem' },
  { token: '--spacing-24', twClass: 'p-24', label: '24', px: '96px', rem: '6rem' },
]

const widths: Record<string, string> = {
  '1': 'w-1',
  '2': 'w-2',
  '3': 'w-3',
  '4': 'w-4',
  '5': 'w-5',
  '6': 'w-6',
  '8': 'w-8',
  '10': 'w-10',
  '12': 'w-12',
  '16': 'w-16',
  '20': 'w-20',
  '24': 'w-24',
}

const gapSteps = [
  { label: 'gap-2', desc: '8px — sm', cls: 'gap-2' },
  { label: 'gap-4', desc: '16px — md (default card padding)', cls: 'gap-4' },
  { label: 'gap-6', desc: '24px — lg', cls: 'gap-6' },
]

function SpacingAudit() {
  return (
    <StoryLayout>
      <SectionHeading>Spacing Scale</SectionHeading>
      <div className="space-y-2">
        {spacingSteps.map((step) => (
          <div key={step.label} className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-52 flex-shrink-0">
              <span className="text-xs font-mono text-text-helper w-6 text-right">{step.label}</span>
              <span className="text-xs font-mono text-text-secondary w-12">{step.px}</span>
              <span className="text-xs font-mono text-text-helper">{step.rem}</span>
            </div>
            <div
              className={`${widths[step.label]} h-4 bg-interactive rounded-sm flex-shrink-0`}
              style={{ minWidth: '2px' }}
            />
          </div>
        ))}
      </div>

      <SectionHeading>Gap Scale (Grid component)</SectionHeading>
      <div className="space-y-4">
        {gapSteps.map(({ label, desc, cls }) => (
          <div key={label}>
            <p className="text-xs font-mono text-text-helper mb-1.5">
              {label} — {desc}
            </p>
            <div className={`flex ${cls}`}>
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-16 h-8 bg-layer-01 border border-border-subtle-01 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <SectionHeading>Touch Target (--spacing-12 / 48px)</SectionHeading>
      <div className="flex items-center gap-4">
        <div className="touch-target flex items-center justify-center bg-layer-01 border border-border-subtle-01 rounded-lg">
          <span className="text-xs text-text-helper">48px</span>
        </div>
        <span className="text-xs text-text-helper font-mono">
          .touch-target → min-width/height: var(--spacing-12)
        </span>
      </div>
    </StoryLayout>
  )
}

const meta: Meta = {
  title: 'Foundations/Spacing',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj

export const Scale: Story = {
  render: () => <SpacingAudit />,
}
