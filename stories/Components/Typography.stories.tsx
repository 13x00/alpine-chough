import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { Typography } from '@/components/ui/Typography'
import { ThemeCompare, SectionHeading, StateLabel } from '../_utils/ThemeCompare'

const meta: Meta<typeof Typography> = {
  title: 'Components/Typography',
  component: Typography,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['heading', 'body', 'caption', 'small'],
    },
    as: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span'],
    },
  },
  args: {
    children: 'The quick brown fox jumps over the lazy dog',
  },
}
export default meta

type Story = StoryObj<typeof Typography>

/* ── Playground ─────────────────────────────────────────────────────────────── */

export const Playground: Story = {
  args: { variant: 'body' },
}

/* ── All Variants ───────────────────────────────────────────────────────────── */

export const AllVariants: Story = {
  render: () => (
    <div className="p-6 space-y-6">
      {(
        [
          { variant: 'heading', as: 'h2', desc: 'text-4xl font-bold leading-tight text-text-primary' },
          { variant: 'body', as: 'p', desc: 'text-base leading-normal text-text-secondary' },
          { variant: 'caption', as: 'p', desc: 'text-sm leading-relaxed text-text-helper' },
          { variant: 'small', as: 'p', desc: 'text-xs leading-normal text-text-helper' },
        ] as const
      ).map(({ variant, as, desc }) => (
        <div key={variant} className="space-y-1">
          <StateLabel>{variant} · {desc}</StateLabel>
          <Typography variant={variant} as={as}>
            The quick brown fox jumps over the lazy dog
          </Typography>
        </div>
      ))}
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
          <SectionHeading>All variants</SectionHeading>
          {(['heading', 'body', 'caption', 'small'] as const).map((variant) => (
            <div key={variant}>
              <StateLabel>{variant}</StateLabel>
              <Typography variant={variant}>
                The quick brown fox
              </Typography>
            </div>
          ))}
        </div>
      )}
    </ThemeCompare>
  ),
}
