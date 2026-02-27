import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { AboutSection } from '@/components/content/AboutSection'
import { ThemeCompare, SectionHeading } from '../_utils/ThemeCompare'

const meta: Meta<typeof AboutSection> = {
  title: 'Components/AboutSection',
  component: AboutSection,
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof AboutSection>

/* ── Playground ─────────────────────────────────────────────────────────────── */

export const Playground: Story = {}

/* ── In card context ───────────────────────────────────────────────────────── */

export const InCard: Story = {
  name: 'In card context',
  render: () => (
    <div className="p-6 max-w-sm">
      <SectionHeading>About card (as seen in LeftPanel)</SectionHeading>
      <section className="rounded-lg bg-layer-01 border border-border-subtle-00 px-6 py-6">
        <AboutSection />
      </section>
    </div>
  ),
}

/* ── Theme Compare ──────────────────────────────────────────────────────────── */

export const Compare: Story = {
  name: 'Theme Compare',
  render: () => (
    <ThemeCompare>
      {() => (
        <div className="max-w-xs">
          <section className="rounded-lg bg-layer-01 border border-border-subtle-00 px-6 py-6">
            <AboutSection />
          </section>
        </div>
      )}
    </ThemeCompare>
  ),
}
