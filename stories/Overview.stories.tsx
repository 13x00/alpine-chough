import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

const sections = [
  {
    title: 'Foundations',
    description: 'Design tokens: color, typography, spacing, radius, shadows, motion, icons.',
    items: [
      { name: 'Colors', path: 'foundations-colors', description: 'Semantic token swatches + theme compare' },
      { name: 'Typography', path: 'foundations-typography', description: 'Font sizes, weights, line heights' },
      { name: 'Spacing', path: 'foundations-spacing', description: 'Spacing scale visualised as bars' },
      { name: 'Radius', path: 'foundations-radius', description: 'Border radius tokens' },
      { name: 'Shadows', path: 'foundations-shadows', description: 'Shadow token comparisons' },
      { name: 'Motion', path: 'foundations-motion', description: 'Duration & easing tokens' },
      { name: 'Icons', path: 'foundations-icons', description: 'Carbon icons used in this project' },
    ],
  },
  {
    title: 'Components',
    description: 'UI primitives and composed components — each with Playground, States, and Theme Compare stories.',
    items: [
      { name: 'Card', path: 'components-card', description: 'default / elevated / outlined · interactive hover' },
      { name: 'Typography', path: 'components-typography', description: 'heading / body / caption / small' },
      { name: 'TabButton', path: 'components-tabs', description: 'active · inactive · hover · focus' },
      { name: 'ContentTabs', path: 'components-contenttabs', description: 'Photography / Design tab bar' },
      { name: 'ThemeToggle', path: 'components-themetoggle', description: 'Sun/Moon toggle · hover · focus' },
      { name: 'Logo', path: 'components-logo', description: 'Gradient text animation on hover' },
      { name: 'Grid', path: 'components-grid', description: '1–4 columns · sm/md/lg gap' },
      { name: 'BackButton', path: 'components-backbutton', description: 'Icon button · hover · focus' },
      { name: 'AboutSection', path: 'components-aboutsection', description: 'Body text block' },
      { name: 'LeftPanel', path: 'components-leftpanel', description: 'About + project list + contact footer' },
    ],
  },
]

function OverviewPage() {
  return (
    <div className="p-8 max-w-4xl space-y-10">
      <header className="space-y-2 pb-6 border-b border-border-subtle-00">
        <h1 className="text-4xl font-bold text-text-primary">Design System Audit</h1>
        <p className="text-base text-text-secondary">
          Alpine Chough · Next.js + Tailwind + Carbon tokens (g100 dark / g10 light)
        </p>
        <p className="text-sm text-text-helper max-w-2xl">
          All tokens are CSS custom properties from{' '}
          <code className="font-mono">carbon-tokens.css</code> surfaced as Tailwind aliases.
          Dark is the default theme; light is toggled via{' '}
          <code className="font-mono">data-theme=&quot;light&quot;</code> on the root.
        </p>
      </header>

      {sections.map((section) => (
        <section key={section.title} className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">{section.title}</h2>
            <p className="text-sm text-text-secondary mt-1">{section.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {section.items.map((item) => (
              <div
                key={item.name}
                className="rounded-lg bg-layer-01 border border-border-subtle-01 px-4 py-3 space-y-1"
              >
                <p className="text-sm font-medium text-text-primary">{item.name}</p>
                <p className="text-xs text-text-helper">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="space-y-3 pt-6 border-t border-border-subtle-00">
        <h2 className="text-xl font-semibold text-text-primary">Token system</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {[
            { label: 'Source', value: 'carbon-tokens.css (generated)' },
            { label: 'Palette', value: '@carbon/colors · @carbon/themes' },
            { label: 'Dark theme', value: ':root (g100 — default)' },
            { label: 'Light theme', value: '[data-theme="light"] (g10)' },
            { label: 'Tailwind bridge', value: 'tailwind.config.ts → CSS vars' },
            { label: 'Regenerate', value: 'npm run tokens:generate' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-layer-01 border border-border-subtle-01 rounded px-3 py-2 space-y-0.5">
              <p className="text-text-helper font-medium">{label}</p>
              <p className="text-text-secondary font-mono">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const meta: Meta = {
  title: 'Overview',
  parameters: {
    layout: 'fullscreen',
  },
}
export default meta

type Story = StoryObj
export const Audit: Story = {
  render: () => <OverviewPage />,
}
