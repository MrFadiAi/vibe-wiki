import type {
  UserProgress,
  TutorialProgress,
  PathProgress,
  Achievement,
  ProgressStats,
  ProgressActivity,
  LearningPath,
  Tutorial,
  WikiArticle,
} from '@/types';

// Storage keys
const STORAGE_KEY = 'vibe-wiki-user-progress';
const ACTIVITY_KEY = 'vibe-wiki-activity-log';

/**
 * Generate a unique user ID
 */
export function generateUserId(): string {
  let userId = localStorage.getItem('vibe-wiki-user-id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem('vibe-wiki-user-id', userId);
  }
  return userId;
}

/**
 * Create an empty UserProgress object
 */
export function createEmptyProgress(): UserProgress {
  const userId = generateUserId();
  return {
    userId,
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
}

/**
 * Load user progress from localStorage
 */
export function loadProgress(): UserProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return createEmptyProgress();
    }
    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    return {
      ...parsed,
      lastActivity: new Date(parsed.lastActivity),
      createdAt: new Date(parsed.createdAt),
      achievements: parsed.achievements.map((a: Achievement) => ({
        ...a,
        unlockedAt: new Date(a.unlockedAt),
      })),
      currentPathProgress: Object.entries(parsed.currentPathProgress || {}).reduce(
        (acc, [key, value]: [string, unknown]) => ({
          ...acc,
          [key]: {
            ...(value as PathProgress),
            startedAt: (value as PathProgress).startedAt
              ? new Date((value as PathProgress).startedAt!)
              : undefined,
            completedAt: (value as PathProgress).completedAt
              ? new Date((value as PathProgress).completedAt!)
              : undefined,
          },
        }),
        {}
      ),
      currentTutorialProgress: Object.entries(parsed.currentTutorialProgress || {}).reduce(
        (acc, [key, value]: [string, unknown]) => ({
          ...acc,
          [key]: {
            ...(value as TutorialProgress),
            startedAt: (value as TutorialProgress).startedAt
              ? new Date((value as TutorialProgress).startedAt!)
              : undefined,
            completedAt: (value as TutorialProgress).completedAt
              ? new Date((value as TutorialProgress).completedAt!)
              : undefined,
          },
        }),
        {}
      ),
    };
  } catch (error) {
    console.error('Failed to load progress:', error);
    return createEmptyProgress();
  }
}

/**
 * Save user progress to localStorage
 */
export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
}

/**
 * Mark an article as completed
 */
export function markArticleCompleted(progress: UserProgress, articleSlug: string, articleTitle: string): UserProgress {
  if (progress.completedArticles.includes(articleSlug)) {
    return progress;
  }

  const updated = {
    ...progress,
    completedArticles: [...progress.completedArticles, articleSlug],
    totalPoints: progress.totalPoints + 10,
    lastActivity: new Date(),
  };

  // Check for achievements
  const achievements = checkArticleAchievements(updated);
  if (achievements.length > 0) {
    updated.achievements = [...updated.achievements, ...achievements];
    updated.totalPoints = achievements.reduce((sum, a) => sum + (a.points || 0), updated.totalPoints);
  }

  // Log activity
  logActivity({
    id: `activity_${Date.now()}`,
    type: 'article_completed',
    contentId: articleSlug,
    contentTitle: articleTitle,
    timestamp: new Date(),
    points: 10,
  });

  saveProgress(updated);
  return updated;
}

/**
 * Mark a tutorial step as completed
 */
export function markTutorialStepCompleted(
  progress: UserProgress,
  tutorialId: string,
  stepId: string
): UserProgress {
  const tutorialProgress = progress.currentTutorialProgress[tutorialId] || {
    tutorialId,
    completedSteps: [],
    startedAt: new Date(),
  };

  if (tutorialProgress.completedSteps.includes(stepId)) {
    return progress;
  }

  const updatedProgress = {
    ...tutorialProgress,
    completedSteps: [...tutorialProgress.completedSteps, stepId],
    currentStepId: stepId,
  };

  return {
    ...progress,
    currentTutorialProgress: {
      ...progress.currentTutorialProgress,
      [tutorialId]: updatedProgress,
    },
    lastActivity: new Date(),
  };
}

/**
 * Mark a tutorial as completed
 */
export function markTutorialCompleted(
  progress: UserProgress,
  tutorialId: string,
  tutorialTitle: string,
  totalSteps: number
): UserProgress {
  if (progress.completedTutorials.includes(tutorialId)) {
    return progress;
  }

  // Validate that all steps are completed
  const tutorialProgress = progress.currentTutorialProgress[tutorialId];
  const completedSteps = tutorialProgress?.completedSteps.length || 0;
  if (totalSteps > 0 && completedSteps < totalSteps) {
    // Not all steps completed yet, don't mark as completed
    return progress;
  }

  const updated = {
    ...progress,
    completedTutorials: [...progress.completedTutorials, tutorialId],
    currentTutorialProgress: {
      ...progress.currentTutorialProgress,
      [tutorialId]: {
        ...progress.currentTutorialProgress[tutorialId],
        completedAt: new Date(),
      },
    },
    totalPoints: progress.totalPoints + 50,
    lastActivity: new Date(),
  };

  // Check for achievements
  const achievements = checkTutorialAchievements(updated);
  if (achievements.length > 0) {
    updated.achievements = [...updated.achievements, ...achievements];
    updated.totalPoints = achievements.reduce((sum, a) => sum + (a.points || 0), updated.totalPoints);
  }

  // Log activity
  logActivity({
    id: `activity_${Date.now()}`,
    type: 'tutorial_completed',
    contentId: tutorialId,
    contentTitle: tutorialTitle,
    timestamp: new Date(),
    points: 50,
  });

  saveProgress(updated);
  return updated;
}

/**
 * Update path progress
 */
export function updatePathProgress(
  progress: UserProgress,
  pathId: string,
  itemId: string
): UserProgress {
  const pathProgress = progress.currentPathProgress[pathId] || {
    pathId,
    completedItems: [],
    startedAt: new Date(),
  };

  if (pathProgress.completedItems.includes(itemId)) {
    return progress;
  }

  const updatedProgress = {
    ...pathProgress,
    completedItems: [...pathProgress.completedItems, itemId],
    currentItemId: itemId,
  };

  return {
    ...progress,
    currentPathProgress: {
      ...progress.currentPathProgress,
      [pathId]: updatedProgress,
    },
    lastActivity: new Date(),
  };
}

/**
 * Mark a path as completed
 */
export function markPathCompleted(
  progress: UserProgress,
  pathId: string,
  pathTitle: string
): UserProgress {
  if (progress.completedPaths.includes(pathId)) {
    return progress;
  }

  const updated = {
    ...progress,
    completedPaths: [...progress.completedPaths, pathId],
    currentPathProgress: {
      ...progress.currentPathProgress,
      [pathId]: {
        ...progress.currentPathProgress[pathId],
        completedAt: new Date(),
      },
    },
    totalPoints: progress.totalPoints + 100,
    lastActivity: new Date(),
  };

  // Check for achievements
  const achievements = checkPathAchievements(updated);
  if (achievements.length > 0) {
    updated.achievements = [...updated.achievements, ...achievements];
    updated.totalPoints = achievements.reduce((sum, a) => sum + (a.points || 0), updated.totalPoints);
  }

  // Log activity
  logActivity({
    id: `activity_${Date.now()}`,
    type: 'path_completed',
    contentId: pathId,
    contentTitle: pathTitle,
    timestamp: new Date(),
    points: 100,
  });

  saveProgress(updated);
  return updated;
}

/**
 * Calculate progress statistics
 */
export function calculateProgressStats(progress: UserProgress, totalContent: {
  articles: number;
  tutorials: number;
  paths: number;
}): ProgressStats {
  const totalItems = totalContent.articles + totalContent.tutorials + totalContent.paths;
  const completedItems =
    progress.completedArticles.length +
    progress.completedTutorials.length +
    progress.completedPaths.length;

  return {
    totalArticlesRead: progress.completedArticles.length,
    totalTutorialsCompleted: progress.completedTutorials.length,
    totalPathsCompleted: progress.completedPaths.length,
    totalTimeSpent: calculateTimeSpent(progress),
    currentStreak: calculateStreak(progress),
    achievementsCount: progress.achievements.length,
    totalPoints: progress.totalPoints,
    completionRate: totalItems > 0 ? (completedItems / totalItems) * 100 : 0,
  };
}

/**
 * Calculate total time spent (estimated)
 */
export function calculateTimeSpent(progress: UserProgress): number {
  // Approximate: 10 min per article, 50 per tutorial, 100 per path
  return (
    progress.completedArticles.length * 10 +
    progress.completedTutorials.length * 50 +
    progress.completedPaths.length * 100
  );
}

/**
 * Calculate current streak (consecutive days with activity)
 */
export function calculateStreak(progress: UserProgress): number {
  // Note: progress parameter is part of the API for consistency but not currently used
  // The function reads activities from localStorage for accurate streak calculation
  void progress; // Explicitly mark as used to avoid lint warnings
  const activities = loadActivities();
  if (activities.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group activities by day
  const daysWithActivity = new Set(
    activities.map((a) => {
      const date = new Date(a.timestamp);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
  );

  let streak = 0;
  let currentDate = today;

  // Check backwards from today
  while (daysWithActivity.has(currentDate.getTime())) {
    streak++;
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

/**
 * Log an activity
 */
export function logActivity(activity: ProgressActivity): void {
  try {
    const activities = loadActivities();
    activities.unshift(activity); // Add to beginning
    // Keep only last 100 activities
    if (activities.length > 100) {
      activities.pop();
    }
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities));
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

/**
 * Load activities
 */
export function loadActivities(): ProgressActivity[] {
  try {
    const stored = localStorage.getItem(ACTIVITY_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((a: ProgressActivity) => ({
      ...a,
      timestamp: new Date(a.timestamp),
    }));
  } catch (error) {
    console.error('Failed to load activities:', error);
    return [];
  }
}

/**
 * Clear all progress (for testing/debugging)
 */
export function clearProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ACTIVITY_KEY);
}

/**
 * Export progress data
 */
export function exportProgress(): string {
  const progress = loadProgress();
  const activities = loadActivities();
  return JSON.stringify({ progress, activities }, null, 2);
}

/**
 * Import progress data
 */
export function importProgress(data: string): boolean {
  try {
    const parsed = JSON.parse(data);
    if (parsed.progress) {
      saveProgress(parsed.progress);
    }
    if (parsed.activities) {
      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(parsed.activities));
    }
    return true;
  } catch (error) {
    console.error('Failed to import progress:', error);
    return false;
  }
}

// Achievement definitions
const ACHIEVEMENTS = {
  firstArticle: {
    id: 'first_article',
    title: 'First Steps',
    description: 'Complete your first article',
    icon: '📖',
    category: 'article' as const,
    points: 5,
  },
  fiveArticles: {
    id: 'five_articles',
    title: 'Knowledge Seeker',
    description: 'Complete 5 articles',
    icon: '📚',
    category: 'article' as const,
    points: 25,
  },
  firstTutorial: {
    id: 'first_tutorial',
    title: 'Hands-On Learner',
    description: 'Complete your first tutorial',
    icon: '👨‍💻',
    category: 'tutorial' as const,
    points: 25,
  },
  threeTutorials: {
    id: 'three_tutorials',
    title: 'Skill Builder',
    description: 'Complete 3 tutorials',
    icon: '🔧',
    category: 'tutorial' as const,
    points: 50,
  },
  firstPath: {
    id: 'first_path',
    title: 'Path Finder',
    description: 'Complete your first learning path',
    icon: '🎯',
    category: 'path' as const,
    points: 50,
  },
  threeDayStreak: {
    id: 'three_day_streak',
    title: 'Consistent Learner',
    description: 'Maintain a 3-day learning streak',
    icon: '🔥',
    category: 'streak' as const,
    points: 30,
  },
  sevenDayStreak: {
    id: 'seven_day_streak',
    title: 'Dedicated Student',
    description: 'Maintain a 7-day learning streak',
    icon: '⚡',
    category: 'streak' as const,
    points: 75,
  },
};

/**
 * Check for article-related achievements
 */
function checkArticleAchievements(progress: UserProgress): Achievement[] {
  const newAchievements: Achievement[] = [];
  const existingIds = new Set(progress.achievements.map((a) => a.id));

  if (!existingIds.has('first_article') && progress.completedArticles.length >= 1) {
    newAchievements.push({
      ...ACHIEVEMENTS.firstArticle,
      unlockedAt: new Date(),
    });
  }

  if (!existingIds.has('five_articles') && progress.completedArticles.length >= 5) {
    newAchievements.push({
      ...ACHIEVEMENTS.fiveArticles,
      unlockedAt: new Date(),
    });
  }

  return newAchievements;
}

/**
 * Check for tutorial-related achievements
 */
function checkTutorialAchievements(progress: UserProgress): Achievement[] {
  const newAchievements: Achievement[] = [];
  const existingIds = new Set(progress.achievements.map((a) => a.id));

  if (!existingIds.has('first_tutorial') && progress.completedTutorials.length >= 1) {
    newAchievements.push({
      ...ACHIEVEMENTS.firstTutorial,
      unlockedAt: new Date(),
    });
  }

  if (!existingIds.has('three_tutorials') && progress.completedTutorials.length >= 3) {
    newAchievements.push({
      ...ACHIEVEMENTS.threeTutorials,
      unlockedAt: new Date(),
    });
  }

  return newAchievements;
}

/**
 * Check for path-related achievements
 */
function checkPathAchievements(progress: UserProgress): Achievement[] {
  const newAchievements: Achievement[] = [];
  const existingIds = new Set(progress.achievements.map((a) => a.id));

  if (!existingIds.has('first_path') && progress.completedPaths.length >= 1) {
    newAchievements.push({
      ...ACHIEVEMENTS.firstPath,
      unlockedAt: new Date(),
    });
  }

  return newAchievements;
}

/**
 * Check for streak achievements
 */
export function checkStreakAchievements(progress: UserProgress): Achievement[] {
  const newAchievements: Achievement[] = [];
  const existingIds = new Set(progress.achievements.map((a) => a.id));
  const streak = calculateStreak(progress);

  if (!existingIds.has('three_day_streak') && streak >= 3) {
    newAchievements.push({
      ...ACHIEVEMENTS.threeDayStreak,
      unlockedAt: new Date(),
    });
  }

  if (!existingIds.has('seven_day_streak') && streak >= 7) {
    newAchievements.push({
      ...ACHIEVEMENTS.sevenDayStreak,
      unlockedAt: new Date(),
    });
  }

  return newAchievements;
}

/**
 * Get all available achievements
 */
export function getAllAchievements(): Achievement[] {
  return Object.values(ACHIEVEMENTS).map((a) => ({
    ...a,
    unlockedAt: new Date(), // Placeholder
  }));
}

/**
 * Get tutorial progress percentage
 */
export function getTutorialProgress(tutorial: Tutorial, progress: UserProgress): number {
  const tutorialProgress = progress.currentTutorialProgress[tutorial.id];
  if (!tutorialProgress) return 0;

  const completedCount = tutorialProgress.completedSteps.length;
  const totalSteps = tutorial.steps.length;
  return totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
}

/**
 * Check if tutorial is completed
 */
export function isTutorialCompleted(tutorialId: string, progress: UserProgress): boolean {
  return progress.completedTutorials.includes(tutorialId);
}

/**
 * Check if article is completed
 */
export function isArticleCompleted(articleSlug: string, progress: UserProgress): boolean {
  return progress.completedArticles.includes(articleSlug);
}

/**
 * Check if path is completed
 */
export function isPathCompleted(pathId: string, progress: UserProgress): boolean {
  return progress.completedPaths.includes(pathId);
}

/**
 * Get recommended content based on progress
 */
export function getRecommendedContent(
  progress: UserProgress,
  articles: WikiArticle[],
  tutorials: Tutorial[],
  paths: LearningPath[]
): {
  articles: WikiArticle[];
  tutorials: Tutorial[];
  paths: LearningPath[];
} {
  // Filter out completed content
  const recommendedArticles = articles.filter(
    (a) => !progress.completedArticles.includes(a.slug)
  ).slice(0, 3);

  const recommendedTutorials = tutorials.filter(
    (t) => !progress.completedTutorials.includes(t.id)
  ).slice(0, 3);

  const recommendedPaths = paths.filter(
    (p) => !progress.completedPaths.includes(p.id)
  ).slice(0, 3);

  return {
    articles: recommendedArticles,
    tutorials: recommendedTutorials,
    paths: recommendedPaths,
  };
}
