# Design Decisions - Vibe Wiki PRD v2.0

## [2026-01-17] Architecture Decisions

### Tech Stack
- **Framework**: Next.js 15 App Router (keeping current version)
- **Styling**: Tailwind CSS v4 (already in use)
- **Dark Mode**: next-themes library with custom variant
- **Search**: Client-side with Fuse.js (no backend needed)
- **Diagrams**: Mermaid.js with client-side rendering
- **Content**: Stay with inline data model for now (no MDX migration yet - incremental)

### Excluded Features (per user request)
- User authentication/profiles
- Code playgrounds
- Quizzes/badges
- Discussion forums
- AI assistants (summarize, translate, TTS)
- API access

### Implementation Strategy
- Phase-based rollout (5 phases)
- Parallel agent delegation for UI work
- Content creation can happen alongside UI development
- Verify each phase before proceeding
