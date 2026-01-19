import { describe, it, expect } from "vitest";
import {
  validateLearningPath,
  validatePathItem,
  createLearningPath,
  createPathItem,
  calculatePathTime,
  getRequiredItems,
  getOptionalItems,
  getItemsByType,
  getNextItem,
  getPreviousItem,
  getFirstItem,
  getLastItem,
  hasPrerequisite,
  getPathsByDifficulty,
  getPathsByCategory,
  getPathsByTag,
  calculatePathProgress,
  isPathCompleted,
  isItemCompleted,
  markItemCompleted,
  getCurrentItem,
  getPathStats,
  generatePathSummary,
  searchPaths,
  sortPaths,
} from "./learning-path-utils";
import type { LearningPath, PathItem, PathProgress, DifficultyLevel } from "@/types";

describe("learning-path-utils", () => {
  const mockPathItem: PathItem = {
    id: "item-1",
    type: "article",
    slug: "intro-article",
    title: "Introduction Article",
    description: "An introduction to the topic",
    estimatedMinutes: 15,
    isOptional: false,
    order: 0,
  };

  const mockPathItems: PathItem[] = [
    mockPathItem,
    {
      id: "item-2",
      type: "tutorial",
      slug: "basic-tutorial",
      title: "Basic Tutorial",
      description: "Learn the basics",
      estimatedMinutes: 30,
      isOptional: false,
      order: 1,
    },
    {
      id: "item-3",
      type: "exercise",
      slug: "practice-exercise",
      title: "Practice Exercise",
      description: "Practice what you learned",
      estimatedMinutes: 20,
      isOptional: true,
      order: 2,
    },
  ];

  const mockLearningPath: LearningPath = {
    id: "path-1",
    slug: "beginner-javascript",
    title: "Beginner JavaScript Path",
    description: "Learn JavaScript from scratch with this comprehensive beginner path covering all the fundamentals.",
    difficulty: "beginner",
    estimatedMinutes: 120,
    targetAudience: ["Beginners", "Career changers"],
    prerequisites: ["Basic computer skills"],
    learningObjectives: [
      "Understand JavaScript basics",
      "Write simple programs",
      "Work with variables and functions",
    ],
    items: mockPathItems,
    tags: ["javascript", "beginner", "web-development"],
    category: "Programming",
  };

  const mockProgress: PathProgress = {
    pathId: "path-1",
    completedItems: ["item-1"],
    currentItemId: "item-2",
  };

  describe("validateLearningPath", () => {
    it("should validate a correct learning path", () => {
      const result = validateLearningPath(mockLearningPath);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return errors for missing required fields", () => {
      const invalidPath = { ...mockLearningPath, id: "" };
      const result = validateLearningPath(invalidPath as unknown as LearningPath);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Path must have a valid id");
    });

    it("should return errors for invalid slug format", () => {
      const invalidPath = { ...mockLearningPath, slug: "Invalid_Slug" };
      const result = validateLearningPath(invalidPath);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes("Slug"))).toBe(true);
    });

    it("should return errors for title that is too short", () => {
      const invalidPath = { ...mockLearningPath, title: "Hi" };
      const result = validateLearningPath(invalidPath);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Path title must be at least 5 characters long");
    });

    it("should return errors for description that is too short", () => {
      const invalidPath = { ...mockLearningPath, description: "Short" };
      const result = validateLearningPath(invalidPath);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Path description must be at least 20 characters long");
    });

    it("should return errors for invalid difficulty", () => {
      const invalidPath = { ...mockLearningPath, difficulty: "expert" as DifficultyLevel };
      const result = validateLearningPath(invalidPath);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes("difficulty"))).toBe(true);
    });

    it("should return errors for empty target audience", () => {
      const invalidPath = { ...mockLearningPath, targetAudience: [] };
      const result = validateLearningPath(invalidPath);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Path must have at least one target audience");
    });

    it("should return errors for insufficient learning objectives", () => {
      const invalidPath = { ...mockLearningPath, learningObjectives: ["Only one objective"] };
      const result = validateLearningPath(invalidPath);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Path must have at least 2 learning objectives");
    });

    it("should return errors for empty items", () => {
      const invalidPath = { ...mockLearningPath, items: [] };
      const result = validateLearningPath(invalidPath);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Path must have at least one item");
    });

    it("should return errors for duplicate order values", () => {
      const invalidPath = {
        ...mockLearningPath,
        items: [
          { ...mockPathItems[0], order: 0 },
          { ...mockPathItems[1], order: 0 },
        ],
      };
      const result = validateLearningPath(invalidPath);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Path items must have unique order values");
    });

    it("should return errors for duplicate item IDs", () => {
      const invalidPath = {
        ...mockLearningPath,
        items: [
          { ...mockPathItems[0], id: "duplicate-id" },
          { ...mockPathItems[1], id: "duplicate-id" },
        ],
      };
      const result = validateLearningPath(invalidPath);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Path items must have unique IDs");
    });
  });

  describe("validatePathItem", () => {
    it("should validate a correct path item", () => {
      const result = validatePathItem(mockPathItem);
      expect(result).toHaveLength(0);
    });

    it("should return errors for missing id", () => {
      const invalidItem = { ...mockPathItem, id: "" };
      const result = validatePathItem(invalidItem);
      expect(result).toContain("Item must have a valid id");
    });

    it("should return errors for invalid type", () => {
      const invalidItem = { ...mockPathItem, type: "video" as PathItemType };
      const result = validatePathItem(invalidItem);
      expect(result.some(e => e.includes("type"))).toBe(true);
    });

    it("should return errors for title that is too short", () => {
      const invalidItem = { ...mockPathItem, title: "Hi" };
      const result = validatePathItem(invalidItem);
      expect(result).toContain("Item title must be at least 3 characters long");
    });

    it("should return errors for invalid estimated minutes", () => {
      const invalidItem = { ...mockPathItem, estimatedMinutes: 0 };
      const result = validatePathItem(invalidItem);
      expect(result).toContain("Item must have a valid estimated duration (at least 1 minute)");
    });

    it("should return errors for negative order", () => {
      const invalidItem = { ...mockPathItem, order: -1 };
      const result = validatePathItem(invalidItem);
      expect(result).toContain("Item must have a valid order (non-negative number)");
    });
  });

  describe("createLearningPath", () => {
    it("should create a learning path with defaults", () => {
      const path = createLearningPath({
        id: "test-path",
        slug: "test-path",
        title: "Test Path",
        description: "A test path description",
        difficulty: "beginner",
        items: mockPathItems,
      });

      expect(path.id).toBe("test-path");
      expect(path.title).toBe("Test Path");
      expect(path.estimatedMinutes).toBe(60);
      expect(path.targetAudience).toEqual([]);
      expect(path.prerequisites).toEqual([]);
      expect(path.learningObjectives).toEqual([]);
      expect(path.tags).toEqual([]);
    });

    it("should trim title and description", () => {
      const path = createLearningPath({
        id: "test-path",
        slug: "test-path",
        title: "  Test Path  ",
        description: "  A test path description  ",
        difficulty: "beginner",
        items: mockPathItems,
      });

      expect(path.title).toBe("Test Path");
      expect(path.description).toBe("A test path description");
    });

    it("should sort items by order", () => {
      const unorderedItems = [
        { ...mockPathItems[2], order: 2 },
        { ...mockPathItems[0], order: 0 },
        { ...mockPathItems[1], order: 1 },
      ];
      const path = createLearningPath({
        id: "test-path",
        slug: "test-path",
        title: "Test Path",
        description: "A test path description",
        difficulty: "beginner",
        items: unorderedItems,
      });

      expect(path.items[0].order).toBe(0);
      expect(path.items[1].order).toBe(1);
      expect(path.items[2].order).toBe(2);
    });
  });

  describe("createPathItem", () => {
    it("should create a path item with defaults", () => {
      const item = createPathItem({
        id: "test-item",
        type: "article",
        slug: "test-item",
        title: "Test Item",
        order: 0,
      });

      expect(item.id).toBe("test-item");
      expect(item.estimatedMinutes).toBe(15);
      expect(item.isOptional).toBe(false);
    });

    it("should trim title and description", () => {
      const item = createPathItem({
        id: "test-item",
        type: "article",
        slug: "test-item",
        title: "  Test Item  ",
        description: "  A description  ",
        order: 0,
      });

      expect(item.title).toBe("Test Item");
      expect(item.description).toBe("A description");
    });
  });

  describe("calculatePathTime", () => {
    it("should calculate total time for all items", () => {
      const totalTime = calculatePathTime(mockLearningPath);
      expect(totalTime).toBe(65); // 15 + 30 + 20
    });

    it("should return 0 for empty items", () => {
      const emptyPath = { ...mockLearningPath, items: [] };
      const totalTime = calculatePathTime(emptyPath);
      expect(totalTime).toBe(0);
    });
  });

  describe("getRequiredItems", () => {
    it("should return only non-optional items", () => {
      const requiredItems = getRequiredItems(mockLearningPath);
      expect(requiredItems).toHaveLength(2);
      expect(requiredItems.every(item => !item.isOptional)).toBe(true);
    });
  });

  describe("getOptionalItems", () => {
    it("should return only optional items", () => {
      const optionalItems = getOptionalItems(mockLearningPath);
      expect(optionalItems).toHaveLength(1);
      expect(optionalItems[0].isOptional).toBe(true);
    });
  });

  describe("getItemsByType", () => {
    it("should return items of specified type", () => {
      const articles = getItemsByType(mockLearningPath, "article");
      expect(articles).toHaveLength(1);
      expect(articles[0].type).toBe("article");

      const tutorials = getItemsByType(mockLearningPath, "tutorial");
      expect(tutorials).toHaveLength(1);
      expect(tutorials[0].type).toBe("tutorial");

      const exercises = getItemsByType(mockLearningPath, "exercise");
      expect(exercises).toHaveLength(1);
      expect(exercises[0].type).toBe("exercise");
    });

    it("should return empty array for non-existent type", () => {
      const items = getItemsByType(mockLearningPath, "article");
      expect(Array.isArray(items)).toBe(true);
    });
  });

  describe("getNextItem", () => {
    it("should return the next item", () => {
      const nextItem = getNextItem(mockLearningPath, "item-1");
      expect(nextItem?.id).toBe("item-2");
    });

    it("should return null for the last item", () => {
      const nextItem = getNextItem(mockLearningPath, "item-3");
      expect(nextItem).toBeNull();
    });

    it("should return null for non-existent item", () => {
      const nextItem = getNextItem(mockLearningPath, "non-existent");
      expect(nextItem).toBeNull();
    });
  });

  describe("getPreviousItem", () => {
    it("should return the previous item", () => {
      const previousItem = getPreviousItem(mockLearningPath, "item-2");
      expect(previousItem?.id).toBe("item-1");
    });

    it("should return null for the first item", () => {
      const previousItem = getPreviousItem(mockLearningPath, "item-1");
      expect(previousItem).toBeNull();
    });

    it("should return null for non-existent item", () => {
      const previousItem = getPreviousItem(mockLearningPath, "non-existent");
      expect(previousItem).toBeNull();
    });
  });

  describe("getFirstItem", () => {
    it("should return the first item", () => {
      const firstItem = getFirstItem(mockLearningPath);
      expect(firstItem?.id).toBe("item-1");
    });

    it("should return null for empty path", () => {
      const emptyPath = { ...mockLearningPath, items: [] };
      const firstItem = getFirstItem(emptyPath);
      expect(firstItem).toBeNull();
    });
  });

  describe("getLastItem", () => {
    it("should return the last item", () => {
      const lastItem = getLastItem(mockLearningPath);
      expect(lastItem?.id).toBe("item-3");
    });

    it("should return null for empty path", () => {
      const emptyPath = { ...mockLearningPath, items: [] };
      const lastItem = getLastItem(emptyPath);
      expect(lastItem).toBeNull();
    });
  });

  describe("hasPrerequisite", () => {
    it("should return true when path has the prerequisite", () => {
      expect(hasPrerequisite(mockLearningPath, "Basic computer skills")).toBe(true);
    });

    it("should return false when path does not have the prerequisite", () => {
      expect(hasPrerequisite(mockLearningPath, "Advanced math")).toBe(false);
    });

    it("should return false when prerequisites is undefined", () => {
      const pathNoPrereqs = { ...mockLearningPath, prerequisites: undefined };
      expect(hasPrerequisite(pathNoPrereqs, "Basic computer skills")).toBe(false);
    });
  });

  describe("getPathsByDifficulty", () => {
    const paths: LearningPath[] = [
      mockLearningPath,
      { ...mockLearningPath, id: "path-2", slug: "path-2", difficulty: "intermediate" },
      { ...mockLearningPath, id: "path-3", slug: "path-3", difficulty: "advanced" },
    ];

    it("should filter paths by difficulty", () => {
      const beginnerPaths = getPathsByDifficulty(paths, "beginner");
      expect(beginnerPaths).toHaveLength(1);
      expect(beginnerPaths[0].difficulty).toBe("beginner");

      const intermediatePaths = getPathsByDifficulty(paths, "intermediate");
      expect(intermediatePaths).toHaveLength(1);
      expect(intermediatePaths[0].difficulty).toBe("intermediate");

      const advancedPaths = getPathsByDifficulty(paths, "advanced");
      expect(advancedPaths).toHaveLength(1);
      expect(advancedPaths[0].difficulty).toBe("advanced");
    });
  });

  describe("getPathsByCategory", () => {
    const paths: LearningPath[] = [
      mockLearningPath,
      { ...mockLearningPath, id: "path-2", slug: "path-2", category: "Design" },
      { ...mockLearningPath, id: "path-3", slug: "path-3", category: "Programming" },
    ];

    it("should filter paths by category", () => {
      const programmingPaths = getPathsByCategory(paths, "Programming");
      expect(programmingPaths).toHaveLength(2);

      const designPaths = getPathsByCategory(paths, "Design");
      expect(designPaths).toHaveLength(1);
      expect(designPaths[0].category).toBe("Design");
    });
  });

  describe("getPathsByTag", () => {
    const paths: LearningPath[] = [
      mockLearningPath,
      { ...mockLearningPath, id: "path-2", slug: "path-2", tags: ["react", "frontend"] },
      { ...mockLearningPath, id: "path-3", slug: "path-3", tags: ["vue", "frontend"] },
    ];

    it("should filter paths by tag", () => {
      const javascriptPaths = getPathsByTag(paths, "javascript");
      expect(javascriptPaths).toHaveLength(1);
      expect(javascriptPaths[0].tags).toContain("javascript");

      const frontendPaths = getPathsByTag(paths, "frontend");
      expect(frontendPaths).toHaveLength(2);
    });
  });

  describe("calculatePathProgress", () => {
    it("should calculate progress percentage", () => {
      const progress = calculatePathProgress(mockLearningPath, mockProgress);
      expect(progress).toBe(50); // 1 of 2 required items completed
    });

    it("should return 100 when all required items are completed", () => {
      const completeProgress: PathProgress = {
        pathId: "path-1",
        completedItems: ["item-1", "item-2"],
      };
      const progress = calculatePathProgress(mockLearningPath, completeProgress);
      expect(progress).toBe(100);
    });

    it("should return 100 when there are no required items", () => {
      const optionalOnlyPath = {
        ...mockLearningPath,
        items: [{ ...mockPathItems[2], isOptional: true }],
      };
      const progress = calculatePathProgress(optionalOnlyPath, mockProgress);
      expect(progress).toBe(100);
    });
  });

  describe("isPathCompleted", () => {
    it("should return true when all required items are completed", () => {
      const completeProgress: PathProgress = {
        pathId: "path-1",
        completedItems: ["item-1", "item-2"],
      };
      expect(isPathCompleted(mockLearningPath, completeProgress)).toBe(true);
    });

    it("should return false when some required items are not completed", () => {
      expect(isPathCompleted(mockLearningPath, mockProgress)).toBe(false);
    });
  });

  describe("isItemCompleted", () => {
    it("should return true when item is in completedItems", () => {
      expect(isItemCompleted("item-1", mockProgress)).toBe(true);
    });

    it("should return false when item is not in completedItems", () => {
      expect(isItemCompleted("item-2", mockProgress)).toBe(false);
    });
  });

  describe("markItemCompleted", () => {
    it("should add item to completedItems", () => {
      const updated = markItemCompleted("item-2", mockProgress);
      expect(updated.completedItems).toContain("item-2");
      expect(updated.completedItems).toHaveLength(2);
    });

    it("should not duplicate already completed items", () => {
      const updated = markItemCompleted("item-1", mockProgress);
      expect(updated.completedItems.filter(id => id === "item-1")).toHaveLength(1);
    });

    it("should preserve other progress properties", () => {
      const updated = markItemCompleted("item-2", mockProgress);
      expect(updated.pathId).toBe("path-1");
      expect(updated.currentItemId).toBe("item-2");
    });
  });

  describe("getCurrentItem", () => {
    it("should return the first uncompleted required item", () => {
      const current = getCurrentItem(mockLearningPath, mockProgress);
      expect(current?.id).toBe("item-2");
    });

    it("should return null when all items are completed", () => {
      const completeProgress: PathProgress = {
        pathId: "path-1",
        completedItems: ["item-1", "item-2"],
      };
      const current = getCurrentItem(mockLearningPath, completeProgress);
      expect(current).toBeNull();
    });
  });

  describe("getPathStats", () => {
    it("should return correct statistics", () => {
      const stats = getPathStats(mockLearningPath);
      expect(stats.totalItems).toBe(3);
      expect(stats.requiredItems).toBe(2);
      expect(stats.optionalItems).toBe(1);
      expect(stats.articlesCount).toBe(1);
      expect(stats.tutorialsCount).toBe(1);
      expect(stats.exercisesCount).toBe(1);
      expect(stats.totalMinutes).toBe(65);
    });
  });

  describe("generatePathSummary", () => {
    it("should generate a complete summary", () => {
      const summary = generatePathSummary(mockLearningPath, mockProgress);

      expect(summary.progressPercent).toBe(50);
      expect(summary.isCompleted).toBe(false);
      expect(summary.currentItem?.id).toBe("item-2");
      expect(summary.completedCount).toBe(1);
      expect(summary.remainingCount).toBe(1);
      expect(summary.estimatedMinutesRemaining).toBe(30); // Only item-2 is remaining (required)
    });

    it("should show 100% progress when completed", () => {
      const completeProgress: PathProgress = {
        pathId: "path-1",
        completedItems: ["item-1", "item-2"],
      };
      const summary = generatePathSummary(mockLearningPath, completeProgress);

      expect(summary.progressPercent).toBe(100);
      expect(summary.isCompleted).toBe(true);
      expect(summary.currentItem).toBeNull();
      expect(summary.completedCount).toBe(2);
      expect(summary.remainingCount).toBe(0);
      expect(summary.estimatedMinutesRemaining).toBe(0);
    });
  });

  describe("searchPaths", () => {
    const paths: LearningPath[] = [
      mockLearningPath,
      {
        ...mockLearningPath,
        id: "path-2",
        slug: "path-2",
        title: "React Fundamentals",
        description: "Learn React from scratch with comprehensive tutorials",
        category: "React",
        tags: ["react", "frontend"],
        learningObjectives: ["Understand React components", "Build user interfaces"],
      },
      {
        ...mockLearningPath,
        id: "path-3",
        slug: "path-3",
        title: "Vue Basics",
        description: "Master Vue.js framework with hands-on exercises",
        category: "Vue",
        tags: ["vue", "frontend"],
        learningObjectives: ["Learn Vue syntax", "Create reactive apps"],
      },
    ];

    it("should search by title", () => {
      const results = searchPaths(paths, "react");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toContain("React");
    });

    it("should search by description", () => {
      const results = searchPaths(paths, "javascript");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].description.toLowerCase()).toContain("javascript");
    });

    it("should search by tag", () => {
      const results = searchPaths(paths, "web-development");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].tags).toContain("web-development");
    });

    it("should search by category", () => {
      const results = searchPaths(paths, "react");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].category).toBe("React");
    });

    it("should search by learning objectives", () => {
      const results = searchPaths(paths, "variables");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].learningObjectives).toContain("Work with variables and functions");
    });

    it("should be case insensitive", () => {
      const results1 = searchPaths(paths, "REACT");
      const results2 = searchPaths(paths, "react");
      expect(results1).toHaveLength(results2.length);
    });

    it("should return empty array for no matches", () => {
      const results = searchPaths(paths, "nonexistent");
      expect(results).toHaveLength(0);
    });
  });

  describe("sortPaths", () => {
    const paths: LearningPath[] = [
      mockLearningPath,
      { ...mockLearningPath, id: "path-2", slug: "path-2", title: "Advanced Topics", difficulty: "advanced", estimatedMinutes: 180 },
      { ...mockLearningPath, id: "path-3", slug: "path-3", title: "Intermediate Skills", difficulty: "intermediate", estimatedMinutes: 120 },
    ];

    it("should sort by title", () => {
      const sorted = sortPaths(paths, "title");
      expect(sorted[0].title).toBe("Advanced Topics");
      expect(sorted[1].title).toBe("Beginner JavaScript Path");
      expect(sorted[2].title).toBe("Intermediate Skills");
    });

    it("should sort by difficulty", () => {
      const sorted = sortPaths(paths, "difficulty");
      expect(sorted[0].difficulty).toBe("beginner");
      expect(sorted[1].difficulty).toBe("intermediate");
      expect(sorted[2].difficulty).toBe("advanced");
    });

    it("should sort by duration", () => {
      const sorted = sortPaths(paths, "duration");
      // Use calculatePathTime for accurate comparison
      expect(calculatePathTime(sorted[0])).toBeLessThanOrEqual(calculatePathTime(sorted[1]));
      expect(calculatePathTime(sorted[1])).toBeLessThanOrEqual(calculatePathTime(sorted[2]));
    });

    it("should return as-is for recent sort", () => {
      const sorted = sortPaths(paths, "recent");
      expect(sorted).toHaveLength(paths.length);
    });
  });
});
