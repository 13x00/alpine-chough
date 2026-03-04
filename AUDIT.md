# Codebase Audit — Alpine Chough

**Date:** 2026-03-04  
**Author:** Senior Software Architect (AI-assisted audit)  
**Repository:** `alpine-chough`  
**Version:** `0.1.0`

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Directory & File Structure](#2-directory--file-structure)
3. [Routing & Navigation](#3-routing--navigation)
4. [Data & State Management](#4-data--state-management)
5. [Component Architecture](#5-component-architecture)
6. [Styling Approach](#6-styling-approach)
7. [Performance & Build](#7-performance--build)
8. [Developer Experience & Code Quality](#8-developer-experience--code-quality)
9. [External Dependencies](#9-external-dependencies)
10. [Audit Summary & Recommendations](#10-audit-summary--recommendations)

---

## 1. Project Overview

### What type of project is this?

A personal **photography portfolio and archive** for Andreas Slapgård Mitchley (AM\*). It is a single-page experience — not a traditional multi-page site — presenting a curated set of photographs and named collections through a split-panel layout with animated detail overlays.

### Primary tech stack

| Concern | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.5 (`strict: true`) |
| Styling | Tailwind CSS 3.4 + IBM Carbon Design System tokens |
| Animation | Framer Motion 12 |
| Fonts | Google Fonts via `next/font` (Roboto + Roboto Mono) |
| Icons | `@carbon/icons-react` |
| Component docs | Storybook 10 |
| Image processing | Sharp (offline script) |
| State management | React `useState` / `useReducer` (no external store) |

### Entry point — root to first render

```
app/layout.tsx
  └─ Inlines theme-flash-prevention script (reads localStorage.theme → sets data-theme on <html>)
  └─ Loads Roboto / Roboto_Mono via next/font → CSS custom properties
  └─ Renders app/globals.css (imports tokens.css, Tailwind layers)
  └─ app/page.tsx   (Client Component — 'use client')
       └─ useContent() — local state machine (portrait → photo | collection)
       └─ fetch('/content.json') on mount → contentData state
       └─ <PageLoader />  — 4-phase CSS intro overlay
       └─ <SplitLayout /> — root layout shell
            ├─ <LeftPanel />  — bio + nav list + footer
            └─ <RightPanel /> — portrait cycler + detail overlay
                 ├─ <PortraitView /> — always rendered, z-0
                 └─ <DetailOverlayMotion /> — framer-motion animated overlay
                      └─ <PhotoDetail /> | <CollectionDetail />
```

### Environment config

- **No `.env` files.** There are no environment variables — the app is fully static and self-contained.
- `next.config.js` — enables `reactStrictMode`, disables Next.js image optimisation (`images.unoptimized: true`) since all images are pre-processed WebP/JPEG files.
- `tsconfig.json` — `strict: true`, `@/*` path alias mapping to project root.
- `tailwind.config.ts` — all design tokens aliased to CSS custom properties.
- `.github/workflows/ci.yml` — Node 20, `npm ci`, dry-run image check, `next build`.

---

## 2. Directory & File Structure

```
alpine-chough/
├── .cursor/plans/            Planning documents (AI session artifacts)
├── .github/workflows/        CI pipeline (ci.yml)
├── .storybook/               Storybook config (main.ts, preview.tsx, scoped CSS)
├── app/                      Next.js App Router root
│   ├── globals.css           Global styles (imports tokens, Tailwind layers, keyframes)
│   ├── layout.tsx            Root layout (fonts, theme script, metadata)
│   ├── page.tsx              Single application route
│   ├── error.tsx             App-level error boundary
│   ├── loading.tsx           App-level loading fallback
│   ├── not-found.tsx         404 page
│   └── styles/
│       ├── tokens.css        Non-color design tokens (spacing, typography, radius, shadow, motion)
│       └── carbon-tokens.css Generated color tokens from @carbon/themes (do not edit manually)
├── assets/originals/         Source images — gitignored (large files)
│   ├── photos/
│   └── portraits/
├── components/
│   ├── content/              Page-level content components
│   │   ├── AboutSection.tsx
│   │   ├── BackButton.tsx
│   │   ├── CollectionDetail.tsx
│   │   ├── Logo.tsx
│   │   ├── PhotoDetail.tsx
│   │   ├── PortraitView.tsx
│   │   └── ThemeToggle.tsx
│   ├── layout/               Structural layout components
│   │   ├── DetailOverlayMotion.tsx
│   │   ├── LeftPanel.tsx
│   │   ├── RightPanel.tsx
│   │   └── SplitLayout.tsx
│   ├── transition/
│   │   └── PageLoader.tsx    Intro animation overlay
│   └── ui/                   Primitive / reusable atoms
│       ├── Surface.tsx
│       └── Typography.tsx
├── hooks/
│   └── useContent.ts         Global view-state machine
├── lib/
│   └── utils.ts              cn() utility (clsx + tailwind-merge)
├── public/
│   ├── content.json          Content data source
│   ├── favicon.svg
│   ├── photos/               Processed WebP + JPEG outputs
│   └── Portrait_cycle/       Processed WebP portrait images
├── scripts/
│   ├── compress-images.mjs   Sharp-based image compression pipeline
│   ├── generate-carbon-tokens.js  Carbon CSS token generator
│   └── README.md
├── stories/                  Storybook stories
│   ├── Foundations/          Colors, Typography, Spacing, Radius, Shadows, Motion, Icons
│   └── Components/           AboutSection, BackButton, LeftPanel, Logo, ThemeToggle, Typography
├── types/
│   └── content.ts            All domain types
└── package.json / tsconfig.json / tailwind.config.ts / next.config.js
```

### Non-standard choices

- **`assets/originals/` at project root** (gitignored) — an offline image source directory that sits outside `public/`. Intentional: keeps large source files out of the repo while the compiled outputs live in `public/`.
- **`.cursor/plans/`** — AI planning artifacts committed to the repo. Useful for archaeology but not standard project structure; could live outside version control.
- **`public/Portrait_cycle/`** — unusual directory name capitalisation. Inconsistent with lowercase `photos/` sibling.

### Potentially orphaned / redundant

- `app/loading.tsx` and `app/error.tsx` — exist but `page.tsx` is a client component that manages its own loading/error states manually. These Next.js special files only apply to the RSC streaming model and will never be triggered by the current architecture. They are technically harmless but misleading.
- `lottie-react` is listed as a production dependency but no Lottie animations appear anywhere in the component tree. Either planned-but-unused or from an earlier iteration.

---

## 3. Routing & Navigation

### How routing is handled

Next.js App Router **file-based routing**. There is effectively one application route.

### Route map

| Route | File | What it renders |
|---|---|---|
| `/` | `app/page.tsx` | Full SPA — split layout with all views |
| *(404)* | `app/not-found.tsx` | Minimal not-found page |

### Navigation model

Navigation is **entirely client-side state** — not URL-based. All view transitions (portrait → photo → collection) happen by mutating `useContent` state. There are no URL changes, no `<Link>` components, and no history pushes.

**Implications:**
- No deep-linking: users cannot bookmark or share a specific photo/collection.
- Browser back/forward buttons do nothing meaningful inside the app.
- Server-side rendering of detail views is impossible.

### Route guards / auth

None. This is a public portfolio with no authentication.

### Dead routes / unused pages

`app/loading.tsx` and `app/error.tsx` — see Section 2 note. These are Next.js RSC-layer files that will never fire in the current client-component-first architecture.

---

## 4. Data & State Management

### State management

All state is **local React state** with no external store.

| State | Location | Scope |
|---|---|---|
| Current view (`portrait`/`photo`/`collection`) | `useContent` hook | App-wide (passed down as props) |
| Selected item | `useContent` hook | App-wide |
| `isDetailClosing` flag | `app/page.tsx` | App-wide |
| `detailDirection` | `app/page.tsx` | App-wide |
| `contentData` / `contentLoading` / `contentError` | `app/page.tsx` | App-wide |
| Motion state (isOpen, isExpanded, display item) | `RightPanel.tsx` | Local to right panel |
| Portrait cycle index / timer | `PortraitView.tsx` | Local |
| Theme (dark/light) | `localStorage` + `data-theme` attribute | Global DOM |

### Data fetching

`/content.json` is fetched once on mount inside `app/page.tsx` via a manual `fetch()` + `useEffect` pattern. There is no API layer, no React Query, no SWR — this is appropriate for a static content file that never changes at runtime.

The fetch is properly implemented with:
- Cancellation via `cancelled` flag in cleanup
- Error state (`contentError`)
- Loading state (`contentLoading`)
- HTTP status check before parsing JSON

### Shared stores / global contexts

None. All state flows via props. Given the app's single-route, single-level architecture this is appropriate and not a problem.

### Data anti-patterns

- **Prop drilling is shallow but present.** `currentView`, `selectedItem`, `onCloseDetail`, `useNarrowLayout`, `onDetailCloseComplete`, `detailDirection`, and `projectItems` are all passed from `page.tsx` → `SplitLayout` → `LeftPanel`/`RightPanel`. For the current scale this is manageable, but `SplitLayout` is a pass-through for most of these props.
- **`content.json` fetched as runtime `fetch()` rather than imported.** Since this is a static file that changes only at build time, it could be imported directly as a module (or read at build time in a Server Component), eliminating the loading state entirely. The current pattern introduces a flash of the "Loading…" state after every hard refresh.
- **`PortraitView` hardcodes 7 images.** The cycle count (`7`) and filenames are hardcoded in the component. These should derive from `content.json` or a config constant.

---

## 5. Component Architecture

### Component breakdown

**Atoms (primitives):**
- `Surface` — polymorphic wrapper with variant/padding props
- `Typography` — text variant wrapper (heading/body/caption/small)
- `BackButton` — icon button

**Molecules (composed UI units):**
- `Logo` — animated text logo
- `ThemeToggle` — icon button with side effect
- `AboutSection` — static bio text
- `PageLoader` — timed intro overlay

**Organisms (sections / complex views):**
- `LeftPanel` — full left column (nav list + bio + footer)
- `RightPanel` — right column state coordinator
- `PortraitView` — portrait image cycler
- `PhotoDetail` — photo detail view
- `CollectionDetail` — collection detail view
- `DetailOverlayMotion` — animated detail panel (most complex)

**Layout:**
- `SplitLayout` — outermost layout shell

### Shared / reusable vs. page-specific

| Component | Reusable? | Notes |
|---|---|---|
| `Surface` | Yes | Clean abstraction |
| `Typography` | Yes | Clean abstraction |
| `BackButton` | Yes | Could be more generic (currently always `ArrowLeft`) |
| `Logo` | No | Brand-specific |
| `ThemeToggle` | No | App-specific |
| `PageLoader` | No | App-specific intro animation |
| All layout/content | No | Page-specific |

### God components

`DetailOverlayMotion` (309 lines) is the most complex single component. It manages:
- A 3-state close FSM (idle / closing-shrink / closing-depart)
- Entry animation sequencing with a hold timer
- Measurement + resize handling
- `AnimatePresence` for both mount/unmount and content swaps
- Motion value derivation for 3 animated elements (backdrop, outer wrapper, surface)
- `useReducedMotion` support

This is legitimately complex animation logic and the complexity is well-justified and well-commented. It is not a "god component" in the pejorative sense — it does exactly one thing (the overlay animation) but that one thing is intricate.

`app/page.tsx` currently orchestrates content loading, navigation state, direction state, and layout props. As features grow, this will become a coordination burden.

### Separation of concerns

Generally clean:
- UI rendering is in components
- Domain types are in `types/content.ts`
- State logic is in `useContent.ts`
- Style utilities in `lib/utils.ts`

One concern: **`RightPanel` duplicates state** that mirrors `page.tsx` state (e.g. `motionIsOpen` tracks `hasDetail`). This is intentional to isolate animation state from domain state, but creates two sources of truth for "is the overlay open".

### Third-party UI libraries

- `@carbon/icons-react` — IBM Carbon icons
- Framer Motion — animation
- Tailwind CSS — utility-first styling
- No component library (Carbon components, shadcn/ui, etc.) — the team built their own primitive layer

---

## 6. Styling Approach

### System overview

A **three-layer CSS architecture**:

```
Layer 1: carbon-tokens.css    (generated) — semantic color tokens from @carbon/themes
Layer 2: tokens.css           (authored)  — spacing, typography, radius, shadow, motion
Layer 3: tailwind.config.ts               — CSS custom property aliases → Tailwind utilities
```

All Tailwind color/size/radius/shadow utilities are aliased to CSS custom properties. Components use only semantic tokens (e.g. `bg-background`, `text-text-primary`, `border-border-subtle-00`) — no raw Tailwind color utilities like `bg-zinc-900` appear in component files.

### Theme system

- Dark-first: `:root` contains g100 (dark) token values; `[data-theme='light']` overrides to g10 (light).
- Theme is stored in `localStorage.theme` and applied via a blocking inline script in `app/layout.tsx` before first paint.
- The `ThemeToggle` component writes both `localStorage` and the `data-theme` attribute synchronously.
- Storybook has a custom toolbar toggle and `storybook-dark-scope.css` to test both themes.

This is a **well-designed, production-quality theming system**.

### Visual consistency

High. All spacing, color, and typography decisions flow through the token system. There are no one-off color hex values or magic pixel sizes in component JSX.

### One-off / global CSS concerns

`app/globals.css` defines several utility classes and keyframes directly:
- `--am-gradient` custom property
- `@keyframes logo-gradient-run` / `logo-gradient-run-down`
- `.touch-target` class
- `.scrollbar-hide` class
- `.status-pill` class
- `.logo-gradient-text` with per-theme rules

These are intentional global utilities and are not causing conflicts. However:
- `.logo-gradient-text` contains theme-specific rules that could instead be handled via CSS custom properties and a single rule, reducing duplication.
- `scrollbar-hide` and `touch-target` are good candidates for Tailwind plugins.

---

## 7. Performance & Build

### Build tool

**Next.js 16** (Turbopack-compatible, though `next dev` defaults depend on the version). Production builds use the standard Next.js webpack pipeline.

### Code splitting / lazy loading

- **No explicit lazy loading.** All components are eagerly imported. Given there is only one route and the total JS bundle is small, this is not currently a problem.
- `PageLoader` is effectively a soft-loading experience during initial paint, but it does not gate rendering of the actual content.
- Next.js automatic code splitting still applies at the route level — but with one route, there is only one chunk.

### Image optimisation

- **Next.js image optimisation is disabled** (`images.unoptimized: true`). This is an intentional architectural choice: images are pre-processed offline by `scripts/compress-images.mjs` using Sharp.
- The pipeline produces `.webp` (quality 80, effort 6) and `.jpg` (quality 82, progressive mozjpeg) from originals capped at 3840px (photos) and 2400px (portraits).
- **There is no responsive `srcset`** — images are served at a single resolution. On small screens, the 3840px-capped WebP is more than necessary. A single downscaled variant (e.g. 1200px) for mobile would significantly reduce payload.
- `<img>` tags are used directly (not `next/image`). This means no built-in lazy loading, no blur placeholder, and no automatic `srcset`.

### Performance red flags

| Issue | Severity | Notes |
|---|---|---|
| No `loading="lazy"` on images | Medium | `PortraitView` and grid images load eagerly |
| No responsive image sizes | Medium | Single WebP resolution for all viewport sizes |
| `content.json` fetched at runtime | Low | Could be imported as a module; eliminates loading flicker |
| `PortraitView` always mounted | Low | Always rendered (even when hidden), runs a 7s interval regardless of visibility — the `isVisible` prop pauses the interval, which is correct |
| `lottie-react` in bundle | Low | ~40KB gzipped, unused |
| No `<link rel="preload">` for above-fold images | Low | First portrait image could be hinted to the browser |

### CI pipeline

The `.github/workflows/ci.yml` runs `npm ci` → images dry-run → `next build`. It does not run lint or type-check as separate steps — these are implied by `next build` but failures produce less actionable output. No test step exists.

---

## 8. Developer Experience & Code Quality

### TypeScript

- `strict: true` — the highest strictness level is enabled.
- Path alias `@/*` maps to project root.
- Types are well-defined in `types/content.ts`.
- One minor inconsistency: `RightPanel.tsx` uses an inline `import()` type annotation (`selectedItem: import('@/types/content').DetailItem | null`) in the interface rather than importing `DetailItem` at the top of the file.

### Linting

- ESLint 9 with `eslint-config-next`. No custom rules or additional plugins (e.g. no `eslint-plugin-tailwindcss`, no `@typescript-eslint` extensions beyond what Next provides).
- No Prettier config. Formatting is either handled by editor settings or is inconsistent.

### Testing

- **No unit or integration tests.** The Storybook `@storybook/addon-vitest` devDependency is installed, suggesting visual testing via Storybook was planned or partially set up, but no test files (`.test.ts`, `.spec.ts`, `.test.tsx`) exist anywhere in the project.
- Storybook stories cover Foundations (Colors, Typography, Spacing, etc.) and 6 components. This provides good visual documentation but no automated assertions.
- Chromatic (`@chromatic-com/storybook`) is installed as a devDependency, enabling visual regression testing — but there is no Chromatic project ID or CI step configured.

### Code smells & conventions

| Observation | File | Severity |
|---|---|---|
| `SHOW_META = false` constant silences photo metadata | `PhotoDetail.tsx` | Low — intentional but leaves dead code paths in the render |
| Magic numbers in `DetailOverlayMotion` (`ARRIVE_HOLD_MS = 120`, `CARD_RADIUS = '14px'`) | `DetailOverlayMotion.tsx` | Low — constants are named and documented |
| `PortraitView` hardcodes `['/Portrait_cycle/IMG_8765.webp', ...]` | `PortraitView.tsx` | Medium — should come from content data |
| `RightPanel` has a duplicated `import()` type | `RightPanel.tsx` | Low |
| `app/page.tsx` is `'use client'` for the entire page | `app/page.tsx` | Medium — prevents RSC benefits |
| `Surface` variants (`default`/`elevated`/`outlined`) are identical in implementation | `Surface.tsx` | Low — variant API exists but is not yet differentiated |
| No error boundary wrapping `SplitLayout` | — | Medium — a runtime error in a child throws to the root `error.tsx` |

### Naming conventions

Generally consistent: PascalCase for components, camelCase for hooks/utils, kebab-case for CSS files. The `Portrait_cycle` directory uses snake_case, which is inconsistent with everything else.

---

## 9. External Dependencies

### Production dependencies

| Package | Version | Purpose |
|---|---|---|
| `next` | ^16.1.6 | Framework — App Router, SSR, build pipeline |
| `react` / `react-dom` | ^18.3.1 | UI runtime |
| `framer-motion` | ^12.34.3 | Animation engine |
| `@carbon/colors` | ^11.47.0 | IBM Carbon color palette (used by token generator) |
| `@carbon/icons-react` | ^11.75.0 | Icon set (ArrowLeft, Sun, Moon, etc.) |
| `@carbon/themes` | ^11.68.0 | IBM Carbon semantic theme tokens (g100/g10) |
| `clsx` | ^2.1.1 | Conditional className utility |
| `tailwind-merge` | ^2.5.0 | Merges Tailwind classes, resolves conflicts |
| `lottie-react` | ^2.4.1 | **Unused.** Lottie animation player — not referenced in any component |
| `sharp` | ^0.34.5 | Image processing — used only in scripts, not at runtime |

### Dev dependencies (key)

| Package | Purpose |
|---|---|
| `storybook` + `@storybook/nextjs` | Component documentation and visual dev environment |
| `@chromatic-com/storybook` | Visual regression testing (not yet wired to CI) |
| `@storybook/addon-vitest` | Story-level unit test runner (not yet used) |
| `@storybook/addon-a11y` | Accessibility checks in Storybook |
| `tailwindcss` | Utility CSS framework |
| `typescript` | Type system |
| `eslint` + `eslint-config-next` | Linting |
| `ajv` + `ajv-keywords` | JSON schema validation (likely a transitive dep, not explicitly used) |

### Flags & concerns

- **`lottie-react`** is in `dependencies` (not devDependencies) and appears completely unused. It adds ~40KB gzipped to the production bundle with no benefit. Remove it.
- **`sharp` in `dependencies`** — Sharp is a native binary used only in `scripts/`. It does not belong in production dependencies and will unnecessarily inflate Vercel/Docker deployments. Move to `devDependencies` or `optionalDependencies`.
- **`@carbon/colors` and `@carbon/themes` in `dependencies`** — used only by `scripts/generate-carbon-tokens.js` at development time. These should be `devDependencies`.
- All versions use `^` (caret) semver ranges. This is fine for a private project but note that `framer-motion ^12` is a very recent major; some APIs may change before the project locks versions.
- No known security vulnerabilities flagged (run `npm audit` to confirm current state).

---

## 10. Audit Summary & Recommendations

### 1. Strengths

- **Excellent design system discipline.** The three-layer token architecture (Carbon → CSS custom properties → Tailwind aliases) is cohesive, maintainable, and properly supports dark/light theming without JS overhead on subsequent visits.
- **High animation quality with good engineering.** `DetailOverlayMotion` is a sophisticated piece of work — the two-phase close FSM, `useLayoutEffect` sequencing to prevent flicker, `useReducedMotion` support, and guarded close handlers are all production-quality patterns.
- **Good TypeScript hygiene.** `strict: true` across the board, types centralised in `types/content.ts`, no `any` abuse apparent.
- **Thoughtful image pipeline.** The offline Sharp compression with caching, dry-run mode, and clean mode is a good developer experience, and keeping originals gitignored is the right call.
- **Theme-flash prevention** is handled correctly with a tiny inline script before first paint — a detail many projects get wrong.
- **Storybook foundation** for Foundations + Components is a strong basis for visual documentation and future regression testing.
- **Clean utility layer** — `cn()`, `Surface`, `Typography` are minimal and effective primitives.

### 2. Risks

- **No URL-based navigation.** All view state lives in React state, meaning no deep-linking, no shareable URLs, no browser history. This is a deliberate UX choice for the current version, but is a significant constraint if the archive grows. Retrofitting URL-based routing later will require a non-trivial refactor of `useContent` and the `page.tsx` coordination logic.
- **`content.json` is the single source of truth with no validation.** If the JSON is malformed or a field is missing, the error will surface as a runtime JS error in the component tree (possibly uncaught). There is no schema validation at build time or load time.
- **`PortraitView` image list is hardcoded.** Adding or removing portrait images requires editing a component, not just dropping files and updating `content.json`. This will bite the first time new portraits are added.
- **No error boundaries below the root.** A render error in `PhotoDetail` or `CollectionDetail` will propagate to the app-level `error.tsx`, wiping the entire UI. A component-level error boundary around the detail overlay would be safer.
- **Unused `lottie-react` dependency** adds dead weight to the production bundle.

### 3. Quick Wins

- **Remove `lottie-react`** from `package.json`. Zero benefit, non-trivial bundle cost.
- **Move `sharp`, `@carbon/colors`, `@carbon/themes` to `devDependencies`** — they are build/script-time only and should not ship in production installs.
- **Add `loading="lazy"` to `<img>` tags** in `CollectionDetail` and `PortraitView` (below-fold images). One attribute, measurable LCP/TTI improvement on slower connections.
- **Fix `RightPanel` inline import** — import `DetailItem` at the top of the file like every other type.
- **Rename `public/Portrait_cycle/` to `public/portrait-cycle/`** to match the lowercase convention of `public/photos/`. Update references in `PortraitView` and `content.json`.
- **Add `prettier` config** (`.prettierrc`) so formatting is deterministic across editors and CI rather than relying on individual editor settings.
- **Add `"typecheck": "tsc --noEmit"` to npm scripts** and include it in CI, so type errors surface independently of the build step.

### 4. Architectural Recommendations

- **Import `content.json` as a module instead of fetching it.** Since the file is static and co-located, a top-level `import contentData from '@/public/content.json'` (with appropriate `resolveJsonModule`) eliminates the loading state, the error state, and the runtime fetch entirely. If the content ever becomes dynamic, this is trivially reversible.

- **Add a runtime content schema validator.** Use `zod` (or the existing `ajv` devDependency) to parse `content.json` against the `ContentData` type at startup. This surfaces authoring mistakes immediately rather than as cryptic runtime errors.

- **Drive `PortraitView` from `content.json`.** Add a `portraits` array to `content.json` (or a dedicated `portraits.json`) and pass it into `PortraitView` as a prop. The component should be data-driven, not hardcoded.

- **Implement URL-based routing (when ready).** If the project grows to include more items or a public share feature is desired, the navigation model should shift from `useState` to `useRouter` + URL params (e.g. `/?view=photo&id=1`). The `useContent` hook is the right place to wire this — it could be transparently updated to sync with `useSearchParams`.

- **Add a component-level error boundary** around `DetailOverlayMotion` in `RightPanel`. A failed render inside the detail view should degrade gracefully (close the overlay) rather than unmounting the entire application.

- **Consider `next/image` with a custom loader.** Reintroducing `next/image` with `loader` pointing to the pre-processed WebP files would restore lazy loading, blur placeholders, and responsive `srcset` generation without giving up the offline compression pipeline. Alternatively, generate multiple WebP sizes (400, 800, 1600, 3200px) in `compress-images.mjs` and use HTML `srcset` manually.

- **Wire Chromatic to CI.** The devDependency is installed. Adding a Chromatic publish step to the CI workflow would provide free visual regression coverage for all Storybook stories.

### 5. Open Questions

1. **Is URL-based navigation a future requirement?** The current state-only model is clean but limits shareability. A decision here should be made before the content archive grows significantly.
2. **Will `content.json` remain static, or is a CMS integration planned?** If Sanity, Contentful, or a headless CMS is on the roadmap, the data-fetching layer needs an architectural decision now — not after the content is managed externally.
3. **What is `lottie-react` for?** Was it used for a previous feature, or is it planned for a specific animation? If planned, where and when?
4. **`SHOW_META = false` in `PhotoDetail`** — when will photo metadata (title, description, tags) be enabled? This is dead code until that decision is made. Either remove the flag and implement the design, or track it as a known deferral.
5. **What is the deployment target?** The project has a `.vercel` gitignore entry suggesting Vercel, but there is no `vercel.json` and no deployment workflow in CI. Confirming the target affects decisions around Edge Runtime, image CDN, and build caching strategy.
6. **Is Storybook + Chromatic intended to replace or supplement manual QA?** If Chromatic is going to be the visual regression layer, the CI workflow should be extended now before the component count grows.
