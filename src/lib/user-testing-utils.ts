/**
 * User Testing Utilities
 * Utilities for managing user testing sessions, collecting feedback, and generating reports
 */

import type {
  TestingTask,
  TestingIssue,
  TaskResult,
  SessionFeedback,
  UserTestingSession,
  CreateTestingTaskInput,
  ReportIssueInput,
  TestingSessionSummary,
  UserPersona,
  TesterRole,
  TaskCompletionStatus,
  DifficultyRating,
  SatisfactionRating,
  IssueSeverity,
  IssueCategory,
} from '@/types/user-testing';

// Storage keys
const SESSIONS_KEY = 'vibe-wiki-testing-sessions';
const ISSUES_KEY = 'vibe-wiki-testing-issues';
const TASKS_KEY = 'vibe-wiki-testing-tasks';

// Default testing tasks for newcomer onboarding
const DEFAULT_TESTING_TASKS: TestingTask[] = [
  {
    id: 'task-1',
    title: 'Navigate to Getting Started Guide',
    description: 'Find and navigate to the "Your First 15 Minutes" guide from the homepage.',
    targetPage: '/wiki/your-first-15-minutes',
    expectedOutcome: 'User reaches the guide page within 3 clicks from homepage',
    maxDuration: 5,
    order: 1,
  },
  {
    id: 'task-2',
    title: 'Understand Vibecoding Concept',
    description: 'Read the introduction section and understand what vibecoding is.',
    targetPage: '/wiki/your-first-15-minutes',
    expectedOutcome: 'User can explain the basic concept of vibecoding',
    maxDuration: 10,
    order: 2,
  },
  {
    id: 'task-3',
    title: 'Choose an AI Tool',
    description: 'Use the decision tree to select which AI coding tool to start with.',
    targetPage: '/wiki/your-first-15-minutes',
    expectedOutcome: 'User identifies a suitable tool for their experience level',
    maxDuration: 5,
    order: 3,
  },
  {
    id: 'task-4',
    title: 'Find Tool Installation Guide',
    description: 'Navigate to find the installation guide for your chosen tool.',
    targetPage: '/wiki',
    expectedOutcome: 'User finds the installation instructions',
    maxDuration: 5,
    order: 4,
  },
  {
    id: 'task-5',
    title: 'Understand AI Coding Ecosystem',
    description: 'Read the AI Coding Ecosystem overview and understand the different tool categories.',
    targetPage: '/wiki/ai-coding-ecosystem',
    expectedOutcome: 'User can identify at least 3 categories of AI coding tools',
    maxDuration: 10,
    order: 5,
  },
  {
    id: 'task-6',
    title: 'Explore CLI Tool Documentation',
    description: 'Find and explore documentation for at least one CLI tool.',
    targetPage: '/wiki',
    expectedOutcome: 'User finds CLI tool documentation and understands basic usage',
    maxDuration: 10,
    order: 6,
  },
  {
    id: 'task-7',
    title: 'Use Search Functionality',
    description: 'Use the search to find a specific topic (e.g., "Claude CLI").',
    targetPage: '/search',
    expectedOutcome: 'Search returns relevant results within 2 seconds',
    maxDuration: 3,
    order: 7,
  },
  {
    id: 'task-8',
    title: 'Run Interactive Code Example',
    description: 'Find an article with a code example and try running it.',
    targetPage: '/wiki',
    expectedOutcome: 'User successfully executes code without errors',
    maxDuration: 10,
    order: 8,
    optional: true,
  },
];

// User personas for testing
export const USER_PERSONAS: UserPersona[] = [
  {
    id: 'persona-beginner',
    name: 'Complete Beginner',
    role: 'complete_beginner',
    description: 'Someone with no programming experience wanting to learn coding with AI assistance.',
    goals: ['Learn if AI coding is for them', 'Build their first simple application', 'Understand basic concepts'],
    painPoints: ['Technical jargon', 'Complex installation processes', 'Unclear next steps'],
    technicalBackground: 'None or very limited (maybe basic HTML from years ago)',
    targetTasks: ['task-1', 'task-2', 'task-3', 'task-7'],
  },
  {
    id: 'persona-developer',
    name: 'Traditional Developer',
    role: 'traditional_developer',
    description: 'Experienced programmer (5+ years) new to AI-assisted coding.',
    goals: ['Understand AI workflow differences', 'Choose the right tools', 'Integrate AI into existing workflow'],
    painPoints: ['Too basic explanations', 'Lack of depth in technical content', 'Unclear best practices'],
    technicalBackground: 'Proficient in at least one programming language, understands git, terminals',
    targetTasks: ['task-1', 'task-3', 'task-5', 'task-6', 'task-7'],
  },
  {
    id: 'persona-student',
    name: 'Computer Science Student',
    role: 'student',
    description: 'Currently studying CS, knows programming but new to AI tools.',
    goals: ['Learn industry tools', 'Complete assignments faster', 'Prepare for career'],
    painPoints: ['Academic vs industry gap', 'Tool selection paralysis', 'Limited budget'],
    technicalBackground: 'Knows 1-2 languages, understands data structures and algorithms',
    targetTasks: ['task-2', 'task-3', 'task-5', 'task-6', 'task-8'],
  },
  {
    id: 'persona-educator',
    name: 'Coding Educator',
    role: 'educator',
    description: 'Teacher or mentor looking to incorporate AI tools into curriculum.',
    goals: ['Evaluate tools for teaching', 'Find appropriate learning paths', 'Understand pedagogical approach'],
    painPoints: ['Outdated resources', 'Lack of teaching guides', 'Unclear learning progressions'],
    technicalBackground: 'Strong programming background, teaching experience',
    targetTasks: ['task-2', 'task-5', 'task-6', 'task-8'],
  },
];

/**
 * Load testing sessions from localStorage
 */
export function loadTestingSessions(): UserTestingSession[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(SESSIONS_KEY);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    return parsed.map((session: any) => ({
      ...session,
      startedAt: new Date(session.startedAt),
      completedAt: session.completedAt ? new Date(session.completedAt) : undefined,
      tasks: session.tasks.map((task: any) => ({
        ...task,
        duration: Number(task.duration),
      })),
      issues: session.issues?.map((issue: any) => ({
        ...issue,
        timestamp: new Date(issue.timestamp),
      })) || [],
    }));
  } catch {
    return [];
  }
}

/**
 * Save testing sessions to localStorage
 */
function saveTestingSessions(sessions: UserTestingSession[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

/**
 * Create a new testing session
 */
export function createTestingSession(
  testerId: string,
  testerRole: TesterRole,
  experienceLevel: 'beginner' | 'intermediate' | 'advanced',
  programmingExperience: number,
  metadata?: Partial<Pick<UserTestingSession, 'age' | 'location' | 'nativeLanguage' | 'browser' | 'deviceType' | 'screenResolution'>>
): UserTestingSession {
  const session: UserTestingSession = {
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    testerId,
    testerRole,
    experienceLevel,
    programmingExperience,
    ...metadata,
    tasks: [],
    issues: [],
    startedAt: new Date(),
  };

  const sessions = loadTestingSessions();
  sessions.push(session);
  saveTestingSessions(sessions);

  return session;
}

/**
 * Get a testing session by ID
 */
export function getTestingSession(sessionId: string): UserTestingSession | null {
  const sessions = loadTestingSessions();
  return sessions.find(s => s.id === sessionId) || null;
}

/**
 * Complete a task in a testing session
 */
export function completeTask(
  sessionId: string,
  taskId: string,
  status: TaskCompletionStatus,
  duration: number,
  difficultyRating: DifficultyRating,
  comments?: string,
  abandonedReason?: string
): UserTestingSession | null {
  const sessions = loadTestingSessions();
  const sessionIndex = sessions.findIndex(s => s.id === sessionId);

  if (sessionIndex === -1) return null;

  const taskResult: TaskResult = {
    taskId,
    status,
    duration,
    difficultyRating,
    comments,
    abandonedReason,
  };

  // Update or add task result
  const existingTaskIndex = sessions[sessionIndex].tasks.findIndex(t => t.taskId === taskId);
  if (existingTaskIndex >= 0) {
    sessions[sessionIndex].tasks[existingTaskIndex] = taskResult;
  } else {
    sessions[sessionIndex].tasks.push(taskResult);
  }

  saveTestingSessions(sessions);
  return sessions[sessionIndex];
}

/**
 * Report an issue during testing
 */
export function reportIssue(
  sessionId: string,
  testerId: string,
  issueInput: ReportIssueInput
): TestingIssue {
  const issue: TestingIssue = {
    id: `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...issueInput,
    timestamp: new Date(),
    testerId,
  };

  const sessions = loadTestingSessions();
  const sessionIndex = sessions.findIndex(s => s.id === sessionId);

  if (sessionIndex !== -1) {
    sessions[sessionIndex].issues.push(issue);
    saveTestingSessions(sessions);
  }

  // Also save to issues list
  const issues = loadIssues();
  issues.push(issue);
  saveIssues(issues);

  return issue;
}

/**
 * Submit session feedback
 */
export function submitSessionFeedback(
  sessionId: string,
  feedback: Omit<SessionFeedback, 'sessionId'>
): UserTestingSession | null {
  const sessions = loadTestingSessions();
  const sessionIndex = sessions.findIndex(s => s.id === sessionId);

  if (sessionIndex === -1) return null;

  sessions[sessionIndex].sessionFeedback = {
    sessionId,
    ...feedback,
  };
  sessions[sessionIndex].completedAt = new Date();

  saveTestingSessions(sessions);
  return sessions[sessionIndex];
}

/**
 * Load all issues
 */
function loadIssues(): TestingIssue[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(ISSUES_KEY);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    return parsed.map((issue: any) => ({
      ...issue,
      timestamp: new Date(issue.timestamp),
    }));
  } catch {
    return [];
  }
}

/**
 * Save issues to localStorage
 */
function saveIssues(issues: TestingIssue[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
}

/**
 * Get default testing tasks
 */
export function getDefaultTestingTasks(): TestingTask[] {
  return DEFAULT_TESTING_TASKS;
}

/**
 * Get testing tasks for a specific persona
 */
export function getTasksForPersona(personaId: string): TestingTask[] {
  const persona = USER_PERSONAS.find(p => p.id === personaId);
  if (!persona) return DEFAULT_TESTING_TASKS;

  return DEFAULT_TESTING_TASKS.filter(task =>
    persona.targetTasks.includes(task.id)
  );
}

/**
 * Calculate session completion percentage
 */
export function calculateSessionProgress(session: UserTestingSession): number {
  const requiredTasks = DEFAULT_TESTING_TASKS.filter(t => !t.optional);
  const completedRequiredTasks = session.tasks.filter(t => {
    const taskDef = DEFAULT_TESTING_TASKS.find(def => def.id === t.taskId);
    return taskDef && !taskDef.optional && t.status !== 'abandoned' && t.status !== 'skipped';
  });

  if (requiredTasks.length === 0) return 0;
  return (completedRequiredTasks.length / requiredTasks.length) * 100;
}

/**
 * Get testing session summary
 */
export function getTestingSessionSummary(): TestingSessionSummary {
  const sessions = loadTestingSessions();
  const completedSessions = sessions.filter(s => s.completedAt);
  const allIssues = loadIssues();

  const totalSessions = sessions.length;
  const completedSessionCount = completedSessions.length;

  // Average session duration
  const durations = completedSessions
    .filter(s => s.completedAt && s.startedAt)
    .map(s => (s.completedAt!.getTime() - s.startedAt.getTime()) / 1000 / 60); // minutes
  const averageSessionDuration = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : 0;

  // Task completion rate
  const allTasks = sessions.flatMap(s => s.tasks);
  const completedTasks = allTasks.filter(t => t.status === 'completed' || t.status === 'completed_with_help');
  const taskCompletionRate = allTasks.length > 0
    ? (completedTasks.length / allTasks.length) * 100
    : 0;

  // Average rating
  const ratings = completedSessions
    .map(s => s.sessionFeedback?.overallRating)
    .filter((r): r is SatisfactionRating => r !== undefined);
  const averageRating = ratings.length > 0
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : 0;

  // Issues by severity
  const issuesBySeverity: Record<IssueSeverity, number> = {
    critical: 0,
    major: 0,
    minor: 0,
    cosmetic: 0,
  };
  allIssues.forEach(issue => {
    issuesBySeverity[issue.severity]++;
  });

  // Issues by category
  const issuesByCategory: Record<IssueCategory, number> = {
    navigation: 0,
    content_clarity: 0,
    technical_error: 0,
    accessibility: 0,
    performance: 0,
    ui_ux: 0,
    language_translation: 0,
    code_example: 0,
    broken_link: 0,
    other: 0,
  };
  allIssues.forEach(issue => {
    issuesByCategory[issue.category]++;
  });

  // Top issues (by severity, then recency)
  const topIssues = allIssues
    .sort((a, b) => {
      const severityOrder = { critical: 0, major: 1, minor: 2, cosmetic: 3 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    })
    .slice(0, 10);

  // Common pain points from feedback
  const painPoints = completedSessions
    .flatMap(s => s.sessionFeedback?.whatNeedsImprovement?.split('.').filter(p => p.trim().length > 0) || []);

  // Generate recommendations
  const recommendations: string[] = [];

  if (issuesBySeverity.critical > 0) {
    recommendations.push(`Address ${issuesBySeverity.critical} critical issues immediately`);
  }
  if (issuesBySeverity.major > 5) {
    recommendations.push('Multiple major issues reported - prioritize fixing most common problems');
  }
  if (taskCompletionRate < 70) {
    recommendations.push('Task completion rate below 70% - review task clarity and navigation');
  }
  if (averageRating < 4) {
    recommendations.push('User satisfaction below target - review content quality and UX');
  }
  if (issuesByCategory.content_clarity > 3) {
    recommendations.push('Multiple content clarity issues - improve explanations and language');
  }
  if (issuesByCategory.navigation > 3) {
    recommendations.push('Navigation issues reported - improve site structure and wayfinding');
  }

  return {
    totalSessions,
    completedSessions: completedSessionCount,
    averageSessionDuration,
    taskCompletionRate,
    averageRating,
    issuesBySeverity,
    issuesByCategory,
    topIssues,
    commonPainPoints: painPoints,
    recommendations,
  };
}

/**
 * Get issues by severity
 */
export function getIssuesBySeverity(severity: IssueSeverity): TestingIssue[] {
  const issues = loadIssues();
  return issues.filter(i => i.severity === severity);
}

/**
 * Get issues by category
 */
export function getIssuesByCategory(category: IssueCategory): TestingIssue[] {
  const issues = loadIssues();
  return issues.filter(i => i.category === category);
}

/**
 * Get issues by tester
 */
export function getIssuesByTester(testerId: string): TestingIssue[] {
  const issues = loadIssues();
  return issues.filter(i => i.testerId === testerId);
}

/**
 * Clear all testing data (for development/testing)
 */
export function clearTestingData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem(ISSUES_KEY);
}

/**
 * Export testing data as JSON
 */
export function exportTestingData(): string {
  const sessions = loadTestingSessions();
  const issues = loadIssues();
  const summary = getTestingSessionSummary();

  return JSON.stringify({
    exportDate: new Date().toISOString(),
    summary,
    sessions,
    issues,
  }, null, 2);
}

/**
 * Calculate average difficulty rating for tasks
 */
export function getAverageDifficultyRating(taskId: string): DifficultyRating | null {
  const sessions = loadTestingSessions();
  const taskResults = sessions
    .flatMap(s => s.tasks)
    .filter(t => t.taskId === taskId);

  if (taskResults.length === 0) return null;

  const ratingValues: Record<DifficultyRating, number> = {
    very_easy: 1,
    easy: 2,
    moderate: 3,
    difficult: 4,
    very_difficult: 5,
  };

  const avgValue = taskResults.reduce((sum, t) => sum + ratingValues[t.difficultyRating], 0) / taskResults.length;

  if (avgValue <= 1.5) return 'very_easy';
  if (avgValue <= 2.5) return 'easy';
  if (avgValue <= 3.5) return 'moderate';
  if (avgValue <= 4.5) return 'difficult';
  return 'very_difficult';
}

/**
 * Get tasks that need improvement (high difficulty or low completion)
 */
export function getTasksNeedingImprovement(): Array<{ task: TestingTask; difficulty: DifficultyRating | null; completionRate: number }> {
  const tasks = getDefaultTestingTasks();
  const sessions = loadTestingSessions();

  return tasks.map(task => {
    const taskResults = sessions.flatMap(s => s.tasks).filter(t => t.taskId === task.id);
    const completionRate = taskResults.length > 0
      ? (taskResults.filter(t => t.status === 'completed' || t.status === 'completed_with_help').length / taskResults.length) * 100
      : 0;
    const difficulty = getAverageDifficultyRating(task.id);

    return { task, difficulty, completionRate };
  }).filter(item => item.difficulty === 'difficult' || item.difficulty === 'very_difficult' || item.completionRate < 70);
}

/**
 * Validate testing session
 */
export function validateTestingSession(session: UserTestingSession): boolean {
  if (!session.id || !session.testerId) return false;
  if (!session.testerRole) return false;
  if (typeof session.programmingExperience !== 'number') return false;
  if (!Array.isArray(session.tasks)) return false;
  if (!Array.isArray(session.issues)) return false;
  return true;
}

/**
 * Validate session feedback
 */
export function validateSessionFeedback(feedback: SessionFeedback): boolean {
  if (!feedback.sessionId) return false;
  if (feedback.overallRating < 1 || feedback.overallRating > 5) return false;
  if (feedback.easeOfNavigation < 1 || feedback.easeOfNavigation > 5) return false;
  if (feedback.contentClarity < 1 || feedback.contentClarity > 5) return false;
  if (feedback.visualDesign < 1 || feedback.visualDesign > 5) return false;
  if (feedback.likelihoodToRecommend < 0 || feedback.likelihoodToRecommend > 10) return false;
  return true;
}
