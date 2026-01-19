/**
 * Analytics Types for Vibe Wiki
 * Comprehensive analytics tracking for user behavior, content performance, and platform metrics
 */

// Event types for tracking
export type AnalyticsEventType =
  | 'page_view'
  | 'article_view'
  | 'article_complete'
  | 'tutorial_start'
  | 'tutorial_step_complete'
  | 'tutorial_complete'
  | 'path_start'
  | 'path_item_complete'
  | 'path_complete'
  | 'search_perform'
  | 'search_result_click'
  | 'code_execute'
  | 'exercise_attempt'
  | 'exercise_complete'
  | 'contribution_submit'
  | 'contribution_approve'
  | 'achievement_unlock'
  | 'session_start'
  | 'session_end'
  | 'error_occurred';

// Content types
export type AnalyticsContentType = 'article' | 'tutorial' | 'path' | 'exercise' | 'code_example';

// Session tracking
export interface AnalyticsSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  pageViews: number;
  events: AnalyticsEvent[];
  deviceInfo: DeviceInfo;
  exitPage?: string;
}

// Device information
export interface DeviceInfo {
  userAgent: string;
  platform: string;
  browser: string;
  screenResolution: string;
  viewportSize: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  isTouchDevice: boolean;
}

// Base analytics event
export interface AnalyticsEvent {
  id: string;
  sessionId: string;
  userId: string;
  type: AnalyticsEventType;
  timestamp: Date;
  page: string;
  metadata: EventMetadata;
}

// Event-specific metadata
export interface EventMetadata {
  // Common fields
  contentType?: AnalyticsContentType;
  contentId?: string;
  contentTitle?: string;
  section?: string;
  tags?: string[];

  // Article-specific
  readingTime?: number; // in seconds
  scrollDepth?: number; // percentage 0-100
  codeBlocksViewed?: number;
  codeBlocksExecuted?: number;

  // Tutorial-specific
  stepId?: string;
  stepNumber?: number;
  totalSteps?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';

  // Path-specific
  itemId?: string;
  itemCompleted?: number;
  itemTotal?: number;

  // Search-specific
  searchQuery?: string;
  resultsCount?: number;
  resultPosition?: number;
  clickedResultId?: string;

  // Code-specific
  language?: string;
  executionSuccess?: boolean;
  executionTime?: number; // in ms
  errorType?: string;

  // Exercise-specific
  hintsUsed?: number;
  attempts?: number;
  completed?: boolean;

  // Contribution-specific
  contributionType?: 'article' | 'tutorial' | 'example' | 'path';
  contributionId?: string;

  // Achievement-specific
  achievementId?: string;
  achievementTitle?: string;
  points?: number;

  // Session-specific
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;

  // Error-specific
  errorMessage?: string;
  errorStack?: string;
  errorContext?: string;

  // Custom properties
  customProperties?: Record<string, unknown>;
}

// User behavior analytics
export interface UserBehaviorMetrics {
  userId: string;
  totalSessions: number;
  totalSessionTime: number; // in seconds
  averageSessionDuration: number; // in seconds
  averagePageViewsPerSession: number;
  totalPageViews: number;
  totalArticlesRead: number;
  totalTutorialsCompleted: number;
  totalPathsCompleted: number;
  totalExercisesCompleted: number;
  totalCodeExecutions: number;
  totalSearches: number;
  successfulSearchRate: number; // percentage
  bounceRate: number; // percentage
  returnVisits: number;
  lastActivity: Date;
  mostVisitedSections: SectionVisit[];
  preferredContentTypes: ContentTypePreference[];
  preferredDifficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  mostActiveTimeOfDay: TimePeriod;
  mostActiveDayOfWeek: DayOfWeek;
}

export interface SectionVisit {
  section: string;
  visitCount: number;
  totalTimeSpent: number; // in seconds
}

export interface ContentTypePreference {
  contentType: AnalyticsContentType;
  count: number;
  percentage: number;
}

export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// Content performance analytics
export interface ContentPerformanceMetrics {
  contentType: AnalyticsContentType;
  contentId: string;
  contentTitle: string;
  section?: string;
  totalViews: number;
  uniqueViews: number;
  completions: number;
  completionRate: number; // percentage
  averageTimeSpent: number; // in seconds
  averageScrollDepth: number; // percentage
  bounceRate: number; // percentage
  exitRate: number; // percentage
  shares: number;
  bookmarks: number;
  searchReferrals: number;
  lastViewed: Date;
  trending: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

// Platform-wide analytics
export interface PlatformAnalytics {
  timeframe: AnalyticsTimeframe;
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalSessions: number;
  totalPageViews: number;
  averageSessionDuration: number; // in seconds
  bounceRate: number; // percentage
  topContent: ContentPerformanceMetrics[];
  topSearches: TopSearchItem[];
  topErrors: ErrorMetric[];
  conversionRates: ConversionMetrics;
  engagementMetrics: EngagementMetrics;
  contentPerformance: ContentTypeMetrics;
  userRetention: RetentionMetrics;
}

export type AnalyticsTimeframe = 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'last_90_days' | 'all_time';

export interface TopSearchItem {
  query: string;
  searchCount: number;
  clickRate: number; // percentage
  averageResultPosition: number;
}

export interface ErrorMetric {
  errorMessage: string;
  count: number;
  lastOccurred: Date;
  affectedPages: string[];
}

export interface ConversionMetrics {
  visitorToSignup: number; // percentage
  articleToTutorial: number; // percentage
  tutorialToPath: number; // percentage
  pathToCompletion: number; // percentage
}

export interface EngagementMetrics {
  averagePageViewsPerSession: number;
  averageSessionDuration: number; // in seconds
  averageArticlesPerSession: number;
  averageTutorialsPerSession: number;
  returnUserRate: number; // percentage
  averageTimeBetweenSessions: number; // in hours
}

export interface ContentTypeMetrics {
  articles: ContentTypeStats;
  tutorials: ContentTypeStats;
  paths: ContentTypeStats;
  exercises: ContentTypeStats;
}

export interface ContentTypeStats {
  totalViews: number;
  uniqueViews: number;
  completions: number;
  completionRate: number;
  averageTimeSpent: number;
  topContent: string[]; // content IDs
}

export interface RetentionMetrics {
  day1: number; // percentage returning after 1 day
  day7: number; // percentage returning after 7 days
  day30: number; // percentage returning after 30 days
  averageSessionBeforeChurn: number;
}

// Real-time analytics
export interface RealTimeAnalytics {
  currentUsers: number;
  activeSessions: AnalyticsSession[];
  topPages: RealTimePage[];
  recentEvents: AnalyticsEvent[];
  serverLoad?: {
    cpu: number;
    memory: number;
    requestsPerSecond: number;
  };
}

export interface RealTimePage {
  page: string;
  visitors: number;
  avgTimeOnPage: number; // in seconds
}

// Analytics filters and queries
export interface AnalyticsQuery {
  timeframe: AnalyticsTimeframe;
  startDate?: Date;
  endDate?: Date;
  contentType?: AnalyticsContentType[];
  section?: string[];
  eventType?: AnalyticsEventType[];
  userId?: string;
  contentId?: string;
  limit?: number;
  offset?: number;
  sortBy?: AnalyticsSortBy;
  sortOrder?: 'asc' | 'desc';
}

export type AnalyticsSortBy =
  | 'views'
  | 'completions'
  | 'time_spent'
  | 'completion_rate'
  | 'bounce_rate'
  | 'date'
  | 'title';

// Analytics report
export interface AnalyticsReport {
  title: string;
  description: string;
  generatedAt: Date;
  timeframe: AnalyticsTimeframe;
  summary: PlatformAnalytics;
  topContent: ContentPerformanceMetrics[];
  userBehavior: UserBehaviorMetrics[];
  insights: AnalyticsInsight[];
  recommendations: string[];
}

export interface AnalyticsInsight {
  type: 'positive' | 'negative' | 'neutral';
  category: 'engagement' | 'content' | 'performance' | 'user' | 'error';
  title: string;
  description: string;
  metric: string;
  value: number;
  change?: number; // percentage change from previous period
  impact: 'high' | 'medium' | 'low';
}

// Analytics export
export interface AnalyticsExport {
  format: 'json' | 'csv' | 'pdf';
  query: AnalyticsQuery;
  data: unknown;
  generatedAt: Date;
  fileName: string;
}

// Privacy and consent
export interface AnalyticsConsent {
  userId: string;
  granted: boolean;
  grantedAt?: Date;
  revokedAt?: Date;
  purposes: ConsentPurpose[];
}

export interface ConsentPurpose {
  id: string;
  name: string;
  description: string;
  required: boolean;
  granted: boolean;
}

// Aggregation types
export type AggregationPeriod = 'hour' | 'day' | 'week' | 'month' | 'year';

export interface TimeSeriesData {
  period: AggregationPeriod;
  data: TimeSeriesPoint[];
}

export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
  label?: string;
}
