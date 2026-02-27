import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { ThemeToggle } from '@/components/content/ThemeToggle'
import { ThemeCompare, SectionHeading, StateLabel } from '../_utils/ThemeCompare'

const meta: Meta<typeof ThemeToggle> = {
  title: 'Components/ThemeToggle',
  component: ThemeToggle,
  parameters: { layout: 'centered' },
}
export default meta

type Story = StoryObj<typeof ThemeToggle>

/* ── Playground ─────────────────────────────────────────────────────────────── */

export const Playground: Story = {}

/* ── States ─────────────────────────────────────────────────────────────────── */

export const States: Story = {
  render: () => (
    <div className="p-8 space-y-6">
      <SectionHeading>ThemeToggle states</SectionHeading>

      <div className="flex gap-8 flex-wrap">
        <div>
          <StateLabel>default (dark theme → shows Sun)</StateLabel>
          <div className="bg-background-hover rounded-control inline-flex">
            <ThemeToggle />
          </div>
        </div>

        <div>
          <StateLabel>hover (bg-background-hover applied)</StateLabel>
          <div
            className="inline-flex items-center justify-center touch-target bg-background-hover text-text-primary rounded-control"
            style={{ borderRadius: 'var(--radius-control)' }}
          >
            {/* Simulated hover state — production uses :hover pseudo-class */}
            <ThemeToggle />
          </div>
        </div>

        <div>
          <StateLabel>focus-visible (outline-accent ring)</StateLabel>
          <div className="inline-flex outline-2 outline-offset-2 outline-focus rounded-control">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <SectionHeading>In header context</SectionHeading>
      <div className="flex items-center justify-between px-2 py-1 bg-background border border-border-subtle-01 rounded-lg w-64">
        <span className="text-lg font-normal text-text-primary px-3">AM*</span>
        <ThemeToggle />
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
          <ThemeToggle />
          <StateLabel>hover bg (bg-background-hover)</StateLabel>
          <div className="bg-background-hover inline-flex rounded-control p-1">
            <ThemeToggle />
          </div>
        </div>
      )}
    </ThemeCompare>
  ),
}
