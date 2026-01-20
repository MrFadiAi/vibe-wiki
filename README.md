# Vibe Wiki

**Arabic (RTL) AI Coding Wiki - Your comprehensive guide to AI-assisted programming**

Vibe Wiki is an Arabic-language wiki dedicated to teaching modern AI-assisted programming techniques. Built with Next.js 14 and featuring 55+ interactive SVG diagrams, it provides comprehensive coverage of AI coding tools, CLI interfaces, and advanced workflows.

## Features

- **Arabic RTL Support**: Full right-to-left layout optimized for Arabic readers
- **55+ SVG Diagrams**: Interactive visualizations integrated throughout articles
- **Comprehensive Coverage**:
  - AI coding fundamentals (LLMs, prompt engineering)
  - CLI tools (Claude CLI, Copilot CLI, OpenCode CLI)
  - Advanced workflows (multi-agent systems, context management)
  - Tool comparisons and quality analysis
- **Accessibility First**: WCAG 2.1 AA compliant with full keyboard navigation
- **Performance Optimized**: Lazy loading, image optimization, and efficient rendering
- **Modern Stack**: Built with Next.js 14, TypeScript, Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Vitest
- **Linting**: ESLint
- **Accessibility**: WCAG 2.1 AA standards

## Project Structure

```
vibe-wiki/
├── app/                      # Next.js app router pages
│   ├── wiki/                # Wiki article routes
│   └── layout.tsx           # Root layout with RTL support
├── components/
│   └── wiki/
│       └── SVGDiagram.tsx   # Reusable diagram component
├── data/
│   ├── wiki-content.ts      # All wiki articles (20,000+ lines)
│   └── diagram-registry.ts  # Centralized diagram metadata
├── lib/
│   ├── accessibility-audit.ts  # WCAG compliance checker
│   └── markdown-renderer.ts    # Custom markdown parser
└── public/
    └── images/
        └── diagrams/         # 55+ SVG diagrams
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Wiki Content

### Article Categories

1. **Getting Started** (7 articles)
   - What is vibe coding, the vibe stack, machine setup
   - Terminal basics, Node.js setup, editor configuration
   - LLMs explained, prompt engineering, Git basics

2. **AI Coding Tools** (6 articles)
   - Conversational coding, tool comparisons
   - Cursor vs Windsurf, SaaS in a week
   - AI coding ecosystem overview

3. **Claude CLI** (6 articles)
   - Comprehensive guide, overview, pricing
   - Best practices, features, commands

4. **Copilot CLI** (5 articles)
   - Comprehensive guide, overview, commands
   - Pricing, configuration

5. **OpenCode CLI** (10 articles)
   - Comprehensive guide, overview, licensing
   - Comparison, deployment, workflows
   - Advanced features, context management
   - Multi-agent systems, configuration

6. **CLI Ecosystem** (3 articles)
   - Ecosystem overview, tools comparison
   - Quality comparison

7. **Advanced Workflows** (1 article)
   - Multi-agent workflows

### Diagram Integration

All 55+ SVG diagrams are:
- Integrated into relevant articles
- Fully accessible with Arabic alt text
- Lazy-loaded for performance
- Responsive across all screen sizes
- Print-friendly with high-quality scaling

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage
```

### Linting

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix
```

### Accessibility Audit

```bash
# Run accessibility audit
npm run audit:a11y

# Generate accessibility report
npm run audit:a11y:report
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Arabic Content**: All new content should be primarily in Arabic with English technical terms
2. **Diagram Integration**: Use the `SVGDiagram` component for all visualizations
3. **Accessibility**: All content must pass WCAG 2.1 AA standards
4. **Testing**: Include tests for new features and articles
5. **RTL Support**: Ensure all layouts work correctly in right-to-left mode

## Documentation

- **PRD**: See [PRD.md](./PRD.md) for detailed product requirements
- **Progress**: Track development in [`.ralphy/progress.txt`](./.ralphy/progress.txt)
- **Diagram Registry**: All diagram metadata in [`src/data/diagram-registry.ts`](./src/data/diagram-registry.ts)

## Performance

- **Lighthouse Score**: 90+ across all categories
- **Largest Contentful Paint**: <2.5s with diagrams
- **Arabic Alt Text Coverage**: 100%
- **Diagram Integration**: 48/48 (100%)
- **Articles with Diagrams**: 80%+ of core articles

## License

This project is proprietary software. All rights reserved.

## Support

For issues, questions, or feedback, please contact the Vibe Wiki team.

---

**Built with ❤️ for the Arabic-speaking developer community**
