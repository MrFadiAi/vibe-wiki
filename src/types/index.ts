// SVG Diagram types (re-exported from svg-utils.ts)
export type {
  SVGDiagram,
  SVGMetadata,
} from './svg-utils';

// Core article types
export interface WikiArticle {
  slug: string;
  title: string;
  section: string;
  content: string;
  codeBlocks?: CodeBlock[];
  visualAssets?: string[]; // SVG file references for diagrams
}

export interface CodeBlock {
  language: string;
  code: string;
  title?: string;
}

export interface WikiSection {
  name: string;
  articles: WikiArticle[];
}

// Tutorial and Exercise types
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface Exercise {
  id: string;
  title: string;
  description: string;
  instruction: string;
  starterCode: string;
  language: string;
  expectedOutput?: string | string[];
  hints?: string[];
  solution?: string;
  testCases?: TestCase[];
}

export interface TestCase {
  description: string;
  input?: unknown;
  expectedOutput: unknown;
}

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  codeExample?: CodeBlock;
  exercise?: Exercise;
  order: number;
}

export interface Tutorial {
  id: string;
  slug: string;
  title: string;
  description: string;
  section: string;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  prerequisites?: string[]; // tutorial slugs
  learningObjectives: string[];
  steps: TutorialStep[];
  tags?: string[];
  author?: string;
}

// Interactive example types
export interface InteractiveExample {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  expectedOutput?: string | string[];
  explanation?: string;
  category?: string;
}

// Learning Path types
export type PathItemType = "article" | "tutorial" | "exercise";

export interface PathItem {
  id: string;
  type: PathItemType;
  slug: string;
  title: string;
  description?: string;
  estimatedMinutes: number;
  isOptional?: boolean;
  order: number;
}

export interface LearningPath {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  targetAudience: string[];
  prerequisites?: string[]; // path slugs or skills
  learningObjectives: string[];
  items: PathItem[];
  tags?: string[];
  category?: string;
  author?: string;
}

export interface PathProgress {
  pathId: string;
  completedItems: string[]; // item ids
  currentItemId?: string;
  startedAt?: Date;
  completedAt?: Date;
}

// User Progress Tracking types
export interface UserProgress {
  userId: string;
  completedArticles: string[]; // article slugs
  completedTutorials: string[]; // tutorial ids
  completedPaths: string[]; // path ids
  currentPathProgress: Record<string, PathProgress>; // pathId -> progress
  currentTutorialProgress: Record<string, TutorialProgress>; // tutorialId -> progress
  achievements: Achievement[];
  totalPoints: number;
  streakDays: number;
  lastActivity: Date;
  createdAt: Date;
}

export interface TutorialProgress {
  tutorialId: string;
  completedSteps: string[]; // step ids
  currentStepId?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'tutorial' | 'path' | 'article' | 'streak' | 'skill';
  points?: number;
}

export interface ProgressStats {
  totalArticlesRead: number;
  totalTutorialsCompleted: number;
  totalPathsCompleted: number;
  totalTimeSpent: number; // in minutes
  currentStreak: number;
  achievementsCount: number;
  totalPoints: number;
  completionRate: number; // percentage
}

export interface ProgressActivity {
  id: string;
  type: 'article_completed' | 'tutorial_completed' | 'path_completed' | 'step_completed' | 'achievement_unlocked';
  contentId: string;
  contentTitle: string;
  timestamp: Date;
  points?: number;
}

// Community Contribution types
export type ContributionType = 'article' | 'tutorial' | 'example' | 'path';
export type ContributionStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'published';
export type ReviewDecision = 'approve' | 'reject' | 'request_changes';
export type ReviewStatusType = 'pending' | 'in_progress' | 'completed';

export interface Contribution {
  id: string;
  type: ContributionType;
  title: string;
  description: string;
  content: string;
  authorId: string;
  status: ContributionStatus;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewerId?: string;
  reviewNotes?: string[];
  rejectionReason?: string;
  tags?: string[];
  categoryId?: string;
  difficulty?: DifficultyLevel;
  estimatedMinutes?: number;
  // Tutorial-specific fields
  steps?: TutorialStep[];
  learningObjectives?: string[];
  prerequisites?: string[];
  // Path-specific fields
  targetAudience?: string[];
  items?: PathItem[];
}

export interface CreateContributionInput {
  type: ContributionType;
  title: string;
  description: string;
  content: string;
  authorId: string;
  tags?: string[];
  categoryId?: string;
  difficulty?: DifficultyLevel;
  estimatedMinutes?: number;
  steps?: Omit<TutorialStep, 'id'>[];
  learningObjectives?: string[];
  prerequisites?: string[];
  targetAudience?: string[];
  items?: Omit<PathItem, 'id'>[];
}

export interface UpdateContributionInput {
  title?: string;
  description?: string;
  content?: string;
  tags?: string[];
  categoryId?: string;
  difficulty?: DifficultyLevel;
  estimatedMinutes?: number;
  steps?: TutorialStep[];
  learningObjectives?: string[];
  prerequisites?: string[];
  targetAudience?: string[];
  items?: PathItem[];
}

export interface Review {
  id: string;
  contributionId: string;
  reviewerId: string;
  status: ReviewStatusType;
  decision?: ReviewDecision;
  comments: ReviewComment[];
  createdAt: Date;
  completedAt?: Date;
}

export interface ReviewComment {
  id: string;
  reviewerId: string;
  content: string;
  line?: number;
  type: 'suggestion' | 'issue' | 'question';
  createdAt: Date;
}

export interface ContributorProfile {
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  avatar?: string;
  social?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
  reputation: number;
  contributionsCount: number;
  approvedSubmissions: number;
  pendingSubmissions: number;
  averageReviewTime?: number;
  badges: ContributorBadge[];
  expertise: string[];
  preferredCategories: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContributorBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  earnedAt: Date;
}

export interface Draft {
  id: string;
  authorId: string;
  type: ContributionType;
  title: string;
  content: string;
  lastSavedAt: Date;
  autoSaved: boolean;
  versions: DraftVersion[];
}

export interface DraftVersion {
  id: string;
  content: string;
  savedAt: Date;
  changeSummary?: string;
}

export interface ContributionFilterOptions {
  status?: ContributionStatus[];
  type?: ContributionType[];
  authorId?: string;
  tags?: string[];
  categoryId?: string;
  difficulty?: DifficultyLevel[];
  searchQuery?: string;
  sortBy?: 'recent' | 'oldest' | 'title' | 'reputation';
  limit?: number;
  offset?: number;
}

export interface ContributionStats {
  totalContributions: number;
  pendingReview: number;
  approvedContributions: number;
  rejectedContributions: number;
  draftContributions: number;
  averageReviewTime: number;
  topContributors: ContributorProfile[];
}

// Analytics types - re-exported from analytics.ts
export type {
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
} from './analytics';

// User Testing types - re-exported from user-testing.ts
export type {
  TesterRole,
  DifficultyRating,
  SatisfactionRating,
  TaskCompletionStatus,
  IssueSeverity,
  IssueCategory,
  TestingTask,
  TestingIssue,
  TaskResult,
  SessionFeedback,
  UserTestingSession,
  CreateTestingTaskInput,
  ReportIssueInput,
  TestingSessionSummary,
  UserPersona,
} from './user-testing';
