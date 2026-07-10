import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { LeftPanel } from '@/components/layout/LeftPanel'
import { ThemeCompare } from '../_utils/ThemeCompare'

const sampleProjects = [
  { id: '1', title: 'Brand Identity', category: 'Collection', year: '2024', image: '/placeholder.jpg', onClick: () => {} },
  { id: '2', title: 'Wayfinding System', category: 'Photo', year: '2025', image: '/placeholder.jpg', onClick: () => {} },
  { id: '3', title: 'App Design', category: 'Photo', year: '2025', image: '/placeholder.jpg', onClick: () => {} },
  { id: '4', title: 'Packaging', category: 'Collection', year: '2023', image: '/placeholder.jpg', onClick: () => {} },
]

const meta: Meta<typeof LeftPanel> = {
  title: 'Components/LeftPanel',
  component: LeftPanel,
  parameters: { layout: 'padded' },
  args: {
    projectItems: sampleProjects,
    selectedItemId: '2',
  },
  argTypes: {
    selectedItemId: { control: 'select', options: [null, ...sampleProjects.map((p) => p.id)] },
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
      category: i % 3 === 0 ? 'Collection' : 'Photo',
      year: String(2023 + (i % 3)),
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
          <LeftPanel projectItems={sampleProjects} selectedItemId="2" />
        </div>
      )}
    </ThemeCompare>
  ),
}
