import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { Grid } from '@/components/ui/Grid'
import { ThemeCompare, SectionHeading } from '../_utils/ThemeCompare'

function GridCell({ label }: { label: string }) {
  return (
    <div className="bg-layer-01 border border-border-subtle-01 rounded h-14 flex items-center justify-center">
      <span className="text-xs text-text-helper font-mono">{label}</span>
    </div>
  )
}

const meta: Meta<typeof Grid> = {
  title: 'Components/Grid',
  component: Grid,
  parameters: { layout: 'padded' },
  argTypes: {
    cols: { control: 'select', options: [1, 2, 3, 4] },
    gap: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: {
    cols: 2,
    gap: 'md',
    children: (
      <>
        {['A', 'B', 'C', 'D'].map((l) => (
          <GridCell key={l} label={l} />
        ))}
      </>
    ),
  },
}
export default meta

type Story = StoryObj<typeof Grid>

/* ── Playground ─────────────────────────────────────────────────────────────── */

export const Playground: Story = {}

/* ── All Col Variants ───────────────────────────────────────────────────────── */

export const AllVariants: Story = {
  render: () => (
    <div className="p-6 space-y-8">
      {([1, 2, 3, 4] as const).map((cols) => (
        <div key={cols}>
          <SectionHeading>cols={cols}</SectionHeading>
          <Grid cols={cols} gap="md">
            {Array.from({ length: cols }).map((_, i) => (
              <GridCell key={i} label={`${cols}-col item ${i + 1}`} />
            ))}
          </Grid>
        </div>
      ))}

      <SectionHeading>Gap variants (2 col)</SectionHeading>
      {(['sm', 'md', 'lg'] as const).map((gap) => (
        <div key={gap}>
          <p className="text-xs text-text-helper font-mono mb-1.5">gap={gap}</p>
          <Grid cols={2} gap={gap}>
            <GridCell label="A" />
            <GridCell label="B" />
          </Grid>
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
        <Grid cols={2} gap="md">
          {['A', 'B', 'C', 'D'].map((l) => (
            <GridCell key={l} label={l} />
          ))}
        </Grid>
      )}
    </ThemeCompare>
  ),
}
