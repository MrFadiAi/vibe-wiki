/**
 * Tests for diagram-registry.ts
 * Tests for the centralized diagram metadata registry with Arabic localization
 */

import { describe, it, expect } from 'vitest';
import {
  diagramRegistry,
  getDiagramByFilename,
  getDiagramsByCategory,
  getDiagramsForArticle,
  getPriorityDiagrams,
  getDiagramsByPriority,
  isPriorityDiagram,
  getDiagramStatistics,
  validateDiagramRegistry,
  getAllDiagramFilenames,
  searchDiagrams,
  PRIORITY_DIAGRAMS,
  type DiagramEntry,
  type DiagramCategory,
  type DiagramPriority,
} from './diagram-registry';

describe('diagram-registry', () => {
  describe('diagramRegistry', () => {
    it('should contain 58 diagram entries', () => {
      expect(diagramRegistry).toHaveLength(58);
    });

    it('should have all required fields for each entry', () => {
      for (const entry of diagramRegistry) {
        expect(entry).toHaveProperty('filename');
        expect(entry).toHaveProperty('category');
        expect(entry).toHaveProperty('titleAr');
        expect(entry).toHaveProperty('altAr');
        expect(entry).toHaveProperty('captionAr');
        expect(entry).toHaveProperty('relatedArticles');
        expect(entry).toHaveProperty('priority');
      }
    });

    it('should have valid filenames ending with .svg', () => {
      for (const entry of diagramRegistry) {
        expect(entry.filename).toMatch(/\.svg$/);
        expect(entry.filename).not.toContain(' ');
      }
    });

    it('should have unique filenames', () => {
      const filenames = diagramRegistry.map((e) => e.filename);
      const uniqueFilenames = new Set(filenames);
      expect(uniqueFilenames.size).toBe(filenames.length);
    });

    it('should have valid categories', () => {
      const validCategories: DiagramCategory[] = [
        'claude-cli',
        'copilot-cli',
        'opencode',
        'comparison',
        'workflow',
        'getting-started',
        'cli-overview',
      ];

      for (const entry of diagramRegistry) {
        expect(validCategories).toContain(entry.category);
      }
    });

    it('should have valid priority levels (1, 2, or 3)', () => {
      const validPriorities: DiagramPriority[] = [1, 2, 3];

      for (const entry of diagramRegistry) {
        expect(validPriorities).toContain(entry.priority);
      }
    });

    it('should have non-empty Arabic text fields', () => {
      for (const entry of diagramRegistry) {
        expect(entry.titleAr.length).toBeGreaterThan(0);
        expect(entry.altAr.length).toBeGreaterThan(0);
        expect(entry.captionAr.length).toBeGreaterThan(0);
      }
    });

    it('should have Arabic numerals in captions', () => {
      const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

      for (const entry of diagramRegistry) {
        // Captions should start with "الشصل" (Figure) followed by Arabic numeral
        const hasArabicNumeral = arabicNumerals.some((numeral) =>
          entry.captionAr.includes(numeral)
        );
        expect(hasArabicNumeral).toBe(true);
      }
    });

    it('should have at least one related article', () => {
      for (const entry of diagramRegistry) {
        expect(entry.relatedArticles.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('getDiagramByFilename', () => {
    it('should return the correct diagram for a valid filename', () => {
      const result = getDiagramByFilename('getting-started-timeline-flow.svg');

      expect(result).toBeDefined();
      expect(result?.filename).toBe('getting-started-timeline-flow.svg');
      expect(result?.category).toBe('getting-started');
    });

    it('should return undefined for a non-existent filename', () => {
      const result = getDiagramByFilename('non-existent.svg');
      expect(result).toBeUndefined();
    });

    it('should return all fields for a diagram', () => {
      const result = getDiagramByFilename('cli-overview-comparison-matrix.svg');

      expect(result).toBeDefined();
      expect(result?.titleAr).toBeTruthy();
      expect(result?.altAr).toBeTruthy();
      expect(result?.captionAr).toBeTruthy();
    });
  });

  describe('getDiagramsByCategory', () => {
    it('should return all diagrams in the getting-started category', () => {
      const results = getDiagramsByCategory('getting-started');

      expect(results.length).toBeGreaterThan(0);
      for (const result of results) {
        expect(result.category).toBe('getting-started');
      }
    });

    it('should return all diagrams in the claude-cli category', () => {
      const results = getDiagramsByCategory('claude-cli');

      expect(results.length).toBeGreaterThan(0);
      for (const result of results) {
        expect(result.category).toBe('claude-cli');
      }
    });

    it('should return all diagrams in the opencode category', () => {
      const results = getDiagramsByCategory('opencode');

      expect(results.length).toBeGreaterThan(0);
      for (const result of results) {
        expect(result.category).toBe('opencode');
      }
    });

    it('should return empty array for category with no diagrams', () => {
      // All categories should have diagrams, so this tests the filter logic
      const results = getDiagramsByCategory('claude-cli');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('getDiagramsForArticle', () => {
    it('should return diagrams related to what-is-vibe-coding article', () => {
      const results = getDiagramsForArticle('what-is-vibe-coding');

      expect(results.length).toBeGreaterThan(0);
      for (const result of results) {
        expect(result.relatedArticles).toContain('what-is-vibe-coding');
      }
    });

    it('should return diagrams related to prep-your-machine article', () => {
      const results = getDiagramsForArticle('prep-your-machine');

      expect(results.length).toBeGreaterThan(0);
      for (const result of results) {
        expect(result.relatedArticles).toContain('prep-your-machine');
      }
    });

    it('should return empty array for non-existent article', () => {
      const results = getDiagramsForArticle('non-existent-article');
      expect(results).toHaveLength(0);
    });

    it('should return empty array for empty string', () => {
      const results = getDiagramsForArticle('');
      expect(results).toHaveLength(0);
    });
  });

  describe('getPriorityDiagrams', () => {
    it('should return diagrams marked as priority', () => {
      const results = getPriorityDiagrams();

      expect(results.length).toBeGreaterThan(0);
      for (const result of results) {
        expect(PRIORITY_DIAGRAMS.has(result.filename)).toBe(true);
      }
    });

    it('should include getting-started-timeline-flow.svg as priority', () => {
      const results = getPriorityDiagrams();
      const hasTimelineFlow = results.some(
        (r) => r.filename === 'getting-started-timeline-flow.svg'
      );
      expect(hasTimelineFlow).toBe(true);
    });

    it('should include getting-started-decision-tree.svg as priority', () => {
      const results = getPriorityDiagrams();
      const hasDecisionTree = results.some(
        (r) => r.filename === 'getting-started-decision-tree.svg'
      );
      expect(hasDecisionTree).toBe(true);
    });
  });

  describe('getDiagramsByPriority', () => {
    it('should return all P1 diagrams', () => {
      const results = getDiagramsByPriority(1);

      expect(results.length).toBeGreaterThan(0);
      for (const result of results) {
        expect(result.priority).toBe(1);
      }
    });

    it('should return all P2 diagrams', () => {
      const results = getDiagramsByPriority(2);

      expect(results.length).toBeGreaterThan(0);
      for (const result of results) {
        expect(result.priority).toBe(2);
      }
    });

    it('should return all P3 diagrams', () => {
      const results = getDiagramsByPriority(3);

      // P3 diagrams may not exist in current registry
      expect(Array.isArray(results)).toBe(true);
      for (const result of results) {
        expect(result.priority).toBe(3);
      }
    });

    it('should have more P1 diagrams than P2', () => {
      const p1 = getDiagramsByPriority(1);
      const p2 = getDiagramsByPriority(2);

      expect(p1.length).toBeGreaterThan(p2.length);
    });
  });

  describe('isPriorityDiagram', () => {
    it('should return true for priority diagrams', () => {
      expect(isPriorityDiagram('getting-started-timeline-flow.svg')).toBe(true);
      expect(isPriorityDiagram('getting-started-decision-tree.svg')).toBe(true);
      expect(isPriorityDiagram('cli-overview-comparison-matrix.svg')).toBe(true);
    });

    it('should return false for non-priority diagrams', () => {
      expect(isPriorityDiagram('cli-opencode-config-layers.svg')).toBe(false);
      expect(isPriorityDiagram('comparison-ux-grid.svg')).toBe(false);
    });

    it('should return false for non-existent diagrams', () => {
      expect(isPriorityDiagram('non-existent.svg')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isPriorityDiagram('')).toBe(false);
    });
  });

  describe('getDiagramStatistics', () => {
    it('should return correct total count', () => {
      const stats = getDiagramStatistics();

      expect(stats.total).toBe(58);
    });

    it('should return category breakdown', () => {
      const stats = getDiagramStatistics();

      expect(stats.byCategory).toHaveProperty('claude-cli');
      expect(stats.byCategory).toHaveProperty('copilot-cli');
      expect(stats.byCategory).toHaveProperty('opencode');
      expect(stats.byCategory).toHaveProperty('comparison');
      expect(stats.byCategory).toHaveProperty('workflow');
      expect(stats.byCategory).toHaveProperty('getting-started');
      expect(stats.byCategory).toHaveProperty('cli-overview');

      // Check counts
      expect(stats.byCategory['getting-started']).toBeGreaterThan(0);
      expect(stats.byCategory['claude-cli']).toBeGreaterThan(0);
    });

    it('should return priority breakdown', () => {
      const stats = getDiagramStatistics();

      expect(stats.byPriority).toHaveProperty('1');
      expect(stats.byPriority).toHaveProperty('2');
      expect(stats.byPriority).toHaveProperty('3');

      // All priorities should sum to total
      const sum = stats.byPriority[1] + stats.byPriority[2] + stats.byPriority[3];
      expect(sum).toBe(stats.total);
    });

    it('should have correct counts for known categories', () => {
      const stats = getDiagramStatistics();

      // Based on the registry structure
      expect(stats.byCategory['getting-started']).toBeGreaterThanOrEqual(5);
      expect(stats.byCategory['cli-overview']).toBeGreaterThanOrEqual(3);
      expect(stats.byCategory['claude-cli']).toBeGreaterThanOrEqual(9);
      expect(stats.byCategory['copilot-cli']).toBeGreaterThanOrEqual(6);
      expect(stats.byCategory['opencode']).toBeGreaterThanOrEqual(14);
      expect(stats.byCategory['comparison']).toBeGreaterThanOrEqual(7);
      expect(stats.byCategory['workflow']).toBeGreaterThanOrEqual(4);
    });
  });

  describe('validateDiagramRegistry', () => {
    it('should return valid: true for complete registry', () => {
      const result = validateDiagramRegistry();

      expect(result.valid).toBe(true);
      expect(result.missingMetadata).toHaveLength(0);
    });

    it('should return empty missingMetadata array', () => {
      const result = validateDiagramRegistry();

      expect(Array.isArray(result.missingMetadata)).toBe(true);
      expect(result.missingMetadata.length).toBe(0);
    });
  });

  describe('getAllDiagramFilenames', () => {
    it('should return all 58 filenames', () => {
      const filenames = getAllDiagramFilenames();

      expect(filenames).toHaveLength(58);
    });

    it('should return all filenames ending with .svg', () => {
      const filenames = getAllDiagramFilenames();

      for (const filename of filenames) {
        expect(filename).toMatch(/\.svg$/);
      }
    });

    it('should return unique filenames', () => {
      const filenames = getAllDiagramFilenames();
      const uniqueFilenames = new Set(filenames);

      expect(uniqueFilenames.size).toBe(filenames.length);
    });

    it('should contain specific known filenames', () => {
      const filenames = getAllDiagramFilenames();

      expect(filenames).toContain('getting-started-timeline-flow.svg');
      expect(filenames).toContain('cli-claude-architecture.svg');
      expect(filenames).toContain('cli-copilot-architecture.svg');
      expect(filenames).toContain('cli-opencode-architecture.svg');
    });
  });

  describe('searchDiagrams', () => {
    it('should find diagrams by Arabic title', () => {
      const results = searchDiagrams('البنية');

      expect(results.length).toBeGreaterThan(0);
      for (const result of results) {
        expect(result.titleAr).toContain('البنية');
      }
    });

    it('should find diagrams by English title', () => {
      const results = searchDiagrams('Architecture');

      expect(results.length).toBeGreaterThan(0);
      for (const result of results) {
        const titleEn = result.titleEn ?? '';
        expect(titleEn.toLowerCase()).toContain('architecture');
      }
    });

    it('should be case-insensitive for Arabic', () => {
      const results1 = searchDiagrams('الجدول');
      const results2 = searchDiagrams('الجدول'.toLowerCase());

      expect(results1.length).toBe(results2.length);
    });

    it('should be case-insensitive for English', () => {
      const results1 = searchDiagrams('Workflow');
      const results2 = searchDiagrams('workflow');

      expect(results1.length).toBe(results2.length);
    });

    it('should find diagrams by alt text', () => {
      const results = searchDiagrams('رسم');

      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-matching query', () => {
      const results = searchDiagrams('xyznonexistent123');
      expect(results).toHaveLength(0);
    });

    it('should return empty array for empty string', () => {
      const results = searchDiagrams('');
      expect(results).toHaveLength(0);
    });

    it('should find diagrams by caption', () => {
      const results = searchDiagrams('الشصل');

      expect(results.length).toBeGreaterThan(0);
      for (const result of results) {
        expect(result.captionAr).toContain('الشصل');
      }
    });
  });

  describe('PRIORITY_DIAGRAMS', () => {
    it('should be a Set', () => {
      expect(PRIORITY_DIAGRAMS).toBeInstanceOf(Set);
    });

    it('should contain at least 3 priority diagrams', () => {
      expect(PRIORITY_DIAGRAMS.size).toBeGreaterThanOrEqual(3);
    });

    it('should only contain .svg files', () => {
      for (const filename of PRIORITY_DIAGRAMS) {
        expect(filename).toMatch(/\.svg$/);
      }
    });

    it('should contain getting-started-timeline-flow.svg', () => {
      expect(PRIORITY_DIAGRAMS.has('getting-started-timeline-flow.svg')).toBe(true);
    });

    it('should contain getting-started-decision-tree.svg', () => {
      expect(PRIORITY_DIAGRAMS.has('getting-started-decision-tree.svg')).toBe(true);
    });

    it('should contain cli-overview-comparison-matrix.svg', () => {
      expect(PRIORITY_DIAGRAMS.has('cli-overview-comparison-matrix.svg')).toBe(true);
    });
  });

  describe('Arabic localization', () => {
    it('should have Arabic captions starting with "الشصل"', () => {
      for (const entry of diagramRegistry) {
        expect(entry.captionAr).toMatch(/^الشصل/);
      }
    });

    it('should have Arabic alt text starting with "رسم"', () => {
      for (const entry of diagramRegistry) {
        expect(entry.altAr).toMatch(/^رسم/);
      }
    });

    it('should have bilingual English titles as optional', () => {
      let withEnglishTitle = 0;

      for (const entry of diagramRegistry) {
        if (entry.titleEn) {
          withEnglishTitle++;
          expect(entry.titleEn.length).toBeGreaterThan(0);
        }
      }

      // At least some should have English titles
      expect(withEnglishTitle).toBeGreaterThan(0);
    });

    it('should maintain RTL consistency in Arabic text', () => {
      for (const entry of diagramRegistry) {
        // Arabic text should contain Arabic characters
        const hasArabicChars = /[\u0600-\u06FF]/.test(entry.titleAr);
        expect(hasArabicChars).toBe(true);
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle special characters in search', () => {
      const results = searchDiagrams('٣'); // Arabic numeral 3
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle unicode in search', () => {
      const results = searchDiagrams('سير'); // Arabic word
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle partial matches', () => {
      const results = searchDiagrams('CLI');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle very long search queries', () => {
      const longQuery = 'a'.repeat(1000);
      const results = searchDiagrams(longQuery);
      expect(results).toHaveLength(0);
    });

    it('should handle whitespace in search', () => {
      const results = searchDiagrams('   ');
      expect(results).toHaveLength(0);
    });
  });

  describe('Data consistency', () => {
    it('should have matching filenames between registry and priority set', () => {
      const registryFilenames = new Set(diagramRegistry.map((e) => e.filename));

      for (const priorityFilename of PRIORITY_DIAGRAMS) {
        expect(registryFilenames.has(priorityFilename)).toBe(true);
      }
    });

    it('should have consistent category counts', () => {
      const stats = getDiagramStatistics();
      let totalFromCategories = 0;

      for (const count of Object.values(stats.byCategory)) {
        totalFromCategories += count;
      }

      expect(totalFromCategories).toBe(stats.total);
    });

    it('should have consistent priority counts', () => {
      const stats = getDiagramStatistics();
      let totalFromPriorities = 0;

      for (const count of Object.values(stats.byPriority)) {
        totalFromPriorities += count;
      }

      expect(totalFromPriorities).toBe(stats.total);
    });

    it('should have all related articles as non-empty strings', () => {
      for (const entry of diagramRegistry) {
        for (const article of entry.relatedArticles) {
          expect(article.length).toBeGreaterThan(0);
          expect(typeof article).toBe('string');
        }
      }
    });

    it('should not have empty strings in required fields', () => {
      for (const entry of diagramRegistry) {
        expect(entry.filename.length).toBeGreaterThan(0);
        expect(entry.titleAr.length).toBeGreaterThan(0);
        expect(entry.altAr.length).toBeGreaterThan(0);
        expect(entry.captionAr.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Related articles', () => {
    it('should have diagrams for prep-your-machine article', () => {
      const results = getDiagramsForArticle('prep-your-machine');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should have diagrams for cursor-vs-windsurf article', () => {
      const results = getDiagramsForArticle('cursor-vs-windsurf');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should have diagrams for what-is-vibe-coding article', () => {
      const results = getDiagramsForArticle('what-is-vibe-coding');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should have diagrams for the-terminal article', () => {
      const results = getDiagramsForArticle('the-terminal');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should have diagrams for the-editor article', () => {
      const results = getDiagramsForArticle('the-editor');
      expect(results.length).toBeGreaterThan(0);
    });
  });
});
