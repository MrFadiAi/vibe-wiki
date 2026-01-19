import {
  CreateArticleInput,
  ValidationResult,
  ValidationError,
  CMSConfig,
  DEFAULT_CMS_CONFIG,
} from './types';

export function validateSlug(slug: string, maxLength: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!slug || slug.trim().length === 0) {
    errors.push({
      field: 'slug',
      message: 'Slug is required',
      code: 'REQUIRED',
    });
    return errors;
  }

  if (slug.length > maxLength) {
    errors.push({
      field: 'slug',
      message: `Slug must be ${maxLength} characters or less`,
      code: 'MAX_LENGTH',
    });
  }

  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugPattern.test(slug)) {
    errors.push({
      field: 'slug',
      message: 'Slug must contain only lowercase letters, numbers, and hyphens',
      code: 'INVALID_FORMAT',
    });
  }

  return errors;
}

export function validateTitle(title: string, maxLength: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!title || title.trim().length === 0) {
    errors.push({
      field: 'title',
      message: 'Title is required',
      code: 'REQUIRED',
    });
    return errors;
  }

  if (title.length > maxLength) {
    errors.push({
      field: 'title',
      message: `Title must be ${maxLength} characters or less`,
      code: 'MAX_LENGTH',
    });
  }

  return errors;
}

export function validateContent(content: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!content || content.trim().length === 0) {
    errors.push({
      field: 'content',
      message: 'Content is required',
      code: 'REQUIRED',
    });
  }

  return errors;
}

export function validateSection(section: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!section || section.trim().length === 0) {
    errors.push({
      field: 'section',
      message: 'Section is required',
      code: 'REQUIRED',
    });
  }

  return errors;
}

export function validateCategoryId(categoryId: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!categoryId || categoryId.trim().length === 0) {
    errors.push({
      field: 'categoryId',
      message: 'Category is required',
      code: 'REQUIRED',
    });
  }

  return errors;
}

export function validateExcerpt(excerpt: string | undefined, maxLength: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (excerpt && excerpt.length > maxLength) {
    errors.push({
      field: 'excerpt',
      message: `Excerpt must be ${maxLength} characters or less`,
      code: 'MAX_LENGTH',
    });
  }

  return errors;
}

export function validateArticle(
  input: CreateArticleInput,
  config: CMSConfig = DEFAULT_CMS_CONFIG
): ValidationResult {
  const errors: ValidationError[] = [];

  errors.push(...validateSlug(input.slug, config.maxSlugLength));
  errors.push(...validateTitle(input.title, config.maxTitleLength));
  errors.push(...validateContent(input.content));
  errors.push(...validateSection(input.section));
  errors.push(...validateCategoryId(input.categoryId));
  errors.push(...validateExcerpt(input.excerpt, config.maxExcerptLength));

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function calculateWordCount(content: string): number {
  return content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/[#*_\[\]()>-]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0).length;
}

export function calculateReadingTime(content: string, wordsPerMinute: number = 200): number {
  const wordCount = calculateWordCount(content);
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function generateExcerpt(content: string, maxLength: number = 300): string {
  const plainText = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/[#*_\[\]()>]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  const truncateLength = maxLength - 3;
  const truncated = plainText.substring(0, truncateLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return (lastSpace > truncateLength * 0.8 ? truncated.substring(0, lastSpace) : truncated) + '...';
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function isValidStatus(status: string): boolean {
  return ['draft', 'published', 'archived'].includes(status);
}

export function isValidDifficulty(difficulty: string): boolean {
  return ['beginner', 'intermediate', 'advanced'].includes(difficulty);
}
