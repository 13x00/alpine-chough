import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { BackButton } from '@/components/content/BackButton'
import { ThemeCompare, SectionHeading, StateLabel } from '../_utils/ThemeCompare'

const meta: Meta<typeof BackButton> = {
  title: 'Components/BackButton',
  component: BackButton,
  parameters: { layout: 'centered' },
  args: {
    onClick: () => {},
  },
}
export default meta

type Story = StoryObj<typeof BackButton>

/* ── Playground ─────────────────────────────────────────────────────────────── */

export const Playground: Story = {}

/* ── States ─────────────────────────────────────────────────────────────────── */

export const States: Story = {
  render: () => (
    <div className="p-8 space-y-6">
      <SectionHeading>BackButton states</SectionHeading>
      <p className="text-xs text-text-helper mb-4">
        BackButton is absolutely positioned in production (top-4 right-4). Here it&apos;s
        shown in a static context.
      </p>

      <div className="flex gap-8 flex-wrap items-center">
        <div>
          <StateLabel>default</StateLabel>
          <div className="relative w-12 h-12 bg-layer-01 border border-border-subtle-01 rounded-lg">
            <BackButton onClick={() => {}} className="static" />
          </div>
        </div>

        <div>
          <StateLabel>hover (bg-layer-hover-01 simulated)</StateLabel>
          <div className="relative w-12 h-12">
            <BackButton
              onClick={() => {}}
              className="static bg-layer-hover-01 text-text-primary"
            />
          </div>
        </div>

        <div>
          <StateLabel>focus-visible (ring-2 ring-focus)</StateLabel>
          <div className="relative w-12 h-12">
            <BackButton
              onClick={() => {}}
              className="static ring-2 ring-focus ring-offset-2"
            />
          </div>
        </div>
      </div>

      <SectionHeading>Live interaction — hover/focus this button</SectionHeading>
      <div className="relative w-16 h-16 bg-layer-02 rounded-lg border border-border-subtle-01 overflow-visible">
        <BackButton onClick={() => {}} />
      </div>

      <SectionHeading>Token usage</SectionHeading>
      <ul className="space-y-1 text-xs text-text-helper">
        <li><code className="font-mono">bg-layer-01</code> — resting background</li>
        <li><code className="font-mono">border-border-subtle-01</code> — resting border</li>
        <li><code className="font-mono">text-text-secondary</code> → <code className="font-mono">hover:text-text-primary</code></li>
        <li><code className="font-mono">hover:bg-layer-hover-01</code> — hover background</li>
        <li><code className="font-mono">focus:ring-2 focus:ring-focus</code> — focus ring</li>
        <li><code className="font-mono">rounded-full</code> — circular shape</li>
        <li><code className="font-mono">duration-fast</code> — 150ms transition</li>
      </ul>
    </div>
  ),
}

/* ── Theme Compare ──────────────────────────────────────────────────────────── */

export const Compare: Story = {
  name: 'Theme Compare',
  render: () => (
    <ThemeCompare>
      {() => (
        <div className="space-y-4">
          <StateLabel>default</StateLabel>
          <div className="relative w-12 h-12">
            <BackButton onClick={() => {}} className="static" />
          </div>
          <StateLabel>hover (simulated)</StateLabel>
          <div className="relative w-12 h-12">
            <BackButton onClick={() => {}} className="static bg-layer-hover-01 text-text-primary" />
          </div>
        </div>
      )}
    </ThemeCompare>
  ),
}
