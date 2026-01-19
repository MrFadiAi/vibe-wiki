// Core article types
export interface WikiArticle {
  slug: string;
  title: string;
  section: string;
  content: string;
  codeBlocks?: CodeBlock[];
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
