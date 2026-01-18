import { wikiContent, WikiArticle } from "@/data/wiki-content";

// Flatten all articles for easy access
export const allArticles: WikiArticle[] = wikiContent.flatMap((section) => section.articles);

export function getArticleBySlug(slug: string): WikiArticle | undefined {
  const article = allArticles.find((article) => article.slug === slug);
  if (article) {
    // Clean content to remove duplicate H1 titles if they exist
    const cleanContent = article.content.replace(/^#\s+.+\n+/, "");
    return { ...article, content: cleanContent };
  }
  return undefined;
}

export function getPrevNextArticles(currentSlug: string) {
  const currentIndex = allArticles.findIndex((a) => a.slug === currentSlug);
  
  if (currentIndex === -1) return { prev: null, next: null };
  
  const prev = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const next = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;
  
  return { prev, next };
}

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

// Extract headings from markdown content
export function extractHeadings(content: string): TocHeading[] {
  const headings: TocHeading[] = [];
  
  // Match ## and ### headings
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .replace(/[^\w\s\u0600-\u06FF-]/g, "") // Allow Arabic characters
      .replace(/\s+/g, "-")
      .toLowerCase();

    headings.push({ id, text, level });
  }

  return headings;
}

// Calculate reading time from content
export function calculateReadingTime(content: string, wordsPerMinute = 200): number {
  const wordCount = content
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/`[^`]+`/g, "") // Remove inline code
    .replace(/[#*_\[\]()>-]/g, "") // Remove markdown syntax
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  return Math.ceil(wordCount / wordsPerMinute);
}
