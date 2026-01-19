import type {
  LearningPath,
  PathItem,
  PathItemType,
  PathProgress,
  DifficultyLevel,
} from "@/types";

/**
 * Validates a learning path object
 */
export function validateLearningPath(path: LearningPath): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!path.id || typeof path.id !== "string") {
    errors.push("Path must have a valid id");
  }
  if (!path.slug || typeof path.slug !== "string") {
    errors.push("Path must have a valid slug");
  } else if (!/^[a-z0-9-]+$/.test(path.slug)) {
    errors.push("Slug must contain only lowercase letters, numbers, and hyphens");
  }
  if (!path.title || typeof path.title !== "string" || path.title.length < 5) {
    errors.push("Path title must be at least 5 characters long");
  }
  if (!path.description || typeof path.description !== "string" || path.description.length < 20) {
    errors.push("Path description must be at least 20 characters long");
  }

  // Difficulty validation
  const validDifficulties: DifficultyLevel[] = ["beginner", "intermediate", "advanced"];
  if (!path.difficulty || !validDifficulties.includes(path.difficulty)) {
    errors.push("Path must have a valid difficulty level (beginner, intermediate, or advanced)");
  }

  // Estimated time
  if (!path.estimatedMinutes || path.estimatedMinutes < 1) {
    errors.push("Path must have a valid estimated duration (at least 1 minute)");
  }

  // Target audience
  if (!path.targetAudience || !Array.isArray(path.targetAudience) || path.targetAudience.length === 0) {
    errors.push("Path must have at least one target audience");
  }

  // Learning objectives
  if (!path.learningObjectives || !Array.isArray(path.learningObjectives) || path.learningObjectives.length < 2) {
    errors.push("Path must have at least 2 learning objectives");
  }

  // Items validation
  if (!path.items || !Array.isArray(path.items) || path.items.length === 0) {
    errors.push("Path must have at least one item");
  } else {
    path.items.forEach((item, index) => {
      const itemErrors = validatePathItem(item);
      itemErrors.forEach((error) => {
        errors.push(`Item ${index + 1}: ${error}`);
      });
    });

    // Check for duplicate orders
    const orders = path.items.map((item) => item.order);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      errors.push("Path items must have unique order values");
    }

    // Check for duplicate IDs
    const ids = path.items.map((item) => item.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      errors.push("Path items must have unique IDs");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a path item object
 */
export function validatePathItem(item: PathItem): string[] {
  const errors: string[] = [];

  if (!item.id || typeof item.id !== "string") {
    errors.push("Item must have a valid id");
  }
  if (!item.type || typeof item.type !== "string") {
    errors.push("Item must have a valid type (article, tutorial, or exercise)");
  } else {
    const validTypes: PathItemType[] = ["article", "tutorial", "exercise"];
    if (!validTypes.includes(item.type as PathItemType)) {
      errors.push("Item type must be one of: article, tutorial, exercise");
    }
  }
  if (!item.slug || typeof item.slug !== "string") {
    errors.push("Item must have a valid slug");
  }
  if (!item.title || typeof item.title !== "string" || item.title.length < 3) {
    errors.push("Item title must be at least 3 characters long");
  }
  if (!item.estimatedMinutes || item.estimatedMinutes < 1) {
    errors.push("Item must have a valid estimated duration (at least 1 minute)");
  }
  if (typeof item.order !== "number" || item.order < 0) {
    errors.push("Item must have a valid order (non-negative number)");
  }

  return errors;
}

/**
 * Factory function to create a learning path with proper defaults
 */
export function createLearningPath(data: Partial<LearningPath> & {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  items: PathItem[];
}): LearningPath {
  return {
    id: data.id,
    slug: data.slug,
    title: data.title.trim(),
    description: data.description.trim(),
    difficulty: data.difficulty,
    estimatedMinutes: data.estimatedMinutes ?? 60,
    targetAudience: data.targetAudience ?? [],
    prerequisites: data.prerequisites ?? [],
    learningObjectives: data.learningObjectives ?? [],
    items: data.items.sort((a, b) => a.order - b.order),
    tags: data.tags ?? [],
    category: data.category,
    author: data.author,
  };
}

/**
 * Factory function to create a path item
 */
export function createPathItem(data: Partial<PathItem> & {
  id: string;
  type: PathItemType;
  slug: string;
  title: string;
  order: number;
}): PathItem {
  return {
    id: data.id,
    type: data.type,
    slug: data.slug,
    title: data.title.trim(),
    description: data.description?.trim(),
    estimatedMinutes: data.estimatedMinutes ?? 15,
    isOptional: data.isOptional ?? false,
    order: data.order,
  };
}

/**
 * Calculates the total estimated time for a learning path
 */
export function calculatePathTime(path: LearningPath): number {
  return path.items.reduce((total, item) => total + item.estimatedMinutes, 0);
}

/**
 * Gets required items (excluding optional ones)
 */
export function getRequiredItems(path: LearningPath): PathItem[] {
  return path.items.filter((item) => !item.isOptional);
}

/**
 * Gets optional items
 */
export function getOptionalItems(path: LearningPath): PathItem[] {
  return path.items.filter((item) => item.isOptional);
}

/**
 * Gets items by type
 */
export function getItemsByType(path: LearningPath, type: PathItemType): PathItem[] {
  return path.items.filter((item) => item.type === type);
}

/**
 * Gets the next item in the path
 */
export function getNextItem(path: LearningPath, currentItemId: string): PathItem | null {
  const currentIndex = path.items.findIndex((item) => item.id === currentItemId);
  if (currentIndex === -1 || currentIndex === path.items.length - 1) {
    return null;
  }
  return path.items[currentIndex + 1];
}

/**
 * Gets the previous item in the path
 */
export function getPreviousItem(path: LearningPath, currentItemId: string): PathItem | null {
  const currentIndex = path.items.findIndex((item) => item.id === currentItemId);
  if (currentIndex <= 0) {
    return null;
  }
  return path.items[currentIndex - 1];
}

/**
 * Gets the first item in the path
 */
export function getFirstItem(path: LearningPath): PathItem | null {
  return path.items.length > 0 ? path.items[0] : null;
}

/**
 * Gets the last item in the path
 */
export function getLastItem(path: LearningPath): PathItem | null {
  return path.items.length > 0 ? path.items[path.items.length - 1] : null;
}

/**
 * Checks if a path has a specific prerequisite
 */
export function hasPrerequisite(path: LearningPath, prerequisite: string): boolean {
  return path.prerequisites?.includes(prerequisite) ?? false;
}

/**
 * Gets paths by difficulty level
 */
export function getPathsByDifficulty(paths: LearningPath[], difficulty: DifficultyLevel): LearningPath[] {
  return paths.filter((path) => path.difficulty === difficulty);
}

/**
 * Gets paths by category
 */
export function getPathsByCategory(paths: LearningPath[], category: string): LearningPath[] {
  return paths.filter((path) => path.category === category);
}

/**
 * Gets paths by tag
 */
export function getPathsByTag(paths: LearningPath[], tag: string): LearningPath[] {
  return paths.filter((path) => path.tags?.includes(tag) ?? false);
}

/**
 * Calculates progress percentage for a path
 */
export function calculatePathProgress(path: LearningPath, progress: PathProgress): number {
  const requiredItems = getRequiredItems(path);
  if (requiredItems.length === 0) {
    return 100;
  }

  const completedRequiredItems = requiredItems.filter((item) =>
    progress.completedItems.includes(item.id)
  ).length;

  return Math.round((completedRequiredItems / requiredItems.length) * 100);
}

/**
 * Checks if a path is completed
 */
export function isPathCompleted(path: LearningPath, progress: PathProgress): boolean {
  return calculatePathProgress(path, progress) === 100;
}

/**
 * Checks if an item is completed
 */
export function isItemCompleted(itemId: string, progress: PathProgress): boolean {
  return progress.completedItems.includes(itemId);
}

/**
 * Marks an item as completed
 */
export function markItemCompleted(itemId: string, progress: PathProgress): PathProgress {
  if (isItemCompleted(itemId, progress)) {
    return progress;
  }

  return {
    ...progress,
    completedItems: [...progress.completedItems, itemId],
  };
}

/**
 * Gets the current item (next uncompleted item)
 */
export function getCurrentItem(path: LearningPath, progress: PathProgress): PathItem | null {
  const requiredItems = getRequiredItems(path);
  const nextUncompletedItem = requiredItems.find((item) => !isItemCompleted(item.id, progress));

  return nextUncompletedItem ?? null;
}

/**
 * Gets path statistics
 */
export function getPathStats(path: LearningPath): {
  totalItems: number;
  requiredItems: number;
  optionalItems: number;
  articlesCount: number;
  tutorialsCount: number;
  exercisesCount: number;
  totalMinutes: number;
} {
  return {
    totalItems: path.items.length,
    requiredItems: getRequiredItems(path).length,
    optionalItems: getOptionalItems(path).length,
    articlesCount: getItemsByType(path, "article").length,
    tutorialsCount: getItemsByType(path, "tutorial").length,
    exercisesCount: getItemsByType(path, "exercise").length,
    totalMinutes: calculatePathTime(path),
  };
}

/**
 * Generates a progress summary for a path
 */
export function generatePathSummary(path: LearningPath, progress: PathProgress): {
  progressPercent: number;
  isCompleted: boolean;
  currentItem: PathItem | null;
  completedCount: number;
  remainingCount: number;
  estimatedMinutesRemaining: number;
} {
  const requiredItems = getRequiredItems(path);
  const completedCount = requiredItems.filter((item) =>
    isItemCompleted(item.id, progress)
  ).length;
  const remainingCount = requiredItems.length - completedCount;
  const progressPercent = calculatePathProgress(path, progress);

  // Calculate remaining time
  const remainingItems = requiredItems.filter((item) => !isItemCompleted(item.id, progress));
  const estimatedMinutesRemaining = remainingItems.reduce(
    (total, item) => total + item.estimatedMinutes,
    0
  );

  return {
    progressPercent,
    isCompleted: isPathCompleted(path, progress),
    currentItem: getCurrentItem(path, progress),
    completedCount,
    remainingCount,
    estimatedMinutesRemaining,
  };
}

/**
 * Searches paths by query string
 */
export function searchPaths(paths: LearningPath[], query: string): LearningPath[] {
  const lowerQuery = query.toLowerCase();

  return paths.filter((path) => {
    return (
      path.title.toLowerCase().includes(lowerQuery) ||
      path.description.toLowerCase().includes(lowerQuery) ||
      path.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      path.category?.toLowerCase().includes(lowerQuery) ||
      path.learningObjectives.some((obj) => obj.toLowerCase().includes(lowerQuery))
    );
  });
}

/**
 * Sorts paths by various criteria
 */
export function sortPaths(
  paths: LearningPath[],
  sortBy: "title" | "difficulty" | "duration" | "recent"
): LearningPath[] {
  const sortedPaths = [...paths];

  switch (sortBy) {
    case "title":
      return sortedPaths.sort((a, b) => a.title.localeCompare(b.title));
    case "difficulty":
      const difficultyOrder: Record<DifficultyLevel, number> = {
        beginner: 0,
        intermediate: 1,
        advanced: 2,
      };
      return sortedPaths.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    case "duration":
      return sortedPaths.sort((a, b) => calculatePathTime(a) - calculatePathTime(b));
    case "recent":
      // In a real app, this would use createdAt timestamps
      return sortedPaths; // Return as-is for now
    default:
      return sortedPaths;
  }
}
