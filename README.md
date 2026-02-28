# Alpine Chough Portfolio

A style-first single-page portfolio built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Split-screen layout**: Fixed left panel with navigation, dynamic right panel for content
- **Auto-scrolling carousel**: Vertical scrolling navigation cards with 2:1 aspect ratio
- **Content tabs**: Switch between Images and Projects
- **Dynamic content swapping**: Click cards to view project/article/photography details
- **Home button**: AM* logo in top left resets to portrait view

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app` - Next.js app directory with pages and styles
- `/components` - Reusable React components
  - `/ui` - Base UI components (Typography, Card, Grid, etc.)
  - `/layout` - Layout components (SplitLayout, LeftPanel, RightPanel)
  - `/content` - Content-specific components (NavCard, detail views, etc.)
- `/hooks` - Custom React hooks (useContent)
- `/lib` - Utility functions
- `/types` - TypeScript type definitions

## Design System

The project uses a token-based design system defined in `app/styles/tokens.css`. All components reference these design tokens through Tailwind CSS custom properties.

## Customization

1. **Add Images**: Place your images in `/public` directory:
   - Portrait image: `/public/portrait.jpg` (or update path in `app/page.tsx`)
   - Project images: Update paths in mock data
   - Photography images: Update paths in mock data

2. **Update Content**: Replace mock data in `app/page.tsx` with your actual content:
   - `mockProjects` - Your design projects
   - `mockImages` - Your photography/images

3. **Customize Design**: Modify design tokens in `app/styles/tokens.css`:
   - Colors, typography, spacing, shadows
   - All components reference these tokens

4. **Modify Components**: Adjust components to match your design preferences

## Next Steps

1. Run `npm install` to install dependencies
2. Add your images to `/public` directory
3. Update content in `app/page.tsx`
4. Customize design tokens in `app/styles/tokens.css`
5. Run `npm run dev` to start development server
