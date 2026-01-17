// Utility functions for article processing - can be used in both server and client

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
