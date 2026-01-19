import { useProgress as useProgressContext } from '@/components/providers/ProgressProvider';
import type { WikiArticle, Tutorial, LearningPath } from '@/types';

/**
 * Main hook for accessing user progress
 *
 * @example
 * const { progress, completeArticle, isArticleCompleted } = useProgress();
 */
export function useProgress() {
  return useProgressContext();
}

/**
 * Hook for getting path-specific progress
 *
 * @example
 * const { progress, completeItem, isCompleted } = usePathProgress('path-id');
 */
export function usePathProgress(pathId: string) {
  const { progress, updatePathItem, completePath, isPathCompleted } = useProgressContext();

  const pathProgress = progress.currentPathProgress[pathId];
  const completedItems = pathProgress?.completedItems || [];
  const currentItemId = pathProgress?.currentItemId;

  const completeItem = (itemId: string) => {
    updatePathItem(pathId, itemId);
  };

  const markPathComplete = (title: string) => {
    completePath(pathId, title);
  };

  return {
    completedItems,
    currentItemId,
    isCompleted: isPathCompleted(pathId),
    completeItem,
    markComplete: markPathComplete,
    progress,
  };
}

/**
 * Hook for getting tutorial-specific progress
 *
 * @example
 * const { completedSteps, currentStep, isCompleted, completeStep } = useTutorialProgress('tutorial-id');
 */
export function useTutorialProgress(tutorialId: string) {
  const { progress, completeTutorialStep, completeTutorial, isTutorialCompleted } = useProgressContext();

  const tutorialProgress = progress.currentTutorialProgress[tutorialId];
  const completedSteps = tutorialProgress?.completedSteps || [];
  const currentStepId = tutorialProgress?.currentStepId;

  const completeStep = (stepId: string) => {
    completeTutorialStep(tutorialId, stepId);
  };

  const markComplete = (title: string, totalSteps: number) => {
    completeTutorial(tutorialId, title, totalSteps);
  };

  return {
    completedSteps,
    currentStepId,
    isCompleted: isTutorialCompleted(tutorialId),
    completeStep,
    markComplete,
  };
}

/**
 * Hook for getting progress statistics
 *
 * @example
 * const { stats, refresh } = useProgressStats();
 */
export function useProgressStats() {
  const { stats, refreshStats, progress } = useProgressContext();

  const refresh = (totalContent: { articles: number; tutorials: number; paths: number }) => {
    refreshStats(totalContent);
  };

  return {
    stats,
    refresh,
    progress,
  };
}

/**
 * Hook for getting user achievements
 *
 * @example
 * const { achievements, totalPoints, recentAchievements } = useAchievements();
 */
export function useAchievements() {
  const { progress } = useProgressContext();

  const achievements = progress.achievements;
  const totalPoints = progress.totalPoints;

  // Get recent achievements (last 5)
  const recentAchievements = [...achievements]
    .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
    .slice(0, 5);

  return {
    achievements,
    totalPoints,
    recentAchievements,
  };
}

/**
 * Hook for getting activity feed
 *
 * @example
 * const { activities, recentActivities } = useActivityFeed();
 */
export function useActivityFeed() {
  const { activities } = useProgressContext();

  // Get recent activities (last 10)
  const recentActivities = activities.slice(0, 10);

  return {
    activities,
    recentActivities,
  };
}

/**
 * Hook for getting personalized recommendations
 *
 * @example
 * const { recommendedArticles, recommendedTutorials, recommendedPaths } = useRecommendations();
 */
export function useRecommendations(
  allArticles: WikiArticle[],
  allTutorials: Tutorial[],
  allPaths: LearningPath[]
) {
  const { getRecommendations } = useProgressContext();

  const recommendations = getRecommendations(allArticles, allTutorials, allPaths);

  return {
    recommendedArticles: recommendations.articles,
    recommendedTutorials: recommendations.tutorials,
    recommendedPaths: recommendations.paths,
  };
}

/**
 * Hook for getting learning streak information
 *
 * @example
 * const { streakDays, lastActivity, hasActivityToday } = useLearningStreak();
 */
export function useLearningStreak() {
  const { progress } = useProgressContext();

  const streakDays = progress.streakDays;
  const lastActivity = progress.lastActivity;

  const hasActivityToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activityDate = new Date(lastActivity);
    activityDate.setHours(0, 0, 0, 0);
    return activityDate.getTime() === today.getTime();
  };

  return {
    streakDays,
    lastActivity,
    hasActivityToday: hasActivityToday(),
  };
}

/**
 * Hook for getting article completion status
 *
 * @example
 * const { isCompleted, markCompleted } = useArticleProgress();
 */
export function useArticleProgress() {
  const { completeArticle, isArticleCompleted } = useProgressContext();

  const markCompleted = (slug: string, title: string) => {
    completeArticle(slug, title);
  };

  const checkCompleted = (slug: string) => {
    return isArticleCompleted(slug);
  };

  return {
    markCompleted,
    isCompleted: checkCompleted,
  };
}
