/**
 * Analytics Utilities for Vibe Wiki
 * Comprehensive analytics tracking, metrics calculation, and reporting
 */

import type {
  AnalyticsEvent,
  AnalyticsSession,
  AnalyticsEventType,
  AnalyticsContentType,
  EventMetadata,
  DeviceInfo,
  UserBehaviorMetrics,
  ContentPerformanceMetrics,
  PlatformAnalytics,
  AnalyticsTimeframe,
  AnalyticsQuery,
  AnalyticsReport,
  AnalyticsInsight,
  RealTimeAnalytics,
  RealTimePage,
  TopSearchItem,
  ErrorMetric,
  ConversionMetrics,
  EngagementMetrics,
  ContentTypeMetrics,
  ContentTypeStats,
  RetentionMetrics,
  SectionVisit,
  ContentTypePreference,
  TimePeriod,
  DayOfWeek,
  TimeSeriesData,
  TimeSeriesPoint,
  AggregationPeriod,
} from '@/types/analytics';
import type { WikiArticle, Tutorial, LearningPath } from '@/types';

// Storage keys
const SESSIONS_KEY = 'vibe-wiki-analytics-sessions';
const EVENTS_KEY = 'vibe-wiki-analytics-events';
const CURRENT_SESSION_KEY = 'vibe-wiki-analytics-current-session';
const CONSENT_KEY = 'vibe-wiki-analytics-consent';

// Default values
const MAX_SESSIONS = 1000;
const MAX_EVENTS = 10000;
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const REAL_TIME_SESSION_LIMIT = 100;

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Get or create current analytics session
 */
export function getCurrentSession(): AnalyticsSession {
  const stored = localStorage.getItem(CURRENT_SESSION_KEY);
  if (stored) {
    const session: AnalyticsSession = JSON.parse(stored);
    const sessionStartTime = new Date(session.startTime).getTime();
    const now = Date.now();

    // Check if session is still valid (within timeout)
    if (now - sessionStartTime < SESSION_TIMEOUT) {
      // Convert dates back to Date objects
      return {
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined,
      };
    }
  }

  // Create new session
  return createSession();
}

/**
 * Create a new analytics session
 */
export function createSession(): AnalyticsSession {
  const userId = getUserId();
  const sessionId = generateSessionId();
  const deviceInfo = getDeviceInfo();

  const session: AnalyticsSession = {
    sessionId,
    userId,
    startTime: new Date(),
    pageViews: 0,
    events: [],
    deviceInfo,
  };

  saveCurrentSession(session);
  return session;
}

/**
 * End current session
 */
export function endSession(): void {
  const session = getCurrentSession();
  session.endTime = new Date();
  session.duration = Math.floor(
    (session.endTime.getTime() - session.startTime.getTime()) / 1000
  );

  // Save to sessions storage
  saveSession(session);

  // Clear current session
  localStorage.removeItem(CURRENT_SESSION_KEY);
}

/**
 * Save a completed session to storage
 */
function saveSession(session: AnalyticsSession): void {
  const sessions = loadSessions();
  sessions.unshift(session);

  // Keep only the most recent sessions
  if (sessions.length > MAX_SESSIONS) {
    sessions.splice(MAX_SESSIONS);
  }

  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

/**
 * Load all sessions from storage
 */
export function loadSessions(): AnalyticsSession[] {
  try {
    const stored = localStorage.getItem(SESSIONS_KEY);
    if (!stored) return [];

    const sessions: AnalyticsSession[] = JSON.parse(stored);
    return sessions.map((s) => ({
      ...s,
      startTime: new Date(s.startTime),
      endTime: s.endTime ? new Date(s.endTime) : undefined,
    }));
  } catch (error) {
    console.error('Failed to load sessions:', error);
    return [];
  }
}

/**
 * Save current session to storage
 */
function saveCurrentSession(session: AnalyticsSession): void {
  try {
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save current session:', error);
  }
}

/**
 * Update current session with new page view
 */
function updateSessionPageView(session: AnalyticsSession, page: string): void {
  session.pageViews++;
  session.exitPage = page;
  saveCurrentSession(session);
}

// ============================================================================
// EVENT TRACKING
// ============================================================================

/**
 * Track an analytics event
 */
export function trackEvent(
  type: AnalyticsEventType,
  metadata: EventMetadata
): void {
  // Check for consent
  if (!hasConsent()) {
    return;
  }

  const session = getCurrentSession();
  const event: AnalyticsEvent = {
    id: generateEventId(),
    sessionId: session.sessionId,
    userId: session.userId,
    type,
    timestamp: new Date(),
    page: window.location.pathname,
    metadata,
  };

  // Add event to session
  session.events.push(event);

  // Update session if needed
  if (type === 'page_view') {
    updateSessionPageView(session, metadata.customProperties?.page as string || window.location.pathname);
  }

  saveCurrentSession(session);

  // Save event to events storage
  saveEvent(event);
}

/**
 * Save event to events storage
 */
function saveEvent(event: AnalyticsEvent): void {
  const events = loadEvents();
  events.unshift(event);

  // Keep only the most recent events
  if (events.length > MAX_EVENTS) {
    events.splice(MAX_EVENTS);
  }

  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Failed to save event:', error);
  }
}

/**
 * Load all events from storage
 */
export function loadEvents(): AnalyticsEvent[] {
  try {
    const stored = localStorage.getItem(EVENTS_KEY);
    if (!stored) return [];

    const events: AnalyticsEvent[] = JSON.parse(stored);
    return events.map((e) => ({
      ...e,
      timestamp: new Date(e.timestamp),
    }));
  } catch (error) {
    console.error('Failed to load events:', error);
    return [];
  }
}

/**
 * Track page view
 */
export function trackPageView(
  page: string,
  metadata?: Partial<EventMetadata>
): void {
  trackEvent('page_view', {
    ...metadata,
    customProperties: { ...metadata?.customProperties, page },
  });
}

/**
 * Track article view
 */
export function trackArticleView(
  article: WikiArticle,
  metadata?: Partial<EventMetadata>
): void {
  trackEvent('article_view', {
    contentType: 'article',
    contentId: article.slug,
    contentTitle: article.title,
    section: article.section,
    ...metadata,
  });
}

/**
 * Track article completion
 */
export function trackArticleComplete(
  article: WikiArticle,
  readingTime: number,
  metadata?: Partial<EventMetadata>
): void {
  trackEvent('article_complete', {
    contentType: 'article',
    contentId: article.slug,
    contentTitle: article.title,
    section: article.section,
    readingTime,
    ...metadata,
  });
}

/**
 * Track tutorial start
 */
export function trackTutorialStart(
  tutorial: Tutorial,
  metadata?: Partial<EventMetadata>
): void {
  trackEvent('tutorial_start', {
    contentType: 'tutorial',
    contentId: tutorial.id,
    contentTitle: tutorial.title,
    section: tutorial.section,
    difficulty: tutorial.difficulty,
    totalSteps: tutorial.steps.length,
    ...metadata,
  });
}

/**
 * Track tutorial step completion
 */
export function trackTutorialStepComplete(
  tutorial: Tutorial,
  stepId: string,
  stepNumber: number,
  metadata?: Partial<EventMetadata>
): void {
  trackEvent('tutorial_step_complete', {
    contentType: 'tutorial',
    contentId: tutorial.id,
    contentTitle: tutorial.title,
    section: tutorial.section,
    stepId,
    stepNumber,
    totalSteps: tutorial.steps.length,
    difficulty: tutorial.difficulty,
    ...metadata,
  });
}

/**
 * Track tutorial completion
 */
export function trackTutorialComplete(
  tutorial: Tutorial,
  totalTimeSpent: number,
  metadata?: Partial<EventMetadata>
): void {
  trackEvent('tutorial_complete', {
    contentType: 'tutorial',
    contentId: tutorial.id,
    contentTitle: tutorial.title,
    section: tutorial.section,
    difficulty: tutorial.difficulty,
    readingTime: totalTimeSpent,
    ...metadata,
  });
}

/**
 * Track learning path start
 */
export function trackPathStart(
  path: LearningPath,
  metadata?: Partial<EventMetadata>
): void {
  trackEvent('path_start', {
    contentType: 'path',
    contentId: path.id,
    contentTitle: path.title,
    section: path.category,
    difficulty: path.difficulty,
    ...metadata,
  });
}

/**
 * Track learning path completion
 */
export function trackPathComplete(
  path: LearningPath,
  totalTimeSpent: number,
  metadata?: Partial<EventMetadata>
): void {
  trackEvent('path_complete', {
    contentType: 'path',
    contentId: path.id,
    contentTitle: path.title,
    section: path.category,
    difficulty: path.difficulty,
    readingTime: totalTimeSpent,
    ...metadata,
  });
}

/**
 * Track search
 */
export function trackSearch(
  query: string,
  resultsCount: number,
  metadata?: Partial<EventMetadata>
): void {
  trackEvent('search_perform', {
    searchQuery: query,
    resultsCount,
    ...metadata,
  });
}

/**
 * Track search result click
 */
export function trackSearchResultClick(
  query: string,
  resultPosition: number,
  resultId: string,
  metadata?: Partial<EventMetadata>
): void {
  trackEvent('search_result_click', {
    searchQuery: query,
    resultPosition,
    clickedResultId: resultId,
    ...metadata,
  });
}

/**
 * Track code execution
 */
export function trackCodeExecute(
  language: string,
  success: boolean,
  executionTime?: number,
  errorType?: string,
  metadata?: Partial<EventMetadata>
): void {
  trackEvent('code_execute', {
    language,
    executionSuccess: success,
    executionTime,
    errorType,
    ...metadata,
  });
}

/**
 * Track exercise attempt
 */
export function trackExerciseAttempt(
  exerciseId: string,
  exerciseTitle: string,
  completed: boolean,
  hintsUsed: number,
  attempts: number,
  metadata?: Partial<EventMetadata>
): void {
  trackEvent('exercise_attempt', {
    contentType: 'exercise',
    contentId: exerciseId,
    contentTitle: exerciseTitle,
    completed,
    hintsUsed,
    attempts,
    ...metadata,
  });
}

/**
 * Track achievement unlock
 */
export function trackAchievementUnlock(
  achievementId: string,
  achievementTitle: string,
  points: number,
  metadata?: Partial<EventMetadata>
): void {
  trackEvent('achievement_unlock', {
    achievementId,
    achievementTitle,
    points,
    ...metadata,
  });
}

/**
 * Track error
 */
export function trackError(
  errorMessage: string,
  errorStack?: string,
  context?: string,
  metadata?: Partial<EventMetadata>
): void {
  trackEvent('error_occurred', {
    errorMessage,
    errorStack,
    errorContext: context,
    ...metadata,
  });
}

// ============================================================================
// USER BEHAVIOR ANALYTICS
// ============================================================================

/**
 * Calculate user behavior metrics
 */
export function calculateUserBehaviorMetrics(userId: string): UserBehaviorMetrics {
  const sessions = loadSessions().filter((s) => s.userId === userId);
  const events = loadEvents().filter((e) => e.userId === userId);

  const totalSessions = sessions.length;
  const totalSessionTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const averageSessionDuration =
    totalSessions > 0 ? Math.floor(totalSessionTime / totalSessions) : 0;
  const averagePageViewsPerSession =
    totalSessions > 0
      ? sessions.reduce((sum, s) => sum + s.pageViews, 0) / totalSessions
      : 0;

  const pageViewEvents = events.filter((e) => e.type === 'page_view');
  const totalPageViews = pageViewEvents.length;

  const articleViewEvents = events.filter((e) => e.type === 'article_view');
  const articleCompleteEvents = events.filter((e) => e.type === 'article_complete');
  const totalArticlesRead = articleCompleteEvents.length;

  const tutorialCompleteEvents = events.filter((e) => e.type === 'tutorial_complete');
  const totalTutorialsCompleted = tutorialCompleteEvents.length;

  const pathCompleteEvents = events.filter((e) => e.type === 'path_complete');
  const totalPathsCompleted = pathCompleteEvents.length;

  const exerciseCompleteEvents = events.filter(
    (e) => e.type === 'exercise_complete' || (e.type === 'exercise_attempt' && e.metadata.completed)
  );
  const totalExercisesCompleted = exerciseCompleteEvents.length;

  const codeExecuteEvents = events.filter((e) => e.type === 'code_execute');
  const totalCodeExecutions = codeExecuteEvents.length;

  const searchEvents = events.filter((e) => e.type === 'search_perform');
  const totalSearches = searchEvents.length;

  const searchClickEvents = events.filter((e) => e.type === 'search_result_click');
  const successfulSearchRate =
    totalSearches > 0 ? (searchClickEvents.length / totalSearches) * 100 : 0;

  // Calculate bounce rate (sessions with only 1 page view)
  const singlePageViewSessions = sessions.filter((s) => s.pageViews === 1).length;
  const bounceRate = totalSessions > 0 ? (singlePageViewSessions / totalSessions) * 100 : 0;

  // Calculate return visits (sessions on different days)
  const uniqueDays = new Set(
    sessions.map((s) => new Date(s.startTime).toDateString())
  ).size;
  const returnVisits = Math.max(0, uniqueDays - 1);

  const lastActivity =
    events.length > 0
      ? new Date(Math.max(...events.map((e) => e.timestamp.getTime())))
      : new Date();

  // Calculate most visited sections
  const sectionVisits = new Map<string, { count: number; time: number }>();
  articleViewEvents.forEach((e) => {
    const section = e.metadata.section || 'uncategorized';
    const current = sectionVisits.get(section) || { count: 0, time: 0 };
    sectionVisits.set(section, {
      count: current.count + 1,
      time: current.time + (e.metadata.readingTime || 0),
    });
  });

  const mostVisitedSections: SectionVisit[] = Array.from(sectionVisits.entries())
    .map(([section, data]) => ({
      section,
      visitCount: data.count,
      totalTimeSpent: data.time,
    }))
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, 5);

  // Calculate preferred content types
  const contentTypes = new Map<AnalyticsContentType, number>();
  events.forEach((e) => {
    if (e.metadata.contentType) {
      contentTypes.set(
        e.metadata.contentType,
        (contentTypes.get(e.metadata.contentType) || 0) + 1
      );
    }
  });

  const totalContentInteractions = Array.from(contentTypes.values()).reduce((a, b) => a + b, 0);
  const preferredContentTypes: ContentTypePreference[] = Array.from(contentTypes.entries())
    .map(([contentType, count]) => ({
      contentType,
      count,
      percentage: totalContentInteractions > 0 ? (count / totalContentInteractions) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Determine preferred difficulty level
  const difficultyCounts = new Map<'beginner' | 'intermediate' | 'advanced', number>();
  events.forEach((e) => {
    if (e.metadata.difficulty) {
      difficultyCounts.set(
        e.metadata.difficulty,
        (difficultyCounts.get(e.metadata.difficulty) || 0) + 1
      );
    }
  });

  const preferredDifficultyLevel =
    Array.from(difficultyCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];

  // Calculate most active time of day
  const hourCounts = new Map<number, number>();
  events.forEach((e) => {
    const hour = e.timestamp.getHours();
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  });

  const mostActiveHour = Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
  const mostActiveTimeOfDay: TimePeriod =
    mostActiveHour !== undefined
      ? mostActiveHour >= 5 && mostActiveHour < 12
        ? 'morning'
        : mostActiveHour >= 12 && mostActiveHour < 17
        ? 'afternoon'
        : mostActiveHour >= 17 && mostActiveHour < 21
        ? 'evening'
        : 'night'
      : 'morning';

  // Calculate most active day of week
  const dayCounts = new Map<number, number>();
  events.forEach((e) => {
    const day = e.timestamp.getDay();
    dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
  });

  const mostActiveDay = Array.from(dayCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
  const days: DayOfWeek[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const mostActiveDayOfWeek: DayOfWeek = mostActiveDay !== undefined ? days[mostActiveDay] : 'monday';

  return {
    userId,
    totalSessions,
    totalSessionTime,
    averageSessionDuration,
    averagePageViewsPerSession,
    totalPageViews,
    totalArticlesRead,
    totalTutorialsCompleted,
    totalPathsCompleted,
    totalExercisesCompleted,
    totalCodeExecutions,
    totalSearches,
    successfulSearchRate,
    bounceRate,
    returnVisits,
    lastActivity,
    mostVisitedSections,
    preferredContentTypes,
    preferredDifficultyLevel,
    mostActiveTimeOfDay,
    mostActiveDayOfWeek,
  };
}

// ============================================================================
// CONTENT PERFORMANCE ANALYTICS
// ============================================================================

/**
 * Calculate content performance metrics for a specific content item
 */
export function calculateContentPerformance(
  contentType: AnalyticsContentType,
  contentId: string,
  contentTitle: string,
  section?: string,
  tags?: string[],
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
): ContentPerformanceMetrics {
  const events = loadEvents();
  const viewEvents = events.filter(
    (e) => e.metadata.contentType === contentType && e.metadata.contentId === contentId
  );

  const totalViews = viewEvents.length;
  const uniqueUsers = new Set(viewEvents.map((e) => e.userId));
  const uniqueViews = uniqueUsers.size;

  const completeEvents = events.filter(
    (e) =>
      (e.type === 'article_complete' ||
        e.type === 'tutorial_complete' ||
        e.type === 'path_complete') &&
      e.metadata.contentId === contentId
  );
  const completions = completeEvents.length;
  const completionRate = totalViews > 0 ? (completions / totalViews) * 100 : 0;

  // Calculate average time spent
  const timeEvents = events.filter(
    (e) => e.metadata.contentId === contentId && e.metadata.readingTime
  );
  const totalTimeSpent = timeEvents.reduce((sum, e) => sum + (e.metadata.readingTime || 0), 0);
  const averageTimeSpent = timeEvents.length > 0 ? totalTimeSpent / timeEvents.length : 0;

  // Calculate average scroll depth
  const scrollEvents = events.filter(
    (e) => e.metadata.contentId === contentId && e.metadata.scrollDepth !== undefined
  );
  const totalScrollDepth = scrollEvents.reduce(
    (sum, e) => sum + (e.metadata.scrollDepth || 0),
    0
  );
  const averageScrollDepth = scrollEvents.length > 0 ? totalScrollDepth / scrollEvents.length : 0;

  // Calculate bounce rate (single page view sessions)
  const sessionIds = new Set(viewEvents.map((e) => e.sessionId));
  let bounceCount = 0;
  sessionIds.forEach((sessionId) => {
    const sessionEvents = viewEvents.filter((e) => e.sessionId === sessionId);
    if (sessionEvents.length === 1) {
      bounceCount++;
    }
  });
  const bounceRate = sessionIds.size > 0 ? (bounceCount / sessionIds.size) * 100 : 0;

  // Calculate exit rate (sessions that ended on this content)
  const sessions = loadSessions();
  const sessionsEndingHere = sessions.filter(
    (s) => s.exitPage?.includes(contentId) || false
  ).length;
  const exitRate = sessionIds.size > 0 ? (sessionsEndingHere / sessionIds.size) * 100 : 0;

  // Count search referrals
  const searchReferrals = events.filter(
    (e) =>
      e.type === 'search_result_click' && e.metadata.clickedResultId === contentId
  ).length;

  const lastViewed =
    viewEvents.length > 0
      ? new Date(Math.max(...viewEvents.map((e) => e.timestamp.getTime())))
      : new Date();

  // Determine if trending (high views in last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentViews = viewEvents.filter((e) => e.timestamp > oneDayAgo).length;
  const trending = recentViews >= 10;

  return {
    contentType,
    contentId,
    contentTitle,
    section,
    totalViews,
    uniqueViews,
    completions,
    completionRate,
    averageTimeSpent,
    averageScrollDepth,
    bounceRate,
    exitRate,
    shares: 0, // Not tracked yet
    bookmarks: 0, // Not tracked yet
    searchReferrals,
    lastViewed,
    trending,
    difficulty,
    tags: tags || [],
  };
}

/**
 * Get top performing content
 */
export function getTopContent(
  contentType?: AnalyticsContentType,
  limit: number = 10
): ContentPerformanceMetrics[] {
  // This would need content catalog to be passed in
  // For now, return empty array
  return [];
}

// ============================================================================
// PLATFORM ANALYTICS
// ============================================================================

/**
 * Get platform-wide analytics
 */
export function getPlatformAnalytics(timeframe: AnalyticsTimeframe): PlatformAnalytics {
  const sessions = loadSessions();
  const events = loadEvents();

  const { startDate, endDate } = getDateRangeForTimeframe(timeframe);
  const filteredEvents = filterEventsByDate(events, startDate, endDate);
  const filteredSessions = filterSessionsByDate(sessions, startDate, endDate);

  // Calculate user metrics
  const uniqueUsers = new Set(filteredEvents.map((e) => e.userId));
  const totalUsers = uniqueUsers.size;

  // Active users (users with events in timeframe)
  const activeUsers = totalUsers;

  // Calculate new users (first session in timeframe)
  const existingUsers = new Set(
    sessions
      .filter((s) => s.startTime < startDate)
      .map((s) => s.userId)
  );
  const newUsers = uniqueUsers.size - existingUsers.size;

  // Calculate session metrics
  const totalSessions = filteredSessions.length;
  const totalSessionTime = filteredSessions.reduce(
    (sum, s) => sum + (s.duration || 0),
    0
  );
  const averageSessionDuration =
    totalSessions > 0 ? Math.floor(totalSessionTime / totalSessions) : 0;

  // Calculate page views
  const pageViewEvents = filteredEvents.filter((e) => e.type === 'page_view');
  const totalPageViews = pageViewEvents.length;

  // Calculate bounce rate
  const singlePageViewSessions = filteredSessions.filter((s) => s.pageViews === 1).length;
  const bounceRate =
    totalSessions > 0 ? (singlePageViewSessions / totalSessions) * 100 : 0;

  // Get top searches
  const searchEvents = filteredEvents.filter((e) => e.type === 'search_perform');
  const searchCounts = new Map<string, number>();
  searchEvents.forEach((e) => {
    const query = e.metadata.searchQuery || '';
    searchCounts.set(query, (searchCounts.get(query) || 0) + 1);
  });
  const topSearches: TopSearchItem[] = Array.from(searchCounts.entries())
    .filter(([query]) => query.length > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([query, searchCount]) => {
      const clickEvents = filteredEvents.filter(
        (e) => e.type === 'search_result_click' && e.metadata.searchQuery === query
      );
      const clickRate = searchCount > 0 ? (clickEvents.length / searchCount) * 100 : 0;
      const avgPosition =
        clickEvents.length > 0
          ? clickEvents.reduce(
              (sum, e) => sum + (e.metadata.resultPosition || 0),
              0
            ) / clickEvents.length
          : 0;
      return {
        query,
        searchCount,
        clickRate,
        averageResultPosition: avgPosition,
      };
    });

  // Get top errors
  const errorEvents = filteredEvents.filter((e) => e.type === 'error_occurred');
  const errorCounts = new Map<string, { count: number; lastOccurred: Date; pages: Set<string> }>();
  errorEvents.forEach((e) => {
    const message = e.metadata.errorMessage || 'Unknown error';
    const existing = errorCounts.get(message);
    if (existing) {
      existing.count++;
      existing.lastOccurred = e.timestamp > existing.lastOccurred ? e.timestamp : existing.lastOccurred;
      existing.pages.add(e.page);
    } else {
      errorCounts.set(message, {
        count: 1,
        lastOccurred: e.timestamp,
        pages: new Set([e.page]),
      });
    }
  });
  const topErrors: ErrorMetric[] = Array.from(errorCounts.entries())
    .map(([errorMessage, data]) => ({
      errorMessage,
      count: data.count,
      lastOccurred: data.lastOccurred,
      affectedPages: Array.from(data.pages),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Calculate conversion rates (placeholder - would need more data)
  const conversionRates: ConversionMetrics = {
    visitorToSignup: 0,
    articleToTutorial: 0,
    tutorialToPath: 0,
    pathToCompletion: 0,
  };

  // Calculate engagement metrics
  const totalArticlesRead = filteredEvents.filter((e) => e.type === 'article_complete').length;
  const totalTutorialsCompleted = filteredEvents.filter((e) => e.type === 'tutorial_complete').length;
  const totalPathsCompleted = filteredEvents.filter((e) => e.type === 'path_complete').length;

  const engagementMetrics: EngagementMetrics = {
    averagePageViewsPerSession:
      totalSessions > 0 ? totalPageViews / totalSessions : 0,
    averageSessionDuration,
    averageArticlesPerSession:
      totalSessions > 0 ? totalArticlesRead / totalSessions : 0,
    averageTutorialsPerSession:
      totalSessions > 0 ? totalTutorialsCompleted / totalSessions : 0,
    returnUserRate: 0, // Would need cross-period comparison
    averageTimeBetweenSessions: 0, // Would need more complex calculation
  };

  // Calculate content performance by type
  const articleEvents = filteredEvents.filter((e) => e.metadata.contentType === 'article');
  const tutorialEvents = filteredEvents.filter((e) => e.metadata.contentType === 'tutorial');
  const pathEvents = filteredEvents.filter((e) => e.metadata.contentType === 'path');
  const exerciseEvents = filteredEvents.filter((e) => e.metadata.contentType === 'exercise');

  const contentPerformance: ContentTypeMetrics = {
    articles: calculateContentTypeStats(articleEvents, filteredEvents),
    tutorials: calculateContentTypeStats(tutorialEvents, filteredEvents),
    paths: calculateContentTypeStats(pathEvents, filteredEvents),
    exercises: calculateContentTypeStats(exerciseEvents, filteredEvents),
  };

  // Calculate retention metrics (placeholder)
  const retentionMetrics: RetentionMetrics = {
    day1: 0,
    day7: 0,
    day30: 0,
    averageSessionBeforeChurn: 0,
  };

  return {
    timeframe,
    totalUsers,
    activeUsers,
    newUsers,
    totalSessions,
    totalPageViews,
    averageSessionDuration,
    bounceRate,
    topContent: [], // Would need content catalog
    topSearches,
    topErrors,
    conversionRates,
    engagementMetrics,
    contentPerformance,
    userRetention: retentionMetrics,
  };
}

/**
 * Calculate statistics for a content type
 */
function calculateContentTypeStats(
  typeEvents: AnalyticsEvent[],
  allEvents: AnalyticsEvent[]
): ContentTypeStats {
  const totalViews = typeEvents.length;
  const uniqueUsers = new Set(typeEvents.map((e) => e.userId));
  const uniqueViews = uniqueUsers.size;

  const completeEvents = typeEvents.filter((e) =>
    e.type.endsWith('_complete')
  );
  const completions = completeEvents.length;
  const completionRate = totalViews > 0 ? (completions / totalViews) * 100 : 0;

  const timeEvents = typeEvents.filter((e) => e.metadata.readingTime);
  const totalTimeSpent = timeEvents.reduce((sum, e) => sum + (e.metadata.readingTime || 0), 0);
  const averageTimeSpent = timeEvents.length > 0 ? totalTimeSpent / timeEvents.length : 0;

  // Get top content IDs
  const contentCounts = new Map<string, number>();
  typeEvents.forEach((e) => {
    if (e.metadata.contentId) {
      contentCounts.set(e.metadata.contentId, (contentCounts.get(e.metadata.contentId) || 0) + 1);
    }
  });
  const topContent = Array.from(contentCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  return {
    totalViews,
    uniqueViews,
    completions,
    completionRate,
    averageTimeSpent,
    topContent,
  };
}

// ============================================================================
// REAL-TIME ANALYTICS
// ============================================================================

/**
 * Get real-time analytics
 */
export function getRealTimeAnalytics(): RealTimeAnalytics {
  const sessions = loadSessions();
  const events = loadEvents();

  // Active sessions are those without end time or started within last 30 minutes
  const now = Date.now();
  const activeSessions = sessions.filter(
    (s) =>
      !s.endTime || (now - new Date(s.endTime).getTime() < SESSION_TIMEOUT)
  );

  const currentUsers = activeSessions.length;

  // Get top pages
  const pageViews = new Map<string, { visitors: Set<string>; totalTime: number }>();
  events
    .filter((e) => e.type === 'page_view')
    .forEach((e) => {
      const existing = pageViews.get(e.page);
      if (existing) {
        existing.visitors.add(e.userId);
        existing.totalTime += e.metadata.readingTime || 0;
      } else {
        pageViews.set(e.page, {
          visitors: new Set([e.userId]),
          totalTime: e.metadata.readingTime || 0,
        });
      }
    });

  const topPages: RealTimePage[] = Array.from(pageViews.entries())
    .map(([page, data]) => ({
      page,
      visitors: data.visitors.size,
      avgTimeOnPage: data.visitors.size > 0 ? data.totalTime / data.visitors.size : 0,
    }))
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 10);

  // Get recent events
  const recentEvents = events.slice(0, 50);

  return {
    currentUsers,
    activeSessions: activeSessions.slice(0, REAL_TIME_SESSION_LIMIT),
    topPages,
    recentEvents,
  };
}

// ============================================================================
// ANALYTICS REPORTS
// ============================================================================

/**
 * Generate analytics report
 */
export function generateAnalyticsReport(
  timeframe: AnalyticsTimeframe,
  title?: string,
  description?: string
): AnalyticsReport {
  const platformAnalytics = getPlatformAnalytics(timeframe);
  const insights = generateAnalyticsInsights(platformAnalytics);

  return {
    title: title || `Analytics Report: ${timeframe.replace(/_/g, ' ')}`,
    description: description || `Comprehensive analytics report for ${timeframe.replace(/_/g, ' ')}`,
    generatedAt: new Date(),
    timeframe,
    summary: platformAnalytics,
    topContent: [], // Would need content catalog
    userBehavior: [], // Would need user list
    insights,
    recommendations: generateRecommendations(insights),
  };
}

/**
 * Generate insights from analytics data
 */
function generateAnalyticsInsights(
  analytics: PlatformAnalytics
): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = [];

  // Engagement insights
  if (analytics.averageSessionDuration > 300) {
    insights.push({
      type: 'positive',
      category: 'engagement',
      title: 'High user engagement',
      description: `Average session duration is ${Math.floor(analytics.averageSessionDuration / 60)} minutes`,
      metric: 'averageSessionDuration',
      value: analytics.averageSessionDuration,
      impact: 'high',
    });
  } else if (analytics.averageSessionDuration < 120) {
    insights.push({
      type: 'negative',
      category: 'engagement',
      title: 'Low session duration',
      description: 'Average session duration is below 2 minutes',
      metric: 'averageSessionDuration',
      value: analytics.averageSessionDuration,
      impact: 'high',
    });
  }

  // Bounce rate insights
  if (analytics.bounceRate > 60) {
    insights.push({
      type: 'negative',
      category: 'engagement',
      title: 'High bounce rate',
      description: `${Math.floor(analytics.bounceRate)}% of users leave after viewing a single page`,
      metric: 'bounceRate',
      value: analytics.bounceRate,
      impact: 'high',
    });
  } else if (analytics.bounceRate < 40) {
    insights.push({
      type: 'positive',
      category: 'engagement',
      title: 'Low bounce rate',
      description: 'Users are engaging with multiple pages per session',
      metric: 'bounceRate',
      value: analytics.bounceRate,
      impact: 'medium',
    });
  }

  // Content performance insights
  const tutorialCompletionRate = analytics.contentPerformance.tutorials.completionRate;
  if (tutorialCompletionRate > 50) {
    insights.push({
      type: 'positive',
      category: 'content',
      title: 'High tutorial completion rate',
      description: `${Math.floor(tutorialCompletionRate)}% of users complete tutorials`,
      metric: 'tutorialCompletionRate',
      value: tutorialCompletionRate,
      impact: 'high',
    });
  } else if (tutorialCompletionRate < 20) {
    insights.push({
      type: 'negative',
      category: 'content',
      title: 'Low tutorial completion rate',
      description: 'Most users are not finishing tutorials',
      metric: 'tutorialCompletionRate',
      value: tutorialCompletionRate,
      impact: 'high',
    });
  }

  // Error insights
  if (analytics.topErrors.length > 0) {
    insights.push({
      type: 'negative',
      category: 'error',
      title: 'Errors detected',
      description: `${analytics.topErrors.length} unique errors occurred in this period`,
      metric: 'errorCount',
      value: analytics.topErrors.length,
      impact: analytics.topErrors[0].count > 10 ? 'high' : 'medium',
    });
  }

  return insights;
}

/**
 * Generate recommendations based on insights
 */
function generateRecommendations(insights: AnalyticsInsight[]): string[] {
  const recommendations: string[] = [];

  insights.forEach((insight) => {
    switch (insight.category) {
      case 'engagement':
        if (insight.type === 'negative') {
          if (insight.metric === 'averageSessionDuration') {
            recommendations.push(
              'Consider adding more interactive content to increase session duration',
              'Improve content discoverability with better navigation'
            );
          } else if (insight.metric === 'bounceRate') {
            recommendations.push(
              'Add related content suggestions at the end of articles',
              'Improve internal linking between related topics'
            );
          }
        }
        break;
      case 'content':
        if (insight.metric === 'tutorialCompletionRate' && insight.type === 'negative') {
          recommendations.push(
            'Review tutorial difficulty and adjust prerequisites',
            'Add more checkpoints and progress indicators in tutorials',
            'Provide better hints and guidance for difficult exercises'
          );
        }
        break;
      case 'error':
        recommendations.push(
          `Prioritize fixing the most frequent error: "${insight.title}"`,
          'Implement error tracking to identify patterns'
        );
        break;
    }
  });

  return Array.from(new Set(recommendations)).slice(0, 5);
}

// ============================================================================
// TIME SERIES ANALYTICS
// ============================================================================

/**
 * Generate time series data for a metric
 */
export function generateTimeSeriesData(
  metric: 'page_views' | 'sessions' | 'users' | 'completions',
  period: AggregationPeriod,
  timeframe: AnalyticsTimeframe
): TimeSeriesData {
  const events = loadEvents();
  const sessions = loadSessions();
  const { startDate, endDate } = getDateRangeForTimeframe(timeframe);

  const filteredEvents = filterEventsByDate(events, startDate, endDate);
  const filteredSessions = filterSessionsByDate(sessions, startDate, endDate);

  const dataPoints = new Map<string, TimeSeriesPoint>();
  const now = new Date();

  // Generate all time points in range
  // eslint-disable-next-line prefer-const
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const key = getTimePeriodKey(currentDate, period);
    dataPoints.set(key, {
      timestamp: new Date(currentDate),
      value: 0,
      label: formatTimePeriodLabel(currentDate, period),
    });

    // Advance to next period
    switch (period) {
      case 'hour':
        currentDate.setHours(currentDate.getHours() + 1);
        break;
      case 'day':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'week':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'month':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'year':
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;
    }
  }

  // Count events/sessions by time period
  switch (metric) {
    case 'page_views':
      filteredEvents
        .filter((e) => e.type === 'page_view')
        .forEach((e) => {
          const key = getTimePeriodKey(e.timestamp, period);
          const point = dataPoints.get(key);
          if (point) {
            point.value++;
          }
        });
      break;
    case 'sessions':
      filteredSessions.forEach((s) => {
        const key = getTimePeriodKey(s.startTime, period);
        const point = dataPoints.get(key);
        if (point) {
          point.value++;
        }
      });
      break;
    case 'users':
      filteredEvents.forEach((e) => {
        const key = getTimePeriodKey(e.timestamp, period);
        const point = dataPoints.get(key);
        if (point) {
          // Count unique users
          point.value = Math.max(point.value, 1); // Simplified
        }
      });
      break;
    case 'completions':
      filteredEvents
        .filter((e) => e.type.endsWith('_complete'))
        .forEach((e) => {
          const key = getTimePeriodKey(e.timestamp, period);
          const point = dataPoints.get(key);
          if (point) {
            point.value++;
          }
        });
      break;
  }

  return {
    period,
    data: Array.from(dataPoints.values()).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
  };
}

/**
 * Get key for time period aggregation
 */
function getTimePeriodKey(date: Date, period: AggregationPeriod): string {
  switch (period) {
    case 'hour':
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
    case 'day':
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    case 'week':
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
    case 'month':
      return `${date.getFullYear()}-${date.getMonth()}`;
    case 'year':
      return `${date.getFullYear()}`;
  }
}

/**
 * Format time period label
 */
function formatTimePeriodLabel(date: Date, period: AggregationPeriod): string {
  switch (period) {
    case 'hour':
      return `${date.getHours()}:00`;
    case 'day':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'week':
      return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    case 'month':
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    case 'year':
      return date.getFullYear().toString();
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get user ID from localStorage
 */
function getUserId(): string {
  let userId = localStorage.getItem('vibe-wiki-user-id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem('vibe-wiki-user-id', userId);
  }
  return userId;
}

/**
 * Generate session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Generate event ID
 */
function generateEventId(): string {
  return `event_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get device information
 */
function getDeviceInfo(): DeviceInfo {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const screenResolution = `${window.screen.width}x${window.screen.height}`;
  const viewportSize = `${window.innerWidth}x${window.innerHeight}`;

  // Detect browser
  let browser = 'unknown';
  if (userAgent.includes('Firefox')) browser = 'firefox';
  else if (userAgent.includes('Chrome')) browser = 'chrome';
  else if (userAgent.includes('Safari')) browser = 'safari';
  else if (userAgent.includes('Edge')) browser = 'edge';

  // Detect device type
  let deviceType: 'desktop' | 'tablet' | 'mobile' = 'desktop';
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    deviceType = 'mobile';
  } else if (/iPad|Android(?!.*Mobile)/i.test(userAgent)) {
    deviceType = 'tablet';
  }

  // Check for touch support - verify the property has a meaningful value
  // 'ontouchstart' in window checks existence, but we also need to verify it's not null/undefined
  const hasTouchEventHandler = window.ontouchstart !== null && window.ontouchstart !== undefined;
  const isTouchDevice = hasTouchEventHandler || navigator.maxTouchPoints > 0;

  return {
    userAgent,
    platform,
    browser,
    screenResolution,
    viewportSize,
    deviceType,
    isTouchDevice,
  };
}

/**
 * Get date range for timeframe
 */
function getDateRangeForTimeframe(timeframe: AnalyticsTimeframe): {
  startDate: Date;
  endDate: Date;
} {
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  const startDate = new Date();

  switch (timeframe) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'yesterday':
      startDate.setDate(now.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(now.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'last_7_days':
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'last_30_days':
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'last_90_days':
      startDate.setDate(now.getDate() - 90);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'all_time':
      startDate.setFullYear(2020, 0, 1); // Arbitrary past date
      startDate.setHours(0, 0, 0, 0);
      break;
  }

  return { startDate, endDate };
}

/**
 * Filter events by date range
 */
function filterEventsByDate(
  events: AnalyticsEvent[],
  startDate: Date,
  endDate: Date
): AnalyticsEvent[] {
  return events.filter(
    (e) => e.timestamp >= startDate && e.timestamp <= endDate
  );
}

/**
 * Filter sessions by date range
 */
function filterSessionsByDate(
  sessions: AnalyticsSession[],
  startDate: Date,
  endDate: Date
): AnalyticsSession[] {
  return sessions.filter(
    (s) => s.startTime >= startDate && s.startTime <= endDate
  );
}

// ============================================================================
// CONSENT MANAGEMENT
// ============================================================================

/**
 * Check if user has consented to analytics
 */
export function hasConsent(): boolean {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return true; // Default to true for now
    const consent = JSON.parse(stored);
    return consent.granted === true;
  } catch {
    return true;
  }
}

/**
 * Set analytics consent
 */
export function setConsent(granted: boolean): void {
  try {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        granted,
        grantedAt: granted ? new Date().toISOString() : undefined,
        revokedAt: !granted ? new Date().toISOString() : undefined,
      })
    );
  } catch (error) {
    console.error('Failed to set consent:', error);
  }
}

/**
 * Clear all analytics data
 */
export function clearAnalyticsData(): void {
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem(EVENTS_KEY);
  localStorage.removeItem(CURRENT_SESSION_KEY);
}
