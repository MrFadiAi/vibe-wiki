/**
 * Tests for Enhanced Search Module
 */

import { describe, it, expect, vi } from 'vitest';
import { searchArticles, getAvailableSections, getReadingTimeRange } from './enhanced-search';

// Mock the allArticles import with inline data
vi.mock('@/lib/article-utils', () => ({
  allArticles: [
    {
      slug: 'test-article-1',
      title: 'Introduction to React Hooks',
      section: 'Frontend Development',
      content: 'React Hooks are functions that let you use state and other React features in functional components. The most common hooks are useState and useEffect.',
      codeBlocks: [{ language: 'javascript', code: 'const [count, setCount] = useState(0);' }],
      readingTime: 3,
    },
    {
      slug: 'test-article-2',
      title: 'Advanced TypeScript Patterns',
      section: 'TypeScript',
      content: 'TypeScript provides powerful type system features including generics, conditional types, and utility types.',
      codeBlocks: [{ language: 'typescript', code: 'type ExtractType<T> = T extends infer U ? U : never;' }],
      readingTime: 5,
    },
    {
      slug: 'test-article-3',
      title: 'Getting Started with Node.js',
      section: 'Backend Development',
      content: 'Node.js is a JavaScript runtime built on Chrome V8 engine. It allows you to run JavaScript outside the browser.',
      codeBlocks: [],
      readingTime: 2,
    },
    {
      slug: 'test-article-4',
      title: 'CSS Grid Layout Guide',
      section: 'Frontend Development',
      content: 'CSS Grid Layout is a two-dimensional layout system for the web. It allows you to layout items in rows and columns.',
      codeBlocks: [{ language: 'css', code: '.container { display: grid; grid-template-columns: 1fr 1fr; }' }],
      readingTime: 4,
    },
  ],
}));

describe('Enhanced Search', () => {
  describe('Basic Search', () => {
    it('should return all articles when query is empty', () => {
      const results = searchArticles({ query: '' });
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return all articles when query is empty with filters', () => {
      const results = searchArticles({ query: '', filters: { section: 'Frontend Development' } });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.item.section === 'Frontend Development')).toBe(true);
    });

    it('should search across title, content, and section', () => {
      const results = searchArticles({ query: 'React' });
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.title).toContain('React');
    });

    it('should perform fuzzy matching', () => {
      const results = searchArticles({ query: 'Reakt Hooks' });
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return results with score', () => {
      const results = searchArticles({ query: 'TypeScript' });
      expect(results[0].score).toBeDefined();
      expect(results[0].score).toBeGreaterThanOrEqual(0);
      expect(results[0].score).toBeLessThanOrEqual(1);
    });
  });

  describe('Search Filters', () => {
    it('should filter by section', () => {
      const results = searchArticles({
        query: '',
        filters: { section: 'Frontend Development' },
      });
      expect(results.every(r => r.item.section === 'Frontend Development')).toBe(true);
    });

    it('should filter by code presence', () => {
      const withCode = searchArticles({
        query: '',
        filters: { hasCode: true },
      });
      expect(withCode.every(r => r.item.codeBlocks && r.item.codeBlocks.length > 0)).toBe(true);
      expect(withCode.length).toBeGreaterThan(0);
    });

    it('should filter by minimum reading time', () => {
      const results = searchArticles({
        query: '',
        filters: { minReadingTime: 4 },
      });
      expect(results.every(r => {
        const rt = calculateReadingTimeFromContent(r.item.content);
        return rt >= 4;
      })).toBe(true);
    });

    it('should filter by maximum reading time', () => {
      const results = searchArticles({
        query: '',
        filters: { maxReadingTime: 3 },
      });
      expect(results.every(r => {
        const rt = calculateReadingTimeFromContent(r.item.content);
        return rt <= 3;
      })).toBe(true);
    });

    it('should combine multiple filters', () => {
      const results = searchArticles({
        query: '',
        filters: {
          section: 'Frontend Development',
          hasCode: true,
          minReadingTime: 3,
        },
      });
      expect(results.every(r => {
        const rt = calculateReadingTimeFromContent(r.item.content);
        return (
          r.item.section === 'Frontend Development' &&
          r.item.codeBlocks && r.item.codeBlocks.length > 0 &&
          rt >= 3
        );
      })).toBe(true);
    });
  });

  // Helper function for tests
  function calculateReadingTimeFromContent(content: string, wordsPerMinute = 200): number {
    const wordCount = content
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]+`/g, '')
      .replace(/[#*_\[\]()>-]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  describe('Sorting', () => {
    it('should sort by relevance (default)', () => {
      const results = searchArticles({ query: 'React', sortBy: 'relevance' });
      expect(results.length).toBeGreaterThan(0);
      for (let i = 1; i < results.length; i++) {
        expect(results[i].score).toBeGreaterThanOrEqual(results[i - 1].score);
      }
    });

    it('should sort by title ascending', () => {
      const results = searchArticles({ query: '', sortBy: 'title', sortOrder: 'asc' });
      expect(results.length).toBeGreaterThan(0);
      for (let i = 1; i < results.length; i++) {
        expect(results[i].item.title.localeCompare(results[i - 1].item.title)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should sort by title descending', () => {
      const results = searchArticles({ query: '', sortBy: 'title', sortOrder: 'desc' });
      expect(results.length).toBeGreaterThan(0);
      for (let i = 1; i < results.length; i++) {
        expect(results[i].item.title.localeCompare(results[i - 1].item.title)).toBeLessThanOrEqual(0);
      }
    });

    it('should sort by reading time ascending', () => {
      const results = searchArticles({ query: '', sortBy: 'readingTime', sortOrder: 'asc' });
      expect(results.length).toBeGreaterThan(0);
      for (let i = 1; i < results.length; i++) {
        const rtCurrent = calculateReadingTimeFromContent(results[i].item.content);
        const rtPrev = calculateReadingTimeFromContent(results[i - 1].item.content);
        expect(rtCurrent).toBeGreaterThanOrEqual(rtPrev);
      }
    });

    it('should sort by reading time descending', () => {
      const results = searchArticles({ query: '', sortBy: 'readingTime', sortOrder: 'desc' });
      expect(results.length).toBeGreaterThan(0);
      for (let i = 1; i < results.length; i++) {
        const rtCurrent = calculateReadingTimeFromContent(results[i].item.content);
        const rtPrev = calculateReadingTimeFromContent(results[i - 1].item.content);
        expect(rtCurrent).toBeLessThanOrEqual(rtPrev);
      }
    });
  });

  describe('Result Limiting', () => {
    it('should limit results', () => {
      const results = searchArticles({ query: '', limit: 2 });
      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should return all results when no limit is specified', () => {
      const results = searchArticles({ query: '' });
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Text Highlighting', () => {
    it('should highlight matched text in title', () => {
      const results = searchArticles({ query: 'React' });
      expect(results[0].highlightedTitle).toBeDefined();
      expect(results[0].highlightedTitle.length).toBeGreaterThan(0);

      const hasMatches = results[0].highlightedTitle.some(h => h.matches);
      expect(hasMatches).toBe(true);
    });

    it('should highlight matched text in content preview', () => {
      const results = searchArticles({ query: 'Hooks' });
      expect(results[0].highlightedContent).toBeDefined();
      expect(results[0].highlightedContent.length).toBeGreaterThan(0);
    });

    it('should provide match highlights', () => {
      const results = searchArticles({ query: 'TypeScript patterns' });
      expect(results[0].matchHighlights).toBeDefined();
      expect(Array.isArray(results[0].matchHighlights)).toBe(true);
    });
  });

  describe('Helper Functions', () => {
    it('should return available sections', () => {
      const sections = getAvailableSections();
      expect(sections).toBeDefined();
      expect(Array.isArray(sections)).toBe(true);
      expect(sections.length).toBeGreaterThan(0);
    });

    it('should return reading time range', () => {
      const range = getReadingTimeRange();
      expect(range).toBeDefined();
      expect(range.min).toBeLessThanOrEqual(range.max);
      expect(range.min).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in query', () => {
      const results = searchArticles({ query: 'C++ & JavaScript' });
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle very short queries', () => {
      const results = searchArticles({ query: 'a' });
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle queries with no matches', () => {
      const results = searchArticles({ query: 'xyznonexistent' });
      expect(results).toHaveLength(0);
    });

    it('should handle filters with no matching results', () => {
      const results = searchArticles({
        query: '',
        filters: { section: 'Nonexistent Section' },
      });
      expect(results).toHaveLength(0);
    });
  });

  describe('Performance', () => {
    it('should return results quickly', () => {
      const start = Date.now();
      searchArticles({ query: 'React' });
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should handle multiple filters efficiently', () => {
      const start = Date.now();
      searchArticles({
        query: 'JavaScript',
        filters: {
          section: 'Frontend Development',
          hasCode: true,
          minReadingTime: 2,
          maxReadingTime: 10,
        },
        sortBy: 'relevance',
        limit: 10,
      });
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });
});
