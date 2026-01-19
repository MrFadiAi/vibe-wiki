import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { createElement } from 'react';
import { ContributionList } from './ContributionList';
import type { Contribution } from '@/types';

describe('ContributionList', () => {
  const mockContributions: Contribution[] = [
    {
      id: 'contrib-1',
      type: 'article',
      title: 'React Basics',
      description: 'Learn React fundamentals',
      content: 'This is the content of the article with more than 100 characters to meet the validation requirements. Adding some more text here to make sure it passes validation.',
      authorId: 'user-1',
      status: 'published',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      tags: ['react', 'javascript'],
      difficulty: 'beginner',
      estimatedMinutes: 15,
    },
    {
      id: 'contrib-2',
      type: 'tutorial',
      title: 'TypeScript Tutorial',
      description: 'Learn TypeScript from scratch',
      content: 'This is the content of the tutorial with more than 100 characters to meet the validation requirements. Adding some more text here to make sure it passes validation.',
      authorId: 'user-2',
      status: 'draft',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
      tags: ['typescript'],
      difficulty: 'intermediate',
      estimatedMinutes: 30,
      learningObjectives: ['Understand types', 'Learn interfaces'],
      steps: [
        { id: 'step-1', title: 'Step 1', content: 'Content', order: 0 },
      ],
    },
    {
      id: 'contrib-3',
      type: 'path',
      title: 'Full Stack Path',
      description: 'Complete full stack development path',
      content: 'This is the content of the path with more than 100 characters to meet the validation requirements. Adding some more text here to make sure it passes validation.',
      authorId: 'user-1',
      status: 'submitted',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      tags: ['fullstack'],
      difficulty: 'advanced',
      estimatedMinutes: 120,
      targetAudience: ['Developers'],
      learningObjectives: ['Build full stack apps'],
      items: [
        { id: 'item-1', type: 'article', slug: 'intro', title: 'Intro', estimatedMinutes: 10, order: 0 },
      ],
    },
  ];

  it('renders title and description when provided', () => {
    render(createElement(ContributionList, {
      contributions: mockContributions,
      title: 'My Contributions',
      description: 'Browse all contributions',
    }));

    expect(screen.getByText('My Contributions')).toBeDefined();
    expect(screen.getByText('Browse all contributions')).toBeDefined();
  });

  it('renders all contributions', () => {
    render(createElement(ContributionList, { contributions: mockContributions }));

    expect(screen.getByText('React Basics')).toBeDefined();
    expect(screen.getByText('TypeScript Tutorial')).toBeDefined();
    expect(screen.getByText('Full Stack Path')).toBeDefined();
  });

  it('shows empty message when no contributions', () => {
    render(createElement(ContributionList, {
      contributions: [],
      emptyMessage: 'No contributions found',
    }));

    expect(screen.getByText('No contributions found')).toBeDefined();
  });

  it('shows empty icon when provided', () => {
    const EmptyIcon = () => createElement('span', { 'data-testid': 'empty-icon' }, 'Empty');

    render(createElement(ContributionList, {
      contributions: [],
      emptyIcon: createElement(EmptyIcon),
    }));

    expect(screen.getByTestId('empty-icon')).toBeDefined();
  });

  it('calls onContributionClick when contribution is clicked', () => {
    const handleClick = vi.fn();

    render(createElement(ContributionList, {
      contributions: mockContributions,
      onContributionClick: handleClick,
    }));

    fireEvent.click(screen.getByText('React Basics'));

    expect(handleClick).toHaveBeenCalledWith(mockContributions[0]);
  });

  it('shows filters when showFilters is true', () => {
    render(createElement(ContributionList, {
      contributions: mockContributions,
      showFilters: true,
    }));

    expect(screen.getByText('Filters')).toBeDefined();
    expect(screen.getByText('Search')).toBeDefined();
    expect(screen.getByText('Type')).toBeDefined();
    expect(screen.getByText('Status')).toBeDefined();
    expect(screen.getByText('Difficulty')).toBeDefined();
    expect(screen.getByText('Sort By')).toBeDefined();
  });

  it('does not show filters when showFilters is false', () => {
    render(createElement(ContributionList, {
      contributions: mockContributions,
      showFilters: false,
    }));

    expect(screen.queryByText('Filters')).toBeNull();
  });

  it('filters by type', async () => {
    render(createElement(ContributionList, {
      contributions: mockContributions,
      showFilters: true,
    }));

    // Click article filter
    const articleButtons = screen.getAllByText('Articles');
    fireEvent.click(articleButtons[1]); // Click the filter button, not the card

    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeDefined();
      expect(screen.queryByText('TypeScript Tutorial')).toBeNull();
    });
  });

  it('filters by status', async () => {
    render(createElement(ContributionList, {
      contributions: mockContributions,
      showFilters: true,
    }));

    // Click published filter
    const publishedButtons = screen.getAllByText('Published');
    fireEvent.click(publishedButtons[1]); // Click the filter button

    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeDefined();
      expect(screen.queryByText('TypeScript Tutorial')).toBeNull();
    });
  });

  it('filters by difficulty', async () => {
    render(createElement(ContributionList, {
      contributions: mockContributions,
      showFilters: true,
    }));

    // Click beginner filter
    const beginnerButtons = screen.getAllByText('Beginner');
    fireEvent.click(beginnerButtons[1]); // Click the filter button

    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeDefined();
      expect(screen.queryByText('TypeScript Tutorial')).toBeNull();
    });
  });

  it('filters by search query', async () => {
    render(createElement(ContributionList, {
      contributions: mockContributions,
      showFilters: true,
    }));

    const searchInput = screen.getByPlaceholderText('Search contributions...');
    fireEvent.change(searchInput, { target: { value: 'React' } });

    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeDefined();
      expect(screen.queryByText('TypeScript Tutorial')).toBeNull();
    });
  });

  it('sorts by recent', async () => {
    render(createElement(ContributionList, {
      contributions: mockContributions,
      showFilters: true,
    }));

    // Default is recent, so full stack path should be first
    const articles = screen.getAllByText(/React Basics|Full Stack Path|TypeScript Tutorial/);
    expect(articles[0].textContent).toBe('Full Stack Path');
  });

  it('sorts by oldest', async () => {
    render(createElement(ContributionList, {
      contributions: mockContributions,
      showFilters: true,
    }));

    const oldestButtons = screen.getAllByText('Oldest');
    fireEvent.click(oldestButtons[1]); // Click the sort button

    await waitFor(() => {
      const articles = screen.getAllByText(/React Basics|Full Stack Path|TypeScript Tutorial/);
      expect(articles[0].textContent).toBe('TypeScript Tutorial');
    });
  });

  it('sorts by title', async () => {
    render(createElement(ContributionList, {
      contributions: mockContributions,
      showFilters: true,
    }));

    const titleButtons = screen.getAllByText('Title');
    fireEvent.click(titleButtons[1]); // Click the sort button

    await waitFor(() => {
      const articles = screen.getAllByText(/React Basics|Full Stack Path|TypeScript Tutorial/);
      expect(articles[0].textContent).toBe('Full Stack Path');
    });
  });

  it('shows active filter count', async () => {
    render(createElement(ContributionList, {
      contributions: mockContributions,
      showFilters: true,
    }));

    const articleButtons = screen.getAllByText('Articles');
    fireEvent.click(articleButtons[1]);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeDefined();
    });
  });

  it('clears all filters', async () => {
    render(createElement(ContributionList, {
      contributions: mockContributions,
      showFilters: true,
    }));

    // Apply a filter
    const articleButtons = screen.getAllByText('Articles');
    fireEvent.click(articleButtons[1]);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeDefined();
    });

    // Clear filters
    const clearButtons = screen.getAllByText('Clear All');
    fireEvent.click(clearButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('1')).toBeNull();
    });
  });

  it('shows results count', () => {
    render(createElement(ContributionList, {
      contributions: mockContributions,
      showFilters: true,
    }));

    expect(screen.getByText('3 contributions')).toBeDefined();
  });

  it('shows filtered results count', async () => {
    render(createElement(ContributionList, {
      contributions: mockContributions,
      showFilters: true,
    }));

    const articleButtons = screen.getAllByText('Articles');
    fireEvent.click(articleButtons[1]);

    await waitFor(() => {
      expect(screen.getByText(/Showing 1 of 3 contributions/)).toBeDefined();
    });
  });

  it('renders actions when provided', () => {
    const actions = createElement('button', { 'data-testid': 'test-action' }, 'Test Action');

    render(createElement(ContributionList, {
      contributions: mockContributions,
      renderActions: () => actions,
      showActions: true,
    }));

    expect(screen.getAllByTestId('test-action')).toHaveLength(3);
  });

  it('shows clear filters button in empty state when filters are active', async () => {
    render(createElement(ContributionList, {
      contributions: mockContributions,
      showFilters: true,
    }));

    // Search for something that doesn't exist
    const searchInput = screen.getByPlaceholderText('Search contributions...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('Clear Filters')).toBeDefined();
    });
  });
});
