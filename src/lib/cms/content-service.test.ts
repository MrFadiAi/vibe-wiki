import { describe, it, expect, beforeEach } from 'vitest';
import { ContentService } from './content-service';

describe('ContentService', () => {
  let service: ContentService;

  beforeEach(() => {
    service = new ContentService();
  });

  describe('Article CRUD', () => {
    const validArticleInput = {
      slug: 'test-article',
      title: 'Test Article',
      content: 'This is test content for the article.',
      section: 'Test Section',
      categoryId: 'cat-1',
    };

    it('creates an article with valid input', () => {
      service.createCategory({ name: 'Test Category', slug: 'test-category', order: 0 });
      const article = service.createArticle(validArticleInput);

      expect(article.id).toBeDefined();
      expect(article.slug).toBe('test-article');
      expect(article.title).toBe('Test Article');
      expect(article.status).toBe('draft');
      expect(article.metadata.readingTime).toBeGreaterThan(0);
      expect(article.metadata.wordCount).toBeGreaterThan(0);
    });

    it('throws error for missing required fields', () => {
      expect(() => service.createArticle({
        ...validArticleInput,
        slug: '',
      })).toThrow('Validation failed');
    });

    it('retrieves article by id', () => {
      const created = service.createArticle(validArticleInput);
      const retrieved = service.getArticle(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it('retrieves article by slug', () => {
      service.createArticle(validArticleInput);
      const retrieved = service.getArticleBySlug('test-article');

      expect(retrieved).toBeDefined();
      expect(retrieved?.slug).toBe('test-article');
    });

    it('updates article', () => {
      const created = service.createArticle(validArticleInput);
      const updated = service.updateArticle(created.id, { title: 'Updated Title' });

      expect(updated.title).toBe('Updated Title');
      expect(updated.metadata.updatedAt.getTime()).toBeGreaterThanOrEqual(
        created.metadata.createdAt.getTime()
      );
    });

    it('deletes article', () => {
      const created = service.createArticle(validArticleInput);
      const deleted = service.deleteArticle(created.id);

      expect(deleted).toBe(true);
      expect(service.getArticle(created.id)).toBeUndefined();
    });

    it('publishes article', () => {
      const created = service.createArticle(validArticleInput);
      const published = service.publishArticle(created.id);

      expect(published.status).toBe('published');
      expect(published.metadata.publishedAt).toBeDefined();
    });

    it('unpublishes article', () => {
      const created = service.createArticle({ ...validArticleInput, status: 'published' });
      const unpublished = service.unpublishArticle(created.id);

      expect(unpublished.status).toBe('draft');
    });

    it('archives article', () => {
      const created = service.createArticle(validArticleInput);
      const archived = service.archiveArticle(created.id);

      expect(archived.status).toBe('archived');
    });
  });

  describe('Article Querying', () => {
    beforeEach(() => {
      service.createArticle({
        slug: 'article-1',
        title: 'First Article',
        content: 'Content for first article',
        section: 'Section A',
        categoryId: 'cat-1',
        status: 'published',
        featured: true,
      });
      service.createArticle({
        slug: 'article-2',
        title: 'Second Article',
        content: 'Content for second article',
        section: 'Section A',
        categoryId: 'cat-1',
        status: 'draft',
      });
      service.createArticle({
        slug: 'article-3',
        title: 'Third Article',
        content: 'Content for third article',
        section: 'Section B',
        categoryId: 'cat-2',
        status: 'published',
      });
    });

    it('queries by status', () => {
      const result = service.queryArticles({ status: 'published' });
      expect(result.items.length).toBe(2);
      expect(result.items.every(a => a.status === 'published')).toBe(true);
    });

    it('queries by category', () => {
      const result = service.queryArticles({ categoryId: 'cat-1' });
      expect(result.items.length).toBe(2);
    });

    it('queries featured articles', () => {
      const result = service.queryArticles({ featured: true, status: 'published' });
      expect(result.items.length).toBe(1);
      expect(result.items[0].slug).toBe('article-1');
    });

    it('searches articles', () => {
      const result = service.searchArticles('second');
      expect(result.length).toBe(0);

      const result2 = service.searchArticles('first');
      expect(result2.length).toBe(1);
    });

    it('paginates results', () => {
      const page1 = service.queryArticles({ limit: 2, offset: 0 });
      expect(page1.items.length).toBe(2);
      expect(page1.hasMore).toBe(true);

      const page2 = service.queryArticles({ limit: 2, offset: 2 });
      expect(page2.items.length).toBe(1);
      expect(page2.hasMore).toBe(false);
    });
  });

  describe('Category Management', () => {
    it('creates category', () => {
      const category = service.createCategory({
        name: 'Test Category',
        slug: 'test-category',
        order: 0,
      });

      expect(category.id).toBeDefined();
      expect(category.name).toBe('Test Category');
    });

    it('retrieves category by id', () => {
      const created = service.createCategory({
        name: 'Test Category',
        slug: 'test-category',
        order: 0,
      });
      const retrieved = service.getCategory(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Test Category');
    });

    it('retrieves category by slug', () => {
      service.createCategory({
        name: 'Test Category',
        slug: 'test-category',
        order: 0,
      });
      const retrieved = service.getCategoryBySlug('test-category');

      expect(retrieved).toBeDefined();
      expect(retrieved?.slug).toBe('test-category');
    });

    it('updates category', () => {
      const created = service.createCategory({
        name: 'Test Category',
        slug: 'test-category',
        order: 0,
      });
      const updated = service.updateCategory(created.id, { name: 'Updated Category' });

      expect(updated.name).toBe('Updated Category');
    });

    it('prevents deletion of category with articles', () => {
      const category = service.createCategory({
        name: 'Test Category',
        slug: 'test-category',
        order: 0,
      });
      service.createArticle({
        slug: 'test',
        title: 'Test',
        content: 'Test content',
        section: 'Test',
        categoryId: category.id,
      });

      expect(() => service.deleteCategory(category.id)).toThrow(
        'Cannot delete category with associated articles'
      );
    });

    it('returns categories sorted by order', () => {
      service.createCategory({ name: 'Third', slug: 'third', order: 2 });
      service.createCategory({ name: 'First', slug: 'first', order: 0 });
      service.createCategory({ name: 'Second', slug: 'second', order: 1 });

      const categories = service.getAllCategories();
      expect(categories[0].name).toBe('First');
      expect(categories[1].name).toBe('Second');
      expect(categories[2].name).toBe('Third');
    });
  });

  describe('Tag Management', () => {
    it('creates and retrieves tag', () => {
      const tag = service.createTag({
        name: 'JavaScript',
        slug: 'javascript',
        color: '#f7df1e',
      });

      expect(tag.id).toBeDefined();
      expect(service.getTag(tag.id)?.name).toBe('JavaScript');
      expect(service.getTagBySlug('javascript')?.color).toBe('#f7df1e');
    });

    it('deletes tag', () => {
      const tag = service.createTag({ name: 'Test', slug: 'test' });
      expect(service.deleteTag(tag.id)).toBe(true);
      expect(service.getTag(tag.id)).toBeUndefined();
    });
  });

  describe('Author Management', () => {
    it('creates and retrieves author', () => {
      const author = service.createAuthor({
        name: 'John Doe',
        bio: 'A test author',
        social: { github: 'johndoe' },
      });

      expect(author.id).toBeDefined();
      expect(service.getAuthor(author.id)?.name).toBe('John Doe');
    });

    it('prevents deletion of author with articles', () => {
      const author = service.createAuthor({ name: 'Test Author' });
      service.createArticle({
        slug: 'test',
        title: 'Test',
        content: 'Test content',
        section: 'Test',
        categoryId: 'cat-1',
        authorId: author.id,
      });

      expect(() => service.deleteAuthor(author.id)).toThrow(
        'Cannot delete author with associated articles'
      );
    });
  });
});
