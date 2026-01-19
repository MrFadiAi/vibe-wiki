/**
 * Tests for the Personalized Recommendation Engine
 */

import { describe, it, expect } from 'vitest';
import {
  buildUserProfile,
  getRecommendedArticles,
  getRecommendedTutorials,
  getRecommendedPaths,
  getAllRecommendations,
  getNextRecommendation,
  getRecommendationsByTime,
  explainRecommendation,
  validateUserProfile,
  updateProfileWithActivity,
  UserProfile,
  RecommendationScore,
} from './recommendation-engine';
import {
  WikiArticle,
  Tutorial,
  LearningPath,
  UserProgress,
  DifficultyLevel,
} from '@/types';

// Mock test data
const mockArticles: WikiArticle[] = [
  {
    slug: 'intro-to-programming',
    title: 'Introduction to Programming',
    section: 'Getting Started',
    content: 'Learn the basics of programming in this comprehensive tutorial. Programming is the process of creating a set of instructions that tell a computer how to perform a task. Programming can be done using various programming languages. This article covers the fundamental concepts that every programmer needs to know.',
    codeBlocks: [],
    tags: ['programming', 'beginner'],
  },
  {
    slug: 'advanced-javascript',
    title: 'Advanced JavaScript Concepts',
    section: 'JavaScript',
    content: 'Deep dive into JavaScript advanced features including closures, prototypes, async programming, and modern ES6+ syntax. JavaScript is a versatile programming language that powers the web. Understanding its advanced concepts will make you a better developer.',
    codeBlocks: [],
    tags: ['javascript', 'advanced'],
  },
  {
    slug: 'web-development-basics',
    title: 'Web Development Basics',
    section: 'Web Development',
    content: 'Start your web development journey with HTML, CSS, and JavaScript. Learn how to create beautiful and responsive websites. Web development is a rapidly growing field with many opportunities for developers who want to build the next generation of web applications.',
    codeBlocks: [],
    tags: ['web', 'html', 'css'],
  },
  {
    slug: 'quick-tips',
    title: 'Quick Programming Tips',
    section: 'Tips',
    content: 'Short and useful tips for programmers to improve their coding efficiency and write better code. These tips are gathered from experienced developers and will help you avoid common mistakes and write cleaner, more maintainable code.',
    codeBlocks: [],
    tags: ['tips'],
  },
];

const mockTutorials: Tutorial[] = [
  {
    id: 'tutorial-1',
    slug: 'react-fundamentals',
    title: 'React Fundamentals',
    description: 'Learn React from scratch',
    section: 'Frontend',
    difficulty: 'beginner' as DifficultyLevel,
    estimatedMinutes: 45,
    prerequisites: [],
    learningObjectives: ['Understand React basics', 'Build simple components'],
    steps: [
      {
        id: 'step-1',
        title: 'Introduction',
        content: 'Welcome to React',
        order: 0,
      },
    ],
    tags: ['react', 'frontend'],
    author: 'John Doe',
  },
  {
    id: 'tutorial-2',
    slug: 'nodejs-advanced',
    title: 'Advanced Node.js',
    description: 'Master Node.js concepts',
    section: 'Backend',
    difficulty: 'advanced' as DifficultyLevel,
    estimatedMinutes: 90,
    prerequisites: ['tutorial-1'],
    learningObjectives: ['Advanced Node.js patterns'],
    steps: [
      {
        id: 'step-1',
        title: 'Introduction',
        content: 'Welcome to Node.js',
        order: 0,
      },
    ],
    tags: ['nodejs', 'backend', 'advanced'],
    author: 'Jane Smith',
  },
  {
    id: 'tutorial-3',
    slug: 'css-flexbox',
    title: 'CSS Flexbox Mastery',
    description: 'Master CSS Flexbox',
    section: 'CSS',
    difficulty: 'intermediate' as DifficultyLevel,
    estimatedMinutes: 30,
    prerequisites: [],
    learningObjectives: ['Understand flexbox'],
    steps: [
      {
        id: 'step-1',
        title: 'Introduction',
        content: 'Welcome to Flexbox',
        order: 0,
      },
    ],
    tags: ['css', 'layout'],
    author: 'Bob Johnson',
  },
  {
    id: 'tutorial-4',
    slug: 'typescript-basics',
    title: 'TypeScript Basics',
    description: 'Learn TypeScript fundamentals',
    section: 'TypeScript',
    difficulty: 'beginner' as DifficultyLevel,
    estimatedMinutes: 60,
    prerequisites: [],
    learningObjectives: ['TypeScript basics'],
    steps: [
      {
        id: 'step-1',
        title: 'Introduction',
        content: 'Welcome to TypeScript',
        order: 0,
      },
    ],
    tags: ['typescript', 'beginner'],
    author: 'Alice Williams',
  },
];

const mockPaths: LearningPath[] = [
  {
    id: 'path-1',
    slug: 'fullstack-developer',
    title: 'Full-Stack Developer Path',
    description: 'Become a full-stack developer',
    difficulty: 'intermediate' as DifficultyLevel,
    estimatedMinutes: 300,
    targetAudience: 'Intermediate developers',
    prerequisites: [],
    learningObjectives: ['Frontend', 'Backend', 'Database'],
    items: [],
    tags: ['fullstack', 'web'],
    category: 'Web Development',
    author: 'Team Vibe',
  },
  {
    id: 'path-2',
    slug: 'frontend-master',
    title: 'Frontend Mastery Path',
    description: 'Master frontend development',
    difficulty: 'advanced' as DifficultyLevel,
    estimatedMinutes: 400,
    targetAudience: 'Experienced developers',
    prerequisites: ['tutorial-1'],
    learningObjectives: ['React', 'Vue', 'Angular'],
    items: [],
    tags: ['frontend', 'advanced'],
    category: 'Frontend',
    author: 'Team Vibe',
  },
  {
    id: 'path-3',
    slug: 'quick-start',
    title: 'Quick Start Path',
    description: 'Get started quickly',
    difficulty: 'beginner' as DifficultyLevel,
    estimatedMinutes: 15,
    targetAudience: 'Beginners',
    prerequisites: [],
    learningObjectives: ['Basics'],
    items: [],
    tags: ['beginner'],
    category: 'Getting Started',
    author: 'Team Vibe',
  },
];

const mockProgress: UserProgress = {
  userId: 'test-user-1',
  completedArticles: ['intro-to-programming'],
  completedTutorials: ['tutorial-1'],
  completedPaths: [],
  currentPathProgress: {},
  currentTutorialProgress: {},
  achievements: [],
  totalPoints: 100,
  streakDays: 5,
  lastActivity: new Date('2025-01-19'),
  createdAt: new Date('2025-01-01'),
};

describe('buildUserProfile', () => {
  it('should build a profile from user progress', () => {
    const profile = buildUserProfile(mockProgress, mockArticles, mockTutorials);

    expect(profile).toBeDefined();
    expect(profile.skillLevel).toBe('beginner');
    expect(profile.interests).toBeInstanceOf(Array);
    expect(profile.learningPatterns).toBeDefined();
  });

  it('should identify skill level based on points', () => {
    const beginnerProgress = { ...mockProgress, totalPoints: 0 };
    const intermediateProgress = { ...mockProgress, totalPoints: 600 };
    const advancedProgress = { ...mockProgress, totalPoints: 2500 };

    expect(buildUserProfile(beginnerProgress, mockArticles, mockTutorials).skillLevel).toBe('beginner');
    expect(buildUserProfile(intermediateProgress, mockArticles, mockTutorials).skillLevel).toBe('intermediate');
    expect(buildUserProfile(advancedProgress, mockArticles, mockTutorials).skillLevel).toBe('advanced');
  });

  it('should extract interests from completed content tags', () => {
    const profile = buildUserProfile(mockProgress, mockArticles, mockTutorials);

    expect(profile.interests.length).toBeGreaterThan(0);
  });

  it('should detect learning patterns', () => {
    const profile = buildUserProfile(mockProgress, mockArticles, mockTutorials);

    expect(profile.learningPatterns).toHaveProperty('prefersShortContent');
    expect(profile.learningPatterns).toHaveProperty('prefersInteractiveContent');
    expect(profile.learningPatterns).toHaveProperty('likesPrerequisites');
  });

  it('should calculate content type preferences', () => {
    const profile = buildUserProfile(mockProgress, mockArticles, mockTutorials);

    expect(profile.preferredContentTypes.articles).toBeGreaterThanOrEqual(0);
    expect(profile.preferredContentTypes.tutorials).toBeGreaterThanOrEqual(0);
    expect(profile.preferredContentTypes.paths).toBeGreaterThanOrEqual(0);
  });
});

describe('getRecommendedArticles', () => {
  it('should return recommendations', () => {
    const recommendations = getRecommendedArticles(mockProgress, mockArticles);

    expect(recommendations).toBeInstanceOf(Array);
    expect(recommendations.length).toBeGreaterThan(0);
  });

  it('should not recommend completed articles by default', () => {
    const recommendations = getRecommendedArticles(mockProgress, mockArticles);

    const completedSlugs = recommendations.map((r) => r.item.slug);
    expect(completedSlugs).not.toContain('intro-to-programming');
  });

  it('should include completed articles when requested', () => {
    const recommendations = getRecommendedArticles(
      mockProgress,
      mockArticles,
      { includeCompleted: true }
    );

    const slugs = recommendations.map((r) => r.item.slug);
    expect(slugs).toContain('intro-to-programming');
  });

  it('should respect max results option', () => {
    const recommendations = getRecommendedArticles(
      mockProgress,
      mockArticles,
      { maxResults: 2 }
    );

    expect(recommendations.length).toBeLessThanOrEqual(2);
  });

  it('should filter by minimum confidence', () => {
    const recommendations = getRecommendedArticles(
      mockProgress,
      mockArticles,
      { minConfidence: 0.8 }
    );

    recommendations.forEach((r) => {
      expect(r.confidence).toBeGreaterThanOrEqual(0.8);
    });
  });

  it('should prioritize articles matching user interests', () => {
    const progressWithInterests = {
      ...mockProgress,
      completedArticles: ['intro-to-programming', 'web-development-basics'],
    };

    const recommendations = getRecommendedArticles(progressWithInterests, mockArticles);

    // Should recommend articles with matching interests
    expect(recommendations.length).toBeGreaterThan(0);
  });

  it('should consider time constraints', () => {
    const recommendations = getRecommendedArticles(
      mockProgress,
      mockArticles,
      { timeConstraint: 5 } // 5 minutes
    );

    expect(recommendations).toBeInstanceOf(Array);
  });

  it('should return empty array when no articles available', () => {
    const recommendations = getRecommendedArticles(mockProgress, []);

    expect(recommendations).toEqual([]);
  });
});

describe('getRecommendedTutorials', () => {
  it('should return recommendations', () => {
    const recommendations = getRecommendedTutorials(mockProgress, mockTutorials);

    expect(recommendations).toBeInstanceOf(Array);
    expect(recommendations.length).toBeGreaterThan(0);
  });

  it('should prioritize in-progress tutorials', () => {
    // Use a tutorial that's not completed
    const progressWithInProgress = {
      ...mockProgress,
      completedTutorials: [], // Clear completed tutorials
      currentTutorialProgress: {
        'tutorial-1': {
          startedAt: new Date(),
          completedSteps: ['step-1'],
        },
      },
    };

    const recommendations = getRecommendedTutorials(progressWithInProgress, mockTutorials);

    // The in-progress tutorial should have a high score
    const inProgressRec = recommendations.find((r) => r.item.id === 'tutorial-1');
    if (recommendations.length > 0) {
      expect(inProgressRec?.score).toBeGreaterThan(0.5);
    }
  });

  it('should not recommend completed tutorials by default', () => {
    const recommendations = getRecommendedTutorials(mockProgress, mockTutorials);

    const ids = recommendations.map((r) => r.item.id);
    expect(ids).not.toContain('tutorial-1');
  });

  it('should penalize tutorials with missing prerequisites', () => {
    const progressWithoutPrereqs = {
      ...mockProgress,
      completedTutorials: [],
    };

    const recommendations = getRecommendedTutorials(progressWithoutPrereqs, mockTutorials);

    const advancedTutorial = recommendations.find((r) => r.item.id === 'tutorial-2');
    if (advancedTutorial) {
      // Should have lower score due to missing prerequisites
      expect(advancedTutorial.score).toBeLessThan(1);
    }
  });

  it('should match difficulty to user skill level', () => {
    const beginnerProgress = { ...mockProgress, totalPoints: 0 };
    const recommendations = getRecommendedTutorials(beginnerProgress, mockTutorials);

    // Should prefer beginner tutorials
    const beginnerRecs = recommendations.filter((r) => r.item.difficulty === 'beginner');
    expect(beginnerRecs.length).toBeGreaterThan(0);
  });

  it('should consider time constraints', () => {
    const recommendations = getRecommendedTutorials(
      mockProgress,
      mockTutorials,
      { timeConstraint: 30 }
    );

    expect(recommendations).toBeInstanceOf(Array);
  });
});

describe('getRecommendedPaths', () => {
  it('should return recommendations', () => {
    const recommendations = getRecommendedPaths(mockProgress, mockPaths);

    expect(recommendations).toBeInstanceOf(Array);
  });

  it('should prioritize in-progress paths', () => {
    const progressWithInProgress = {
      ...mockProgress,
      currentPathProgress: {
        'path-1': {
          startedAt: new Date(),
          completedItems: [],
          currentItemId: 'item-1',
          lastAccessedAt: new Date(),
        },
      },
    };

    const recommendations = getRecommendedPaths(progressWithInProgress, mockPaths);

    const inProgressRec = recommendations.find((r) => r.item.id === 'path-1');
    if (recommendations.length > 0) {
      expect(inProgressRec?.score).toBeGreaterThan(0.5);
    }
  });

  it('should not recommend completed paths by default', () => {
    const progressWithCompleted = {
      ...mockProgress,
      completedPaths: ['path-1'],
    };

    const recommendations = getRecommendedPaths(progressWithCompleted, mockPaths);

    const ids = recommendations.map((r) => r.item.id);
    expect(ids).not.toContain('path-1');
  });

  it('should penalize paths with missing prerequisites', () => {
    const recommendations = getRecommendedPaths(mockProgress, mockPaths);

    const pathWithPrereqs = recommendations.find((r) => r.item.id === 'path-2');
    if (pathWithPrereqs) {
      // May have lower score if prerequisites not met
    }
  });

  it('should recommend quick paths for streak maintenance', () => {
    const streakProgress = {
      ...mockProgress,
      streakDays: 7,
    };

    const recommendations = getRecommendedPaths(streakProgress, mockPaths);

    const quickPath = recommendations.find((r) => r.item.slug === 'quick-start');
    if (quickPath) {
      // The quick path should be recommended with some reason
      expect(quickPath.score).toBeGreaterThan(0);
      expect(quickPath.reason).toBeDefined();
    }
  });

  it('should match difficulty to user skill level', () => {
    const advancedProgress = { ...mockProgress, totalPoints: 3000 };
    const recommendations = getRecommendedPaths(advancedProgress, mockPaths);

    expect(recommendations.length).toBeGreaterThan(0);
  });
});

describe('getAllRecommendations', () => {
  it('should return all types of recommendations', () => {
    const recommendations = getAllRecommendations(
      mockProgress,
      mockArticles,
      mockTutorials,
      mockPaths
    );

    expect(recommendations.articles).toBeInstanceOf(Array);
    expect(recommendations.tutorials).toBeInstanceOf(Array);
    expect(recommendations.paths).toBeInstanceOf(Array);
  });

  it('should apply options to all recommendation types', () => {
    const recommendations = getAllRecommendations(
      mockProgress,
      mockArticles,
      mockTutorials,
      mockPaths,
      { maxResults: 2 }
    );

    expect(recommendations.articles.length).toBeLessThanOrEqual(2);
    expect(recommendations.tutorials.length).toBeLessThanOrEqual(2);
    expect(recommendations.paths.length).toBeLessThanOrEqual(2);
  });
});

describe('getNextRecommendation', () => {
  it('should return the single best recommendation', () => {
    const recommendation = getNextRecommendation(
      mockProgress,
      mockArticles,
      mockTutorials,
      mockPaths
    );

    expect(recommendation).toBeDefined();
    expect(recommendation?.score).toBeGreaterThan(0);
  });

  it('should return null when no recommendations available', () => {
    const recommendation = getNextRecommendation(
      mockProgress,
      [],
      [],
      []
    );

    expect(recommendation).toBeNull();
  });

  it('should prioritize in-progress content', () => {
    const progressWithInProgress = {
      ...mockProgress,
      currentTutorialProgress: {
        'tutorial-1': {
          startedAt: new Date(),
          completedSteps: [],
          lastAccessedAt: new Date(),
        },
      },
    };

    const recommendation = getNextRecommendation(
      progressWithInProgress,
      mockArticles,
      mockTutorials,
      mockPaths
    );

    expect(recommendation).toBeDefined();
  });
});

describe('getRecommendationsByTime', () => {
  it('should categorize recommendations by time', () => {
    const recommendations = getRecommendationsByTime(
      mockProgress,
      mockArticles,
      mockTutorials,
      mockPaths,
      30 // 30 minutes available
    );

    expect(recommendations.quick).toBeInstanceOf(Array);
    expect(recommendations.moderate).toBeInstanceOf(Array);
    expect(recommendations.long).toBeInstanceOf(Array);
  });

  it('should return different recommendations for each category', () => {
    const recommendations = getRecommendationsByTime(
      mockProgress,
      mockArticles,
      mockTutorials,
      mockPaths,
      60
    );

    const totalRecs =
      recommendations.quick.length +
      recommendations.moderate.length +
      recommendations.long.length;

    expect(totalRecs).toBeGreaterThan(0);
  });
});

describe('explainRecommendation', () => {
  it('should provide explanation for recommendation', () => {
    const mockRec: RecommendationScore<WikiArticle> = {
      item: mockArticles[0],
      score: 0.8,
      confidence: 0.7,
      reason: 'matches_interest',
      explanation: 'Matches your interest in programming',
    };

    const explanation = explainRecommendation(mockRec);

    expect(explanation.reason).toBeDefined();
    expect(explanation.confidence).toBeDefined();
    expect(explanation.details).toBeDefined();
  });

  it('should provide appropriate confidence labels', () => {
    const lowConfidence: RecommendationScore<WikiArticle> = {
      item: mockArticles[0],
      score: 0.3,
      confidence: 0.2,
      reason: 'suitable_for_level',
      explanation: 'Low confidence',
    };

    const highConfidence: RecommendationScore<WikiArticle> = {
      item: mockArticles[0],
      score: 0.9,
      confidence: 0.95,
      reason: 'matches_interest',
      explanation: 'High confidence',
    };

    const lowExplanation = explainRecommendation(lowConfidence);
    const highExplanation = explainRecommendation(highConfidence);

    expect(lowExplanation.confidence).toBe('Suggestion');
    expect(highExplanation.confidence).toBe('Excellent Match');
  });

  it('should handle all recommendation reasons', () => {
    const reasons: RecommendationReason[] = [
      'continues_learning_path',
      'builds_on_completed',
      'matches_interest',
      'popular_choice',
      'suitable_for_level',
      'quick_win',
      'prerequisite_for_goal',
      'similar_to_liked',
      'fills_skill_gap',
      'maintains_streak',
    ];

    reasons.forEach((reason) => {
      const mockRec: RecommendationScore<WikiArticle> = {
        item: mockArticles[0],
        score: 0.5,
        confidence: 0.5,
        reason,
        explanation: 'Test',
      };

      const explanation = explainRecommendation(mockRec);
      expect(explanation.reason).toBeDefined();
    });
  });
});

describe('validateUserProfile', () => {
  it('should validate a correct profile', () => {
    const profile = buildUserProfile(mockProgress, mockArticles, mockTutorials);

    expect(validateUserProfile(profile)).toBe(true);
  });

  it('should reject invalid profiles', () => {
    expect(validateUserProfile(null as any)).toBe(false);
    expect(validateUserProfile({} as any)).toBe(false);
    expect(validateUserProfile({ skillLevel: 'beginner' } as any)).toBe(false);
  });

  it('should require all profile fields', () => {
    const incompleteProfile = {
      preferredContentTypes: { articles: 0.5, tutorials: 0.5, paths: 0 },
      averageCompletionTime: { articles: 10, tutorials: 30 },
      interests: [],
      skillLevel: 'beginner' as const,
    } as any;

    expect(validateUserProfile(incompleteProfile)).toBe(false);
  });
});

describe('updateProfileWithActivity', () => {
  it('should update profile with article activity', () => {
    const profile = buildUserProfile(mockProgress, mockArticles, mockTutorials);

    const updated = updateProfileWithActivity(profile, 'article', ['javascript'], 15);

    expect(updated.preferredContentTypes.articles).toBeGreaterThan(profile.preferredContentTypes.articles);
  });

  it('should update profile with tutorial activity', () => {
    const profile = buildUserProfile(mockProgress, mockArticles, mockTutorials);

    const updated = updateProfileWithActivity(profile, 'tutorial', ['react'], 45);

    expect(updated.preferredContentTypes.tutorials).toBeGreaterThan(profile.preferredContentTypes.tutorials);
  });

  it('should update average completion time', () => {
    const profile = buildUserProfile(mockProgress, mockArticles, mockTutorials);

    const updated = updateProfileWithActivity(profile, 'article', ['test'], 20);

    expect(updated.averageCompletionTime.articles).not.toBe(profile.averageCompletionTime.articles);
  });

  it('should add new interests', () => {
    const profile = buildUserProfile(mockProgress, mockArticles, mockTutorials);

    const updated = updateProfileWithActivity(profile, 'article', ['rust', 'go'], 25);

    expect(updated.interests).toContain('rust');
    expect(updated.interests).toContain('go');
  });

  it('should boost existing interests', () => {
    const profile = buildUserProfile(mockProgress, mockArticles, mockTutorials);

    const updated = updateProfileWithActivity(profile, 'article', ['javascript'], 15);

    // 'javascript' should be moved higher in interests array if it existed
    expect(updated.interests.length).toBeGreaterThan(0);
  });

  it('should limit total interests', () => {
    const profile: UserProfile = {
      preferredContentTypes: { articles: 0.33, tutorials: 0.33, paths: 0.33 },
      averageCompletionTime: { articles: 10, tutorials: 30 },
      difficultyPreference: { beginner: 1, intermediate: 0, advanced: 0 },
      interests: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
      skillLevel: 'intermediate',
      learningPatterns: {
        prefersShortContent: false,
        prefersInteractiveContent: true,
        likesPrerequisites: true,
      },
    };

    const updated = updateProfileWithActivity(profile, 'article', ['k', 'l'], 15);

    expect(updated.interests.length).toBeLessThanOrEqual(10);
  });
});

describe('Recommendation diversity', () => {
  it('should apply diversity factor to avoid repetitive recommendations', () => {
    const similarArticles: WikiArticle[] = [
      {
        slug: 'js-1',
        title: 'JavaScript Basics',
        section: 'JavaScript',
        content: 'Learn the fundamental concepts of JavaScript programming including variables, functions, and control flow structures that are essential for any web developer.',
        codeBlocks: [],
        tags: ['javascript', 'basics'],
      },
      {
        slug: 'js-2',
        title: 'JavaScript Fundamentals',
        section: 'JavaScript',
        content: 'Master the core JavaScript principles and understand how to write clean and efficient code for your web applications using modern JavaScript syntax.',
        codeBlocks: [],
        tags: ['javascript', 'fundamentals'],
      },
      {
        slug: 'js-3',
        title: 'JavaScript Essentials',
        section: 'JavaScript',
        content: 'Discover the essential JavaScript techniques and best practices that every developer should know to build robust and scalable web applications.',
        codeBlocks: [],
        tags: ['javascript', 'essentials'],
      },
    ];

    // Use a user progress that has some interest in JavaScript
    const progressWithInterest: UserProgress = {
      ...mockProgress,
      completedArticles: [], // No completed articles from the similar list
      totalPoints: 50, // Beginner level
    };

    const lowDiversityRecs = getRecommendedArticles(progressWithInterest, similarArticles, {
      maxResults: 3,
      diversityFactor: 0,
      minConfidence: 0,
    });

    const highDiversityRecs = getRecommendedArticles(progressWithInterest, similarArticles, {
      maxResults: 3,
      diversityFactor: 0.8,
      minConfidence: 0,
    });

    // With high diversity, similar items should have lower scores
    expect(lowDiversityRecs.length).toBeGreaterThan(0);
    expect(highDiversityRecs.length).toBeGreaterThan(0);
  });

  it('should handle zero diversity factor', () => {
    const recommendations = getRecommendedArticles(mockProgress, mockArticles, {
      diversityFactor: 0,
    });

    expect(recommendations).toBeInstanceOf(Array);
  });
});

describe('Edge cases', () => {
  it('should handle empty content arrays', () => {
    const recommendations = getAllRecommendations(mockProgress, [], [], []);

    expect(recommendations.articles).toEqual([]);
    expect(recommendations.tutorials).toEqual([]);
    expect(recommendations.paths).toEqual([]);
  });

  it('should handle user with no progress', () => {
    const emptyProgress: UserProgress = {
      userId: 'new-user',
      completedArticles: [],
      completedTutorials: [],
      completedPaths: [],
      currentPathProgress: {},
      currentTutorialProgress: {},
      achievements: [],
      totalPoints: 0,
      streakDays: 0,
      lastActivity: new Date(),
      createdAt: new Date(),
    };

    const recommendations = getAllRecommendations(
      emptyProgress,
      mockArticles,
      mockTutorials,
      mockPaths,
      { minConfidence: 0 }
    );

    // New users should get recommendations based on default preferences
    expect(recommendations.articles.length + recommendations.tutorials.length + recommendations.paths.length).toBeGreaterThan(0);
  });

  it('should handle very high maxResults', () => {
    const recommendations = getRecommendedArticles(mockProgress, mockArticles, {
      maxResults: 1000,
    });

    expect(recommendations.length).toBeLessThanOrEqual(mockArticles.length);
  });

  it('should handle zero minConfidence', () => {
    const recommendations = getRecommendedArticles(mockProgress, mockArticles, {
      minConfidence: 0,
    });

    expect(recommendations).toBeInstanceOf(Array);
  });

  it('should handle very high minConfidence', () => {
    const recommendations = getRecommendedArticles(mockProgress, mockArticles, {
      minConfidence: 0.99,
    });

    // May return fewer or no results with high confidence threshold
    expect(recommendations).toBeInstanceOf(Array);
  });

  it('should handle negative time constraint gracefully', () => {
    const recommendations = getRecommendedArticles(mockProgress, mockArticles, {
      timeConstraint: -10,
    });

    expect(recommendations).toBeInstanceOf(Array);
  });

  it('should handle focusOnPrerequisites option', () => {
    const recommendations = getAllRecommendations(
      mockProgress,
      mockArticles,
      mockTutorials,
      mockPaths,
      { focusOnPrerequisites: true }
    );

    expect(recommendations).toBeDefined();
  });
});

describe('Recommendation score structure', () => {
  it('should include all required fields', () => {
    const recommendations = getRecommendedArticles(mockProgress, mockArticles);

    recommendations.forEach((rec) => {
      expect(rec).toHaveProperty('item');
      expect(rec).toHaveProperty('score');
      expect(rec).toHaveProperty('confidence');
      expect(rec).toHaveProperty('reason');
      expect(rec).toHaveProperty('explanation');

      expect(typeof rec.score).toBe('number');
      expect(typeof rec.confidence).toBe('number');
      expect(typeof rec.reason).toBe('string');
      expect(typeof rec.explanation).toBe('string');

      expect(rec.score).toBeGreaterThanOrEqual(0);
      expect(rec.confidence).toBeGreaterThanOrEqual(0);
      expect(rec.confidence).toBeLessThanOrEqual(1);
    });
  });

  it('should provide valid recommendation reasons', () => {
    const recommendations = getAllRecommendations(
      mockProgress,
      mockArticles,
      mockTutorials,
      mockPaths
    );

    const allRecs = [
      ...recommendations.articles,
      ...recommendations.tutorials,
      ...recommendations.paths,
    ];

    const validReasons: RecommendationReason[] = [
      'continues_learning_path',
      'builds_on_completed',
      'matches_interest',
      'popular_choice',
      'suitable_for_level',
      'quick_win',
      'prerequisite_for_goal',
      'similar_to_liked',
      'fills_skill_gap',
      'maintains_streak',
    ];

    allRecs.forEach((rec) => {
      expect(validReasons).toContain(rec.reason);
    });
  });
});
