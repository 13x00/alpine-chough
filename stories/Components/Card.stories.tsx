import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { Card } from '@/components/ui/Card'
import { ThemeCompare, SectionHeading, StateLabel } from '../_utils/ThemeCompare'

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outlined'],
    },
  },
  args: {
    children: (
      <div className="p-6 space-y-2">
        <p className="text-sm font-medium text-text-primary">Card title</p>
        <p className="text-xs text-text-secondary">Supporting description text goes here.</p>
      </div>
    ),
  },
}
export default meta

type Story = StoryObj<typeof Card>

/* ── Playground ─────────────────────────────────────────────────────────────── */

export const Playground: Story = {
  args: { variant: 'default' },
}

/* ── All Variants ───────────────────────────────────────────────────────────── */

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      {(['default', 'elevated', 'outlined'] as const).map((variant) => (
        <Card key={variant} variant={variant} className="w-52">
          <div className="p-6 space-y-2">
            <p className="text-xs font-mono text-text-helper">{variant}</p>
            <p className="text-sm font-medium text-text-primary">Card title</p>
            <p className="text-xs text-text-secondary">Description text.</p>
          </div>
        </Card>
      ))}
    </div>
  ),
}

/* ── States ─────────────────────────────────────────────────────────────────── */

export const States: Story = {
  render: () => (
    <div className="p-6 space-y-6">
      <SectionHeading>Default variant states</SectionHeading>

      <div className="flex gap-6 flex-wrap">
        <div>
          <StateLabel>default</StateLabel>
          <Card variant="default" className="w-44">
            <div className="p-4">
              <p className="text-sm text-text-primary">Default</p>
            </div>
          </Card>
        </div>

        <div>
          <StateLabel>hover (simulated)</StateLabel>
          {/* Force hover-like appearance by adding shadow-lg + scale */}
          <Card variant="default" className="w-44 shadow-lg scale-[1.02]" onClick={() => {}}>
            <div className="p-4">
              <p className="text-sm text-text-primary">Hover</p>
            </div>
          </Card>
        </div>

        <div>
          <StateLabel>focus-visible (outline)</StateLabel>
          <Card
            variant="default"
            className="w-44 outline-2 outline-offset-2 outline-focus"
            onClick={() => {}}
          >
            <div className="p-4">
              <p className="text-sm text-text-primary">Focus</p>
            </div>
          </Card>
        </div>
      </div>

      <SectionHeading>Elevated variant states</SectionHeading>
      <div className="flex gap-6 flex-wrap">
        <div>
          <StateLabel>default</StateLabel>
          <Card variant="elevated" className="w-44">
            <div className="p-4">
              <p className="text-sm text-text-primary">Default</p>
            </div>
          </Card>
        </div>
        <div>
          <StateLabel>hover (simulated)</StateLabel>
          <Card variant="elevated" className="w-44 shadow-lg scale-[1.02]" onClick={() => {}}>
            <div className="p-4">
              <p className="text-sm text-text-primary">Hover</p>
            </div>
          </Card>
        </div>
      </div>

      <SectionHeading>Interactive card — live hover</SectionHeading>
      <p className="text-xs text-text-helper mb-2">Hover this card to see transition-all duration-normal.</p>
      <Card
        variant="default"
        className="w-56 cursor-pointer"
        onClick={() => {}}
      >
        <div className="p-4">
          <p className="text-sm text-text-primary">Interactive card</p>
          <p className="text-xs text-text-helper mt-1">hover me</p>
        </div>
      </Card>
    </div>
  ),
}

/* ── Theme Compare ──────────────────────────────────────────────────────────── */

export const Compare: Story = {
  name: 'Theme Compare',
  render: () => (
    <ThemeCompare>
      {() => (
        <div className="flex gap-4 flex-wrap">
          {(['default', 'elevated', 'outlined'] as const).map((variant) => (
            <Card key={variant} variant={variant} className="w-40">
              <div className="p-4 space-y-1">
                <p className="text-xs font-mono text-text-helper">{variant}</p>
                <p className="text-sm text-text-primary">Title</p>
                <p className="text-xs text-text-secondary">Description</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </ThemeCompare>
  ),
}
