/**
 * Article Stub Verification
 * Verifies that all required PRD articles exist with proper stub content
 */

import type { WikiArticle } from '@/types';

/**
 * The 22 required articles from the PRD (Section: Summary: New Articles Required)
 */
export const REQUIRED_ARTICLE_SLUGS = [
  // Claude CLI (5 articles)
  'claude-cli-overview',
  'claude-cli-pricing',
  'claude-cli-best-practices',
  'claude-cli-features',
  'claude-cli-commands',

  // Copilot CLI (4 articles)
  'copilot-cli-overview',
  'copilot-cli-pricing',
  'copilot-cli-configuration',
  'copilot-cli-commands',

  // OpenCode CLI (9 articles)
  'opencode-cli-overview',
  'opencode-cli-licensing',
  'opencode-cli-comparison',
  'opencode-cli-deployment',
  'opencode-cli-workflows',
  'opencode-cli-advanced',
  'opencode-cli-context',
  'opencode-cli-agents',
  'opencode-cli-configuration',

  // CLI Overview (2 articles)
  'cli-tools-comparison',
  'cli-ecosystem-overview',

  // Comparisons (1 article)
  'ai-tools-quality-comparison',

  // Workflows (1 article)
  'multi-agent-workflows',
] as const;

export type RequiredArticleSlug = (typeof REQUIRED_ARTICLE_SLUGS)[number];

/**
 * Minimum requirements for a valid article stub
 */
export interface ArticleStubRequirements {
  exists: boolean;
  hasTitle: boolean;
  hasContent: boolean;
  contentMinLength: number;
  hasSection: boolean;
  hasDiagrams: boolean;
  isLinked: boolean; // Has links to other wiki articles
}

/**
 * Check if an article meets minimum stub requirements
 */
export function verifyArticleStub(article: WikiArticle | undefined): ArticleStubRequirements {
  if (!article) {
    return {
      exists: false,
      hasTitle: false,
      hasContent: false,
      contentMinLength: 0,
      hasSection: false,
      hasDiagrams: false,
      isLinked: false,
    };
  }

  const hasTitle = Boolean(article.title?.trim());
  const hasContent = Boolean(article.content?.trim());
  const contentMinLength = article.content?.length || 0;
  const hasSection = Boolean(article.section?.trim());
  const hasDiagrams = Array.isArray(article.diagrams) && article.diagrams.length > 0;

  // Check if content has links to other wiki articles (internal links)
  const hasInternalLinks = /]\((\/wiki\/[-a-z0-9]+)|\[(.+?)\]\((?!http|#)/i.test(article.content || '');
  const isLinked = hasInternalLinks;

  return {
    exists: true,
    hasTitle,
    hasContent,
    contentMinLength,
    hasSection,
    hasDiagrams,
    isLinked,
  };
}

/**
 * Verify all required article stubs
 */
export function verifyAllRequiredStubs(articles: WikiArticle[]): {
  totalRequired: number;
  verified: number;
  missing: string[];
  details: Record<string, ArticleStubRequirements>;
  allMeetRequirements: boolean;
} {
  const articleMap = new Map(articles.map(a => [a.slug, a]));
  const details: Record<string, ArticleStubRequirements> = {};
  let verified = 0;
  const missing: string[] = [];

  for (const slug of REQUIRED_ARTICLE_SLUGS) {
    const article = articleMap.get(slug);
    const requirements = verifyArticleStub(article);

    details[slug] = requirements;

    if (!requirements.exists) {
      missing.push(slug);
    } else if (requirements.hasTitle && requirements.hasContent && requirements.hasSection) {
      verified++;
    }
  }

  return {
    totalRequired: REQUIRED_ARTICLE_SLUGS.length,
    verified,
    missing,
    details,
    allMeetRequirements: verified === REQUIRED_ARTICLE_SLUGS.length,
  };
}

/**
 * Get a summary report of article stub verification
 */
export function getStubVerificationReport(result: ReturnType<typeof verifyAllRequiredStubs>): string {
  const lines: string[] = [];

  lines.push('='.repeat(70));
  lines.push('Article Stub Verification Report');
  lines.push('='.repeat(70));
  lines.push('');

  lines.push(`Total Required: ${result.totalRequired}`);
  lines.push(`Verified: ${result.verified}`);
  lines.push(`Missing: ${result.missing.length}`);
  lines.push('');

  if (result.missing.length > 0) {
    lines.push('Missing Articles:');
    result.missing.forEach(slug => {
      lines.push(`  - ${slug}`);
    });
    lines.push('');
  }

  lines.push('Detailed Results:');
  lines.push('');

  for (const [slug, req] of Object.entries(result.details)) {
    const status = req.exists && req.hasTitle && req.hasContent && req.hasSection ? '✓' : '✗';
    lines.push(`${status} ${slug}`);
    if (req.exists) {
      lines.push(`    Title: ${req.hasTitle ? 'Yes' : 'No'}`);
      lines.push(`    Content: ${req.hasContent ? `${req.contentMinLength} chars` : 'No'}`);
      lines.push(`    Section: ${req.hasSection ? 'Yes' : 'No'}`);
      lines.push(`    Diagrams: ${req.hasDiagrams ? 'Yes' : 'No'}`);
      lines.push(`    Linked: ${req.isLinked ? 'Yes' : 'No'}`);
    } else {
      lines.push(`    Status: NOT FOUND`);
    }
    lines.push('');
  }

  lines.push('='.repeat(70));
  lines.push(`Result: ${result.allMeetRequirements ? 'ALL REQUIREMENTS MET' : 'REQUIREMENTS NOT MET'}`);
  lines.push('='.repeat(70));

  return lines.join('\n');
}

/**
 * Check if a specific article is one of the required PRD articles
 */
export function isRequiredArticle(slug: string): slug is RequiredArticleSlug {
  return REQUIRED_ARTICLE_SLUGS.includes(slug as RequiredArticleSlug);
}
