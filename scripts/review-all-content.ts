/**
 * Final Content Review Script
 *
 * This script performs a comprehensive review of all wiki content
 * using the content-review-utils infrastructure. It generates a
 * detailed report of content quality metrics and issues.
 */

import { wikiContent } from '../src/data/wiki-content';
import {
  reviewContent,
  reviewMultipleArticles,
  getReviewSummary,
  type ContentReview,
} from '../src/lib/content-review-utils';

/**
 * ANSI color codes for terminal output
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Print a section header
 */
function printHeader(text: string): void {
  console.log(`\n${colors.cyan}${colors.bright}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}  ${text}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}═══════════════════════════════════════════════════════${colors.reset}\n`);
}

/**
 * Print a sub-header
 */
function printSubHeader(text: string): void {
  console.log(`\n${colors.blue}${colors.bright}▶ ${text}${colors.reset}\n`);
}

/**
 * Print article status with color
 */
function printStatus(passes: boolean, score: number): void {
  if (passes) {
    console.log(`${colors.green}✓ PASS${colors.reset} (Score: ${score}/100)`);
  } else {
    console.log(`${colors.red}✗ FAIL${colors.reset} (Score: ${score}/100)`);
  }
}

/**
 * Print issue with color-coded severity
 */
function printIssue(issue: any, index: number): void {
  const severityColors = {
    critical: colors.red,
    major: colors.yellow,
    minor: colors.blue,
    suggestion: colors.dim,
  };

  const severityIcons = {
    critical: '🔴',
    major: '🟡',
    minor: '🔵',
    suggestion: '💡',
  };

  const color = severityColors[issue.severity];
  const icon = severityIcons[issue.severity];

  console.log(`  ${color}[${issue.severity.toUpperCase()}]${colors.reset} ${icon} ${issue.message}`);
  if (issue.suggestion) {
    console.log(`     ${colors.dim}→ ${issue.suggestion}${colors.reset}`);
  }
}

/**
 * Print review summary statistics
 */
function printSummaryStats(reviews: ContentReview[]): void {
  const summary = getReviewSummary(reviews);

  printSubHeader('Overall Statistics');

  console.log(`Total Articles:     ${colors.bright}${summary.total}${colors.reset}`);
  console.log(`Passing:            ${colors.green}${summary.passing}${colors.reset}`);
  console.log(`Failing:            ${colors.red}${summary.failing}${colors.reset}`);
  console.log(`Average Score:      ${colors.bright}${summary.avgScore.toFixed(1)}/100${colors.reset}`);
  console.log(`Critical Issues:    ${colors.red}${summary.totalIssues.critical}${colors.reset}`);
  console.log(`Major Issues:       ${colors.yellow}${summary.totalIssues.major}${colors.reset}`);
  console.log(`Minor Issues:       ${colors.blue}${summary.totalIssues.minor}${colors.reset}`);
  console.log(`Suggestions:        ${colors.dim}${summary.totalIssues.suggestion}${colors.reset}`);

  // Issues by category
  if (Object.keys(summary.byCategory).length > 0) {
    printSubHeader('Issues by Category');
    Object.entries(summary.byCategory).forEach(([category, count]) => {
      console.log(`${category}:       ${count}`);
    });
  }

  // Pass rate
  const passRate = (summary.passing / summary.total) * 100;
  console.log(`\nPass Rate:          ${colors.bright}${passRate.toFixed(1)}%${colors.reset}`);
}

/**
 * Print content metrics
 */
function printMetrics(review: ContentReview): void {
  const metrics = review.metrics;
  console.log(`\n  ${colors.dim}─── Metrics ───${colors.reset}`);
  console.log(`  Words:        ${metrics.wordCount}`);
  console.log(`  Sentences:    ${metrics.sentenceCount}`);
  console.log(`  Paragraphs:   ${metrics.paragraphCount}`);
  console.log(`  Reading Time: ${metrics.readingTime} min`);
  console.log(`  Code Blocks:  ${metrics.codeBlockCount}`);
  console.log(`  Links:        ${metrics.linkCount}`);
  console.log(`  Headings:     ${metrics.headingCount}`);
  console.log(`  Tables:       ${metrics.tableCount}`);
  console.log(`  Lists:        ${metrics.listCount}`);
}

/**
 * Main review function
 */
function runFinalContentReview(): void {
  printHeader('Vibe Wiki - Final Content Review');

  // Flatten all articles from all sections
  const allArticles = wikiContent.flatMap((section) =>
    section.articles.map((article) => ({
      ...article,
      sectionName: section.name,
    }))
  );

  console.log(`Found ${colors.bright}${allArticles.length}${colors.reset} articles to review...\n`);

  // Perform reviews
  const reviews = reviewMultipleArticles(allArticles);

  // Print individual article results
  printSubHeader('Article-by-Article Review');

  reviews.forEach((review, index) => {
    const article = allArticles[index];
    console.log(`\n${colors.bright}${index + 1}. ${article.title}${colors.reset}`);
    console.log(`   Slug: ${colors.dim}${article.slug}${colors.reset}`);
    console.log(`   Section: ${colors.dim}${article.sectionName}${colors.reset}`);

    printStatus(review.passes, review.overallScore);

    // Print issue summary
    const { critical, major, minor, suggestion } = review.summary;
    if (critical + major + minor + suggestion > 0) {
      console.log(`   Issues: ${colors.red}${critical} critical${colors.reset}, ${colors.yellow}${major} major${colors.reset}, ${colors.blue}${minor} minor${colors.reset}, ${colors.dim}${suggestion} suggestions${colors.reset}`);
    } else {
      console.log(`${colors.green}   No issues found!${colors.reset}`);
    }

    // Print critical and major issues
    const importantIssues = review.issues.filter(
      (issue) => issue.severity === 'critical' || issue.severity === 'major'
    );

    if (importantIssues.length > 0) {
      console.log(`\n  ${colors.red}${colors.bright}Critical & Major Issues:${colors.reset}`);
      importantIssues.forEach((issue, i) => printIssue(issue, i + 1));
    }

    // Print metrics
    printMetrics(review);

    // Print recommendations if any
    if (review.recommendations.length > 0) {
      console.log(`\n  ${colors.cyan}Recommendations:${colors.reset}`);
      review.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }
  });

  // Print overall summary
  printSummaryStats(reviews);

  // Print failing articles summary
  const failingReviews = reviews.filter((r) => !r.passes);
  if (failingReviews.length > 0) {
    printSubHeader('Failing Articles Summary');
    failingReviews.forEach((review) => {
      const article = allArticles.find((a) => a.slug === review.articleSlug);
      console.log(`${colors.red}✗${colors.reset} ${article?.title || review.articleSlug} (${review.overallScore}/100)`);
    });
  }

  // Print quality assessment
  printSubHeader('Quality Assessment');
  const summary = getReviewSummary(reviews);
  const passRate = (summary.passing / summary.total) * 100;

  if (passRate >= 90) {
    console.log(`${colors.green}${colors.bright}★ EXCELLENT ★${colors.reset}`);
    console.log(`${colors.green}Content quality is outstanding!${colors.reset}`);
  } else if (passRate >= 80) {
    console.log(`${colors.green}${colors.bright}✓ GOOD${colors.reset}`);
    console.log(`${colors.green}Content quality meets standards.${colors.reset}`);
  } else if (passRate >= 70) {
    console.log(`${colors.yellow}⚠ NEEDS IMPROVEMENT${colors.reset}`);
    console.log(`${colors.yellow}Some articles need attention before launch.${colors.reset}`);
  } else {
    console.log(`${colors.red}${colors.bright}✗ POOR QUALITY${colors.reset}`);
    console.log(`${colors.red}Significant content quality issues detected.${colors.reset}`);
  }

  // Print completion message
  console.log(`\n${colors.cyan}${colors.bright}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}  Review Complete${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}═══════════════════════════════════════════════════════${colors.reset}\n`);
}

// Run the review
runFinalContentReview();
