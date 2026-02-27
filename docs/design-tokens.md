# Design Tokens for Figma

This document describes the design tokens used on the site. The app uses CSS custom properties: **dark mode** is the default (`:root`); **light mode** is applied when `[data-theme='light']` is set on a wrapper (e.g. `<html>`). In Figma you can mirror this with two modes or two pages.

---

## Color and theme tokens (Carbon)

All **color** and **semantic color** tokens come from [IBM Carbon Design System](https://carbondesignsystem.com/):

- **Palette**: [`@carbon/colors`](https://www.npmjs.com/package/@carbon/colors) — blue, gray, warm-gray, cool-gray, cyan, teal, green, red, orange, magenta, purple, yellow, plus black/white.
- **Theme tokens**: [`@carbon/themes`](https://www.npmjs.com/package/@carbon/themes) — background, layers, text, borders, focus, interactive, support-*.

These are **generated** into a single file, [app/styles/carbon-tokens.css](app/styles/carbon-tokens.css), by the script `scripts/generate-carbon-tokens.js`. The generated file uses Carbon’s token names with the `--cds-*` prefix (e.g. `--cds-background`, `--cds-layer-01`, `--cds-text-primary`, `--cds-blue-60`). Run `npm run tokens:generate` when upgrading Carbon packages or changing theme/palette source.

- **Dark theme**: `:root` in the generated file uses Carbon’s **g100** theme.
- **Light theme**: `[data-theme='light']` uses Carbon’s **g10** theme.

For the full set of Carbon theme tokens and semantics, see [Carbon’s theme documentation](https://carbondesignsystem.com/guidelines/themes/overview/).

### Main `--cds-*` tokens used in this app

| Token | Role |
|-------|------|
| `--cds-background` | Page / canvas background |
| `--cds-layer-01` | Cards, nav bar, panels |
| `--cds-layer-02` | Dividers, stripes, detail surface, hover base |
| `--cds-layer-03` | Raised surfaces |
| `--cds-layer-background-01` | Main content base (e.g. right panel) |
| `--cds-layer-hover-01` | Hover / interactive row background |
| `--cds-text-primary` | Headings, primary text |
| `--cds-text-secondary` | Body, secondary text |
| `--cds-text-helper` | Muted / helper text |
| `--cds-border-subtle-01` | Default borders |
| `--cds-border-strong-01` | Strong borders |
| `--cds-focus` | Focus ring |
| `--cds-interactive` | Buttons, tab indicator, accent |
| `--cds-support-info`, `--cds-support-warning`, `--cds-support-success`, `--cds-support-error` | Status / feedback |
| `--cds-blue-30`, `--cds-blue-100` | Logo gradient (and other palette steps as needed) |

Palette tokens follow the form `--cds-<palette>-<step>` (e.g. `--cds-warm-gray-60`, `--cds-blue-70`). See the generated file or Carbon’s docs for exact hex values per theme.

---

## Non-color tokens (tokens.css)

[app/styles/tokens.css](app/styles/tokens.css) imports the generated Carbon tokens and defines **non-color** tokens only: typography, spacing, border radius, shadows, and motion. These are shared across themes.

### Typography

| Token | Value | Usage |
|-------|--------|--------|
| `--font-sans` | -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', … | Body, UI |
| `--font-mono` | 'SF Mono', Monaco, 'Cascadia Code', … | Mono text |
| `--font-size-xs` | 0.75rem (12px) | Small labels |
| `--font-size-sm` | 0.875rem (14px) | Body small, captions |
| `--font-size-base` | 1rem (16px) | Base body |
| `--font-size-lg` … `--font-size-5xl` | 1.125rem … 3rem | Lead, headings, display |
| `--font-weight-normal` … `--font-weight-bold` | 400 … 700 | Body, emphasis, headings |
| `--line-height-tight`, `--line-height-normal`, `--line-height-relaxed` | 1.25 … 1.75 | Headings, body |

### Spacing

| Token | Value | Usage |
|-------|--------|--------|
| `--spacing-0` … `--spacing-24` | 0 … 6rem | Gaps, padding, touch targets (e.g. `--spacing-12` for 48px) |

### Border radius

| Token | Value | Usage |
|-------|--------|--------|
| `--radius-sm` … `--radius-full` | 0.125rem … 9999px | Chips, buttons, cards, pills |

### Shadows

| Token | Value |
|-------|--------|
| `--shadow-sm`, `--shadow-md`, `--shadow-lg` | Standard elevation shadows |

### Motion

| Token | Value |
|-------|--------|
| `--duration-fast`, `--duration-normal`, `--duration-slow` | 150ms, 300ms, 500ms |
| `--easing-standard`, `--easing-accelerate`, `--easing-decelerate` | cubic-bezier curves |

When you change `tokens.css` or regenerate Carbon tokens, update this doc (and Figma) so values stay in sync.
