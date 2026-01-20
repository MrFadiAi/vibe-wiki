# Product Requirements Document (PRD)
# SVG Diagram Integration for Vibe Wiki

**Document Version:** 1.0  
**Created:** January 2025  
**Status:** Draft  
**Owner:** Vibe Wiki Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Goals & Objectives](#goals--objectives)
3. [Content Mapping Table](#content-mapping-table)
4. [Technical Implementation](#technical-implementation)
5. [Design & UX Standards](#design--ux-standards)
6. [Arabic Localization Strategy](#arabic-localization-strategy)
7. [Implementation Phases](#implementation-phases)
8. [Success Criteria](#success-criteria)
9. [Risks & Mitigations](#risks--mitigations)
10. [Appendices](#appendices)

---

## Executive Summary

This PRD outlines the integration of **55 SVG diagrams** into the Vibe Wiki articles. These diagrams cover CLI tools (Claude, Copilot, OpenCode), workflow comparisons, and getting started guides. The integration aims to enhance visual education, improve user engagement, and provide Arabic-localized content for our primary audience.

### Key Deliverables

- Map all 55 SVGs to existing or new wiki articles
- Extend the markdown/content system to support inline diagrams
- Implement Arabic captions and accessibility features
- Establish design standards for responsive, lazy-loaded diagrams

---

## Goals & Objectives

### Primary Goals

| Goal | Description | Success Metric |
|------|-------------|----------------|
| **Visual Education** | Transform text-heavy articles into visually-rich learning experiences | 80% of core articles contain at least 1 diagram |
| **User Engagement** | Increase time-on-page and reduce bounce rate through interactive visuals | +25% avg. session duration |
| **Arabic-First Experience** | Provide RTL-optimized diagrams with Arabic captions | 100% of diagrams have Arabic alt-text |
| **Accessibility** | Ensure all diagrams are screen-reader compatible | WCAG 2.1 AA compliance |

### Secondary Goals

- **Content Discoverability**: Use diagrams as entry points to related articles
- **Knowledge Retention**: Visual aids improve concept retention by ~65%
- **SEO Enhancement**: Properly tagged images improve search visibility
- **Print-Friendly**: SVGs scale perfectly for documentation exports

### Non-Goals

- Animated/interactive SVG components (future phase)
- User-generated diagram uploads
- Real-time diagram editing

---

## Content Mapping Table

### Legend

| Symbol | Meaning |
|--------|---------|
| **[E]** | Existing article |
| **[N]** | New article to be created |
| **[P]** | Priority: High (1), Medium (2), Low (3) |

---

### 1. Claude CLI Diagrams (9 SVGs)

| # | SVG Filename | Target Article | Status | Priority | Arabic Caption |
|---|--------------|----------------|--------|----------|----------------|
| 1 | `cli-claude-comparison.svg` | `[N]` claude-cli-overview | New | P1 | مقارنة Claude CLI مع الأدوات الأخرى |
| 2 | `cli-claude-architecture.svg` | `[N]` claude-cli-overview | New | P1 | البنية التقنية لـ Claude CLI |
| 3 | `cli-claude-pricing-tiers.svg` | `[N]` claude-cli-pricing | New | P2 | مستويات تسعير Claude CLI |
| 4 | `cli-claude-best-practices.svg` | `[N]` claude-cli-best-practices | New | P2 | أفضل الممارسات لاستخدام Claude CLI |
| 5 | `cli-claude-use-cases.svg` | `[N]` claude-cli-overview | New | P1 | حالات استخدام Claude CLI |
| 6 | `cli-claude-feature-icons.svg` | `[N]` claude-cli-features | New | P2 | أيقونات ميزات Claude CLI |
| 7 | `cli-claude-command-flow.svg` | `[N]` claude-cli-commands | New | P1 | تدفق أوامر Claude CLI |
| 8 | `cli-claude-installation-checklist.svg` | `[E]` prep-your-machine | Existing | P1 | قائمة تثبيت Claude CLI |
| 9 | `cli-claude-terminal-flow.svg` | `[E]` the-terminal | Existing | P1 | تدفق الطرفية مع Claude CLI |

**New Articles Required:** 5 articles for Claude CLI section

---

### 2. Copilot CLI Diagrams (6 SVGs)

| # | SVG Filename | Target Article | Status | Priority | Arabic Caption |
|---|--------------|----------------|--------|----------|----------------|
| 10 | `cli-copilot-pricing.svg` | `[N]` copilot-cli-pricing | New | P2 | تسعير GitHub Copilot CLI |
| 11 | `cli-copilot-alias-config.svg` | `[N]` copilot-cli-configuration | New | P2 | إعداد الاختصارات في Copilot CLI |
| 12 | `cli-copilot-use-cases.svg` | `[N]` copilot-cli-overview | New | P1 | حالات استخدام Copilot CLI |
| 13 | `cli-copilot-command-tree.svg` | `[N]` copilot-cli-commands | New | P1 | شجرة أوامر Copilot CLI |
| 14 | `cli-copilot-installation.svg` | `[E]` prep-your-machine | Existing | P1 | خطوات تثبيت Copilot CLI |
| 15 | `cli-copilot-workflow.svg` | `[N]` copilot-cli-overview | New | P1 | سير عمل Copilot CLI |

**New Articles Required:** 4 articles for Copilot CLI section

---

### 3. OpenCode CLI Diagrams (14 SVGs)

| # | SVG Filename | Target Article | Status | Priority | Arabic Caption |
|---|--------------|----------------|--------|----------|----------------|
| 16 | `cli-opencode-license-tiers.svg` | `[N]` opencode-cli-licensing | New | P2 | مستويات ترخيص OpenCode |
| 17 | `cli-opencode-use-cases.svg` | `[N]` opencode-cli-overview | New | P1 | حالات استخدام OpenCode CLI |
| 18 | `cli-opencode-comparison-matrix.svg` | `[N]` opencode-cli-comparison | New | P1 | مصفوفة مقارنة OpenCode |
| 19 | `cli-opencode-local-vs-cloud.svg` | `[N]` opencode-cli-deployment | New | P2 | المحلي مقابل السحابي في OpenCode |
| 20 | `cli-opencode-multifile-workflow.svg` | `[N]` opencode-cli-workflows | New | P1 | سير عمل الملفات المتعددة |
| 21 | `cli-opencode-advanced-features.svg` | `[N]` opencode-cli-advanced | New | P2 | الميزات المتقدمة في OpenCode |
| 22 | `cli-opencode-editor-integration.svg` | `[E]` the-editor | Existing | P1 | تكامل OpenCode مع المحررات |
| 23 | `cli-opencode-context-sources.svg` | `[N]` opencode-cli-context | New | P1 | مصادر السياق في OpenCode |
| 24 | `cli-opencode-workflow-state.svg` | `[N]` opencode-cli-workflows | New | P2 | حالات سير العمل في OpenCode |
| 25 | `cli-opencode-agent-collaboration.svg` | `[N]` opencode-cli-agents | New | P1 | تعاون الوكلاء في OpenCode |
| 26 | `cli-opencode-feature-map.svg` | `[N]` opencode-cli-overview | New | P1 | خريطة ميزات OpenCode |
| 27 | `cli-opencode-config-layers.svg` | `[N]` opencode-cli-configuration | New | P2 | طبقات الإعدادات في OpenCode |
| 28 | `cli-opencode-installation-options.svg` | `[E]` prep-your-machine | Existing | P1 | خيارات تثبيت OpenCode |
| 29 | `cli-opencode-architecture.svg` | `[N]` opencode-cli-overview | New | P1 | البنية التقنية لـ OpenCode |

**New Articles Required:** 9 articles for OpenCode CLI section

---

### 4. CLI Overview Diagrams (3 SVGs)

| # | SVG Filename | Target Article | Status | Priority | Arabic Caption |
|---|--------------|----------------|--------|----------|----------------|
| 30 | `cli-overview-comparison-matrix.svg` | `[N]` cli-tools-comparison | New | P1 | مصفوفة مقارنة أدوات CLI |
| 31 | `cli-overview-ecosystem-landscape.svg` | `[N]` cli-ecosystem-overview | New | P1 | منظومة أدوات CLI للذكاء الاصطناعي |
| 32 | `cli-overview-architecture.svg` | `[N]` cli-ecosystem-overview | New | P1 | البنية العامة لأدوات CLI |

**New Articles Required:** 2 articles for CLI Overview section

---

### 5. Comparison Diagrams (7 SVGs)

| # | SVG Filename | Target Article | Status | Priority | Arabic Caption |
|---|--------------|----------------|--------|----------|----------------|
| 33 | `comparison-use-case-matrix.svg` | `[E]` cursor-vs-windsurf | Existing | P1 | مصفوفة حالات الاستخدام |
| 34 | `comparison-pricing-visual.svg` | `[E]` cursor-vs-windsurf | Existing | P1 | مقارنة الأسعار البصرية |
| 35 | `comparison-ux-grid.svg` | `[E]` cursor-vs-windsurf | Existing | P2 | شبكة مقارنة تجربة المستخدم |
| 36 | `comparison-radar-chart.svg` | `[E]` cursor-vs-windsurf | Existing | P2 | مخطط رادار للمقارنة الشاملة |
| 37 | `comparison-quality-barchart.svg` | `[N]` ai-tools-quality-comparison | New | P2 | مخطط جودة الأدوات |
| 38 | `comparison-feature-matrix.svg` | `[E]` cursor-vs-windsurf | Existing | P1 | مصفوفة مقارنة الميزات |
| 39 | `comparison-decision-tree.svg` | `[E]` cursor-vs-windsurf | Existing | P1 | شجرة القرار لاختيار الأداة |

**New Articles Required:** 1 article for additional comparison

---

### 6. Getting Started Diagrams (5 SVGs)

| # | SVG Filename | Target Article | Status | Priority | Arabic Caption |
|---|--------------|----------------|--------|----------|----------------|
| 40 | `getting-started-learning-paths.svg` | `[E]` what-is-vibe-coding | Existing | P1 | مسارات التعلم للبرمجة بالإحساس |
| 41 | `getting-started-ai-workflow.svg` | `[E]` hello-world-with-ai | Existing | P1 | سير عمل الذكاء الاصطناعي |
| 42 | `getting-started-installation-flow.svg` | `[E]` prep-your-machine | Existing | P1 | خطوات تثبيت البيئة |
| 43 | `getting-started-decision-tree.svg` | `[E]` the-vibe-stack | Existing | P1 | شجرة قرار اختيار الأدوات |
| 44 | `getting-started-timeline-flow.svg` | `[E]` what-is-vibe-coding | Existing | P1 | الجدول الزمني للبدء |

**New Articles Required:** 0 (all map to existing articles)

---

### 7. Workflow Diagrams (4 SVGs)

| # | SVG Filename | Target Article | Status | Priority | Arabic Caption |
|---|--------------|----------------|--------|----------|----------------|
| 45 | `workflow-context-awareness.svg` | `[E]` conversational-coding | Existing | P1 | الوعي بالسياق في البرمجة |
| 46 | `workflow-multi-agent.svg` | `[N]` multi-agent-workflows | New | P1 | سير عمل الوكلاء المتعددين |
| 47 | `workflow-traditional-coding.svg` | `[E]` what-is-vibe-coding | Existing | P2 | البرمجة التقليدية مقابل الإحساس |
| 48 | `workflow-vibecoding.svg` | `[E]` what-is-vibe-coding | Existing | P1 | سير عمل البرمجة بالإحساس |

**New Articles Required:** 1 article for multi-agent workflows

---

### Summary: New Articles Required

| Section | New Articles Count | Article Slugs |
|---------|-------------------|---------------|
| Claude CLI | 5 (✅ 5/5 complete) | `claude-cli-overview`, `claude-cli-pricing`, `claude-cli-best-practices`, `claude-cli-features`, `claude-cli-commands` |
| Copilot CLI | 4 | `copilot-cli-overview`, `copilot-cli-pricing`, `copilot-cli-configuration`, `copilot-cli-commands` |
| OpenCode CLI | 9 | `opencode-cli-overview`, `opencode-cli-licensing`, `opencode-cli-comparison`, `opencode-cli-deployment`, `opencode-cli-workflows`, `opencode-cli-advanced`, `opencode-cli-context`, `opencode-cli-agents`, `opencode-cli-configuration` |
| CLI Overview | 2 | `cli-tools-comparison`, `cli-ecosystem-overview` |
| Comparisons | 1 | `ai-tools-quality-comparison` |
| Workflows | 1 | `multi-agent-workflows` |
| **Total** | **22** (✅ 5/22 complete) | |

---

## Technical Implementation

### 4.1 Current Architecture

The wiki uses:
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Arabic (RTL)** as the primary language
- **wiki-content.ts** for article storage (inline content)

### 4.2 SVGDiagram Component

The existing `SVGDiagram` component (`src/components/wiki/SVGDiagram.tsx`) supports:

```typescript
interface SVGDiagramProps {
  diagram: SVGDiagramType;
  className?: string;
  priority?: boolean; // For above-the-fold images
}

interface SVGDiagramType {
  src: string;
  alt: string;
  caption?: string;
  maxWidth?: string;
  title?: string;
  description?: string;
}
```

**Key Features:**
- Lazy loading via Next.js Image
- Blur placeholder during load
- Dark mode shadow support
- Responsive sizing
- Accessibility (title, description, sr-only elements)

### 4.3 Content Integration Strategy

#### Option A: Extended WikiArticle Interface (Recommended)

Extend the `WikiArticle` interface to support diagrams:

```typescript
// src/data/wiki-content.ts

export interface WikiArticle {
  slug: string;
  title: string;
  section: string;
  content: string;
  codeBlocks?: { language: string; code: string; title?: string }[];
  // NEW: Diagram support
  diagrams?: {
    id: string;           // Unique identifier for positioning
    filename: string;     // SVG filename in /public/images/diagrams/
    alt: string;          // Arabic alt text
    caption: string;      // Arabic caption
    position: 'inline' | 'before-section' | 'after-section';
    sectionHeading?: string; // For positioned placement
    priority?: boolean;   // For above-the-fold
  }[];
}
```

#### Option B: Markdown-Based Embedding

Use a custom Markdown syntax for inline diagrams:

```markdown
## تثبيت الأدوات

قبل البدء، تحتاج إلى تثبيت الأدوات التالية:

:::diagram[getting-started-installation-flow]
alt: خطوات تثبيت البيئة
caption: مخطط يوضح خطوات تثبيت بيئة التطوير
:::

1. تثبيت Node.js
2. تثبيت Git
```

**Implementation:** Create a custom Markdown parser/renderer that converts `:::diagram` blocks to `<SVGDiagram />` components.

### 4.4 Diagram Registry

Create a centralized registry for all diagram metadata:

```typescript
// src/data/diagram-registry.ts

export interface DiagramEntry {
  filename: string;
  category: 'claude-cli' | 'copilot-cli' | 'opencode' | 'comparison' | 'workflow' | 'getting-started' | 'cli-overview';
  titleAr: string;
  altAr: string;
  captionAr: string;
  titleEn?: string;
  altEn?: string;
  captionEn?: string;
  relatedArticles: string[];
  priority: 1 | 2 | 3;
}

export const diagramRegistry: DiagramEntry[] = [
  {
    filename: 'cli-claude-comparison.svg',
    category: 'claude-cli',
    titleAr: 'مقارنة Claude CLI',
    altAr: 'رسم بياني يقارن بين Claude CLI والأدوات المنافسة',
    captionAr: 'مقارنة شاملة بين Claude CLI وأدوات سطر الأوامر الأخرى للذكاء الاصطناعي',
    relatedArticles: ['claude-cli-overview', 'cli-tools-comparison'],
    priority: 1,
  },
  // ... 47 more entries
];
```

### 4.5 Article Rendering Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    WikiArticle Data                         │
│  { slug, title, content, diagrams: [...] }                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   ArticleRenderer                           │
│  1. Parse Markdown content                                  │
│  2. Identify diagram insertion points                       │
│  3. Merge diagram data from registry                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Rendered Output                           │
│  <article>                                                  │
│    <h2>مقدمة</h2>                                           │
│    <p>...</p>                                               │
│    <SVGDiagram diagram={...} />                             │
│    <p>...</p>                                               │
│  </article>                                                 │
└─────────────────────────────────────────────────────────────┘
```

### 4.6 Recommended File Structure

```
src/
├── components/
│   └── wiki/
│       ├── SVGDiagram.tsx          # Existing - no changes needed
│       ├── ArticleRenderer.tsx     # New - handles diagram insertion
│       └── DiagramPlaceholder.tsx  # New - loading state
├── data/
│   ├── wiki-content.ts             # Extend with diagrams array
│   └── diagram-registry.ts         # New - centralized metadata
├── lib/
│   └── svg-utils.ts                # Existing - add helper functions
public/
└── images/
    └── diagrams/
        ├── cli-claude-*.svg        # 9 files
        ├── cli-copilot-*.svg       # 6 files
        ├── cli-opencode-*.svg      # 14 files
        ├── cli-overview-*.svg      # 3 files
        ├── comparison-*.svg        # 7 files
        ├── getting-started-*.svg   # 5 files
        └── workflow-*.svg          # 4 files (48 total, 7 additional for user's list)
```

---

## Design & UX Standards

### 5.1 Visual Design

#### Diagram Container Styling

```css
/* Base container */
.svg-diagram-container {
  margin: 2rem auto;
  padding: 1rem;
  background: rgba(26, 26, 46, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(0, 212, 255, 0.1);
}

/* Dark mode enhancement */
.dark .svg-diagram-container {
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.1);
}

/* RTL caption alignment */
[dir="rtl"] .svg-diagram-caption {
  text-align: right;
}
```

#### Width Constraints

| Diagram Type | Max Width | Tailwind Class |
|--------------|-----------|----------------|
| Full-width diagrams | 100% | `max-w-full` |
| Standard diagrams | 800px | `max-w-3xl` |
| Comparison charts | 1000px | `max-w-5xl` |
| Icon sets | 600px | `max-w-2xl` |
| Decision trees | 100% | `max-w-full` |

### 5.2 Responsive Behavior

```typescript
// Responsive sizing in SVGDiagram component
sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1200px) 80vw, 800px"
```

| Breakpoint | Behavior |
|------------|----------|
| Mobile (<640px) | Full viewport width, vertical scrolling if needed |
| Tablet (640-1024px) | 90% container width |
| Desktop (>1024px) | Fixed max-width based on diagram type |

### 5.3 Lazy Loading Strategy

```typescript
// Priority loading for above-the-fold diagrams
const priorityDiagrams = [
  'getting-started-timeline-flow.svg',
  'what-is-vibe-coding-hero.svg',
];

// Use priority={true} for these
<SVGDiagram diagram={diagram} priority={isPriority} />
```

**Loading behavior:**
1. First 2 diagrams in viewport: `loading="eager"`, `priority={true}`
2. All other diagrams: `loading="lazy"`, blur placeholder

### 5.4 Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Alt text | Required for all diagrams (Arabic) |
| Title | Displayed on hover, matches alt |
| Description | Hidden screen-reader text for complex diagrams |
| Keyboard focus | Focusable links for diagrams with detail views |
| Color contrast | All text elements meet WCAG AA (4.5:1) |
| Motion | Respect `prefers-reduced-motion` if animated |

### 5.5 Print Styles

```css
@media print {
  .svg-diagram-container {
    break-inside: avoid;
    page-break-inside: avoid;
    box-shadow: none;
    border: 1px solid #ccc;
  }
  
  .svg-diagram {
    max-width: 100%;
    height: auto;
  }
}
```

---

## Arabic Localization Strategy

### 6.1 Text Content

All diagram-related text must be in Arabic:

| Field | Purpose | Example |
|-------|---------|---------|
| `alt` | Screen reader, SEO | رسم بياني يوضح بنية Claude CLI |
| `caption` | Visible under diagram | الشكل 1: البنية التقنية لـ Claude CLI |
| `title` | Hover tooltip | مخطط البنية التقنية |
| `description` | Extended screen reader content | هذا الرسم البياني يوضح كيفية تفاعل المكونات... |

### 6.2 Caption Numbering

Use Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) for diagram numbering:

```typescript
function formatDiagramNumber(num: number): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(d => arabicNumerals[parseInt(d)]).join('');
}

// Output: "الشكل ٣: مخطط سير العمل"
```

### 6.3 SVG Internal Text

For diagrams containing text:
- **Option A:** Create Arabic variants of SVGs with embedded Arabic text
- **Option B (Recommended):** Use language-neutral icons/symbols with external captions
- **Option C:** Apply CSS transforms for RTL layout where needed

### 6.4 RTL Layout Considerations

```css
/* Diagram container RTL adjustments */
[dir="rtl"] .svg-diagram-container {
  /* Flip horizontal diagrams if they show left-to-right flow */
}

/* Caption positioning */
[dir="rtl"] figcaption {
  text-align: right;
  direction: rtl;
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)

**Scope:** Core infrastructure and highest-priority diagrams

| Task | Est. Hours | Owner |
|------|-----------|-------|
| Extend WikiArticle interface | 2h | Dev |
| Create diagram-registry.ts | 4h | Dev |
| Update ArticleRenderer | 4h | Dev |
| Integrate 10 P1 Getting Started diagrams | 3h | Content |
| Add Arabic metadata for Phase 1 diagrams | 2h | Content |
| QA and testing | 2h | QA |

**Deliverables:**
- [x] 10 diagrams integrated (Getting Started + Workflow)
- [x] Diagram registry with full Arabic metadata
- [x] Updated article rendering pipeline

### Phase 2: CLI Tools (Week 2)

**Scope:** Claude CLI, Copilot CLI articles and diagrams

| Task | Est. Hours | Owner |
|------|-----------|-------|
| Create 9 new Claude CLI articles (stubs) | 6h | Content |
| Integrate 9 Claude CLI diagrams | 3h | Dev |
| Create 4 new Copilot CLI articles (stubs) | 4h | Content |
| Integrate 6 Copilot CLI diagrams | 2h | Dev |
| Arabic localization review | 3h | Content |
| QA and testing | 2h | QA |

**Deliverables:**
- [x] 5 new Claude CLI articles (5/5 complete: claude-cli-overview, claude-cli-commands, claude-cli-pricing, claude-cli-best-practices, claude-cli-features)
- [x] 4 new Copilot CLI articles (4/4 complete: copilot-cli-overview, copilot-cli-commands, copilot-cli-pricing, copilot-cli-configuration)
- [x] 15 diagrams integrated (9 Claude CLI + 6 Copilot CLI)

### Phase 3: OpenCode & Comparisons (Week 3)

**Scope:** OpenCode CLI, comparison diagrams, overview section

| Task | Est. Hours | Owner |
|------|-----------|-------|
| Create 9 new OpenCode articles (stubs) | 8h | Content |
| Integrate 14 OpenCode diagrams | 4h | Dev |
| Create 3 new overview/comparison articles | 4h | Content |
| Integrate 10 comparison/overview diagrams | 3h | Dev |
| Arabic localization review | 3h | Content |
| QA and testing | 3h | QA |

**Deliverables:**
- [ ] 9 new OpenCode articles
- [ ] 3 new overview articles
- [x] 14 OpenCode diagrams integrated (into opencode-comprehensive-guide)

### Phase 4: Polish & Documentation (Week 4)

**Scope:** Final integration, documentation, optimization

| Task | Est. Hours | Owner |
|------|-----------|-------|
| Remaining diagram integrations | 4h | Dev |
| Performance optimization (lazy loading audit) | 3h | Dev |
| Accessibility audit (WCAG 2.1 AA) | 4h | QA |
| Documentation updates | 3h | Content |
| Cross-browser testing | 2h | QA |
| Final review and sign-off | 2h | Team |

**Deliverables:**
- [ ] All 48+ diagrams integrated
- [ ] 22 new articles created (✅ 5/22 complete - Claude CLI individual articles)
- [ ] Accessibility compliance report
- [ ] Updated documentation

---

## Success Criteria

### Quantitative Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Diagrams integrated | 48/48 (100%) | Audit against registry |
| Articles with diagrams | 80% of core articles | Content audit |
| Lazy loading implemented | 100% of below-fold diagrams | Lighthouse audit |
| Arabic alt text coverage | 100% | Automated scan |
| Lighthouse accessibility score | ≥90 | Lighthouse CI |
| Largest Contentful Paint | <2.5s with diagrams | Lighthouse |

### Qualitative Criteria

| Criterion | Definition of Done |
|-----------|-------------------|
| Visual consistency | All diagrams follow design system guidelines |
| RTL compatibility | Captions and layouts display correctly in Arabic |
| Responsive display | Diagrams render correctly on mobile, tablet, desktop |
| Accessibility | Screen readers announce diagrams correctly |
| Print fidelity | Diagrams print at high quality |

### Acceptance Checklist

- [ ] All 48 diagrams are embedded in appropriate articles
- [ ] 22 new article stubs are created and linked
- [ ] All diagrams have Arabic alt text, caption, and title
- [ ] SVGDiagram component renders without errors
- [ ] Lazy loading works correctly (verified via DevTools)
- [ ] No accessibility violations in axe-core audit
- [ ] Diagrams display correctly on: Chrome, Firefox, Safari, Edge
- [ ] Mobile responsive behavior verified on iOS and Android
- [ ] Print preview shows diagrams correctly

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| SVG files contain non-RTL text | Medium | Medium | Create Arabic variants or use icons |
| Performance degradation from 48+ images | Medium | High | Aggressive lazy loading, LQIP placeholders |
| Inconsistent diagram styling | Low | Medium | Create diagram style guide |
| Missing Arabic translations | Low | High | Translation review checkpoint before each phase |
| Browser compatibility issues | Low | Medium | Test matrix across major browsers |
| Content overload (too many diagrams per article) | Medium | Medium | Limit to 3-4 diagrams per article |

---

## Appendices

### Appendix A: Complete SVG Inventory

```
Total SVGs: 48 files

By Category:
├── cli-claude-* (9)
├── cli-copilot-* (6)
├── cli-opencode-* (14)
├── cli-overview-* (3)
├── comparison-* (7)
├── getting-started-* (5)
└── workflow-* (4)
```

### Appendix B: New Wiki Section Structure

```
wikiContent: WikiSection[] = [
  // Existing sections...
  
  // NEW: CLI Tools Section
  {
    name: "8. أدوات سطر الأوامر (CLI Tools)",
    articles: [
      { slug: "cli-ecosystem-overview", ... },
      { slug: "cli-tools-comparison", ... },
    ]
  },
  
  // NEW: Claude CLI Subsection
  {
    name: "8.1 Claude CLI",
    articles: [
      { slug: "claude-cli-overview", ... },
      { slug: "claude-cli-commands", ... },
      { slug: "claude-cli-pricing", ... },
      { slug: "claude-cli-best-practices", ... },
      { slug: "claude-cli-features", ... },
    ]
  },
  
  // NEW: Copilot CLI Subsection
  {
    name: "8.2 Copilot CLI",
    articles: [
      { slug: "copilot-cli-overview", ... },
      { slug: "copilot-cli-commands", ... },
      { slug: "copilot-cli-pricing", ... },
      { slug: "copilot-cli-configuration", ... },
    ]
  },
  
  // NEW: OpenCode CLI Subsection
  {
    name: "8.3 OpenCode CLI",
    articles: [
      { slug: "opencode-cli-overview", ... },
      { slug: "opencode-cli-comparison", ... },
      { slug: "opencode-cli-workflows", ... },
      { slug: "opencode-cli-agents", ... },
      { slug: "opencode-cli-context", ... },
      { slug: "opencode-cli-configuration", ... },
      { slug: "opencode-cli-licensing", ... },
      { slug: "opencode-cli-deployment", ... },
      { slug: "opencode-cli-advanced", ... },
    ]
  },
  
  // NEW: Multi-Agent Workflows
  {
    name: "9. سير العمل المتقدم (Advanced Workflows)",
    articles: [
      { slug: "multi-agent-workflows", ... },
      { slug: "ai-tools-quality-comparison", ... },
    ]
  },
];
```

### Appendix C: Sample Diagram Integration Code

```typescript
// Example: Integrating diagrams into an article

import { SVGDiagram } from '@/components/wiki/SVGDiagram';
import { getDiagramByFilename } from '@/data/diagram-registry';

// In article component
const diagram = getDiagramByFilename('getting-started-timeline-flow.svg');

return (
  <article dir="rtl" lang="ar">
    <h1>ما هي البرمجة بالإحساس؟</h1>
    
    <p>البرمجة بالإحساس هي فن بناء البرمجيات...</p>
    
    {diagram && (
      <SVGDiagram
        diagram={{
          src: `/images/diagrams/${diagram.filename}`,
          alt: diagram.altAr,
          caption: diagram.captionAr,
          title: diagram.titleAr,
        }}
        priority={true}
      />
    )}
    
    <h2>الفلسفة</h2>
    <p>...</p>
  </article>
);
```

### Appendix D: Arabic Caption Style Guide

| Element | Format | Example |
|---------|--------|---------|
| Figure number | الشكل + Arabic numeral | الشكل ٣ |
| Colon | Arabic colon (full-width) | : |
| Caption text | Descriptive, 5-15 words | مخطط يوضح مراحل سير عمل البرمجة بالإحساس |
| Technical terms | Preserve English in parentheses | الطرفية (Terminal) |

**Example full caption:**
```
الشكل ٣: مخطط البنية التقنية لـ Claude CLI يوضح تفاعل المكونات الأساسية
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2025 | Vibe Wiki Team | Initial PRD |

---

**End of Document**
