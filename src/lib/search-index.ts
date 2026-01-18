import { allArticles } from '@/data/wiki-content';
import Fuse from 'fuse.js';

// Define types manually if namespace import fails or use inferred types
// Fuse instance
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

export const searchArticles = (query: string) => {
  if (!query) return [];
  return searchIndex.search(query);
};

export type SearchResult = ReturnType<typeof searchArticles>[number];
