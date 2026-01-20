/**
 * Feedback Collection and Analysis Utilities
 *
 * This module provides utilities for collecting, analyzing, and iterating on
 * user feedback from testing sessions and production usage.
 */

import type {
  FeedbackCategory,
  FeedbackPriority,
  FeedbackStatus,
  FeedbackItem,
  FeedbackAnalysis,
  FeedbackTrend,
  FeedbackAggregation,
  IterationAction,
  ImprovementSuggestion,
} from '@/types/user-testing';

/**
 * Default feedback categories with descriptions
 */
export const FEEDBACK_CATEGORIES = {
  usability: {
    label: 'Usability',
    description: 'Issues with ease of use, navigation, or user experience',
    color: '#3b82f6', // blue
  },
  content: {
    label: 'Content Quality',
    description: 'Issues with content accuracy, clarity, or completeness',
    color: '#8b5cf6', // purple
  },
  performance: {
    label: 'Performance',
    description: 'Issues with load times, responsiveness, or crashes',
    color: '#ef4444', // red
  },
  accessibility: {
    label: 'Accessibility',
    description: 'Issues with screen readers, keyboard navigation, or contrast',
    color: '#10b981', // green
  },
  feature: {
    label: 'Feature Request',
    description: 'Suggestions for new features or enhancements',
    color: '#f59e0b', // orange
  },
  bug: {
    label: 'Bug Report',
    description: 'Technical issues or unexpected behavior',
    color: '#ec4899', // pink
  },
  translation: {
    label: 'Translation',
    description: 'Issues with Arabic translation or RTL layout',
    color: '#06b6d4', // cyan
  },
  other: {
    label: 'Other',
    description: 'Any other feedback or suggestions',
    color: '#6b7280', // gray
  },
} as const;

/**
 * Feedback priority levels with descriptions
 */
export const FEEDBACK_PRIORITIES = {
  critical: {
    label: 'Critical',
    description: 'Blocks core functionality, needs immediate attention',
    weight: 5,
    color: '#dc2626', // red-600
  },
  high: {
    label: 'High',
    description: 'Significant issue affecting many users',
    weight: 4,
    color: '#ea580c', // orange-600
  },
  medium: {
    label: 'Medium',
    description: 'Moderate issue with workaround available',
    weight: 3,
    color: '#ca8a04', // yellow-600
  },
  low: {
    label: 'Low',
    description: 'Minor issue or nice-to-have improvement',
    weight: 2,
    color: '#2563eb', // blue-600
  },
  trivial: {
    label: 'Trivial',
    description: 'Cosmetic issue with minimal impact',
    weight: 1,
    color: '#6b7280', // gray-600
  },
} as const;

/**
 * Feedback status values
 */
export const FEEDBACK_STATUS = {
  pending: {
    label: 'Pending Review',
    description: 'Feedback received, awaiting review',
    color: '#6b7280', // gray
  },
  reviewing: {
    label: 'Under Review',
    description: 'Feedback is being analyzed',
    color: '#3b82f6', // blue
  },
  accepted: {
    label: 'Accepted',
    description: 'Feedback accepted, planning implementation',
    color: '#8b5cf6', // purple
  },
  rejected: {
    label: 'Rejected',
    description: 'Feedback reviewed but not accepted',
    color: '#ef4444', // red
  },
  in_progress: {
    label: 'In Progress',
    description: 'Working on implementing fix/improvement',
    color: '#f59e0b', // orange
  },
  completed: {
    label: 'Completed',
    description: 'Fix/improvement implemented',
    color: '#10b981', // green
  },
} as const;

/**
 * Validates a feedback item object
 *
 * @param feedback - The feedback item to validate
 * @returns True if valid, false otherwise
 */
export function validateFeedbackItem(feedback: Partial<FeedbackItem>): feedback is FeedbackItem {
  if (!feedback.id || typeof feedback.id !== 'string') {
    return false;
  }

  if (!feedback.category || !Object.keys(FEEDBACK_CATEGORIES).includes(feedback.category)) {
    return false;
  }

  if (!feedback.priority || !Object.keys(FEEDBACK_PRIORITIES).includes(feedback.priority)) {
    return false;
  }

  if (!feedback.status || !Object.keys(FEEDBACK_STATUS).includes(feedback.status)) {
    return false;
  }

  if (!feedback.title || typeof feedback.title !== 'string' || feedback.title.length < 5 || feedback.title.length > 200) {
    return false;
  }

  if (!feedback.description || typeof feedback.description !== 'string' || feedback.description.length < 10) {
    return false;
  }

  if (!feedback.createdAt || !(feedback.createdAt instanceof Date)) {
    return false;
  }

  if (!feedback.userId || typeof feedback.userId !== 'string') {
    return false;
  }

  return true;
}

/**
 * Creates a new feedback item with generated fields
 *
 * @param data - Partial feedback data
 * @returns Complete feedback item
 */
export function createFeedbackItem(data: Partial<FeedbackItem> & Pick<FeedbackItem, 'category' | 'title' | 'description' | 'userId'>): FeedbackItem {
  const now = new Date();

  return {
    id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    category: data.category,
    priority: data.priority || 'medium',
    status: 'pending',
    title: data.title.trim(),
    description: data.description.trim(),
    userId: data.userId,
    sessionId: data.sessionId || null,
    rating: data.rating || null,
    affectedArea: data.affectedArea || null,
    reproductionSteps: data.reproductionSteps || null,
    expectedBehavior: data.expectedBehavior || null,
    actualBehavior: data.actualBehavior || null,
    screenshots: data.screenshots || [],
    tags: data.tags || [],
    upvotes: data.upvotes || 0,
    createdAt: now,
    updatedAt: now,
    reviewedAt: null,
    reviewedBy: null,
    resolution: null,
    resolvedAt: null,
  };
}

/**
 * Updates an existing feedback item
 *
 * @param feedback - The feedback item to update
 * @param updates - Fields to update
 * @returns Updated feedback item
 */
export function updateFeedbackItem(
  feedback: FeedbackItem,
  updates: Partial<Omit<FeedbackItem, 'id' | 'createdAt' | 'userId'>>,
): FeedbackItem {
  const updated: FeedbackItem = {
    ...feedback,
    ...updates,
    updatedAt: new Date(),
  };

  // Auto-update timestamps based on status changes
  if (updates.status && updates.status !== feedback.status) {
    if (updates.status === 'reviewing' && !feedback.reviewedAt) {
      updated.reviewedAt = new Date();
    }
    if (updates.status === 'completed' && !feedback.resolvedAt) {
      updated.resolvedAt = new Date();
    }
  }

  return updated;
}

/**
 * Calculates priority score for a feedback item
 *
 * @param feedback - The feedback item
 * @returns Priority score (0-100)
 */
export function calculatePriorityScore(feedback: FeedbackItem): number {
  const baseScore = FEEDBACK_PRIORITIES[feedback.priority].weight * 20;

  let score = baseScore;

  // Bonus for recent feedback (last 7 days)
  const daysSinceCreated = (Date.now() - feedback.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated < 7) {
    score += 10;
  }

  // Bonus for high upvotes
  score += Math.min(feedback.upvotes * 2, 10);

  // Bonus for critical/high priority categories
  if (feedback.category === 'bug' || feedback.category === 'accessibility') {
    score += 5;
  }

  // Penalty for old feedback (30+ days) if still pending
  if (daysSinceCreated > 30 && feedback.status === 'pending') {
    score -= 5;
  }

  return Math.min(Math.max(score, 0), 100);
}

/**
 * Analyzes feedback data and generates insights
 *
 * @param feedback - Array of feedback items
 * @returns Feedback analysis with statistics and trends
 */
export function analyzeFeedback(feedback: FeedbackItem[]): FeedbackAnalysis {
  if (feedback.length === 0) {
    return {
      total: 0,
      byStatus: {},
      byCategory: {},
      byPriority: {},
      averageRating: null,
      topIssues: [],
      recentTrends: [],
      recommendations: [],
    };
  }

  // Count by status
  const byStatus = feedback.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<FeedbackStatus, number>);

  // Count by category
  const byCategory = feedback.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<FeedbackCategory, number>);

  // Count by priority
  const byPriority = feedback.reduce((acc, item) => {
    acc[item.priority] = (acc[item.priority] || 0) + 1;
    return acc;
  }, {} as Record<FeedbackPriority, number>);

  // Calculate average rating (only for items with ratings)
  const ratedItems = feedback.filter((item) => item.rating !== null);
  const averageRating =
    ratedItems.length > 0
      ? ratedItems.reduce((sum, item) => sum + (item.rating || 0), 0) / ratedItems.length
      : null;

  // Get top issues (highest priority score, limit to 10)
  const topIssues = [...feedback]
    .sort((a, b) => calculatePriorityScore(b) - calculatePriorityScore(a))
    .slice(0, 10)
    .map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      priority: item.priority,
      status: item.status,
      score: calculatePriorityScore(item),
      upvotes: item.upvotes,
      createdAt: item.createdAt,
    }));

  // Generate recent trends (last 30 days vs previous 30 days)
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;

  const recentFeedback = feedback.filter((item) => item.createdAt.getTime() >= thirtyDaysAgo);
  const olderFeedback = feedback.filter(
    (item) => item.createdAt.getTime() >= sixtyDaysAgo && item.createdAt.getTime() < thirtyDaysAgo,
  );

  const recentTrends: FeedbackTrend[] = Object.keys(FEEDBACK_CATEGORIES).map((category) => {
    const recentCount = recentFeedback.filter((item) => item.category === category).length;
    const olderCount = olderFeedback.filter((item) => item.category === category).length;
    const change = olderCount > 0 ? ((recentCount - olderCount) / olderCount) * 100 : 0;

    return {
      category: category as FeedbackCategory,
      recentCount,
      olderCount,
      changePercent: change,
      direction: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
    };
  });

  // Generate recommendations based on analysis
  const recommendations = generateRecommendations(feedback, byCategory, byStatus, byPriority);

  return {
    total: feedback.length,
    byStatus,
    byCategory,
    byPriority,
    averageRating,
    topIssues,
    recentTrends,
    recommendations,
  };
}

/**
 * Generates actionable recommendations based on feedback analysis
 *
 * @param feedback - All feedback items
 * @param byCategory - Category counts
 * @param byStatus - Status counts
 * @param byPriority - Priority counts
 * @returns Array of improvement suggestions
 */
function generateRecommendations(
  feedback: FeedbackItem[],
  byCategory: Record<string, number>,
  byStatus: Record<string, number>,
  byPriority: Record<string, number>,
): ImprovementSuggestion[] {
  const suggestions: ImprovementSuggestion[] = [];

  // Check for high volume of bugs
  const bugCount = byCategory.bug || 0;
  if (bugCount > 5) {
    suggestions.push({
      type: 'immediate',
      category: 'quality',
      title: 'Address High Bug Volume',
      description: `${bugCount} bug reports need attention. Consider scheduling a bug-fix sprint.`,
      priority: 'high',
      affectedAreas: ['technical', 'stability'],
    });
  }

  // Check for pending critical issues
  const pendingCritical = feedback.filter(
    (item) => item.priority === 'critical' && item.status === 'pending',
  ).length;
  if (pendingCritical > 0) {
    suggestions.push({
      type: 'immediate',
      category: 'quality',
      title: 'Resolve Critical Issues',
      description: `${pendingCritical} critical issue(s) awaiting review. Immediate attention required.`,
      priority: 'critical',
      affectedAreas: ['user-experience'],
    });
  }

  // Check for accessibility issues
  const accessibilityCount = byCategory.accessibility || 0;
  if (accessibilityCount > 0) {
    suggestions.push({
      type: 'short-term',
      category: 'accessibility',
      title: 'Improve Accessibility',
      description: `${accessibilityCount} accessibility issue(s) reported. Review WCAG compliance.`,
      priority: accessibilityCount > 2 ? 'high' : 'medium',
      affectedAreas: ['accessibility', 'compliance'],
    });
  }

  // Check for usability issues
  const usabilityCount = byCategory.usability || 0;
  if (usabilityCount > 3) {
    suggestions.push({
      type: 'short-term',
      category: 'ux',
      title: 'Enhance User Experience',
      description: `${usabilityCount} usability issue(s) identified. Consider UX audit.`,
      priority: 'medium',
      affectedAreas: ['user-experience', 'navigation'],
    });
  }

  // Check for translation issues
  const translationCount = byCategory.translation || 0;
  if (translationCount > 0) {
    suggestions.push({
      type: 'short-term',
      category: 'localization',
      title: 'Review Arabic Translation',
      description: `${translationCount} translation issue(s) reported. Review RTL layout and text.`,
      priority: 'medium',
      affectedAreas: ['localization', 'content'],
    });
  }

  // Check for popular feature requests
  const featureRequests = feedback.filter((item) => item.category === 'feature');
  const popularFeatures = featureRequests.filter((item) => item.upvotes >= 3);
  if (popularFeatures.length > 0) {
    suggestions.push({
      type: 'long-term',
      category: 'features',
      title: 'Consider Popular Feature Requests',
      description: `${popularFeatures.length} feature request(s) with high community support.`,
      priority: 'medium',
      affectedAreas: ['features', 'roadmap'],
    });
  }

  // Check resolution rate
  const total = feedback.length;
  const resolved = byStatus.completed || 0;
  const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;
  if (resolutionRate < 50 && total > 10) {
    suggestions.push({
      type: 'process',
      category: 'operations',
      title: 'Improve Resolution Rate',
      description: `Only ${resolutionRate.toFixed(1)}% of feedback resolved. Aim for >70%.`,
      priority: 'low',
      affectedAreas: ['process', 'efficiency'],
    });
  }

  return suggestions;
}

/**
 * Aggregates feedback by time period
 *
 * @param feedback - Array of feedback items
 * @param period - Aggregation period ('day', 'week', 'month')
 * @returns Aggregated feedback data by time period
 */
export function aggregateFeedbackByTime(
  feedback: FeedbackItem[],
  period: 'day' | 'week' | 'month',
): FeedbackAggregation[] {
  const aggregations = new Map<string, FeedbackAggregation>();

  feedback.forEach((item) => {
    const date = new Date(item.createdAt);
    let key: string;

    if (period === 'day') {
      key = date.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (period === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else {
      // month
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    if (!aggregations.has(key)) {
      aggregations.set(key, {
        period: key,
        total: 0,
        byCategory: {},
        byPriority: {},
        byStatus: {},
        averageRating: null,
        ratedItems: 0,
        ratingSum: 0,
      });
    }

    const agg = aggregations.get(key)!;
    agg.total++;

    // Track by category
    agg.byCategory[item.category] = (agg.byCategory[item.category] || 0) + 1;

    // Track by priority
    agg.byPriority[item.priority] = (agg.byPriority[item.priority] || 0) + 1;

    // Track by status
    agg.byStatus[item.status] = (agg.byStatus[item.status] || 0) + 1;

    // Track ratings
    if (item.rating !== null) {
      agg.ratedItems++;
      agg.ratingSum += item.rating;
    }
  });

  // Calculate average ratings and sort by period
  const result = Array.from(aggregations.values())
    .map((agg) => ({
      ...agg,
      averageRating: agg.ratedItems > 0 ? agg.ratingSum / agg.ratedItems : null,
      ratingSum: undefined,
      ratedItems: undefined,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));

  return result;
}

/**
 * Generates iteration actions based on feedback
 *
 * @param feedback - Array of feedback items to process
 * @returns Array of iteration actions
 */
export function generateIterationActions(feedback: FeedbackItem[]): IterationAction[] {
  const actions: IterationAction[] = [];

  // Group feedback by category and priority
  const criticalByCategory = feedback.filter((item) => item.priority === 'critical');
  const highByCategory = feedback.filter((item) => item.priority === 'high');
  const bugs = feedback.filter((item) => item.category === 'bug' && item.status !== 'completed');
  const accessibility = feedback.filter(
    (item) => item.category === 'accessibility' && item.status !== 'completed',
  );

  // Immediate actions for critical issues
  if (criticalByCategory.length > 0) {
    actions.push({
      id: `action-critical-${Date.now()}`,
      type: 'immediate',
      priority: 'critical',
      title: 'Address Critical Issues',
      description: `Resolve ${criticalByCategory.length} critical issue(s) blocking core functionality`,
      feedbackIds: criticalByCategory.map((item) => item.id),
      estimatedEffort: '1-2 days',
      assignedTo: null,
      status: 'pending',
      createdAt: new Date(),
    });
  }

  // Bug fix sprint
  if (bugs.length > 5) {
    actions.push({
      id: `action-bugs-${Date.now()}`,
      type: 'short-term',
      priority: 'high',
      title: 'Bug Fix Sprint',
      description: `Address ${bugs.length} reported bug(s)`,
      feedbackIds: bugs.map((item) => item.id),
      estimatedEffort: `${Math.ceil(bugs.length / 3)}-week`,
      assignedTo: null,
      status: 'pending',
      createdAt: new Date(),
    });
  }

  // Accessibility improvements
  if (accessibility.length > 0) {
    actions.push({
      id: `action-a11y-${Date.now()}`,
      type: 'short-term',
      priority: accessibility.length > 2 ? 'high' : 'medium',
      title: 'Accessibility Improvements',
      description: `Fix ${accessibility.length} accessibility issue(s) to improve WCAG compliance`,
      feedbackIds: accessibility.map((item) => item.id),
      estimatedEffort: `${Math.ceil(accessibility.length / 2)}-days`,
      assignedTo: null,
      status: 'pending',
      createdAt: new Date(),
    });
  }

  // Content quality improvements
  const contentIssues = feedback.filter(
    (item) => item.category === 'content' && item.status !== 'completed',
  );
  if (contentIssues.length > 3) {
    actions.push({
      id: `action-content-${Date.now()}`,
      type: 'short-term',
      priority: 'medium',
      title: 'Content Quality Review',
      description: `Review and improve content based on ${contentIssues.length} pieces of feedback`,
      feedbackIds: contentIssues.map((item) => item.id),
      estimatedEffort: '1 week',
      assignedTo: null,
      status: 'pending',
      createdAt: new Date(),
    });
  }

  // Feature considerations
  const featureRequests = feedback.filter((item) => item.category === 'feature');
  const popularFeatures = featureRequests.filter((item) => item.upvotes >= 3);
  if (popularFeatures.length > 0) {
    actions.push({
      id: `action-features-${Date.now()}`,
      type: 'long-term',
      priority: 'low',
      title: 'Evaluate Feature Requests',
      description: `Review ${popularFeatures.length} popular feature request(s) for roadmap consideration`,
      feedbackIds: popularFeatures.map((item) => item.id),
      estimatedEffort: '2-4 hours',
      assignedTo: null,
      status: 'pending',
      createdAt: new Date(),
    });
  }

  return actions.sort((a, b) => {
    const priorityWeight = { critical: 5, high: 4, medium: 3, low: 2 };
    const typeWeight = { immediate: 5, 'short-term': 3, 'long-term': 1 };
    const aScore = priorityWeight[a.priority] + typeWeight[a.type];
    const bScore = priorityWeight[b.priority] + typeWeight[b.type];
    return bScore - aScore;
  });
}

/**
 * Exports feedback data to JSON format
 *
 * @param feedback - Array of feedback items
 * @returns JSON string of feedback data
 */
export function exportFeedback(feedback: FeedbackItem[]): string {
  const exportData = {
    exportedAt: new Date().toISOString(),
    total: feedback.length,
    feedback: feedback.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      reviewedAt: item.reviewedAt?.toISOString() || null,
      resolvedAt: item.resolvedAt?.toISOString() || null,
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Imports feedback data from JSON format
 *
 * @param json - JSON string of feedback data
 * @returns Array of feedback items
 * @throws Error if JSON is invalid
 */
export function importFeedback(json: string): FeedbackItem[] {
  try {
    const data = JSON.parse(json);

    if (!Array.isArray(data.feedback)) {
      throw new Error('Invalid feedback data format');
    }

    return data.feedback.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      reviewedAt: item.reviewedAt ? new Date(item.reviewedAt) : null,
      resolvedAt: item.resolvedAt ? new Date(item.resolvedAt) : null,
    }));
  } catch (error) {
    throw new Error(`Failed to import feedback: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Filters feedback by multiple criteria
 *
 * @param feedback - Array of feedback items
 * @param filters - Filter criteria
 * @returns Filtered feedback array
 */
export function filterFeedback(
  feedback: FeedbackItem[],
  filters: Partial<{
    category: FeedbackCategory;
    priority: FeedbackPriority;
    status: FeedbackStatus;
    userId: string;
    sessionId: string;
    startDate: Date;
    endDate: Date;
    minRating: number;
    tags: string[];
  }>,
): FeedbackItem[] {
  return feedback.filter((item) => {
    if (filters.category && item.category !== filters.category) return false;
    if (filters.priority && item.priority !== filters.priority) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.userId && item.userId !== filters.userId) return false;
    if (filters.sessionId && item.sessionId !== filters.sessionId) return false;
    if (filters.minRating && (item.rating || 0) < filters.minRating) return false;
    if (filters.tags && filters.tags.length > 0) {
      const hasAllTags = filters.tags.every((tag) => item.tags.includes(tag));
      if (!hasAllTags) return false;
    }
    if (filters.startDate && item.createdAt < filters.startDate) return false;
    if (filters.endDate && item.createdAt > filters.endDate) return false;
    return true;
  });
}

/**
 * Searches feedback by keyword
 *
 * @param feedback - Array of feedback items
 * @param query - Search query string
 * @returns Feedback items matching the query
 */
export function searchFeedback(feedback: FeedbackItem[], query: string): FeedbackItem[] {
  const lowerQuery = query.toLowerCase();

  return feedback.filter(
    (item) =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      item.affectedArea?.toLowerCase().includes(lowerQuery),
  );
}
