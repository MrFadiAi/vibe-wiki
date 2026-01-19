'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import type { UserProgress, ProgressStats, ProgressActivity, WikiArticle, Tutorial, LearningPath } from '@/types';
import {
  loadProgress,
  saveProgress,
  markArticleCompleted,
  markTutorialStepCompleted,
  markTutorialCompleted,
  updatePathProgress,
  markPathCompleted,
  calculateProgressStats,
  checkStreakAchievements,
  getTutorialProgress,
  isTutorialCompleted,
  isArticleCompleted,
  isPathCompleted,
  getRecommendedContent,
} from '@/lib/progress-utils';

interface ProgressContextType {
  progress: UserProgress;
  stats: ProgressStats | null;
  activities: ProgressActivity[];
  isLoading: boolean;

  // Actions
  completeArticle: (slug: string, title: string) => void;
  completeTutorialStep: (tutorialId: string, stepId: string) => void;
  completeTutorial: (tutorialId: string, title: string, totalSteps: number) => void;
  updatePathItem: (pathId: string, itemId: string) => void;
  completePath: (pathId: string, title: string) => void;
  refreshStats: (totalContent: { articles: number; tutorials: number; paths: number }) => void;
  clearAllProgress: () => void;

  // Queries
  getTutorialProgress: (tutorial: Tutorial) => number;
  isTutorialCompleted: (tutorialId: string) => boolean;
  isArticleCompleted: (slug: string) => boolean;
  isPathCompleted: (pathId: string) => boolean;
  getRecommendations: (articles: WikiArticle[], tutorials: Tutorial[], paths: LearningPath[]) => {
    articles: WikiArticle[];
    tutorials: Tutorial[];
    paths: LearningPath[];
  };
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

interface ProgressProviderProps {
  children: ReactNode;
}

const loadActivities = (): ProgressActivity[] => {
  try {
    const stored = localStorage.getItem('vibe-wiki-activity-log');
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
};

export function ProgressProvider({ children }: ProgressProviderProps) {
  const [progress, setProgress] = useState<UserProgress>(loadProgress());
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [activities, setActivities] = useState<ProgressActivity[]>(loadActivities);
  const [isLoading] = useState(false);
  const progressRef = useRef<UserProgress>(progress);

  // Update ref when progress changes
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const completeArticle = (slug: string, title: string) => {
    setProgress((currentProgress) => {
      const updated = markArticleCompleted(currentProgress, slug, title);
      // Update ref immediately so refreshStats can see the new value
      progressRef.current = updated;
      return updated;
    });
  };

  // Update stats when progress changes
  const refreshStats = (totalContent: { articles: number; tutorials: number; paths: number }) => {
    // Read from progressRef to ensure we get the latest value
    const currentProgress = progressRef.current;
    setStats(() => calculateProgressStats(currentProgress, totalContent));

    // Check for streak achievements
    const newAchievements = checkStreakAchievements(currentProgress);
    if (newAchievements.length > 0) {
      const updated = {
        ...currentProgress,
        achievements: [...currentProgress.achievements, ...newAchievements],
        totalPoints: newAchievements.reduce((sum, a) => sum + (a.points || 0), currentProgress.totalPoints),
      };
      setProgress(updated);
      saveProgress(updated);
    }
  };

  const completeTutorialStep = (tutorialId: string, stepId: string) => {
    setProgress((currentProgress) => {
      const updated = markTutorialStepCompleted(currentProgress, tutorialId, stepId);
      progressRef.current = updated;
      return updated;
    });
  };

  const completeTutorial = (tutorialId: string, title: string, totalSteps: number) => {
    setProgress((currentProgress) => {
      const updated = markTutorialCompleted(currentProgress, tutorialId, title, totalSteps);
      progressRef.current = updated;
      return updated;
    });
  };

  const updatePathItem = (pathId: string, itemId: string) => {
    setProgress((currentProgress) => {
      const updated = updatePathProgress(currentProgress, pathId, itemId);
      progressRef.current = updated;
      return updated;
    });
  };

  const completePath = (pathId: string, title: string) => {
    setProgress((currentProgress) => {
      const updated = markPathCompleted(currentProgress, pathId, title);
      progressRef.current = updated;
      return updated;
    });
  };

  const clearAllProgress = () => {
    localStorage.removeItem('vibe-wiki-user-progress');
    localStorage.removeItem('vibe-wiki-activity-log');
    localStorage.removeItem('vibe-wiki-user-id');
    setProgress(loadProgress());
    setActivities([]);
    setStats(null);
  };

  const getTutorialProgressValue = (tutorial: Tutorial): number => {
    return getTutorialProgress(tutorial, progress);
  };

  const isTutorialCompletedValue = (tutorialId: string): boolean => {
    return isTutorialCompleted(tutorialId, progress);
  };

  const isArticleCompletedValue = (slug: string): boolean => {
    return isArticleCompleted(slug, progress);
  };

  const isPathCompletedValue = (pathId: string): boolean => {
    return isPathCompleted(pathId, progress);
  };

  const getRecommendationsValue = (
    articles: WikiArticle[],
    tutorials: Tutorial[],
    paths: LearningPath[]
  ) => {
    return getRecommendedContent(progress, articles, tutorials, paths);
  };

  const value: ProgressContextType = {
    progress,
    stats,
    activities,
    isLoading,
    completeArticle,
    completeTutorialStep,
    completeTutorial,
    updatePathItem,
    completePath,
    refreshStats,
    clearAllProgress,
    getTutorialProgress: getTutorialProgressValue,
    isTutorialCompleted: isTutorialCompletedValue,
    isArticleCompleted: isArticleCompletedValue,
    isPathCompleted: isPathCompletedValue,
    getRecommendations: getRecommendationsValue,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextType {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
