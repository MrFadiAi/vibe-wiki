import {
  Article,
  CreateArticleInput,
  UpdateArticleInput,
  ArticleQueryOptions,
  PaginatedResult,
  CMSConfig,
  DEFAULT_CMS_CONFIG,
  Category,
  Tag,
  Author,
} from './types';
import { validateArticle, generateExcerpt, calculateWordCount, calculateReadingTime } from './validation';

export class ContentService {
  private articles: Map<string, Article> = new Map();
  private categories: Map<string, Category> = new Map();
  private tags: Map<string, Tag> = new Map();
  private authors: Map<string, Author> = new Map();
  private config: CMSConfig;

  constructor(config: Partial<CMSConfig> = {}) {
    this.config = { ...DEFAULT_CMS_CONFIG, ...config };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  createArticle(input: CreateArticleInput): Article {
    const validation = validateArticle(input, this.config);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.map((e: { message: string }) => e.message).join(', ')}`);
    }

    const now = new Date();
    const wordCount = calculateWordCount(input.content);
    const readingTime = calculateReadingTime(input.content, this.config.wordsPerMinute);

    const article: Article = {
      id: this.generateId(),
      slug: input.slug,
      title: input.title,
      content: input.content,
      excerpt: input.excerpt || generateExcerpt(input.content, this.config.maxExcerptLength),
      section: input.section,
      categoryId: input.categoryId,
      status: input.status || this.config.defaultStatus,
      difficulty: input.difficulty,
      authorId: input.authorId,
      tags: input.tags || [],
      codeBlocks: input.codeBlocks || [],
      featured: input.featured || false,
      order: input.order ?? this.articles.size,
      metadata: {
        createdAt: now,
        updatedAt: now,
        publishedAt: input.status === 'published' ? now : undefined,
        readingTime,
        wordCount,
        views: 0,
        likes: 0,
      },
    };

    this.articles.set(article.id, article);
    return article;
  }

  getArticle(id: string): Article | undefined {
    return this.articles.get(id);
  }

  getArticleBySlug(slug: string): Article | undefined {
    return Array.from(this.articles.values()).find(a => a.slug === slug);
  }

  updateArticle(id: string, input: UpdateArticleInput): Article {
    const existing = this.articles.get(id);
    if (!existing) {
      throw new Error(`Article not found: ${id}`);
    }

    const merged: CreateArticleInput = {
      slug: input.slug ?? existing.slug,
      title: input.title ?? existing.title,
      content: input.content ?? existing.content,
      excerpt: input.excerpt ?? existing.excerpt,
      section: input.section ?? existing.section,
      categoryId: input.categoryId ?? existing.categoryId,
      status: input.status ?? existing.status,
      difficulty: input.difficulty ?? existing.difficulty,
      authorId: input.authorId ?? existing.authorId,
      tags: input.tags ?? existing.tags,
      codeBlocks: input.codeBlocks ?? existing.codeBlocks,
      featured: input.featured ?? existing.featured,
      order: input.order ?? existing.order,
    };

    const validation = validateArticle(merged, this.config);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.map((e: { message: string }) => e.message).join(', ')}`);
    }

    const now = new Date();
    const contentChanged = input.content !== undefined && input.content !== existing.content;
    const wasPublished = existing.status === 'published';
    const nowPublished = merged.status === 'published';

    const updated: Article = {
      ...existing,
      ...merged,
      metadata: {
        ...existing.metadata,
        updatedAt: now,
        publishedAt: !wasPublished && nowPublished ? now : existing.metadata.publishedAt,
        readingTime: contentChanged 
          ? calculateReadingTime(merged.content, this.config.wordsPerMinute) 
          : existing.metadata.readingTime,
        wordCount: contentChanged 
          ? calculateWordCount(merged.content) 
          : existing.metadata.wordCount,
      },
    };

    this.articles.set(id, updated);
    return updated;
  }

  deleteArticle(id: string): boolean {
    return this.articles.delete(id);
  }

  queryArticles(options: ArticleQueryOptions = {}): PaginatedResult<Article> {
    let results = Array.from(this.articles.values());

    if (options.status) {
      results = results.filter(a => a.status === options.status);
    }

    if (options.categoryId) {
      results = results.filter(a => a.categoryId === options.categoryId);
    }

    if (options.tags && options.tags.length > 0) {
      results = results.filter(a => 
        options.tags!.some(tag => a.tags?.includes(tag))
      );
    }

    if (options.authorId) {
      results = results.filter(a => a.authorId === options.authorId);
    }

    if (options.featured !== undefined) {
      results = results.filter(a => a.featured === options.featured);
    }

    if (options.difficulty) {
      results = results.filter(a => a.difficulty === options.difficulty);
    }

    if (options.search) {
      const searchLower = options.search.toLowerCase();
      results = results.filter(a => 
        a.title.toLowerCase().includes(searchLower) ||
        a.content.toLowerCase().includes(searchLower) ||
        a.excerpt?.toLowerCase().includes(searchLower)
      );
    }

    const orderBy = options.orderBy || 'order';
    const direction = options.orderDirection || 'asc';
    
    results.sort((a, b) => {
      let aVal: string | number | Date | undefined;
      let bVal: string | number | Date | undefined;

      switch (orderBy) {
        case 'createdAt':
          aVal = a.metadata.createdAt;
          bVal = b.metadata.createdAt;
          break;
        case 'updatedAt':
          aVal = a.metadata.updatedAt;
          bVal = b.metadata.updatedAt;
          break;
        case 'publishedAt':
          aVal = a.metadata.publishedAt;
          bVal = b.metadata.publishedAt;
          break;
        case 'title':
          aVal = a.title;
          bVal = b.title;
          break;
        case 'order':
        default:
          aVal = a.order ?? 0;
          bVal = b.order ?? 0;
      }

      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal === undefined) return direction === 'asc' ? 1 : -1;
      if (bVal === undefined) return direction === 'asc' ? -1 : 1;

      if (aVal instanceof Date && bVal instanceof Date) {
        return direction === 'asc' 
          ? aVal.getTime() - bVal.getTime() 
          : bVal.getTime() - aVal.getTime();
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    const total = results.length;
    const limit = options.limit || 20;
    const offset = options.offset || 0;
    
    results = results.slice(offset, offset + limit);

    return {
      items: results,
      total,
      limit,
      offset,
      hasMore: offset + results.length < total,
    };
  }

  getAllArticles(): Article[] {
    return Array.from(this.articles.values());
  }

  getPublishedArticles(): Article[] {
    return this.queryArticles({ status: 'published' }).items;
  }

  createCategory(category: Omit<Category, 'id'>): Category {
    const newCategory: Category = {
      ...category,
      id: this.generateId(),
    };
    this.categories.set(newCategory.id, newCategory);
    return newCategory;
  }

  getCategory(id: string): Category | undefined {
    return this.categories.get(id);
  }

  getCategoryBySlug(slug: string): Category | undefined {
    return Array.from(this.categories.values()).find(c => c.slug === slug);
  }

  getAllCategories(): Category[] {
    return Array.from(this.categories.values()).sort((a, b) => a.order - b.order);
  }

  updateCategory(id: string, updates: Partial<Omit<Category, 'id'>>): Category {
    const existing = this.categories.get(id);
    if (!existing) {
      throw new Error(`Category not found: ${id}`);
    }
    const updated = { ...existing, ...updates };
    this.categories.set(id, updated);
    return updated;
  }

  deleteCategory(id: string): boolean {
    const hasArticles = Array.from(this.articles.values()).some(a => a.categoryId === id);
    if (hasArticles) {
      throw new Error('Cannot delete category with associated articles');
    }
    return this.categories.delete(id);
  }

  createTag(tag: Omit<Tag, 'id'>): Tag {
    const newTag: Tag = {
      ...tag,
      id: this.generateId(),
    };
    this.tags.set(newTag.id, newTag);
    return newTag;
  }

  getTag(id: string): Tag | undefined {
    return this.tags.get(id);
  }

  getTagBySlug(slug: string): Tag | undefined {
    return Array.from(this.tags.values()).find(t => t.slug === slug);
  }

  getAllTags(): Tag[] {
    return Array.from(this.tags.values());
  }

  deleteTag(id: string): boolean {
    return this.tags.delete(id);
  }

  createAuthor(author: Omit<Author, 'id'>): Author {
    const newAuthor: Author = {
      ...author,
      id: this.generateId(),
    };
    this.authors.set(newAuthor.id, newAuthor);
    return newAuthor;
  }

  getAuthor(id: string): Author | undefined {
    return this.authors.get(id);
  }

  getAllAuthors(): Author[] {
    return Array.from(this.authors.values());
  }

  deleteAuthor(id: string): boolean {
    const hasArticles = Array.from(this.articles.values()).some(a => a.authorId === id);
    if (hasArticles) {
      throw new Error('Cannot delete author with associated articles');
    }
    return this.authors.delete(id);
  }

  publishArticle(id: string): Article {
    return this.updateArticle(id, { status: 'published' });
  }

  unpublishArticle(id: string): Article {
    return this.updateArticle(id, { status: 'draft' });
  }

  archiveArticle(id: string): Article {
    return this.updateArticle(id, { status: 'archived' });
  }

  getArticlesByCategory(categoryId: string): Article[] {
    return this.queryArticles({ categoryId }).items;
  }

  getArticlesByTag(tagId: string): Article[] {
    return this.queryArticles({ tags: [tagId] }).items;
  }

  getArticlesByAuthor(authorId: string): Article[] {
    return this.queryArticles({ authorId }).items;
  }

  getFeaturedArticles(): Article[] {
    return this.queryArticles({ featured: true, status: 'published' }).items;
  }

  searchArticles(query: string): Article[] {
    return this.queryArticles({ search: query, status: 'published' }).items;
  }

  getArticleCount(): number {
    return this.articles.size;
  }

  getPublishedArticleCount(): number {
    return this.getPublishedArticles().length;
  }
}

let defaultService: ContentService | null = null;

export function getContentService(): ContentService {
  if (!defaultService) {
    defaultService = new ContentService();
  }
  return defaultService;
}

export function createContentService(config?: Partial<CMSConfig>): ContentService {
  return new ContentService(config);
}
