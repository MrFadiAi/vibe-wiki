import { wikiContent, WikiArticle } from "@/data/wiki-content";
import { getInitializedContentService } from "@/lib/cms/data-loader";
import { Article } from "@/lib/cms";

export const allArticles: WikiArticle[] = wikiContent.flatMap((section) => section.articles);

export function getArticleBySlug(slug: string): WikiArticle | undefined {
  const service = getInitializedContentService();
  const article = service.getArticleBySlug(slug);
  
  if (article) {
    const cleanContent = article.content.trim().replace(/^#\s+[^\n]+\n+/, "").trim();
    return {
      slug: article.slug,
      title: article.title,
      section: article.section,
      content: cleanContent,
      codeBlocks: article.codeBlocks?.map(cb => ({
        language: cb.language,
        code: cb.code,
        title: cb.title,
      })),
    };
  }
  
  return undefined;
}

export function getPrevNextArticles(currentSlug: string) {
  const service = getInitializedContentService();
  const allCmsArticles = service.queryArticles({ 
    status: 'published', 
    orderBy: 'order', 
    orderDirection: 'asc' 
  }).items;
  
  const currentIndex = allCmsArticles.findIndex((a: Article) => a.slug === currentSlug);
  
  if (currentIndex === -1) return { prev: null, next: null };
  
  const prevArticle = currentIndex > 0 ? allCmsArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex < allCmsArticles.length - 1 ? allCmsArticles[currentIndex + 1] : null;
  
  const toWikiFormat = (article: Article | null): WikiArticle | null => {
    if (!article) return null;
    return {
      slug: article.slug,
      title: article.title,
      section: article.section,
      content: article.content,
      codeBlocks: article.codeBlocks?.map(cb => ({
        language: cb.language,
        code: cb.code,
        title: cb.title,
      })),
    };
  };
  
  return { 
    prev: toWikiFormat(prevArticle), 
    next: toWikiFormat(nextArticle) 
  };
}

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(content: string): TocHeading[] {
  const headings: TocHeading[] = [];
  
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .replace(/[^\w\s\u0600-\u06FF-]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();

    headings.push({ id, text, level });
  }

  return headings;
}

export function calculateReadingTime(content: string, wordsPerMinute = 200): number {
  const wordCount = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/[#*_\[\]()>-]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Article creation and management utilities
 * Designed to support rapid content creation for Phase 2
 */

export interface ArticleTemplate {
  slug: string;
  title: string;
  section: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

export interface ArticleValidationError {
  field: string;
  message: string;
}

/**
 * Generate a URL-friendly slug from an Arabic or English title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Remove Arabic diacritics and special characters
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces and Arabic content with hyphens
    .replace(/[\s\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^`{|}~]/g, '-')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length
    .substring(0, 100);
}

/**
 * Validate an article object
 */
export function validateArticle(article: Partial<WikiArticle>): ArticleValidationError[] {
  const errors: ArticleValidationError[] = [];

  if (!article.slug?.trim()) {
    errors.push({ field: 'slug', message: 'Slug is required' });
  } else if (!/^[a-z0-9-]+$/.test(article.slug)) {
    errors.push({ field: 'slug', message: 'Slug must contain only lowercase letters, numbers, and hyphens' });
  }

  if (!article.title?.trim()) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (article.title.length < 5) {
    errors.push({ field: 'title', message: 'Title must be at least 5 characters' });
  } else if (article.title.length > 200) {
    errors.push({ field: 'title', message: 'Title must not exceed 200 characters' });
  }

  if (!article.content?.trim()) {
    errors.push({ field: 'content', message: 'Content is required' });
  } else if (article.content.length < 100) {
    errors.push({ field: 'content', message: 'Content must be at least 100 characters' });
  }

  if (!article.section?.trim()) {
    errors.push({ field: 'section', message: 'Section is required' });
  }

  return errors;
}

/**
 * Create a new article with minimal required fields
 */
export function createArticle(
  title: string,
  section: string,
  content: string,
  options?: Partial<Pick<WikiArticle, 'codeBlocks'>>
): WikiArticle {
  const slug = options?.codeBlocks?.length
    ? `${generateSlug(title)}-tutorial`
    : generateSlug(title);

  return {
    slug,
    title: title.trim(),
    section: section.trim(),
    content: content.trim(),
    codeBlocks: options?.codeBlocks || [],
  };
}

/**
 * Create a code block object
 */
export function createCodeBlock(
  language: string,
  code: string,
  title?: string
): WikiArticle['codeBlocks'][number] {
  return {
    language: language.toLowerCase(),
    code: code.trim(),
    title: title?.trim(),
  };
}

/**
 * Check if slug already exists
 */
export function slugExists(slug: string): boolean {
  return allArticles.some(a => a.slug === slug);
}

/**
 * Generate unique slug (appends number if exists)
 */
export function generateUniqueSlug(title: string): string {
  let slug = generateSlug(title);
  let counter = 1;

  while (slugExists(slug)) {
    slug = `${generateSlug(title)}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Generate article template for easy content creation
 */
export function generateArticleTemplate(
  title: string,
  section: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
): string {
  const slug = generateSlug(title);

  return `
# ${title}

**الصعوبة**: ${difficulty}
**القسم**: ${section}
**الslug**: \`${slug}\`

## المقدمة

ابدأ بمقدمة جذابة تشرح موضوع المقال وأهميته.

## المحتوى الرئيسي

أضف المحتوى التعليمي هنا. يمكنك استخدام:
- العناوين (## للعناوين الفرعية)
- القوائم النقطية
- الأكواد مع تحديد اللغة

\`\`\`javascript
// مثال على كود
function example() {
  console.log('Hello, Vibe!');
}
\`\`\`

## الخلاصة

اختم المقال بتلخيص النقاط الرئيسية.
`.trim();
}

/**
 * Get article statistics
 */
export interface ArticleStats {
  totalArticles: number;
  articlesWithCode: number;
  averageReadingTime: number;
}

export function getArticleStats(): ArticleStats {
  const articlesWithCode = allArticles.filter(a => a.codeBlocks && a.codeBlocks.length > 0).length;
  const totalReadingTime = allArticles.reduce((sum, a) => sum + calculateReadingTime(a.content), 0);

  return {
    totalArticles: allArticles.length,
    articlesWithCode,
    averageReadingTime: Math.ceil(totalReadingTime / allArticles.length),
  };
}
