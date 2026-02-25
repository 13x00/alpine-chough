---
name: Portfolio Style-First Architecture
overview: "Build a style-first single-page portfolio for alpine-chough: establish design tokens and Tailwind theme, create reusable component library, then build split-screen layout (left: about+nav+footer, right: dynamic content swapping)."
todos:
  - id: setup-project
    content: Initialize Next.js project with TypeScript, configure Tailwind CSS, and set up project structure
    status: completed
  - id: design-tokens
    content: Create design tokens (colors, typography, spacing, shadows) in tokens.css and configure Tailwind theme
    status: completed
  - id: base-components
    content: Build base UI components (Typography, Card, Image, Grid) using design tokens
    status: completed
  - id: layout-components
    content: Create split-screen layout components (LeftPanel, RightPanel, SplitLayout) with about section, nav cards, and footer
    status: completed
  - id: content-components
    content: Build navigation components (Logo home button, NavCard with 2:1 aspect ratio, NavCardCarousel with vertical auto-scroll, ContentTabs for Images/Projects switching) and content detail components (PortraitView, ProjectDetail, ArticleDetail, PhotographyDetail)
    status: completed
  - id: state-management
    content: Create useContent hook for managing content state and view swapping
    status: completed
  - id: single-page
    content: Build single page.tsx that combines all components with state management for dynamic content swapping
    status: completed
isProject: false
---

# Portfolio Style-First Architecture Plan

## Project Structure Overview

Single-page application with split-screen layout:

- **Left Panel**: Fixed section (about text + navigation cards + footer)
- **Right Panel**: Dynamic section (portrait image → swaps to project/article/photography detail)

```
alpine-chough/
├── src/
│   ├── app/                    # Next.js 13+ app directory
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx            # Single page with split-screen layout
│   ├── components/             # Reusable components
│   │   ├── ui/                # Base UI components
│   │   ├── layout/            # Layout components
│   │   └── content/           # Content-specific components
│   ├── styles/                # Global styles & tokens
│   │   ├── globals.css        # Tailwind imports + custom CSS
│   │   └── tokens.css         # CSS custom properties (design tokens)
│   ├── lib/                    # Utilities & helpers
│   │   └── utils.ts           # Utility functions (cn, etc.)
│   ├── hooks/                  # React hooks
│   │   └── useContent.ts      # State management for content swapping
│   └── types/                  # TypeScript types
│       └── content.ts          # Content type definitions
├── public/                     # Static assets
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies
```

## Phase 1: Foundation & Design System

### 1.1 Project Setup

- Initialize Next.js 14+ with TypeScript and App Router
- Configure Tailwind CSS with custom theme
- Set up TypeScript with strict mode
- Add essential dependencies (clsx, tailwind-merge for className utilities)

### 1.2 Design Tokens (`src/styles/tokens.css`)

Establish CSS custom properties for:

- **Colors**: Primary palette, neutrals, semantic colors (success, warning, error)
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent spacing scale
- **Shadows**: Elevation system
- **Borders**: Radius values, border widths
- **Transitions**: Animation durations and easing

### 1.3 Tailwind Configuration (`tailwind.config.ts`)

- Extend theme with design tokens
- Configure custom colors referencing CSS variables
- Set up typography plugin or custom font utilities
- Configure spacing, shadows, and border radius scales
- Set up content paths for purging

### 1.4 Global Styles (`src/styles/globals.css`)

- Import Tailwind directives
- Import tokens
- Set base typography styles
- Define CSS reset/normalize
- Set up smooth scrolling and focus styles

## Phase 2: Base Component Library

### 2.1 Utility Functions (`src/lib/utils.ts`)

- `cn()` function for merging Tailwind classes (using clsx + tailwind-merge)
- Type-safe utility helpers

### 2.2 Base UI Components (`src/components/ui/`)

Create foundational components with consistent styling:

- **Typography** (`Typography.tsx`): Heading, Body, Caption variants
- **Card** (`Card.tsx`): Container component with variants
- **Image** (`Image.tsx`): Optimized Next.js Image wrapper
- **Grid** (`Grid.tsx`): Responsive grid system (for content layouts)
- **ScrollContainer** (`ScrollContainer.tsx`): Horizontal scrolling container utility (for carousel)

Each component will:

- Use design tokens via Tailwind classes
- Support variants via props
- Be fully typed with TypeScript
- Follow consistent naming and structure

## Phase 3: Layout Components

### 3.1 Split-Screen Layout Components (`src/components/layout/`)

- **LeftPanel** (`LeftPanel.tsx`): Fixed left section containing:
  - Logo (AM* in top left, clickable home button)
  - About text section
  - ContentTabs (tab buttons to switch between Images/Projects)
  - NavCardCarousel with vertical auto-scrolling navigation cards (shows Images OR Projects based on tab selection)
  - Footer
- **RightPanel** (`RightPanel.tsx`): Dynamic right section that displays:
  - Portrait image (default state)
  - Project detail (when project card clicked)
  - Article detail (when article card clicked)
  - Photography detail (when photography card clicked)
- **SplitLayout** (`SplitLayout.tsx`): Main layout wrapper combining LeftPanel + RightPanel

## Phase 4: Content Components

### 4.1 Navigation Components (`src/components/content/`)

- **Logo** (`Logo.tsx`): AM* logo component positioned top left
  - Clickable home button
  - Resets view to default portrait state
  - Typography-based or image-based logo
- **NavCard** (`NavCard.tsx`): Clickable navigation card component with:
  - 2:1 aspect ratio (width:height = 2:1)
  - Width fills container
  - Boxed card styling
- **NavCardCarousel** (`NavCardCarousel.tsx`): Vertical auto-scrolling container for navigation cards
  - Auto-scrolling vertical carousel
  - Contains multiple NavCard components
  - Smooth scroll behavior
  - Scrolls vertically (up/down)
- **ContentTabs** (`ContentTabs.tsx`): Tab-style button component positioned above card section
  - Switches between "Images" and "Projects" views
  - Tab button styling
  - Controls which content type is shown in NavCardCarousel
- **AboutSection** (`AboutSection.tsx`): About text section component

### 4.2 Content Detail Components (`src/components/content/`)

- **PortraitView** (`PortraitView.tsx`): Default right panel view with portrait image
- **ProjectDetail** (`ProjectDetail.tsx`): Project detail view (shown in right panel)
- **ArticleDetail** (`ArticleDetail.tsx`): Article detail view (shown in right panel)
- **PhotographyDetail** (`PhotographyDetail.tsx`): Photography detail view (shown in right panel)

## Phase 5: State Management & Single Page

### 5.1 State Management (`src/hooks/useContent.ts`)

- Create custom hook to manage content state
- Track current tab: 'images' | 'projects' (for ContentTabs)
- Track current view: 'portrait' | 'project' | 'article' | 'photography' (for RightPanel)
- Handle navigation between views
- Handle home button click (Logo) - resets to 'portrait' view
- Manage selected item data

### 5.2 Root Layout (`src/app/layout.tsx`)

- Set metadata
- Include global styles
- No wrapper needed (handled by SplitLayout)

### 5.3 Main Page (`src/app/page.tsx`)

- Single page component using SplitLayout
- LeftPanel: Logo (top left) + AboutSection + ContentTabs + NavCardCarousel (vertical auto-scrolling) + Footer
- RightPanel: Conditionally renders based on state:
  - PortraitView (default)
  - ProjectDetail (when project nav card clicked)
  - ArticleDetail (when article nav card clicked)
  - PhotographyDetail (when photography nav card clicked)
- Uses useContent hook for state management

### 5.4 Type Definitions (`src/types/content.ts`)

Define TypeScript interfaces for:

- Project
- Article
- Photography
- Shared metadata types

## Implementation Strategy

1. **Start with tokens**: Define all design tokens first to establish visual language
2. **Build base components**: Create UI components using tokens, test in isolation
3. **Assemble layouts**: Combine base components into layout components
4. **Create content components**: Build content-specific components using base + layout
5. **Build pages**: Use all components to create page templates
6. **Iterate**: Refine tokens and components as patterns emerge

## Key Files to Create

### Configuration Files

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind with custom theme
- `next.config.js` - Next.js configuration

### Style Files

- `src/styles/tokens.css` - Design tokens (CSS custom properties)
- `src/styles/globals.css` - Global styles + Tailwind imports

### Component Files (in order of dependency)

- `src/lib/utils.ts` - Utility functions
- `src/components/ui/Typography.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Image.tsx`
- `src/components/ui/Grid.tsx`
- `src/components/ui/ScrollContainer.tsx` - Vertical scroll container utility
- `src/components/ui/Tabs.tsx` - Tab button component
- `src/components/content/Logo.tsx` - AM* logo home button (top left)
- `src/components/content/NavCard.tsx` - 2:1 aspect ratio card component
- `src/components/content/NavCardCarousel.tsx` - Auto-scrolling vertical carousel container
- `src/components/content/ContentTabs.tsx` - Tab buttons to switch between Images/Projects
- `src/components/content/AboutSection.tsx`
- `src/components/content/PortraitView.tsx`
- `src/components/content/ProjectDetail.tsx`
- `src/components/content/ArticleDetail.tsx`
- `src/components/content/PhotographyDetail.tsx`
- `src/components/layout/LeftPanel.tsx`
- `src/components/layout/RightPanel.tsx`
- `src/components/layout/SplitLayout.tsx`
- `src/hooks/useContent.ts` - State management hook

### Page Files

- `src/app/layout.tsx` - Root layout with metadata
- `src/app/page.tsx` - Single page with SplitLayout

## Layout Architecture

### Split-Screen Structure

```
┌─────────────────┬─────────────────┐
│                 │                 │
│   LEFT PANEL    │   RIGHT PANEL   │
│   (Fixed)       │   (Dynamic)     │
│                 │                 │
│  AM*            │                 │
│  (home button)  │   Portrait      │
│                 │   Image         │
│  ┌───────────┐  │   (default)     │
│  │  About    │  │                 │
│  │  Text     │  │   OR            │
│  └───────────┘  │                 │
│                 │   Project       │
│  ┌───────────────┐ │   Detail       │
│  │ [Images][Proj]│ │   (on click)   │
│  │ ┌───────────┐ │ │                 │
│  │ │  Card 1   │ │ │   OR            │
│  │ └───────────┘ │ │                 │
│  │ ┌───────────┐ │ │   Article/     │
│  │ │  Card 2   │ │ │   Photo Detail  │
│  │ └───────────┘ │ │                 │
│  │ ┌───────────┐ │ │                 │
│  │ │  Card 3   │ │ │                 │
│  │ └───────────┘ │ │                 │
│  │    ↕ scroll   │ │                 │
│  └───────────────┘ │                 │
│  (2:1 cards)      │                 │
│  ┌───────────┐  │                 │
│  │  Footer   │  │                 │
│  └───────────┘  │                 │
│                 │                 │
└─────────────────┴─────────────────┘
```

## Navigation Card Specifications

### NavCard Component

- **Aspect Ratio**: 2:1 (width:height)
- **Width**: Fills container width
- **Style**: Boxed card with consistent styling
- **Behavior**: Clickable, triggers content swap in RightPanel

### NavCardCarousel Component

- **Layout**: Vertical scrolling container
- **Auto-scroll**: Continuous or interval-based vertical auto-scrolling (up/down)
- **Cards**: Multiple NavCard components arranged vertically
- **Smooth scrolling**: CSS-based smooth scroll behavior

### ContentTabs Component

- **Position**: Above the NavCardCarousel section
- **Function**: Tab-style buttons to switch between "Images" and "Projects"
- **Behavior**: Clicking a tab changes which content is displayed in NavCardCarousel
- **Style**: Tab button styling (active/inactive states)

## Design Principles

- **Token-driven**: All styles reference design tokens
- **Composable**: Components can be combined flexibly
- **Type-safe**: Full TypeScript coverage
- **Responsive**: Mobile-first approach (stacks vertically on mobile)
- **Performant**: Optimized images, smooth transitions between views, efficient auto-scroll
- **Accessible**: Semantic HTML, ARIA labels, keyboard navigation, pause auto-scroll on hover/focus
- **Single-page**: All content swapping happens client-side with smooth transitions

This architecture ensures styles are established first, components are built systematically, and the single-page layout can be assembled quickly using the component library.