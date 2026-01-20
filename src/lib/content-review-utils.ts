/**
 * Content Review Utilities
 *
 * Utilities for reviewing and validating wiki content quality,
 * including technical accuracy, grammar checks, accessibility scoring,
 * and content metrics calculation.
 */

import { WikiArticle } from '@/types';

/**
 * Severity level for review issues
 */
export type IssueSeverity = 'critical' | 'major' | 'minor' | 'suggestion';

/**
 * Category of review issue
 */
export type IssueCategory =
  | 'technical_accuracy'
  | 'grammar'
  | 'spelling'
  | 'accessibility'
  | 'structure'
  | 'formatting'
  | 'links'
  | 'code_blocks'
  | 'completeness';

/**
 * Review issue found during content review
 */
export interface ReviewIssue {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  message: string;
  location?: {
    line?: number;
    section?: string;
    context?: string;
  };
  suggestion?: string;
  autoFixable?: boolean;
}

/**
 * Content quality metrics
 */
export interface ContentMetrics {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  avgWordsPerSentence: number;
  avgSentencesPerParagraph: number;
  readingTime: number; // in minutes
  codeBlockCount: number;
  linkCount: number;
  headingCount: number;
  tableCount: number;
  listCount: number;
}

/**
 * Content review result
 */
export interface ContentReview {
  articleSlug: string;
  overallScore: number; // 0-100
  metrics: ContentMetrics;
  issues: ReviewIssue[];
  summary: {
    critical: number;
    major: number;
    minor: number;
    suggestion: number;
  };
  recommendations: string[];
  passes: boolean; // true if score >= 80 and no critical issues
}

/**
 * Review options for customizing the review process
 */
export interface ReviewOptions {
  minWordCount?: number;
  maxWordCount?: number;
  minReadingTime?: number;
  requireCodeExamples?: boolean;
  checkLinks?: boolean;
  spellCheck?: boolean;
  grammarCheck?: boolean;
  accessibilityCheck?: boolean;
  customRules?: ((content: string) => ReviewIssue[])[];
}

/**
 * Common Arabic and English technical spelling mistakes
 */
const SPELLING_ERRORS = {
  // English technical terms commonly misspelled
  english: [
    { wrong: 'occured', correct: 'occurred' },
    { wrong: 'seperate', correct: 'separate' },
    { wrong: 'definately', correct: 'definitely' },
    { wrong: 'recieve', correct: 'receive' },
    { wrong: ' acheive', correct: 'achieve' },
  ],
  // Arabic common mistakes (simplified checks)
  arabic: [
    // Add Arabic-specific patterns if needed
  ],
};

/**
 * Grammar patterns to check
 */
const GRAMMAR_PATTERNS = [
  {
    pattern: /\s{2,}/g,
    message: 'Multiple consecutive spaces found',
    suggestion: 'Use single spaces',
    severity: 'minor' as IssueSeverity,
    category: 'formatting' as IssueCategory,
  },
  {
    pattern: /\.{3,}/g,
    message: 'Multiple consecutive periods found',
    suggestion: 'Use proper ellipsis "…"' as IssueCategory,
  },
  {
    pattern: /\b(the|The)\s+[a-z]/g,
    message: 'Lowercase letter after "The"',
    suggestion: 'Capitalize the first letter after "The"',
    severity: 'minor' as IssueSeverity,
    category: 'grammar' as IssueCategory,
  },
];

/**
 * Markdown structure patterns to validate
 */
const STRUCTURE_PATTERNS = [
  {
    pattern: /^#+\s*$/gm,
    message: 'Empty heading found',
    suggestion: 'Add text after heading markers',
    severity: 'minor' as IssueSeverity,
    category: 'structure' as IssueCategory,
  },
  {
    pattern: /^\s*```(\w*)\s*$/gm,
    message: 'Code block detected',
    suggestion: '',
    severity: 'suggestion' as IssueSeverity,
    category: 'code_blocks' as IssueCategory,
    autoFixable: false,
  },
];

/**
 * Accessibility checks for content
 */
const ACCESSIBILITY_CHECKS = [
  {
    pattern: /!\[([^\]]*)\]\([^)]+\)/g,
    message: 'Image found',
    check: (alt: string) => alt.length === 0 || alt === 'image' || alt === 'صورة',
    messageOnFail: 'Image missing descriptive alt text',
    suggestion: 'Add descriptive alt text for screen readers',
    severity: 'major' as IssueSeverity,
    category: 'accessibility' as IssueCategory,
  },
  {
    pattern: /`\s{1,}[^`]+\s{1,}`/g,
    message: 'Inline code with leading/trailing spaces',
    suggestion: 'Remove spaces from inline code',
    severity: 'minor' as IssueSeverity,
    category: 'accessibility' as IssueCategory,
  },
];

/**
 * Calculate content metrics from article content
 */
export function calculateContentMetrics(content: string): ContentMetrics {
  const words = content.trim().split(/\s+/).filter(w => w.length > 0);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);

  const codeBlockCount = (content.match(/```/g) || []).length / 2;
  const linkCount = (content.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length;
  const headingCount = (content.match(/^#+\s/gm) || []).length;
  const tableCount = (content.match(/\|.*\|/g) || []).length / 2;
  const listCount = (content.match(/^\s*[-*+]\s/gm) || []).length +
                   (content.match(/^\s*\d+\.\s/gm) || []).length;

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    avgWordsPerSentence: sentences.length > 0 ? words.length / sentences.length : 0,
    avgSentencesPerParagraph: paragraphs.length > 0 ? sentences.length / paragraphs.length : 0,
    readingTime: Math.ceil(words.length / 200), // Average reading speed: 200 words/min
    codeBlockCount,
    linkCount,
    headingCount,
    tableCount,
    listCount,
  };
}

/**
 * Check spelling in content
 */
function checkSpelling(content: string): ReviewIssue[] {
  const issues: ReviewIssue[] = [];
  let issueId = 0;

  // Check English technical terms
  for (const { wrong, correct } of SPELLING_ERRORS.english) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
    let match;
    while ((match = regex.exec(content)) !== null) {
      issues.push({
        id: `spell-${issueId++}`,
        category: 'spelling',
        severity: 'minor',
        message: `Possible spelling error: "${match[0]}"`,
        suggestion: `Did you mean "${correct}"?`,
        autoFixable: true,
        location: {
          context: content.substring(Math.max(0, match.index - 20), match.index + wrong.length + 20),
        },
      });
    }
  }

  return issues;
}

/**
 * Check grammar patterns in content
 */
function checkGrammar(content: string): ReviewIssue[] {
  const issues: ReviewIssue[] = [];
  let issueId = 0;

  for (const { pattern, message, suggestion, severity, category } of GRAMMAR_PATTERNS) {
    let match;
    const globalPattern = new RegExp(pattern.source, pattern.flags);
    while ((match = globalPattern.exec(content)) !== null) {
      issues.push({
        id: `grammar-${issueId++}`,
        category,
        severity,
        message,
        suggestion,
        autoFixable: true,
        location: {
          context: content.substring(Math.max(0, match.index - 30), match.index + 50),
        },
      });
    }
  }

  return issues;
}

/**
 * Check content structure
 */
function checkStructure(content: string): ReviewIssue[] {
  const issues: ReviewIssue[] = [];
  let issueId = 0;

  // Check for proper heading hierarchy
  const headings = content.match(/^#+\s+.+$/gm) || [];
  let prevLevel = 0;
  for (const heading of headings) {
    const level = (heading.match(/^#+/) || [''])[0].length;
    if (level > prevLevel + 1 && prevLevel > 0) {
      issues.push({
        id: `structure-${issueId++}`,
        category: 'structure',
        severity: 'minor',
        message: 'Heading level jump detected',
        suggestion: `Heading jumped from level ${prevLevel} to ${level}`,
        location: { context: heading },
      });
    }
    prevLevel = level;
  }

  // Check structure patterns
  for (const { pattern, message, suggestion, severity, category } of STRUCTURE_PATTERNS) {
    let match;
    const globalPattern = new RegExp(pattern.source, pattern.flags);
    while ((match = globalPattern.exec(content)) !== null) {
      issues.push({
        id: `structure-${issueId++}`,
        category,
        severity,
        message,
        suggestion,
        autoFixable: false,
        location: { context: match[0] },
      });
    }
  }

  return issues;
}

/**
 * Check accessibility of content
 */
function checkAccessibility(content: string): ReviewIssue[] {
  const issues: ReviewIssue[] = [];
  let issueId = 0;

  // Check image alt text
  const imageRegex = /!\[([^\]]*)\]\([^)]+\)/g;
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    const alt = match[1];
    if (alt.length === 0 || alt === 'image' || alt === 'صورة') {
      issues.push({
        id: `a11y-${issueId++}`,
        category: 'accessibility',
        severity: 'major',
        message: 'Image missing descriptive alt text',
        suggestion: 'Add descriptive alt text for screen readers',
        location: { context: match[0] },
      });
    }
  }

  // Check for proper code block language specification
  const codeBlockRegex = /```(\w*)/g;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match[1] === '') {
      issues.push({
        id: `a11y-${issueId++}`,
        category: 'accessibility',
        severity: 'minor',
        message: 'Code block missing language specification',
        suggestion: 'Add language after opening ``` (e.g., ```javascript, ```bash)',
        location: { context: match[0] },
      });
    }
  }

  return issues;
}

/**
 * Check links in content
 */
function checkLinks(content: string): ReviewIssue[] {
  const issues: ReviewIssue[] = [];
  let issueId = 0;

  // Check for empty link text
  const emptyLinkRegex = /\[\]\(([^)]+)\)/g;
  let match;
  while ((match = emptyLinkRegex.exec(content)) !== null) {
    issues.push({
      id: `link-${issueId++}`,
      category: 'links',
      severity: 'major',
      message: 'Link with empty text found',
      suggestion: 'Add descriptive link text',
      location: { context: match[0] },
    });
  }

  // Check for generic link text
  const genericLinkText = ['here', 'click here', 'هنا', 'اضغط هنا'];
  for (const text of genericLinkText) {
    const regex = new RegExp(`\\[${text}\\]\\([^)]+\\)`, 'gi');
    while ((match = regex.exec(content)) !== null) {
      issues.push({
        id: `link-${issueId++}`,
        category: 'links',
        severity: 'minor',
        message: `Generic link text "${text}" found`,
        suggestion: 'Use descriptive link text that indicates the destination',
        location: { context: match[0] },
      });
    }
  }

  return issues;
}

/**
 * Check completeness of content
 */
function checkCompleteness(article: WikiArticle): ReviewIssue[] {
  const issues: ReviewIssue[] = [];
  let issueId = 0;

  const { content, title, slug } = article;

  // Check minimum content length
  if (content.length < 500) {
    issues.push({
      id: `complete-${issueId++}`,
      category: 'completeness',
      severity: 'critical',
      message: 'Article content is too short',
      suggestion: 'Add more details to reach at least 500 characters',
    });
  }

  // Check for introduction
  if (!content.match(/^#\s+.+$/m)) {
    issues.push({
      id: `complete-${issueId++}`,
      category: 'completeness',
      severity: 'major',
      message: 'Article missing main heading',
      suggestion: 'Add a main heading (# Title) at the beginning',
    });
  }

  // Check for conclusion
  const hasConclusion = content.match(/##?\s*(Conclusion|Summary|الخلاصة|الملخص|ملاحظات)/i);
  if (!hasConclusion) {
    issues.push({
      id: `complete-${issueId++}`,
      category: 'completeness',
      severity: 'minor',
      message: 'Article may be missing a conclusion section',
      suggestion: 'Consider adding a conclusion or summary section',
    });
  }

  return issues;
}

/**
 * Generate review recommendations based on issues
 */
function generateRecommendations(issues: ReviewIssue[]): string[] {
  const recommendations: string[] = [];

  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const majorIssues = issues.filter(i => i.severity === 'major').length;

  if (criticalIssues > 0) {
    recommendations.push(`Address ${criticalIssues} critical issue(s) immediately`);
  }

  if (majorIssues > 0) {
    recommendations.push(`Review and fix ${majorIssues} major issue(s)`);
  }

  const categoryCounts = issues.reduce((acc, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (categoryCounts.grammar > 0) {
    recommendations.push('Run grammar check on the content');
  }

  if (categoryCounts.accessibility > 0) {
    recommendations.push('Improve accessibility: add alt text, specify code languages');
  }

  if (categoryCounts.links > 0) {
    recommendations.push('Review and improve link descriptions');
  }

  if (categoryCounts.technical_accuracy > 0) {
    recommendations.push('Verify technical accuracy with subject matter expert');
  }

  return recommendations;
}

/**
 * Calculate overall content score (0-100)
 */
function calculateOverallScore(
  metrics: ContentMetrics,
  issues: ReviewIssue[],
  options: ReviewOptions
): number {
  let score = 100;

  // Deduct points for issues
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const majorCount = issues.filter(i => i.severity === 'major').length;
  const minorCount = issues.filter(i => i.severity === 'minor').length;
  const suggestionCount = issues.filter(i => i.severity === 'suggestion').length;

  score -= criticalCount * 25; // Critical: -25 points each
  score -= majorCount * 10;    // Major: -10 points each
  score -= minorCount * 2;     // Minor: -2 points each
  score -= suggestionCount * 0.5; // Suggestions: -0.5 points each

  // Check word count requirements
  if (options.minWordCount && metrics.wordCount < options.minWordCount) {
    score -= 10;
  }

  if (options.maxWordCount && metrics.wordCount > options.maxWordCount) {
    score -= 5;
  }

  // Check reading time
  if (options.minReadingTime && metrics.readingTime < options.minReadingTime) {
    score -= 5;
  }

  // Check for code examples if required
  if (options.requireCodeExamples && metrics.codeBlockCount === 0) {
    score -= 15;
  }

  // Award points for good structure
  if (metrics.headingCount >= 5) score += 2;
  if (metrics.linkCount >= 3) score += 2;
  if (metrics.codeBlockCount >= 2) score += 2;

  return Math.max(0, Math.min(100, score));
}

/**
 * Perform comprehensive content review
 */
export function reviewContent(
  article: WikiArticle,
  options: ReviewOptions = {}
): ContentReview {
  const issues: ReviewIssue[] = [];

  // Default options
  const opts: Required<ReviewOptions> = {
    minWordCount: 300,
    maxWordCount: 10000,
    minReadingTime: 2,
    requireCodeExamples: false,
    checkLinks: true,
    spellCheck: true,
    grammarCheck: true,
    accessibilityCheck: true,
    customRules: [],
    ...options,
  };

  // Calculate metrics
  const metrics = calculateContentMetrics(article.content);

  // Run checks
  if (opts.spellCheck) {
    issues.push(...checkSpelling(article.content));
  }

  if (opts.grammarCheck) {
    issues.push(...checkGrammar(article.content));
  }

  issues.push(...checkStructure(article.content));

  if (opts.accessibilityCheck) {
    issues.push(...checkAccessibility(article.content));
  }

  if (opts.checkLinks) {
    issues.push(...checkLinks(article.content));
  }

  issues.push(...checkCompleteness(article));

  // Run custom rules
  for (const rule of opts.customRules) {
    issues.push(...rule(article.content));
  }

  // Calculate score
  const overallScore = calculateOverallScore(metrics, issues, opts);

  // Generate recommendations
  const recommendations = generateRecommendations(issues);

  // Categorize issues
  const summary = {
    critical: issues.filter(i => i.severity === 'critical').length,
    major: issues.filter(i => i.severity === 'major').length,
    minor: issues.filter(i => i.severity === 'minor').length,
    suggestion: issues.filter(i => i.severity === 'suggestion').length,
  };

  // Determine if content passes review
  const passes = overallScore >= 80 && summary.critical === 0;

  return {
    articleSlug: article.slug,
    overallScore,
    metrics,
    issues,
    summary,
    recommendations,
    passes,
  };
}

/**
 * Review multiple articles
 */
export function reviewMultipleArticles(
  articles: WikiArticle[],
  options?: ReviewOptions
): ContentReview[] {
  return articles.map(article => reviewContent(article, options));
}

/**
 * Get articles that need review (failing scores)
 */
export function getArticlesNeedingReview(
  reviews: ContentReview[]
): ContentReview[] {
  return reviews.filter(review => !review.passes);
}

/**
 * Get review summary for multiple articles
 */
export function getReviewSummary(reviews: ContentReview[]): {
  total: number;
  passing: number;
  failing: number;
  avgScore: number;
  totalIssues: number;
  byCategory: Record<IssueCategory, number>;
} {
  const total = reviews.length;
  const passing = reviews.filter(r => r.passes).length;
  const failing = total - passing;
  const avgScore = reviews.reduce((sum, r) => sum + r.overallScore, 0) / total;
  const totalIssues = reviews.reduce((sum, r) => sum + r.issues.length, 0);

  const byCategory = reviews.reduce((acc, review) => {
    for (const issue of review.issues) {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<IssueCategory, number>);

  return {
    total,
    passing,
    failing,
    avgScore,
    totalIssues,
    byCategory,
  };
}

/**
 * Auto-fix auto-fixable issues
 */
export function autoFixIssues(content: string, issues: ReviewIssue[]): string {
  let fixedContent = content;

  for (const issue of issues) {
    if (!issue.autoFixable || !issue.location?.context) {
      continue;
    }

    // Fix multiple spaces
    if (issue.category === 'formatting' && issue.message.includes('spaces')) {
      fixedContent = fixedContent.replace(/\s{2,}/g, ' ');
    }

    // Fix ellipsis
    if (issue.message.includes('ellipsis')) {
      fixedContent = fixedContent.replace(/\.{3,}/g, '…');
    }
  }

  return fixedContent;
}
