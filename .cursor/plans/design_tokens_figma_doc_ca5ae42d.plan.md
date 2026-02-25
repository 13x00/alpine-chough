---
name: Design tokens Figma doc
overview: Add a single markdown file that documents all design tokens used on the site, with two tables (dark mode and light mode) showing token name, semantic role, and resolved hex/value so you can replicate the system in Figma.
todos: []
isProject: false
---

# Design Tokens Documentation for Figma

## Goal

Create one markdown file (e.g. `docs/design-tokens.md`) that lists every token used on the site. Two separate tables—one for **dark mode**, one for **light mode**—with token name, purpose, and **resolved value** (hex for colors, rem/px for spacing/radius, etc.) so you can copy them into Figma and iterate there.

## Source of truth

- **Colors / layers / borders / status pill**: [app/styles/tokens.css](app/styles/tokens.css) — `:root` = dark, `[data-theme='light']` = light overrides.
- **Typography, spacing, radius, shadows, durations**: Same file; these are theme-agnostic (no light override), so they appear in both tables with the same value.

## Document structure

1. **Intro**: Short note that the app uses CSS custom properties; dark = default (`:root`), light = `[data-theme='light']`. Figma can mirror this with two “modes” or two pages.
2. **Shared tokens (same in both themes)**
  One table: typography (font family, sizes, weights, line heights), spacing scale, border radius, shadows, durations, easing. Token name | Value (e.g. `0.75rem` / `12px`) | Usage note.
3. **Dark mode**
  One table: every **color** token that changes in dark mode, with **resolved hex** (no `var()`). Rows: semantic name (e.g. `color-layer-bg`), role (e.g. “Page background”), resolved value (e.g. `#161616`). Include: CDS primitives (`cds-background`, etc.), app semantics (`color-layer-`*, `color-text-`*, `color-border-*`, `color-accent-*`, `color-status-pill-*`), and the IBM palette refs (warm gray, blue, yellow) as separate rows so Figma has the full palette.
4. **Light mode**
  Same structure as dark: only the tokens that **differ** in `[data-theme='light']`, with resolved hex. Note which tokens are unchanged (e.g. IBM palette, typography, spacing) and only list overridden CDS + app semantic colors.
5. **Optional**: A small “Where it’s used” column or a short “Usage” section referencing components (e.g. `layer-2` = cards, nav bar; `layer-8` = headings; `status-pill-`* = footer pill) so Figma naming stays aligned with the codebase.

## Resolved values to compute

- **Dark**: Resolve each `var(--…)` chain to hex (e.g. `--color-layer-bg` → `--cds-background` → `#161616`). Status pill in dark = yellow-70/90/20.
- **Light**: Same semantics; plug in g10 CDS values and blue status-pill overrides; everything else (e.g. `--color-accent-soft` = `--ibm-blue-30`) stays as-is, resolved to hex.

## File to create

- **Path**: `docs/design-tokens.md` (create `docs/` if it doesn’t exist).
- **Format**: Markdown tables; token name, role/purpose, value. No code execution—values are copied from [tokens.css](app/styles/tokens.css) and resolved manually in the plan/doc.

## Out of scope

- No changes to [tokens.css](app/styles/tokens.css) or any component.
- No script to auto-export tokens; the doc is hand-maintained from the CSS (or we add a one-line note that it’s generated from `tokens.css` and should be updated when tokens change).

