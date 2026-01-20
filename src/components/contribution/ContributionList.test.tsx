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

    // Click article filter button
    const articleFilterButton = screen.getByRole('button', { name: /Articles/i });
    fireEvent.click(articleFilterButton);

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

    // Click published filter button
    const publishedFilterButton = screen.getByRole('button', { name: /Published/i });
    fireEvent.click(publishedFilterButton);

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

    // Click beginner filter button
    const beginnerFilterButton = screen.getByRole('button', { name: /Beginner/i });
    fireEvent.click(beginnerFilterButton);

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

    const oldestButton = screen.getByRole('button', { name: /Oldest/i });
    fireEvent.click(oldestButton);

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

    const titleButton = screen.getByRole('button', { name: /Title/i });
    fireEvent.click(titleButton);

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

    const articleFilterButton = screen.getByRole('button', { name: /Articles/i });
    fireEvent.click(articleFilterButton);

    await waitFor(() => {
      // Look for the filter count badge (rounded-full, neon-cyan/20)
      const filterBadges = screen.getAllByText('1');
      const badge = filterBadges.find(el => el.className.includes('rounded-full'));
      expect(badge).toBeDefined();
      expect(badge?.className).toContain('rounded-full');
    });
  });

  it('clears all filters', async () => {
    render(createElement(ContributionList, {
      contributions: mockContributions,
      showFilters: true,
    }));

    // Apply a filter
    const articleFilterButton = screen.getByRole('button', { name: /Articles/i });
    fireEvent.click(articleFilterButton);

    await waitFor(() => {
      expect(screen.getAllByText('1')).toHaveLength(2); // Filter badge + result count
    });

    // Clear filters
    const clearButton = screen.getByRole('button', { name: /Clear All/i });
    fireEvent.click(clearButton);

    await waitFor(() => {
      // After clearing, the "1"s should be gone and we should see "3" in the results count
      const ones = screen.queryAllByText('1');
      expect(ones.length).toBe(0);
      // The "3" should be visible in the results count
      const threes = screen.getAllByText('3');
      const resultsCount = threes.find(el => el.className.includes('text-foreground font-medium'));
      expect(resultsCount).toBeDefined();
    });
  });

  it('shows results count', () => {
    render(createElement(ContributionList, {
      contributions: mockContributions,
      showFilters: true,
    }));

    // The number 3 should be in the results count
    const threes = screen.getAllByText('3');
    const resultsCount = threes.find(el => el.className.includes('text-foreground font-medium'));
    expect(resultsCount).toBeDefined();
  });

  it('shows filtered results count', async () => {
    render(createElement(ContributionList, {
      contributions: mockContributions,
      showFilters: true,
    }));

    const articleFilterButton = screen.getByRole('button', { name: /Articles/i });
    fireEvent.click(articleFilterButton);

    await waitFor(() => {
      // When filtered, we should see "Showing 1 of 3 contributions"
      // Use a function matcher to find text containing the pattern
      const resultsText = screen.getByText((content) => {
        return content.includes('Showing') && content.includes('of') && content.includes('contributions');
      });
      expect(resultsText).toBeDefined();
      // Verify the count "1" is in the results
      const ones = screen.getAllByText('1');
      const resultsCount = ones.find(el => el.className.includes('text-foreground font-medium'));
      expect(resultsCount).toBeDefined();
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
