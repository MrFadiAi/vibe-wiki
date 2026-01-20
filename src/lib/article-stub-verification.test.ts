/**
 * Tests for Article Stub Verification
 * Verifies that all 22 required PRD articles exist with proper stub content
 */

import { describe, it, expect } from 'vitest';
import {
  verifyArticleStub,
  verifyAllRequiredStubs,
  getStubVerificationReport,
  isRequiredArticle,
  REQUIRED_ARTICLE_SLUGS,
  type RequiredArticleSlug,
} from './article-stub-verification';
import type { WikiArticle } from '@/types';

describe('Article Stub Verification', () => {
  describe('REQUIRED_ARTICLE_SLUGS', () => {
    it('should contain exactly 22 required articles', () => {
      expect(REQUIRED_ARTICLE_SLUGS).toHaveLength(22);
    });

    it('should contain all Claude CLI articles (5)', () => {
      const claudeArticles = REQUIRED_ARTICLE_SLUGS.filter(s => s.startsWith('claude-cli-'));
      expect(claudeArticles).toHaveLength(5);
      expect(claudeArticles).toContain('claude-cli-overview');
      expect(claudeArticles).toContain('claude-cli-pricing');
      expect(claudeArticles).toContain('claude-cli-best-practices');
      expect(claudeArticles).toContain('claude-cli-features');
      expect(claudeArticles).toContain('claude-cli-commands');
    });

    it('should contain all Copilot CLI articles (4)', () => {
      const copilotArticles = REQUIRED_ARTICLE_SLUGS.filter(s => s.startsWith('copilot-cli-'));
      expect(copilotArticles).toHaveLength(4);
      expect(copilotArticles).toContain('copilot-cli-overview');
      expect(copilotArticles).toContain('copilot-cli-pricing');
      expect(copilotArticles).toContain('copilot-cli-configuration');
      expect(copilotArticles).toContain('copilot-cli-commands');
    });

    it('should contain all OpenCode CLI articles (9)', () => {
      const opencodeArticles = REQUIRED_ARTICLE_SLUGS.filter(s => s.startsWith('opencode-cli-'));
      expect(opencodeArticles).toHaveLength(9);
      expect(opencodeArticles).toContain('opencode-cli-overview');
      expect(opencodeArticles).toContain('opencode-cli-licensing');
      expect(opencodeArticles).toContain('opencode-cli-comparison');
      expect(opencodeArticles).toContain('opencode-cli-deployment');
      expect(opencodeArticles).toContain('opencode-cli-workflows');
      expect(opencodeArticles).toContain('opencode-cli-advanced');
      expect(opencodeArticles).toContain('opencode-cli-context');
      expect(opencodeArticles).toContain('opencode-cli-agents');
      expect(opencodeArticles).toContain('opencode-cli-configuration');
    });

    it('should contain all CLI Overview articles (2)', () => {
      const overviewArticles = REQUIRED_ARTICLE_SLUGS.filter(s =>
        s === 'cli-tools-comparison' || s === 'cli-ecosystem-overview'
      );
      expect(overviewArticles).toHaveLength(2);
    });

    it('should contain the comparison article', () => {
      expect(REQUIRED_ARTICLE_SLUGS).toContain('ai-tools-quality-comparison');
    });

    it('should contain the workflow article', () => {
      expect(REQUIRED_ARTICLE_SLUGS).toContain('multi-agent-workflows');
    });
  });

  describe('isRequiredArticle', () => {
    it('should return true for required articles', () => {
      expect(isRequiredArticle('claude-cli-overview')).toBe(true);
      expect(isRequiredArticle('copilot-cli-overview')).toBe(true);
      expect(isRequiredArticle('opencode-cli-overview')).toBe(true);
      expect(isRequiredArticle('multi-agent-workflows')).toBe(true);
      expect(isRequiredArticle('cli-tools-comparison')).toBe(true);
    });

    it('should return false for non-required articles', () => {
      expect(isRequiredArticle('what-is-vibe-coding')).toBe(false);
      expect(isRequiredArticle('prep-your-machine')).toBe(false);
      expect(isRequiredArticle('unknown-article')).toBe(false);
    });
  });

  describe('verifyArticleStub', () => {
    const validArticle: WikiArticle = {
      slug: 'test-article',
      title: 'Test Article',
      section: 'Test Section',
      description: 'Test description',
      content: 'This is test content with some substance to it.',
      diagrams: [{ id: 'test', filename: 'test.svg', alt: 'Test', caption: 'Test', position: 'inline' }],
    };

    it('should return all false for undefined article', () => {
      const result = verifyArticleStub(undefined);
      expect(result.exists).toBe(false);
      expect(result.hasTitle).toBe(false);
      expect(result.hasContent).toBe(false);
      expect(result.hasSection).toBe(false);
      expect(result.hasDiagrams).toBe(false);
      expect(result.isLinked).toBe(false);
    });

    it('should verify a valid article stub', () => {
      const result = verifyArticleStub(validArticle);
      expect(result.exists).toBe(true);
      expect(result.hasTitle).toBe(true);
      expect(result.hasContent).toBe(true);
      expect(result.contentMinLength).toBeGreaterThan(0);
      expect(result.hasSection).toBe(true);
      expect(result.hasDiagrams).toBe(true);
    });

    it('should detect missing title', () => {
      const article = { ...validArticle, title: '' };
      const result = verifyArticleStub(article);
      expect(result.exists).toBe(true);
      expect(result.hasTitle).toBe(false);
    });

    it('should detect missing content', () => {
      const article = { ...validArticle, content: '' };
      const result = verifyArticleStub(article);
      expect(result.exists).toBe(true);
      expect(result.hasContent).toBe(false);
    });

    it('should detect missing section', () => {
      const article = { ...validArticle, section: '' };
      const result = verifyArticleStub(article);
      expect(result.exists).toBe(true);
      expect(result.hasSection).toBe(false);
    });

    it('should detect missing diagrams', () => {
      const article = { ...validArticle, diagrams: undefined };
      const result = verifyArticleStub(article);
      expect(result.exists).toBe(true);
      expect(result.hasDiagrams).toBe(false);
    });

    it('should detect internal wiki links', () => {
      const articleWithoutLinks = { ...validArticle, content: 'No links here.' };
      expect(verifyArticleStub(articleWithoutLinks).isLinked).toBe(false);

      const articleWithWikiLinks = { ...validArticle, content: 'See [/wiki/test](link).' };
      expect(verifyArticleStub(articleWithWikiLinks).isLinked).toBe(true);

      const articleWithRelativeLinks = { ...validArticle, content: 'See [test](/another).' };
      expect(verifyArticleStub(articleWithRelativeLinks).isLinked).toBe(true);
    });

    it('should count content length correctly', () => {
      const article = { ...validArticle, content: 'Hello world!' };
      const result = verifyArticleStub(article);
      expect(result.contentMinLength).toBe(12);
    });
  });

  describe('verifyAllRequiredStubs', () => {
    it('should return correct counts for empty article list', () => {
      const result = verifyAllRequiredStubs([]);
      expect(result.totalRequired).toBe(22);
      expect(result.verified).toBe(0);
      expect(result.missing).toHaveLength(22);
      expect(result.allMeetRequirements).toBe(false);
    });

    it('should verify all required articles when present', () => {
      const articles: WikiArticle[] = REQUIRED_ARTICLE_SLUGS.map(slug => ({
        slug,
        title: `Title for ${slug}`,
        section: 'Test Section',
        description: 'Test',
        content: `Content for ${slug}. See [/wiki/other](link) for more.`,
        diagrams: [{ id: 'test', filename: 'test.svg', alt: 'Test', caption: 'Test', position: 'inline' }],
      }));

      const result = verifyAllRequiredStubs(articles);
      expect(result.totalRequired).toBe(22);
      expect(result.verified).toBe(22);
      expect(result.missing).toHaveLength(0);
      expect(result.allMeetRequirements).toBe(true);
    });

    it('should identify missing articles', () => {
      const articles: WikiArticle[] = [
        {
          slug: 'claude-cli-overview',
          title: 'Claude CLI Overview',
          section: 'Test',
          description: 'Test',
          content: 'Content',
        },
      ];

      const result = verifyAllRequiredStubs(articles);
      expect(result.missing.length).toBeGreaterThan(0);
      expect(result.missing).not.toContain('claude-cli-overview');
    });

    it('should not count articles missing title/content/section as verified', () => {
      const articles: WikiArticle[] = [
        {
          slug: 'claude-cli-overview',
          title: '', // Missing title
          section: 'Test',
          description: 'Test',
          content: 'Content',
        },
      ];

      const result = verifyAllRequiredStubs(articles);
      expect(result.verified).toBe(0);
      expect(result.missing).toHaveLength(21); // All except the one that exists but is invalid
    });

    it('should provide details for each article', () => {
      const articles: WikiArticle[] = [
        {
          slug: 'claude-cli-overview',
          title: 'Claude CLI Overview',
          section: 'CLI Tools',
          description: 'Test',
          content: 'Content with [/wiki/link](internal link)',
          diagrams: [{ id: 'test', filename: 'test.svg', alt: 'Test', caption: 'Test', position: 'inline' }],
        },
      ];

      const result = verifyAllRequiredStubs(articles);
      expect(result.details['claude-cli-overview']).toBeDefined();
      expect(result.details['claude-cli-overview'].exists).toBe(true);
      expect(result.details['claude-cli-overview'].hasTitle).toBe(true);
      expect(result.details['claude-cli-overview'].isLinked).toBe(true);
    });
  });

  describe('getStubVerificationReport', () => {
    it('should generate a readable report', () => {
      const articles: WikiArticle[] = [
        {
          slug: 'claude-cli-overview',
          title: 'Claude CLI Overview',
          section: 'CLI Tools',
          description: 'Test',
          content: 'Content',
        },
        {
          slug: 'copilot-cli-overview',
          title: '',
          section: 'CLI Tools',
          description: 'Test',
          content: 'Content',
        },
      ];

      const result = verifyAllRequiredStubs(articles);
      const report = getStubVerificationReport(result);

      expect(report).toContain('Article Stub Verification Report');
      expect(report).toContain('Total Required: 22');
      expect(report).toContain('claude-cli-overview');
      expect(report).toContain('Missing:');
    });

    it('should show success when all requirements met', () => {
      const articles: WikiArticle[] = REQUIRED_ARTICLE_SLUGS.map(slug => ({
        slug,
        title: `Title for ${slug}`,
        section: 'Test',
        description: 'Test',
        content: 'Content',
      }));

      const result = verifyAllRequiredStubs(articles);
      const report = getStubVerificationReport(result);

      expect(report).toContain('ALL REQUIREMENTS MET');
    });

    it('should show failure when requirements not met', () => {
      const result = verifyAllRequiredStubs([]);
      const report = getStubVerificationReport(result);

      expect(report).toContain('REQUIREMENTS NOT MET');
    });
  });
});
