import { describe, it, expect } from 'vitest';
import type {
  Contribution,
  ContributionType,
  ContributionStatus,
  ReviewDecision,
  ReviewStatusType,
  CreateContributionInput,
  ReviewComment,
  ContributorProfile,
  Draft,
} from '../types';
import {
  validateContribution,
  validateCreateContributionInput,
  validateReview,
  validateContributorProfile,
  validateDraft,
  createContribution,
  updateContribution,
  createReview,
  createReviewComment,
  createContributorProfile,
  createDraft,
  submitContribution,
  startReview,
  completeReview,
  publishContribution,
  resubmitContribution,
  filterContributions,
  getContributionsByStatus,
  getContributionsByType,
  getContributionsByAuthor,
  getPendingContributions,
  searchContributions,
  calculateReputation,
  updateContributorStats,
  addExpertiseTag,
  addPreferredCategory,
  awardBadge,
  getTopContributors,
  addReviewComment,
  updateReviewStatus,
  getReviewByContribution,
  getPendingReviews,
  getReviewsByReviewer,
  saveDraftVersion,
  getDraftsByAuthor,
  getDraftsByType,
  calculateContributionStats,
  getContributorStats,
  checkAndAwardBadges,
  CONTRIBUTION_BADGES,
} from './contribution-utils';

describe('contribution-utils', () => {
  // ========== Validation Tests ==========

  describe('validateContribution', () => {
    const validContribution: Contribution = {
      id: 'contrib-123',
      type: 'article',
      title: 'Test Article',
      description: 'A test article description',
      content: 'This is the content of the article with enough text to pass validation.',
      authorId: 'user-123',
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should validate a valid article contribution', () => {
      expect(validateContribution(validContribution)).toBe(true);
    });

    it('should reject null or undefined', () => {
      expect(validateContribution(null)).toBe(false);
      expect(validateContribution(undefined)).toBe(false);
    });

    it('should reject non-object values', () => {
      expect(validateContribution('string')).toBe(false);
      expect(validateContribution(123)).toBe(false);
      expect(validateContribution([])).toBe(false);
    });

    it('should reject missing required fields', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...invalid } = validContribution;
      expect(validateContribution(invalid)).toBe(false);
    });

    it('should reject invalid contribution type', () => {
      const invalid = { ...validContribution, type: 'invalid' as ContributionType };
      expect(validateContribution(invalid)).toBe(false);
    });

    it('should reject title that is too short', () => {
      const invalid = { ...validContribution, title: 'Hi' };
      expect(validateContribution(invalid)).toBe(false);
    });

    it('should reject title that is too long', () => {
      const invalid = { ...validContribution, title: 'a'.repeat(201) };
      expect(validateContribution(invalid)).toBe(false);
    });

    it('should reject description that is too short', () => {
      const invalid = { ...validContribution, description: 'Short' };
      expect(validateContribution(invalid)).toBe(false);
    });

    it('should reject description that is too long', () => {
      const invalid = { ...validContribution, description: 'a'.repeat(501) };
      expect(validateContribution(invalid)).toBe(false);
    });

    it('should reject content that is too short', () => {
      const invalid = { ...validContribution, content: 'Short' };
      expect(validateContribution(invalid)).toBe(false);
    });

    it('should reject invalid status', () => {
      const invalid = { ...validContribution, status: 'invalid' as ContributionStatus };
      expect(validateContribution(invalid)).toBe(false);
    });

    it('should reject submitted status without submittedAt', () => {
      const invalid = { ...validContribution, status: 'submitted' as ContributionStatus };
      expect(validateContribution(invalid)).toBe(false);
    });

    it('should reject approved status without reviewedAt', () => {
      const invalid = {
        ...validContribution,
        status: 'approved' as ContributionStatus,
        reviewedAt: undefined,
      };
      expect(validateContribution(invalid)).toBe(false);
    });

    it('should validate a valid tutorial contribution', () => {
      const tutorial: Contribution = {
        id: 'contrib-123',
        type: 'tutorial',
        title: 'Test Tutorial',
        description: 'A test tutorial description',
        content: 'This is the tutorial content with enough text to pass the validation requirements.',
        authorId: 'user-123',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        difficulty: 'beginner',
        estimatedMinutes: 30,
        steps: [
          {
            id: 'step-1',
            title: 'Step 1',
            content: 'Step content',
            order: 1,
          },
        ],
        learningObjectives: ['Learn something'],
      };
      expect(validateContribution(tutorial)).toBe(true);
    });

    it('should reject tutorial without steps', () => {
      const tutorial: Contribution = {
        id: 'contrib-123',
        type: 'tutorial',
        title: 'Test Tutorial',
        description: 'A test tutorial description',
        content: 'This is the tutorial content with enough text to pass the validation requirements.',
        authorId: 'user-123',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        difficulty: 'beginner',
        estimatedMinutes: 30,
        steps: [],
        learningObjectives: ['Learn something'],
      };
      expect(validateContribution(tutorial)).toBe(false);
    });

    it('should reject tutorial without learning objectives', () => {
      const tutorial: Contribution = {
        id: 'contrib-123',
        type: 'tutorial',
        title: 'Test Tutorial',
        description: 'A test tutorial description',
        content: 'This is the tutorial content with enough text to pass the validation requirements.',
        authorId: 'user-123',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        difficulty: 'beginner',
        estimatedMinutes: 30,
        steps: [
          {
            id: 'step-1',
            title: 'Step 1',
            content: 'Step content',
            order: 1,
          },
        ],
        learningObjectives: [],
      };
      expect(validateContribution(tutorial)).toBe(false);
    });

    it('should validate a valid path contribution', () => {
      const path: Contribution = {
        id: 'contrib-123',
        type: 'path',
        title: 'Test Path',
        description: 'A test path description',
        content: 'This is the path content with enough text to pass the validation requirements.',
        authorId: 'user-123',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        difficulty: 'beginner',
        estimatedMinutes: 60,
        items: [
          {
            id: 'item-1',
            type: 'article',
            slug: 'test-article',
            title: 'Test Article',
            estimatedMinutes: 10,
            order: 1,
          },
        ],
        targetAudience: ['Beginners'],
        learningObjectives: ['Learn path'],
      };
      expect(validateContribution(path)).toBe(true);
    });

    it('should reject path without items', () => {
      const path: Contribution = {
        id: 'contrib-123',
        type: 'path',
        title: 'Test Path',
        description: 'A test path description',
        content: 'This is the path content with enough text to pass the validation requirements.',
        authorId: 'user-123',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        difficulty: 'beginner',
        estimatedMinutes: 60,
        items: [],
        targetAudience: ['Beginners'],
        learningObjectives: ['Learn path'],
      };
      expect(validateContribution(path)).toBe(false);
    });
  });

  describe('validateCreateContributionInput', () => {
    const validInput: CreateContributionInput = {
      type: 'article',
      title: 'Test Article',
      description: 'A test article description',
      content: 'This is the content of the article with enough text to pass validation.',
      authorId: 'user-123',
    };

    it('should validate a valid article input', () => {
      expect(validateCreateContributionInput(validInput)).toBe(true);
    });

    it('should reject null or undefined', () => {
      expect(validateCreateContributionInput(null)).toBe(false);
      expect(validateCreateContributionInput(undefined)).toBe(false);
    });

    it('should reject missing type', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { type, ...invalid } = validInput;
      expect(validateCreateContributionInput(invalid)).toBe(false);
    });

    it('should reject invalid type', () => {
      const invalid = { ...validInput, type: 'invalid' as ContributionType };
      expect(validateCreateContributionInput(invalid)).toBe(false);
    });

    it('should validate a valid tutorial input', () => {
      const tutorialInput: CreateContributionInput = {
        type: 'tutorial',
        title: 'Test Tutorial',
        description: 'A test tutorial description',
        content: 'This is the tutorial content with enough text to pass the validation requirements.',
        authorId: 'user-123',
        difficulty: 'beginner',
        estimatedMinutes: 30,
        steps: [
          {
            title: 'Step 1',
            content: 'Step content',
            order: 1,
          },
        ],
        learningObjectives: ['Learn something'],
      };
      expect(validateCreateContributionInput(tutorialInput)).toBe(true);
    });

    it('should validate a valid path input', () => {
      const pathInput: CreateContributionInput = {
        type: 'path',
        title: 'Test Path',
        description: 'A test path description',
        content: 'This is the path content with enough text to pass the validation requirements.',
        authorId: 'user-123',
        difficulty: 'beginner',
        estimatedMinutes: 60,
        items: [
          {
            type: 'article',
            slug: 'test-article',
            title: 'Test Article',
            estimatedMinutes: 10,
            order: 1,
          },
        ],
        targetAudience: ['Beginners'],
        learningObjectives: ['Learn path'],
      };
      expect(validateCreateContributionInput(pathInput)).toBe(true);
    });
  });

  describe('validateReview', () => {
    const validReview = {
      id: 'review-123',
      contributionId: 'contrib-123',
      reviewerId: 'reviewer-123',
      status: 'pending' as ReviewStatusType,
      comments: [] as ReviewComment[],
      createdAt: new Date(),
    };

    it('should validate a valid review', () => {
      expect(validateReview(validReview)).toBe(true);
    });

    it('should reject null or undefined', () => {
      expect(validateReview(null)).toBe(false);
      expect(validateReview(undefined)).toBe(false);
    });

    it('should reject completed review without decision', () => {
      const invalid = { ...validReview, status: 'completed' as ReviewStatusType };
      expect(validateReview(invalid)).toBe(false);
    });

    it('should accept completed review with decision', () => {
      const valid = { ...validReview, status: 'completed' as ReviewStatusType, decision: 'approve' as ReviewDecision };
      expect(validateReview(valid)).toBe(true);
    });
  });

  describe('validateContributorProfile', () => {
    const validProfile: ContributorProfile = {
      userId: 'user-123',
      username: 'testuser',
      displayName: 'Test User',
      bio: 'This is a test bio for the user profile.',
      reputation: 100,
      contributionsCount: 5,
      approvedSubmissions: 3,
      pendingSubmissions: 1,
      badges: [],
      expertise: ['javascript'],
      preferredCategories: ['programming'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should validate a valid profile', () => {
      expect(validateContributorProfile(validProfile)).toBe(true);
    });

    it('should reject username that is too short', () => {
      const invalid = { ...validProfile, username: 'a' };
      expect(validateContributorProfile(invalid)).toBe(false);
    });

    it('should reject username that is too long', () => {
      const invalid = { ...validProfile, username: 'a'.repeat(31) };
      expect(validateContributorProfile(invalid)).toBe(false);
    });

    it('should reject username with invalid characters', () => {
      const invalid = { ...validProfile, username: 'invalid user!' };
      expect(validateContributorProfile(invalid)).toBe(false);
    });

    it('should accept valid username with underscores and hyphens', () => {
      const valid = { ...validProfile, username: 'test_user-123' };
      expect(validateContributorProfile(valid)).toBe(true);
    });

    it('should reject negative reputation', () => {
      const invalid = { ...validProfile, reputation: -10 };
      expect(validateContributorProfile(invalid)).toBe(false);
    });

    it('should reject negative contribution counts', () => {
      const invalid = { ...validProfile, contributionsCount: -1 };
      expect(validateContributorProfile(invalid)).toBe(false);
    });
  });

  describe('validateDraft', () => {
    const validDraft: Draft = {
      id: 'draft-123',
      authorId: 'user-123',
      type: 'article',
      title: 'Draft Article',
      content: 'Draft content',
      lastSavedAt: new Date(),
      autoSaved: false,
      versions: [],
    };

    it('should validate a valid draft', () => {
      expect(validateDraft(validDraft)).toBe(true);
    });

    it('should reject null or undefined', () => {
      expect(validateDraft(null)).toBe(false);
      expect(validateDraft(undefined)).toBe(false);
    });

    it('should reject invalid type', () => {
      const invalid = { ...validDraft, type: 'invalid' as ContributionType };
      expect(validateDraft(invalid)).toBe(false);
    });
  });

  // ========== Factory Functions Tests ==========

  describe('createContribution', () => {
    it('should create an article contribution', () => {
      const input: CreateContributionInput = {
        type: 'article',
        title: 'Test Article',
        description: 'Test description',
        content: 'Test content with enough length',
        authorId: 'user-123',
      };

      const contribution = createContribution(input);

      expect(contribution.id).toBeDefined();
      expect(contribution.type).toBe('article');
      expect(contribution.title).toBe('Test Article');
      expect(contribution.status).toBe('draft');
      expect(contribution.createdAt).toBeInstanceOf(Date);
      expect(contribution.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a tutorial contribution with IDs for steps', () => {
      const input: CreateContributionInput = {
        type: 'tutorial',
        title: 'Test Tutorial',
        description: 'Test description',
        content: 'Test content',
        authorId: 'user-123',
        difficulty: 'beginner',
        estimatedMinutes: 30,
        steps: [
          { title: 'Step 1', content: 'Content 1', order: 1 },
          { title: 'Step 2', content: 'Content 2', order: 2 },
        ],
        learningObjectives: ['Learn'],
      };

      const contribution = createContribution(input);

      expect(contribution.type).toBe('tutorial');
      expect(contribution.steps).toHaveLength(2);
      expect(contribution.steps![0].id).toBeDefined();
      expect(contribution.steps![1].id).toBeDefined();
    });

    it('should create a path contribution with IDs for items', () => {
      const input: CreateContributionInput = {
        type: 'path',
        title: 'Test Path',
        description: 'Test description',
        content: 'Test content',
        authorId: 'user-123',
        difficulty: 'beginner',
        estimatedMinutes: 60,
        items: [
          { type: 'article', slug: 'test-1', title: 'Test 1', estimatedMinutes: 10, order: 1 },
        ],
        targetAudience: ['Beginners'],
        learningObjectives: ['Learn'],
      };

      const contribution = createContribution(input);

      expect(contribution.type).toBe('path');
      expect(contribution.items).toHaveLength(1);
      expect(contribution.items![0].id).toBeDefined();
    });

    it('should trim title, description, and content', () => {
      const input: CreateContributionInput = {
        type: 'article',
        title: '  Test Article  ',
        description: '  Test description  ',
        content: '  Test content  ',
        authorId: 'user-123',
      };

      const contribution = createContribution(input);

      expect(contribution.title).toBe('Test Article');
      expect(contribution.description).toBe('Test description');
      expect(contribution.content).toBe('Test content');
    });

    it('should filter empty tags', () => {
      const input: CreateContributionInput = {
        type: 'article',
        title: 'Test Article',
        description: 'Test description',
        content: 'Test content',
        authorId: 'user-123',
        tags: ['javascript', '', '  ', 'typescript'],
      };

      const contribution = createContribution(input);

      expect(contribution.tags).toEqual(['javascript', 'typescript']);
    });
  });

  describe('updateContribution', () => {
    it('should update contribution fields', () => {
      const contribution: Contribution = {
        id: 'contrib-123',
        type: 'article',
        title: 'Original Title',
        description: 'Original description',
        content: 'Original content',
        authorId: 'user-123',
        status: 'draft',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const updated = updateContribution(contribution, {
        title: 'Updated Title',
        description: 'Updated description',
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.description).toBe('Updated description');
      expect(updated.content).toBe('Original content');
      expect(updated.updatedAt.getTime()).toBeGreaterThan(contribution.updatedAt.getTime());
    });

    it('should trim updated fields', () => {
      const contribution: Contribution = {
        id: 'contrib-123',
        type: 'article',
        title: 'Original Title',
        description: 'Original description',
        content: 'Original content',
        authorId: 'user-123',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updated = updateContribution(contribution, {
        title: '  Updated Title  ',
      });

      expect(updated.title).toBe('Updated Title');
    });

    it('should filter empty tags in updates', () => {
      const contribution: Contribution = {
        id: 'contrib-123',
        type: 'article',
        title: 'Original Title',
        description: 'Original description',
        content: 'Original content',
        authorId: 'user-123',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['javascript'],
      };

      const updated = updateContribution(contribution, {
        tags: ['typescript', '', 'python'],
      });

      expect(updated.tags).toEqual(['typescript', 'python']);
    });
  });

  describe('createReview', () => {
    it('should create a review with generated ID', () => {
      const review = createReview('contrib-123', 'reviewer-123');

      expect(review.id).toBeDefined();
      expect(review.contributionId).toBe('contrib-123');
      expect(review.reviewerId).toBe('reviewer-123');
      expect(review.status).toBe('pending');
      expect(review.comments).toEqual([]);
      expect(review.createdAt).toBeInstanceOf(Date);
    });

    it('should create a review with comments', () => {
      const comments: ReviewComment[] = [
        {
          id: 'comment-1',
          reviewerId: 'reviewer-123',
          content: 'Test comment',
          type: 'suggestion',
          createdAt: new Date(),
        },
      ];

      const review = createReview('contrib-123', 'reviewer-123', comments);

      expect(review.comments).toEqual(comments);
    });
  });

  describe('createReviewComment', () => {
    it('should create a review comment', () => {
      const comment = createReviewComment('reviewer-123', 'Fix this issue', 'issue');

      expect(comment.id).toBeDefined();
      expect(comment.reviewerId).toBe('reviewer-123');
      expect(comment.content).toBe('Fix this issue');
      expect(comment.type).toBe('issue');
      expect(comment.createdAt).toBeInstanceOf(Date);
    });

    it('should default to suggestion type', () => {
      const comment = createReviewComment('reviewer-123', 'Suggestion');

      expect(comment.type).toBe('suggestion');
    });

    it('should trim content', () => {
      const comment = createReviewComment('reviewer-123', '  Suggestion  ');

      expect(comment.content).toBe('Suggestion');
    });
  });

  describe('createContributorProfile', () => {
    it('should create a contributor profile', () => {
      const profile = createContributorProfile('user-123', 'testuser', 'Test User', 'Test bio');

      expect(profile.userId).toBe('user-123');
      expect(profile.username).toBe('testuser');
      expect(profile.displayName).toBe('Test User');
      expect(profile.bio).toBe('Test bio');
      expect(profile.reputation).toBe(0);
      expect(profile.contributionsCount).toBe(0);
      expect(profile.approvedSubmissions).toBe(0);
      expect(profile.badges).toEqual([]);
      expect(profile.expertise).toEqual([]);
      expect(profile.preferredCategories).toEqual([]);
    });

    it('should trim fields', () => {
      const profile = createContributorProfile('user-123', '  testuser  ', '  Test User  ', '  Test bio  ');

      expect(profile.username).toBe('testuser');
      expect(profile.displayName).toBe('Test User');
      expect(profile.bio).toBe('Test bio');
    });
  });

  describe('createDraft', () => {
    it('should create a draft', () => {
      const draft = createDraft('user-123', 'article', 'Draft Title', 'Draft content');

      expect(draft.id).toBeDefined();
      expect(draft.authorId).toBe('user-123');
      expect(draft.type).toBe('article');
      expect(draft.title).toBe('Draft Title');
      expect(draft.content).toBe('Draft content');
      expect(draft.autoSaved).toBe(false);
      expect(draft.versions).toHaveLength(1);
      expect(draft.versions[0].content).toBe('Draft content');
    });

    it('should trim title and content', () => {
      const draft = createDraft('user-123', 'article', '  Draft Title  ', '  Draft content  ');

      expect(draft.title).toBe('Draft Title');
      expect(draft.content).toBe('Draft content');
    });
  });

  // ========== Status Management Tests ==========

  describe('submitContribution', () => {
    it('should submit a draft contribution', () => {
      const contribution: Contribution = {
        id: 'contrib-123',
        type: 'article',
        title: 'Test',
        description: 'Test',
        content: 'Test content',
        authorId: 'user-123',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const submitted = submitContribution(contribution);

      expect(submitted.status).toBe('submitted');
      expect(submitted.submittedAt).toBeInstanceOf(Date);
    });

    it('should throw error for non-draft contribution', () => {
      const contribution: Contribution = {
        id: 'contrib-123',
        type: 'article',
        title: 'Test',
        description: 'Test',
        content: 'Test content',
        authorId: 'user-123',
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => submitContribution(contribution)).toThrow();
    });
  });

  describe('startReview', () => {
    it('should start review for submitted contribution', () => {
      const contribution: Contribution = {
        id: 'contrib-123',
        type: 'article',
        title: 'Test',
        description: 'Test',
        content: 'Test content',
        authorId: 'user-123',
        status: 'submitted',
        createdAt: new Date(),
        updatedAt: new Date(),
        submittedAt: new Date(),
      };

      const underReview = startReview(contribution, 'reviewer-123');

      expect(underReview.status).toBe('under_review');
      expect(underReview.reviewerId).toBe('reviewer-123');
    });

    it('should throw error for non-submitted contribution', () => {
      const contribution: Contribution = {
        id: 'contrib-123',
        type: 'article',
        title: 'Test',
        description: 'Test',
        content: 'Test content',
        authorId: 'user-123',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => startReview(contribution, 'reviewer-123')).toThrow();
    });
  });

  describe('completeReview', () => {
    it('should approve contribution', () => {
      const contribution: Contribution = {
        id: 'contrib-123',
        type: 'article',
        title: 'Test',
        description: 'Test',
        content: 'Test content',
        authorId: 'user-123',
        status: 'under_review',
        createdAt: new Date(),
        updatedAt: new Date(),
        submittedAt: new Date(),
        reviewerId: 'reviewer-123',
      };

      const approved = completeReview(contribution, 'approve', ['Looks good!']);

      expect(approved.status).toBe('approved');
      expect(approved.reviewedAt).toBeInstanceOf(Date);
      expect(approved.reviewNotes).toEqual(['Looks good!']);
    });

    it('should reject contribution', () => {
      const contribution: Contribution = {
        id: 'contrib-123',
        type: 'article',
        title: 'Test',
        description: 'Test',
        content: 'Test content',
        authorId: 'user-123',
        status: 'under_review',
        createdAt: new Date(),
        updatedAt: new Date(),
        submittedAt: new Date(),
        reviewerId: 'reviewer-123',
      };

      const rejected = completeReview(contribution, 'reject', ['Needs improvement']);

      expect(rejected.status).toBe('rejected');
      expect(rejected.reviewedAt).toBeInstanceOf(Date);
    });

    it('should request changes and return to draft', () => {
      const contribution: Contribution = {
        id: 'contrib-123',
        type: 'article',
        title: 'Test',
        description: 'Test',
        content: 'Test content',
        authorId: 'user-123',
        status: 'under_review',
        createdAt: new Date(),
        updatedAt: new Date(),
        submittedAt: new Date(),
        reviewerId: 'reviewer-123',
      };

      const needsChanges = completeReview(contribution, 'request_changes', ['Fix typos']);

      expect(needsChanges.status).toBe('draft');
    });

    it('should throw error for non-under-review contribution', () => {
      const contribution: Contribution = {
        id: 'contrib-123',
        type: 'article',
        title: 'Test',
        description: 'Test',
        content: 'Test content',
        authorId: 'user-123',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => completeReview(contribution, 'approve')).toThrow();
    });
  });

  describe('publishContribution', () => {
    it('should publish approved contribution', () => {
      const contribution: Contribution = {
        id: 'contrib-123',
        type: 'article',
        title: 'Test',
        description: 'Test',
        content: 'Test content',
        authorId: 'user-123',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
        reviewedAt: new Date(),
      };

      const published = publishContribution(contribution);

      expect(published.status).toBe('published');
    });

    it('should throw error for non-approved contribution', () => {
      const contribution: Contribution = {
        id: 'contrib-123',
        type: 'article',
        title: 'Test',
        description: 'Test',
        content: 'Test content',
        authorId: 'user-123',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => publishContribution(contribution)).toThrow();
    });
  });

  describe('resubmitContribution', () => {
    it('should resubmit draft contribution', () => {
      const contribution: Contribution = {
        id: 'contrib-123',
        type: 'article',
        title: 'Test',
        description: 'Test',
        content: 'Test content',
        authorId: 'user-123',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        reviewNotes: ['Fix this'],
        rejectionReason: 'Needs work',
      };

      const resubmitted = resubmitContribution(contribution);

      expect(resubmitted.status).toBe('submitted');
      expect(resubmitted.reviewNotes).toBeUndefined();
      expect(resubmitted.rejectionReason).toBeUndefined();
    });

    it('should resubmit rejected contribution', () => {
      const contribution: Contribution = {
        id: 'contrib-123',
        type: 'article',
        title: 'Test',
        description: 'Test',
        content: 'Test content',
        authorId: 'user-123',
        status: 'rejected',
        createdAt: new Date(),
        updatedAt: new Date(),
        reviewedAt: new Date(),
        rejectionReason: 'Needs work',
      };

      const resubmitted = resubmitContribution(contribution);

      expect(resubmitted.status).toBe('submitted');
      expect(resubmitted.rejectionReason).toBeUndefined();
    });

    it('should throw error for submitted contribution', () => {
      const contribution: Contribution = {
        id: 'contrib-123',
        type: 'article',
        title: 'Test',
        description: 'Test',
        content: 'Test content',
        authorId: 'user-123',
        status: 'submitted',
        createdAt: new Date(),
        updatedAt: new Date(),
        submittedAt: new Date(),
      };

      expect(() => resubmitContribution(contribution)).toThrow();
    });
  });

  // ========== Filtering & Sorting Tests ==========

  describe('filterContributions', () => {
    const contributions: Contribution[] = [
      {
        id: '1',
        type: 'article',
        title: 'JavaScript Guide',
        description: 'Learn JS',
        content: 'JS content',
        authorId: 'user-1',
        status: 'published',
        tags: ['javascript', 'programming'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        type: 'tutorial',
        title: 'React Tutorial',
        description: 'Learn React',
        content: 'This is the React content with enough text to pass the validation requirements.',
        authorId: 'user-2',
        status: 'draft',
        difficulty: 'beginner',
        estimatedMinutes: 30,
        steps: [{ id: 's1', title: 'Step', content: 'Content', order: 1 }],
        learningObjectives: ['Learn'],
        tags: ['react'],
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
      {
        id: '3',
        type: 'article',
        title: 'Python Guide',
        description: 'Learn Python',
        content: 'Python content',
        authorId: 'user-1',
        status: 'submitted',
        tags: ['python', 'programming'],
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
        submittedAt: new Date(),
      },
    ];

    it('should filter by status', () => {
      const filtered = filterContributions(contributions, { status: ['published'] });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should filter by multiple statuses', () => {
      const filtered = filterContributions(contributions, { status: ['published', 'draft'] });
      expect(filtered).toHaveLength(2);
    });

    it('should filter by type', () => {
      const filtered = filterContributions(contributions, { type: ['article'] });
      expect(filtered).toHaveLength(2);
    });

    it('should filter by author', () => {
      const filtered = filterContributions(contributions, { authorId: 'user-1' });
      expect(filtered).toHaveLength(2);
    });

    it('should filter by tags', () => {
      const filtered = filterContributions(contributions, { tags: ['programming'] });
      expect(filtered).toHaveLength(2);
    });

    it('should search by query', () => {
      const filtered = filterContributions(contributions, { searchQuery: 'react' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('2');
    });

    it('should sort by recent', () => {
      const filtered = filterContributions(contributions, { sortBy: 'recent' });
      expect(filtered[0].id).toBe('3');
      expect(filtered[2].id).toBe('1');
    });

    it('should sort by oldest', () => {
      const filtered = filterContributions(contributions, { sortBy: 'oldest' });
      expect(filtered[0].id).toBe('1');
      expect(filtered[2].id).toBe('3');
    });

    it('should sort by title', () => {
      const filtered = filterContributions(contributions, { sortBy: 'title' });
      expect(filtered[0].title).toBe('JavaScript Guide');
      expect(filtered[2].title).toBe('React Tutorial');
    });

    it('should apply limit', () => {
      const filtered = filterContributions(contributions, { limit: 2 });
      expect(filtered).toHaveLength(2);
    });

    it('should apply offset', () => {
      const filtered = filterContributions(contributions, { limit: 1, offset: 1 });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('2');
    });

    it('should return all when no filters', () => {
      const filtered = filterContributions(contributions, {});
      expect(filtered).toHaveLength(3);
    });
  });

  describe('getContributionsByStatus', () => {
    const contributions: Contribution[] = [
      { id: '1', type: 'article', title: 'A', description: 'D', content: 'C', authorId: 'u', status: 'draft', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', type: 'article', title: 'B', description: 'D', content: 'C', authorId: 'u', status: 'published', createdAt: new Date(), updatedAt: new Date() },
      { id: '3', type: 'article', title: 'C', description: 'D', content: 'C', authorId: 'u', status: 'published', createdAt: new Date(), updatedAt: new Date() },
    ];

    it('should filter by status', () => {
      const published = getContributionsByStatus(contributions, 'published');
      expect(published).toHaveLength(2);
      expect(published.every((c) => c.status === 'published')).toBe(true);
    });
  });

  describe('getContributionsByType', () => {
    const contributions: Contribution[] = [
      { id: '1', type: 'article', title: 'A', description: 'D', content: 'C', authorId: 'u', status: 'draft', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', type: 'tutorial', title: 'B', description: 'D', content: 'C', authorId: 'u', status: 'draft', difficulty: 'beginner', estimatedMinutes: 10, steps: [{ id: 's', title: 'S', content: 'C', order: 1 }], learningObjectives: ['L'], createdAt: new Date(), updatedAt: new Date() },
      { id: '3', type: 'article', title: 'C', description: 'D', content: 'C', authorId: 'u', status: 'draft', createdAt: new Date(), updatedAt: new Date() },
    ];

    it('should filter by type', () => {
      const articles = getContributionsByType(contributions, 'article');
      expect(articles).toHaveLength(2);
      expect(articles.every((c) => c.type === 'article')).toBe(true);
    });
  });

  describe('getContributionsByAuthor', () => {
    const contributions: Contribution[] = [
      { id: '1', type: 'article', title: 'A', description: 'D', content: 'C', authorId: 'user-1', status: 'draft', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', type: 'article', title: 'B', description: 'D', content: 'C', authorId: 'user-2', status: 'draft', createdAt: new Date(), updatedAt: new Date() },
      { id: '3', type: 'article', title: 'C', description: 'D', content: 'C', authorId: 'user-1', status: 'draft', createdAt: new Date(), updatedAt: new Date() },
    ];

    it('should filter by author', () => {
      const user1Contributions = getContributionsByAuthor(contributions, 'user-1');
      expect(user1Contributions).toHaveLength(2);
      expect(user1Contributions.every((c) => c.authorId === 'user-1')).toBe(true);
    });
  });

  describe('getPendingContributions', () => {
    const contributions: Contribution[] = [
      { id: '1', type: 'article', title: 'A', description: 'D', content: 'C', authorId: 'u', status: 'draft', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', type: 'article', title: 'B', description: 'D', content: 'C', authorId: 'u', status: 'submitted', createdAt: new Date(), updatedAt: new Date(), submittedAt: new Date() },
      { id: '3', type: 'article', title: 'C', description: 'D', content: 'C', authorId: 'u', status: 'under_review', createdAt: new Date(), updatedAt: new Date(), submittedAt: new Date(), reviewerId: 'r' },
      { id: '4', type: 'article', title: 'D', description: 'D', content: 'C', authorId: 'u', status: 'published', createdAt: new Date(), updatedAt: new Date() },
    ];

    it('should get submitted and under_review contributions', () => {
      const pending = getPendingContributions(contributions);
      expect(pending).toHaveLength(2);
      expect(pending.map((c) => c.id).sort()).toEqual(['2', '3']);
    });
  });

  describe('searchContributions', () => {
    const contributions: Contribution[] = [
      { id: '1', type: 'article', title: 'JavaScript Guide', description: 'Learn JS basics', content: 'Content', authorId: 'u', status: 'draft', tags: ['javascript'], createdAt: new Date(), updatedAt: new Date() },
      { id: '2', type: 'article', title: 'Python Tutorial', description: 'Learn Python', content: 'Content', authorId: 'u', status: 'draft', tags: ['python'], createdAt: new Date(), updatedAt: new Date() },
      { id: '3', type: 'article', title: 'React Guide', description: 'Build apps', content: 'React content', authorId: 'u', status: 'draft', tags: ['react'], createdAt: new Date(), updatedAt: new Date() },
    ];

    it('should search by title', () => {
      const results = searchContributions(contributions, 'javascript');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('1');
    });

    it('should search by description', () => {
      const results = searchContributions(contributions, 'learn');
      expect(results).toHaveLength(2);
    });

    it('should search by content', () => {
      const results = searchContributions(contributions, 'react content');
      expect(results).toHaveLength(1);
    });

    it('should search by tags', () => {
      const results = searchContributions(contributions, 'python');
      expect(results).toHaveLength(1);
    });

    it('should be case insensitive', () => {
      const results = searchContributions(contributions, 'JAVASCRIPT');
      expect(results).toHaveLength(1);
    });
  });

  // ========== Contributor Profile Management Tests ==========

  describe('calculateReputation', () => {
    it('should calculate base reputation from approved submissions', () => {
      expect(calculateReputation(5)).toBe(50);
      expect(calculateReputation(10)).toBe(100);
    });

    it('should add bonus for fast review times', () => {
      expect(calculateReputation(5, 24)).toBe(62); // 50 + (48-24)/2 = 62
      expect(calculateReputation(5, 10)).toBe(69); // 50 + (48-10)/2 = 69
    });

    it('should not add bonus for slow review times', () => {
      expect(calculateReputation(5, 72)).toBe(50);
    });
  });

  describe('updateContributorStats', () => {
    it('should increment pending submissions', () => {
      const profile: ContributorProfile = {
        userId: 'user-1',
        username: 'test',
        displayName: 'Test',
        bio: 'Bio',
        reputation: 0,
        contributionsCount: 0,
        approvedSubmissions: 0,
        pendingSubmissions: 0,
        badges: [],
        expertise: [],
        preferredCategories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const contribution: Contribution = {
        id: 'c1',
        type: 'article',
        title: 'Test',
        description: 'Test',
        content: 'Content',
        authorId: 'user-1',
        status: 'submitted',
        createdAt: new Date(),
        updatedAt: new Date(),
        submittedAt: new Date(),
      };

      const updated = updateContributorStats(profile, contribution);

      expect(updated.pendingSubmissions).toBe(1);
      expect(updated.contributionsCount).toBe(1);
    });

    it('should update approved submissions and reputation', () => {
      const profile: ContributorProfile = {
        userId: 'user-1',
        username: 'test',
        displayName: 'Test',
        bio: 'Bio',
        reputation: 0,
        contributionsCount: 0,
        approvedSubmissions: 0,
        pendingSubmissions: 1,
        badges: [],
        expertise: [],
        preferredCategories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const contribution: Contribution = {
        id: 'c1',
        type: 'article',
        title: 'Test',
        description: 'Test',
        content: 'Content',
        authorId: 'user-1',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
        submittedAt: new Date(),
        reviewedAt: new Date(),
      };

      const updated = updateContributorStats(profile, contribution, 'submitted');

      expect(updated.approvedSubmissions).toBe(1);
      expect(updated.pendingSubmissions).toBe(0);
      expect(updated.reputation).toBe(10);
    });
  });

  describe('addExpertiseTag', () => {
    it('should add expertise tag', () => {
      const profile: ContributorProfile = {
        userId: 'u',
        username: 't',
        displayName: 'T',
        bio: 'B',
        reputation: 0,
        contributionsCount: 0,
        approvedSubmissions: 0,
        pendingSubmissions: 0,
        badges: [],
        expertise: [],
        preferredCategories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updated = addExpertiseTag(profile, 'javascript');

      expect(updated.expertise).toContain('javascript');
    });

    it('should not add duplicate expertise tag', () => {
      const profile: ContributorProfile = {
        userId: 'u',
        username: 't',
        displayName: 'T',
        bio: 'B',
        reputation: 0,
        contributionsCount: 0,
        approvedSubmissions: 0,
        pendingSubmissions: 0,
        badges: [],
        expertise: ['javascript'],
        preferredCategories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updated = addExpertiseTag(profile, 'javascript');

      expect(updated.expertise).toHaveLength(1);
    });
  });

  describe('addPreferredCategory', () => {
    it('should add preferred category', () => {
      const profile: ContributorProfile = {
        userId: 'u',
        username: 't',
        displayName: 'T',
        bio: 'B',
        reputation: 0,
        contributionsCount: 0,
        approvedSubmissions: 0,
        pendingSubmissions: 0,
        badges: [],
        expertise: [],
        preferredCategories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updated = addPreferredCategory(profile, 'programming');

      expect(updated.preferredCategories).toContain('programming');
    });

    it('should not add duplicate category', () => {
      const profile: ContributorProfile = {
        userId: 'u',
        username: 't',
        displayName: 'T',
        bio: 'B',
        reputation: 0,
        contributionsCount: 0,
        approvedSubmissions: 0,
        pendingSubmissions: 0,
        badges: [],
        expertise: [],
        preferredCategories: ['programming'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updated = addPreferredCategory(profile, 'programming');

      expect(updated.preferredCategories).toHaveLength(1);
    });
  });

  describe('awardBadge', () => {
    it('should award badge to profile', () => {
      const profile: ContributorProfile = {
        userId: 'u',
        username: 't',
        displayName: 'T',
        bio: 'B',
        reputation: 0,
        contributionsCount: 0,
        approvedSubmissions: 0,
        pendingSubmissions: 0,
        badges: [],
        expertise: [],
        preferredCategories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const badge = {
        id: 'badge-1',
        name: 'First Badge',
        description: 'Description',
        icon: '🏅',
        criteria: 'Criteria',
      };

      const updated = awardBadge(profile, badge);

      expect(updated.badges).toHaveLength(1);
      expect(updated.badges[0].id).toBe('badge-1');
      expect(updated.badges[0].earnedAt).toBeInstanceOf(Date);
    });

    it('should not award duplicate badge', () => {
      const profile: ContributorProfile = {
        userId: 'u',
        username: 't',
        displayName: 'T',
        bio: 'B',
        reputation: 0,
        contributionsCount: 0,
        approvedSubmissions: 0,
        pendingSubmissions: 0,
        badges: [{ id: 'badge-1', name: 'First Badge', description: 'D', icon: '🏅', criteria: 'C', earnedAt: new Date() }],
        expertise: [],
        preferredCategories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const badge = {
        id: 'badge-1',
        name: 'First Badge',
        description: 'Description',
        icon: '🏅',
        criteria: 'Criteria',
      };

      const updated = awardBadge(profile, badge);

      expect(updated.badges).toHaveLength(1);
    });
  });

  describe('getTopContributors', () => {
    it('should return top contributors by reputation', () => {
      const profiles: ContributorProfile[] = [
        {
          userId: '1', username: 'a', displayName: 'A', bio: 'B', reputation: 100, contributionsCount: 1, approvedSubmissions: 1, pendingSubmissions: 0, badges: [], expertise: [], preferredCategories: [], createdAt: new Date(), updatedAt: new Date(),
        },
        {
          userId: '2', username: 'b', displayName: 'B', bio: 'B', reputation: 300, contributionsCount: 1, approvedSubmissions: 1, pendingSubmissions: 0, badges: [], expertise: [], preferredCategories: [], createdAt: new Date(), updatedAt: new Date(),
        },
        {
          userId: '3', username: 'c', displayName: 'C', bio: 'B', reputation: 200, contributionsCount: 1, approvedSubmissions: 1, pendingSubmissions: 0, badges: [], expertise: [], preferredCategories: [], createdAt: new Date(), updatedAt: new Date(),
        },
      ];

      const top = getTopContributors(profiles, 2);

      expect(top).toHaveLength(2);
      expect(top[0].userId).toBe('2');
      expect(top[1].userId).toBe('3');
    });

    it('should default to limit of 10', () => {
      const profiles: ContributorProfile[] = Array.from({ length: 20 }, (_, i) => ({
        userId: `${i}`,
        username: `user${i}`,
        displayName: `User ${i}`,
        bio: 'Bio',
        reputation: i * 10,
        contributionsCount: 1,
        approvedSubmissions: 1,
        pendingSubmissions: 0,
        badges: [],
        expertise: [],
        preferredCategories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const top = getTopContributors(profiles);

      expect(top).toHaveLength(10);
    });
  });

  // ========== Review Management Tests ==========

  describe('addReviewComment', () => {
    it('should add comment to review', () => {
      const review = {
        id: 'r1',
        contributionId: 'c1',
        reviewerId: 'rev1',
        status: 'pending' as ReviewStatusType,
        comments: [] as ReviewComment[],
        createdAt: new Date(),
      };

      const comment: ReviewComment = {
        id: 'com1',
        reviewerId: 'rev1',
        content: 'Fix this',
        type: 'issue',
        createdAt: new Date(),
      };

      const updated = addReviewComment(review, comment);

      expect(updated.comments).toHaveLength(1);
      expect(updated.comments[0]).toEqual(comment);
    });
  });

  describe('updateReviewStatus', () => {
    it('should update review status to in_progress', () => {
      const review = {
        id: 'r1',
        contributionId: 'c1',
        reviewerId: 'rev1',
        status: 'pending' as ReviewStatusType,
        comments: [],
        createdAt: new Date(),
      };

      const updated = updateReviewStatus(review, 'in_progress');

      expect(updated.status).toBe('in_progress');
    });

    it('should update review status to completed with decision', () => {
      const review = {
        id: 'r1',
        contributionId: 'c1',
        reviewerId: 'rev1',
        status: 'in_progress' as ReviewStatusType,
        comments: [],
        createdAt: new Date(),
      };

      const updated = updateReviewStatus(review, 'completed', 'approve');

      expect(updated.status).toBe('completed');
      expect(updated.decision).toBe('approve');
      expect(updated.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('getReviewByContribution', () => {
    const reviews = [
      { id: 'r1', contributionId: 'c1', reviewerId: 'rev1', status: 'pending' as ReviewStatusType, comments: [], createdAt: new Date() },
      { id: 'r2', contributionId: 'c2', reviewerId: 'rev1', status: 'pending' as ReviewStatusType, comments: [], createdAt: new Date() },
    ];

    it('should find review by contribution ID', () => {
      const review = getReviewByContribution(reviews, 'c1');
      expect(review?.id).toBe('r1');
    });

    it('should return undefined for non-existent contribution', () => {
      const review = getReviewByContribution(reviews, 'c999');
      expect(review).toBeUndefined();
    });
  });

  describe('getPendingReviews', () => {
    const reviews = [
      { id: 'r1', contributionId: 'c1', reviewerId: 'rev1', status: 'pending' as ReviewStatusType, comments: [], createdAt: new Date() },
      { id: 'r2', contributionId: 'c2', reviewerId: 'rev1', status: 'in_progress' as ReviewStatusType, comments: [], createdAt: new Date() },
      { id: 'r3', contributionId: 'c3', reviewerId: 'rev1', status: 'completed' as ReviewStatusType, comments: [], createdAt: new Date(), decision: 'approve' as ReviewDecision },
    ];

    it('should get pending and in_progress reviews', () => {
      const pending = getPendingReviews(reviews);
      expect(pending).toHaveLength(2);
      expect(pending.map((r) => r.id).sort()).toEqual(['r1', 'r2']);
    });
  });

  describe('getReviewsByReviewer', () => {
    const reviews = [
      { id: 'r1', contributionId: 'c1', reviewerId: 'rev1', status: 'pending' as ReviewStatusType, comments: [], createdAt: new Date() },
      { id: 'r2', contributionId: 'c2', reviewerId: 'rev2', status: 'pending' as ReviewStatusType, comments: [], createdAt: new Date() },
      { id: 'r3', contributionId: 'c3', reviewerId: 'rev1', status: 'pending' as ReviewStatusType, comments: [], createdAt: new Date() },
    ];

    it('should get reviews by reviewer ID', () => {
      const rev1Reviews = getReviewsByReviewer(reviews, 'rev1');
      expect(rev1Reviews).toHaveLength(2);
      expect(rev1Reviews.every((r) => r.reviewerId === 'rev1')).toBe(true);
    });
  });

  // ========== Draft Management Tests ==========

  describe('saveDraftVersion', () => {
    const draft: Draft = {
      id: 'd1',
      authorId: 'u1',
      type: 'article',
      title: 'Draft',
      content: 'Old content',
      lastSavedAt: new Date('2024-01-01'),
      autoSaved: false,
      versions: [],
    };

    it('should save draft version', () => {
      const updated = saveDraftVersion(draft, 'New content', false, 'Initial save');

      expect(updated.content).toBe('New content');
      expect(updated.versions).toHaveLength(1);
      expect(updated.versions[0].content).toBe('New content');
      expect(updated.versions[0].changeSummary).toBe('Initial save');
    });

    it('should set autoSaved flag', () => {
      const updated = saveDraftVersion(draft, 'New content', true);

      expect(updated.autoSaved).toBe(true);
    });

    it('should keep only last 10 versions', () => {
      let current = draft;
      for (let i = 0; i < 15; i++) {
        current = saveDraftVersion(current, `Content ${i}`, false);
      }

      expect(current.versions).toHaveLength(10);
    });
  });

  describe('getDraftsByAuthor', () => {
    const drafts: Draft[] = [
      { id: 'd1', authorId: 'u1', type: 'article', title: 'D1', content: 'C', lastSavedAt: new Date(), autoSaved: false, versions: [] },
      { id: 'd2', authorId: 'u2', type: 'article', title: 'D2', content: 'C', lastSavedAt: new Date(), autoSaved: false, versions: [] },
      { id: 'd3', authorId: 'u1', type: 'article', title: 'D3', content: 'C', lastSavedAt: new Date(), autoSaved: false, versions: [] },
    ];

    it('should get drafts by author', () => {
      const u1Drafts = getDraftsByAuthor(drafts, 'u1');
      expect(u1Drafts).toHaveLength(2);
      expect(u1Drafts.every((d) => d.authorId === 'u1')).toBe(true);
    });
  });

  describe('getDraftsByType', () => {
    const drafts: Draft[] = [
      { id: 'd1', authorId: 'u1', type: 'article', title: 'D1', content: 'C', lastSavedAt: new Date(), autoSaved: false, versions: [] },
      { id: 'd2', authorId: 'u1', type: 'tutorial', title: 'D2', content: 'C', lastSavedAt: new Date(), autoSaved: false, versions: [] },
      { id: 'd3', authorId: 'u1', type: 'article', title: 'D3', content: 'C', lastSavedAt: new Date(), autoSaved: false, versions: [] },
    ];

    it('should get drafts by type', () => {
      const articles = getDraftsByType(drafts, 'article');
      expect(articles).toHaveLength(2);
      expect(articles.every((d) => d.type === 'article')).toBe(true);
    });
  });

  // ========== Statistics Tests ==========

  describe('calculateContributionStats', () => {
    const contributions: Contribution[] = [
      { id: '1', type: 'article', title: 'A', description: 'D', content: 'C', authorId: 'u', status: 'draft', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', type: 'article', title: 'B', description: 'D', content: 'C', authorId: 'u', status: 'submitted', createdAt: new Date(), updatedAt: new Date(), submittedAt: new Date() },
      { id: '3', type: 'article', title: 'C', description: 'D', content: 'C', authorId: 'u', status: 'approved', createdAt: new Date(), updatedAt: new Date(), reviewedAt: new Date(), submittedAt: new Date() },
      { id: '4', type: 'article', title: 'D', description: 'D', content: 'C', authorId: 'u', status: 'rejected', createdAt: new Date(), updatedAt: new Date(), reviewedAt: new Date(), submittedAt: new Date() },
      { id: '5', type: 'article', title: 'E', description: 'D', content: 'C', authorId: 'u', status: 'published', createdAt: new Date(), updatedAt: new Date(), reviewedAt: new Date(), submittedAt: new Date() },
    ];

    const profiles: ContributorProfile[] = [
      {
        userId: 'p1', username: 'a', displayName: 'A', bio: 'B', reputation: 300, contributionsCount: 1, approvedSubmissions: 1, pendingSubmissions: 0, badges: [], expertise: [], preferredCategories: [], createdAt: new Date(), updatedAt: new Date(),
      },
      {
        userId: 'p2', username: 'b', displayName: 'B', bio: 'B', reputation: 200, contributionsCount: 1, approvedSubmissions: 1, pendingSubmissions: 0, badges: [], expertise: [], preferredCategories: [], createdAt: new Date(), updatedAt: new Date(),
      },
      {
        userId: 'p3', username: 'c', displayName: 'C', bio: 'B', reputation: 100, contributionsCount: 1, approvedSubmissions: 1, pendingSubmissions: 0, badges: [], expertise: [], preferredCategories: [], createdAt: new Date(), updatedAt: new Date(),
      },
    ];

    it('should calculate contribution stats', () => {
      const stats = calculateContributionStats(contributions, profiles);

      expect(stats.totalContributions).toBe(5);
      expect(stats.pendingReview).toBe(1);
      expect(stats.approvedContributions).toBe(2); // approved + published
      expect(stats.rejectedContributions).toBe(1);
      expect(stats.draftContributions).toBe(1);
      expect(stats.topContributors).toHaveLength(3);
    });
  });

  describe('getContributorStats', () => {
    const contributions: Contribution[] = [
      { id: '1', type: 'article', title: 'A', description: 'D', content: 'C', authorId: 'u1', status: 'draft', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', type: 'article', title: 'B', description: 'D', content: 'C', authorId: 'u1', status: 'submitted', createdAt: new Date(), updatedAt: new Date(), submittedAt: new Date() },
      { id: '3', type: 'article', title: 'C', description: 'D', content: 'C', authorId: 'u1', status: 'approved', createdAt: new Date(), updatedAt: new Date(), reviewedAt: new Date(), submittedAt: new Date() },
      { id: '4', type: 'article', title: 'D', description: 'D', content: 'C', authorId: 'u1', status: 'rejected', createdAt: new Date(), updatedAt: new Date(), reviewedAt: new Date(), submittedAt: new Date() },
      { id: '5', type: 'article', title: 'E', description: 'D', content: 'C', authorId: 'u2', status: 'published', createdAt: new Date(), updatedAt: new Date(), reviewedAt: new Date(), submittedAt: new Date() },
    ];

    it('should get contributor stats', () => {
      const stats = getContributorStats(contributions, 'u1');

      expect(stats.total).toBe(4);
      expect(stats.published).toBe(0);
      expect(stats.approved).toBe(1);
      expect(stats.rejected).toBe(1);
      expect(stats.pending).toBe(1);
      expect(stats.draft).toBe(1);
    });
  });

  // ========== Badge Tests ==========

  describe('checkAndAwardBadges', () => {
    it('should award first submission badge', () => {
      const profile: ContributorProfile = {
        userId: 'u1',
        username: 'test',
        displayName: 'Test',
        bio: 'Bio',
        reputation: 0,
        contributionsCount: 0,
        approvedSubmissions: 0,
        pendingSubmissions: 0,
        badges: [],
        expertise: [],
        preferredCategories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const contributions: Contribution[] = [
        { id: '1', type: 'article', title: 'A', description: 'D', content: 'C', authorId: 'u1', status: 'draft', createdAt: new Date(), updatedAt: new Date() },
      ];

      const updated = checkAndAwardBadges(profile, contributions, [profile]);

      expect(updated.badges.some((b) => b.id === 'first-submission')).toBe(true);
    });

    it('should award published author badge', () => {
      const profile: ContributorProfile = {
        userId: 'u1',
        username: 'test',
        displayName: 'Test',
        bio: 'Bio',
        reputation: 0,
        contributionsCount: 0,
        approvedSubmissions: 0,
        pendingSubmissions: 0,
        badges: [],
        expertise: [],
        preferredCategories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const contributions: Contribution[] = [
        { id: '1', type: 'article', title: 'A', description: 'D', content: 'C', authorId: 'u1', status: 'published', createdAt: new Date(), updatedAt: new Date(), reviewedAt: new Date(), submittedAt: new Date() },
      ];

      const updated = checkAndAwardBadges(profile, contributions, [profile]);

      expect(updated.badges.some((b) => b.id === 'published-author')).toBe(true);
    });

    it('should award quality content badge for 10 published', () => {
      const profile: ContributorProfile = {
        userId: 'u1',
        username: 'test',
        displayName: 'Test',
        bio: 'Bio',
        reputation: 0,
        contributionsCount: 0,
        approvedSubmissions: 0,
        pendingSubmissions: 0,
        badges: [],
        expertise: [],
        preferredCategories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const contributions: Contribution[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        type: 'article' as ContributionType,
        title: `Article ${i}`,
        description: 'Description',
        content: 'Content',
        authorId: 'u1',
        status: 'published' as ContributionStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
        reviewedAt: new Date(),
        submittedAt: new Date(),
      }));

      const updated = checkAndAwardBadges(profile, contributions, [profile]);

      expect(updated.badges.some((b) => b.id === 'quality-content')).toBe(true);
    });

    it('should award top contributor badge', () => {
      const topProfile: ContributorProfile = {
        userId: 'top',
        username: 'top',
        displayName: 'Top',
        bio: 'Bio',
        reputation: 1000,
        contributionsCount: 10,
        approvedSubmissions: 10,
        pendingSubmissions: 0,
        badges: [],
        expertise: [],
        preferredCategories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const lowProfile: ContributorProfile = {
        userId: 'low',
        username: 'low',
        displayName: 'Low',
        bio: 'Bio',
        reputation: 10,
        contributionsCount: 1,
        approvedSubmissions: 1,
        pendingSubmissions: 0,
        badges: [],
        expertise: [],
        preferredCategories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const profiles = [topProfile, lowProfile];

      const updated = checkAndAwardBadges(topProfile, [], profiles);

      expect(updated.badges.some((b) => b.id === 'top-contributor')).toBe(true);
    });
  });

  describe('CONTRIBUTION_BADGES', () => {
    it('should have all required badges', () => {
      expect(CONTRIBUTION_BADGES).toHaveLength(7);
      expect(CONTRIBUTION_BADGES.map((b) => b.id)).toEqual([
        'first-submission',
        'published-author',
        'prolific-writer',
        'tutorial-creator',
        'path-builder',
        'top-contributor',
        'quality-content',
      ]);
    });
  });
});
