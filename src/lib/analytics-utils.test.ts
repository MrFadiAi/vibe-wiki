import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  generateSessionId,
  getCurrentSessionId,
  trackEvent,
  trackPageView,
  trackArticleView,
  trackArticleComplete,
  trackTutorialView,
  trackTutorialStepComplete,
  trackTutorialComplete,
  trackPathView,
  trackPathItemComplete,
  trackPathComplete,
  trackSearch,
  trackRecommendationClick,
  trackRecommendationImpression,
  trackAchievementUnlock,
  trackSessionStart,
  trackSessionEnd,
  loadEvents,
  loadSessions,
  loadContentMetrics,
  loadSearches,
  loadRecommendations,
  calculateUserEngagementMetrics,
  calculatePlatformMetrics,
  getContentPerformance,
  getTopContent,
  calculateConversionFunnel,
  generateAnalyticsReport,
  clearAnalytics,
  exportAnalytics,
} from './analytics-utils';
import type { UserProgress } from '@/types';

describe('analytics-utils', () => {
  beforeEach(() => {
    // Clear all localStorage and sessionStorage before each test
    localStorage.clear();
    sessionStorage.clear();

    // Mock navigator and window properties
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (test)',
      writable: true,
    });

    Object.defineProperty(window, 'location', {
      value: { href: 'https://example.com/test' },
      writable: true,
    });

    Object.defineProperty(document, 'referrer', {
      value: 'https://example.com',
      writable: true,
    });

    Object.defineProperty(window, 'innerWidth', {
      value: 1920,
      writable: true,
    });

    Object.defineProperty(window, 'innerHeight', {
      value: 1080,
      writable: true,
    });
  });

  afterEach(() => {
    clearAnalytics();
  });

  describe('Session Management', () => {
    it('should generate a unique session ID', () => {
      const sessionId1 = generateSessionId();
      const sessionId2 = getCurrentSessionId();

      expect(sessionId1).toBeTruthy();
      expect(sessionId1).toBe(sessionId2);
      expect(sessionId1).toMatch(/^session_\d+_[a-z0-9]+$/);
    });

    it('should retrieve the current session ID', () => {
      const sessionId = sessionStorage.getItem('vibe-wiki-session-id');
      expect(sessionId).toBeNull();

      const newSessionId = getCurrentSessionId();
      expect(newSessionId).toBeTruthy();

      const retrievedSessionId = getCurrentSessionId();
      expect(retrievedSessionId).toBe(newSessionId);
    });

    it('should generate a new session ID when none exists', () => {
      const sessionId1 = getCurrentSessionId();
      sessionStorage.removeItem('vibe-wiki-session-id');
      const sessionId2 = getCurrentSessionId();

      expect(sessionId1).toBeTruthy();
      expect(sessionId2).toBeTruthy();
      expect(sessionId1).not.toBe(sessionId2);
    });
  });

  describe('Event Tracking', () => {
    it('should track an event with required fields', () => {
      trackEvent('page_view', 'user-123', { pageType: 'home' });

      const events = loadEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('page_view');
      expect(events[0].userId).toBe('user-123');
      expect(events[0].properties?.pageType).toBe('home');
    });

    it('should track an event with metadata', () => {
      trackEvent('article_view', 'user-456', { articleSlug: 'test-article' });

      const events = loadEvents();
      expect(events).toHaveLength(1);
      expect(events[0].metadata?.userAgent).toBe('Mozilla/5.0 (test)');
      expect(events[0].metadata?.url).toBe('https://example.com/test');
      expect(events[0].metadata?.referrer).toBe('https://example.com');
      expect(events[0].metadata?.viewport).toEqual({ width: 1920, height: 1080 });
    });

    it('should track multiple events', () => {
      trackEvent('page_view', 'user-123');
      trackEvent('article_view', 'user-123');
      trackEvent('search', 'user-123');

      const events = loadEvents();
      expect(events).toHaveLength(3);
    });

    it('should limit events to 1000', () => {
      for (let i = 0; i < 1500; i++) {
        trackEvent('page_view', `user-${i}`);
      }

      const events = loadEvents();
      expect(events.length).toBeLessThanOrEqual(1000);
    });

    it('should generate unique event IDs', () => {
      trackEvent('page_view', 'user-123');
      trackEvent('page_view', 'user-456');

      const events = loadEvents();
      expect(events[0].id).not.toBe(events[1].id);
      expect(events[0].id).toMatch(/^event_\d+_[a-z0-9]+$/);
    });
  });

  describe('Page View Tracking', () => {
    it('should track page views', () => {
      trackPageView('user-123', 'article', 'test-article');

      const events = loadEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('page_view');
      expect(events[0].properties?.pageType).toBe('article');
      expect(events[0].properties?.pageId).toBe('test-article');
    });
  });

  describe('Article Tracking', () => {
    it('should track article views', () => {
      trackArticleView('user-123', 'test-article', 'Test Article');

      const events = loadEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('article_view');
      expect(events[0].properties?.articleSlug).toBe('test-article');
      expect(events[0].properties?.articleTitle).toBe('Test Article');
    });

    it('should track article completions', () => {
      trackArticleComplete('user-123', 'test-article', 'Test Article');

      const events = loadEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('article_complete');
      expect(events[0].properties?.articleSlug).toBe('test-article');
    });

    it('should update content metrics for article views', () => {
      trackArticleView('user-123', 'test-article', 'Test Article');

      const metrics = loadContentMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].contentId).toBe('test-article');
      expect(metrics[0].contentType).toBe('article');
      expect(metrics[0].views).toBe(1);
    });

    it('should update content metrics for article completions', () => {
      trackArticleView('user-123', 'test-article', 'Test Article');
      trackArticleComplete('user-123', 'test-article', 'Test Article');

      const metrics = loadContentMetrics();
      expect(metrics[0].completions).toBe(1);
      expect(metrics[0].completionRate).toBe(1);
    });

    it('should increment views for the same article', () => {
      trackArticleView('user-123', 'test-article', 'Test Article');
      trackArticleView('user-456', 'test-article', 'Test Article');

      const metrics = loadContentMetrics();
      expect(metrics[0].views).toBe(2);
    });
  });

  describe('Tutorial Tracking', () => {
    it('should track tutorial views', () => {
      trackTutorialView('user-123', 'tutorial-1', 'Test Tutorial');

      const events = loadEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('tutorial_view');
      expect(events[0].properties?.tutorialId).toBe('tutorial-1');
      expect(events[0].properties?.tutorialTitle).toBe('Test Tutorial');
    });

    it('should track tutorial step completions', () => {
      trackTutorialStepComplete('user-123', 'tutorial-1', 'step-1', 1);

      const events = loadEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('tutorial_step_complete');
      expect(events[0].properties?.tutorialId).toBe('tutorial-1');
      expect(events[0].properties?.stepId).toBe('step-1');
      expect(events[0].properties?.stepNumber).toBe(1);
    });

    it('should track tutorial completions', () => {
      trackTutorialComplete('user-123', 'tutorial-1', 'Test Tutorial');

      const events = loadEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('tutorial_complete');
      expect(events[0].properties?.tutorialId).toBe('tutorial-1');
    });
  });

  describe('Path Tracking', () => {
    it('should track path views', () => {
      trackPathView('user-123', 'path-1', 'Test Path');

      const events = loadEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('path_view');
      expect(events[0].properties?.pathId).toBe('path-1');
      expect(events[0].properties?.pathTitle).toBe('Test Path');
    });

    it('should track path item completions', () => {
      trackPathItemComplete('user-123', 'path-1', 'item-1', 'article');

      const events = loadEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('path_item_complete');
      expect(events[0].properties?.pathId).toBe('path-1');
      expect(events[0].properties?.itemId).toBe('item-1');
      expect(events[0].properties?.itemType).toBe('article');
    });

    it('should track path completions', () => {
      trackPathComplete('user-123', 'path-1', 'Test Path');

      const events = loadEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('path_complete');
      expect(events[0].properties?.pathId).toBe('path-1');
    });
  });

  describe('Search Tracking', () => {
    it('should track search queries', () => {
      trackSearch('user-123', 'react hooks', 5);

      const events = loadEvents();
      const searches = loadSearches();

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('search');
      expect(events[0].properties?.query).toBe('react hooks');
      expect(events[0].properties?.resultsCount).toBe(5);

      expect(searches).toHaveLength(1);
      expect(searches[0].query).toBe('react hooks');
      expect(searches[0].resultsCount).toBe(5);
    });

    it('should track search with clicked result', () => {
      trackSearch('user-123', 'react hooks', 5, 'article-1');

      const searches = loadSearches();
      expect(searches[0].clickedResult).toBe('article-1');
    });

    it('should limit searches to 500', () => {
      for (let i = 0; i < 600; i++) {
        trackSearch('user-123', `query-${i}`, 1);
      }

      const searches = loadSearches();
      expect(searches.length).toBeLessThanOrEqual(500);
    });
  });

  describe('Recommendation Tracking', () => {
    it('should track recommendation clicks', () => {
      trackRecommendationClick('user-123', 'article-1', 'article', 1, 'matches_interest');

      const events = loadEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('recommendation_click');
      expect(events[0].properties?.contentId).toBe('article-1');
      expect(events[0].properties?.contentType).toBe('article');
      expect(events[0].properties?.position).toBe(1);
      expect(events[0].properties?.reason).toBe('matches_interest');
    });

    it('should track recommendation impressions', () => {
      trackRecommendationImpression('article-1', 'article', 1);

      const recommendations = loadRecommendations();
      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].contentId).toBe('article-1');
      expect(recommendations[0].impressions).toBe(1);
      expect(recommendations[0].clicks).toBe(0);
      expect(recommendations[0].clickThroughRate).toBe(0);
    });

    it('should calculate CTR for recommendations', () => {
      trackRecommendationImpression('article-1', 'article', 1);
      trackRecommendationImpression('article-1', 'article', 1);
      trackRecommendationClick('user-123', 'article-1', 'article', 1);

      const recommendations = loadRecommendations();
      expect(recommendations[0].impressions).toBe(2);
      expect(recommendations[0].clicks).toBe(1);
      expect(recommendations[0].clickThroughRate).toBe(0.5);
    });

    it('should track average position', () => {
      trackRecommendationImpression('article-1', 'article', 1);
      trackRecommendationImpression('article-1', 'article', 3);

      const recommendations = loadRecommendations();
      expect(recommendations[0].position).toBe(2);
    });
  });

  describe('Achievement Tracking', () => {
    it('should track achievement unlocks', () => {
      trackAchievementUnlock('user-123', 'first-article', 'First Steps');

      const events = loadEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('achievement_unlock');
      expect(events[0].properties?.achievementId).toBe('first-article');
      expect(events[0].properties?.achievementTitle).toBe('First Steps');
    });
  });

  describe('Session Tracking', () => {
    it('should track session start', () => {
      trackSessionStart('user-123');

      const events = loadEvents();
      const sessions = loadSessions();

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('session_start');

      expect(sessions).toHaveLength(1);
      expect(sessions[0].userId).toBe('user-123');
      expect(sessions[0].pageViews).toBe(1);
      expect(sessions[0].startTime).toBeInstanceOf(Date);
    });

    it('should track session end and calculate duration', async () => {
      trackSessionStart('user-123');

      // Wait a bit to ensure duration is calculated
      await new Promise((resolve) => setTimeout(resolve, 50));

      trackSessionEnd('user-123');

      const sessions = loadSessions();
      expect(sessions[0].endTime).toBeInstanceOf(Date);
      expect(sessions[0].duration).toBeGreaterThanOrEqual(0); // Allow 0 for very short sessions
    });

    it('should clear session ID on session end', () => {
      trackSessionStart('user-123');
      expect(getCurrentSessionId()).toBeTruthy();

      trackSessionEnd('user-123');
      expect(sessionStorage.getItem('vibe-wiki-session-id')).toBeNull();
    });
  });

  describe('User Engagement Metrics', () => {
    it('should calculate user engagement metrics', () => {
      const progress: UserProgress = {
        userId: 'user-123',
        completedArticles: [],
        completedTutorials: [],
        completedPaths: [],
        currentPathProgress: {},
        currentTutorialProgress: {},
        achievements: [],
        totalPoints: 100,
        streakDays: 5,
        lastActivity: new Date(),
        createdAt: new Date(),
      };

      trackSessionStart('user-123');
      trackPageView('user-123', 'article', 'test-1');
      trackPageView('user-123', 'article', 'test-2');

      const metrics = calculateUserEngagementMetrics('user-123', progress);

      expect(metrics.userId).toBe('user-123');
      expect(metrics.totalSessions).toBe(1);
      expect(metrics.totalPageViews).toBe(2); // 2 from page_view events
      expect(metrics.currentStreak).toBe(5);
      expect(metrics.totalPoints).toBe(100);
    });

    it('should handle user with no sessions', () => {
      const progress: UserProgress = {
        userId: 'user-456',
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

      const metrics = calculateUserEngagementMetrics('user-456', progress);

      expect(metrics.totalSessions).toBe(0);
      expect(metrics.totalSessionTime).toBe(0);
      expect(metrics.averageSessionDuration).toBe(0);
    });
  });

  describe('Platform Metrics', () => {
    it('should calculate daily platform metrics', () => {
      trackSessionStart('user-123');
      trackSessionStart('user-456');
      trackPageView('user-123', 'article');
      trackSearch('user-123', 'test', 5);

      const metrics = calculatePlatformMetrics('daily');

      expect(metrics.period).toBe('daily');
      expect(metrics.totalUsers).toBe(2);
      expect(metrics.activeUsers).toBe(2);
      expect(metrics.totalSessions).toBe(2);
      expect(metrics.totalPageViews).toBeGreaterThan(0);
    });

    it('should calculate weekly platform metrics', () => {
      trackSessionStart('user-123');

      const metrics = calculatePlatformMetrics('weekly');

      expect(metrics.period).toBe('weekly');
      expect(metrics.totalUsers).toBe(1);
    });

    it('should calculate monthly platform metrics', () => {
      trackSessionStart('user-123');

      const metrics = calculatePlatformMetrics('monthly');

      expect(metrics.period).toBe('monthly');
    });

    it('should include top content in platform metrics', () => {
      trackArticleView('user-123', 'article-1', 'Article 1');
      trackArticleView('user-123', 'article-2', 'Article 2');
      trackArticleView('user-456', 'article-1', 'Article 1');

      const metrics = calculatePlatformMetrics('daily');

      expect(metrics.topContent.length).toBeGreaterThan(0);
      expect(metrics.topContent[0].contentId).toBe('article-1');
    });

    it('should include top searches in platform metrics', () => {
      trackSearch('user-123', 'react', 10);
      trackSearch('user-123', 'react', 10);
      trackSearch('user-123', 'vue', 5);

      const metrics = calculatePlatformMetrics('daily');

      expect(metrics.topSearches.length).toBeGreaterThan(0);
      expect(metrics.topSearches[0].query).toBe('react');
      expect(metrics.topSearches[0].count).toBe(2);
    });

    it('should calculate bounce rate', () => {
      trackSessionStart('user-123');
      trackSessionStart('user-456');
      trackPageView('user-456', 'article');
      trackPageView('user-456', 'tutorial');

      const metrics = calculatePlatformMetrics('daily');

      expect(metrics.bounceRate).toBeGreaterThan(0);
    });
  });

  describe('Content Performance', () => {
    it('should get content performance for specific content', () => {
      trackArticleView('user-123', 'article-1', 'Article 1');
      trackArticleComplete('user-123', 'article-1', 'Article 1');

      const performance = getContentPerformance('article-1', 'article');

      expect(performance).toBeDefined();
      expect(performance?.contentId).toBe('article-1');
      expect(performance?.contentType).toBe('article');
      expect(performance?.views).toBe(1);
      expect(performance?.completions).toBe(1);
    });

    it('should return undefined for non-existent content', () => {
      const performance = getContentPerformance('article-999', 'article');
      expect(performance).toBeUndefined();
    });

    it('should get top content by views', () => {
      trackArticleView('user-123', 'article-1', 'Article 1');
      trackArticleView('user-123', 'article-2', 'Article 2');
      trackArticleView('user-123', 'article-2', 'Article 2');

      const topContent = getTopContent(2, 'views');

      expect(topContent).toHaveLength(2);
      expect(topContent[0].contentId).toBe('article-2');
      expect(topContent[0].views).toBe(2);
    });

    it('should get top content by completions', () => {
      trackArticleComplete('user-123', 'article-1', 'Article 1');
      trackArticleComplete('user-123', 'article-2', 'Article 2');
      trackArticleComplete('user-456', 'article-2', 'Article 2');

      const topContent = getTopContent(2, 'completions');

      expect(topContent).toHaveLength(2);
      expect(topContent[0].contentId).toBe('article-2');
      expect(topContent[0].completions).toBe(2);
    });

    it('should get top content by completion rate', () => {
      trackArticleView('user-123', 'article-1', 'Article 1');
      trackArticleView('user-123', 'article-1', 'Article 1');
      trackArticleComplete('user-123', 'article-1', 'Article 1');
      trackArticleView('user-123', 'article-2', 'Article 2');

      const topContent = getTopContent(2, 'completionRate');

      expect(topContent[0].contentId).toBe('article-1');
      expect(topContent[0].completionRate).toBe(0.5);
    });

    it('should limit top content results', () => {
      for (let i = 0; i < 15; i++) {
        trackArticleView(`user-${i}`, `article-${i}`, `Article ${i}`);
      }

      const topContent = getTopContent(10, 'views');
      expect(topContent.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Conversion Funnels', () => {
    it('should calculate conversion funnel', () => {
      trackEvent('page_view', 'user-1');
      trackEvent('page_view', 'user-2');
      trackEvent('page_view', 'user-3');
      trackEvent('article_view', 'user-1');
      trackEvent('article_view', 'user-2');
      trackEvent('article_complete', 'user-1');

      const startDate = new Date();
      startDate.setSeconds(startDate.getSeconds() - 10);
      const endDate = new Date();
      endDate.setSeconds(endDate.getSeconds() + 10);

      const steps = [
        { stepName: 'Page View', eventType: 'page_view' as const },
        { stepName: 'Article View', eventType: 'article_view' as const },
        { stepName: 'Article Complete', eventType: 'article_complete' as const },
      ];

      const funnel = calculateConversionFunnel('User Journey', startDate, endDate, steps);

      expect(funnel.name).toBe('User Journey');
      expect(funnel.steps).toHaveLength(3);
      expect(funnel.steps[0].count).toBe(3);
      expect(funnel.steps[1].count).toBe(2);
      expect(funnel.steps[2].count).toBe(1);
      expect(funnel.overallConversion).toBeCloseTo(0.333, 2);
    });

    it('should calculate drop-off between funnel steps', () => {
      trackEvent('page_view', 'user-1');
      trackEvent('page_view', 'user-2');
      trackEvent('article_view', 'user-1');

      const startDate = new Date();
      startDate.setSeconds(startDate.getSeconds() - 10);
      const endDate = new Date();
      endDate.setSeconds(endDate.getSeconds() + 10);

      const steps = [
        { stepName: 'Page View', eventType: 'page_view' as const },
        { stepName: 'Article View', eventType: 'article_view' as const },
      ];

      const funnel = calculateConversionFunnel('Drop-off Test', startDate, endDate, steps);

      expect(funnel.steps[1].dropOff).toBe(1);
      expect(funnel.steps[1].conversionRate).toBe(0.5);
    });
  });

  describe('Analytics Report', () => {
    it('should generate comprehensive analytics report', () => {
      const progress: UserProgress = {
        userId: 'user-123',
        completedArticles: [],
        completedTutorials: [],
        completedPaths: [],
        currentPathProgress: {},
        currentTutorialProgress: {},
        achievements: [],
        totalPoints: 50,
        streakDays: 3,
        lastActivity: new Date(),
        createdAt: new Date(),
      };

      trackSessionStart('user-123');
      trackArticleView('user-123', 'article-1', 'Article 1');
      trackSearch('user-123', 'test', 5);

      const report = generateAnalyticsReport('daily', 'user-123', progress);

      expect(report.generatedAt).toBeInstanceOf(Date);
      expect(report.userEngagement.userId).toBe('user-123');
      expect(report.platformMetrics.period).toBe('daily');
      expect(report.contentMetrics).toBeDefined();
      expect(report.topContent).toBeDefined();
      expect(report.searchQueries).toBeDefined();
      expect(report.recommendationMetrics).toBeDefined();
    });
  });

  describe('Data Management', () => {
    it('should clear all analytics data', () => {
      trackEvent('page_view', 'user-123');
      trackSessionStart('user-123');
      trackArticleView('user-123', 'article-1', 'Article 1');
      trackSearch('user-123', 'test', 5);
      trackRecommendationImpression('article-1', 'article', 1);

      expect(loadEvents().length).toBeGreaterThan(0);
      expect(loadSessions().length).toBeGreaterThan(0);
      expect(loadContentMetrics().length).toBeGreaterThan(0);
      expect(loadSearches().length).toBeGreaterThan(0);
      expect(loadRecommendations().length).toBeGreaterThan(0);

      clearAnalytics();

      expect(loadEvents().length).toBe(0);
      expect(loadSessions().length).toBe(0);
      expect(loadContentMetrics().length).toBe(0);
      expect(loadSearches().length).toBe(0);
      expect(loadRecommendations().length).toBe(0);
    });

    it('should export analytics data as JSON', () => {
      trackEvent('page_view', 'user-123');
      trackSessionStart('user-123');

      const exported = exportAnalytics();
      const data = JSON.parse(exported);

      expect(data.events).toBeDefined();
      expect(data.sessions).toBeDefined();
      expect(data.contentMetrics).toBeDefined();
      expect(data.searches).toBeDefined();
      expect(data.recommendations).toBeDefined();
      expect(data.exportedAt).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty localStorage gracefully', () => {
      expect(loadEvents()).toEqual([]);
      expect(loadSessions()).toEqual([]);
      expect(loadContentMetrics()).toEqual([]);
      expect(loadSearches()).toEqual([]);
      expect(loadRecommendations()).toEqual([]);
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('vibe-wiki-analytics-events', 'invalid json');

      expect(loadEvents()).toEqual([]);
    });

    it('should handle tracking with missing metadata', () => {
      trackEvent('page_view', 'user-123', undefined, undefined);

      const events = loadEvents();
      expect(events).toHaveLength(1);
      expect(events[0].metadata?.userAgent).toBe('Mozilla/5.0 (test)');
      expect(events[0].metadata?.url).toBe('https://example.com/test');
    });

    it('should handle session end for non-existent session', () => {
      trackSessionEnd('user-999');

      const events = loadEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('session_end');
    });

    it('should handle content metrics with no views', () => {
      trackArticleComplete('user-123', 'article-1', 'Article 1');

      const metrics = loadContentMetrics();
      expect(metrics[0].views).toBe(0);
      expect(metrics[0].completions).toBe(1);
      expect(metrics[0].completionRate).toBe(Infinity);
    });

    it('should handle zero division in platform metrics', () => {
      const metrics = calculatePlatformMetrics('daily');

      expect(metrics.totalUsers).toBe(0);
      expect(metrics.totalSessions).toBe(0);
      expect(metrics.averageSessionDuration).toBe(0);
      expect(metrics.bounceRate).toBe(0);
    });
  });
});
