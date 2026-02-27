import type { Meta, StoryObj } from '@storybook/react'
import React, { useState, useEffect } from 'react'
import { SectionHeading, StoryLayout } from '../_utils/ThemeCompare'

const durations = [
  { name: 'duration-fast', cssVar: '--duration-fast', value: '150ms', twClass: 'duration-fast' },
  { name: 'duration-normal', cssVar: '--duration-normal', value: '300ms', twClass: 'duration-normal' },
  { name: 'duration-slow', cssVar: '--duration-slow', value: '500ms', twClass: 'duration-slow' },
]

const easings = [
  {
    name: 'ease-standard',
    cssVar: '--easing-standard',
    value: 'cubic-bezier(0.4, 0, 0.2, 1)',
    usage: 'Default — most UI transitions',
  },
  {
    name: 'ease-accelerate',
    cssVar: '--easing-accelerate',
    value: 'cubic-bezier(0.4, 0, 1, 1)',
    usage: 'Elements leaving the screen',
  },
  {
    name: 'ease-decelerate',
    cssVar: '--easing-decelerate',
    value: 'cubic-bezier(0, 0, 0.2, 1)',
    usage: 'Elements entering the screen',
  },
]

function AnimatedBar({ durationClass }: { durationClass: string }) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setActive((v) => !v), 1200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="h-3 w-48 bg-layer-01 border border-border-subtle-01 rounded overflow-hidden">
      <div
        className={`h-full bg-interactive transition-all ${durationClass} ease-standard ${
          active ? 'w-full' : 'w-0'
        }`}
      />
    </div>
  )
}

function MotionAudit() {
  return (
    <StoryLayout>
      <SectionHeading>Duration Tokens</SectionHeading>
      <p className="text-xs text-text-helper mb-4">
        Bars animate continuously so you can compare speeds without interaction.
      </p>

      <div className="space-y-4">
        {durations.map(({ name, cssVar, value, twClass }) => (
          <div key={name} className="flex items-center gap-4">
            <div className="w-52 flex-shrink-0 space-y-0.5">
              <p className="text-xs font-medium text-text-primary font-mono">{name}</p>
              <p className="text-xs text-text-helper font-mono">
                {cssVar} · {value}
              </p>
            </div>
            <AnimatedBar durationClass={twClass} />
          </div>
        ))}
      </div>

      <SectionHeading>Easing Tokens</SectionHeading>
      <div className="space-y-4">
        {easings.map(({ name, cssVar, value, usage }) => (
          <div key={name} className="bg-layer-01 border border-border-subtle-01 rounded-lg px-4 py-3 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-primary font-mono">{name}</p>
              <span className="text-xs text-text-helper">{usage}</span>
            </div>
            <p className="text-xs text-text-helper font-mono">{cssVar}</p>
            <p className="text-xs text-text-secondary font-mono">{value}</p>
          </div>
        ))}
      </div>

      <SectionHeading>Component Transitions</SectionHeading>
      <div className="space-y-2 text-xs">
        {[
          { component: 'Card (interactive)', tokens: 'transition-all duration-normal', effect: 'hover → shadow-lg + scale-[1.02]' },
          { component: 'TabButton', tokens: 'transition-colors duration-fast', effect: 'inactive → hover text-text-secondary' },
          { component: 'ContentTabs indicator', tokens: 'transition-transform duration-300', effect: 'translateX(0) → translateX(100%)' },
          { component: 'Logo / ThemeToggle', tokens: 'transition-colors duration-fast', effect: 'color + opacity' },
          { component: 'BackButton', tokens: 'transition-all duration-fast', effect: 'bg + text color' },
        ].map(({ component, tokens, effect }) => (
          <div key={component} className="flex gap-4 py-1.5 border-b border-border-subtle-00">
            <span className="text-text-primary font-medium w-52 flex-shrink-0">{component}</span>
            <span className="text-text-secondary font-mono w-60 flex-shrink-0">{tokens}</span>
            <span className="text-text-helper">{effect}</span>
          </div>
        ))}
      </div>
    </StoryLayout>
  )
}

const meta: Meta = {
  title: 'Foundations/Motion',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj

export const Tokens: Story = {
  render: () => <MotionAudit />,
}
