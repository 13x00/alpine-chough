import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { TabButton } from '@/components/ui/Tabs'
import { ThemeCompare, SectionHeading, StateLabel } from '../_utils/ThemeCompare'

const meta: Meta<typeof TabButton> = {
  title: 'Components/TabButton',
  component: TabButton,
  parameters: { layout: 'padded' },
  argTypes: {
    active: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: {
    children: 'Tab label',
    active: false,
    onClick: () => {},
  },
}
export default meta

type Story = StoryObj<typeof TabButton>

/* ── Playground ─────────────────────────────────────────────────────────────── */

export const Playground: Story = {}

/* ── States ─────────────────────────────────────────────────────────────────── */

export const States: Story = {
  render: () => (
    <div className="p-6 space-y-6">
      <SectionHeading>TabButton states</SectionHeading>

      <div className="flex flex-col gap-4">
        <div>
          <StateLabel>inactive (default)</StateLabel>
          <div className="flex border-b border-border-subtle-01 w-48">
            <TabButton active={false} onClick={() => {}}>Tab label</TabButton>
          </div>
        </div>

        <div>
          <StateLabel>active</StateLabel>
          <div className="flex border-b border-border-subtle-01 w-48">
            <TabButton active={true} onClick={() => {}}>Tab label</TabButton>
          </div>
        </div>

        <div>
          <StateLabel>hover (simulate: text-text-secondary)</StateLabel>
          <div className="flex border-b border-border-subtle-01 w-48">
            {/* Add hover class via extra className */}
            <TabButton active={false} onClick={() => {}} className="text-text-secondary">Tab label</TabButton>
          </div>
        </div>

        <div>
          <StateLabel>focus-visible (simulated with focus ring)</StateLabel>
          <div className="flex border-b border-border-subtle-01 w-48">
            <TabButton
              active={false}
              onClick={() => {}}
              className="outline-2 outline-offset-2 outline-focus"
            >
              Tab label
            </TabButton>
          </div>
        </div>
      </div>

      <SectionHeading>Interactive pair</SectionHeading>
      <p className="text-xs text-text-helper mb-2">Click tabs to toggle active state.</p>
      <InteractiveTabs />
    </div>
  ),
}

function InteractiveTabs() {
  const [active, setActive] = useState<'a' | 'b'>('a')
  return (
    <div className="flex border-b border-border-subtle-01 w-64 relative">
      <TabButton active={active === 'a'} onClick={() => setActive('a')}>Photography</TabButton>
      <TabButton active={active === 'b'} onClick={() => setActive('b')}>Design</TabButton>
      <div
        className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-interactive transition-transform duration-300 ease-out"
        style={{ transform: active === 'b' ? 'translateX(100%)' : 'translateX(0)' }}
        aria-hidden
      />
    </div>
  )
}

/* ── Theme Compare ──────────────────────────────────────────────────────────── */

export const Compare: Story = {
  name: 'Theme Compare',
  render: () => (
    <ThemeCompare>
      {() => (
        <div className="space-y-4">
          {[
            { label: 'inactive', active: false },
            { label: 'active', active: true },
          ].map(({ label, active }) => (
            <div key={label}>
              <StateLabel>{label}</StateLabel>
              <div className="flex border-b border-border-subtle-01 w-40">
                <TabButton active={active} onClick={() => {}}>Photography</TabButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </ThemeCompare>
  ),
}
