import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { createElement } from 'react';
import { ContributionProvider, useContributions } from './ContributionProvider';
import type { CreateContributionInput } from '@/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ContributionProvider', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  const TestComponent = () => {
    const {
      contributions,
      profiles,
      createNewContribution,
      submitForReview,
      updateContributionById,
      deleteContribution,
      beginReview,
      finishReview,
      publish,
      getOrCreateProfile,
    } = useContributions();

    const handleCreate = () => {
      const input: CreateContributionInput = {
        type: 'article',
        title: 'Test Article',
        description: 'A test article description',
        content: 'This is the content of the article with more than 100 characters to meet the validation requirements. Adding some more text here to make sure it passes validation.',
        authorId: 'user-1',
        tags: ['test'],
      };
      createNewContribution(input);
    };

    const handleSubmit = () => {
      if (contributions.length > 0) {
        submitForReview(contributions[0].id);
      }
    };

    const handleUpdate = () => {
      if (contributions.length > 0) {
        updateContributionById(contributions[0].id, { title: 'Updated Title' });
      }
    };

    const handleDelete = () => {
      if (contributions.length > 0) {
        deleteContribution(contributions[0].id);
      }
    };

    const handleStartReview = () => {
      if (contributions.length > 0) {
        beginReview(contributions[0].id, 'moderator-1');
      }
    };

    const handleFinishReview = () => {
      if (contributions.length > 0) {
        finishReview(contributions[0].id, 'approve');
      }
    };

    const handlePublish = () => {
      if (contributions.length > 0) {
        publish(contributions[0].id);
      }
    };

    const handleGetProfile = () => {
      getOrCreateProfile('user-1', 'testuser', 'Test User', 'A test user');
    };

    return createElement('div', null,
      createElement('div', { 'data-testid': 'contributions-count' }, contributions.length),
      createElement('div', { 'data-testid': 'profiles-count' }, profiles.length),
      createElement('button', { onClick: handleCreate, 'data-testid': 'create' }, 'Create'),
      createElement('button', { onClick: handleSubmit, 'data-testid': 'submit' }, 'Submit'),
      createElement('button', { onClick: handleUpdate, 'data-testid': 'update' }, 'Update'),
      createElement('button', { onClick: handleDelete, 'data-testid': 'delete' }, 'Delete'),
      createElement('button', { onClick: handleStartReview, 'data-testid': 'start-review' }, 'Start Review'),
      createElement('button', { onClick: handleFinishReview, 'data-testid': 'finish-review' }, 'Finish Review'),
      createElement('button', { onClick: handlePublish, 'data-testid': 'publish' }, 'Publish'),
      createElement('button', { onClick: handleGetProfile, 'data-testid': 'get-profile' }, 'Get Profile'),
      ...contributions.map((c) =>
        createElement('div', { key: c.id, 'data-testid': `contribution-${c.id}` }, c.title)
      )
    );
  };

  it('provides contribution context to children', () => {
    render(createElement(ContributionProvider, null,
      createElement(TestComponent)
    ));

    expect(screen.getByTestId('contributions-count').textContent).toBe('0');
  });

  it('creates a new contribution', async () => {
    render(createElement(ContributionProvider, null,
      createElement(TestComponent)
    ));

    act(() => {
      fireEvent.click(screen.getByTestId('create'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('contributions-count').textContent).toBe('1');
    });
  });

  it('submits contribution for review', async () => {
    render(createElement(ContributionProvider, null,
      createElement(TestComponent)
    ));

    // Create first
    act(() => {
      fireEvent.click(screen.getByTestId('create'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('contributions-count').textContent).toBe('1');
    });

    // Submit for review
    act(() => {
      fireEvent.click(screen.getByTestId('submit'));
    });

    await waitFor(() => {
      // After submission, the contribution should still exist but status changed
      expect(screen.getByTestId('contributions-count').textContent).toBe('1');
    });
  });

  it('updates contribution', async () => {
    render(createElement(ContributionProvider, null,
      createElement(TestComponent)
    ));

    // Create first
    act(() => {
      fireEvent.click(screen.getByTestId('create'));
    });

    await waitFor(() => {
      expect(screen.getByText('Test Article')).toBeDefined();
    });

    // Update
    act(() => {
      fireEvent.click(screen.getByTestId('update'));
    });

    await waitFor(() => {
      expect(screen.getByText('Updated Title')).toBeDefined();
    });
  });

  it('deletes contribution', async () => {
    render(createElement(ContributionProvider, null,
      createElement(TestComponent)
    ));

    // Create first
    act(() => {
      fireEvent.click(screen.getByTestId('create'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('contributions-count').textContent).toBe('1');
    });

    // Delete
    act(() => {
      fireEvent.click(screen.getByTestId('delete'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('contributions-count').textContent).toBe('0');
    });
  });

  it('starts review for contribution', async () => {
    render(createElement(ContributionProvider, null,
      createElement(TestComponent)
    ));

    // Create and submit first
    act(() => {
      fireEvent.click(screen.getByTestId('create'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('contributions-count').textContent).toBe('1');
    });

    act(() => {
      fireEvent.click(screen.getByTestId('submit'));
    });

    // Start review
    act(() => {
      fireEvent.click(screen.getByTestId('start-review'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('contributions-count').textContent).toBe('1');
    });
  });

  it('finishes review and approves contribution', async () => {
    render(createElement(ContributionProvider, null,
      createElement(TestComponent)
    ));

    // Create, submit, start review
    act(() => {
      fireEvent.click(screen.getByTestId('create'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('contributions-count').textContent).toBe('1');
    });

    act(() => {
      fireEvent.click(screen.getByTestId('submit'));
    });

    act(() => {
      fireEvent.click(screen.getByTestId('start-review'));
    });

    // Finish review with approval
    act(() => {
      fireEvent.click(screen.getByTestId('finish-review'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('contributions-count').textContent).toBe('1');
    });
  });

  it('publishes approved contribution', async () => {
    render(createElement(ContributionProvider, null,
      createElement(TestComponent)
    ));

    // Create, submit, start review, finish review
    act(() => {
      fireEvent.click(screen.getByTestId('create'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('contributions-count').textContent).toBe('1');
    });

    act(() => {
      fireEvent.click(screen.getByTestId('submit'));
    });

    act(() => {
      fireEvent.click(screen.getByTestId('start-review'));
    });

    act(() => {
      fireEvent.click(screen.getByTestId('finish-review'));
    });

    // Publish
    act(() => {
      fireEvent.click(screen.getByTestId('publish'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('contributions-count').textContent).toBe('1');
    });
  });

  it('creates or gets contributor profile', async () => {
    render(createElement(ContributionProvider, null,
      createElement(TestComponent)
    ));

    expect(screen.getByTestId('profiles-count').textContent).toBe('0');

    act(() => {
      fireEvent.click(screen.getByTestId('get-profile'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('profiles-count').textContent).toBe('1');
    });

    // Calling again should return existing profile
    act(() => {
      fireEvent.click(screen.getByTestId('get-profile'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('profiles-count').textContent).toBe('1');
    });
  });

  it('throws error when useContributions is used outside provider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(createElement(TestComponent));
    }).toThrow('useContributions must be used within a ContributionProvider');

    consoleError.mockRestore();
  });

  it('persists contributions to localStorage', async () => {
    const { unmount } = render(createElement(ContributionProvider, null,
      createElement(TestComponent)
    ));

    // Create contribution
    act(() => {
      fireEvent.click(screen.getByTestId('create'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('contributions-count').textContent).toBe('1');
    });

    // Unmount and remount
    unmount();

    render(createElement(ContributionProvider, null,
      createElement(TestComponent)
    ));

    // Contribution should be loaded from localStorage
    await waitFor(() => {
      expect(screen.getByTestId('contributions-count').textContent).toBe('1');
    });
  });

  it('handles moderator status', async () => {
    const ModeratorTestComponent = () => {
      const { isModerator, setModeratorStatus } = useContributions();

      return createElement('div', null,
        createElement('div', { 'data-testid': 'is-moderator' }, isModerator ? 'yes' : 'no'),
        createElement('button', {
          onClick: () => setModeratorStatus(true),
          'data-testid': 'set-moderator'
        }, 'Set Moderator')
      );
    };

    render(createElement(ContributionProvider, { isModerator: false },
      createElement(ModeratorTestComponent)
    ));

    expect(screen.getByTestId('is-moderator').textContent).toBe('no');

    act(() => {
      fireEvent.click(screen.getByTestId('set-moderator'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-moderator').textContent).toBe('yes');
    });
  });
});
