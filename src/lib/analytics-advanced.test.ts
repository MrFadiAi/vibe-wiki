/**
 * Analytics Utilities Tests
 * Comprehensive test suite for analytics tracking and metrics
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getCurrentSession,
  createSession,
  endSession,
  loadSessions,
  trackEvent,
  trackPageView,
  trackArticleView,
  trackArticleComplete,
  trackTutorialStart,
  trackTutorialStepComplete,
  trackTutorialComplete,
  trackPathStart,
  trackPathComplete,
  trackSearch,
  trackSearchResultClick,
  trackCodeExecute,
  trackExerciseAttempt,
  trackAchievementUnlock,
  trackError,
  calculateUserBehaviorMetrics,
  calculateContentPerformance,
  getPlatformAnalytics,
  getRealTimeAnalytics,
  generateAnalyticsReport,
  generateTimeSeriesData,
  hasConsent,
  setConsent,
  clearAnalyticsData,
  loadEvents,
} from '@/lib/analytics';
import type { WikiArticle, Tutorial, LearningPath } from '@/types';
import type { AggregationPeriod } from '@/types/analytics';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Test Browser)',
    platform: 'TestPlatform',
    maxTouchPoints: 0,
  },
});

// Mock location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/test',
  },
  writable: true,
});

// Mock screen
Object.defineProperty(window, 'screen', {
  value: {
    width: 1920,
    height: 1080,
  },
});

describe('Analytics - Session Management', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('vibe-wiki-user-id', 'test-user-id');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('createSession', () => {
    it('should create a new session with required fields', () => {
      const session = createSession();

      expect(session.sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
      expect(session.userId).toBe('test-user-id');
      expect(session.startTime).toBeInstanceOf(Date);
      expect(session.pageViews).toBe(0);
      expect(session.events).toEqual([]);
      expect(session.deviceInfo).toBeDefined();
      expect(session.deviceInfo.browser).toBeDefined();
      expect(session.deviceInfo.deviceType).toBeDefined();
    });

    it('should save session to localStorage', () => {
      createSession();
      const stored = localStorage.getItem('vibe-wiki-analytics-current-session');
      expect(stored).toBeTruthy();

      const session = JSON.parse(stored!);
      expect(session.sessionId).toBeTruthy();
    });

    it('should detect device type correctly', () => {
      const session = createSession();
      expect(['desktop', 'tablet', 'mobile']).toContain(session.deviceInfo.deviceType);
      expect(session.deviceInfo.screenResolution).toBe('1920x1080');
      expect(session.deviceInfo.isTouchDevice).toBe(false);
    });
  });

  describe('getCurrentSession', () => {
    it('should return existing session if valid', () => {
      const newSession = createSession();
      const currentSession = getCurrentSession();

      expect(currentSession.sessionId).toBe(newSession.sessionId);
      expect(currentSession.userId).toBe(newSession.userId);
    });

    it('should create new session if none exists', () => {
      const session = getCurrentSession();
      expect(session.sessionId).toBeTruthy();
      expect(session.events).toEqual([]);
    });

    it('should create new session if current session is expired', () => {
      const session = createSession();
      // Manually expire the session
      const expiredSession = JSON.parse(localStorage.getItem('vibe-wiki-analytics-current-session')!);
      expiredSession.startTime = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1 hour ago
      localStorage.setItem('vibe-wiki-analytics-current-session', JSON.stringify(expiredSession));

      const newSession = getCurrentSession();
      expect(newSession.sessionId).not.toBe(session.sessionId);
    });
  });

  describe('endSession', () => {
    it('should end current session and save it', () => {
      createSession();
      endSession();

      const current = localStorage.getItem('vibe-wiki-analytics-current-session');
      expect(current).toBeNull();

      const sessions = loadSessions();
      expect(sessions.length).toBe(1);
      expect(sessions[0].endTime).toBeDefined();
      expect(sessions[0].duration).toBeGreaterThanOrEqual(0);
    });

    it('should calculate session duration correctly', async () => {
      createSession();
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));
      endSession();
      const sessions = loadSessions();
      expect(sessions[0].duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('loadSessions', () => {
    it('should return empty array when no sessions exist', () => {
      const sessions = loadSessions();
      expect(sessions).toEqual([]);
    });

    it('should load and parse sessions correctly', () => {
      const session = createSession();
      session.pageViews = 5;
      endSession();

      const sessions = loadSessions();
      expect(sessions.length).toBe(1);
      expect(sessions[0].pageViews).toBe(5);
      expect(sessions[0].startTime).toBeInstanceOf(Date);
    });

    it('should limit sessions to MAX_SESSIONS', () => {
      // Create more sessions than limit
      for (let i = 0; i < 1100; i++) {
        createSession();
        endSession();
      }

      const sessions = loadSessions();
      expect(sessions.length).toBeLessThanOrEqual(1000);
    });
  });
});

describe('Analytics - Event Tracking', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('vibe-wiki-user-id', 'test-user-id');
    setConsent(true);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('trackEvent', () => {
    it('should create event with required fields', () => {
      trackEvent('page_view', {});

      const events = loadEvents();
      expect(events.length).toBe(1);
      expect(events[0].id).toMatch(/^event_\d+_[a-z0-9]+$/);
      expect(events[0].sessionId).toBeTruthy();
      expect(events[0].userId).toBe('test-user-id');
      expect(events[0].type).toBe('page_view');
      expect(events[0].timestamp).toBeInstanceOf(Date);
      expect(events[0].page).toBe('/test');
    });

    it('should not track event when consent is not granted', () => {
      setConsent(false);
      trackEvent('page_view', {});

      const events = loadEvents();
      expect(events.length).toBe(0);
    });

    it('should include metadata in event', () => {
      const metadata = {
        contentType: 'article' as const,
        contentId: 'test-article',
        contentTitle: 'Test Article',
        readingTime: 120,
      };

      trackEvent('article_view', metadata);

      const events = loadEvents();
      expect(events[0].metadata).toMatchObject(metadata);
    });

    it('should add event to current session', () => {
      trackEvent('page_view', {});
      const session = getCurrentSession();

      expect(session.events.length).toBe(1);
      expect(session.events[0].type).toBe('page_view');
    });

    it('should limit events to MAX_EVENTS', () => {
      for (let i = 0; i < 11000; i++) {
        trackEvent('page_view', {});
      }

      const events = loadEvents();
      expect(events.length).toBeLessThanOrEqual(10000);
    });
  });

  describe('trackPageView', () => {
    it('should track page view event', () => {
      trackPageView('/test-page');

      const events = loadEvents();
      expect(events[0].type).toBe('page_view');
      expect(events[0].metadata.customProperties?.page).toBe('/test-page');
    });

    it('should update session page views', () => {
      trackPageView('/page1');
      trackPageView('/page2');

      const session = getCurrentSession();
      expect(session.pageViews).toBe(2);
      expect(session.exitPage).toBe('/page2');
    });
  });

  describe('trackArticleView', () => {
    it('should track article view with article data', () => {
      const article: WikiArticle = {
        slug: 'test-article',
        title: 'Test Article',
        section: 'Testing',
        content: 'Test content',
      };

      trackArticleView(article);

      const events = loadEvents();
      expect(events[0].type).toBe('article_view');
      expect(events[0].metadata.contentType).toBe('article');
      expect(events[0].metadata.contentId).toBe('test-article');
      expect(events[0].metadata.contentTitle).toBe('Test Article');
      expect(events[0].metadata.section).toBe('Testing');
    });

    it('should include custom metadata', () => {
      const article: WikiArticle = {
        slug: 'test-article',
        title: 'Test Article',
        section: 'Testing',
        content: 'Test content',
      };

      trackArticleView(article, { scrollDepth: 50 });

      const events = loadEvents();
      expect(events[0].metadata.scrollDepth).toBe(50);
    });
  });

  describe('trackArticleComplete', () => {
    it('should track article completion with reading time', () => {
      const article: WikiArticle = {
        slug: 'test-article',
        title: 'Test Article',
        section: 'Testing',
        content: 'Test content',
      };

      trackArticleComplete(article, 300); // 5 minutes

      const events = loadEvents();
      expect(events[0].type).toBe('article_complete');
      expect(events[0].metadata.readingTime).toBe(300);
    });
  });

  describe('trackTutorialStart', () => {
    it('should track tutorial start', () => {
      const tutorial: Tutorial = {
        id: 'tutorial-1',
        slug: 'tutorial-1',
        title: 'Test Tutorial',
        description: 'Test description',
        section: 'Testing',
        difficulty: 'intermediate',
        estimatedMinutes: 60,
        learningObjectives: ['Learn testing'],
        steps: [],
      };

      trackTutorialStart(tutorial);

      const events = loadEvents();
      expect(events[0].type).toBe('tutorial_start');
      expect(events[0].metadata.contentType).toBe('tutorial');
      expect(events[0].metadata.difficulty).toBe('intermediate');
      expect(events[0].metadata.totalSteps).toBe(0);
    });
  });

  describe('trackTutorialStepComplete', () => {
    it('should track tutorial step completion', () => {
      const tutorial: Tutorial = {
        id: 'tutorial-1',
        slug: 'tutorial-1',
        title: 'Test Tutorial',
        description: 'Test description',
        section: 'Testing',
        difficulty: 'beginner',
        estimatedMinutes: 30,
        learningObjectives: ['Learn testing'],
        steps: [],
      };

      trackTutorialStepComplete(tutorial, 'step-1', 1);

      const events = loadEvents();
      expect(events[0].type).toBe('tutorial_step_complete');
      expect(events[0].metadata.stepId).toBe('step-1');
      expect(events[0].metadata.stepNumber).toBe(1);
    });
  });

  describe('trackTutorialComplete', () => {
    it('should track tutorial completion', () => {
      const tutorial: Tutorial = {
        id: 'tutorial-1',
        slug: 'tutorial-1',
        title: 'Test Tutorial',
        description: 'Test description',
        section: 'Testing',
        difficulty: 'advanced',
        estimatedMinutes: 120,
        learningObjectives: ['Learn testing'],
        steps: [],
      };

      trackTutorialComplete(tutorial, 3600); // 1 hour

      const events = loadEvents();
      expect(events[0].type).toBe('tutorial_complete');
      expect(events[0].metadata.readingTime).toBe(3600);
    });
  });

  describe('trackPathStart', () => {
    it('should track learning path start', () => {
      const path: LearningPath = {
        id: 'path-1',
        slug: 'path-1',
        title: 'Test Path',
        description: 'Test description',
        difficulty: 'intermediate',
        estimatedMinutes: 300,
        targetAudience: ['Beginners'],
        learningObjectives: ['Learn path'],
        items: [],
      };

      trackPathStart(path);

      const events = loadEvents();
      expect(events[0].type).toBe('path_start');
      expect(events[0].metadata.contentType).toBe('path');
      expect(events[0].metadata.difficulty).toBe('intermediate');
    });
  });

  describe('trackPathComplete', () => {
    it('should track learning path completion', () => {
      const path: LearningPath = {
        id: 'path-1',
        slug: 'path-1',
        title: 'Test Path',
        description: 'Test description',
        difficulty: 'beginner',
        estimatedMinutes: 180,
        targetAudience: ['Beginners'],
        learningObjectives: ['Learn path'],
        items: [],
      };

      trackPathComplete(path, 7200); // 2 hours

      const events = loadEvents();
      expect(events[0].type).toBe('path_complete');
      expect(events[0].metadata.readingTime).toBe(7200);
    });
  });

  describe('trackSearch', () => {
    it('should track search with query and results', () => {
      trackSearch('test query', 25);

      const events = loadEvents();
      expect(events[0].type).toBe('search_perform');
      expect(events[0].metadata.searchQuery).toBe('test query');
      expect(events[0].metadata.resultsCount).toBe(25);
    });
  });

  describe('trackSearchResultClick', () => {
    it('should track search result click', () => {
      trackSearchResultClick('test query', 3, 'article-123');

      const events = loadEvents();
      expect(events[0].type).toBe('search_result_click');
      expect(events[0].metadata.searchQuery).toBe('test query');
      expect(events[0].metadata.resultPosition).toBe(3);
      expect(events[0].metadata.clickedResultId).toBe('article-123');
    });
  });

  describe('trackCodeExecute', () => {
    it('should track successful code execution', () => {
      trackCodeExecute('javascript', true, 150);

      const events = loadEvents();
      expect(events[0].type).toBe('code_execute');
      expect(events[0].metadata.language).toBe('javascript');
      expect(events[0].metadata.executionSuccess).toBe(true);
      expect(events[0].metadata.executionTime).toBe(150);
    });

    it('should track failed code execution with error', () => {
      trackCodeExecute('python', false, undefined, 'SyntaxError');

      const events = loadEvents();
      expect(events[0].metadata.executionSuccess).toBe(false);
      expect(events[0].metadata.errorType).toBe('SyntaxError');
    });
  });

  describe('trackExerciseAttempt', () => {
    it('should track completed exercise', () => {
      trackExerciseAttempt('ex-1', 'Test Exercise', true, 2, 1);

      const events = loadEvents();
      expect(events[0].type).toBe('exercise_attempt');
      expect(events[0].metadata.contentId).toBe('ex-1');
      expect(events[0].metadata.completed).toBe(true);
      expect(events[0].metadata.hintsUsed).toBe(2);
      expect(events[0].metadata.attempts).toBe(1);
    });
  });

  describe('trackAchievementUnlock', () => {
    it('should track achievement unlock', () => {
      trackAchievementUnlock('first-article', 'First Steps', 50);

      const events = loadEvents();
      expect(events[0].type).toBe('achievement_unlock');
      expect(events[0].metadata.achievementId).toBe('first-article');
      expect(events[0].metadata.achievementTitle).toBe('First Steps');
      expect(events[0].metadata.points).toBe(50);
    });
  });

  describe('trackError', () => {
    it('should track error with details', () => {
      trackError('Test error', 'Error stack trace', 'component render');

      const events = loadEvents();
      expect(events[0].type).toBe('error_occurred');
      expect(events[0].metadata.errorMessage).toBe('Test error');
      expect(events[0].metadata.errorStack).toBe('Error stack trace');
      expect(events[0].metadata.errorContext).toBe('component render');
    });
  });
});

describe('Analytics - User Behavior Metrics', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('vibe-wiki-user-id', 'test-user-id');
    setConsent(true);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('calculateUserBehaviorMetrics', () => {
    it('should calculate metrics for new user', () => {
      const metrics = calculateUserBehaviorMetrics('test-user-id');

      expect(metrics.userId).toBe('test-user-id');
      expect(metrics.totalSessions).toBe(0);
      expect(metrics.totalPageViews).toBe(0);
      expect(metrics.totalArticlesRead).toBe(0);
      expect(metrics.averageSessionDuration).toBe(0);
    });

    it('should calculate metrics with activity', () => {
      // Create some activity
      createSession();
      trackPageView('/page1');
      trackPageView('/page2');

      const article: WikiArticle = {
        slug: 'test-article',
        title: 'Test Article',
        section: 'Testing',
        content: 'Test content',
      };
      trackArticleView(article);
      trackArticleComplete(article, 300);
      endSession();

      const metrics = calculateUserBehaviorMetrics('test-user-id');

      expect(metrics.totalSessions).toBe(1);
      expect(metrics.totalPageViews).toBeGreaterThanOrEqual(2);
      expect(metrics.totalArticlesRead).toBe(1);
    });

    it('should calculate bounce rate correctly', () => {
      createSession();
      trackPageView('/single-page');
      endSession();

      const metrics = calculateUserBehaviorMetrics('test-user-id');
      expect(metrics.bounceRate).toBe(100); // 100% bounce with single page view
    });

    it('should calculate most visited sections', () => {
      const article1: WikiArticle = {
        slug: 'article-1',
        title: 'Article 1',
        section: 'JavaScript',
        content: 'Content 1',
      };
      const article2: WikiArticle = {
        slug: 'article-2',
        title: 'Article 2',
        section: 'JavaScript',
        content: 'Content 2',
      };
      const article3: WikiArticle = {
        slug: 'article-3',
        title: 'Article 3',
        section: 'Python',
        content: 'Content 3',
      };

      trackArticleView(article1);
      trackArticleView(article2);
      trackArticleView(article3);

      const metrics = calculateUserBehaviorMetrics('test-user-id');

      expect(metrics.mostVisitedSections.length).toBeGreaterThan(0);
      expect(metrics.mostVisitedSections[0].section).toBe('JavaScript');
      expect(metrics.mostVisitedSections[0].visitCount).toBe(2);
    });

    it('should calculate preferred content types', () => {
      const article: WikiArticle = {
        slug: 'article-1',
        title: 'Article',
        section: 'Test',
        content: 'Content',
      };

      const tutorial: Tutorial = {
        id: 'tutorial-1',
        slug: 'tutorial-1',
        title: 'Tutorial',
        description: 'Description',
        section: 'Test',
        difficulty: 'beginner',
        estimatedMinutes: 30,
        learningObjectives: ['Learn'],
        steps: [],
      };

      trackArticleView(article);
      trackArticleView(article);
      trackTutorialStart(tutorial);

      const metrics = calculateUserBehaviorMetrics('test-user-id');

      expect(metrics.preferredContentTypes.length).toBeGreaterThan(0);
      expect(metrics.preferredContentTypes[0].contentType).toBe('article');
    });

    it('should determine preferred difficulty level', () => {
      const tutorial: Tutorial = {
        id: 'tutorial-1',
        slug: 'tutorial-1',
        title: 'Tutorial',
        description: 'Description',
        section: 'Test',
        difficulty: 'beginner',
        estimatedMinutes: 30,
        learningObjectives: ['Learn'],
        steps: [],
      };

      trackTutorialStart(tutorial);
      trackTutorialStart(tutorial);

      const metrics = calculateUserBehaviorMetrics('test-user-id');
      expect(metrics.preferredDifficultyLevel).toBe('beginner');
    });

    it('should calculate most active time of day', () => {
      const metrics = calculateUserBehaviorMetrics('test-user-id');
      expect(['morning', 'afternoon', 'evening', 'night']).toContain(
        metrics.mostActiveTimeOfDay
      );
    });

    it('should calculate most active day of week', () => {
      const metrics = calculateUserBehaviorMetrics('test-user-id');
      expect([
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ]).toContain(metrics.mostActiveDayOfWeek);
    });
  });
});

describe('Analytics - Content Performance', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('vibe-wiki-user-id', 'test-user-id');
    setConsent(true);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('calculateContentPerformance', () => {
    it('should calculate metrics for unviewed content', () => {
      const performance = calculateContentPerformance(
        'article',
        'test-article',
        'Test Article',
        'Testing',
        ['tag1', 'tag2'],
        'beginner'
      );

      expect(performance.contentType).toBe('article');
      expect(performance.contentId).toBe('test-article');
      expect(performance.totalViews).toBe(0);
      expect(performance.uniqueViews).toBe(0);
      expect(performance.completions).toBe(0);
      expect(performance.completionRate).toBe(0);
    });

    it('should calculate metrics with views', () => {
      const article: WikiArticle = {
        slug: 'test-article',
        title: 'Test Article',
        section: 'Testing',
        content: 'Content',
      };

      trackArticleView(article);
      trackArticleView(article);

      const performance = calculateContentPerformance(
        'article',
        'test-article',
        'Test Article'
      );

      expect(performance.totalViews).toBe(2);
      expect(performance.uniqueViews).toBe(1);
    });

    it('should calculate completion rate', () => {
      const article: WikiArticle = {
        slug: 'test-article',
        title: 'Test Article',
        section: 'Testing',
        content: 'Content',
      };

      trackArticleView(article);
      trackArticleView(article);
      trackArticleView(article);
      trackArticleComplete(article, 300);

      const performance = calculateContentPerformance(
        'article',
        'test-article',
        'Test Article'
      );

      expect(performance.completions).toBe(1);
      expect(performance.completionRate).toBeCloseTo(33.33, 1);
    });

    it('should calculate average time spent', () => {
      const article: WikiArticle = {
        slug: 'test-article',
        title: 'Test Article',
        section: 'Testing',
        content: 'Content',
      };

      trackArticleComplete(article, 120);
      trackArticleComplete(article, 180);

      const performance = calculateContentPerformance(
        'article',
        'test-article',
        'Test Article'
      );

      expect(performance.averageTimeSpent).toBe(150);
    });

    it('should calculate bounce rate', () => {
      const article: WikiArticle = {
        slug: 'test-article',
        title: 'Test Article',
        section: 'Testing',
        content: 'Content',
      };

      createSession();
      trackArticleView(article);
      endSession();

      createSession();
      trackArticleView(article);
      trackArticleView(article);
      endSession();

      const performance = calculateContentPerformance(
        'article',
        'test-article',
        'Test Article'
      );

      // 50% bounce rate (1 of 2 sessions had single view)
      expect(performance.bounceRate).toBe(50);
    });

    it('should count search referrals', () => {
      trackSearch('test article', 5);
      trackSearchResultClick('test article', 1, 'test-article');
      trackSearchResultClick('test article', 2, 'test-article');

      const performance = calculateContentPerformance(
        'article',
        'test-article',
        'Test Article'
      );

      expect(performance.searchReferrals).toBe(2);
    });

    it('should determine trending status', () => {
      const article: WikiArticle = {
        slug: 'test-article',
        title: 'Test Article',
        section: 'Testing',
        content: 'Content',
      };

      // Create 10+ views to make it trending
      for (let i = 0; i < 15; i++) {
        trackArticleView(article);
      }

      const performance = calculateContentPerformance(
        'article',
        'test-article',
        'Test Article'
      );

      expect(performance.trending).toBe(true);
    });

    it('should include tags and difficulty', () => {
      const performance = calculateContentPerformance(
        'tutorial',
        'tutorial-1',
        'Tutorial 1',
        'Testing',
        ['javascript', 'beginner'],
        'intermediate'
      );

      expect(performance.tags).toEqual(['javascript', 'beginner']);
      expect(performance.difficulty).toBe('intermediate');
    });
  });
});

describe('Analytics - Platform Analytics', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('vibe-wiki-user-id', 'test-user-id');
    setConsent(true);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getPlatformAnalytics', () => {
    it('should return analytics for timeframe', () => {
      const analytics = getPlatformAnalytics('today');

      expect(analytics.timeframe).toBe('today');
      expect(analytics.totalUsers).toBeDefined();
      expect(analytics.activeUsers).toBeDefined();
      expect(analytics.totalSessions).toBeDefined();
      expect(analytics.totalPageViews).toBeDefined();
      expect(analytics.bounceRate).toBeDefined();
    });

    it('should calculate active users', () => {
      trackPageView('/page1');

      const analytics = getPlatformAnalytics('today');
      expect(analytics.activeUsers).toBe(1);
    });

    it('should calculate page views', () => {
      trackPageView('/page1');
      trackPageView('/page2');
      trackPageView('/page3');

      const analytics = getPlatformAnalytics('today');
      expect(analytics.totalPageViews).toBe(3);
    });

    it('should calculate average session duration', () => {
      createSession();
      trackPageView('/page1');
      endSession();

      const analytics = getPlatformAnalytics('today');
      expect(analytics.averageSessionDuration).toBeGreaterThanOrEqual(0);
    });

    it('should calculate bounce rate', () => {
      createSession();
      trackPageView('/single');
      endSession();

      const analytics = getPlatformAnalytics('today');
      expect(analytics.bounceRate).toBe(100);
    });

    it('should track top searches', () => {
      trackSearch('react', 10);
      trackSearch('react', 8);
      trackSearch('vue', 5);

      const analytics = getPlatformAnalytics('today');

      expect(analytics.topSearches.length).toBeGreaterThan(0);
      expect(analytics.topSearches[0].query).toBe('react');
      expect(analytics.topSearches[0].searchCount).toBe(2);
    });

    it('should track top errors', () => {
      trackError('Error 1');
      trackError('Error 1');
      trackError('Error 2');

      const analytics = getPlatformAnalytics('today');

      expect(analytics.topErrors.length).toBeGreaterThan(0);
      expect(analytics.topErrors[0].errorMessage).toBe('Error 1');
      expect(analytics.topErrors[0].count).toBe(2);
    });

    it('should calculate content performance by type', () => {
      const article: WikiArticle = {
        slug: 'article-1',
        title: 'Article',
        section: 'Test',
        content: 'Content',
      };

      trackArticleView(article);
      trackArticleComplete(article, 120);

      const analytics = getPlatformAnalytics('today');

      expect(analytics.contentPerformance.articles.totalViews).toBe(1);
      expect(analytics.contentPerformance.articles.completions).toBe(1);
    });
  });

  describe('getPlatformAnalytics with different timeframes', () => {
    it('should handle "today" timeframe', () => {
      const analytics = getPlatformAnalytics('today');
      expect(analytics.timeframe).toBe('today');
    });

    it('should handle "yesterday" timeframe', () => {
      const analytics = getPlatformAnalytics('yesterday');
      expect(analytics.timeframe).toBe('yesterday');
    });

    it('should handle "last_7_days" timeframe', () => {
      const analytics = getPlatformAnalytics('last_7_days');
      expect(analytics.timeframe).toBe('last_7_days');
    });

    it('should handle "last_30_days" timeframe', () => {
      const analytics = getPlatformAnalytics('last_30_days');
      expect(analytics.timeframe).toBe('last_30_days');
    });

    it('should handle "last_90_days" timeframe', () => {
      const analytics = getPlatformAnalytics('last_90_days');
      expect(analytics.timeframe).toBe('last_90_days');
    });

    it('should handle "all_time" timeframe', () => {
      const analytics = getPlatformAnalytics('all_time');
      expect(analytics.timeframe).toBe('all_time');
    });
  });
});

describe('Analytics - Real-Time Analytics', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('vibe-wiki-user-id', 'test-user-id');
    setConsent(true);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getRealTimeAnalytics', () => {
    it('should return real-time analytics', () => {
      const realTime = getRealTimeAnalytics();

      expect(realTime.currentUsers).toBeDefined();
      expect(realTime.activeSessions).toBeDefined();
      expect(realTime.topPages).toBeDefined();
      expect(realTime.recentEvents).toBeDefined();
    });

    it('should count current active sessions', () => {
      createSession();
      trackPageView('/active-page');

      const realTime = getRealTimeAnalytics();
      expect(realTime.currentUsers).toBe(1);
    });

    it('should track top pages', () => {
      trackPageView('/page1');
      trackPageView('/page1');
      trackPageView('/page2');

      const realTime = getRealTimeAnalytics();
      expect(realTime.topPages.length).toBeGreaterThan(0);
    });

    it('should limit active sessions', () => {
      // Create many sessions
      for (let i = 0; i < 150; i++) {
        createSession();
        trackPageView(`/page-${i}`);
        endSession();
      }

      const realTime = getRealTimeAnalytics();
      // Active sessions limited by REAL_TIME_SESSION_LIMIT
      expect(realTime.activeSessions.length).toBeLessThanOrEqual(100);
    });
  });
});

describe('Analytics - Reports', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('vibe-wiki-user-id', 'test-user-id');
    setConsent(true);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('generateAnalyticsReport', () => {
    it('should generate report with default title', () => {
      const report = generateAnalyticsReport('today');

      expect(report.title).toBe('Analytics Report: today');
      expect(report.description).toContain('today');
      expect(report.generatedAt).toBeInstanceOf(Date);
      expect(report.timeframe).toBe('today');
    });

    it('should generate report with custom title', () => {
      const report = generateAnalyticsReport(
        'last_7_days',
        'Weekly Report',
        'Summary of the week'
      );

      expect(report.title).toBe('Weekly Report');
      expect(report.description).toBe('Summary of the week');
    });

    it('should include platform analytics summary', () => {
      const report = generateAnalyticsReport('today');

      expect(report.summary).toBeDefined();
      expect(report.summary.totalUsers).toBeDefined();
      expect(report.summary.totalPageViews).toBeDefined();
    });

    it('should generate insights', () => {
      const report = generateAnalyticsReport('today');

      expect(report.insights).toBeDefined();
      expect(Array.isArray(report.insights)).toBe(true);
    });

    it('should generate recommendations', () => {
      const report = generateAnalyticsReport('today');

      expect(report.recommendations).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    it('should generate insights for high bounce rate', () => {
      // Create high bounce rate scenario
      for (let i = 0; i < 5; i++) {
        createSession();
        trackPageView(`/bounce-${i}`);
        endSession();
      }

      const report = generateAnalyticsReport('today');

      const bounceInsights = report.insights.filter((i) => i.metric === 'bounceRate');
      expect(bounceInsights.length).toBeGreaterThan(0);
      expect(bounceInsights[0].type).toBe('negative');
    });
  });
});

describe('Analytics - Time Series', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('vibe-wiki-user-id', 'test-user-id');
    setConsent(true);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('generateTimeSeriesData', () => {
    it('should generate time series for page views by day', () => {
      trackPageView('/page1');
      trackPageView('/page2');

      const timeSeries = generateTimeSeriesData('page_views', 'day', 'today');

      expect(timeSeries.period).toBe('day');
      expect(timeSeries.data).toBeDefined();
      expect(Array.isArray(timeSeries.data)).toBe(true);
    });

    it('should generate time series for sessions', () => {
      createSession();
      trackPageView('/page1');
      endSession();

      const timeSeries = generateTimeSeriesData('sessions', 'day', 'today');

      expect(timeSeries.period).toBe('day');
      expect(timeSeries.data.length).toBeGreaterThan(0);
    });

    it('should generate time series for users', () => {
      trackPageView('/page1');

      const timeSeries = generateTimeSeriesData('users', 'day', 'today');

      expect(timeSeries.period).toBe('day');
      expect(timeSeries.data.length).toBeGreaterThan(0);
    });

    it('should generate time series for completions', () => {
      const article: WikiArticle = {
        slug: 'article-1',
        title: 'Article',
        section: 'Test',
        content: 'Content',
      };
      trackArticleComplete(article, 120);

      const timeSeries = generateTimeSeriesData('completions', 'day', 'today');

      expect(timeSeries.period).toBe('day');
      expect(timeSeries.data.length).toBeGreaterThan(0);
    });

    it('should format time period labels correctly', () => {
      const timeSeries = generateTimeSeriesData('page_views', 'day', 'today');

      timeSeries.data.forEach((point) => {
        expect(point.label).toBeDefined();
        expect(typeof point.label).toBe('string');
        expect(point.timestamp).toBeInstanceOf(Date);
      });
    });

    it('should handle different aggregation periods', () => {
      const periods: AggregationPeriod[] = ['hour', 'day', 'week', 'month', 'year'];

      periods.forEach((period) => {
        const timeSeries = generateTimeSeriesData('page_views', period, 'today');
        expect(timeSeries.period).toBe(period);
        expect(timeSeries.data).toBeDefined();
      });
    });
  });
});

describe('Analytics - Consent Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('hasConsent', () => {
    it('should return true by default', () => {
      expect(hasConsent()).toBe(true);
    });

    it('should return false after consent is revoked', () => {
      setConsent(false);
      expect(hasConsent()).toBe(false);
    });

    it('should return true after consent is granted', () => {
      setConsent(false);
      setConsent(true);
      expect(hasConsent()).toBe(true);
    });
  });

  describe('setConsent', () => {
    it('should save consent to localStorage', () => {
      setConsent(true);

      const stored = localStorage.getItem('vibe-wiki-analytics-consent');
      expect(stored).toBeTruthy();

      const consent = JSON.parse(stored!);
      expect(consent.granted).toBe(true);
      expect(consent.grantedAt).toBeDefined();
    });

    it('should record consent revocation', () => {
      setConsent(true);
      setConsent(false);

      const stored = localStorage.getItem('vibe-wiki-analytics-consent');
      const consent = JSON.parse(stored!);

      expect(consent.granted).toBe(false);
      expect(consent.revokedAt).toBeDefined();
    });
  });
});

describe('Analytics - Data Management', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('vibe-wiki-user-id', 'test-user-id');
    setConsent(true);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('clearAnalyticsData', () => {
    it('should clear all analytics data', () => {
      createSession();
      trackPageView('/page1');
      endSession();

      clearAnalyticsData();

      expect(loadSessions()).toEqual([]);
      expect(loadEvents()).toEqual([]);
      expect(localStorage.getItem('vibe-wiki-analytics-current-session')).toBeNull();
    });
  });

  describe('loadEvents', () => {
    it('should return empty array when no events exist', () => {
      const events = loadEvents();
      expect(events).toEqual([]);
    });

    it('should load and parse events correctly', () => {
      trackEvent('page_view', {});

      const events = loadEvents();
      expect(events.length).toBe(1);
      expect(events[0].type).toBe('page_view');
      expect(events[0].timestamp).toBeInstanceOf(Date);
    });
  });
});
