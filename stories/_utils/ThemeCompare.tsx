import React from 'react'

interface ThemeComparePaneProps {
  theme: 'dark' | 'light'
  label?: string
  children: React.ReactNode
}

function ThemePane({ theme, label, children }: ThemeComparePaneProps) {
  return (
    <div data-theme={theme} className="flex-1 bg-background p-6 min-w-0">
      <p className="text-xs font-medium text-text-helper mb-4 uppercase tracking-widest">
        {label ?? (theme === 'dark' ? 'Dark' : 'Light')}
      </p>
      {children}
    </div>
  )
}

/**
 * Renders `children` (a render-prop function) side-by-side in dark and light themes.
 * Works regardless of the global toolbar theme because the dark pane pins
 * [data-theme='dark'] (backed by .storybook/storybook-dark-scope.css).
 */
export function ThemeCompare({
  children,
  gap = true,
}: {
  children: () => React.ReactNode
  gap?: boolean
}) {
  return (
    <div className={`flex ${gap ? 'gap-px' : ''} bg-border-subtle-00`}>
      <ThemePane theme="dark">{children()}</ThemePane>
      <ThemePane theme="light">{children()}</ThemePane>
    </div>
  )
}

/**
 * Inline label for a token swatch row used in Foundations stories.
 */
export function TokenRow({
  label,
  cssVar,
  children,
}: {
  label: string
  cssVar: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      {children}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium text-text-primary truncate">{label}</span>
        <span className="text-xs text-text-helper font-mono truncate">{cssVar}</span>
      </div>
    </div>
  )
}

/**
 * Section heading used in Foundations stories.
 */
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-medium text-text-helper uppercase tracking-widest mb-3 mt-6 first:mt-0">
      {children}
    </h2>
  )
}

/**
 * Story wrapper with consistent padding.
 */
export function StoryLayout({
  children,
  fullWidth = false,
}: {
  children: React.ReactNode
  fullWidth?: boolean
}) {
  return (
    <div className={`${fullWidth ? '' : 'max-w-3xl'} p-8 space-y-2`}>{children}</div>
  )
}

/**
 * State label badge shown above each state variant in a States story.
 */
export function StateLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-text-helper mb-2 font-mono">{children}</p>
  )
}
