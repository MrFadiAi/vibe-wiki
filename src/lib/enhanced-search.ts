import Fuse, { FuseResult } from 'fuse.js';
import { allArticles } from '@/lib/article-utils';

export interface SearchFilters {
  section?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  hasCode?: boolean;
  minReadingTime?: number;
  maxReadingTime?: number;
}

export interface SearchOptions {
  query: string;
  filters?: SearchFilters;
  sortBy?: 'relevance' | 'title' | 'readingTime';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export interface HighlightedText {
  text: string;
  matches: boolean;
}

export interface EnhancedSearchResult {
  item: WikiArticle;
  score: number;
  highlightedTitle: HighlightedText[];
  highlightedContent: HighlightedText[];
  matchHighlights: string[];
}

interface ExtendedSearchResult extends FuseResult<WikiArticle> {
  item: WikiArticle & { readingTime?: number };
}

const fuseOptions = {
  keys: [
    { name: 'title', weight: 0.6 },
    { name: 'content', weight: 0.3 },
    { name: 'section', weight: 0.1 },
  ],
  threshold: 0.3,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
};

let searchIndex: Fuse<WikiArticle> | null = null;

function getSearchIndex(): Fuse<WikiArticle> {
  if (!searchIndex) {
    const articlesWithReadingTime = allArticles.map(article => ({
      ...article,
      readingTime: calculateReadingTime(article.content),
    }));
    searchIndex = new Fuse(articlesWithReadingTime, fuseOptions);
  }
  return searchIndex;
}

function highlightText(text: string, indices: ReadonlyArray<[number, number]>): HighlightedText[] {
  if (!indices || indices.length === 0) {
    return [{ text, matches: false }];
  }

  const result: HighlightedText[] = [];
  let lastIndex = 0;

  const sortedIndices = [...indices].sort((a, b) => a[0] - b[0]);

  for (const [start, end] of sortedIndices) {
    if (start > lastIndex) {
      result.push({ text: text.slice(lastIndex, start), matches: false });
    }
    result.push({ text: text.slice(start, end + 1), matches: true });
    lastIndex = end + 1;
  }

  if (lastIndex < text.length) {
    result.push({ text: text.slice(lastIndex), matches: false });
  }

  return result;
}

function extractContentPreview(content: string, matches: ReadonlyArray<Fuse.FuseMatch> | undefined, maxLength = 200): string {
  if (!matches || matches.length === 0) {
    return content.slice(0, maxLength) + (content.length > maxLength ? '...' : '');
  }

  const contentMatches = matches.filter(m => m.key === 'content');
  if (contentMatches.length === 0) {
    return content.slice(0, maxLength) + (content.length > maxLength ? '...' : '');
  }

  const firstMatch = contentMatches[0].indices?.[0];
  if (!firstMatch) {
    return content.slice(0, maxLength) + (content.length > maxLength ? '...' : '');
  }

  const start = Math.max(0, firstMatch[0] - 50);
  const end = Math.min(content.length, firstMatch[1] + 50);
  const preview = content.slice(start, end);

  return (start > 0 ? '...' : '') + preview + (end < content.length ? '...' : '');
}

function applyFilters(results: ExtendedSearchResult[], filters?: SearchFilters): ExtendedSearchResult[] {
  if (!filters) {
    return results;
  }

  return results.filter(result => {
    if (filters.section && result.item.section !== filters.section) {
      return false;
    }

    if (filters.hasCode && (!result.item.codeBlocks || result.item.codeBlocks.length === 0)) {
      return false;
    }

    if (filters.minReadingTime) {
      const readingTime = result.item.readingTime || 0;
      if (readingTime < filters.minReadingTime) {
        return false;
      }
    }

    if (filters.maxReadingTime) {
      const readingTime = result.item.readingTime || 0;
      if (readingTime > filters.maxReadingTime) {
        return false;
      }
    }

    return true;
  });
}

function sortResults(results: ExtendedSearchResult[], sortBy: SearchOptions['sortBy'] = 'relevance', sortOrder: SearchOptions['sortOrder'] = 'asc'): ExtendedSearchResult[] {
  const sorted = [...results];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'title':
        comparison = a.item.title.localeCompare(b.item.title);
        break;
      case 'readingTime':
        const aTime = a.item.readingTime || 0;
        const bTime = b.item.readingTime || 0;
        comparison = aTime - bTime;
        break;
      case 'relevance':
      default:
        const aScore = a.score || 1;
        const bScore = b.score || 1;
        comparison = aScore - bScore;
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

function extractMatchHighlights(matches: ReadonlyArray<Fuse.FuseMatch> | undefined): string[] {
  if (!matches) {
    return [];
  }

  const highlights: string[] = [];

  for (const match of matches) {
    if (match.indices && match.indices.length > 0) {
      const text = match.value || '';
      for (const [start, end] of match.indices.slice(0, 2)) {
        const highlight = text.slice(start, end + 1);
        if (highlight.length >= 3 && !highlights.includes(highlight)) {
          highlights.push(highlight);
        }
      }
    }
  }

  return highlights;
}

export function searchArticles(options: SearchOptions): EnhancedSearchResult[] {
  const index = getSearchIndex();

  let results: ExtendedSearchResult[] = options.query
    ? index.search(options.query) as ExtendedSearchResult[]
    : allArticles.map(article => ({
        item: { ...article, readingTime: calculateReadingTime(article.content) },
        score: 0,
      }));

  results = applyFilters(results, options.filters);
  results = sortResults(results, options.sortBy, options.sortOrder);

  const limited = options.limit ? results.slice(0, options.limit) : results;

  return limited.map(result => {
    const titleMatches = result.matches?.find(m => m.key === 'title');
    const contentMatches = result.matches?.find(m => m.key === 'content');

    return {
      item: {
        slug: result.item.slug,
        title: result.item.title,
        section: result.item.section,
        content: result.item.content,
        codeBlocks: result.item.codeBlocks,
      },
      score: result.score || 0,
      highlightedTitle: highlightText(result.item.title, titleMatches?.indices || []),
      highlightedContent: highlightText(
        extractContentPreview(result.item.content, result.matches),
        contentMatches?.indices || []
      ),
      matchHighlights: extractMatchHighlights(result.matches),
    };
  });
}

export function getAvailableSections(): string[] {
  const sections = new Set(allArticles.map(a => a.section));
  return Array.from(sections).sort();
}

export function getReadingTimeRange(): { min: number; max: number } {
  const times = allArticles.map(a => calculateReadingTime(a.content));
  return {
    min: Math.min(...times),
    max: Math.max(...times),
  };
}

function calculateReadingTime(content: string, wordsPerMinute = 200): number {
  const wordCount = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/[#*_\[\]()>-]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0).length;

  return Math.ceil(wordCount / wordsPerMinute);
}

export interface WikiArticle {
  slug: string;
  title: string;
  section: string;
  content: string;
  codeBlocks?: Array<{
    language: string;
    code: string;
    title?: string;
  }>;
}
