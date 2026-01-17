# Learnings - Vibe Wiki PRD v2.0

## Discovered Patterns

### [2026-01-17] Codebase Analysis
- **Styling System**: Tailwind v4 with CSS variables in globals.css
- **RTL-First**: Always use logical properties (pr-80 for right padding in RTL)
- **Custom Classes**: `.glass`, `.glow-cyan`, `.gradient-text`, `.animate-float`
- **Typography**: Cairo (Arabic), Geist Mono (code)
- **Color Palette**: Neon aesthetic with cyan, purple, pink accents
- **Component Pattern**: Client components use "use client" directive

### [2026-01-17] Technology Research
- **Next.js 15**: Async Request APIs for params, searchParams, cookies, headers
- **Dark Mode**: Tailwind v4 requires `@custom-variant dark(&:where(.dark, .dark *));`
- **Search**: Fuse.js recommended for client-side fuzzy search
- **Mermaid**: Use client component with ref + useEffect for rendering
- **PWA**: Next.js 15 has built-in manifest.ts support

## Successful Approaches
- Background agents for parallel discovery work efficiently
- Detailed prompts with 7-section structure prevent agent drift
- Using notepad system preserves knowledge across sessions

### [2026-01-17] Design System Updates
- **Enhanced Palette**: Added Ocean (Blue/Teal), Forest (Green), Sunset (Orange/Pink) themes using OKLCH.
- **Animations**: Added `slide-in-right`, `fade-in`, `scale-up` with utility classes.
- **Dark Mode**: Validated Tailwind v4 `@custom-variant dark` usage.
- **Typography**: Added `leading-tighter`, `leading-relaxed`, `tracking-wide` tokens.
- **Structure**: Extended globals.css using `@theme inline` additive approach while preserving existing neon tokens.

### [2026-01-18] Discovery Experience
- **Client-Side Search**: Fuse.js + global event listeners works perfectly for CMD+K modals.
- **Event Bus**: Using `window.dispatchEvent(new Event('open-vibe-search'))` decouples the trigger (SearchBar) from the modal (CommandMenu) effectively without complex state management.
- **Framer Motion**: `AnimatePresence` with `mode="wait"` is crucial for smooth text transitions (like rotating taglines).
- **Glassmorphism**: Layering multiple divs with `mix-blend-screen` and `blur-[100px]` creates the signature neon atmospheric glow.

### [2026-01-18] Optimization & PWA
- **State Sync**: Used custom window events (`window.dispatchEvent(new Event('...'))`) to sync LocalStorage hooks (`useBookmarks`) across disparate components (Sidebar, MobileNav, ArticleHeader) without Context API.
- **PWA Assets**: SVG icons in `public/` referenced in `manifest.ts` work as lightweight placeholders for PWA icons.
- **Next.js Metadata**: `metadataBase` is essential for resolving absolute URLs for OpenGraph images in `generateMetadata`.
- **Manifest**: Next.js 15 `manifest.ts` provides a type-safe way to generate `manifest.webmanifest`.
