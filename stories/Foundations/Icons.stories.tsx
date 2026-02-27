import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { Sun, Moon, ArrowLeft, Add, Close, ChevronDown, ChevronRight, Settings, User, Home } from '@carbon/icons-react'
import { ThemeCompare, SectionHeading, StoryLayout } from '../_utils/ThemeCompare'

/* Icons actually used in the project */
const projectIcons = [
  { name: 'Sun', component: Sun, usage: 'ThemeToggle — light mode icon' },
  { name: 'Moon', component: Moon, usage: 'ThemeToggle — dark mode icon' },
  { name: 'ArrowLeft', component: ArrowLeft, usage: 'BackButton — navigate back' },
]

/* Additional Carbon icons available in the package — for reference */
const catalogIcons = [
  { name: 'Add', component: Add },
  { name: 'Close', component: Close },
  { name: 'ChevronDown', component: ChevronDown },
  { name: 'ChevronRight', component: ChevronRight },
  { name: 'Settings', component: Settings },
  { name: 'User', component: User },
  { name: 'Home', component: Home },
]

const sizes = [16, 20, 24, 32] as const

function IconsAudit() {
  return (
    <StoryLayout>
      <SectionHeading>Icons used in this project</SectionHeading>
      <div className="space-y-4">
        {projectIcons.map(({ name, component: Icon, usage }) => (
          <div key={name} className="flex items-center gap-6">
            <div className="flex items-center gap-3 w-56 flex-shrink-0">
              <Icon size={20} className="text-text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-text-primary font-mono">{name}</p>
                <p className="text-xs text-text-helper">{usage}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {sizes.map((s) => (
                <div key={s} className="flex flex-col items-center gap-1">
                  <Icon size={s} className="text-text-primary" />
                  <span className="text-xs text-text-helper font-mono">{s}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SectionHeading>Icon colours in context</SectionHeading>
      <div className="flex gap-4 flex-wrap">
        {[
          { label: 'text-text-primary', cls: 'text-text-primary' },
          { label: 'text-text-secondary', cls: 'text-text-secondary' },
          { label: 'text-text-helper', cls: 'text-text-helper' },
          { label: 'text-interactive', cls: 'text-interactive' },
          { label: 'text-focus', cls: 'text-focus' },
        ].map(({ label, cls }) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <Sun size={24} className={cls} />
            <span className="text-xs text-text-helper font-mono">{label}</span>
          </div>
        ))}
      </div>

      <SectionHeading>Carbon icon catalog sample (size 20)</SectionHeading>
      <p className="text-xs text-text-helper mb-3">
        From <code className="font-mono">@carbon/icons-react</code>. Import any icon by name.
      </p>
      <div className="flex flex-wrap gap-6">
        {catalogIcons.map(({ name, component: Icon }) => (
          <div key={name} className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 flex items-center justify-center bg-layer-01 border border-border-subtle-01 rounded">
              <Icon size={20} className="text-text-primary" />
            </div>
            <span className="text-xs text-text-helper font-mono">{name}</span>
          </div>
        ))}
      </div>
    </StoryLayout>
  )
}

const meta: Meta = {
  title: 'Foundations/Icons',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj

export const Catalog: Story = {
  render: () => <IconsAudit />,
}

export const Compare: Story = {
  name: 'Theme Compare',
  render: () => <ThemeCompare>{() => <IconsAudit />}</ThemeCompare>,
}
