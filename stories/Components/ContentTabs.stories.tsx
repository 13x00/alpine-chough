import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { ContentTabs } from '@/components/content/ContentTabs'
import { ContentType } from '@/types/content'
import { ThemeCompare, StateLabel } from '../_utils/ThemeCompare'

const meta: Meta<typeof ContentTabs> = {
  title: 'Components/ContentTabs',
  component: ContentTabs,
  parameters: { layout: 'padded' },
  argTypes: {
    currentTab: {
      control: 'radio',
      options: ['images', 'projects'],
    },
  },
}
export default meta

type Story = StoryObj<typeof ContentTabs>

/* ── Playground ─────────────────────────────────────────────────────────────── */

function ControlledTabs({ initialTab = 'images' }: { initialTab?: ContentType }) {
  const [tab, setTab] = useState<ContentType>(initialTab)
  return (
    <div className="space-y-4">
      <ContentTabs currentTab={tab} onTabChange={setTab} className="w-64" />
      <p className="text-xs text-text-helper font-mono">currentTab: {tab}</p>
    </div>
  )
}

export const Playground: Story = {
  render: () => <ControlledTabs />,
}

/* ── States ─────────────────────────────────────────────────────────────────── */

export const States: Story = {
  render: () => (
    <div className="p-6 space-y-6">
      <div>
        <StateLabel>images active (Photography tab)</StateLabel>
        <ContentTabs currentTab="images" onTabChange={() => {}} className="w-64" />
      </div>
      <div>
        <StateLabel>projects active (Design tab)</StateLabel>
        <ContentTabs currentTab="projects" onTabChange={() => {}} className="w-64" />
      </div>
      <div>
        <StateLabel>interactive — click to switch</StateLabel>
        <ControlledTabs />
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
        <div className="space-y-4">
          <ContentTabs currentTab="images" onTabChange={() => {}} className="w-56" />
          <ContentTabs currentTab="projects" onTabChange={() => {}} className="w-56" />
        </div>
      )}
    </ThemeCompare>
  ),
}
