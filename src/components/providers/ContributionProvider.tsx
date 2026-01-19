'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import type {
  Contribution,
  Review,
  ContributorProfile,
  Draft,
  CreateContributionInput,
  UpdateContributionInput,
  ContributionStatus,
  ContributionType,
  ContributionFilterOptions,
  ReviewDecision,
} from '@/types';
import {
  createContribution,
  updateContribution,
  submitContribution,
  startReview,
  completeReview,
  publishContribution,
  resubmitContribution,
  createReview,
  createContributorProfile,
  updateContributorStats,
  awardBadge,
  getTopContributors,
  filterContributions,
  calculateContributionStats,
  CONTRIBUTION_BADGES,
  checkAndAwardBadges,
} from '@/lib/contribution-utils';

const CONTRIBUTIONS_KEY = 'vibe-wiki-contributions';
const REVIEWS_KEY = 'vibe-wiki-reviews';
const PROFILES_KEY = 'vibe-wiki-contributor-profiles';
const DRAFTS_KEY = 'vibe-wiki-drafts';

interface ContributionContextType {
  contributions: Contribution[];
  reviews: Review[];
  profiles: ContributorProfile[];
  drafts: Draft[];
  isLoading: boolean;

  // Contribution actions
  createNewContribution: (input: CreateContributionInput) => Contribution;
  updateContributionById: (id: string, updates: UpdateContributionInput) => Contribution;
  deleteContribution: (id: string) => void;
  submitForReview: (id: string) => Contribution;
  beginReview: (contributionId: string, reviewerId: string) => Contribution;
  finishReview: (contributionId: string, decision: ReviewDecision, reviewNotes?: string[]) => Contribution;
  publish: (id: string) => Contribution;
  resubmit: (id: string) => Contribution;

  // Draft actions
  createDraft: (authorId: string, type: ContributionType, title: string, content: string) => Draft;
  saveDraftToStorage: (draft: Draft) => void;
  deleteDraftById: (draftId: string) => void;
  loadDraftsByAuthor: (authorId: string) => Draft[];

  // Review actions
  addNewReview: (contributionId: string, reviewerId: string) => Review;

  // Profile actions
  getOrCreateProfile: (userId: string, username: string, displayName: string, bio?: string) => ContributorProfile;
  updateProfile: (userId: string, updates: Partial<Omit<ContributorProfile, 'userId' | 'createdAt'>>) => void;
  awardBadgeToProfile: (userId: string, badge: Omit<import('@/types').ContributorBadge, 'earnedAt'>) => void;

  // Queries
  getContributionById: (id: string) => Contribution | undefined;
  getContributionsByAuthor: (authorId: string) => Contribution[];
  getContributionsByStatus: (status: ContributionStatus) => Contribution[];
  getContributionsByType: (type: ContributionType) => Contribution[];
  filterAndSortContributions: (options: ContributionFilterOptions) => Contribution[];
  getPendingContributions: () => Contribution[];
  getReviewByContributionId: (contributionId: string) => Review | undefined;
  getProfileByUserId: (userId: string) => ContributorProfile | undefined;
  getTopContributorProfiles: (limit?: number) => ContributorProfile[];
  getContributionStatistics: () => ReturnType<typeof calculateContributionStats>;
  refreshContributions: () => void;

  // Moderator actions
  isModerator: boolean;
  setModeratorStatus: (isModerator: boolean) => void;
}

const ContributionContext = createContext<ContributionContextType | undefined>(undefined);

interface ContributionProviderProps {
  children: ReactNode;
  isModerator?: boolean;
}

function loadContributionsFromStorage(): Contribution[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(CONTRIBUTIONS_KEY);
    if (!stored) return [];

    const contributions = JSON.parse(stored);
    return contributions.map((c: Contribution) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
      submittedAt: c.submittedAt ? new Date(c.submittedAt) : undefined,
      reviewedAt: c.reviewedAt ? new Date(c.reviewedAt) : undefined,
    }));
  } catch {
    return [];
  }
}

function loadReviewsFromStorage(): Review[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(REVIEWS_KEY);
    if (!stored) return [];

    const reviews = JSON.parse(stored);
    return reviews.map((r: Review) => ({
      ...r,
      createdAt: new Date(r.createdAt),
      completedAt: r.completedAt ? new Date(r.completedAt) : undefined,
    }));
  } catch {
    return [];
  }
}

function loadProfilesFromStorage(): ContributorProfile[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(PROFILES_KEY);
    if (!stored) return [];

    const profiles = JSON.parse(stored);
    return profiles.map((p: ContributorProfile) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
      badges: p.badges.map((b: import('@/types').ContributorBadge) => ({
        ...b,
        earnedAt: new Date(b.earnedAt),
      })),
    }));
  } catch {
    return [];
  }
}

function loadDraftsFromStorage(): Draft[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(DRAFTS_KEY);
    if (!stored) return [];

    const drafts = JSON.parse(stored);
    return drafts.map((d: Draft) => ({
      ...d,
      lastSavedAt: new Date(d.lastSavedAt),
      versions: d.versions.map((v: import('@/types').DraftVersion) => ({
        ...v,
        savedAt: new Date(v.savedAt),
      })),
    }));
  } catch {
    return [];
  }
}

function saveContributionsToStorage(contributions: Contribution[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CONTRIBUTIONS_KEY, JSON.stringify(contributions));
  } catch (error) {
    console.error('Failed to save contributions:', error);
  }
}

function saveReviewsToStorage(reviews: Review[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  } catch (error) {
    console.error('Failed to save reviews:', error);
  }
}

function saveProfilesToStorage(profiles: ContributorProfile[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error('Failed to save profiles:', error);
  }
}

function saveDraftsToStorage(drafts: Draft[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  } catch (error) {
    console.error('Failed to save drafts:', error);
  }
}

export function ContributionProvider({ children, isModerator: initialModerator = false }: ContributionProviderProps) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [profiles, setProfiles] = useState<ContributorProfile[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModerator, setModeratorStatus] = useState(initialModerator);

  // Load data from localStorage on mount
  useEffect(() => {
    setContributions(loadContributionsFromStorage());
    setReviews(loadReviewsFromStorage());
    setProfiles(loadProfilesFromStorage());
    setDrafts(loadDraftsFromStorage());
    setIsLoading(false);
  }, []);

  // Save contributions to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveContributionsToStorage(contributions);
    }
  }, [contributions, isLoading]);

  // Save reviews to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveReviewsToStorage(reviews);
    }
  }, [reviews, isLoading]);

  // Save profiles to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveProfilesToStorage(profiles);
    }
  }, [profiles, isLoading]);

  // Save drafts to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveDraftsToStorage(drafts);
    }
  }, [drafts, isLoading]);

  // Contribution actions
  const createNewContribution = useCallback((input: CreateContributionInput): Contribution => {
    const newContribution = createContribution(input);
    setContributions((prev) => [...prev, newContribution]);

    // Update contributor stats
    const profile = profiles.find((p) => p.userId === input.authorId);
    if (profile) {
      const updated = updateContributorStats(profile, newContribution);
      const withBadges = checkAndAwardBadges(updated, [...contributions, newContribution], profiles);
      setProfiles((prev) =>
        prev.map((p) => (p.userId === profile.userId ? withBadges : p))
      );
    }

    return newContribution;
  }, [profiles, contributions]);

  const updateContributionById = useCallback((id: string, updates: UpdateContributionInput): Contribution => {
    let updated: Contribution | undefined;

    setContributions((prev) => {
      const index = prev.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error(`Contribution not found: ${id}`);
      }

      const existing = prev[index];
      updated = updateContribution(existing, updates);

      const newContributions = [...prev];
      newContributions[index] = updated;
      return newContributions;
    });

    return updated!;
  }, []);

  const deleteContribution = useCallback((id: string): void => {
    setContributions((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const submitForReview = useCallback((id: string): Contribution => {
    let updated: Contribution | undefined;

    setContributions((prev) => {
      const index = prev.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error(`Contribution not found: ${id}`);
      }

      const existing = prev[index];
      updated = submitContribution(existing);

      // Update contributor stats
      const profile = profiles.find((p) => p.userId === existing.authorId);
      if (profile) {
        const updatedProfile = updateContributorStats(profile, updated, existing.status);
        setProfiles((prevProfiles) =>
          prevProfiles.map((p) => (p.userId === profile.userId ? updatedProfile : p))
        );
      }

      const newContributions = [...prev];
      newContributions[index] = updated;
      return newContributions;
    });

    return updated!;
  }, [profiles]);

  const beginReview = useCallback((contributionId: string, reviewerId: string): Contribution => {
    let updated: Contribution | undefined;

    setContributions((prev) => {
      const index = prev.findIndex((c) => c.id === contributionId);
      if (index === -1) {
        throw new Error(`Contribution not found: ${contributionId}`);
      }

      const existing = prev[index];
      updated = startReview(existing, reviewerId);

      const newContributions = [...prev];
      newContributions[index] = updated;
      return newContributions;
    });

    // Create or update review
    setReviews((prev) => {
      const existingReview = prev.find((r) => r.contributionId === contributionId);
      if (existingReview) {
        return prev.map((r) =>
          r.contributionId === contributionId
            ? { ...r, status: 'in_progress' as const }
            : r
        );
      } else {
        return [...prev, createReview(contributionId, reviewerId)];
      }
    });

    return updated!;
  }, []);

  const finishReview = useCallback((
    contributionId: string,
    decision: ReviewDecision,
    reviewNotes?: string[]
  ): Contribution => {
    let updated: Contribution | undefined;

    setContributions((prev) => {
      const index = prev.findIndex((c) => c.id === contributionId);
      if (index === -1) {
        throw new Error(`Contribution not found: ${contributionId}`);
      }

      const existing = prev[index];
      updated = completeReview(existing, decision, reviewNotes);

      // Update contributor stats
      const profile = profiles.find((p) => p.userId === existing.authorId);
      if (profile) {
        const updatedProfile = updateContributorStats(profile, updated, existing.status);
        const withBadges = checkAndAwardBadges(updatedProfile, [...prev, updated], profiles);
        setProfiles((prevProfiles) =>
          prevProfiles.map((p) => (p.userId === profile.userId ? withBadges : p))
        );
      }

      const newContributions = [...prev];
      newContributions[index] = updated;
      return newContributions;
    });

    // Update review status
    setReviews((prev) =>
      prev.map((r) =>
        r.contributionId === contributionId
          ? { ...r, status: 'completed' as const, decision, completedAt: new Date() }
          : r
      )
    );

    return updated!;
  }, [profiles]);

  const publish = useCallback((id: string): Contribution => {
    let updated: Contribution | undefined;

    setContributions((prev) => {
      const index = prev.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error(`Contribution not found: ${id}`);
      }

      const existing = prev[index];
      updated = publishContribution(existing);

      const newContributions = [...prev];
      newContributions[index] = updated;
      return newContributions;
    });

    return updated!;
  }, []);

  const resubmit = useCallback((id: string): Contribution => {
    let updated: Contribution | undefined;

    setContributions((prev) => {
      const index = prev.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error(`Contribution not found: ${id}`);
      }

      const existing = prev[index];
      updated = resubmitContribution(existing);

      const newContributions = [...prev];
      newContributions[index] = updated;
      return newContributions;
    });

    return updated!;
  }, []);

  // Draft actions
  const createDraft = useCallback((
    authorId: string,
    type: ContributionType,
    title: string,
    content: string
  ): Draft => {
    const newDraft: Draft = {
      id: `draft-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      authorId,
      type,
      title: title.trim(),
      content: content.trim(),
      lastSavedAt: new Date(),
      autoSaved: false,
      versions: [{
        id: `version-${Date.now()}`,
        content: content.trim(),
        savedAt: new Date(),
      }],
    };

    setDrafts((prev) => [...prev, newDraft]);
    return newDraft;
  }, []);

  const saveDraftToStorage = useCallback((draft: Draft): void => {
    setDrafts((prev) => {
      const index = prev.findIndex((d) => d.id === draft.id);
      if (index >= 0) {
        const newDrafts = [...prev];
        newDrafts[index] = draft;
        return newDrafts;
      } else {
        return [...prev, draft];
      }
    });
  }, []);

  const deleteDraftById = useCallback((draftId: string): void => {
    setDrafts((prev) => prev.filter((d) => d.id !== draftId));
  }, []);

  const loadDraftsByAuthor = useCallback((authorId: string): Draft[] => {
    return drafts.filter((d) => d.authorId === authorId);
  }, [drafts]);

  // Review actions
  const addNewReview = useCallback((contributionId: string, reviewerId: string): Review => {
    const newReview = createReview(contributionId, reviewerId);
    setReviews((prev) => [...prev, newReview]);
    return newReview;
  }, []);

  // Profile actions
  const getOrCreateProfile = useCallback((
    userId: string,
    username: string,
    displayName: string,
    bio: string = ''
  ): ContributorProfile => {
    const existing = profiles.find((p) => p.userId === userId);
    if (existing) {
      return existing;
    }

    const newProfile = createContributorProfile(userId, username, displayName, bio);
    setProfiles((prev) => [...prev, newProfile]);
    return newProfile;
  }, [profiles]);

  const updateProfile = useCallback((
    userId: string,
    updates: Partial<Omit<ContributorProfile, 'userId' | 'createdAt'>>
  ): void => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.userId === userId
          ? { ...p, ...updates, updatedAt: new Date() }
          : p
      )
    );
  }, []);

  const awardBadgeToProfile = useCallback((
    userId: string,
    badge: Omit<import('@/types').ContributorBadge, 'earnedAt'>
  ): void => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.userId === userId && !p.badges.some((b) => b.id === badge.id)) {
          return {
            ...p,
            badges: [...p.badges, { ...badge, earnedAt: new Date() }],
            updatedAt: new Date(),
          };
        }
        return p;
      })
    );
  }, []);

  // Queries
  const getContributionById = useCallback((id: string): Contribution | undefined => {
    return contributions.find((c) => c.id === id);
  }, [contributions]);

  const getContributionsByAuthor = useCallback((authorId: string): Contribution[] => {
    return contributions.filter((c) => c.authorId === authorId);
  }, [contributions]);

  const getContributionsByStatus = useCallback((status: ContributionStatus): Contribution[] => {
    return contributions.filter((c) => c.status === status);
  }, [contributions]);

  const getContributionsByType = useCallback((type: ContributionType): Contribution[] => {
    return contributions.filter((c) => c.type === type);
  }, [contributions]);

  const filterAndSortContributions = useCallback((options: ContributionFilterOptions): Contribution[] => {
    return filterContributions(contributions, options);
  }, [contributions]);

  const getPendingContributions = useCallback((): Contribution[] => {
    return contributions.filter((c) => c.status === 'submitted' || c.status === 'under_review');
  }, [contributions]);

  const getReviewByContributionId = useCallback((contributionId: string): Review | undefined => {
    return reviews.find((r) => r.contributionId === contributionId);
  }, [reviews]);

  const getProfileByUserId = useCallback((userId: string): ContributorProfile | undefined => {
    return profiles.find((p) => p.userId === userId);
  }, [profiles]);

  const getTopContributorProfiles = useCallback((limit: number = 10): ContributorProfile[] => {
    return getTopContributors(profiles, limit);
  }, [profiles]);

  const getContributionStatistics = useCallback((): ReturnType<typeof calculateContributionStats> => {
    return calculateContributionStats(contributions, profiles);
  }, [contributions, profiles]);

  const refreshContributions = useCallback((): void => {
    setContributions(loadContributionsFromStorage());
    setReviews(loadReviewsFromStorage());
    setProfiles(loadProfilesFromStorage());
    setDrafts(loadDraftsFromStorage());
  }, []);

  const value: ContributionContextType = {
    contributions,
    reviews,
    profiles,
    drafts,
    isLoading,
    createNewContribution,
    updateContributionById,
    deleteContribution,
    submitForReview,
    beginReview,
    finishReview,
    publish,
    resubmit,
    createDraft,
    saveDraftToStorage,
    deleteDraftById,
    loadDraftsByAuthor,
    addNewReview,
    getOrCreateProfile,
    updateProfile,
    awardBadgeToProfile,
    getContributionById,
    getContributionsByAuthor,
    getContributionsByStatus,
    getContributionsByType,
    filterAndSortContributions,
    getPendingContributions,
    getReviewByContributionId,
    getProfileByUserId,
    getTopContributorProfiles,
    getContributionStatistics,
    refreshContributions,
    isModerator,
    setModeratorStatus,
  };

  return <ContributionContext.Provider value={value}>{children}</ContributionContext.Provider>;
}

export function useContributions(): ContributionContextType {
  const context = useContext(ContributionContext);
  if (context === undefined) {
    throw new Error('useContributions must be used within a ContributionProvider');
  }
  return context;
}
