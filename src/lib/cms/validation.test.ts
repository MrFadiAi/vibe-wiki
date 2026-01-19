import { describe, it, expect } from 'vitest';
import {
  validateSlug,
  validateTitle,
  validateContent,
  validateArticle,
  calculateWordCount,
  calculateReadingTime,
  generateExcerpt,
  generateSlug,
  isValidStatus,
  isValidDifficulty,
} from './validation';
import { DEFAULT_CMS_CONFIG } from './types';

describe('Validation Utilities', () => {
  describe('validateSlug', () => {
    it('accepts valid slugs', () => {
      expect(validateSlug('valid-slug', 100)).toHaveLength(0);
      expect(validateSlug('test123', 100)).toHaveLength(0);
      expect(validateSlug('my-article-title', 100)).toHaveLength(0);
    });

    it('rejects empty slug', () => {
      const errors = validateSlug('', 100);
      expect(errors.length).toBe(1);
      expect(errors[0].code).toBe('REQUIRED');
    });

    it('rejects slug exceeding max length', () => {
      const longSlug = 'a'.repeat(101);
      const errors = validateSlug(longSlug, 100);
      expect(errors.some(e => e.code === 'MAX_LENGTH')).toBe(true);
    });

    it('rejects invalid characters', () => {
      expect(validateSlug('UPPERCASE', 100).some(e => e.code === 'INVALID_FORMAT')).toBe(true);
      expect(validateSlug('has spaces', 100).some(e => e.code === 'INVALID_FORMAT')).toBe(true);
      expect(validateSlug('has_underscores', 100).some(e => e.code === 'INVALID_FORMAT')).toBe(true);
      expect(validateSlug('has.dots', 100).some(e => e.code === 'INVALID_FORMAT')).toBe(true);
    });
  });

  describe('validateTitle', () => {
    it('accepts valid titles', () => {
      expect(validateTitle('Valid Title', 200)).toHaveLength(0);
      expect(validateTitle('عنوان باللغة العربية', 200)).toHaveLength(0);
    });

    it('rejects empty title', () => {
      const errors = validateTitle('', 200);
      expect(errors[0].code).toBe('REQUIRED');
    });

    it('rejects title exceeding max length', () => {
      const longTitle = 'a'.repeat(201);
      const errors = validateTitle(longTitle, 200);
      expect(errors.some(e => e.code === 'MAX_LENGTH')).toBe(true);
    });
  });

  describe('validateContent', () => {
    it('accepts non-empty content', () => {
      expect(validateContent('Some content here')).toHaveLength(0);
    });

    it('rejects empty content', () => {
      expect(validateContent('')[0].code).toBe('REQUIRED');
      expect(validateContent('   ')[0].code).toBe('REQUIRED');
    });
  });

  describe('validateArticle', () => {
    const validInput = {
      slug: 'test-article',
      title: 'Test Article',
      content: 'Test content here',
      section: 'Test Section',
      categoryId: 'cat-1',
    };

    it('validates complete valid article', () => {
      const result = validateArticle(validInput, DEFAULT_CMS_CONFIG);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns all validation errors', () => {
      const result = validateArticle({
        slug: '',
        title: '',
        content: '',
        section: '',
        categoryId: '',
      }, DEFAULT_CMS_CONFIG);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

describe('Content Utilities', () => {
  describe('calculateWordCount', () => {
    it('counts words correctly', () => {
      expect(calculateWordCount('one two three four five')).toBe(5);
    });

    it('ignores code blocks', () => {
      const content = 'before ```code block``` after';
      expect(calculateWordCount(content)).toBe(2);
    });

    it('ignores inline code', () => {
      const content = 'before `code` after';
      expect(calculateWordCount(content)).toBe(2);
    });

    it('ignores markdown syntax', () => {
      const content = '# Heading\n- item one\n- item two';
      expect(calculateWordCount(content)).toBeGreaterThan(0);
    });
  });

  describe('calculateReadingTime', () => {
    it('calculates reading time correctly', () => {
      const words200 = Array(200).fill('word').join(' ');
      expect(calculateReadingTime(words200, 200)).toBe(1);

      const words400 = Array(400).fill('word').join(' ');
      expect(calculateReadingTime(words400, 200)).toBe(2);
    });

    it('returns minimum 1 minute', () => {
      expect(calculateReadingTime('short', 200)).toBe(1);
    });
  });

  describe('generateExcerpt', () => {
    it('generates excerpt from content', () => {
      const content = 'This is a test paragraph with some content.';
      const excerpt = generateExcerpt(content, 300);
      expect(excerpt).toBe(content);
    });

    it('truncates long content', () => {
      const longContent = 'word '.repeat(100);
      const excerpt = generateExcerpt(longContent, 50);
      expect(excerpt.length).toBeLessThanOrEqual(53);
      expect(excerpt.endsWith('...')).toBe(true);
    });

    it('removes markdown formatting', () => {
      const content = '## Heading\n**bold** and *italic* [link](url)';
      const excerpt = generateExcerpt(content, 300);
      expect(excerpt).not.toContain('#');
      expect(excerpt).not.toContain('**');
    });
  });

  describe('generateSlug', () => {
    it('generates valid slug from title', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('Test Article 123')).toBe('test-article-123');
    });

    it('removes special characters', () => {
      expect(generateSlug("What's New?")).toBe('whats-new');
      expect(generateSlug('Hello & World!')).toBe('hello-world');
    });

    it('handles multiple spaces and hyphens', () => {
      expect(generateSlug('too   many   spaces')).toBe('too-many-spaces');
      expect(generateSlug('already--hyphenated')).toBe('already-hyphenated');
    });
  });

  describe('Type Guards', () => {
    it('validates status correctly', () => {
      expect(isValidStatus('draft')).toBe(true);
      expect(isValidStatus('published')).toBe(true);
      expect(isValidStatus('archived')).toBe(true);
      expect(isValidStatus('invalid')).toBe(false);
    });

    it('validates difficulty correctly', () => {
      expect(isValidDifficulty('beginner')).toBe(true);
      expect(isValidDifficulty('intermediate')).toBe(true);
      expect(isValidDifficulty('advanced')).toBe(true);
      expect(isValidDifficulty('expert')).toBe(false);
    });
  });
});
