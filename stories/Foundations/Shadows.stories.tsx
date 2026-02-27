import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { ThemeCompare, SectionHeading, StoryLayout } from '../_utils/ThemeCompare'

const shadowTokens = [
  {
    name: 'shadow-sm',
    cssVar: '--shadow-sm',
    value: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    twClass: 'shadow-sm',
    usage: 'Subtle lift — rarely used standalone',
  },
  {
    name: 'shadow / shadow-md',
    cssVar: '--shadow-md',
    value: '0 4px 6px -1px … (md)',
    twClass: 'shadow-md',
    usage: 'Card elevated variant, default shadow',
  },
  {
    name: 'shadow-lg',
    cssVar: '--shadow-lg',
    value: '0 10px 15px -3px … (lg)',
    twClass: 'shadow-lg',
    usage: 'Interactive Card on hover',
  },
]

function ShadowAudit() {
  return (
    <StoryLayout>
      <SectionHeading>Shadow Tokens</SectionHeading>
      <p className="text-xs text-text-helper mb-4">
        Shadows are most visible on dark backgrounds. Switch to a light background or use the
        Theme Compare story to see them clearly.
      </p>

      <div className="flex flex-wrap gap-8">
        {shadowTokens.map(({ name, cssVar, value, twClass, usage }) => (
          <div key={name} className="flex flex-col gap-3">
            <div
              className={`${twClass} rounded-lg bg-layer-01 border border-border-subtle-01 w-36 h-24 flex items-center justify-center`}
            >
              <span className="text-xs text-text-helper font-mono">{name}</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-text-primary font-mono">{name}</p>
              <p className="text-xs text-text-helper font-mono">{cssVar}</p>
              <p className="text-xs text-text-secondary max-w-36">{usage}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionHeading>Card: default vs elevated (shadow-md)</SectionHeading>
      <div className="flex gap-6">
        <div className="rounded-lg bg-layer-01 border border-border-subtle-01 w-40 h-24 flex items-center justify-center">
          <span className="text-xs text-text-helper">default (border only)</span>
        </div>
        <div className="rounded-lg bg-layer-02 shadow-md w-40 h-24 flex items-center justify-center">
          <span className="text-xs text-text-helper">elevated (shadow-md)</span>
        </div>
        <div className="rounded-lg bg-layer-01 border border-border-subtle-01 shadow-lg w-40 h-24 flex items-center justify-center">
          <span className="text-xs text-text-helper">hover state (shadow-lg)</span>
        </div>
      </div>
    </StoryLayout>
  )
}

const meta: Meta = {
  title: 'Foundations/Shadows',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj

export const Tokens: Story = {
  render: () => <ShadowAudit />,
}

export const Compare: Story = {
  name: 'Theme Compare',
  render: () => <ThemeCompare>{() => <ShadowAudit />}</ThemeCompare>,
}
