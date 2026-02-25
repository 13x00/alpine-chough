# Design Tokens for Figma

This document lists all design tokens used on the site. The app uses CSS custom properties: **dark mode** is the default (`:root`); **light mode** is applied when `[data-theme='light']` is set on a wrapper (e.g. `<html>`). In Figma you can mirror this with two modes or two pages.

Values below are resolved (hex for colors, rem/px for spacing and radius) so you can copy them into Figma. When you change [app/styles/tokens.css](app/styles/tokens.css), update this doc to keep Figma in sync.

---

## Shared tokens (same in both themes)

Typography, spacing, border radius, shadows, and motion do not change between dark and light.

### Typography

| Token | Value | Usage |
|-------|--------|--------|
| `--font-sans` | -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', … | Body, UI |
| `--font-mono` | 'SF Mono', Monaco, 'Cascadia Code', … | Mono text, row numbers |
| `--font-size-xs` | 0.75rem (12px) | Small labels |
| `--font-size-sm` | 0.875rem (14px) | Body small, captions |
| `--font-size-base` | 1rem (16px) | Base body |
| `--font-size-lg` | 1.125rem (18px) | Lead text |
| `--font-size-xl` | 1.25rem (20px) | Large UI |
| `--font-size-2xl` | 1.5rem (24px) | Headings |
| `--font-size-3xl` | 1.875rem (30px) | Display |
| `--font-size-4xl` | 2.25rem (36px) | Hero |
| `--font-size-5xl` | 3rem (48px) | Large display |
| `--font-weight-normal` | 400 | Body |
| `--font-weight-medium` | 500 | Emphasis |
| `--font-weight-semibold` | 600 | Subheadings |
| `--font-weight-bold` | 700 | Headings, logo hover |
| `--line-height-tight` | 1.25 | Tight headings |
| `--line-height-normal` | 1.5 | Body |
| `--line-height-relaxed` | 1.75 | Relaxed body |

### Spacing

| Token | Value | Usage |
|-------|--------|--------|
| `--spacing-0` | 0 | Reset |
| `--spacing-1` | 0.25rem (4px) | Tight padding, nav bar inner |
| `--spacing-2` | 0.5rem (8px) | Small gaps |
| `--spacing-3` | 0.75rem (12px) | Medium gaps |
| `--spacing-4` | 1rem (16px) | Card padding, icon size |
| `--spacing-5` | 1.25rem (20px) | |
| `--spacing-6` | 1.5rem (24px) | Section padding |
| `--spacing-8` | 2rem (32px) | |
| `--spacing-10` | 2.5rem (40px) | |
| `--spacing-12` | 3rem (48px) | Touch targets (e.g. theme toggle) |
| `--spacing-16` | 4rem (64px) | |
| `--spacing-20` | 5rem (80px) | |
| `--spacing-24` | 6rem (96px) | |

### Border radius

| Token | Value | Usage |
|-------|--------|--------|
| `--radius-sm` | 0.125rem (2px) | Small chips |
| `--radius-md` | 0.375rem (6px) | Buttons, inputs |
| `--radius-lg` | 0.75rem (12px) | Cards, nav bar, panels |
| `--radius-xl` | 1rem (16px) | Large cards |
| `--radius-full` | 9999px | Pills, circular buttons |

### Shadows

| Token | Value |
|-------|--------|
| `--shadow-sm` | 0 1px 2px 0 rgb(0 0 0 / 0.05) |
| `--shadow-md` | 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) |
| `--shadow-lg` | 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) |

### Motion

| Token | Value |
|-------|--------|
| `--duration-fast` | 150ms |
| `--duration-normal` | 300ms |
| `--duration-slow` | 500ms |
| `--easing-standard` | cubic-bezier(0.4, 0, 0.2, 1) |
| `--easing-accelerate` | cubic-bezier(0.4, 0, 1, 1) |
| `--easing-decelerate` | cubic-bezier(0, 0, 0.2, 1) |

---

## Dark mode (resolved colors)

Default theme. All color tokens below resolve to these hex values when `data-theme` is not set (or is not `light`).

### Carbon / layer primitives (g100)

| Token | Role | Resolved value |
|-------|------|----------------|
| `cds-background` | Page / canvas background | `#161616` |
| `cds-layer` | Cards, nav bar, panels | `#262626` |
| `cds-layer-subtle` | Dividers, stripes, hover base | `#393939` |
| `cds-layer-hover` | Hover / raised surfaces | `#333333` |
| `cds-border-subtle` | Default borders | `#525252` |
| `cds-border-strong` | Strong borders | `#6f6f6f` |
| `cds-text-primary` | Strongest text, headings | `#f4f4f4` |
| `cds-text-secondary` | Body, secondary text | `#c6c6c6` |
| `cds-text-muted` | Muted / helper text | `#a8a8a8` |
| `cds-focus` | Focus ring, accent primary | `#ffffff` |

### App semantic (dark)

| Token | Role | Resolved value |
|-------|------|----------------|
| `color-layer-bg` | Page background, left panel base | `#161616` |
| `color-layer-1` | Main content base | `#161616` |
| `color-layer-2` | Cards, nav bar, panels | `#262626` |
| `color-layer-3` | Dividers, subtle stripes, hover bg | `#393939` |
| `color-layer-4` | Hover / raised | `#333333` |
| `color-layer-5` | Subtle / helper text | `#a8a8a8` |
| `color-layer-6` | Secondary / inactive text | `#c6c6c6` |
| `color-layer-7` | Body text | `#c6c6c6` |
| `color-layer-8` | Strongest foreground, headings | `#f4f4f4` |
| `color-layer-surface` | Detail card surface | `#565151` |
| `color-text-primary` | Primary text | `#f4f4f4` |
| `color-text-secondary` | Secondary text | `#c6c6c6` |
| `color-text-muted` | Muted text | `#a8a8a8` |
| `color-border-subtle` | Subtle borders | `#525252` |
| `color-border-strong` | Strong borders | `#6f6f6f` |
| `color-accent-primary` | Focus, primary accent | `#ffffff` |
| `color-accent-soft` | Soft accent (e.g. gradients) | `#a6c8ff` |
| `color-accent-strong` | Strong accent | `#002d9c` |
| `color-status-pill-border` | Status pill border (dark) | `#684e00` |
| `color-status-pill-bg` | Status pill background (dark) | `#302400` |
| `color-status-pill-text` | Status pill text (dark) | `#fddc69` |

### IBM palette (unchanged in light)

Use these for gradients and any direct palette reference. All values come from [`@carbon/colors`](https://github.com/carbon-design-system/carbon/tree/main/packages/colors).

#### Warm Gray (primary neutral)

| Token | Resolved value |
|-------|----------------|
| `ibm-warm-gray-10` | `#f7f3f2` |
| `ibm-warm-gray-20` | `#e5e0df` |
| `ibm-warm-gray-30` | `#cac5c4` |
| `ibm-warm-gray-40` | `#ada8a8` |
| `ibm-warm-gray-50` | `#8f8b8b` |
| `ibm-warm-gray-60` | `#726e6e` |
| `ibm-warm-gray-70` | `#565151` |
| `ibm-warm-gray-80` | `#3c3838` |
| `ibm-warm-gray-90` | `#272525` |
| `ibm-warm-gray-100` | `#171414` |

#### Gray

| Token | Resolved value |
|-------|----------------|
| `ibm-gray-10` | `#f4f4f4` |
| `ibm-gray-20` | `#e0e0e0` |
| `ibm-gray-30` | `#c6c6c6` |
| `ibm-gray-40` | `#a8a8a8` |
| `ibm-gray-50` | `#8d8d8d` |
| `ibm-gray-60` | `#6f6f6f` |
| `ibm-gray-70` | `#525252` |
| `ibm-gray-80` | `#393939` |
| `ibm-gray-90` | `#262626` |
| `ibm-gray-100` | `#161616` |

#### Cool Gray

| Token | Resolved value |
|-------|----------------|
| `ibm-cool-gray-10` | `#f2f4f8` |
| `ibm-cool-gray-20` | `#dde1e6` |
| `ibm-cool-gray-30` | `#c1c7cd` |
| `ibm-cool-gray-40` | `#a2a9b0` |
| `ibm-cool-gray-50` | `#878d96` |
| `ibm-cool-gray-60` | `#697077` |
| `ibm-cool-gray-70` | `#4d5358` |
| `ibm-cool-gray-80` | `#343a3f` |
| `ibm-cool-gray-90` | `#21272a` |
| `ibm-cool-gray-100` | `#121619` |

#### Blue

| Token | Resolved value |
|-------|----------------|
| `ibm-blue-10` | `#edf5ff` |
| `ibm-blue-20` | `#d0e2ff` |
| `ibm-blue-30` | `#a6c8ff` |
| `ibm-blue-40` | `#78a9ff` |
| `ibm-blue-50` | `#4589ff` |
| `ibm-blue-60` | `#0f62fe` |
| `ibm-blue-70` | `#0043ce` |
| `ibm-blue-80` | `#002d9c` |
| `ibm-blue-90` | `#001d6c` |
| `ibm-blue-100` | `#001141` |

#### Cyan

| Token | Resolved value |
|-------|----------------|
| `ibm-cyan-10` | `#e5f6ff` |
| `ibm-cyan-20` | `#bae6ff` |
| `ibm-cyan-30` | `#82cfff` |
| `ibm-cyan-40` | `#33b1ff` |
| `ibm-cyan-50` | `#1192e8` |
| `ibm-cyan-60` | `#0072c3` |
| `ibm-cyan-70` | `#00539a` |
| `ibm-cyan-80` | `#003a6d` |
| `ibm-cyan-90` | `#012749` |
| `ibm-cyan-100` | `#061727` |

#### Teal

| Token | Resolved value |
|-------|----------------|
| `ibm-teal-10` | `#d9fbfb` |
| `ibm-teal-20` | `#9ef0f0` |
| `ibm-teal-30` | `#3ddbd9` |
| `ibm-teal-40` | `#08bdba` |
| `ibm-teal-50` | `#009d9a` |
| `ibm-teal-60` | `#007d79` |
| `ibm-teal-70` | `#005d5d` |
| `ibm-teal-80` | `#004144` |
| `ibm-teal-90` | `#022b30` |
| `ibm-teal-100` | `#081a1c` |

#### Green

| Token | Resolved value |
|-------|----------------|
| `ibm-green-10` | `#defbe6` |
| `ibm-green-20` | `#a7f0ba` |
| `ibm-green-30` | `#6fdc8c` |
| `ibm-green-40` | `#42be65` |
| `ibm-green-50` | `#24a148` |
| `ibm-green-60` | `#198038` |
| `ibm-green-70` | `#0e6027` |
| `ibm-green-80` | `#044317` |
| `ibm-green-90` | `#022d0d` |
| `ibm-green-100` | `#071908` |

#### Red

| Token | Resolved value |
|-------|----------------|
| `ibm-red-10` | `#fff1f1` |
| `ibm-red-20` | `#ffd7d9` |
| `ibm-red-30` | `#ffb3b8` |
| `ibm-red-40` | `#ff8389` |
| `ibm-red-50` | `#fa4d56` |
| `ibm-red-60` | `#da1e28` |
| `ibm-red-70` | `#a2191f` |
| `ibm-red-80` | `#750e13` |
| `ibm-red-90` | `#520408` |
| `ibm-red-100` | `#2d0709` |

#### Orange

| Token | Resolved value |
|-------|----------------|
| `ibm-orange-10` | `#fff2e8` |
| `ibm-orange-20` | `#ffd9be` |
| `ibm-orange-30` | `#ffb784` |
| `ibm-orange-40` | `#ff832b` |
| `ibm-orange-50` | `#eb6200` |
| `ibm-orange-60` | `#ba4e00` |
| `ibm-orange-70` | `#8a3800` |
| `ibm-orange-80` | `#5e2900` |
| `ibm-orange-90` | `#3e1a00` |
| `ibm-orange-100` | `#231000` |

#### Magenta

| Token | Resolved value |
|-------|----------------|
| `ibm-magenta-10` | `#fff0f7` |
| `ibm-magenta-20` | `#ffd6e8` |
| `ibm-magenta-30` | `#ffafd2` |
| `ibm-magenta-40` | `#ff7eb6` |
| `ibm-magenta-50` | `#ee5396` |
| `ibm-magenta-60` | `#d02670` |
| `ibm-magenta-70` | `#9f1853` |
| `ibm-magenta-80` | `#740937` |
| `ibm-magenta-90` | `#510224` |
| `ibm-magenta-100` | `#2a0a18` |

#### Purple

| Token | Resolved value |
|-------|----------------|
| `ibm-purple-10` | `#f6f2ff` |
| `ibm-purple-20` | `#e8daff` |
| `ibm-purple-30` | `#d4bbff` |
| `ibm-purple-40` | `#be95ff` |
| `ibm-purple-50` | `#a56eff` |
| `ibm-purple-60` | `#8a3ffc` |
| `ibm-purple-70` | `#6929c4` |
| `ibm-purple-80` | `#491d8b` |
| `ibm-purple-90` | `#31135e` |
| `ibm-purple-100` | `#1c0f30` |

#### Yellow

| Token | Resolved value |
|-------|----------------|
| `ibm-yellow-10` | `#fcf4d6` |
| `ibm-yellow-20` | `#fddc69` |
| `ibm-yellow-30` | `#f1c21b` |
| `ibm-yellow-40` | `#d2a106` |
| `ibm-yellow-50` | `#b28600` |
| `ibm-yellow-60` | `#8e6a00` |
| `ibm-yellow-70` | `#684e00` |
| `ibm-yellow-80` | `#483700` |
| `ibm-yellow-90` | `#302400` |
| `ibm-yellow-100` | `#1c1500` |

---

## Light mode (resolved colors)

Only tokens that **change** when `[data-theme='light']` are listed. IBM palette, typography, spacing, radius, and motion are the same as above.

### Carbon / layer primitives (g10)

| Token | Role | Resolved value |
|-------|------|----------------|
| `cds-background` | Page / canvas background | `#f4f4f4` |
| `cds-layer` | Cards, nav bar, panels | `#ffffff` |
| `cds-layer-subtle` | Dividers, stripes, hover base | `#f4f4f4` |
| `cds-layer-hover` | Hover / raised surfaces | `#e8e8e8` |
| `cds-border-subtle` | Default borders | `#e0e0e0` |
| `cds-border-strong` | Strong borders | `#8d8d8d` |
| `cds-text-primary` | Strongest text, headings | `#161616` |
| `cds-text-secondary` | Body, secondary text | `#525252` |
| `cds-text-muted` | Muted / helper text | `#6f6f6f` |
| `cds-focus` | Focus ring, accent primary | `#0f62fe` |

### App semantic (light)

| Token | Role | Resolved value |
|-------|------|----------------|
| `color-layer-bg` | Page background, left panel base | `#f4f4f4` |
| `color-layer-1` | Main content base | `#f4f4f4` |
| `color-layer-2` | Cards, nav bar, panels | `#ffffff` |
| `color-layer-3` | Dividers, subtle stripes, hover bg | `#f4f4f4` |
| `color-layer-4` | Hover / raised | `#e8e8e8` |
| `color-layer-5` | Subtle / helper text | `#6f6f6f` |
| `color-layer-6` | Secondary / inactive text | `#525252` |
| `color-layer-7` | Body text | `#525252` |
| `color-layer-8` | Strongest foreground, headings | `#161616` |
| `color-layer-surface` | Detail card surface | `#565151` (unchanged) |
| `color-text-primary` | Primary text | `#161616` |
| `color-text-secondary` | Secondary text | `#525252` |
| `color-text-muted` | Muted text | `#6f6f6f` |
| `color-border-subtle` | Subtle borders | `#e0e0e0` |
| `color-border-strong` | Strong borders | `#8d8d8d` |
| `color-accent-primary` | Focus, primary accent | `#0f62fe` |
| `color-accent-soft` | Soft accent | `#a6c8ff` (unchanged) |
| `color-accent-strong` | Strong accent | `#002d9c` (unchanged) |
| `color-status-pill-border` | Status pill border (light) | `#4589ff` |
| `color-status-pill-bg` | Status pill background (light) | `#a6c8ff` |
| `color-status-pill-text` | Status pill text (light) | `#001141` |

---

## Usage (where tokens are used)

| Token / group | Where used |
|---------------|------------|
| `layer-bg` | Page background, left column base |
| `layer-2` | Nav bar (top card), about card, project list card, footer card, RightPanel surface |
| `layer-3` | Nav bar inner padding area hover, project list row stripes, dividers |
| `layer-4` | Row hover states |
| `layer-5` | Category labels, row numbers (muted) |
| `layer-6` | Secondary text, “Want to have a chat?”, links before hover |
| `layer-7` | Body copy, contact list |
| `layer-8` | Headings, logo, primary text, focus ring |
| `layer-surface` | Detail card surface |
| `border-subtle` / `border-strong` | Card borders, focus offset |
| `accent-primary` | Focus ring |
| `accent-soft` / `accent-strong` | Logo gradient (blue) |
| `status-pill-*` | Footer “Alpine-Chough v1.0.0” pill |
| `radius-lg` | Cards, nav bar, panels; inner button radius = 0.5rem (card − padding) |
| `spacing-12` (3rem) | Theme toggle and back button min size (48px) |
