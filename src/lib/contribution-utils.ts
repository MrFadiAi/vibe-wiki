import type {
  Contribution,
  ContributionType,
  ContributionStatus,
  ReviewDecision,
  ReviewStatusType,
  CreateContributionInput,
  UpdateContributionInput,
  Review,
  ReviewComment,
  ContributorProfile,
  ContributorBadge,
  Draft,
  DraftVersion,
  ContributionFilterOptions,
  ContributionStats,
} from '../types';

// ========== Validation ==========

export function validateContribution(contribution: unknown): contribution is Contribution {
  if (!contribution || typeof contribution !== 'object') {
    return false;
  }

  const c = contribution as Partial<Contribution>;

  // Required fields
  if (!c.id || typeof c.id !== 'string') return false;
  if (!c.type || !['article', 'tutorial', 'example', 'path'].includes(c.type)) return false;
  if (!c.title || typeof c.title !== 'string' || c.title.length < 5 || c.title.length > 200) return false;
  if (!c.description || typeof c.description !== 'string' || c.description.length < 10 || c.description.length > 500) {
    return false;
  }
  if (!c.content || typeof c.content !== 'string' || c.content.length < 50) return false;
  if (!c.authorId || typeof c.authorId !== 'string') return false;
  if (!c.status || !['draft', 'submitted', 'under_review', 'approved', 'rejected', 'published'].includes(c.status)) {
    return false;
  }
  if (!c.createdAt || !(c.createdAt instanceof Date)) return false;
  if (!c.updatedAt || !(c.updatedAt instanceof Date)) return false;

  // Slug format validation for title (URL-friendly)
  const titleSlugRegex = /^[a-zA-Z0-9\u0600-\u06FF\s\-_.,!?;:()'"[\]{}]+$/;
  if (!titleSlugRegex.test(c.title)) {
    return false;
  }

  // Status-specific validations
  if (c.status === 'submitted' && !c.submittedAt) return false;
  if ((c.status === 'approved' || c.status === 'rejected' || c.status === 'published') && !c.reviewedAt) {
    return false;
  }
  if ((c.status === 'rejected' || c.status === 'published') && !c.reviewerId) return false;

  // Tutorial-specific validations
  if (c.type === 'tutorial') {
    if (!c.steps || !Array.isArray(c.steps) || c.steps.length === 0) return false;
    if (!c.learningObjectives || !Array.isArray(c.learningObjectives) || c.learningObjectives.length === 0) {
      return false;
    }
    if (!c.difficulty || !['beginner', 'intermediate', 'advanced'].includes(c.difficulty)) return false;
    if (!c.estimatedMinutes || typeof c.estimatedMinutes !== 'number' || c.estimatedMinutes < 1) return false;
  }

  // Path-specific validations
  if (c.type === 'path') {
    if (!c.items || !Array.isArray(c.items) || c.items.length === 0) return false;
    if (!c.targetAudience || !Array.isArray(c.targetAudience) || c.targetAudience.length === 0) return false;
    if (!c.learningObjectives || !Array.isArray(c.learningObjectives) || c.learningObjectives.length === 0) {
      return false;
    }
    if (!c.difficulty || !['beginner', 'intermediate', 'advanced'].includes(c.difficulty)) return false;
    if (!c.estimatedMinutes || typeof c.estimatedMinutes !== 'number' || c.estimatedMinutes < 1) return false;
  }

  return true;
}

export function validateCreateContributionInput(input: unknown): input is CreateContributionInput {
  if (!input || typeof input !== 'object') return false;

  const i = input as Partial<CreateContributionInput>;

  if (!i.type || !['article', 'tutorial', 'example', 'path'].includes(i.type)) return false;
  if (!i.title || typeof i.title !== 'string' || i.title.length < 5 || i.title.length > 200) return false;
  if (!i.description || typeof i.description !== 'string' || i.description.length < 10 || i.description.length > 500) {
    return false;
  }
  if (!i.content || typeof i.content !== 'string' || i.content.length < 50) return false;
  if (!i.authorId || typeof i.authorId !== 'string') return false;

  // Tutorial-specific validations
  if (i.type === 'tutorial') {
    if (!i.steps || !Array.isArray(i.steps) || i.steps.length === 0) return false;
    if (!i.learningObjectives || !Array.isArray(i.learningObjectives) || i.learningObjectives.length === 0) {
      return false;
    }
    if (!i.difficulty || !['beginner', 'intermediate', 'advanced'].includes(i.difficulty)) return false;
    if (!i.estimatedMinutes || typeof i.estimatedMinutes !== 'number' || i.estimatedMinutes < 1) return false;
  }

  // Path-specific validations
  if (i.type === 'path') {
    if (!i.items || !Array.isArray(i.items) || i.items.length === 0) return false;
    if (!i.targetAudience || !Array.isArray(i.targetAudience) || i.targetAudience.length === 0) return false;
    if (!i.learningObjectives || !Array.isArray(i.learningObjectives) || i.learningObjectives.length === 0) {
      return false;
    }
    if (!i.difficulty || !['beginner', 'intermediate', 'advanced'].includes(i.difficulty)) return false;
    if (!i.estimatedMinutes || typeof i.estimatedMinutes !== 'number' || i.estimatedMinutes < 1) return false;
  }

  return true;
}

export function validateReview(review: unknown): review is Review {
  if (!review || typeof review !== 'object') return false;

  const r = review as Partial<Review>;

  if (!r.id || typeof r.id !== 'string') return false;
  if (!r.contributionId || typeof r.contributionId !== 'string') return false;
  if (!r.reviewerId || typeof r.reviewerId !== 'string') return false;
  if (!r.status || !['pending', 'in_progress', 'completed'].includes(r.status)) return false;
  if (!r.comments || !Array.isArray(r.comments)) return false;
  if (!r.createdAt || !(r.createdAt instanceof Date)) return false;

  // Completed reviews must have a decision
  if (r.status === 'completed' && !r.decision) return false;

  return true;
}

export function validateContributorProfile(profile: unknown): profile is ContributorProfile {
  if (!profile || typeof profile !== 'object') return false;

  const p = profile as Partial<ContributorProfile>;

  if (!p.userId || typeof p.userId !== 'string') return false;
  if (!p.username || typeof p.username !== 'string' || p.username.length < 2 || p.username.length > 30) return false;
  if (!p.displayName || typeof p.displayName !== 'string' || p.displayName.length < 2 || p.displayName.length > 50) {
    return false;
  }
  if (!p.bio || typeof p.bio !== 'string' || p.bio.length < 10 || p.bio.length > 500) return false;
  if (typeof p.reputation !== 'number' || p.reputation < 0) return false;
  if (typeof p.contributionsCount !== 'number' || p.contributionsCount < 0) return false;
  if (typeof p.approvedSubmissions !== 'number' || p.approvedSubmissions < 0) return false;
  if (typeof p.pendingSubmissions !== 'number' || p.pendingSubmissions < 0) return false;
  if (!p.badges || !Array.isArray(p.badges)) return false;
  if (!p.expertise || !Array.isArray(p.expertise)) return false;
  if (!p.preferredCategories || !Array.isArray(p.preferredCategories)) return false;
  if (!p.createdAt || !(p.createdAt instanceof Date)) return false;
  if (!p.updatedAt || !(p.updatedAt instanceof Date)) return false;

  // Username format: alphanumeric, underscores, hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(p.username)) return false;

  return true;
}

export function validateDraft(draft: unknown): draft is Draft {
  if (!draft || typeof draft !== 'object') return false;

  const d = draft as Partial<Draft>;

  if (!d.id || typeof d.id !== 'string') return false;
  if (!d.authorId || typeof d.authorId !== 'string') return false;
  if (!d.type || !['article', 'tutorial', 'example', 'path'].includes(d.type)) return false;
  if (!d.title || typeof d.title !== 'string') return false;
  if (!d.content || typeof d.content !== 'string') return false;
  if (!d.lastSavedAt || !(d.lastSavedAt instanceof Date)) return false;
  if (typeof d.autoSaved !== 'boolean') return false;
  if (!d.versions || !Array.isArray(d.versions)) return false;

  return true;
}

// ========== Factory Functions ==========

export function createContribution(input: CreateContributionInput): Contribution {
  const now = new Date();
  const id = generateContributionId();

  // Generate IDs for tutorial steps if provided
  const steps = input.steps?.map((step, index) => ({
    ...step,
    id: `${id}-step-${index}`,
  }));

  // Generate IDs for path items if provided
  const items = input.items?.map((item, index) => ({
    ...item,
    id: `${id}-item-${index}`,
  }));

  return {
    id,
    type: input.type,
    title: input.title.trim(),
    description: input.description.trim(),
    content: input.content.trim(),
    authorId: input.authorId,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    tags: input.tags?.map((t) => t.trim()).filter(Boolean),
    categoryId: input.categoryId,
    difficulty: input.difficulty,
    estimatedMinutes: input.estimatedMinutes,
    steps,
    learningObjectives: input.learningObjectives,
    prerequisites: input.prerequisites,
    targetAudience: input.targetAudience,
    items,
  };
}

export function updateContribution(
  contribution: Contribution,
  updates: UpdateContributionInput,
): Contribution {
  return {
    ...contribution,
    ...updates,
    title: updates.title ? updates.title.trim() : contribution.title,
    description: updates.description ? updates.description.trim() : contribution.description,
    content: updates.content ? updates.content.trim() : contribution.content,
    tags: updates.tags?.map((t) => t.trim()).filter(Boolean) ?? contribution.tags,
    updatedAt: new Date(),
  };
}

export function createReview(
  contributionId: string,
  reviewerId: string,
  comments: ReviewComment[] = [],
): Review {
  return {
    id: generateReviewId(),
    contributionId,
    reviewerId,
    status: 'pending',
    comments,
    createdAt: new Date(),
  };
}

export function createReviewComment(
  reviewerId: string,
  content: string,
  type: ReviewComment['type'] = 'suggestion',
  line?: number,
): ReviewComment {
  return {
    id: generateCommentId(),
    reviewerId,
    content: content.trim(),
    line,
    type,
    createdAt: new Date(),
  };
}

export function createContributorProfile(
  userId: string,
  username: string,
  displayName: string,
  bio: string,
): ContributorProfile {
  const now = new Date();

  return {
    userId,
    username: username.trim(),
    displayName: displayName.trim(),
    bio: bio.trim(),
    reputation: 0,
    contributionsCount: 0,
    approvedSubmissions: 0,
    pendingSubmissions: 0,
    badges: [],
    expertise: [],
    preferredCategories: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function createDraft(authorId: string, type: ContributionType, title: string, content: string): Draft {
  const now = new Date();
  const draftId = generateDraftId();
  const versionId = generateVersionId();

  const version: DraftVersion = {
    id: versionId,
    content: content.trim(),
    savedAt: now,
  };

  return {
    id: draftId,
    authorId,
    type,
    title: title.trim(),
    content: content.trim(),
    lastSavedAt: now,
    autoSaved: false,
    versions: [version],
  };
}

// ========== Status Management ==========

export function submitContribution(contribution: Contribution): Contribution {
  if (contribution.status !== 'draft') {
    throw new Error('Can only submit draft contributions');
  }

  return {
    ...contribution,
    status: 'submitted',
    submittedAt: new Date(),
    updatedAt: new Date(),
  };
}

export function startReview(contribution: Contribution, reviewerId: string): Contribution {
  if (contribution.status !== 'submitted') {
    throw new Error('Can only review submitted contributions');
  }

  return {
    ...contribution,
    status: 'under_review',
    reviewerId,
    updatedAt: new Date(),
  };
}

export function completeReview(
  contribution: Contribution,
  decision: ReviewDecision,
  reviewNotes?: string[],
): Contribution {
  if (contribution.status !== 'under_review') {
    throw new Error('Can only complete review for contributions under review');
  }

  let newStatus: ContributionStatus;
  if (decision === 'approve') {
    newStatus = 'approved';
  } else if (decision === 'reject') {
    newStatus = 'rejected';
  } else {
    // request_changes - send back to draft
    newStatus = 'draft';
  }

  return {
    ...contribution,
    status: newStatus,
    reviewedAt: new Date(),
    reviewNotes,
    updatedAt: new Date(),
  };
}

export function publishContribution(contribution: Contribution): Contribution {
  if (contribution.status !== 'approved') {
    throw new Error('Can only publish approved contributions');
  }

  return {
    ...contribution,
    status: 'published',
    updatedAt: new Date(),
  };
}

export function resubmitContribution(contribution: Contribution): Contribution {
  if (contribution.status !== 'draft' && contribution.status !== 'rejected') {
    throw new Error('Can only resubmit draft or rejected contributions');
  }

  return {
    ...contribution,
    status: 'submitted',
    submittedAt: new Date(),
    reviewNotes: undefined,
    rejectionReason: undefined,
    updatedAt: new Date(),
  };
}

// ========== Filtering & Sorting ==========

export function filterContributions(
  contributions: Contribution[],
  options: ContributionFilterOptions,
): Contribution[] {
  let filtered = [...contributions];

  // Status filter
  if (options.status && options.status.length > 0) {
    filtered = filtered.filter((c) => options.status!.includes(c.status));
  }

  // Type filter
  if (options.type && options.type.length > 0) {
    filtered = filtered.filter((c) => options.type!.includes(c.type));
  }

  // Author filter
  if (options.authorId) {
    filtered = filtered.filter((c) => c.authorId === options.authorId);
  }

  // Tags filter
  if (options.tags && options.tags.length > 0) {
    filtered = filtered.filter((c) =>
      c.tags?.some((tag) => options.tags!.includes(tag)),
    );
  }

  // Category filter
  if (options.categoryId) {
    filtered = filtered.filter((c) => c.categoryId === options.categoryId);
  }

  // Difficulty filter
  if (options.difficulty && options.difficulty.length > 0) {
    filtered = filtered.filter((c) => c.difficulty && options.difficulty!.includes(c.difficulty));
  }

  // Search query
  if (options.searchQuery) {
    const query = options.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.tags?.some((tag) => tag.toLowerCase().includes(query)),
    );
  }

  // Sorting
  if (options.sortBy === 'recent') {
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } else if (options.sortBy === 'oldest') {
    filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  } else if (options.sortBy === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }
  // 'reputation' sorting would require joining with contributor profiles

  // Pagination
  if (options.limit !== undefined) {
    const offset = options.offset || 0;
    filtered = filtered.slice(offset, offset + options.limit);
  }

  return filtered;
}

export function getContributionsByStatus(
  contributions: Contribution[],
  status: ContributionStatus,
): Contribution[] {
  return contributions.filter((c) => c.status === status);
}

export function getContributionsByType(
  contributions: Contribution[],
  type: ContributionType,
): Contribution[] {
  return contributions.filter((c) => c.type === type);
}

export function getContributionsByAuthor(
  contributions: Contribution[],
  authorId: string,
): Contribution[] {
  return contributions.filter((c) => c.authorId === authorId);
}

export function getPendingContributions(contributions: Contribution[]): Contribution[] {
  return contributions.filter((c) => c.status === 'submitted' || c.status === 'under_review');
}

export function searchContributions(
  contributions: Contribution[],
  query: string,
): Contribution[] {
  const lowerQuery = query.toLowerCase();
  return contributions.filter(
    (c) =>
      c.title.toLowerCase().includes(lowerQuery) ||
      c.description.toLowerCase().includes(lowerQuery) ||
      c.content.toLowerCase().includes(lowerQuery) ||
      c.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)),
  );
}

// ========== Contributor Profile Management ==========

export function calculateReputation(
  approvedSubmissions: number,
  averageReviewTime?: number,
): number {
  let reputation = approvedSubmissions * 10; // 10 points per approved submission

  // Bonus for fast review times (less than 48 hours)
  if (averageReviewTime && averageReviewTime < 48) {
    reputation += Math.floor((48 - averageReviewTime) / 2);
  }

  return reputation;
}

export function updateContributorStats(
  profile: ContributorProfile,
  contribution: Contribution,
  previousStatus?: ContributionStatus,
): ContributorProfile {
  const updated = { ...profile };

  // Update pending count
  if (contribution.status === 'submitted' || contribution.status === 'under_review') {
    updated.pendingSubmissions = (updated.pendingSubmissions || 0) + 1;
  }

  // If status changed from pending
  if (previousStatus === 'submitted' || previousStatus === 'under_review') {
    updated.pendingSubmissions = Math.max(0, (updated.pendingSubmissions || 0) - 1);
  }

  // Update approved count and reputation
  if (contribution.status === 'approved' || contribution.status === 'published') {
    if (previousStatus !== 'approved' && previousStatus !== 'published') {
      updated.approvedSubmissions += 1;
      updated.reputation = calculateReputation(
        updated.approvedSubmissions,
        updated.averageReviewTime,
      );
    }
  }

  updated.contributionsCount += 1;
  updated.updatedAt = new Date();

  return updated;
}

export function addExpertiseTag(profile: ContributorProfile, tag: string): ContributorProfile {
  if (profile.expertise.includes(tag)) {
    return profile;
  }

  return {
    ...profile,
    expertise: [...profile.expertise, tag],
    updatedAt: new Date(),
  };
}

export function addPreferredCategory(
  profile: ContributorProfile,
  category: string,
): ContributorProfile {
  if (profile.preferredCategories.includes(category)) {
    return profile;
  }

  return {
    ...profile,
    preferredCategories: [...profile.preferredCategories, category],
    updatedAt: new Date(),
  };
}

export function awardBadge(
  profile: ContributorProfile,
  badge: Omit<ContributorBadge, 'earnedAt'>,
): ContributorProfile {
  // Check if badge already exists
  if (profile.badges.some((b) => b.id === badge.id)) {
    return profile;
  }

  return {
    ...profile,
    badges: [
      ...profile.badges,
      {
        ...badge,
        earnedAt: new Date(),
      },
    ],
    updatedAt: new Date(),
  };
}

export function getTopContributors(
  profiles: ContributorProfile[],
  limit: number = 10,
): ContributorProfile[] {
  return [...profiles]
    .sort((a, b) => b.reputation - a.reputation)
    .slice(0, limit);
}

// ========== Review Management ==========

export function addReviewComment(review: Review, comment: ReviewComment): Review {
  return {
    ...review,
    comments: [...review.comments, comment],
  };
}

export function updateReviewStatus(
  review: Review,
  status: ReviewStatusType,
  decision?: ReviewDecision,
): Review {
  return {
    ...review,
    status,
    decision,
    completedAt: status === 'completed' ? new Date() : review.completedAt,
  };
}

export function getReviewByContribution(
  reviews: Review[],
  contributionId: string,
): Review | undefined {
  return reviews.find((r) => r.contributionId === contributionId);
}

export function getPendingReviews(reviews: Review[]): Review[] {
  return reviews.filter((r) => r.status === 'pending' || r.status === 'in_progress');
}

export function getReviewsByReviewer(reviews: Review[], reviewerId: string): Review[] {
  return reviews.filter((r) => r.reviewerId === reviewerId);
}

// ========== Draft Management ==========

export function saveDraftVersion(draft: Draft, content: string, autoSaved: boolean, changeSummary?: string): Draft {
  const version: DraftVersion = {
    id: generateVersionId(),
    content: content.trim(),
    savedAt: new Date(),
    changeSummary,
  };

  // Keep only last 10 versions
  const versions = [version, ...draft.versions].slice(0, 10);

  return {
    ...draft,
    content: content.trim(),
    lastSavedAt: new Date(),
    autoSaved,
    versions,
  };
}

export function getDraftsByAuthor(drafts: Draft[], authorId: string): Draft[] {
  return drafts.filter((d) => d.authorId === authorId);
}

export function getDraftsByType(drafts: Draft[], type: ContributionType): Draft[] {
  return drafts.filter((d) => d.type === type);
}

// ========== Statistics ==========

export function calculateContributionStats(
  contributions: Contribution[],
  profiles: ContributorProfile[],
): ContributionStats {
  const totalContributions = contributions.length;
  const pendingReview = contributions.filter(
    (c) => c.status === 'submitted' || c.status === 'under_review',
  ).length;
  const approvedContributions = contributions.filter(
    (c) => c.status === 'approved' || c.status === 'published',
  ).length;
  const rejectedContributions = contributions.filter((c) => c.status === 'rejected').length;
  const draftContributions = contributions.filter((c) => c.status === 'draft').length;

  // Calculate average review time
  const reviewedContributions = contributions.filter((c) => c.reviewedAt && c.submittedAt);
  const averageReviewTime =
    reviewedContributions.length > 0
      ? reviewedContributions.reduce((sum, c) => {
          const hours =
            (c.reviewedAt!.getTime() - c.submittedAt!.getTime()) / (1000 * 60 * 60);
          return sum + hours;
        }, 0) / reviewedContributions.length
      : 0;

  const topContributors = getTopContributors(profiles, 5);

  return {
    totalContributions,
    pendingReview,
    approvedContributions,
    rejectedContributions,
    draftContributions,
    averageReviewTime,
    topContributors,
  };
}

export function getContributorStats(contributions: Contribution[], authorId: string) {
  const authorContributions = getContributionsByAuthor(contributions, authorId);

  return {
    total: authorContributions.length,
    published: authorContributions.filter((c) => c.status === 'published').length,
    approved: authorContributions.filter((c) => c.status === 'approved').length,
    rejected: authorContributions.filter((c) => c.status === 'rejected').length,
    pending: authorContributions.filter(
      (c) => c.status === 'submitted' || c.status === 'under_review',
    ).length,
    draft: authorContributions.filter((c) => c.status === 'draft').length,
  };
}

// ========== Helper Functions ==========

function generateContributionId(): string {
  return `contrib-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function generateReviewId(): string {
  return `review-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function generateCommentId(): string {
  return `comment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function generateDraftId(): string {
  return `draft-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function generateVersionId(): string {
  return `version-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ========== Badge Definitions ==========

export const CONTRIBUTION_BADGES: Omit<ContributorBadge, 'earnedAt'>[] = [
  {
    id: 'first-submission',
    name: 'First Steps',
    description: 'Submitted your first contribution',
    icon: '🌱',
    criteria: 'Submit 1 contribution',
  },
  {
    id: 'published-author',
    name: 'Published Author',
    description: 'Had your first contribution published',
    icon: '📝',
    criteria: 'Have 1 published contribution',
  },
  {
    id: 'prolific-writer',
    name: 'Prolific Writer',
    description: 'Published 5 articles',
    icon: '✍️',
    criteria: 'Publish 5 articles',
  },
  {
    id: 'tutorial-creator',
    name: 'Tutorial Creator',
    description: 'Created a published tutorial',
    icon: '🎓',
    criteria: 'Have 1 published tutorial',
  },
  {
    id: 'path-builder',
    name: 'Path Builder',
    description: 'Created a published learning path',
    icon: '🗺️',
    criteria: 'Have 1 published learning path',
  },
  {
    id: 'top-contributor',
    name: 'Top Contributor',
    description: 'Reached top 10 contributors by reputation',
    icon: '🏆',
    criteria: 'Be in top 10 contributors',
  },
  {
    id: 'quality-content',
    name: 'Quality Content',
    description: 'Had 10 contributions published',
    icon: '⭐',
    criteria: 'Have 10 published contributions',
  },
];

export function checkAndAwardBadges(
  profile: ContributorProfile,
  contributions: Contribution[],
  allProfiles: ContributorProfile[],
): ContributorProfile {
  let updated = profile;
  const authorContributions = getContributionsByAuthor(contributions, profile.userId);

  // First submission
  if (authorContributions.length >= 1 && !hasBadge(updated, 'first-submission')) {
    updated = awardBadge(updated, CONTRIBUTION_BADGES[0]);
  }

  // Published author
  if (
    authorContributions.filter((c) => c.status === 'published').length >= 1 &&
    !hasBadge(updated, 'published-author')
  ) {
    updated = awardBadge(updated, CONTRIBUTION_BADGES[1]);
  }

  // Prolific writer (5 published articles)
  if (
    authorContributions.filter(
      (c) => c.status === 'published' && c.type === 'article',
    ).length >= 5 &&
    !hasBadge(updated, 'prolific-writer')
  ) {
    updated = awardBadge(updated, CONTRIBUTION_BADGES[2]);
  }

  // Tutorial creator
  if (
    authorContributions.filter(
      (c) => c.status === 'published' && c.type === 'tutorial',
    ).length >= 1 &&
    !hasBadge(updated, 'tutorial-creator')
  ) {
    updated = awardBadge(updated, CONTRIBUTION_BADGES[3]);
  }

  // Path builder
  if (
    authorContributions.filter(
      (c) => c.status === 'published' && c.type === 'path',
    ).length >= 1 &&
    !hasBadge(updated, 'path-builder')
  ) {
    updated = awardBadge(updated, CONTRIBUTION_BADGES[4]);
  }

  // Top contributor
  const topContributors = getTopContributors(allProfiles, 10);
  if (topContributors.some((c) => c.userId === profile.userId) && !hasBadge(updated, 'top-contributor')) {
    updated = awardBadge(updated, CONTRIBUTION_BADGES[5]);
  }

  // Quality content (10 published)
  if (
    authorContributions.filter((c) => c.status === 'published').length >= 10 &&
    !hasBadge(updated, 'quality-content')
  ) {
    updated = awardBadge(updated, CONTRIBUTION_BADGES[6]);
  }

  return updated;
}

function hasBadge(profile: ContributorProfile, badgeId: string): boolean {
  return profile.badges.some((b) => b.id === badgeId);
}
