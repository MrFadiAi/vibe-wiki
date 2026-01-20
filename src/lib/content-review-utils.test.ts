/**
 * Tests for content-review-utils
 */

import {
  calculateContentMetrics,
  reviewContent,
  reviewMultipleArticles,
  getArticlesNeedingReview,
  getReviewSummary,
  autoFixIssues,
  type ContentReview,
  type ReviewIssue,
  type ReviewOptions,
} from '../content-review-utils';
import type { WikiArticle } from '@/types';

describe('Content Review Utils', () => {
  describe('calculateContentMetrics', () => {
    it('should calculate metrics for simple content', () => {
      const content = '# Test Article\n\nThis is a test. With multiple sentences!';
      const metrics = calculateContentMetrics(content);

      expect(metrics.wordCount).toBeGreaterThan(0);
      expect(metrics.sentenceCount).toBe(2);
      expect(metrics.paragraphCount).toBe(1);
      expect(metrics.headingCount).toBe(1);
    });

    it('should count code blocks correctly', () => {
      const content = `
# Test

\`\`\`javascript
const x = 1;
\`\`\`

\`\`\`python
y = 2
\`\`\`
`;
      const metrics = calculateContentMetrics(content);

      expect(metrics.codeBlockCount).toBe(2);
    });

    it('should count links correctly', () => {
      const content = 'Check [this](https://example.com) and [that](https://test.com)';
      const metrics = calculateContentMetrics(content);

      expect(metrics.linkCount).toBe(2);
    });

    it('should count headings correctly', () => {
      const content = '# H1\n## H2\n### H3\n#### H4';
      const metrics = calculateContentMetrics(content);

      expect(metrics.headingCount).toBe(4);
    });

    it('should calculate reading time', () => {
      const content = 'word '.repeat(400); // 400 words
      const metrics = calculateContentMetrics(content);

      expect(metrics.readingTime).toBe(2); // 400 words / 200 = 2 minutes
    });

    it('should handle empty content', () => {
      const content = '';
      const metrics = calculateContentMetrics(content);

      expect(metrics.wordCount).toBe(0);
      expect(metrics.sentenceCount).toBe(0);
      expect(metrics.paragraphCount).toBe(0);
      expect(metrics.readingTime).toBe(0);
    });
  });

  describe('reviewContent', () => {
    const mockArticle: WikiArticle = {
      slug: 'test-article',
      title: 'Test Article',
      section: 'Test',
      content: '# Test Article\n\nThis is test content with multiple sentences. It should be long enough!',
    };

    it('should perform basic review', () => {
      const review = reviewContent(mockArticle);

      expect(review).toHaveProperty('articleSlug', 'test-article');
      expect(review).toHaveProperty('overallScore');
      expect(review).toHaveProperty('metrics');
      expect(review).toHaveProperty('issues');
      expect(review).toHaveProperty('summary');
      expect(review).toHaveProperty('recommendations');
      expect(review).toHaveProperty('passes');
    });

    it('should detect short content as critical issue', () => {
      const shortArticle: WikiArticle = {
        ...mockArticle,
        content: 'Short',
      };

      const review = reviewContent(shortArticle);

      const criticalIssues = review.issues.filter(i => i.severity === 'critical');
      expect(criticalIssues.length).toBeGreaterThan(0);
      expect(criticalIssues.some(i => i.category === 'completeness')).toBe(true);
    });

    it('should detect images without alt text', () => {
      const articleWithBadImage: WikiArticle = {
        ...mockArticle,
        content: '# Test\n\n![](image.png)',
      };

      const review = reviewContent(articleWithBadImage);

      const majorIssues = review.issues.filter(i => i.severity === 'major');
      expect(majorIssues.some(i => i.category === 'accessibility')).toBe(true);
    });

    it('should accept images with descriptive alt text', () => {
      const articleWithGoodImage: WikiArticle = {
        ...mockArticle,
        content: '# Test\n\n![A beautiful sunset](sunset.png)',
      };

      const review = reviewContent(articleWithGoodImage);

      const accessibilityIssues = review.issues.filter(i => i.category === 'accessibility');
      expect(accessibilityIssues.length).toBe(0);
    });

    it('should detect empty link text', () => {
      const articleWithEmptyLink: WikiArticle = {
        ...mockArticle,
        content: '# Test\n\n[](https://example.com)',
      };

      const review = reviewContent(articleWithEmptyLink);

      const linkIssues = review.issues.filter(i => i.category === 'links' && i.severity === 'major');
      expect(linkIssues.length).toBeGreaterThan(0);
    });

    it('should detect generic link text', () => {
      const articleWithGenericLink: WikiArticle = {
        ...mockArticle,
        content: '# Test\n\nClick [here](https://example.com) for info',
      };

      const review = reviewContent(articleWithGenericLink);

      const linkIssues = review.issues.filter(i => i.category === 'links');
      expect(linkIssues.length).toBeGreaterThan(0);
    });

    it('should detect code blocks without language', () => {
      const articleWithBadCode: WikiArticle = {
        ...mockArticle,
        content: '# Test\n\n```\nconst x = 1;\n```',
      };

      const review = reviewContent(articleWithBadCode);

      const codeIssues = review.issues.filter(i => i.category === 'accessibility' && i.message.includes('language'));
      expect(codeIssues.length).toBeGreaterThan(0);
    });

    it('should accept code blocks with language', () => {
      const articleWithGoodCode: WikiArticle = {
        ...mockArticle,
        content: '# Test\n\n```javascript\nconst x = 1;\n```',
      };

      const review = reviewContent(articleWithGoodCode);

      const codeIssues = review.issues.filter(i => i.category === 'accessibility' && i.message.includes('language'));
      expect(codeIssues.length).toBe(0);
    });

    it('should detect heading level jumps', () => {
      const articleWithJump: WikiArticle = {
        ...mockArticle,
        content: '# H1\n### H3\n## H2',
      };

      const review = reviewContent(articleWithJump);

      const structureIssues = review.issues.filter(i => i.category === 'structure' && i.message.includes('jump'));
      expect(structureIssues.length).toBeGreaterThan(0);
    });

    it('should detect multiple consecutive spaces', () => {
      const articleWithDoubleSpaces: WikiArticle = {
        ...mockArticle,
        content: '# Test\n\nWord  word',
      };

      const review = reviewContent(articleWithDoubleSpaces);

      const formatIssues = review.issues.filter(i => i.category === 'formatting' && i.message.includes('spaces'));
      expect(formatIssues.length).toBeGreaterThan(0);
    });

    it('should require code examples when option is set', () => {
      const articleWithoutCode: WikiArticle = {
        ...mockArticle,
        content: '# Test\n\nThis is content without code blocks.',
      };

      const options: ReviewOptions = { requireCodeExamples: true };
      const review = reviewContent(articleWithoutCode, options);

      expect(review.overallScore).toBeLessThan(100);
    });

    it('should respect minWordCount option', () => {
      const shortArticle: WikiArticle = {
        ...mockArticle,
        content: '# Test\n\nShort content.',
      };

      const options: ReviewOptions = { minWordCount: 100 };
      const review = reviewContent(shortArticle, options);

      expect(review.overallScore).toBeLessThan(100);
    });

    it('should pass review for good content', () => {
      const goodArticle: WikiArticle = {
        slug: 'good-article',
        title: 'Good Article',
        section: 'Test',
        content: `# Good Article

This is a comprehensive article with plenty of content. It has multiple sentences and paragraphs to ensure it meets the minimum requirements.

## Introduction

Here we have an introduction section with detailed information.

## Main Content

![A descriptive image](image.png)

Check out [this resource](https://example.com) for more info.

\`\`\`javascript
const example = 'code';
console.log(example);
\`\`\`

## Conclusion

In conclusion, this article covers all the important topics and should pass the review process with a high score.`,
      };

      const review = reviewContent(goodArticle);
      expect(review.passes).toBe(true);
      expect(review.overallScore).toBeGreaterThanOrEqual(80);
    });

    it('should apply custom rules', () => {
      const customRule = (content: string): ReviewIssue[] => {
        if (content.includes('TODO')) {
          return [{
            id: 'custom-1',
            category: 'completeness',
            severity: 'minor',
            message: 'Content contains TODO marker',
            suggestion: 'Complete the TODO or remove the marker',
          }];
        }
        return [];
      };

      const articleWithTODO: WikiArticle = {
        ...mockArticle,
        content: '# Test\n\nTODO: Add more content',
      };

      const options: ReviewOptions = { customRules: [customRule] };
      const review = reviewContent(articleWithTODO, options);

      expect(review.issues.some(i => i.message.includes('TODO'))).toBe(true);
    });

    it('should calculate correct score based on issues', () => {
      const review = reviewContent(mockArticle);
      expect(review.overallScore).toBeGreaterThanOrEqual(0);
      expect(review.overallScore).toBeLessThanOrEqual(100);
    });
  });

  describe('reviewMultipleArticles', () => {
    const articles: WikiArticle[] = [
      {
        slug: 'article-1',
        title: 'Article 1',
        section: 'Test',
        content: '# Article 1\n\nContent for article one.',
      },
      {
        slug: 'article-2',
        title: 'Article 2',
        section: 'Test',
        content: '# Article 2\n\nContent for article two.',
      },
      {
        slug: 'article-3',
        title: 'Article 3',
        section: 'Test',
        content: '# Article 3\n\nContent for article three.',
      },
    ];

    it('should review all articles', () => {
      const reviews = reviewMultipleArticles(articles);
      expect(reviews).toHaveLength(3);
    });

    it('should return reviews with correct slugs', () => {
      const reviews = reviewMultipleArticles(articles);
      const slugs = reviews.map(r => r.articleSlug);
      expect(slugs).toEqual(['article-1', 'article-2', 'article-3']);
    });
  });

  describe('getArticlesNeedingReview', () => {
    it('should return only failing reviews', () => {
      const reviews: ContentReview[] = [
        { articleSlug: 'pass-1', overallScore: 85, metrics: {} as any, issues: [], summary: {} as any, recommendations: [], passes: true },
        { articleSlug: 'fail-1', overallScore: 60, metrics: {} as any, issues: [], summary: {} as any, recommendations: [], passes: false },
        { articleSlug: 'pass-2', overallScore: 90, metrics: {} as any, issues: [], summary: {} as any, recommendations: [], passes: true },
        { articleSlug: 'fail-2', overallScore: 50, metrics: {} as any, issues: [], summary: {} as any, recommendations: [], passes: false },
      ];

      const failing = getArticlesNeedingReview(reviews);
      expect(failing).toHaveLength(2);
      expect(failing.map(r => r.articleSlug)).toEqual(['fail-1', 'fail-2']);
    });

    it('should return empty array when all pass', () => {
      const reviews: ContentReview[] = [
        { articleSlug: 'pass-1', overallScore: 85, metrics: {} as any, issues: [], summary: {} as any, recommendations: [], passes: true },
        { articleSlug: 'pass-2', overallScore: 90, metrics: {} as any, issues: [], summary: {} as any, recommendations: [], passes: true },
      ];

      const failing = getArticlesNeedingReview(reviews);
      expect(failing).toHaveLength(0);
    });
  });

  describe('getReviewSummary', () => {
    it('should calculate summary statistics', () => {
      const reviews: ContentReview[] = [
        { articleSlug: 'a', overallScore: 80, metrics: {} as any, issues: [{ category: 'grammar' } as any], summary: {} as any, recommendations: [], passes: true },
        { articleSlug: 'b', overallScore: 60, metrics: {} as any, issues: [{ category: 'grammar' } as any], summary: {} as any, recommendations: [], passes: false },
        { articleSlug: 'c', overallScore: 90, metrics: {} as any, issues: [{ category: 'spelling' } as any], summary: {} as any, recommendations: [], passes: true },
      ];

      const summary = getReviewSummary(reviews);

      expect(summary.total).toBe(3);
      expect(summary.passing).toBe(2);
      expect(summary.failing).toBe(1);
      expect(summary.avgScore).toBeCloseTo(76.67, 1);
      expect(summary.totalIssues).toBe(3);
    });

    it('should count issues by category', () => {
      const reviews: ContentReview[] = [
        {
          articleSlug: 'a',
          overallScore: 80,
          metrics: {} as any,
          issues: [
            { category: 'grammar' } as any,
            { category: 'grammar' } as any,
            { category: 'spelling' } as any,
          ],
          summary: {} as any,
          recommendations: [],
          passes: true,
        },
      ];

      const summary = getReviewSummary(reviews);

      expect(summary.byCategory.grammar).toBe(2);
      expect(summary.byCategory.spelling).toBe(1);
    });

    it('should handle empty reviews array', () => {
      const summary = getReviewSummary([]);

      expect(summary.total).toBe(0);
      expect(summary.passing).toBe(0);
      expect(summary.failing).toBe(0);
      expect(summary.avgScore).toBe(NaN);
      expect(summary.totalIssues).toBe(0);
    });
  });

  describe('autoFixIssues', () => {
    it('should fix multiple consecutive spaces', () => {
      const content = 'Word  word   four';
      const issues: ReviewIssue[] = [
        {
          id: '1',
          category: 'formatting',
          severity: 'minor',
          message: 'Multiple consecutive spaces found',
          autoFixable: true,
          location: { context: 'Word  word' },
        },
      ];

      const fixed = autoFixIssues(content, issues);
      expect(fixed).toBe('Word word four');
    });

    it('should fix ellipsis', () => {
      const content = 'Wait...';
      const issues: ReviewIssue[] = [
        {
          id: '1',
          category: 'formatting',
          severity: 'minor',
          message: 'Multiple consecutive periods found',
          suggestion: 'Use proper ellipsis "…"',
          autoFixable: true,
          location: { context: 'Wait...' },
        },
      ];

      const fixed = autoFixIssues(content, issues);
      expect(fixed).toBe('Wait…');
    });

    it('should not fix non-auto-fixable issues', () => {
      const content = '# H1\n### H3';
      const issues: ReviewIssue[] = [
        {
          id: '1',
          category: 'structure',
          severity: 'minor',
          message: 'Heading level jump detected',
          autoFixable: false,
          location: { context: '### H3' },
        },
      ];

      const fixed = autoFixIssues(content, issues);
      expect(fixed).toBe(content);
    });

    it('should handle empty issues array', () => {
      const content = 'Test content';
      const fixed = autoFixIssues(content, []);
      expect(fixed).toBe(content);
    });

    it('should handle empty content', () => {
      const fixed = autoFixIssues('', []);
      expect(fixed).toBe('');
    });
  });

  describe('Edge Cases', () => {
    it('should handle article with no headings', () => {
      const article: WikiArticle = {
        slug: 'no-headings',
        title: 'No Headings',
        section: 'Test',
        content: 'This is content without any headings. Just plain text.',
      };

      const review = reviewContent(article);

      const completenessIssues = review.issues.filter(i => i.category === 'completeness');
      expect(completenessIssues.some(i => i.message.includes('heading'))).toBe(true);
    });

    it('should handle article with only headings', () => {
      const article: WikiArticle = {
        slug: 'only-headings',
        title: 'Only Headings',
        section: 'Test',
        content: '# H1\n## H2\n### H3',
      };

      const review = reviewContent(article);

      expect(review.overallScore).toBeLessThan(100);
    });

    it('should handle very long content', () => {
      const longContent = '# Long Article\n\n' + 'Word '.repeat(10000);
      const article: WikiArticle = {
        slug: 'long-article',
        title: 'Long Article',
        section: 'Test',
        content: longContent,
      };

      const review = reviewContent(article);
      expect(review.metrics.wordCount).toBeGreaterThan(10000);
    });

    it('should handle special characters', () => {
      const article: WikiArticle = {
        slug: 'special-chars',
        title: 'Special Characters',
        section: 'Test',
        content: '# Test\n\nContent with @#$%^&*() special characters!',
      };

      const review = reviewContent(article);
      expect(review).toBeDefined();
    });

    it('should handle RTL content (Arabic)', () => {
      const article: WikiArticle = {
        slug: 'arabic-article',
        title: 'مقال بالعربية',
        section: 'الاختبار',
        content: '# عنوان رئيسي\n\nهذا محتوى باللغة العربية. يحتوي على جمل متعددة للعرض.',
      };

      const review = reviewContent(article);
      expect(review).toBeDefined();
      expect(review.metrics.wordCount).toBeGreaterThan(0);
    });

    it('should handle mixed language content', () => {
      const article: WikiArticle = {
        slug: 'mixed-language',
        title: 'Mixed Language',
        section: 'Test',
        content: '# Test\n\nهذا نص بالعربية followed by English text.',
      };

      const review = reviewContent(article);
      expect(review).toBeDefined();
    });
  });
});
