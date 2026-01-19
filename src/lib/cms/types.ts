export type ContentStatus = 'draft' | 'published' | 'archived';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface CodeBlock {
  language: string;
  code: string;
  title?: string;
  runnable?: boolean;
}

export interface Author {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  social?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  order: number;
  icon?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

export interface ArticleMetadata {
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  readingTime: number;
  wordCount: number;
  views?: number;
  likes?: number;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  section: string;
  categoryId: string;
  status: ContentStatus;
  difficulty?: DifficultyLevel;
  authorId?: string;
  tags?: string[];
  codeBlocks?: CodeBlock[];
  metadata: ArticleMetadata;
  featured?: boolean;
  order?: number;
}

export interface CreateArticleInput {
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  section: string;
  categoryId: string;
  status?: ContentStatus;
  difficulty?: DifficultyLevel;
  authorId?: string;
  tags?: string[];
  codeBlocks?: CodeBlock[];
  featured?: boolean;
  order?: number;
}

export interface UpdateArticleInput {
  slug?: string;
  title?: string;
  content?: string;
  excerpt?: string;
  section?: string;
  categoryId?: string;
  status?: ContentStatus;
  difficulty?: DifficultyLevel;
  authorId?: string;
  tags?: string[];
  codeBlocks?: CodeBlock[];
  featured?: boolean;
  order?: number;
}

export interface ArticleQueryOptions {
  status?: ContentStatus;
  categoryId?: string;
  tags?: string[];
  authorId?: string;
  featured?: boolean;
  difficulty?: DifficultyLevel;
  limit?: number;
  offset?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'order' | 'title';
  orderDirection?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface CMSConfig {
  defaultStatus: ContentStatus;
  wordsPerMinute: number;
  maxTitleLength: number;
  maxSlugLength: number;
  maxExcerptLength: number;
  requiredFields: (keyof CreateArticleInput)[];
}

export const DEFAULT_CMS_CONFIG: CMSConfig = {
  defaultStatus: 'draft',
  wordsPerMinute: 200,
  maxTitleLength: 200,
  maxSlugLength: 100,
  maxExcerptLength: 300,
  requiredFields: ['slug', 'title', 'content', 'section', 'categoryId'],
};
