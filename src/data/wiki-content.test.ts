/**
 * Tests for wiki-content article structure and validation
 * Ensures new articles meet quality standards and requirements
 */

import { wikiContent } from './wiki-content';
import { validateArticle, generateSlug, slugExists } from '@/lib/article-utils';

describe('wiki-content Article Validation', () => {
  describe('claude-cli-overview article', () => {
    let claudeCliOverviewArticle: any;

    beforeAll(() => {
      // Find the claude-cli-overview article
      for (const section of wikiContent) {
        const found = section.articles.find((a: any) => a.slug === 'claude-cli-overview');
        if (found) {
          claudeCliOverviewArticle = found;
          break;
        }
      }
    });

    it('should exist in wiki-content', () => {
      expect(claudeCliOverviewArticle).toBeDefined();
      expect(claudeCliOverviewArticle).not.toBeNull();
    });

    it('should have required fields', () => {
      expect(claudeCliOverviewArticle.slug).toBe('claude-cli-overview');
      expect(claudeCliOverviewArticle.title).toContain('Claude CLI');
      expect(claudeCliOverviewArticle.section).toBeDefined();
      expect(claudeCliOverviewArticle.content).toBeDefined();
    });

    it('should pass article validation', () => {
      const validationResult = validateArticle(claudeCliOverviewArticle);
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
    });

    it('should have slug that follows naming conventions', () => {
      expect(claudeCliOverviewArticle.slug).toMatch(/^[a-z0-9-]+$/);
      expect(claudeCliOverviewArticle.slug).not.toContain('_');
      expect(claudeCliOverviewArticle.slug).not.toContain(' ');
    });

    it('should have valid title length', () => {
      expect(claudeCliOverviewArticle.title.length).toBeGreaterThanOrEqual(5);
      expect(claudeCliOverviewArticle.title.length).toBeLessThanOrEqual(200);
    });

    it('should have sufficient content length', () => {
      expect(claudeCliOverviewArticle.content.length).toBeGreaterThan(500);
    });

    it('should contain Arabic content', () => {
      // Check for Arabic characters (RTL content)
      const arabicPattern = /[\u0600-\u06FF]/;
      expect(claudeCliOverviewArticle.content).toMatch(arabicPattern);
    });

    it('should have proper markdown headings', () => {
      const headings = claudeCliOverviewArticle.content.match(/^#+\s.+$/gm) || [];
      expect(headings.length).toBeGreaterThan(5);
    });

    it('should include code examples', () => {
      expect(claudeCliOverviewArticle.content).toContain('```');
    });

    it('should have technical comparison table', () => {
      expect(claudeCliOverviewArticle.content).toContain('|');
      expect(claudeCliOverviewArticle.content).toContain('Claude CLI');
      expect(claudeCliOverviewArticle.content).toContain('Copilot CLI');
      expect(claudeCliOverviewArticle.content).toContain('OpenCode');
    });

    it('should include use cases section', () => {
      expect(claudeCliOverviewArticle.content.toLowerCase()).toContain('use cases');
      expect(claudeCliOverviewArticle.content).toContain('حالات الاستخدام');
    });

    it('should include pricing information', () => {
      expect(claudeCliOverviewArticle.content.toLowerCase()).toContain('pricing');
      expect(claudeCliOverviewArticle.content).toContain('التسعير');
    });

    it('should have quick start guide', () => {
      expect(claudeCliOverviewArticle.content.toLowerCase()).toContain('install');
      expect(claudeCliOverviewArticle.content).toContain('التثبيت');
    });

    it('should include best practices', () => {
      expect(claudeCliOverviewArticle.content.toLowerCase()).toContain('best practices');
      expect(claudeCliOverviewArticle.content).toContain('أفضل الممارسات');
    });

    it('should be in the correct section', () => {
      expect(claudeCliOverviewArticle.section).toContain('CLI');
    });

    it('should include quick reference commands', () => {
      expect(claudeCliOverviewArticle.content).toContain('claude ask');
      expect(claudeCliOverviewArticle.content).toContain('claude chat');
      expect(claudeCliOverviewArticle.content).toContain('claude analyze');
    });

    it('should have resources section', () => {
      expect(claudeCliOverviewArticle.content.toLowerCase()).toContain('resources');
      expect(claudeCliOverviewArticle.content).toMatch(/https?:\/\//);
    });
  });

  describe('wiki-content structure', () => {
    it('should be an array', () => {
      expect(Array.isArray(wikiContent)).toBe(true);
    });

    it('should have at least one section', () => {
      expect(wikiContent.length).toBeGreaterThan(0);
    });

    it('each section should have name and articles', () => {
      wikiContent.forEach((section: any) => {
        expect(section.name).toBeDefined();
        expect(Array.isArray(section.articles)).toBe(true);
      });
    });

    it('each article should have required fields', () => {
      wikiContent.forEach((section: any) => {
        section.articles.forEach((article: any) => {
          expect(article.slug).toBeDefined();
          expect(article.title).toBeDefined();
          expect(article.section).toBeDefined();
          expect(article.content).toBeDefined();
        });
      });
    });

    it('should have no duplicate slugs', () => {
      const slugs = new Set<string>();
      const duplicates: string[] = [];

      wikiContent.forEach((section: any) => {
        section.articles.forEach((article: any) => {
          if (slugs.has(article.slug)) {
            duplicates.push(article.slug);
          }
          slugs.add(article.slug);
        });
      });

      expect(duplicates).toHaveLength(0);
    });
  });

  describe('article-utils integration', () => {
    it('should recognize claude-cli-overview slug exists', () => {
      const exists = slugExists('claude-cli-overview', wikiContent);
      expect(exists).toBe(true);
    });

    it('should generate correct slug for Arabic title with English', () => {
      const title = 'نظرة عامة على Claude CLI (Claude CLI Overview)';
      const generatedSlug = generateSlug(title);
      expect(generatedSlug).toMatch(/^[a-z0-9-]+$/);
    });

    it('all articles should validate successfully', () => {
      const invalidArticles: any[] = [];

      wikiContent.forEach((section: any) => {
        section.articles.forEach((article: any) => {
          const result = validateArticle(article);
          if (!result.isValid) {
            invalidArticles.push({
              slug: article.slug,
              errors: result.errors,
            });
          }
        });
      });

      expect(invalidArticles).toHaveLength(0);
    });
  });

  describe('content quality checks', () => {
    it('claude-cli-overview should have comprehensive coverage', () => {
      for (const section of wikiContent) {
        const article = section.articles.find((a: any) => a.slug === 'claude-cli-overview');
        if (article) {
          const content = article.content.toLowerCase();

          // Check for key sections
          expect(content).toContain('introduction');
          expect(content).toContain('architecture');
          expect(content).toContain('comparison');
          expect(content).toContain('features');
          expect(content).toContain('pricing');
          expect(content).toContain('conclusion');

          // Check for emoji/visual elements
          expect(article.content).toMatch(/[🎯📁⚡🐛🔄📚🌟💬📖🔑🚀]/);

          return;
        }
      }
    });

    it('claude-cli-overview should have balanced code and text', () => {
      for (const section of wikiContent) {
        const article = section.articles.find((a: any) => a.slug === 'claude-cli-overview');
        if (article) {
          const codeBlocks = (article.content.match(/```/g) || []).length / 2;
          const totalWords = article.content.split(/\s+/).length;

          // Should have at least 5 code blocks
          expect(codeBlocks).toBeGreaterThanOrEqual(5);

          // Should be substantial content
          expect(totalWords).toBeGreaterThan(500);

          return;
        }
      }
    });
  });
});
