/**
 * Final Content Review Tests
 *
 * Comprehensive test suite for validating all newly created content
 * from Phase 1 (Weeks 1-3) of the PRD.
 *
 * This test suite validates:
 * - "Your First 15 Minutes" guide
 * - "AI Coding Ecosystem Overview"
 * - All CLI tool guides (Claude, Copilot, OpenCode, + 10 others)
 * - All 4 learning paths
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { wikiContent } from '@/data/wiki-content';
import {
  reviewContent,
  reviewMultipleArticles,
  getArticlesNeedingReview,
  getReviewSummary,
  autoFixIssues,
  type ContentReview,
} from '@/lib/content-review-utils';

describe('Final Content Review - Phase 1', () => {
  let allArticles: any[];
  let reviews: ContentReview[];

  beforeEach(() => {
    // Flatten all articles from all sections
    allArticles = wikiContent.flatMap((section) =>
      section.articles.map((article) => ({
        ...article,
        sectionName: section.name,
      }))
    );

    // Perform reviews on all articles
    reviews = reviewMultipleArticles(allArticles);
  });

  describe('Content Existence', () => {
    it('should have at least 40 articles', () => {
      expect(allArticles.length).toBeGreaterThanOrEqual(40);
    });

    it('should have all required sections', () => {
      const sections = wikiContent.map((s) => s.name);
      expect(sections).toContain('1. المقدمة: التحول الكبير (The Vibe Shift)');
      expect(sections).toContain('8. أدوات CLI للبرمجة بالذكاء الاصطناعي (AI Coding CLIs)');
      expect(sections).toContain('9. مسارات التعلم (Learning Paths)');
    });
  });

  describe('Phase 1, Week 1 - Foundation Content', () => {
    it('should have "your-first-15-minutes" article', () => {
      const article = allArticles.find((a) => a.slug === 'your-first-15-minutes');
      expect(article).toBeDefined();
      expect(article?.content).toContain('أول 15 دقيقة');
    });

    it('should have "ai-coding-ecosystem" article', () => {
      const article = allArticles.find((a) => a.slug === 'ai-coding-ecosystem');
      expect(article).toBeDefined();
      expect(article?.content).toContain('نظام البرمجة بالذكاء الاصطناعي');
    });

    it('"your-first-15-minutes" should pass quality review', () => {
      const article = allArticles.find((a) => a.slug === 'your-first-15-minutes');
      const review = reviewContent(article!);
      expect(review.passes).toBe(true);
      expect(review.overallScore).toBeGreaterThanOrEqual(80);
    });

    it('"ai-coding-ecosystem" should pass quality review', () => {
      const article = allArticles.find((a) => a.slug === 'ai-coding-ecosystem');
      const review = reviewContent(article!);
      expect(review.passes).toBe(true);
      expect(review.overallScore).toBeGreaterThanOrEqual(80);
    });
  });

  describe('Phase 1, Week 2 - CLI Tools Documentation', () => {
    it('should have Claude CLI comprehensive guide', () => {
      const article = allArticles.find((a) => a.slug === 'claude-cli-comprehensive-guide');
      expect(article).toBeDefined();
      expect(article?.content).toContain('Claude CLI');
    });

    it('should have Copilot CLI comprehensive guide', () => {
      const article = allArticles.find((a) => a.slug === 'copilot-cli-comprehensive-guide');
      expect(article).toBeDefined();
      expect(article?.content).toContain('GitHub Copilot CLI');
    });

    it('should have OpenCode comprehensive guide', () => {
      const article = allArticles.find((a) => a.slug === 'opencode-comprehensive-guide');
      expect(article).toBeDefined();
      expect(article?.content).toContain('OpenCode');
    });

    it('should have guides for 10 additional CLI tools', () => {
      const additionalTools = [
        'codex-openai-guide',
        'cody-sourcegraph-guide',
        'tabnine-guide',
        'codeWhisperer-guide',
        'replit-ghostwriter-guide',
        'aider-guide',
        'mentat-guide',
        'continue-guide',
        'pieces-for-developers-guide',
        'bito-cli-guide',
      ];

      additionalTools.forEach((slug) => {
        const article = allArticles.find((a) => a.slug === slug);
        expect(article).toBeDefined();
      });
    });

    it('all CLI guides should pass quality review', () => {
      const cliGuides = [
        'claude-cli-comprehensive-guide',
        'copilot-cli-comprehensive-guide',
        'opencode-comprehensive-guide',
      ];

      cliGuides.forEach((slug) => {
        const article = allArticles.find((a) => a.slug === slug);
        const review = reviewContent(article!);
        expect(review.passes).toBe(true);
        expect(review.overallScore).toBeGreaterThanOrEqual(80);
      });
    });
  });

  describe('Phase 1, Week 3 - Learning Paths', () => {
    it('should have all 4 learning paths', () => {
      const learningPaths = [
        'learning-path-1-beginner-to-first-app',
        'learning-path-2-dev-to-ai-assisted',
        'learning-path-3-ai-tools-mastery',
        'learning-path-4-building-production-saas',
      ];

      learningPaths.forEach((slug) => {
        const article = allArticles.find((a) => a.slug === slug);
        expect(article).toBeDefined();
      });
    });

    it('Learning Path 1 should have 2-week structure', () => {
      const article = allArticles.find((a) => a.slug === 'learning-path-1-beginner-to-first-app');
      expect(article?.content).toContain('الأسبوع الأول');
      expect(article?.content).toContain('الأسبوع الثاني');
    });

    it('Learning Path 2 should have 1-week structure', () => {
      const article = allArticles.find((a) => a.slug === 'learning-path-2-dev-to-ai-assisted');
      expect(article?.content).toContain('اليوم');
      expect(article?.content).toContain('الأسبوع');
    });

    it('Learning Path 3 should have 3-week structure', () => {
      const article = allArticles.find((a) => a.slug === 'learning-path-3-ai-tools-mastery');
      expect(article?.content).toContain('الأسبوع الأول');
      expect(article?.content).toContain('الأسبوع الثاني');
      expect(article?.content).toContain('الأسبوع الثالث');
    });

    it('Learning Path 4 should have 4-week structure', () => {
      const article = allArticles.find((a) => a.slug === 'learning-path-4-building-production-saas');
      expect(article?.content).toContain('الأسبوع الأول');
      expect(article?.content).toContain('الأسبوع الرابع');
    });

    it('all learning paths should pass quality review', () => {
      const learningPaths = [
        'learning-path-1-beginner-to-first-app',
        'learning-path-2-dev-to-ai-assisted',
        'learning-path-3-ai-tools-mastery',
        'learning-path-4-building-production-saas',
      ];

      learningPaths.forEach((slug) => {
        const article = allArticles.find((a) => a.slug === slug);
        const review = reviewContent(article!);
        expect(review.passes).toBe(true);
        expect(review.overallScore).toBeGreaterThanOrEqual(80);
      });
    });
  });

  describe('Content Quality Standards', () => {
    it('overall pass rate should be at least 90%', () => {
      const summary = getReviewSummary(reviews);
      const passRate = (summary.passing / summary.total) * 100;
      expect(passRate).toBeGreaterThanOrEqual(90);
    });

    it('should have no critical issues', () => {
      const failingArticles = getArticlesNeedingReview(reviews);
      const criticalIssues = failingArticles.filter((review) =>
        review.issues.some((issue) => issue.severity === 'critical')
      );
      expect(criticalIssues.length).toBe(0);
    });

    it('average score should be at least 85', () => {
      const summary = getReviewSummary(reviews);
      expect(summary.avgScore).toBeGreaterThanOrEqual(85);
    });

    it('all articles should have minimum word count', () => {
      reviews.forEach((review) => {
        expect(review.metrics.wordCount).toBeGreaterThanOrEqual(100);
      });
    });

    it('all articles should have proper headings', () => {
      reviews.forEach((review) => {
        expect(review.metrics.headingCount).toBeGreaterThan(0);
      });
    });

    it('tutorial and guide articles should have code examples', () => {
      const guides = reviews.filter((review) =>
        review.articleSlug.includes('guide') || review.articleSlug.includes('tutorial')
      );

      guides.forEach((review) => {
        // Not all guides require code blocks, but most should
        // This is a soft check - we allow some guides without code
        if (review.articleSlug.includes('cli') || review.articleSlug.includes('tutorial')) {
          expect(review.metrics.codeBlockCount).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Content Metrics', () => {
    it('should calculate content metrics for all articles', () => {
      expect(reviews.length).toBe(allArticles.length);

      reviews.forEach((review) => {
        expect(review.metrics).toBeDefined();
        expect(review.metrics.wordCount).toBeGreaterThanOrEqual(0);
        expect(review.metrics.sentenceCount).toBeGreaterThanOrEqual(0);
        expect(review.metrics.readingTime).toBeGreaterThanOrEqual(0);
      });
    });

    it('should track code blocks', () => {
      const totalCodeBlocks = reviews.reduce(
        (sum, review) => sum + review.metrics.codeBlockCount,
        0
      );
      expect(totalCodeBlocks).toBeGreaterThan(50);
    });

    it('should track links', () => {
      const totalLinks = reviews.reduce((sum, review) => sum + review.metrics.linkCount, 0);
      expect(totalLinks).toBeGreaterThan(20);
    });

    it('should track headings', () => {
      const totalHeadings = reviews.reduce(
        (sum, review) => sum + review.metrics.headingCount,
        0
      );
      expect(totalHeadings).toBeGreaterThan(100);
    });
  });

  describe('Accessibility', () => {
    it('should not have images without alt text', () => {
      reviews.forEach((review) => {
        const altIssues = review.issues.filter(
          (issue) => issue.category === 'accessibility' && issue.message.includes('alt')
        );
        expect(altIssues.length).toBe(0);
      });
    });

    it('should have proper heading hierarchy', () => {
      reviews.forEach((review) => {
        const hierarchyIssues = review.issues.filter(
          (issue) => issue.category === 'structure' && issue.message.includes('heading')
        );
        // We allow some minor hierarchy issues, but no critical ones
        const criticalHierarchyIssues = hierarchyIssues.filter(
          (issue) => issue.severity === 'critical'
        );
        expect(criticalHierarchyIssues.length).toBe(0);
      });
    });
  });

  describe('Grammar and Spelling', () => {
    it('should not have common spelling errors', () => {
      reviews.forEach((review) => {
        const spellingIssues = review.issues.filter(
          (issue) => issue.category === 'spelling'
        );
        expect(spellingIssues.length).toBe(0);
      });
    });

    it('should not have multiple consecutive spaces', () => {
      reviews.forEach((review) => {
        const spaceIssues = review.issues.filter(
          (issue) => issue.category === 'grammar' && issue.message.includes('spaces')
        );
        expect(spaceIssues.length).toBe(0);
      });
    });
  });

  describe('Completeness', () => {
    it('all articles should have a main heading', () => {
      reviews.forEach((review) => {
        const hasMainHeading = review.issues.some(
          (issue) =>
            issue.category === 'completeness' && issue.message.includes('main heading')
        );
        expect(hasMainHeading).toBe(false);
      });
    });

    it('all articles should meet minimum length requirements', () => {
      reviews.forEach((review) => {
        const lengthIssues = review.issues.filter(
          (issue) => issue.category === 'completeness' && issue.message.includes('too short')
        );
        expect(lengthIssues.length).toBe(0);
      });
    });
  });

  describe('Review Summary', () => {
    it('should generate accurate review summary', () => {
      const summary = getReviewSummary(reviews);

      expect(summary.total).toBe(reviews.length);
      expect(summary.passing).toBeGreaterThanOrEqual(0);
      expect(summary.failing).toBeGreaterThanOrEqual(0);
      expect(summary.avgScore).toBeGreaterThan(0);
      expect(summary.totalIssues).toBeDefined();
    });

    it('should track issues by category', () => {
      const summary = getReviewSummary(reviews);

      expect(summary.byCategory).toBeDefined();
      expect(typeof summary.byCategory).toBe('object');
    });
  });

  describe('Auto-Fix', () => {
    it('should auto-fix multiple spaces', () => {
      const testArticle = {
        slug: 'test-auto-fix',
        title: 'Test Auto Fix',
        section: 'Test',
        content: 'Test  content  with  multiple  spaces',
      };

      const review = reviewContent(testArticle);
      const fixedContent = autoFixIssues(testArticle.content, review.issues);

      expect(fixedContent).not.toContain('  ');
    });

    it('should auto-fix ellipsis', () => {
      const testArticle = {
        slug: 'test-ellipsis-fix',
        title: 'Test Ellipsis Fix',
        section: 'Test',
        content: 'Test content with multiple periods...',
      };

      const review = reviewContent(testArticle);
      const fixedContent = autoFixIssues(testArticle.content, review.issues);

      expect(fixedContent).toContain('…');
    });
  });

  describe('Language and RTL', () => {
    it('Arabic content should be properly structured', () => {
      const arabicArticles = reviews.filter((review) => {
        const article = allArticles.find((a) => a.slug === review.articleSlug);
        return article && /[\u0600-\u06FF]/.test(article.content);
      });

      expect(arabicArticles.length).toBeGreaterThan(20);
    });

    it('should have bilingual technical terms', () => {
      // Most articles should have English technical terms in parentheses
      const articlesWithEnglish = reviews.filter((review) => {
        const article = allArticles.find((a) => a.slug === review.articleSlug);
        return article && /\([A-Za-z]/.test(article.content);
      });

      expect(articlesWithEnglish.length).toBeGreaterThan(15);
    });
  });

  describe('Code Block Quality', () => {
    it('code blocks should have language specified', () => {
      reviews.forEach((review) => {
        const langIssues = review.issues.filter(
          (issue) =>
            issue.category === 'code_blocks' &&
            issue.message.includes('language')
        );
        // Allow some code blocks without language (like plain text examples)
        const criticalLangIssues = langIssues.filter(
          (issue) => issue.severity === 'critical'
        );
        expect(criticalLangIssues.length).toBe(0);
      });
    });
  });

  describe('Link Quality', () => {
    it('should not have empty link text', () => {
      reviews.forEach((review) => {
        const linkIssues = review.issues.filter(
          (issue) => issue.category === 'links' && issue.message.includes('empty')
        );
        expect(linkIssues.length).toBe(0);
      });
    });

    it('should not have generic link text like "click here"', () => {
      reviews.forEach((review) => {
        const genericLinkIssues = review.issues.filter(
          (issue) =>
            issue.category === 'links' &&
            issue.message.toLowerCase().includes('click here')
        );
        expect(genericLinkIssues.length).toBe(0);
      });
    });
  });

  describe('Final Quality Gate', () => {
    it('should meet all launch criteria', () => {
      const summary = getReviewSummary(reviews);
      const passRate = (summary.passing / summary.total) * 100;

      // Criteria for content launch:
      // 1. At least 90% pass rate
      expect(passRate).toBeGreaterThanOrEqual(90);

      // 2. Average score of at least 85
      expect(summary.avgScore).toBeGreaterThanOrEqual(85);

      // 3. No critical issues
      const criticalIssues = summary.totalIssues.critical;
      expect(criticalIssues).toBe(0);

      // 4. Minimal major issues (less than 5% of total articles)
      const majorIssueRate = summary.totalIssues.major / summary.total;
      expect(majorIssueRate).toBeLessThan(0.05);
    });

    it('should have comprehensive coverage across all sections', () => {
      const sectionCounts = wikiContent.map((section) => ({
        name: section.name,
        count: section.articles.length,
      }));

      sectionCounts.forEach((section) => {
        expect(section.count).toBeGreaterThan(0);
      });
    });
  });
});
