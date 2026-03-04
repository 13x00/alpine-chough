import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { Logo } from '@/components/content/Logo'
import { ThemeCompare, SectionHeading, StateLabel } from '../_utils/ThemeCompare'

const meta: Meta<typeof Logo> = {
  title: 'Components/Logo',
  component: Logo,
  parameters: { layout: 'centered' },
  args: {
    onClick: () => {},
  },
}
export default meta

type Story = StoryObj<typeof Logo>

/* ── Playground ─────────────────────────────────────────────────────────────── */

export const Playground: Story = {}

/* ── States ─────────────────────────────────────────────────────────────────── */

export const States: Story = {
  render: () => (
    <div className="p-8 space-y-6">
      <SectionHeading>Logo states</SectionHeading>
      <p className="text-xs text-text-helper mb-4">
        AM asterisk logo; light and dark variants switch with the theme.
      </p>

      <div className="flex gap-8 flex-wrap items-start">
        <div>
          <StateLabel>default (no hover)</StateLabel>
          <div className="bg-background border border-border-subtle-01 rounded">
            <Logo onClick={() => {}} />
          </div>
        </div>

        <div>
          <StateLabel>focus-visible</StateLabel>
          <div className="outline-2 outline-offset-2 outline-focus rounded inline-flex">
            <Logo onClick={() => {}} />
          </div>
        </div>
      </div>

      <SectionHeading>Colour tokens in use</SectionHeading>
      <div className="space-y-1 text-xs text-text-helper">
        <p><code className="font-mono">hover:bg-background-hover</code> — hover background</p>
        <p><code className="font-mono">duration-fast</code> — transition</p>
      </div>
    </div>
  ),
}

/* ── Theme Compare ──────────────────────────────────────────────────────────── */

export const Compare: Story = {
  name: 'Theme Compare',
  render: () => (
    <ThemeCompare>
      {() => (
        <div className="space-y-3">
          <StateLabel>default</StateLabel>
          <Logo onClick={() => {}} />
          <StateLabel>hover</StateLabel>
          <div className="bg-background border border-border-subtle-01 rounded inline-flex">
            <Logo onClick={() => {}} />
          </div>
        </div>
      )}
    </ThemeCompare>
  ),
}
