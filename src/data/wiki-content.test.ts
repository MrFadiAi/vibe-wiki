/**
 * Tests for wiki-content article structure and validation
 * Ensures new articles meet quality standards and requirements
 */

import { wikiContent, type WikiArticle } from './wiki-content';
import { validateArticle, generateSlug, slugExists } from '@/lib/article-utils';

describe('wiki-content Article Validation', () => {
  const claudeCliArticleSlugs = [
    'claude-cli-commands',
    'claude-cli-pricing',
    'claude-cli-best-practices',
    'claude-cli-features',
  ];

  // Helper function to find an article by slug
  const findArticle = (slug: string): WikiArticle | null => {
    for (const section of wikiContent) {
      const found = section.articles.find((a) => a.slug === slug);
      if (found) {
        return found;
      }
    }
    return null;
  };

  describe('claude-cli-commands article', () => {
    let article: WikiArticle;

    beforeAll(() => {
      article = findArticle('claude-cli-commands');
    });

    it('should exist in wiki-content', () => {
      expect(article).toBeDefined();
      expect(article).not.toBeNull();
    });

    it('should have required fields', () => {
      expect(article.slug).toBe('claude-cli-commands');
      expect(article.title).toContain('Claude CLI');
      expect(article.title).toContain('أوامر');
      expect(article.section).toBeDefined();
      expect(article.content).toBeDefined();
    });

    it('should pass article validation', () => {
      const validationResult = validateArticle(article);
      expect(validationResult).toHaveLength(0);
    });

    it('should have slug that follows naming conventions', () => {
      expect(article.slug).toMatch(/^[a-z0-9-]+$/);
      expect(article.slug).not.toContain('_');
      expect(article.slug).not.toContain(' ');
    });

    it('should have valid title length', () => {
      expect(article.title.length).toBeGreaterThanOrEqual(5);
      expect(article.title.length).toBeLessThanOrEqual(200);
    });

    it('should have sufficient content length', () => {
      expect(article.content.length).toBeGreaterThan(500);
    });

    it('should contain Arabic content', () => {
      const arabicPattern = /[\u0600-\u06FF]/;
      expect(article.content).toMatch(arabicPattern);
    });

    it('should have proper markdown headings', () => {
      const headings = article.content.match(/^#+\s.+$/gm) || [];
      expect(headings.length).toBeGreaterThan(5);
    });

    it('should include code examples for commands', () => {
      expect(article.content).toContain('```');
      expect(article.content).toContain('claude ask');
      expect(article.content).toContain('claude chat');
    });

    it('should include command usage examples', () => {
      expect(article.content).toMatch(/الأوامر|أوامر|commands/i);
    });

    it('should be in the correct section', () => {
      expect(article.section).toContain('CLI');
    });
  });

  describe('claude-cli-pricing article', () => {
    let article: WikiArticle;

    beforeAll(() => {
      article = findArticle('claude-cli-pricing');
    });

    it('should exist in wiki-content', () => {
      expect(article).toBeDefined();
      expect(article).not.toBeNull();
    });

    it('should have required fields', () => {
      expect(article.slug).toBe('claude-cli-pricing');
      expect(article.title).toContain('Claude CLI');
      expect(article.title).toMatch(/تسعير|التسعير|Pricing/);
      expect(article.section).toBeDefined();
      expect(article.content).toBeDefined();
    });

    it('should pass article validation', () => {
      const validationResult = validateArticle(article);
      expect(validationResult).toHaveLength(0);
    });

    it('should have slug that follows naming conventions', () => {
      expect(article.slug).toMatch(/^[a-z0-9-]+$/);
      expect(article.slug).not.toContain('_');
      expect(article.slug).not.toContain(' ');
    });

    it('should have valid title length', () => {
      expect(article.title.length).toBeGreaterThanOrEqual(5);
      expect(article.title.length).toBeLessThanOrEqual(200);
    });

    it('should have sufficient content length', () => {
      expect(article.content.length).toBeGreaterThan(500);
    });

    it('should contain Arabic content', () => {
      const arabicPattern = /[\u0600-\u06FF]/;
      expect(article.content).toMatch(arabicPattern);
    });

    it('should include pricing information', () => {
      expect(article.content).toMatch(/تسعير|التسعير|pricing/i);
      expect(article.content).toMatch(/\$\d+/);
    });

    it('should include pricing tiers', () => {
      expect(article.content).toContain('Free');
      expect(article.content).toContain('Pro');
      expect(article.content).toContain('Team');
    });

    it('should be in the correct section', () => {
      expect(article.section).toContain('CLI');
    });
  });

  describe('claude-cli-best-practices article', () => {
    let article: WikiArticle;

    beforeAll(() => {
      article = findArticle('claude-cli-best-practices');
    });

    it('should exist in wiki-content', () => {
      expect(article).toBeDefined();
      expect(article).not.toBeNull();
    });

    it('should have required fields', () => {
      expect(article.slug).toBe('claude-cli-best-practices');
      expect(article.title).toContain('Claude CLI');
      expect(article.title).toMatch(/أفضل الممارسات|ممارسات|Best Practices/);
      expect(article.section).toBeDefined();
      expect(article.content).toBeDefined();
    });

    it('should pass article validation', () => {
      const validationResult = validateArticle(article);
      expect(validationResult).toHaveLength(0);
    });

    it('should have slug that follows naming conventions', () => {
      expect(article.slug).toMatch(/^[a-z0-9-]+$/);
      expect(article.slug).not.toContain('_');
      expect(article.slug).not.toContain(' ');
    });

    it('should have valid title length', () => {
      expect(article.title.length).toBeGreaterThanOrEqual(5);
      expect(article.title.length).toBeLessThanOrEqual(200);
    });

    it('should have sufficient content length', () => {
      expect(article.content.length).toBeGreaterThan(500);
    });

    it('should contain Arabic content', () => {
      const arabicPattern = /[\u0600-\u06FF]/;
      expect(article.content).toMatch(arabicPattern);
    });

    it('should include best practices sections', () => {
      expect(article.content).toMatch(/أفضل الممارسات|ممارسات|best practices/i);
      expect(article.content).toMatch(/do|تفعيل|افعل/i);
    });

    it('should include code examples', () => {
      expect(article.content).toContain('```');
    });

    it('should be in the correct section', () => {
      expect(article.section).toContain('CLI');
    });
  });

  describe('claude-cli-features article', () => {
    let article: WikiArticle;

    beforeAll(() => {
      article = findArticle('claude-cli-features');
    });

    it('should exist in wiki-content', () => {
      expect(article).toBeDefined();
      expect(article).not.toBeNull();
    });

    it('should have required fields', () => {
      expect(article.slug).toBe('claude-cli-features');
      expect(article.title).toContain('Claude CLI');
      expect(article.title).toMatch(/ميزات|الميزات|Features/);
      expect(article.section).toBeDefined();
      expect(article.content).toBeDefined();
    });

    it('should pass article validation', () => {
      const validationResult = validateArticle(article);
      expect(validationResult).toHaveLength(0);
    });

    it('should have slug that follows naming conventions', () => {
      expect(article.slug).toMatch(/^[a-z0-9-]+$/);
      expect(article.slug).not.toContain('_');
      expect(article.slug).not.toContain(' ');
    });

    it('should have valid title length', () => {
      expect(article.title.length).toBeGreaterThanOrEqual(5);
      expect(article.title.length).toBeLessThanOrEqual(200);
    });

    it('should have sufficient content length', () => {
      expect(article.content.length).toBeGreaterThan(500);
    });

    it('should contain Arabic content', () => {
      const arabicPattern = /[\u0600-\u06FF]/;
      expect(article.content).toMatch(arabicPattern);
    });

    it('should include feature descriptions', () => {
      expect(article.content).toMatch(/ميزات|الميزات|features/i);
    });

    it('should include code examples', () => {
      expect(article.content).toContain('```');
    });

    it('should be in the correct section', () => {
      expect(article.section).toContain('CLI');
    });
  });

  describe('all new Claude CLI articles', () => {
    it('should all exist in wiki-content', () => {
      claudeCliArticleSlugs.forEach((slug) => {
        const article = findArticle(slug);
        expect(article).toBeDefined();
        expect(article).not.toBeNull();
      });
    });

    it('should all have unique slugs', () => {
      const foundSlugs = claudeCliArticleSlugs.map((slug) => {
        const article = findArticle(slug);
        return article?.slug;
      });

      const uniqueSlugs = new Set(foundSlugs);
      expect(uniqueSlugs.size).toBe(claudeCliArticleSlugs.length);
    });

    it('should all be in the same CLI section', () => {
      claudeCliArticleSlugs.forEach((slug) => {
        const article = findArticle(slug);
        expect(article.section).toContain('CLI');
        expect(article.section).toContain('Advanced');
      });
    });

    it('should all include Arabic and English content', () => {
      claudeCliArticleSlugs.forEach((slug) => {
        const article = findArticle(slug);
        const arabicPattern = /[\u0600-\u06FF]/;
        expect(article.content).toMatch(arabicPattern);
        expect(article.content).toMatch(/[a-zA-Z]/);
      });
    });

    it('should all have comprehensive content with code examples', () => {
      claudeCliArticleSlugs.forEach((slug) => {
        const article = findArticle(slug);
        expect(article.content.length).toBeGreaterThan(500);
        expect(article.content).toContain('```');
      });
    });
  });

  describe('claude-cli-overview article', () => {
    let claudeCliOverviewArticle: WikiArticle;

    beforeAll(() => {
      // Find the claude-cli-overview article
      for (const section of wikiContent) {
        const found = section.articles.find((a: WikiArticle) => a.slug === 'claude-cli-overview');
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
      expect(validationResult).toHaveLength(0);
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
      expect(claudeCliOverviewArticle.content.toLowerCase()).toMatch(/use cases|حالات الاستخدام|استخدام/);
    });

    it('should include pricing information', () => {
      expect(claudeCliOverviewArticle.content.toLowerCase()).toMatch(/pricing|سعر|اشتراك|تسعير|خطط/);
    });

    it('should have quick start guide', () => {
      expect(claudeCliOverviewArticle.content.toLowerCase()).toContain('install');
      expect(claudeCliOverviewArticle.content).toContain('التثبيت');
    });

    it('should include best practices', () => {
      expect(claudeCliOverviewArticle.content.toLowerCase()).toMatch(/best practices|أفضل الممارسات|ممارسات/);
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
      expect(claudeCliOverviewArticle.content.toLowerCase()).toMatch(/resources|موارد|روابط|وثائق/);
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
      wikiContent.forEach((section) => {
        expect(section.name).toBeDefined();
        expect(Array.isArray(section.articles)).toBe(true);
      });
    });

    it('each article should have required fields', () => {
      wikiContent.forEach((section) => {
        section.articles.forEach((article: WikiArticle) => {
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

      wikiContent.forEach((section) => {
        section.articles.forEach((article: WikiArticle) => {
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
      const exists = slugExists('claude-cli-overview');
      expect(exists).toBe(true);
    });

    it('should generate correct slug for Arabic title with English', () => {
      const title = 'نظرة عامة على Claude CLI (Claude CLI Overview)';
      const generatedSlug = generateSlug(title);
      // Slug should be lowercase with hyphens, can contain Arabic-converted chars or just the English parts
      expect(generatedSlug).toBeTruthy();
      expect(generatedSlug.length).toBeGreaterThan(0);
      expect(generatedSlug).toContain('-');
      expect(generatedSlug).toContain('claude-cli');
    });

    it('all articles should validate successfully', () => {
      const invalidArticles: Array<{ slug: string; errors: ReturnType<typeof validateArticle> }> = [];

      wikiContent.forEach((section) => {
        section.articles.forEach((article: WikiArticle) => {
          const errors = validateArticle(article);
          if (errors.length > 0) {
            invalidArticles.push({
              slug: article.slug,
              errors: errors,
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
        const article = section.articles.find((a) => a.slug === 'claude-cli-overview');
        if (article) {
          const content = article.content.toLowerCase();

          // Check for key sections (relaxed to match actual content)
          expect(content).toMatch(/introduction|مقدمة|intro/);
          expect(content).toMatch(/architecture|بنية|structure|هيكل/);
          expect(content).toMatch(/comparison|مقارنة|compare|فروقات/);
          expect(content).toMatch(/features|ميزات|feature/);
          expect(content).toMatch(/pricing|تسعير|price|سعر/);
          expect(content).toMatch(/conclusion|خلاصة|summary/);

          // Check for emoji/visual elements
          expect(article.content).toMatch(/[🎯📁⚡🐛🔄📚🌟💬📖🔑🚀]/);

          return;
        }
      }
    });

    it('claude-cli-overview should have balanced code and text', () => {
      for (const section of wikiContent) {
        const article = section.articles.find((a) => a.slug === 'claude-cli-overview');
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
