/**
 * Tests for ProgressProvider.tsx
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ProgressProvider, useProgress } from '@/components/providers/ProgressProvider';
import type { WikiArticle, Tutorial, LearningPath } from '@/types';
import { clearProgress } from '@/lib/progress-utils';

describe('ProgressProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    clearProgress();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ProgressProvider>{children}</ProgressProvider>
  );

  describe('useProgress hook', () => {
    it('should provide progress context', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      expect(result.current.progress).toBeDefined();
      expect(result.current.progress.userId).toBeTruthy();
    });

    it('should provide completeArticle action', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.completeArticle('test-article', 'Test Article');
      });

      expect(result.current.progress.completedArticles).toContain('test-article');
    });

    it('should provide completeTutorialStep action', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.completeTutorialStep('tutorial-1', 'step-1');
      });

      expect(result.current.progress.currentTutorialProgress['tutorial-1']).toBeDefined();
      expect(result.current.progress.currentTutorialProgress['tutorial-1'].completedSteps).toContain('step-1');
    });

    it('should provide completeTutorial action', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        // First complete all required steps
        for (let i = 1; i <= 5; i++) {
          result.current.completeTutorialStep('tutorial-1', `step-${i}`);
        }
        // Then mark as completed
        result.current.completeTutorial('tutorial-1', 'Test Tutorial', 5);
      });

      expect(result.current.progress.completedTutorials).toContain('tutorial-1');
    });

    it('should provide updatePathItem action', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.updatePathItem('path-1', 'item-1');
      });

      expect(result.current.progress.currentPathProgress['path-1']).toBeDefined();
      expect(result.current.progress.currentPathProgress['path-1'].completedItems).toContain('item-1');
    });

    it('should provide completePath action', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.completePath('path-1', 'Test Path');
      });

      expect(result.current.progress.completedPaths).toContain('path-1');
    });
  });

  describe('progress queries', () => {
    it('should check if article is completed', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      expect(result.current.isArticleCompleted('article-1')).toBe(false);

      act(() => {
        result.current.completeArticle('article-1', 'Article 1');
      });

      expect(result.current.isArticleCompleted('article-1')).toBe(true);
    });

    it('should check if tutorial is completed', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      expect(result.current.isTutorialCompleted('tutorial-1')).toBe(false);

      act(() => {
        // First complete all required steps
        for (let i = 1; i <= 5; i++) {
          result.current.completeTutorialStep('tutorial-1', `step-${i}`);
        }
        // Then mark as completed
        result.current.completeTutorial('tutorial-1', 'Tutorial 1', 5);
      });

      expect(result.current.isTutorialCompleted('tutorial-1')).toBe(true);
    });

    it('should check if path is completed', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      expect(result.current.isPathCompleted('path-1')).toBe(false);

      act(() => {
        result.current.completePath('path-1', 'Path 1');
      });

      expect(result.current.isPathCompleted('path-1')).toBe(true);
    });

    it('should get tutorial progress percentage', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      const tutorial: Tutorial = {
        id: 'tutorial-1',
        slug: 'tutorial-1',
        title: 'Test Tutorial',
        description: 'Test',
        section: 'test',
        difficulty: 'beginner',
        estimatedMinutes: 30,
        learningObjectives: [],
        steps: [
          { id: 'step-1', title: 'Step 1', content: 'Content', order: 1 },
          { id: 'step-2', title: 'Step 2', content: 'Content', order: 2 },
          { id: 'step-3', title: 'Step 3', content: 'Content', order: 3 },
          { id: 'step-4', title: 'Step 4', content: 'Content', order: 4 },
        ],
      };

      // No progress
      expect(result.current.getTutorialProgress(tutorial)).toBe(0);

      // Complete 2 out of 4 steps
      act(() => {
        result.current.completeTutorialStep('tutorial-1', 'step-1');
        result.current.completeTutorialStep('tutorial-1', 'step-2');
      });

      expect(result.current.getTutorialProgress(tutorial)).toBe(50);
    });

    it('should get recommended content', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      const articles: WikiArticle[] = [
        { slug: 'article-1', title: 'Article 1', section: 'test', content: 'content' },
        { slug: 'article-2', title: 'Article 2', section: 'test', content: 'content' },
        { slug: 'article-3', title: 'Article 3', section: 'test', content: 'content' },
      ];

      const tutorials: Tutorial[] = [
        {
          id: 'tutorial-1',
          slug: 'tutorial-1',
          title: 'Tutorial 1',
          description: 'Test',
          section: 'test',
          difficulty: 'beginner',
          estimatedMinutes: 30,
          learningObjectives: [],
          steps: [],
        },
      ];

      const paths: LearningPath[] = [
        {
          id: 'path-1',
          slug: 'path-1',
          title: 'Path 1',
          description: 'Test',
          difficulty: 'beginner',
          estimatedMinutes: 60,
          targetAudience: [],
          learningObjectives: [],
          items: [],
        },
      ];

      act(() => {
        result.current.completeArticle('article-1', 'Article 1');
      });

      const recommendations = result.current.getRecommendations(articles, tutorials, paths);

      expect(recommendations.articles.map((a) => a.slug)).not.toContain('article-1');
      expect(recommendations.articles.map((a) => a.slug)).toContain('article-2');
      expect(recommendations.tutorials).toHaveLength(1);
      expect(recommendations.paths).toHaveLength(1);
    });
  });

  describe('refreshStats', () => {
    it('should calculate and update stats', async () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.completeArticle('article-1', 'Article 1');
        result.current.completeArticle('article-2', 'Article 2');
      });

      act(() => {
        result.current.refreshStats({ articles: 10, tutorials: 5, paths: 3 });
      });

      // Wait for state updates to flush
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.stats).toBeDefined();
      expect(result.current.stats?.totalArticlesRead).toBe(2);
      expect(result.current.stats?.completionRate).toBeCloseTo(11.11, 1); // 2/18 = 11.11% (total = 10+5+3=18)
    });
  });

  describe('clearAllProgress', () => {
    it('should clear all progress data', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.completeArticle('article-1', 'Article 1');
        // First complete all required steps, then mark tutorial as completed
        for (let i = 1; i <= 5; i++) {
          result.current.completeTutorialStep('tutorial-1', `step-${i}`);
        }
        result.current.completeTutorial('tutorial-1', 'Tutorial 1', 5);
      });

      expect(result.current.progress.completedArticles).toHaveLength(1);
      expect(result.current.progress.completedTutorials).toHaveLength(1);

      act(() => {
        result.current.clearAllProgress();
      });

      expect(result.current.progress.completedArticles).toHaveLength(0);
      expect(result.current.progress.completedTutorials).toHaveLength(0);
    });
  });
});
