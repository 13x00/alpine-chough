import { g10, g100 } from '@carbon/themes'

type AppThemeId = 'light' | 'dark'

const themeTokens: Record<AppThemeId, any> = {
  light: g10,
  dark: g100,
}

const cssVarMap = (theme: any): Record<string, string> => ({
  // Core Carbon-like tokens
  '--cds-background': theme.background,
  '--cds-layer': theme.layer01,
  '--cds-layer-subtle': theme.layer02,
  '--cds-layer-hover': theme.layerHover01 ?? theme.layerHover02,
  '--cds-border-subtle': theme.borderSubtle01 ?? theme.borderSubtle00,
  '--cds-border-strong': theme.borderStrong01,
  '--cds-text-primary': theme.textPrimary,
  '--cds-text-secondary': theme.textSecondary,
  '--cds-text-muted': theme.textHelper,
  '--cds-focus': theme.focus,
})

export function applyCarbonTheme(id: AppThemeId) {
  if (typeof document === 'undefined') return

  const theme = themeTokens[id]
  if (!theme) return

  const target = document.documentElement
  const vars = cssVarMap(theme)

  Object.entries(vars).forEach(([name, value]) => {
    if (value) {
      target.style.setProperty(name, String(value))
    }
  })
}

