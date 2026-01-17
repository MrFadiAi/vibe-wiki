# Vibe Wiki PRD v2.0 - Implementation Plan

## Overview
Implementation plan for the Vibe Wiki v2.0 upgrade, focusing on transforming the static documentation site into an interactive learning platform. The plan prioritizes "wow" factor aesthetics, mobile-first design, and comprehensive content coverage (50+ new articles) while excluding complex backend features like authentication and forums.

## Scope

### Included
- **Core UI**: Sticky header, advanced sidebar, dark/light mode, breadcrumbs, responsive layout.
- **Article Experience**: Floating ToC, reading progress, estimated time, syntax highlighting, copy code, rich media (video, diagrams), print/pdf view.
- **Homepage**: Animated hero, learning paths, testimonials, stats, featured content.
- **Search**: Client-side instant search (cmd+k), recent searches (local storage).
- **Personalization (Local Only)**: Bookmarks, recently viewed history (stored in localStorage).
- **Content**: 50+ articles across 8 new sections (Sections 6-13).
- **Mobile**: Bottom navigation bar, responsive grid, touch-friendly interactions.
- **Tech**: Next.js 15, Tailwind CSS, Framer Motion, Shadcn/UI, MDX.

### Excluded
- User Authentication (Login/Signup/Auth)
- User Profiles & Cloud Progress Tracking
- Discussion Forums / Comments
- Quizzes & Assessments (Backend logic)
- Code Playgrounds (Live execution backend)
- AI Assistants (Summarize/Translate APIs)
- API Access points
- CMS integration (using local MDX)

## Work Breakdown Structure

### Phase 1: Foundation & Layout (Week 1)
*Focus: Setting up the design system, shell, and core navigation.*

#### Task 1.1: Project Config & Design System
- **Deliverable**: `tailwind.config.ts`, `src/app/globals.css`, `src/lib/utils.ts`
- **Features**: Color palette (Ocean/Forest/Sunset), Typography (Inter/Geist + IBM Plex Sans Arabic), Animation utility classes.
- **Dependencies**: None
- **Parallelizable**: NO
- **Complexity**: Small
- **Success Criteria**:
  - [ ] Tailwind configured with custom colors/fonts
  - [ ] Dark mode class strategy working
  - [ ] Base clean build

#### Task 1.2: Enhanced Header Component
- **Deliverable**: `src/components/layout/Header.tsx`, `src/components/ui/ThemeToggle.tsx`
- **Features**: Sticky positioning, backdrop blur, logo, desktop nav links, mobile menu trigger, search trigger, theme toggle.
- **Dependencies**: Task 1.1
- **Parallelizable**: YES (with Sidebar, Footer)
- **Complexity**: Medium
- **Success Criteria**:
  - [ ] Sticks to top on scroll
  - [ ] Toggles dark/light mode correctly
  - [ ] Responsive (hides links on mobile)

#### Task 1.3: Advanced Sidebar Navigation
- **Deliverable**: `src/components/layout/Sidebar.tsx`, `src/lib/navigation.ts`
- **Features**: Collapsible sections, active state highlighting, scroll area, mobile drawer integration.
- **Dependencies**: Task 1.1
- **Parallelizable**: YES (with Header)
- **Complexity**: Medium
- **Success Criteria**:
  - [ ] Expands/collapses sections
  - [ ] Highlights current page based on route
  - [ ] Smooth animation (Framer Motion)
  - [ ] Mobile drawer works

#### Task 1.4: Mobile Bottom Navigation
- **Deliverable**: `src/components/layout/MobileNav.tsx`
- **Features**: Fixed bottom bar (Home, Search, Bookmarks, Menu) visible only on mobile.
- **Dependencies**: Task 1.1
- **Parallelizable**: YES (with Header/Sidebar)
- **Complexity**: Small
- **Success Criteria**:
  - [ ] Visible only on screens < 768px
  - [ ] Links navigate correctly
  - [ ] Active state indication

### Phase 2: Article Experience Components (Week 1-2)
*Focus: The core reading experience and MDX rendering.*

#### Task 2.1: MDX Rendering Setup
- **Deliverable**: `src/components/mdx/MDXComponents.tsx`, `src/app/docs/[...slug]/page.tsx`
- **Features**: Map HTML elements to custom styled components (H1-H6, P, UL, OL, Blockquote).
- **Dependencies**: Phase 1
- **Parallelizable**: NO
- **Complexity**: Medium
- **Success Criteria**:
  - [ ] MDX files render correctly
  - [ ] Typography follows design system
  - [ ] Responsive text sizing

#### Task 2.2: Enhanced Code Blocks
- **Deliverable**: `src/components/mdx/CodeBlock.tsx`
- **Features**: Syntax highlighting (rehype-highlight/prism), copy to clipboard button, language badge.
- **Dependencies**: Task 2.1
- **Parallelizable**: YES (with Video/Diagrams)
- **Complexity**: Medium
- **Success Criteria**:
  - [ ] Syntax colors visible in dark/light mode
  - [ ] Copy button works
  - [ ] Language label displayed

#### Task 2.3: Table of Contents (Floating)
- **Deliverable**: `src/components/article/TableOfContents.tsx`
- **Features**: Generates from headings, highlights active section on scroll, smooth scroll on click.
- **Dependencies**: Task 2.1
- **Parallelizable**: YES
- **Complexity**: Medium
- **Success Criteria**:
  - [ ] Updates active link while scrolling
  - [ ] Smooth scrolls to section
  - [ ] Hidden on mobile/tablet

#### Task 2.4: Rich Media Components
- **Deliverable**: `src/components/mdx/VideoEmbed.tsx`, `src/components/mdx/Mermaid.tsx`
- **Features**: YouTube/Vimeo wrapper, Mermaid.js diagram renderer.
- **Dependencies**: Task 2.1
- **Parallelizable**: YES
- **Complexity**: Medium
- **Success Criteria**:
  - [ ] Video creates correct aspect ratio iframe
  - [ ] Mermaid text renders as SVG diagram

#### Task 2.5: Article Utilities (Breadcrumbs, Reading Time, Progress)
- **Deliverable**: `src/components/article/ArticleHeader.tsx`, `src/components/ui/Breadcrumbs.tsx`, `src/components/ui/ScrollProgress.tsx`
- **Features**: Path navigation, estimated time calculation, top progress bar.
- **Dependencies**: Task 2.1
- **Parallelizable**: YES
- **Complexity**: Small
- **Success Criteria**:
  - [ ] Breadcrumbs match URL structure
  - [ ] Progress bar fills on scroll

### Phase 3: Homepage & Discovery (Week 2)
*Focus: Landing page and search functionality.*

#### Task 3.1: Animated Hero Section
- **Deliverable**: `src/components/home/Hero.tsx`
- **Features**: Animated background (particles/gradient), dynamic text, CTA buttons.
- **Dependencies**: Phase 1
- **Parallelizable**: YES
- **Complexity**: Medium
- **Success Criteria**:
  - [ ] "Wow" factor animation
  - [ ] Responsive text/layout

#### Task 3.2: Learning Paths Grid
- **Deliverable**: `src/components/home/LearningPaths.tsx`, `src/components/ui/PathCard.tsx`
- **Features**: Grid of tracks (Beginner, Advanced, etc.) with progress visuals (mocked or local).
- **Dependencies**: None
- **Parallelizable**: YES
- **Complexity**: Small
- **Success Criteria**:
  - [ ] Responsive grid (1 col mobile, 3 col desktop)
  - [ ] Hover effects on cards

#### Task 3.3: Client-Side Search (Command Menu)
- **Deliverable**: `src/components/search/CommandMenu.tsx`, `src/lib/searchIndex.ts`
- **Features**: Global CMD+K menu, fuzzy search of article titles/headings.
- **Dependencies**: Content (needs content to search)
- **Parallelizable**: YES
- **Complexity**: Large
- **Success Criteria**:
  - [ ] Opens on CMD+K or button click
  - [ ] Filters results instantly
  - [ ] Navigates to article on selection

### Phase 4: Content Creation (Weeks 3-4)
*Focus: Writing and structuring the 50+ articles.*

#### Task 4.1: Section 6 - Advanced AI Tools
- **Deliverable**: `content/docs/06-advanced-tools/*.mdx` (7 files)
- **Topics**: OpenCode, Claude Projects, Cursor vs Windsurf, Custom GPTs, Adv Prompting, Context, Multi-Agent.
- **Complexity**: Medium (Content Writing)

#### Task 4.2: Section 7 - Coding Patterns
- **Deliverable**: `content/docs/07-coding-patterns/*.mdx` (7 files)
- **Topics**: Bottom-Up, Top-Down, Conversational, Declarative, Smart Patching, AI Code Review, AI Testing.
- **Complexity**: Medium

#### Task 4.3: Section 8 - Real-World Case Studies
- **Deliverable**: `content/docs/08-case-studies/*.mdx` (7 files)
- **Topics**: SaaS in a week, E-commerce, React Native App, Analytics Dashboard, Chrome Ext, API Integration, Migration.
- **Complexity**: High (Requires code examples)

#### Task 4.4: Section 9 - Security & Best Practices
- **Deliverable**: `content/docs/09-security/*.mdx` (7 files)
- **Topics**: Prompt Injection, Review Checklist, Performance, A11y, AI SEO, Env Vars, Error Handling.
- **Complexity**: Medium

#### Task 4.5: Section 10 - Community & Resources
- **Deliverable**: `content/docs/10-community/*.mdx` (7 files)
- **Topics**: Contribution Guide, FAQ, Glossary, Free Resources, Communities, YouTube Channels, Books.
- **Complexity**: Small

#### Task 4.6: Section 11 - Custom AI
- **Deliverable**: `content/docs/11-custom-ai/*.mdx` (7 files)
- **Topics**: Fine-tuning, RAG, Vector DBs, LangChain, Prompt Caching, Local LLMs, AI Agents Arch.
- **Complexity**: High

#### Task 4.7: Section 12 - Hands-On Projects
- **Deliverable**: `content/docs/12-projects/*.mdx` (7 files)
- **Topics**: Chatbot, Blog Platform, Task Manager, Image Gallery, Real-time Chat, Video Platform, Code Assistant.
- **Complexity**: High (Project guides)

#### Task 4.8: Section 13 - Productivity Tools
- **Deliverable**: `content/docs/13-productivity/*.mdx` (7 files)
- **Topics**: VSCode Setup, Terminal/Shell, Git Workflows, Project Mgmt, Time Mgmt, Automation, AI Docs.
- **Complexity**: Medium

### Phase 5: Polish & Optimization (Week 4)

#### Task 5.1: SEO & Metadata
- **Deliverable**: `src/app/layout.tsx`, `sitemap.ts`, `robots.ts`
- **Features**: Dynamic title/description per page, OpenGraph images, JSON-LD, Sitemap generation.
- **Dependencies**: Content
- **Complexity**: Medium
- **Success Criteria**:
  - [ ] All pages have unique titles
  - [ ] Social share cards working
  - [ ] Perfect Lighthouse SEO score

#### Task 5.2: LocalStorage Features (Bookmarks/History)
- **Deliverable**: `src/hooks/useBookmarks.ts`, `src/hooks/useHistory.ts`
- **Features**: Save article IDs to local storage, render in Sidebar/Mobile Nav.
- **Dependencies**: Sidebar
- **Complexity**: Medium
- **Success Criteria**:
  - [ ] Bookmarking an article persists on refresh
  - [ ] Recently viewed list updates automatically

#### Task 5.3: Performance & PWA
- **Deliverable**: `next.config.mjs`, `manifest.json`
- **Features**: Image optimization, dynamic imports, service worker (optional/simple).
- **Dependencies**: All Components
- **Complexity**: Medium
- **Success Criteria**:
  - [ ] Lighthouse Performance > 90
  - [ ] Installable on mobile (manifest exists)

## Dependencies Graph
1. **Foundation (1.1)** -> All other UI tasks
2. **MDX Setup (2.1)** -> Content Creation (4.x), Search (3.3)
3. **Content Creation (4.x)** -> SEO (5.1), Search Indexing (3.3)

## File Structure
```
vibe-wiki/
├── content/
│   ├── 06-advanced-tools/
│   ├── ...
│   └── 13-productivity/
├── public/
│   ├── images/
│   └── manifest.json
├── src/
│   ├── app/
│   │   ├── docs/
│   │   │   └── [...slug]/
│   │   │       └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── article/
│   │   │   ├── ArticleHeader.tsx
│   │   │   ├── TableOfContents.tsx
│   │   │   └── ...
│   │   ├── home/
│   │   │   ├── Hero.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ...
│   │   ├── mdx/
│   │   │   ├── CodeBlock.tsx
│   │   │   └── ...
│   │   └── ui/
│   │       ├── button.tsx
│   │       └── ...
│   ├── lib/
│   │   ├── navigation.ts
│   │   └── utils.ts
│   └── hooks/
│       ├── use-bookmarks.ts
│       └── ...
└── ...
```

## Success Metrics
- **Verification**: Run `npm run build` with no errors.
- **Performance**: Lighthouse score > 90 in all categories.
- **Completeness**: All 8 new sections created with MDX files (even if placeholder content initially).
- **Mobile**: Bottom nav appears on <768px, Sidebar turns into drawer.
- **Interaction**: Search finds articles, Dark mode persists, Bookmarks save.
