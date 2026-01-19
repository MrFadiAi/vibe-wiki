/**
 * Personalized Recommendation Engine
 *
 * Implements sophisticated content-based and collaborative filtering algorithms
 * for personalized content recommendations based on user behavior and preferences.
 */

import {
  WikiArticle,
  Tutorial,
  LearningPath,
  UserProgress,
  PathProgress,
  TutorialProgress,
} from '@/types';
import { calculatePathProgress } from './learning-path-utils';
import { calculateTutorialTime } from './tutorial-utils';
import { calculateReadingTime } from './article-utils';

/**
 * Recommendation reasons for transparency
 */
export type RecommendationReason =
  | 'continues_learning_path'
  | 'builds_on_completed'
  | 'matches_interest'
  | 'popular_choice'
  | 'suitable_for_level'
  | 'quick_win'
  | 'prerequisite_for_goal'
  | 'similar_to_liked'
  | 'fills_skill_gap'
  | 'maintains_streak';

/**
 * Recommendation score with metadata
 */
export interface RecommendationScore<T> {
  item: T;
  score: number;
  confidence: number;
  reason: RecommendationReason;
  explanation: string;
}

/**
 * User profile for personalization
 */
export interface UserProfile {
  preferredContentTypes: {
    articles: number;
    tutorials: number;
    paths: number;
  };
  averageCompletionTime: {
    articles: number;
    tutorials: number;
  };
  difficultyPreference: Record<string, number>;
  interests: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  learningPatterns: {
    prefersShortContent: boolean;
    prefersInteractiveContent: boolean;
    likesPrerequisites: boolean;
  };
}

/**
 * Recommendation options
 */
export interface RecommendationOptions {
  maxResults?: number;
  minConfidence?: number;
  includeCompleted?: boolean;
  diversityFactor?: number; // 0-1, higher = more diverse recommendations
  timeConstraint?: number; // max minutes available
  focusOnPrerequisites?: boolean;
}

/**
 * Default recommendation options
 */
const DEFAULT_OPTIONS: Required<RecommendationOptions> = {
  maxResults: 5,
  minConfidence: 0.3,
  includeCompleted: false,
  diversityFactor: 0.3,
  timeConstraint: undefined,
  focusOnPrerequisites: false,
};

/**
 * Calculate content similarity based on tags, sections, and topics
 */
function calculateContentSimilarity(
  item1: { tags?: string[]; section?: string; title: string },
  item2: { tags?: string[]; section?: string; title: string }
): number {
  let score = 0;
  let factors = 0;

  // Tag overlap
  if (item1.tags && item2.tags && item1.tags.length > 0 && item2.tags.length > 0) {
    const intersection = item1.tags.filter((tag) => item2.tags.includes(tag));
    const union = [...new Set([...item1.tags, ...item2.tags])];
    score += intersection.length / union.length;
    factors++;
  }

  // Section match
  if (item1.section && item2.section && item1.section === item2.section) {
    score += 0.5;
    factors++;
  }

  // Title word overlap (simple keyword matching)
  const words1 = new Set(item1.title.toLowerCase().split(/\s+/));
  const words2 = new Set(item2.title.toLowerCase().split(/\s+/));
  const titleIntersection = [...words1].filter((word) => words2.has(word) && word.length > 3);
  if (titleIntersection.length > 0) {
    score += titleIntersection.length * 0.1;
    factors++;
  }

  return factors > 0 ? score / factors : 0;
}

/**
 * Build user profile from progress and content history
 */
export function buildUserProfile(
  progress: UserProgress,
  articles: WikiArticle[],
  tutorials: Tutorial[]
): UserProfile {
  // Get completed content
  const completedArticles = articles.filter((a) =>
    progress.completedArticles.includes(a.slug)
  );
  const completedTutorials = tutorials.filter((t) =>
    progress.completedTutorials.includes(t.id)
  );

  // Calculate preferences
  const totalCompleted = completedArticles.length + completedTutorials.length;
  const articleRatio = totalCompleted > 0 ? completedArticles.length / totalCompleted : 0.33;
  const tutorialRatio = totalCompleted > 0 ? completedTutorials.length / totalCompleted : 0.33;
  const pathRatio = 0; // Can be calculated from path progress if needed

  // Calculate average completion times (using estimated times)
  const avgArticleTime =
    completedArticles.length > 0
      ? completedArticles.reduce((sum, a) => sum + calculateReadingTime(a.content), 0) / completedArticles.length
      : 10;
  const avgTutorialTime =
    completedTutorials.length > 0
      ? completedTutorials.reduce((sum, t) => sum + calculateTutorialTime(t), 0) / completedTutorials.length
      : 30;

  // Analyze difficulty preferences
  const difficultyCount: Record<string, number> = { beginner: 0, intermediate: 0, advanced: 0 };
  completedTutorials.forEach((t) => {
    difficultyCount[t.difficulty]++;
  });

  // Determine skill level based on progress
  const totalPoints = progress.totalPoints;
  let skillLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  if (totalPoints > 500) skillLevel = 'intermediate';
  if (totalPoints > 2000) skillLevel = 'advanced';

  // Extract interests from tags
  const tagCounts: Record<string, number> = {};
  completedArticles.forEach((a) => {
    a.tags?.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  completedTutorials.forEach((t) => {
    t.tags?.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const interests = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);

  // Learning patterns
  const prefersShortContent = avgArticleTime < 15 || avgTutorialTime < 45;
  const prefersInteractiveContent = tutorialRatio > 0.4;
  const likesPrerequisites = completedTutorials.filter((t) => t.prerequisites && t.prerequisites.length > 0).length > completedTutorials.length / 2;

  return {
    preferredContentTypes: {
      articles: articleRatio,
      tutorials: tutorialRatio,
      paths: pathRatio,
    },
    averageCompletionTime: {
      articles: avgArticleTime,
      tutorials: avgTutorialTime,
    },
    difficultyPreference: difficultyCount,
    interests,
    skillLevel,
    learningPatterns: {
      prefersShortContent,
      prefersInteractiveContent,
      likesPrerequisites,
    },
  };
}

/**
 * Score article for recommendation
 */
function scoreArticle(
  article: WikiArticle,
  profile: UserProfile,
  progress: UserProgress,
  completedArticles: WikiArticle[],
  options: Required<RecommendationOptions>
): RecommendationScore<WikiArticle> {
  let score = 0;
  const reasons: { reason: RecommendationReason; score: number; explanation: string }[] = [];

  // Base score for new content
  if (!progress.completedArticles.includes(article.slug)) {
    score += 0.3;
  } else if (!options.includeCompleted) {
    return {
      item: article,
      score: 0,
      confidence: 0,
      reason: 'builds_on_completed',
      explanation: 'Already completed',
    };
  }

  // Interest-based scoring
  if (article.tags) {
    const matchingInterests = article.tags.filter((tag) => profile.interests.includes(tag));
    if (matchingInterests.length > 0) {
      const interestScore = matchingInterests.length * 0.2;
      score += interestScore;
      reasons.push({
        reason: 'matches_interest',
        score: interestScore,
        explanation: `Matches your interest in ${matchingInterests[0]}`,
      });
    }
  }

  // Similarity to completed articles
  if (completedArticles.length > 0) {
    const maxSimilarity = Math.max(...completedArticles.map((a) => calculateContentSimilarity(article, a)));
    if (maxSimilarity > 0) {
      score += maxSimilarity * 0.3;
      reasons.push({
        reason: 'similar_to_liked',
        score: maxSimilarity * 0.3,
        explanation: 'Similar to content you have completed',
      });
    }
  }

  // Section preference (if user has completed articles in same section)
  if (article.section) {
    const sectionCount = completedArticles.filter((a) => a.section === article.section).length;
    if (sectionCount >= 2) {
      score += 0.15;
      reasons.push({
        reason: 'builds_on_completed',
        score: 0.15,
        explanation: `Continues learning ${article.section}`,
      });
    }
  }

  // Time constraint consideration
  if (options.timeConstraint) {
    const readingTime = calculateReadingTime(article.content);
    if (readingTime <= options.timeConstraint) {
      score += 0.2;
      reasons.push({
        reason: 'quick_win',
        score: 0.2,
        explanation: 'Fits your available time',
      });
    } else if (readingTime > options.timeConstraint * 1.5) {
      score -= 0.3;
    }
  }

  // Content type preference
  score += profile.preferredContentTypes.articles * 0.15;

  // Quick win bonus for short content if user prefers it
  if (profile.learningPatterns.prefersShortContent) {
    const readingTime = calculateReadingTime(article.content);
    if (readingTime < 10) {
      score += 0.1;
    }
  }

  // Prerequisites for incomplete paths
  if (options.focusOnPrerequisites) {
    // Check if this article is a prerequisite for any in-progress path
    Object.values(progress.currentPathProgress).forEach((pathProgress) => {
      if (pathProgress.startedAt && !pathProgress.completedAt) {
        // This would need path data to check prerequisites
        // For now, add a small bonus for any content
        score += 0.05;
      }
    });
  }

  // Calculate confidence based on factors
  const confidence = Math.min(1, 0.2 + reasons.length * 0.15 + (profile.interests.length > 0 ? 0.2 : 0));

  // Select primary reason
  const primaryReason = reasons.sort((a, b) => b.score - a.score)[0];

  return {
    item: article,
    score: Math.max(0, score),
    confidence,
    reason: primaryReason?.reason || 'suitable_for_level',
    explanation: primaryReason?.explanation || 'Recommended for you',
  };
}

/**
 * Score tutorial for recommendation
 */
function scoreTutorial(
  tutorial: Tutorial,
  profile: UserProfile,
  progress: UserProgress,
  completedTutorials: Tutorial[],
  options: Required<RecommendationOptions>
): RecommendationScore<Tutorial> {
  let score = 0;
  const reasons: { reason: RecommendationReason; score: number; explanation: string }[] = [];

  // Check if already completed or in progress
  const isCompleted = progress.completedTutorials.includes(tutorial.id);
  const isInProgress = progress.currentTutorialProgress[tutorial.id];

  if (!options.includeCompleted && isCompleted) {
    return {
      item: tutorial,
      score: 0,
      confidence: 0,
      reason: 'builds_on_completed',
      explanation: 'Already completed',
    };
  }

  // Bonus for continuing in-progress tutorial
  if (isInProgress) {
    const tutorialProgress = progress.currentTutorialProgress[tutorial.id];
    const progressPercent = calculateTutorialTime(tutorial) > 0
      ? (tutorialProgress.completedSteps.length / tutorial.steps.length) * 100
      : 0;
    score += 0.5 + (progressPercent / 100) * 0.3;
    reasons.push({
      reason: 'continues_learning_path',
      score: 0.5,
      explanation: `Continue learning: ${progressPercent.toFixed(0)}% complete`,
    });
  } else {
    score += 0.3; // Base score for new tutorial
  }

  // Difficulty alignment
  const difficultyScores = { beginner: 0, intermediate: 0.5, advanced: 1 };
  const difficultyDiff = Math.abs(difficultyScores[tutorial.difficulty] - difficultyScores[profile.skillLevel]);
  if (difficultyDiff <= 0.5) {
    score += 0.25;
    reasons.push({
      reason: 'suitable_for_level',
      score: 0.25,
      explanation: `Matches your ${profile.skillLevel} level`,
    });
  } else if (difficultyDiff > 1) {
    score -= 0.2; // Penalty for too difficult/easy
  }

  // Interest-based scoring
  if (tutorial.tags) {
    const matchingInterests = tutorial.tags.filter((tag) => profile.interests.includes(tag));
    if (matchingInterests.length > 0) {
      const interestScore = matchingInterests.length * 0.15;
      score += interestScore;
      reasons.push({
        reason: 'matches_interest',
        score: interestScore,
        explanation: `Matches your interest in ${matchingInterests[0]}`,
      });
    }
  }

  // Prerequisites check
  if (tutorial.prerequisites && tutorial.prerequisites.length > 0) {
    const hasPrerequisites = tutorial.prerequisites.every((prereq) =>
      progress.completedTutorials.includes(prereq) ||
      progress.completedArticles.includes(prereq)
    );
    if (hasPrerequisites) {
      score += 0.2;
      if (profile.learningPatterns.likesPrerequisites) {
        reasons.push({
          reason: 'builds_on_completed',
          score: 0.2,
          explanation: 'Builds on your existing knowledge',
        });
      }
    } else {
      score -= 0.3; // Penalty for missing prerequisites
    }
  }

  // Interactive content preference
  if (profile.learningPatterns.prefersInteractiveContent) {
    score += 0.15;
  }

  // Time constraint consideration
  if (options.timeConstraint) {
    const tutorialTime = calculateTutorialTime(tutorial);
    if (tutorialTime <= options.timeConstraint) {
      score += 0.15;
      reasons.push({
        reason: 'quick_win',
        score: 0.15,
        explanation: 'Fits your available time',
      });
    } else if (tutorialTime > options.timeConstraint * 2) {
      score -= 0.2;
    }
  }

  // Similarity to completed tutorials
  if (completedTutorials.length > 0) {
    const maxSimilarity = Math.max(...completedTutorials.map((t) => calculateContentSimilarity(tutorial, t)));
    if (maxSimilarity > 0) {
      score += maxSimilarity * 0.2;
      reasons.push({
        reason: 'similar_to_liked',
        score: maxSimilarity * 0.2,
        explanation: 'Similar to tutorials you have completed',
      });
    }
  }

  // Content type preference
  score += profile.preferredContentTypes.tutorials * 0.15;

  // Calculate confidence
  const confidence = Math.min(1, 0.3 + reasons.length * 0.12);

  const primaryReason = reasons.sort((a, b) => b.score - a.score)[0];

  return {
    item: tutorial,
    score: Math.max(0, score),
    confidence,
    reason: primaryReason?.reason || 'suitable_for_level',
    explanation: primaryReason?.explanation || 'Recommended for you',
  };
}

/**
 * Score learning path for recommendation
 */
function scoreLearningPath(
  path: LearningPath,
  profile: UserProfile,
  progress: UserProgress,
  completedPaths: LearningPath[],
  options: Required<RecommendationOptions>
): RecommendationScore<LearningPath> {
  let score = 0;
  const reasons: { reason: RecommendationReason; score: number; explanation: string }[] = [];

  // Check if already completed or in progress
  const isCompleted = progress.completedPaths.includes(path.id);
  const isInProgress = progress.currentPathProgress[path.id];

  if (!options.includeCompleted && isCompleted) {
    return {
      item: path,
      score: 0,
      confidence: 0,
      reason: 'builds_on_completed',
      explanation: 'Already completed',
    };
  }

  // Strong bonus for continuing in-progress path
  if (isInProgress) {
    const pathProgress = progress.currentPathProgress[path.id];
    const progressPercent = calculatePathProgress(path, pathProgress);
    score += 0.6 + progressPercent * 0.3;
    reasons.push({
      reason: 'continues_learning_path',
      score: 0.6,
      explanation: `Continue your journey: ${progressPercent.toFixed(0)}% complete`,
    });
  } else {
    score += 0.3; // Base score for new path
  }

  // Difficulty alignment
  const difficultyScores = { beginner: 0, intermediate: 0.5, advanced: 1 };
  const difficultyDiff = Math.abs(difficultyScores[path.difficulty] - difficultyScores[profile.skillLevel]);
  if (difficultyDiff <= 0.5) {
    score += 0.3;
    reasons.push({
      reason: 'suitable_for_level',
      score: 0.3,
      explanation: `${path.difficulty} level - perfect for you`,
    });
  } else if (difficultyDiff > 1) {
    score -= 0.3;
  }

  // Interest and category alignment
  if (path.category && profile.interests.includes(path.category)) {
    score += 0.2;
    reasons.push({
      reason: 'matches_interest',
      score: 0.2,
      explanation: `Focuses on ${path.category}`,
    });
  }

  if (path.tags) {
    const matchingInterests = path.tags.filter((tag) => profile.interests.includes(tag));
    if (matchingInterests.length > 0) {
      score += matchingInterests.length * 0.1;
    }
  }

  // Prerequisites check
  if (path.prerequisites && path.prerequisites.length > 0) {
    const hasPrerequisites = path.prerequisites.every((prereq) =>
      progress.completedTutorials.includes(prereq) ||
      progress.completedArticles.includes(prereq) ||
      progress.completedPaths.includes(prereq)
    );
    if (hasPrerequisites) {
      score += 0.15;
    } else {
      score -= 0.4; // Significant penalty for missing prerequisites
    }
  }

  // Target audience alignment
  if (path.targetAudience) {
    const audienceLower = path.targetAudience.toLowerCase();
    if (audienceLower.includes(profile.skillLevel)) {
      score += 0.15;
    }
  }

  // Streak maintenance bonus
  if (progress.streakDays >= 3 && path.estimatedMinutes < 30) {
    score += 0.1;
    reasons.push({
      reason: 'maintains_streak',
      score: 0.1,
      explanation: 'Quick path to maintain your streak',
    });
  }

  // Time constraint
  if (options.timeConstraint && path.estimatedMinutes <= options.timeConstraint) {
    score += 0.15;
  }

  // Calculate confidence
  const confidence = Math.min(1, 0.25 + reasons.length * 0.15);

  const primaryReason = reasons.sort((a, b) => b.score - a.score)[0];

  return {
    item: path,
    score: Math.max(0, score),
    confidence,
    reason: primaryReason?.reason || 'suitable_for_level',
    explanation: primaryReason?.explanation || 'Recommended for you',
  };
}

/**
 * Apply diversity to recommendations to avoid repetitive suggestions
 */
function applyDiversity<T>(
  scored: RecommendationScore<T>[],
  diversityFactor: number
): RecommendationScore<T>[] {
  if (diversityFactor === 0 || scored.length <= 1) return scored;

  const result: RecommendationScore<T>[] = [];
  const remaining = [...scored];

  while (remaining.length > 0 && result.length < scored.length) {
    // Pick the highest scored item
    const best = remaining.splice(
      remaining.findIndex((r) => r.score === Math.max(...remaining.map((s) => s.score))),
      1
    )[0];
    result.push(best);

    // Reduce scores of similar items
    remaining.forEach((r) => {
      const similarity = 'tags' in best.item && 'tags' in r.item
        ? calculateContentSimilarity(best.item as any, r.item as any)
        : 0;
      if (similarity > 0.3) {
        r.score *= (1 - diversityFactor * similarity);
      }
    });
  }

  return result;
}

/**
 * Main recommendation function - get personalized article recommendations
 */
export function getRecommendedArticles(
  progress: UserProgress,
  articles: WikiArticle[],
  options: RecommendationOptions = {}
): RecommendationScore<WikiArticle>[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const profile = buildUserProfile(progress, articles, []);
  const completedArticles = articles.filter((a) => progress.completedArticles.includes(a.slug));

  // Score all articles
  const scored = articles
    .map((article) => scoreArticle(article, profile, progress, completedArticles, opts))
    .filter((r) => r.score >= opts.minConfidence && r.confidence >= opts.minConfidence);

  // Apply diversity
  const diversified = applyDiversity(scored, opts.diversityFactor);

  // Sort by score and confidence, then return top results
  return diversified
    .sort((a, b) => b.score * b.confidence - a.score * a.confidence)
    .slice(0, opts.maxResults);
}

/**
 * Get personalized tutorial recommendations
 */
export function getRecommendedTutorials(
  progress: UserProgress,
  tutorials: Tutorial[],
  options: RecommendationOptions = {}
): RecommendationScore<Tutorial>[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const profile = buildUserProfile(progress, [], tutorials);
  const completedTutorials = tutorials.filter((t) => progress.completedTutorials.includes(t.id));

  // Score all tutorials
  const scored = tutorials
    .map((tutorial) => scoreTutorial(tutorial, profile, progress, completedTutorials, opts))
    .filter((r) => r.score >= opts.minConfidence && r.confidence >= opts.minConfidence);

  // Apply diversity
  const diversified = applyDiversity(scored, opts.diversityFactor);

  return diversified
    .sort((a, b) => b.score * b.confidence - a.score * a.confidence)
    .slice(0, opts.maxResults);
}

/**
 * Get personalized learning path recommendations
 */
export function getRecommendedPaths(
  progress: UserProgress,
  paths: LearningPath[],
  options: RecommendationOptions = {}
): RecommendationScore<LearningPath>[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const profile = buildUserProfile(progress, [], []);
  const completedPaths = paths.filter((p) => progress.completedPaths.includes(p.id));

  // Score all paths
  const scored = paths
    .map((path) => scoreLearningPath(path, profile, progress, completedPaths, opts))
    .filter((r) => r.score >= opts.minConfidence && r.confidence >= opts.minConfidence);

  // Apply diversity
  const diversified = applyDiversity(scored, opts.diversityFactor);

  return diversified
    .sort((a, b) => b.score * b.confidence - a.score * a.confidence)
    .slice(0, opts.maxResults);
}

/**
 * Get all recommendations combined
 */
export function getAllRecommendations(
  progress: UserProgress,
  articles: WikiArticle[],
  tutorials: Tutorial[],
  paths: LearningPath[],
  options: RecommendationOptions = {}
): {
  articles: RecommendationScore<WikiArticle>[];
  tutorials: RecommendationScore<Tutorial>[];
  paths: RecommendationScore<LearningPath>[];
} {
  return {
    articles: getRecommendedArticles(progress, articles, options),
    tutorials: getRecommendedTutorials(progress, tutorials, options),
    paths: getRecommendedPaths(progress, paths, options),
  };
}

/**
 * Get next recommended content (single best recommendation across all types)
 */
export function getNextRecommendation(
  progress: UserProgress,
  articles: WikiArticle[],
  tutorials: Tutorial[],
  paths: LearningPath[],
  options: RecommendationOptions = {}
): RecommendationScore<WikiArticle | Tutorial | LearningPath> | null {
  const allRecs = getAllRecommendations(progress, articles, tutorials, paths, {
    ...options,
    maxResults: 1,
  });

  const candidates = [
    ...allRecs.articles,
    ...allRecs.tutorials,
    ...allRecs.paths,
  ];

  if (candidates.length === 0) return null;

  return candidates.sort((a, b) => b.score * b.confidence - a.score * a.confidence)[0];
}

/**
 * Get recommendations based on time constraint
 */
export function getRecommendationsByTime(
  progress: UserProgress,
  articles: WikiArticle[],
  tutorials: Tutorial[],
  paths: LearningPath[],
  availableMinutes: number,
  options: RecommendationOptions = {}
): {
  quick: RecommendationScore<WikiArticle | Tutorial | LearningPath>[];
  moderate: RecommendationScore<WikiArticle | Tutorial | LearningPath>[];
  long: RecommendationScore<WikiArticle | Tutorial | LearningPath>[];
} {
  const quickOpts = { ...options, timeConstraint: availableMinutes * 0.5, maxResults: 3 };
  const moderateOpts = { ...options, timeConstraint: availableMinutes, maxResults: 3 };
  const longOpts = { ...options, maxResults: 3 };

  const quickRecs = [
    ...getRecommendedArticles(progress, articles, quickOpts),
    ...getRecommendedTutorials(progress, tutorials, quickOpts),
    ...getRecommendedPaths(progress, paths, quickOpts),
  ].slice(0, 3);

  const moderateRecs = [
    ...getRecommendedArticles(progress, articles, moderateOpts),
    ...getRecommendedTutorials(progress, tutorials, moderateOpts),
    ...getRecommendedPaths(progress, paths, moderateOpts),
  ].slice(0, 3);

  const longRecs = [
    ...getRecommendedArticles(progress, articles, longOpts),
    ...getRecommendedTutorials(progress, tutorials, longOpts),
    ...getRecommendedPaths(progress, paths, longOpts),
  ].slice(0, 3);

  return {
    quick: quickRecs.sort((a, b) => b.score * b.confidence - a.score * a.confidence),
    moderate: moderateRecs.sort((a, b) => b.score * b.confidence - a.score * a.confidence),
    long: longRecs.sort((a, b) => b.score * b.confidence - a.score * a.confidence),
  };
}

/**
 * Explain why content was recommended (for user-facing transparency)
 */
export function explainRecommendation<T>(
  recommendation: RecommendationScore<T>
): {
  reason: string;
  confidence: string;
  details: string;
} {
  const confidenceLabels = [
    { max: 0.3, label: 'Suggestion' },
    { max: 0.5, label: 'Likely Match' },
    { max: 0.7, label: 'Good Match' },
    { max: 0.9, label: 'Strong Match' },
    { max: 1.0, label: 'Excellent Match' },
  ];

  const confidenceLabel = confidenceLabels.find((c) => recommendation.confidence <= c.max)?.label || 'Suggestion';

  const reasonTexts: Record<RecommendationReason, string> = {
    continues_learning_path: 'Continue your learning journey',
    builds_on_completed: 'Builds on what you have learned',
    matches_interest: 'Matches your interests',
    popular_choice: 'Popular with similar learners',
    suitable_for_level: 'Suitable for your skill level',
    quick_win: 'Quick achievement available',
    prerequisite_for_goal: 'Required for your goals',
    similar_to_liked: 'Similar to content you enjoyed',
    fills_skill_gap: 'Helps fill a knowledge gap',
    maintains_streak: 'Keep your learning streak going',
  };

  return {
    reason: reasonTexts[recommendation.reason],
    confidence: confidenceLabel,
    details: recommendation.explanation,
  };
}

/**
 * Validate user profile
 */
export function validateUserProfile(profile: UserProfile): boolean {
  return (
    profile !== null &&
    typeof profile === 'object' &&
    typeof profile.preferredContentTypes === 'object' &&
    typeof profile.averageCompletionTime === 'object' &&
    Array.isArray(profile.interests) &&
    typeof profile.skillLevel === 'string' &&
    typeof profile.learningPatterns === 'object'
  );
}

/**
 * Update user profile based on new activity
 */
export function updateProfileWithActivity(
  profile: UserProfile,
  activityType: 'article' | 'tutorial' | 'path',
  contentTags: string[] = [],
  timeSpentMinutes: number
): UserProfile {
  const updated = { ...profile };

  // Update content type preferences (exponential moving average)
  const typeKey = `${activityType}s` as keyof typeof profile.preferredContentTypes;
  const oldPreference = profile.preferredContentTypes[typeKey];
  updated.preferredContentTypes = {
    ...profile.preferredContentTypes,
    [typeKey]: oldPreference * 0.8 + 0.2,
  };

  // Update average completion time
  const timeKey = activityType === 'article' ? 'articles' : 'tutorials';
  const oldAvgTime = profile.averageCompletionTime[timeKey];
  updated.averageCompletionTime = {
    ...profile.averageCompletionTime,
    [timeKey]: oldAvgTime * 0.7 + timeSpentMinutes * 0.3,
  };

  // Update interests
  const newInterests = [...profile.interests];
  contentTags.forEach((tag) => {
    const existingIndex = newInterests.indexOf(tag);
    if (existingIndex >= 0) {
      // Boost existing interest
      newInterests.splice(existingIndex, 1);
      newInterests.splice(Math.min(existingIndex, 2), 0, tag);
    } else if (newInterests.length < 10) {
      newInterests.push(tag);
    }
  });
  updated.interests = newInterests;

  return updated;
}
