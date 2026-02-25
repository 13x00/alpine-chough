---
name: Style Review Plan
overview: Systematic review of all styling properties across components, asking for confirmation or changes on each element.
todos:
  - id: review-logo
    content: Review Logo component styling
    status: pending
  - id: review-header
    content: Review Header row styling
    status: pending
  - id: review-about
    content: Review About section styling
    status: pending
  - id: review-tabs
    content: Review Tabs and TabButton styling
    status: pending
  - id: review-navcard
    content: Review NavCard styling
    status: pending
  - id: review-carousel
    content: Review NavCardCarousel spacing and behavior
    status: pending
  - id: review-footer
    content: Review Footer contact section styling
    status: pending
  - id: review-status
    content: Review Status pill styling
    status: pending
  - id: review-panels
    content: Review LeftPanel and RightPanel container styles
    status: pending
  - id: review-global
    content: Review global typography and spacing system
    status: pending
isProject: false
---

# Style Review Plan

Review each component's styling properties systematically. For each item, confirm if it's correct or specify changes needed.

## 1. Logo Component (`components/content/Logo.tsx`)

- **Text**: `*AM` (asterisk before AM) - Confirm?
- **Font size**: `14px` (`text-sm`) - Correct?
- **Font weight**: `400` (normal) - Correct?
- **Color**: `layer-8` for "AM", `layer-6` for "*" - Correct?
- **Tracking**: `tight` - Correct?
- **Hover**: `opacity-60` - Correct?

## 2. Header Row (`components/layout/LeftPanel.tsx`)

- **Layout**: Logo left, dot right, `justify-between` - Correct?
- **Padding**: `px-5 py-4` - Correct?
- **Ambient dot**: `8px` circle (`w-2 h-2`), `layer-5` color - Correct?

## 3. About Section (`components/content/AboutSection.tsx`)

- **Font size**: `16px` (`text-base`) - ✅ Updated to follow UX principle (was 13px)
- **Line height**: `1.6` (`leading-[1.6]`) - Correct?
- **Color**: `layer-7` - Correct?
- **Name bold**: Inline `<span>` with `font-bold` and `layer-8` - Correct?
- **Padding**: `px-5 pb-5` - Correct?

## 4. Content Tabs (`components/content/ContentTabs.tsx`)

- **Border**: `border-b border-layer-3` - Correct?
- **Spacing**: `space-x-1` between tabs - Correct?
- **Tab button styles**: Review in TabButton component below

## 5. Tab Button (`components/ui/Tabs.tsx`)

- **Active state**: `border-layer-8 text-layer-8` - Correct?
- **Inactive state**: `text-layer-6 hover:text-layer-7 hover:border-layer-4` - Correct?
- **Font size**: `text-sm` (14px) - Correct?
- **Padding**: `px-4 py-2` - Correct?
- **Border**: `border-b-2` - Correct?

## 6. NavCard (`components/content/NavCard.tsx`)

- **Border radius**: `rounded-lg` (12px) - Correct?
- **Border**: `1px solid layer-3` - Correct?
- **Background**: `layer-2` - Correct?
- **Shadow**: None - Correct?
- **Hover border**: `layer-4` - Correct?
- **Aspect ratio**: `2:1` - Correct?
- **Title font size**: `14px` (`text-sm`) - ✅ Confirmed (was 13px)
- **Title font weight**: `400` (normal) - Correct?
- **Title color**: `white` - Correct?
- **Title position**: Bottom-left, `px-3 py-3` - Correct?
- **Category font size**: `12px` (`text-xs`) - Should this be 12px? (currently 11px)
- **Category color**: `white/60` (`text-white/60`) - Correct?
- **Category spacing**: `mt-0.5` below title - Correct?
- **Gradient overlay**: `from-black/70 via-black/10 to-transparent` - Correct?
- **Image hover**: `scale-105` - Correct?

## 7. NavCard Carousel (`components/content/NavCardCarousel.tsx`)

- **Gap between cards**: `space-y-4` (16px) - Correct?
- **Height**: `h-[400px] md:h-[500px]` - Correct?
- **Padding**: `px-5 pb-5` - Correct?
- **Auto-scroll speed**: `3000ms` (3 seconds) - Correct?

## 8. Footer Contact (`components/layout/LeftPanel.tsx`)

- **Background**: `layer-1` - Correct?
- **Border**: `border-t border-layer-3` - Correct?
- **Padding**: `px-5 pt-4 pb-10` - Correct?
- **Heading**: "Want to have a chat?" - Correct?
- **Heading font size**: `12px` (`text-xs`) - ✅ Confirmed (was 11px)
- **Heading color**: `layer-5` - Correct?
- **Heading margin**: `mb-2` - Correct?
- **Bullet dot size**: `6px` (`w-1.5 h-1.5`) - Correct?
- **Bullet color**: Orange accent (`hsl(var(--color-accent))`) - Correct?
- **Link font size**: `12px` (`text-xs`) - ✅ Confirmed (was 11px)
- **Link color**: `layer-6`, hover `layer-8` - Correct?
- **Link format**: `[ value ]` with brackets - Correct?
- **Item spacing**: `space-y-1` (4px) - Correct?
- **Gap between dot and text**: `gap-2` (8px) - Correct?

## 9. Status Pill (`components/layout/LeftPanel.tsx`)

- **Position**: `absolute bottom-3 right-3` - Correct?
- **Background**: `layer-2` - Correct?
- **Border**: `border border-layer-3` - Correct?
- **Border radius**: `rounded-full` - Correct?
- **Padding**: `px-2.5 py-1` - Correct?
- **Dot size**: `6px` (`w-1.5 h-1.5`) - Correct?
- **Dot color**: Orange accent - Correct?
- **Gap**: `gap-1.5` (6px) between dot and text - Correct?
- **Text font size**: `12px` (`text-xs`) - ✅ Confirmed (was 10px)
- **Text color**: `layer-7` - Correct?
- **Text**: "Currently working at Open Studio" - Correct?

## 10. Left Panel Container (`components/layout/LeftPanel.tsx`)

- **Background**: `layer-2` - Correct?
- **Border**: `border-r border-layer-3` - Correct?
- **Layout**: `flex flex-col h-screen` - Correct?

## 11. Right Panel (`components/layout/RightPanel.tsx`)

- **Background**: `layer-4` - Correct?
- **Layout**: `flex-1 overflow-hidden` - Correct?

## 12. Global Typography (`app/styles/tokens.css`)

- **Base font size**: `16px` (`text-base`) - Confirmed for body text (UX best practice)
- **Type scale**: Standard scale confirmed:
  - `12px` (small/tiny text)
  - `14px` (caption)
  - `16px` (body) ✅
  - `18px` (large)
  - `24px` (h3)
  - `32px` (h2)
  - `48px` (h1)
- **Font family**: System sans-serif stack - Correct?
- **Accent color**: `255 69 0` (orange-red) - Correct?

## 13. Spacing System

- **Card gap**: `16px` (`space-y-4`) - Correct?
- **Section padding**: `px-5` (20px) - Correct?
- **Vertical spacing**: Various `py-4`, `pb-5`, etc. - Review needed?

## Review Process

For each section above, confirm:

- ✅ Keep as is
- 🔄 Change (specify new value)
- ❌ Remove/not needed

We'll go through each component one by one.