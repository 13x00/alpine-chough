import type { Meta, StoryObj } from '@storybook/react';
import { ColorSwatches } from '@/components/dev/ColorSwatches';
import { AllCarbonColorTokens } from '@/components/dev/AllCarbonColorTokens';

const meta: Meta = {
  title: 'Foundation/Design Tokens',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj;

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-6">
      <section className="space-y-2">
        <h1 className="text-xl font-semibold text-text-primary">Design tokens</h1>
        <p className="text-sm text-text-helper max-w-2xl">
          Core tokens for color, radius, shadow, and motion. Dark is the default theme; light is
          enabled via <code>data-theme=&quot;light&quot;</code> on the root.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-text-primary">Carbon palette</h2>
        <p className="text-xs text-text-helper">
          Swatches below use CSS custom properties from <code>carbon-tokens.css</code>{' '}
          (e.g. <code>--cds-blue-60</code>), so they always match the app.
        </p>
        <ColorSwatches />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-text-primary">All Carbon color tokens</h2>
        <p className="text-xs text-text-helper max-w-2xl">
          This table is generated at runtime from all <code>--cds-*</code> CSS custom properties
          whose values resolve to colors. It updates automatically when you regenerate{' '}
          <code>carbon-tokens.css</code> or switch between dark and light themes.
        </p>
        <AllCarbonColorTokens />
      </section>

      <section className="space-y-1 text-xs text-text-helper">
        <p>
          Radius tokens: <code>--radius-sm</code>, <code>--radius-md</code>, <code>--radius-lg</code>
          , <code>--radius-xl</code>, <code>--radius-control</code>, <code>--radius-full</code>
        </p>
        <p>
          Motion tokens: <code>--duration-fast</code>, <code>--duration-normal</code>,{' '}
          <code>--duration-slow</code>, <code>--easing-standard</code>
        </p>
        <p>
          For the full token table (including resolved values for Figma), see{' '}
          <code>docs/design-tokens.md</code> in the repo.
        </p>
      </section>
    </div>
  ),
};

