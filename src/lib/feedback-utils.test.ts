/**
 * Feedback Utilities Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  validateFeedbackItem,
  createFeedbackItem,
  updateFeedbackItem,
  analyzeFeedback,
  aggregateFeedbackByTime,
  generateIterationActions,
  filterFeedback,
  searchFeedback,
  exportFeedback,
  importFeedback,
  calculatePriorityScore,
  FEEDBACK_CATEGORIES,
  FEEDBACK_PRIORITIES,
  FEEDBACK_STATUS,
} from '@/lib/feedback-utils';
import type {
  FeedbackItem,
  FeedbackCategory,
  FeedbackPriority,
  FeedbackStatus,
} from '@/types/user-testing';

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

describe('Feedback Utilities', () => {
  const mockFeedback: FeedbackItem[] = [
    {
      id: 'fb-1',
      category: 'bug',
      priority: 'critical',
      status: 'pending',
      title: 'Login not working',
      description: 'Users cannot login with Google OAuth',
      userId: 'user-1',
      sessionId: 'session-1',
      rating: 1,
      affectedArea: 'Authentication',
      reproductionSteps: ['Click login', 'Select Google', 'Error occurs'],
      expectedBehavior: 'Should redirect to Google OAuth',
      actualBehavior: 'Shows error page',
      screenshots: [],
      tags: ['auth', 'oauth', 'critical'],
      upvotes: 5,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      reviewedAt: null,
      reviewedBy: null,
      resolution: null,
      resolvedAt: null,
    },
    {
      id: 'fb-2',
      category: 'feature',
      priority: 'high',
      status: 'in_progress',
      title: 'Add dark mode',
      description: 'Users want a dark mode option',
      userId: 'user-2',
      sessionId: 'session-2',
      rating: 4,
      affectedArea: 'UI',
      reproductionSteps: null,
      expectedBehavior: null,
      actualBehavior: null,
      screenshots: [],
      tags: ['ui', 'feature-request'],
      upvotes: 15,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-05'),
      reviewedAt: new Date('2024-01-03'),
      reviewedBy: 'admin-1',
      resolution: null,
      resolvedAt: null,
    },
    {
      id: 'fb-3',
      category: 'usability',
      priority: 'medium',
      status: 'completed',
      title: 'Navigation is confusing',
      description: 'Hard to find learning paths',
      userId: 'user-3',
      sessionId: null,
      rating: 3,
      affectedArea: 'Navigation',
      reproductionSteps: null,
      expectedBehavior: null,
      actualBehavior: null,
      screenshots: [],
      tags: ['ux', 'navigation'],
      upvotes: 3,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-06'),
      reviewedAt: new Date('2024-01-04'),
      reviewedBy: 'admin-1',
      resolution: 'Added breadcrumbs and better labeling',
      resolvedAt: new Date('2024-01-06'),
    },
  ];

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('Constants', () => {
    it('should have all feedback categories', () => {
      expect(FEEDBACK_CATEGORIES).toHaveProperty('usability');
      expect(FEEDBACK_CATEGORIES).toHaveProperty('content');
      expect(FEEDBACK_CATEGORIES).toHaveProperty('performance');
      expect(FEEDBACK_CATEGORIES).toHaveProperty('accessibility');
      expect(FEEDBACK_CATEGORIES).toHaveProperty('feature');
      expect(FEEDBACK_CATEGORIES).toHaveProperty('bug');
      expect(FEEDBACK_CATEGORIES).toHaveProperty('translation');
      expect(FEEDBACK_CATEGORIES).toHaveProperty('other');
    });

    it('should have all feedback priorities', () => {
      expect(FEEDBACK_PRIORITIES).toHaveProperty('critical');
      expect(FEEDBACK_PRIORITIES).toHaveProperty('high');
      expect(FEEDBACK_PRIORITIES).toHaveProperty('medium');
      expect(FEEDBACK_PRIORITIES).toHaveProperty('low');
      expect(FEEDBACK_PRIORITIES).toHaveProperty('trivial');
    });

    it('should have all feedback statuses', () => {
      expect(FEEDBACK_STATUS).toHaveProperty('pending');
      expect(FEEDBACK_STATUS).toHaveProperty('reviewing');
      expect(FEEDBACK_STATUS).toHaveProperty('accepted');
      expect(FEEDBACK_STATUS).toHaveProperty('rejected');
      expect(FEEDBACK_STATUS).toHaveProperty('in_progress');
      expect(FEEDBACK_STATUS).toHaveProperty('completed');
    });
  });

  describe('validateFeedbackItem', () => {
    it('should validate a complete feedback item', () => {
      const result = validateFeedbackItem(mockFeedback[0]);
      expect(result).toBe(true);
    });

    it('should reject feedback without required fields', () => {
      const invalid = { ...mockFeedback[0], title: '' };
      const result = validateFeedbackItem(invalid);
      expect(result).toBe(false);
    });

    it('should reject feedback with invalid category', () => {
      const invalid = { ...mockFeedback[0], category: 'invalid' as FeedbackCategory };
      const result = validateFeedbackItem(invalid);
      expect(result).toBe(false);
    });

    it('should reject feedback with invalid priority', () => {
      const invalid = { ...mockFeedback[0], priority: 'invalid' as FeedbackPriority };
      const result = validateFeedbackItem(invalid);
      expect(result).toBe(false);
    });

    it('should reject feedback with invalid status', () => {
      const invalid = { ...mockFeedback[0], status: 'invalid' as FeedbackStatus };
      const result = validateFeedbackItem(invalid);
      expect(result).toBe(false);
    });

    it('should reject feedback with invalid rating', () => {
      const invalid = { ...mockFeedback[0], rating: 6 as 1 | 2 | 3 | 4 | 5 };
      const result = validateFeedbackItem(invalid);
      expect(result).toBe(false);
    });

    it('should accept feedback with null optional fields', () => {
      const valid = {
        id: 'fb-test',
        category: 'other' as FeedbackCategory,
        priority: 'low' as FeedbackPriority,
        status: 'pending' as FeedbackStatus,
        title: 'Test',
        description: 'Test description',
        userId: 'user-1',
        sessionId: null,
        rating: null,
        affectedArea: null,
        reproductionSteps: null,
        expectedBehavior: null,
        actualBehavior: null,
        screenshots: [],
        tags: [],
        upvotes: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        reviewedAt: null,
        reviewedBy: null,
        resolution: null,
        resolvedAt: null,
      };
      const result = validateFeedbackItem(valid);
      expect(result).toBe(true);
    });
  });

  describe('createFeedbackItem', () => {
    it('should create a feedback item with all required fields', () => {
      const feedback = createFeedbackItem({
        category: 'bug',
        priority: 'high',
        title: 'New bug',
        description: 'Bug description',
        userId: 'user-1',
      });

      expect(feedback.id).toBeDefined();
      expect(feedback.category).toBe('bug');
      expect(feedback.priority).toBe('high');
      expect(feedback.title).toBe('New bug');
      expect(feedback.description).toBe('Bug description');
      expect(feedback.userId).toBe('user-1');
      expect(feedback.status).toBe('pending');
      expect(feedback.upvotes).toBe(0);
      expect(feedback.screenshots).toEqual([]);
      expect(feedback.tags).toEqual([]);
      expect(feedback.createdAt).toBeInstanceOf(Date);
      expect(feedback.updatedAt).toBeInstanceOf(Date);
    });

    it('should create feedback with optional fields', () => {
      const feedback = createFeedbackItem({
        category: 'feature',
        priority: 'medium',
        title: 'New feature',
        description: 'Feature description',
        userId: 'user-2',
        sessionId: 'session-1',
        rating: 5,
        affectedArea: 'Dashboard',
        tags: ['enhancement', 'ui'],
      });

      expect(feedback.sessionId).toBe('session-1');
      expect(feedback.rating).toBe(5);
      expect(feedback.affectedArea).toBe('Dashboard');
      expect(feedback.tags).toEqual(['enhancement', 'ui']);
    });

    it('should generate unique IDs', () => {
      const fb1 = createFeedbackItem({
        category: 'bug',
        title: 'Bug 1',
        description: 'Description',
        userId: 'user-1',
        priority: 'high',
      });
      const fb2 = createFeedbackItem({
        category: 'bug',
        title: 'Bug 2',
        description: 'Description',
        userId: 'user-1',
        priority: 'high',
      });

      expect(fb1.id).not.toBe(fb2.id);
    });
  });

  describe('updateFeedbackItem', () => {
    it('should update feedback fields', () => {
      const updated = updateFeedbackItem(mockFeedback[0], {
        status: 'in_progress',
        priority: 'high',
        title: 'Updated title',
      });

      expect(updated.status).toBe('in_progress');
      expect(updated.priority).toBe('high');
      expect(updated.title).toBe('Updated title');
      expect(updated.id).toBe(mockFeedback[0].id);
      expect(updated.createdAt).toEqual(mockFeedback[0].createdAt);
      expect(updated.updatedAt).toBeInstanceOf(Date);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(mockFeedback[0].updatedAt.getTime());
    });

    it('should not update immutable fields', () => {
      const originalId = mockFeedback[0].id;
      const originalCreatedAt = mockFeedback[0].createdAt;
      const originalUserId = mockFeedback[0].userId;

      const updated = updateFeedbackItem(mockFeedback[0], {
        id: 'new-id' as never, // This should be ignored
        createdAt: new Date() as never, // This should be ignored
        userId: 'new-user' as never, // This should be ignored
        title: 'Updated title',
      });

      expect(updated.id).toBe(originalId);
      expect(updated.createdAt).toEqual(originalCreatedAt);
      expect(updated.userId).toBe(originalUserId);
      expect(updated.title).toBe('Updated title');
    });

    it('should handle resolution updates', () => {
      const updated = updateFeedbackItem(mockFeedback[0], {
        status: 'completed',
        resolution: 'Fixed the OAuth callback URL',
        reviewedBy: 'admin-1',
      });

      expect(updated.status).toBe('completed');
      expect(updated.resolution).toBe('Fixed the OAuth callback URL');
      expect(updated.reviewedBy).toBe('admin-1');
      expect(updated.resolvedAt).toBeInstanceOf(Date);
    });
  });

  describe('analyzeFeedback', () => {
    it('should analyze feedback collection', () => {
      const analysis = analyzeFeedback(mockFeedback);

      expect(analysis.total).toBe(3);
      expect(analysis.byStatus.pending).toBe(1);
      expect(analysis.byStatus.in_progress).toBe(1);
      expect(analysis.byStatus.completed).toBe(1);
      expect(analysis.byCategory.bug).toBe(1);
      expect(analysis.byCategory.feature).toBe(1);
      expect(analysis.byCategory.usability).toBe(1);
      expect(analysis.byPriority.critical).toBe(1);
      expect(analysis.byPriority.high).toBe(1);
      expect(analysis.byPriority.medium).toBe(1);
    });

    it('should calculate average rating', () => {
      const analysis = analyzeFeedback(mockFeedback);
      expect(analysis.averageRating).toBeCloseTo(2.67, 1);
    });

    it('should return null average rating when no ratings', () => {
      const noRatings = mockFeedback.map(fb => ({ ...fb, rating: null }));
      const analysis = analyzeFeedback(noRatings);
      expect(analysis.averageRating).toBeNull();
    });

    it('should identify top issues', () => {
      const analysis = analyzeFeedback(mockFeedback);

      expect(analysis.topIssues).toHaveLength(3);
      expect(analysis.topIssues[0].id).toBe('fb-2'); // High priority + most upvotes
      expect(analysis.topIssues[0].score).toBeGreaterThan(analysis.topIssues[1].score);
    });

    it('should calculate recent trends', () => {
      const analysis = analyzeFeedback(mockFeedback);

      expect(analysis.recentTrends).toBeDefined();
      expect(analysis.recentTrends.length).toBeGreaterThan(0);
    });

    it('should generate recommendations', () => {
      const analysis = analyzeFeedback(mockFeedback);

      expect(analysis.recommendations).toBeDefined();
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle empty feedback array', () => {
      const analysis = analyzeFeedback([]);

      expect(analysis.total).toBe(0);
      expect(analysis.averageRating).toBeNull();
      expect(analysis.topIssues).toEqual([]);
      expect(analysis.recentTrends).toEqual([]);
      expect(analysis.recommendations).toEqual([]);
    });
  });

  describe('aggregateFeedbackByTime', () => {
    it('should aggregate feedback by day', () => {
      const aggregated = aggregateFeedbackByTime(mockFeedback, 'day');

      expect(aggregated.length).toBeGreaterThan(0);
      expect(aggregated[0]).toHaveProperty('period');
      expect(aggregated[0]).toHaveProperty('total');
      expect(aggregated[0]).toHaveProperty('byCategory');
      expect(aggregated[0]).toHaveProperty('byPriority');
      expect(aggregated[0]).toHaveProperty('byStatus');
    });

    it('should aggregate feedback by week', () => {
      const aggregated = aggregateFeedbackByTime(mockFeedback, 'week');

      expect(aggregated.length).toBeGreaterThan(0);
      expect(aggregated[0].total).toBeGreaterThanOrEqual(1);
    });

    it('should aggregate feedback by month', () => {
      const aggregated = aggregateFeedbackByTime(mockFeedback, 'month');

      expect(aggregated.length).toBeGreaterThan(0);
      expect(aggregated[0].total).toBeGreaterThanOrEqual(1);
    });

    it('should calculate average rating per period', () => {
      const aggregated = aggregateFeedbackByTime(mockFeedback, 'day');

      aggregated.forEach(period => {
        if (period.total > 0) {
          expect(period.averageRating).toBeDefined();
        }
      });
    });

    it('should handle empty feedback array', () => {
      const aggregated = aggregateFeedbackByTime([], 'day');
      expect(aggregated).toEqual([]);
    });
  });

  describe('generateIterationActions', () => {
    it('should generate actions from feedback', () => {
      const actions = generateIterationActions(mockFeedback);

      expect(actions).toBeDefined();
      expect(actions.length).toBeGreaterThan(0);
    });

    it('should prioritize critical issues as immediate actions', () => {
      const actions = generateIterationActions(mockFeedback);

      const immediateActions = actions.filter(a => a.type === 'immediate');
      expect(immediateActions.length).toBeGreaterThan(0);

      immediateActions.forEach(action => {
        expect(action.priority).toBe('critical');
      });
    });

    it('should include feedback IDs in actions', () => {
      const actions = generateIterationActions(mockFeedback);

      actions.forEach(action => {
        expect(action.feedbackIds).toBeDefined();
        expect(action.feedbackIds.length).toBeGreaterThan(0);
        expect(action).toHaveProperty('id');
        expect(action).toHaveProperty('title');
        expect(action).toHaveProperty('description');
        expect(action).toHaveProperty('estimatedEffort');
        expect(action).toHaveProperty('status');
      });
    });

    it('should set initial status to pending', () => {
      const actions = generateIterationActions(mockFeedback);

      actions.forEach(action => {
        expect(action.status).toBe('pending');
      });
    });
  });

  describe('filterFeedback', () => {
    it('should filter by category', () => {
      const filtered = filterFeedback(mockFeedback, { category: 'bug' });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe('bug');
    });

    it('should filter by status', () => {
      const filtered = filterFeedback(mockFeedback, { status: 'pending' });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe('pending');
    });

    it('should filter by priority', () => {
      const filtered = filterFeedback(mockFeedback, { priority: 'critical' });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].priority).toBe('critical');
    });

    it('should filter by user ID', () => {
      const filtered = filterFeedback(mockFeedback, { userId: 'user-1' });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].userId).toBe('user-1');
    });

    it('should filter by session ID', () => {
      const filtered = filterFeedback(mockFeedback, { sessionId: 'session-1' });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].sessionId).toBe('session-1');
    });

    it('should filter by date range', () => {
      const filtered = filterFeedback(mockFeedback, {
        startDate: new Date('2024-01-02'),
        endDate: new Date('2024-01-03'),
      });

      expect(filtered.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter by min rating', () => {
      const filtered = filterFeedback(mockFeedback, { minRating: 3 });

      expect(filtered.length).toBe(2);
      filtered.forEach(fb => {
        if (fb.rating) {
          expect(fb.rating).toBeGreaterThanOrEqual(3);
        }
      });
    });

    it('should filter by tags', () => {
      const filtered = filterFeedback(mockFeedback, { tags: ['auth'] });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].tags).toContain('auth');
    });

    it('should apply multiple filters', () => {
      const filtered = filterFeedback(mockFeedback, {
        category: 'bug',
        priority: 'critical',
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe('bug');
      expect(filtered[0].priority).toBe('critical');
    });

    it('should return all feedback when no filters provided', () => {
      const filtered = filterFeedback(mockFeedback, {});

      expect(filtered).toHaveLength(3);
    });
  });

  describe('searchFeedback', () => {
    it('should search by title', () => {
      const results = searchFeedback(mockFeedback, 'login');

      expect(results).toHaveLength(1);
      expect(results[0].title.toLowerCase()).toContain('login');
    });

    it('should search by description', () => {
      const results = searchFeedback(mockFeedback, 'oauth');

      expect(results).toHaveLength(1);
      expect(results[0].description.toLowerCase()).toContain('oauth');
    });

    it('should search by tags', () => {
      const results = searchFeedback(mockFeedback, 'navigation');

      expect(results).toHaveLength(1);
    });

    it('should be case insensitive', () => {
      const results1 = searchFeedback(mockFeedback, 'LOGIN');
      const results2 = searchFeedback(mockFeedback, 'login');

      expect(results1).toEqual(results2);
    });

    it('should return empty array for no matches', () => {
      const results = searchFeedback(mockFeedback, 'nonexistent');

      expect(results).toEqual([]);
    });

    it('should return all feedback for empty query', () => {
      const results = searchFeedback(mockFeedback, '');

      expect(results).toHaveLength(3);
    });
  });

  describe('calculatePriorityScore', () => {
    it('should calculate score based on priority and upvotes', () => {
      const score1 = calculatePriorityScore(mockFeedback[0]); // critical, 5 upvotes
      const score2 = calculatePriorityScore(mockFeedback[2]); // medium, 3 upvotes

      expect(score1).toBeGreaterThan(score2);
    });

    it('should give higher weight to critical priority', () => {
      const critical = calculatePriorityScore(mockFeedback[0]); // critical, 5 upvotes
      const high = calculatePriorityScore(mockFeedback[1]); // high, 15 upvotes

      // Critical with 5 upvotes should score higher than high with 15 upvotes
      expect(critical).toBeGreaterThan(high);
    });
  });

  describe('exportFeedback and importFeedback', () => {
    it('should export feedback to JSON', () => {
      const exported = exportFeedback(mockFeedback);

      expect(typeof exported).toBe('string');
      expect(() => JSON.parse(exported)).not.toThrow();
    });

    it('should import feedback from JSON', () => {
      const exported = exportFeedback(mockFeedback);
      const imported = importFeedback(exported);

      expect(imported).toHaveLength(3);
      expect(imported[0].id).toBe(mockFeedback[0].id);
    });

    it('should preserve all fields during export/import', () => {
      const exported = exportFeedback(mockFeedback);
      const imported = importFeedback(exported);

      imported.forEach((fb, index) => {
        expect(fb.id).toBe(mockFeedback[index].id);
        expect(fb.category).toBe(mockFeedback[index].category);
        expect(fb.title).toBe(mockFeedback[index].title);
        expect(fb.description).toBe(mockFeedback[index].description);
      });
    });

    it('should throw error for invalid JSON', () => {
      expect(() => importFeedback('invalid json')).toThrow();
    });

    it('should throw error for invalid feedback structure', () => {
      const invalidJson = JSON.stringify([
        { id: 'test', category: 'invalid', title: 'Test' },
      ]);

      expect(() => importFeedback(invalidJson)).toThrow();
    });
  });
});
