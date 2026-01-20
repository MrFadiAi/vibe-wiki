import type { UserProgress } from '@/types';

// ============================================================================
// Types
// ============================================================================

export type EventType =
  | 'page_view'
  | 'article_view'
  | 'article_complete'
  | 'tutorial_view'
  | 'tutorial_step_complete'
  | 'tutorial_complete'
  | 'path_view'
  | 'path_item_complete'
  | 'path_complete'
  | 'search'
  | 'recommendation_click'
  | 'contribution_submit'
  | 'contribution_approve'
  | 'achievement_unlock'
  | 'session_start'
  | 'session_end';

export interface AnalyticsEvent {
  id: string;
  type: EventType;
  userId: string;
  sessionId: string;
  timestamp: Date;
  properties?: Record<string, unknown>;
  metadata?: {
    userAgent?: string;
    url?: string;
    referrer?: string;
    viewport?: {
      width: number;
      height: number;
    };
  };
}

export interface SessionMetrics {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  pageViews: number;
  articlesViewed: number;
  articlesCompleted: number;
  tutorialsViewed: number;
  tutorialsCompleted: number;
  pathsViewed: number;
  pathsCompleted: number;
  searchesPerformed: number;
  achievementsUnlocked: number;
}

export interface ContentMetrics {
  contentId: string;
  contentType: 'article' | 'tutorial' | 'path';
  title: string;
  views: number;
  completions: number;
  averageTimeToComplete?: number; // in seconds
  completionRate: number;
  lastViewed?: Date;
  uniqueViewers: number;
  bookmarkCount: number;
  shareCount: number;
}

export interface UserEngagementMetrics {
  userId: string;
  totalSessions: number;
  totalSessionTime: number; // in seconds
  averageSessionDuration: number; // in seconds
  totalPageViews: number;
  averagePageViewsPerSession: number;
  longestStreak: number;
  currentStreak: number;
  totalPoints: number;
  achievementsCount: number;
  lastActive: Date;
  mostActiveDay: string; // 'Monday', 'Tuesday', etc.
  mostActiveHour: number; // 0-23
}

export interface PlatformMetrics {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalSessions: number;
  totalPageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  topContent: ContentMetrics[];
  topSearches: Array<{
    query: string;
    count: number;
  }>;
  conversionRate: number; // visitors to active users
}

export interface SearchQuery {
  query: string;
  timestamp: Date;
  resultsCount: number;
  clickedResult?: string;
  userId: string;
}

export interface RecommendationMetrics {
  contentId: string;
  contentType: 'article' | 'tutorial' | 'path';
  impressions: number;
  clicks: number;
  clickThroughRate: number;
  position: number; // average position shown
}

export interface FunnelStep {
  stepName: string;
  stepNumber: number;
  count: number;
  dropOff: number;
  conversionRate: number;
}

export interface ConversionFunnel {
  name: string;
  startDate: Date;
  endDate: Date;
  steps: FunnelStep[];
  overallConversion: number;
}

export interface CohortMetrics {
  cohort: string; // e.g., '2025-01', 'week-3'
  cohortSize: number;
  retentionRates: number[]; // retention at day 1, 7, 30, etc.
  averageMetrics: {
    sessionsPerUser: number;
    completionRate: number;
    timeToFirstCompletion: number;
  };
}

export interface AnalyticsReport {
  generatedAt: Date;
  period: { start: Date; end: Date };
  userEngagement: UserEngagementMetrics;
  platformMetrics: PlatformMetrics;
  contentMetrics: ContentMetrics[];
  topContent: ContentMetrics[];
  searchQueries: SearchQuery[];
  recommendationMetrics: RecommendationMetrics[];
}

// ============================================================================
// Storage Keys
// ============================================================================

const ANALYTICS_EVENTS_KEY = 'vibe-wiki-analytics-events';
const ANALYTICS_SESSIONS_KEY = 'vibe-wiki-analytics-sessions';
const ANALYTICS_CONTENT_KEY = 'vibe-wiki-analytics-content';
const ANALYTICS_SEARCH_KEY = 'vibe-wiki-analytics-search';
const ANALYTICS_RECOMMENDATIONS_KEY = 'vibe-wiki-analytics-recommendations';

// ============================================================================
// Event Tracking
// ============================================================================

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  let sessionId = sessionStorage.getItem('vibe-wiki-session-id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem('vibe-wiki-session-id', sessionId);
  }
  return sessionId;
}

/**
 * Generate a unique event ID
 */
function generateEventId(): string {
  return `event_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get current session ID or create a new one
 */
export function getCurrentSessionId(): string {
  return sessionStorage.getItem('vibe-wiki-session-id') || generateSessionId();
}

/**
 * Track an analytics event
 */
export function trackEvent(
  type: EventType,
  userId: string,
  properties?: Record<string, unknown>,
  metadata?: AnalyticsEvent['metadata']
): void {
  const event: AnalyticsEvent = {
    id: generateEventId(),
    type,
    userId,
    sessionId: getCurrentSessionId(),
    timestamp: new Date(),
    properties,
    metadata: {
      ...metadata,
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    },
  };

  const events = loadEvents();
  events.unshift(event);

  // Keep only last 1000 events
  if (events.length > 1000) {
    events.splice(1000);
  }

  saveEvents(events);
}

/**
 * Track a page view
 */
export function trackPageView(userId: string, pageType: string, pageId?: string): void {
  trackEvent('page_view', userId, { pageType, pageId });
}

/**
 * Track an article view
 */
export function trackArticleView(userId: string, articleSlug: string, articleTitle: string): void {
  trackEvent('article_view', userId, { articleSlug, articleTitle });
  updateContentMetrics(articleSlug, 'article', articleTitle, 'view');
}

/**
 * Track an article completion
 */
export function trackArticleComplete(userId: string, articleSlug: string, articleTitle: string): void {
  trackEvent('article_complete', userId, { articleSlug, articleTitle });
  updateContentMetrics(articleSlug, 'article', articleTitle, 'complete');
}

/**
 * Track a tutorial view
 */
export function trackTutorialView(userId: string, tutorialId: string, tutorialTitle: string): void {
  trackEvent('tutorial_view', userId, { tutorialId, tutorialTitle });
  updateContentMetrics(tutorialId, 'tutorial', tutorialTitle, 'view');
}

/**
 * Track a tutorial step completion
 */
export function trackTutorialStepComplete(userId: string, tutorialId: string, stepId: string, stepNumber: number): void {
  trackEvent('tutorial_step_complete', userId, { tutorialId, stepId, stepNumber });
}

/**
 * Track a tutorial completion
 */
export function trackTutorialComplete(userId: string, tutorialId: string, tutorialTitle: string): void {
  trackEvent('tutorial_complete', userId, { tutorialId, tutorialTitle });
  updateContentMetrics(tutorialId, 'tutorial', tutorialTitle, 'complete');
}

/**
 * Track a path view
 */
export function trackPathView(userId: string, pathId: string, pathTitle: string): void {
  trackEvent('path_view', userId, { pathId, pathTitle });
  updateContentMetrics(pathId, 'path', pathTitle, 'view');
}

/**
 * Track a path item completion
 */
export function trackPathItemComplete(userId: string, pathId: string, itemId: string, itemType: string): void {
  trackEvent('path_item_complete', userId, { pathId, itemId, itemType });
}

/**
 * Track a path completion
 */
export function trackPathComplete(userId: string, pathId: string, pathTitle: string): void {
  trackEvent('path_complete', userId, { pathId, pathTitle });
  updateContentMetrics(pathId, 'path', pathTitle, 'complete');
}

/**
 * Track a search query
 */
export function trackSearch(userId: string, query: string, resultsCount: number, clickedResult?: string): void {
  trackEvent('search', userId, { query, resultsCount, clickedResult });

  const searchQuery: SearchQuery = {
    query,
    timestamp: new Date(),
    resultsCount,
    clickedResult,
    userId,
  };

  const searches = loadSearches();
  searches.unshift(searchQuery);

  // Keep only last 500 searches
  if (searches.length > 500) {
    searches.splice(500);
  }

  saveSearches(searches);
}

/**
 * Track a recommendation click
 */
export function trackRecommendationClick(
  userId: string,
  contentId: string,
  contentType: 'article' | 'tutorial' | 'path',
  position: number,
  reason?: string
): void {
  trackEvent('recommendation_click', userId, { contentId, contentType, position, reason });

  // Update recommendation metrics
  const recommendations = loadRecommendations();
  const existingIndex = recommendations.findIndex((r) => r.contentId === contentId);

  if (existingIndex >= 0) {
    recommendations[existingIndex].clicks++;
    recommendations[existingIndex].clickThroughRate =
      recommendations[existingIndex].clicks / recommendations[existingIndex].impressions;
  } else {
    recommendations.push({
      contentId,
      contentType,
      impressions: 1,
      clicks: 1,
      clickThroughRate: 1,
      position,
    });
  }

  saveRecommendations(recommendations);
}

/**
 * Track a recommendation impression
 */
export function trackRecommendationImpression(
  contentId: string,
  contentType: 'article' | 'tutorial' | 'path',
  position: number
): void {
  const recommendations = loadRecommendations();
  const existingIndex = recommendations.findIndex((r) => r.contentId === contentId);

  if (existingIndex >= 0) {
    recommendations[existingIndex].impressions++;
    recommendations[existingIndex].clickThroughRate =
      recommendations[existingIndex].clicks / recommendations[existingIndex].impressions;
    recommendations[existingIndex].position =
      (recommendations[existingIndex].position * (recommendations[existingIndex].impressions - 1) + position) /
      recommendations[existingIndex].impressions;
  } else {
    recommendations.push({
      contentId,
      contentType,
      impressions: 1,
      clicks: 0,
      clickThroughRate: 0,
      position,
    });
  }

  saveRecommendations(recommendations);
}

/**
 * Track an achievement unlock
 */
export function trackAchievementUnlock(userId: string, achievementId: string, achievementTitle: string): void {
  trackEvent('achievement_unlock', userId, { achievementId, achievementTitle });
}

/**
 * Track session start
 */
export function trackSessionStart(userId: string): void {
  const sessionId = generateSessionId();
  trackEvent('session_start', userId, { sessionId });

  const sessions = loadSessions();
  const session: SessionMetrics = {
    sessionId,
    userId,
    startTime: new Date(),
    pageViews: 1,
    articlesViewed: 0,
    articlesCompleted: 0,
    tutorialsViewed: 0,
    tutorialsCompleted: 0,
    pathsViewed: 0,
    pathsCompleted: 0,
    searchesPerformed: 0,
    achievementsUnlocked: 0,
  };
  sessions.unshift(session);
  saveSessions(sessions);
}

/**
 * Track session end
 */
export function trackSessionEnd(userId: string): void {
  const sessionId = getCurrentSessionId();
  trackEvent('session_end', userId, { sessionId });

  const sessions = loadSessions();
  const sessionIndex = sessions.findIndex((s) => s.sessionId === sessionId);

  if (sessionIndex >= 0) {
    const session = sessions[sessionIndex];
    session.endTime = new Date();
    session.duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);
    sessions[sessionIndex] = session;
    saveSessions(sessions);
  }

  // Clear session ID from sessionStorage
  sessionStorage.removeItem('vibe-wiki-session-id');
}

// ============================================================================
// Content Metrics
// ============================================================================

/**
 * Update content metrics
 */
function updateContentMetrics(
  contentId: string,
  contentType: 'article' | 'tutorial' | 'path',
  title: string,
  action: 'view' | 'complete'
): void {
  const metrics = loadContentMetrics();
  const existingIndex = metrics.findIndex((m) => m.contentId === contentId);

  if (existingIndex >= 0) {
    if (action === 'view') {
      metrics[existingIndex].views++;
      metrics[existingIndex].lastViewed = new Date();
      // Recalculate completion rate
      metrics[existingIndex].completionRate =
        metrics[existingIndex].views > 0
          ? metrics[existingIndex].completions / metrics[existingIndex].views
          : Infinity;
    } else if (action === 'complete') {
      metrics[existingIndex].completions++;
      metrics[existingIndex].completionRate =
        metrics[existingIndex].views > 0
          ? metrics[existingIndex].completions / metrics[existingIndex].views
          : Infinity;
    }
  } else {
    const views = action === 'view' ? 1 : 0;
    const completions = action === 'complete' ? 1 : 0;
    metrics.push({
      contentId,
      contentType,
      title,
      views,
      completions,
      completionRate: views > 0 ? completions / views : Infinity,
      uniqueViewers: 1,
      bookmarkCount: 0,
      shareCount: 0,
      lastViewed: action === 'view' ? new Date() : undefined,
    });
  }

  saveContentMetrics(metrics);
}

// ============================================================================
// Data Loading/Saving
// ============================================================================

/**
 * Load analytics events
 */
export function loadEvents(): AnalyticsEvent[] {
  try {
    const stored = localStorage.getItem(ANALYTICS_EVENTS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((e: AnalyticsEvent) => ({
      ...e,
      timestamp: new Date(e.timestamp),
    }));
  } catch (error) {
    console.error('Failed to load analytics events:', error);
    return [];
  }
}

/**
 * Save analytics events
 */
function saveEvents(events: AnalyticsEvent[]): void {
  try {
    localStorage.setItem(ANALYTICS_EVENTS_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Failed to save analytics events:', error);
  }
}

/**
 * Load session metrics
 */
export function loadSessions(): SessionMetrics[] {
  try {
    const stored = localStorage.getItem(ANALYTICS_SESSIONS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((s: SessionMetrics) => ({
      ...s,
      startTime: new Date(s.startTime),
      endTime: s.endTime ? new Date(s.endTime) : undefined,
    }));
  } catch (error) {
    console.error('Failed to load session metrics:', error);
    return [];
  }
}

/**
 * Save session metrics
 */
function saveSessions(sessions: SessionMetrics[]): void {
  try {
    localStorage.setItem(ANALYTICS_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to save session metrics:', error);
  }
}

/**
 * Load content metrics
 */
export function loadContentMetrics(): ContentMetrics[] {
  try {
    const stored = localStorage.getItem(ANALYTICS_CONTENT_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((m: ContentMetrics) => ({
      ...m,
      lastViewed: m.lastViewed ? new Date(m.lastViewed) : undefined,
      // Handle Infinity which becomes null when serialized to JSON
      completionRate: m.completionRate === null ? Infinity : m.completionRate,
    }));
  } catch (error) {
    console.error('Failed to load content metrics:', error);
    return [];
  }
}

/**
 * Save content metrics
 */
function saveContentMetrics(metrics: ContentMetrics[]): void {
  try {
    localStorage.setItem(ANALYTICS_CONTENT_KEY, JSON.stringify(metrics));
  } catch (error) {
    console.error('Failed to save content metrics:', error);
  }
}

/**
 * Load search queries
 */
export function loadSearches(): SearchQuery[] {
  try {
    const stored = localStorage.getItem(ANALYTICS_SEARCH_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((s: SearchQuery) => ({
      ...s,
      timestamp: new Date(s.timestamp),
    }));
  } catch (error) {
    console.error('Failed to load search queries:', error);
    return [];
  }
}

/**
 * Save search queries
 */
function saveSearches(searches: SearchQuery[]): void {
  try {
    localStorage.setItem(ANALYTICS_SEARCH_KEY, JSON.stringify(searches));
  } catch (error) {
    console.error('Failed to save search queries:', error);
  }
}

/**
 * Load recommendation metrics
 */
export function loadRecommendations(): RecommendationMetrics[] {
  try {
    const stored = localStorage.getItem(ANALYTICS_RECOMMENDATIONS_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load recommendation metrics:', error);
    return [];
  }
}

/**
 * Save recommendation metrics
 */
function saveRecommendations(recommendations: RecommendationMetrics[]): void {
  try {
    localStorage.setItem(ANALYTICS_RECOMMENDATIONS_KEY, JSON.stringify(recommendations));
  } catch (error) {
    console.error('Failed to save recommendation metrics:', error);
  }
}

// ============================================================================
// Metrics Calculation
// ============================================================================

/**
 * Calculate user engagement metrics
 */
export function calculateUserEngagementMetrics(userId: string, progress: UserProgress): UserEngagementMetrics {
  const sessions = loadSessions().filter((s) => s.userId === userId);
  const events = loadEvents().filter((e) => e.userId === userId);

  const totalSessions = sessions.length;
  const totalSessionTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const averageSessionDuration = totalSessions > 0 ? totalSessionTime / totalSessions : 0;

  const totalPageViews = events.filter((e) => e.type === 'page_view').length;
  const averagePageViewsPerSession = totalSessions > 0 ? totalPageViews / totalSessions : 0;

  // Calculate most active day
  const dayCounts = events.reduce((acc, e) => {
    const day = new Date(e.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Monday';

  // Calculate most active hour
  const hourCounts = events.reduce((acc, e) => {
    const hour = new Date(e.timestamp).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const mostActiveHour = Number(Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0);

  return {
    userId,
    totalSessions,
    totalSessionTime,
    averageSessionDuration,
    totalPageViews,
    averagePageViewsPerSession,
    longestStreak: 0, // This would require historical data
    currentStreak: progress.streakDays,
    totalPoints: progress.totalPoints,
    achievementsCount: progress.achievements.length,
    lastActive: progress.lastActivity,
    mostActiveDay,
    mostActiveHour,
  };
}

/**
 * Calculate platform metrics for a given period
 */
export function calculatePlatformMetrics(period: 'daily' | 'weekly' | 'monthly'): PlatformMetrics {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'daily':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'weekly':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'monthly':
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
      break;
  }

  const sessions = loadSessions().filter((s) => s.startTime >= startDate);
  const events = loadEvents().filter((e) => e.timestamp >= startDate);
  const searches = loadSearches().filter((s) => s.timestamp >= startDate);
  const contentMetrics = loadContentMetrics();

  const uniqueUsers = new Set(sessions.map((s) => s.userId));
  const totalUsers = uniqueUsers.size;

  const totalSessions = sessions.length;
  const totalPageViews = events.filter((e) => e.type === 'page_view').length;

  const totalSessionTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const averageSessionDuration = totalSessions > 0 ? totalSessionTime / totalSessions : 0;

  // Calculate bounce rate (sessions with 1 page view)
  const singlePageViewSessions = sessions.filter((s) => s.pageViews === 1).length;
  const bounceRate = totalSessions > 0 ? singlePageViewSessions / totalSessions : 0;

  // Get top content
  const topContent = contentMetrics
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Get top searches
  const searchCounts = searches.reduce((acc, s) => {
    acc[s.query] = (acc[s.query] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSearches = Object.entries(searchCounts)
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    period,
    startDate,
    endDate: now,
    totalUsers,
    activeUsers: totalUsers,
    newUsers: 0, // This would require historical data
    totalSessions,
    totalPageViews,
    averageSessionDuration,
    bounceRate,
    topContent,
    topSearches,
    conversionRate: 0, // This would require more complex tracking
  };
}

/**
 * Get content performance metrics
 */
export function getContentPerformance(
  contentId: string,
  contentType: 'article' | 'tutorial' | 'path'
): ContentMetrics | undefined {
  const metrics = loadContentMetrics();
  return metrics.find((m) => m.contentId === contentId && m.contentType === contentType);
}

/**
 * Get top performing content
 */
export function getTopContent(limit: number = 10, sortBy: 'views' | 'completions' | 'completionRate' = 'views'): ContentMetrics[] {
  const metrics = loadContentMetrics();
  return metrics
    .sort((a, b) => b[sortBy] - a[sortBy])
    .slice(0, limit);
}

/**
 * Calculate conversion funnel
 */
export function calculateConversionFunnel(
  name: string,
  startDate: Date,
  endDate: Date,
  steps: Array<{ stepName: string; eventType: EventType }>
): ConversionFunnel {
  const events = loadEvents().filter((e) => e.timestamp >= startDate && e.timestamp <= endDate);
  const uniqueUsers = new Set(events.map((e) => e.userId));

  // First, calculate user counts for each step
  const stepCounts = steps.map((step) => {
    const stepEvents = events.filter((e) => e.type === step.eventType);
    const stepUsers = new Set(stepEvents.map((e) => e.userId));
    return stepUsers.size;
  });

  // Then create funnel steps with proper drop-off and conversion rates
  const funnelSteps: FunnelStep[] = steps.map((step, index) => {
    const count = stepCounts[index];
    const prevStepUsers = index === 0 ? uniqueUsers.size : stepCounts[index - 1];
    const dropOff = prevStepUsers - count;
    const conversionRate = prevStepUsers > 0 ? count / prevStepUsers : 0;

    return {
      stepName: step.stepName,
      stepNumber: index + 1,
      count,
      dropOff,
      conversionRate,
    };
  });

  const overallConversion =
    uniqueUsers.size > 0 ? funnelSteps[funnelSteps.length - 1].count / uniqueUsers.size : 0;

  return {
    name,
    startDate,
    endDate,
    steps: funnelSteps,
    overallConversion,
  };
}

/**
 * Generate comprehensive analytics report
 */
export function generateAnalyticsReport(
  period: 'daily' | 'weekly' | 'monthly',
  userId: string,
  progress: UserProgress
): AnalyticsReport {
  return {
    generatedAt: new Date(),
    period: {
      start: new Date(),
      end: new Date(),
    },
    userEngagement: calculateUserEngagementMetrics(userId, progress),
    platformMetrics: calculatePlatformMetrics(period),
    contentMetrics: loadContentMetrics(),
    topContent: getTopContent(10),
    searchQueries: loadSearches().slice(0, 100),
    recommendationMetrics: loadRecommendations(),
  };
}

/**
 * Clear all analytics data
 */
export function clearAnalytics(): void {
  localStorage.removeItem(ANALYTICS_EVENTS_KEY);
  localStorage.removeItem(ANALYTICS_SESSIONS_KEY);
  localStorage.removeItem(ANALYTICS_CONTENT_KEY);
  localStorage.removeItem(ANALYTICS_SEARCH_KEY);
  localStorage.removeItem(ANALYTICS_RECOMMENDATIONS_KEY);
}

/**
 * Export analytics data
 */
export function exportAnalytics(): string {
  return JSON.stringify(
    {
      events: loadEvents(),
      sessions: loadSessions(),
      contentMetrics: loadContentMetrics(),
      searches: loadSearches(),
      recommendations: loadRecommendations(),
      exportedAt: new Date(),
    },
    null,
    2
  );
}
