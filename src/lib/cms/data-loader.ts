import { wikiContent, WikiArticle, WikiSection } from '@/data/wiki-content';
import { ContentService, Article } from '@/lib/cms';
import { calculateReadingTime, calculateWordCount, generateExcerpt } from '@/lib/cms/validation';

let initializedService: ContentService | null = null;

function convertWikiArticleToArticle(
  wikiArticle: WikiArticle, 
  categoryId: string, 
  order: number
): Omit<Article, 'id'> {
  const content = wikiArticle.content.trim();
  const now = new Date();
  
  return {
    slug: wikiArticle.slug,
    title: wikiArticle.title,
    content,
    excerpt: generateExcerpt(content, 300),
    section: wikiArticle.section,
    categoryId,
    status: 'published',
    tags: [],
    codeBlocks: wikiArticle.codeBlocks?.map(cb => ({
      language: cb.language,
      code: cb.code,
      title: cb.title,
    })),
    featured: false,
    order,
    metadata: {
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
      readingTime: calculateReadingTime(content),
      wordCount: calculateWordCount(content),
      views: 0,
      likes: 0,
    },
  };
}

export function initializeContentFromWikiData(): ContentService {
  if (initializedService) {
    return initializedService;
  }

  const service = new ContentService();
  let globalArticleOrder = 0;

  wikiContent.forEach((section: WikiSection, sectionIndex: number) => {
    const category = service.createCategory({
      name: section.name,
      slug: section.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50),
      order: sectionIndex,
    });

    section.articles.forEach((wikiArticle: WikiArticle) => {
      const articleData = convertWikiArticleToArticle(
        wikiArticle, 
        category.id, 
        globalArticleOrder++
      );
      
      service.createArticle({
        slug: articleData.slug,
        title: articleData.title,
        content: articleData.content,
        excerpt: articleData.excerpt,
        section: articleData.section,
        categoryId: articleData.categoryId,
        status: articleData.status,
        tags: articleData.tags,
        codeBlocks: articleData.codeBlocks,
        featured: articleData.featured,
        order: articleData.order,
      });
    });
  });

  initializedService = service;
  return service;
}

export function getInitializedContentService(): ContentService {
  return initializeContentFromWikiData();
}

export function resetContentService(): void {
  initializedService = null;
}
