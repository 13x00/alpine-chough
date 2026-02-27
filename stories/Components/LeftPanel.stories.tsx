import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { LeftPanel } from '@/components/layout/LeftPanel'
import { ThemeCompare } from '../_utils/ThemeCompare'

const sampleProjects = [
  { id: '1', title: 'Brand Identity', category: 'Branding', image: '/placeholder.jpg', onClick: () => {} },
  { id: '2', title: 'Wayfinding System', category: 'Signage', image: '/placeholder.jpg', onClick: () => {} },
  { id: '3', title: 'App Design', category: 'Digital', image: '/placeholder.jpg', onClick: () => {} },
  { id: '4', title: 'Packaging', category: 'Print', image: '/placeholder.jpg', onClick: () => {} },
]

const meta: Meta<typeof LeftPanel> = {
  title: 'Components/LeftPanel',
  component: LeftPanel,
  parameters: { layout: 'padded' },
  args: {
    projectItems: sampleProjects,
  },
}
export default meta

type Story = StoryObj<typeof LeftPanel>

/* ── Playground ─────────────────────────────────────────────────────────────── */

export const Playground: Story = {
  render: (args) => (
    <div className="h-screen max-h-screen w-80">
      <LeftPanel {...args} />
    </div>
  ),
}

/* ── Empty list ──────────────────────────────────────────────────────────────── */

export const EmptyList: Story = {
  name: 'Empty project list',
  args: { projectItems: [] },
  render: (args) => (
    <div className="h-screen max-h-screen w-80">
      <LeftPanel {...args} />
    </div>
  ),
}

/* ── Many items ─────────────────────────────────────────────────────────────── */

export const ManyItems: Story = {
  name: 'Many project items (scroll)',
  args: {
    projectItems: Array.from({ length: 12 }, (_, i) => ({
      id: String(i + 1),
      title: `Project ${i + 1}`,
      category: ['Branding', 'Digital', 'Print', 'Motion'][i % 4],
      image: '/placeholder.jpg',
      onClick: () => {},
    })),
  },
  render: (args) => (
    <div className="h-screen max-h-screen w-80">
      <LeftPanel {...args} />
    </div>
  ),
}

/* ── Theme Compare ──────────────────────────────────────────────────────────── */

export const Compare: Story = {
  name: 'Theme Compare',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <ThemeCompare gap={false}>
      {() => (
        <div className="h-screen w-80">
          <LeftPanel projectItems={sampleProjects} />
        </div>
      )}
    </ThemeCompare>
  ),
}
