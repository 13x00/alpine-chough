---
name: Unit standardization plan
overview: Standardize all CSS measurements to rem across the project, aligning arbitrary Tailwind classes and inline styles with the existing token system (which is already rem-based). No tokens need to be added — non-matching font sizes are rounded to the nearest existing Tailwind scale value.
todos:
  - id: theme-toggle
    content: "ThemeToggle.tsx: min-w/h [48px] → [3rem], borderRadius '8px' → '0.5rem'"
    status: completed
  - id: back-button
    content: "BackButton.tsx: min-w/h [48px] → [3rem]"
    status: completed
  - id: about-section
    content: "AboutSection.tsx: text-[13px] → text-sm"
    status: completed
  - id: left-panel
    content: "LeftPanel.tsx: min-h [180px]/[220px] → rem, text-[13px] → text-sm, text-[11px] → text-xs"
    status: completed
isProject: false
---

# Unit Standardization Plan

## Convention

The project follows this convention (already defined in `tokens.css`):

- **rem** — spacing, border-radius, font sizes
- **px** — box-shadows, `--radius-full: 9999px` (exceptions, correct by convention)
- **ms** — durations
- **unitless** — line-heights, opacity

The problem: several components bypass this with arbitrary `[48px]`, `[180px]`, `[13px]` Tailwind classes and an `'8px'` inline style.

## Files to Change

### `[components/content/ThemeToggle.tsx](components/content/ThemeToggle.tsx)`

Two fixes:

- `min-w-[48px] min-h-[48px]` → `min-w-[3rem] min-h-[3rem]` (48px = 3rem exactly)
- `style={{ borderRadius: '8px' }}` → `style={{ borderRadius: '0.5rem' }}` (8px = 0.5rem; this is the inner radius of the nav card: `0.75rem card − 0.25rem padding`)

### `[components/content/BackButton.tsx](components/content/BackButton.tsx)`

- `min-w-[48px] min-h-[48px]` → `min-w-[3rem] min-h-[3rem]`

### `[components/content/AboutSection.tsx](components/content/AboutSection.tsx)`

- `text-[13px]` → `text-sm` (rounds to 14px = 0.875rem, nearest token)

### `[components/layout/LeftPanel.tsx](components/layout/LeftPanel.tsx)`

Four fixes:

- `min-h-[180px]` → `min-h-[11.25rem]`
- `min-h-[220px]` → `min-h-[13.75rem]`
- `text-[13px]` (×1) → `text-sm`
- `text-[11px]` (×1) → `text-xs` (rounds to 12px = 0.75rem)

## No Token Changes Needed

All substitutions use either exact rem equivalents or the nearest existing Tailwind/token scale value. The `tokens.css` and `tailwind.config.ts` are already correct.

## Unit Conversion Reference


| Old           | New             | Note          |
| ------------- | --------------- | ------------- |
| `[48px]`      | `[3rem]`        | exact         |
| `[180px]`     | `[11.25rem]`    | exact         |
| `[220px]`     | `[13.75rem]`    | exact         |
| `8px` inline  | `0.5rem` inline | exact         |
| `text-[13px]` | `text-sm`       | rounds up 1px |
| `text-[11px]` | `text-xs`       | rounds up 1px |


