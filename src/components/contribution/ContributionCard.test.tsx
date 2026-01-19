import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { ContributionCard } from './ContributionCard';
import type { Contribution } from '@/types';

describe('ContributionCard', () => {
  const mockContribution: Contribution = {
    id: 'contrib-1',
    type: 'article',
    title: 'Test Article',
    description: 'This is a test article description',
    content: 'This is the content of the article with more than 100 characters to meet the validation requirements. Adding some more text here to make sure it passes validation.',
    authorId: 'user-1',
    status: 'draft',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    tags: ['react', 'typescript'],
    categoryId: 'cat-1',
    difficulty: 'beginner',
    estimatedMinutes: 15,
  };

  it('renders contribution title and description', () => {
    render(createElement(ContributionCard, { contribution: mockContribution }));

    expect(screen.getByText('Test Article')).toBeDefined();
    expect(screen.getByText('This is a test article description')).toBeDefined();
  });

  it('renders status badge', () => {
    render(createElement(ContributionCard, { contribution: mockContribution }));

    expect(screen.getByText('Draft')).toBeDefined();
  });

  it('renders different statuses correctly', () => {
    const { rerender } = render(createElement(ContributionCard, { contribution: mockContribution }));
    expect(screen.getByText('Draft')).toBeDefined();

    const submittedContribution = { ...mockContribution, status: 'submitted' as const };
    rerender(createElement(ContributionCard, { contribution: submittedContribution }));
    expect(screen.getByText('Submitted')).toBeDefined();

    const approvedContribution = { ...mockContribution, status: 'approved' as const };
    rerender(createElement(ContributionCard, { contribution: approvedContribution }));
    expect(screen.getByText('Approved')).toBeDefined();

    const publishedContribution = { ...mockContribution, status: 'published' as const };
    rerender(createElement(ContributionCard, { contribution: publishedContribution }));
    expect(screen.getByText('Published')).toBeDefined();
  });

  it('renders difficulty badge when present', () => {
    render(createElement(ContributionCard, { contribution: mockContribution }));

    expect(screen.getByText('beginner')).toBeDefined();
  });

  it('renders estimated time', () => {
    render(createElement(ContributionCard, { contribution: mockContribution }));

    expect(screen.getByText('15 min')).toBeDefined();
  });

  it('renders tags', () => {
    render(createElement(ContributionCard, { contribution: mockContribution }));

    expect(screen.getByText('react')).toBeDefined();
    expect(screen.getByText('typescript')).toBeDefined();
  });

  it('shows author when showAuthor is true', () => {
    render(createElement(ContributionCard, { contribution: mockContribution, showAuthor: true }));

    expect(screen.getByText('user-1')).toBeDefined();
  });

  it('hides author when showAuthor is false', () => {
    render(createElement(ContributionCard, { contribution: mockContribution, showAuthor: false }));

    expect(screen.queryByText('user-1')).toBeNull();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();

    render(createElement(ContributionCard, { contribution: mockContribution, onClick: handleClick }));

    const card = screen.getByText('Test Article').closest('article');
    card?.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders actions when provided', () => {
    const actions = createElement('button', { 'data-testid': 'test-action' }, 'Test Action');

    render(createElement(ContributionCard, { contribution: mockContribution, showActions: true, actions }));

    expect(screen.getByTestId('test-action')).toBeDefined();
  });

  it('renders tutorial with learning objectives', () => {
    const tutorialContribution: Contribution = {
      ...mockContribution,
      type: 'tutorial',
      learningObjectives: ['Learn React basics', 'Understand hooks'],
    };

    render(createElement(ContributionCard, { contribution: tutorialContribution }));

    expect(screen.getByText('Learning Objectives')).toBeDefined();
    expect(screen.getByText('Learn React basics')).toBeDefined();
  });

  it('renders review notes when present', () => {
    const contributionWithNotes: Contribution = {
      ...mockContribution,
      reviewNotes: ['Fix formatting', 'Add more examples'],
    };

    render(createElement(ContributionCard, { contribution: contributionWithNotes }));

    expect(screen.getByText('Review Notes')).toBeDefined();
    expect(screen.getByText('Fix formatting')).toBeDefined();
    expect(screen.getByText('Add more examples')).toBeDefined();
  });

  it('renders rejection reason when present', () => {
    const rejectedContribution: Contribution = {
      ...mockContribution,
      status: 'rejected',
      rejectionReason: 'Content does not meet quality standards',
    };

    render(createElement(ContributionCard, { contribution: rejectedContribution }));

    expect(screen.getByText('Rejection Reason')).toBeDefined();
    expect(screen.getByText('Content does not meet quality standards')).toBeDefined();
  });

  it('limits displayed tags to 5 and shows count for remaining', () => {
    const manyTags: Contribution = {
      ...mockContribution,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7'],
    };

    render(createElement(ContributionCard, { contribution: manyTags }));

    expect(screen.getByText('tag1')).toBeDefined();
    expect(screen.getByText('tag5')).toBeDefined();
    expect(screen.getByText('+2')).toBeDefined();
  });
});
