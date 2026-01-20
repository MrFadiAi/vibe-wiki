/**
 * User Testing Feedback Types
 * Types for collecting and analyzing feedback from user testing sessions
 */

/**
 * User role in the testing session
 */
export type TesterRole =
  | 'complete_beginner'
  | 'traditional_developer'
  | 'ai_tool_user'
  | 'domain_expert'
  | 'student'
  | 'educator';

/**
 * Difficulty level reported by tester
 */
export type DifficultyRating = 'very_easy' | 'easy' | 'moderate' | 'difficult' | 'very_difficult';

/**
 * Satisfaction rating
 */
export type SatisfactionRating = 1 | 2 | 3 | 4 | 5;

/**
 * Task completion status
 */
export type TaskCompletionStatus = 'completed' | 'completed_with_help' | 'abandoned' | 'skipped';

/**
 * Issue severity
 */
export type IssueSeverity = 'critical' | 'major' | 'minor' | 'cosmetic';

/**
 * Issue category
 */
export type IssueCategory =
  | 'navigation'
  | 'content_clarity'
  | 'technical_error'
  | 'accessibility'
  | 'performance'
  | 'ui_ux'
  | 'language_translation'
  | 'code_example'
  | 'broken_link'
  | 'other';

/**
 * Individual testing task
 */
export interface TestingTask {
  id: string;
  title: string;
  description: string;
  targetPage: string;
  expectedOutcome: string;
  maxDuration: number; // in minutes
  order: number;
  optional?: boolean;
}

/**
 * Issue reported during testing
 */
export interface TestingIssue {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  title: string;
  description: string;
  stepsToReproduce?: string[];
  expectedBehavior?: string;
  actualBehavior?: string;
  page?: string;
  screenshot?: string;
  browser?: string;
  device?: string;
  timestamp: Date;
  testerId: string;
  taskId?: string;
}

/**
 * Task completion result
 */
export interface TaskResult {
  taskId: string;
  status: TaskCompletionStatus;
  duration: number; // in seconds
  difficultyRating: DifficultyRating;
  comments?: string;
  abandonedReason?: string;
}

/**
 * Session feedback
 */
export interface SessionFeedback {
  sessionId: string;
  overallRating: SatisfactionRating;
  easeOfNavigation: SatisfactionRating;
  contentClarity: SatisfactionRating;
  visualDesign: SatisfactionRating;
  likelihoodToRecommend: number; // 0-10
  whatWorkedWell?: string;
  whatNeedsImprovement?: string;
  featureRequests?: string;
  additionalComments?: string;
}

/**
 * User testing session
 */
export interface UserTestingSession {
  id: string;
  testerId: string;
  testerRole: TesterRole;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  programmingExperience: number; // in years
  age?: number;
  location?: string;
  nativeLanguage?: string;
  tasks: TaskResult[];
  issues: TestingIssue[];
  sessionFeedback?: SessionFeedback;
  startedAt: Date;
  completedAt?: Date;
  browser?: string;
  deviceType?: 'desktop' | 'tablet' | 'mobile';
  screenResolution?: string;
}

/**
 * Create testing task input
 */
export interface CreateTestingTaskInput {
  title: string;
  description: string;
  targetPage: string;
  expectedOutcome: string;
  maxDuration: number;
  order: number;
  optional?: boolean;
}

/**
 * Report issue input
 */
export interface ReportIssueInput {
  category: IssueCategory;
  severity: IssueSeverity;
  title: string;
  description: string;
  stepsToReproduce?: string[];
  expectedBehavior?: string;
  actualBehavior?: string;
  page?: string;
  screenshot?: string;
  taskId?: string;
}

/**
 * Testing session summary
 */
export interface TestingSessionSummary {
  totalSessions: number;
  completedSessions: number;
  averageSessionDuration: number;
  taskCompletionRate: number;
  averageRating: number;
  issuesBySeverity: Record<IssueSeverity, number>;
  issuesByCategory: Record<IssueCategory, number>;
  topIssues: TestingIssue[];
  commonPainPoints: string[];
  recommendations: string[];
}

/**
 * User persona for testing
 */
export interface UserPersona {
  id: string;
  name: string;
  role: TesterRole;
  description: string;
  goals: string[];
  painPoints: string[];
  technicalBackground: string;
  targetTasks: string[];
}

/**
 * Feedback category
 */
export type FeedbackCategory =
  | 'usability'
  | 'content'
  | 'performance'
  | 'accessibility'
  | 'feature'
  | 'bug'
  | 'translation'
  | 'other';

/**
 * Feedback priority
 */
export type FeedbackPriority = 'critical' | 'high' | 'medium' | 'low' | 'trivial';

/**
 * Feedback status
 */
export type FeedbackStatus =
  | 'pending'
  | 'reviewing'
  | 'accepted'
  | 'rejected'
  | 'in_progress'
  | 'completed';

/**
 * Feedback item
 */
export interface FeedbackItem {
  id: string;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  title: string;
  description: string;
  userId: string;
  sessionId: string | null;
  rating: 1 | 2 | 3 | 4 | 5 | null;
  affectedArea: string | null;
  reproductionSteps: string[] | null;
  expectedBehavior: string | null;
  actualBehavior: string | null;
  screenshots: string[];
  tags: string[];
  upvotes: number;
  createdAt: Date;
  updatedAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  resolution: string | null;
  resolvedAt: Date | null;
}

/**
 * Feedback analysis result
 */
export interface FeedbackAnalysis {
  total: number;
  byStatus: Record<FeedbackStatus, number>;
  byCategory: Record<FeedbackCategory, number>;
  byPriority: Record<FeedbackPriority, number>;
  averageRating: number | null;
  topIssues: Array<{
    id: string;
    title: string;
    category: FeedbackCategory;
    priority: FeedbackPriority;
    status: FeedbackStatus;
    score: number;
    upvotes: number;
    createdAt: Date;
  }>;
  recentTrends: FeedbackTrend[];
  recommendations: ImprovementSuggestion[];
}

/**
 * Feedback trend over time
 */
export interface FeedbackTrend {
  category: FeedbackCategory;
  recentCount: number;
  olderCount: number;
  changePercent: number;
  direction: 'increasing' | 'decreasing' | 'stable';
}

/**
 * Feedback aggregation by time period
 */
export interface FeedbackAggregation {
  period: string;
  total: number;
  byCategory: Record<FeedbackCategory, number>;
  byPriority: Record<FeedbackPriority, number>;
  byStatus: Record<FeedbackStatus, number>;
  averageRating: number | null;
}

/**
 * Iteration action
 */
export interface IterationAction {
  id: string;
  type: 'immediate' | 'short-term' | 'long-term';
  priority: FeedbackPriority;
  title: string;
  description: string;
  feedbackIds: string[];
  estimatedEffort: string;
  assignedTo: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
}

/**
 * Improvement suggestion
 */
export interface ImprovementSuggestion {
  type: 'immediate' | 'short-term' | 'long-term' | 'process';
  category: string;
  title: string;
  description: string;
  priority: FeedbackPriority;
  affectedAreas: string[];
}
