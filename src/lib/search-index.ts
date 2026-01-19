/**
 * Enhanced Search Module
 *
 * This module provides both backward-compatible basic search and new enhanced search functionality.
 *
 * Basic Search:
 *   - Simple fuzzy search across title, content, and section
 *   - Use `searchArticles(query)` for basic functionality
 *
 * Enhanced Search (recommended):
 *   - Advanced search with filters (section, code presence, reading time)
 *   - Multiple sorting options (relevance, title, reading time)
 *   - Result highlighting with match indicators
 *   - Configurable result limits
 *   - Use `searchArticlesEnhanced(options)` for full functionality
 *
 * @module search-index
 */

import { allArticles } from '@/lib/article-utils';
import Fuse from 'fuse.js';

// ============================================
// Basic Search (Backward Compatible)
// ============================================

const options = {
  keys: [
    { name: 'title', weight: 0.7 },
    { name: 'content', weight: 0.3 },
    { name: 'section', weight: 0.5 },
  ],
  threshold: 0.3,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 3,
};

export const searchIndex = new Fuse(allArticles, options);

/**
 * Basic search function for backward compatibility.
 * Performs simple fuzzy search across articles.
 *
 * @param query - The search query string
 * @returns Array of search results with score and matches
 *
 * @example
 * ```ts
 * const results = searchArticles('react hooks');
 * ```
 */
export const searchArticles = (query: string) => {
  if (!query) return [];
  return searchIndex.search(query);
};

export type SearchResult = ReturnType<typeof searchArticles>[number];

// ============================================
// Enhanced Search (New Features)
// ============================================

// Re-export enhanced search functionality from the dedicated module
export {
  searchArticles as searchArticlesBasic,
  searchArticlesEnhanced,
  getAvailableSections,
  getReadingTimeRange,
  type SearchFilters,
  type SearchOptions,
  type EnhancedSearchResult,
  type HighlightedText,
} from './enhanced-search';
