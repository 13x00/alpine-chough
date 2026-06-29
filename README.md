# Alpine Chough Portfolio

A style-first single-page portfolio built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Split-screen layout**: Fixed left panel with navigation, dynamic right panel for content
- **Auto-scrolling carousel**: Vertical scrolling navigation cards with 2:1 aspect ratio
- **Content tabs**: Switch between Images and Projects
- **Dynamic content swapping**: Click cards to view project/article/photography details
- **Home button**: AM* logo in top left resets to portrait view
- **Optimized Performance**: Image optimization, lazy loading, and efficient rendering

## Performance Optimizations

This portfolio is optimized for fast loading and smooth interactions:

- **Image Optimization**: Next.js automatic image optimization with WebP/AVIF support
- **Lazy Loading**: Components and images load on-demand
- **Efficient Rendering**: Memoized callbacks and optimized React components
- **GPU-Accelerated Animations**: Smooth 60fps transitions using transform/opacity
- **Code Splitting**: Detail components loaded only when needed

### Image Optimization Required

**IMPORTANT**: The portrait images need to be optimized before deployment.

Run the optimization script:
```bash
./optimize-images.sh
```

This will:
- Convert PNG images (7-8MB each) to optimized JPG (~200-400KB each)
- Reduce total image size from 40MB to ~2-3MB (93% reduction)
- Improve First Contentful Paint by 2-4 seconds
- Maintain image quality at 85% (visually lossless)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. **Optimize images** (critical for performance):
```bash
./optimize-images.sh
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app` - Next.js app directory with pages and styles
- `/components` - Reusable React components
  - `/ui` - Base UI components (Typography, Card, Grid, etc.)
  - `/layout` - Layout components (SplitLayout, LeftPanel, RightPanel)
  - `/content` - Content-specific components (NavCard, ProjectDetail, etc.)
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

## Performance Documentation

See `PERFORMANCE_OPTIMIZATION.md` for detailed information about:
- Performance improvements implemented
- Image optimization process
- Expected performance gains
- Further optimization opportunities

## Next Steps

1. Run `npm install` to install dependencies
2. **Run `./optimize-images.sh` to optimize images** (critical!)
3. Add your images to `/public` directory
4. Update content in `app/page.tsx`
5. Customize design tokens in `app/styles/tokens.css`
6. Run `npm run dev` to start development server
