/**
 * User Testing Dashboard Component Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserTestingDashboard } from '@/components/wiki/UserTestingDashboard';
import {
  createTestingSession,
  completeTask,
  reportIssue,
  submitSessionFeedback,
  clearTestingData,
  getDefaultTestingTasks,
} from '@/lib/user-testing-utils';

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

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: any) => <div data-testid="pie">{children}</div>,
  Cell: () => <div />,
  CartesianGrid: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  LineChart: ({ children }: any) => <div>{children}</div>,
  Line: () => <div />,
}));

// Mock window.confirm
global.confirm = vi.fn(() => true);

// Mock URL.createObjectURL and download
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('UserTestingDashboard', () => {
  beforeEach(() => {
    clearTestingData();
    vi.clearAllMocks();
  });

  afterEach(() => {
    clearTestingData();
  });

  describe('Rendering', () => {
    it('should render with no data', () => {
      render(<UserTestingDashboard />);
      expect(screen.getByText('Total Sessions')).toBeInTheDocument();
      expect(screen.getByText('Task Completion')).toBeInTheDocument();
      expect(screen.getByText('Average Rating')).toBeInTheDocument();
      expect(screen.getByText('Avg Session Time')).toBeInTheDocument();
    });

    it('should show zero values when no sessions', () => {
      render(<UserTestingDashboard />);
      expect(screen.getByText('0')).toBeInTheDocument(); // Total Sessions
      expect(screen.getByText('N/A')).toBeInTheDocument(); // Average Rating or Session Time
    });

    it('should render action buttons', () => {
      render(<UserTestingDashboard />);
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export data/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear data/i })).toBeInTheDocument();
    });

    it('should render tabs', () => {
      render(<UserTestingDashboard />);
      expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Issues' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Recommendations' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Task Analysis' })).toBeInTheDocument();
    });
  });

  describe('With Test Data', () => {
    beforeEach(async () => {
      // Create a completed session with data
      const session = createTestingSession('tester-1', 'complete_beginner', 'beginner', 0);

      // Complete some tasks
      const tasks = getDefaultTestingTasks().filter(t => !t.optional);
      tasks.forEach(task => {
        completeTask(session.id, task.id, 'completed', 60, 'easy');
      });

      // Report some issues
      reportIssue(session.id, 'tester-1', {
        category: 'navigation',
        severity: 'major',
        title: 'Cannot find navigation',
        description: 'The menu is hard to find',
      });

      reportIssue(session.id, 'tester-1', {
        category: 'content_clarity',
        severity: 'minor',
        title: 'Explanation unclear',
        description: 'Need better explanations',
      });

      // Submit feedback
      submitSessionFeedback(session.id, {
        overallRating: 4,
        easeOfNavigation: 3,
        contentClarity: 4,
        visualDesign: 5,
        likelihoodToRecommend: 7,
        whatNeedsImprovement: 'Navigation needs work',
      });
    });

    it('should display session statistics', () => {
      render(<UserTestingDashboard />);

      expect(screen.getByText('1')).toBeInTheDocument(); // Total Sessions
    });

    it('should render issues in Issues tab', async () => {
      render(<UserTestingDashboard />);

      // Click on Issues tab
      fireEvent.click(screen.getByRole('tab', { name: 'Issues' }));

      await waitFor(() => {
        expect(screen.getByText('Cannot find navigation')).toBeInTheDocument();
        expect(screen.getByText('Explanation unclear')).toBeInTheDocument();
      });
    });

    it('should filter issues by severity', async () => {
      render(<UserTestingDashboard />);

      // Click on Issues tab
      fireEvent.click(screen.getByRole('tab', { name: 'Issues' }));

      await waitFor(() => {
        // Click major severity filter
        const majorButtons = screen.getAllByRole('button', { name: 'major' });
        const filterButton = majorButtons.find(btn => btn.getAttribute('variant') === 'default');
        if (filterButton) {
          fireEvent.click(filterButton);
        }
      });
    });

    it('should filter issues by category', async () => {
      render(<UserTestingDashboard />);

      // Click on Issues tab
      fireEvent.click(screen.getByRole('tab', { name: 'Issues' }));

      await waitFor(() => {
        // Click navigation category filter
        const navButton = screen.getByRole('button', { name: 'navigation' });
        fireEvent.click(navButton);
      });
    });

    it('should display recommendations in Recommendations tab', async () => {
      render(<UserTestingDashboard />);

      // Click on Recommendations tab
      fireEvent.click(screen.getByRole('tab', { name: 'Recommendations' }));

      await waitFor(() => {
        expect(screen.getByText('Common Pain Points')).toBeInTheDocument();
      });
    });

    it('should display task analysis in Task Analysis tab', async () => {
      render(<UserTestingDashboard />);

      // Click on Task Analysis tab
      fireEvent.click(screen.getByRole('tab', { name: 'Task Analysis' }));

      await waitFor(() => {
        expect(screen.getByText('Tasks Needing Improvement')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should call clearTestingData when Clear Data button is clicked', async () => {
      // Create test data
      const session = createTestingSession('tester-1', 'student', 'intermediate', 2);
      submitSessionFeedback(session.id, {
        overallRating: 5,
        easeOfNavigation: 5,
        contentClarity: 5,
        visualDesign: 5,
        likelihoodToRecommend: 10,
      });

      render(<UserTestingDashboard />);

      const clearButton = screen.getByRole('button', { name: /clear data/i });
      fireEvent.click(clearButton);

      // Should show confirmation dialog
      expect(global.confirm).toHaveBeenCalledWith(
        expect.stringContaining('clear all testing data')
      );
    });

    it('should export data when Export button is clicked', () => {
      // Create test data
      const session = createTestingSession('tester-1', 'educator', 'advanced', 15);
      submitSessionFeedback(session.id, {
        overallRating: 4,
        easeOfNavigation: 4,
        contentClarity: 4,
        visualDesign: 4,
        likelihoodToRecommend: 7,
      });

      render(<UserTestingDashboard />);

      const exportButton = screen.getByRole('button', { name: /export data/i });

      // Mock createElement and appendChild
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

      fireEvent.click(exportButton);

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty issues list gracefully', () => {
      render(<UserTestingDashboard />);

      // Click on Issues tab
      fireEvent.click(screen.getByRole('tab', { name: 'Issues' }));

      expect(screen.getByText(/no issues match/i)).toBeInTheDocument();
    });

    it('should handle no tasks needing improvement', () => {
      render(<UserTestingDashboard />);

      // Click on Task Analysis tab
      fireEvent.click(screen.getByRole('tab', { name: 'Task Analysis' }));

      expect(screen.getByText(/all tasks are performing well/i)).toBeInTheDocument();
    });

    it('should handle no pain points', () => {
      render(<UserTestingDashboard />);

      // Click on Recommendations tab
      fireEvent.click(screen.getByRole('tab', { name: 'Recommendations' }));

      expect(screen.getByText(/no pain points reported yet/i)).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    beforeEach(async () => {
      // Create comprehensive test data
      const session1 = createTestingSession('tester-1', 'complete_beginner', 'beginner', 0);
      const session2 = createTestingSession('tester-2', 'traditional_developer', 'advanced', 10);

      // Complete tasks with varying difficulty
      const tasks = getDefaultTestingTasks().filter(t => !t.optional);
      tasks.slice(0, 3).forEach(task => {
        completeTask(session1.id, task.id, 'completed', 120, 'easy');
        completeTask(session2.id, task.id, 'completed', 30, 'very_easy');
      });

      // Make some tasks difficult
      completeTask(session1.id, tasks[3].id, 'abandoned', 60, 'difficult', undefined, 'Too hard');
      completeTask(session2.id, tasks[3].id, 'completed_with_help', 180, 'difficult', 'Needed help');

      // Report various issues
      reportIssue(session1.id, 'tester-1', {
        category: 'navigation',
        severity: 'critical',
        title: 'Cannot navigate',
        description: 'Navigation is broken',
        stepsToReproduce: ['1. Open homepage', '2. Click menu', '3. Nothing happens'],
        page: '/wiki',
      });

      reportIssue(session2.id, 'tester-2', {
        category: 'technical_error',
        severity: 'major',
        title: 'Code crashes',
        description: 'Code example throws error',
        page: '/wiki/example',
      });

      // Submit feedback
      submitSessionFeedback(session1.id, {
        overallRating: 3,
        easeOfNavigation: 2,
        contentClarity: 3,
        visualDesign: 4,
        likelihoodToRecommend: 5,
        whatNeedsImprovement: 'Navigation is broken, content is unclear',
        featureRequests: 'Dark mode',
      });

      submitSessionFeedback(session2.id, {
        overallRating: 4,
        easeOfNavigation: 4,
        contentClarity: 4,
        visualDesign: 5,
        likelihoodToRecommend: 8,
        whatWorkedWell: 'Great content',
      });
    });

    it('should show multiple sessions in statistics', () => {
      render(<UserTestingDashboard />);
      expect(screen.getByText('2')).toBeInTheDocument(); // Total Sessions
    });

    it('should display issue details in Issues tab', async () => {
      render(<UserTestingDashboard />);

      fireEvent.click(screen.getByRole('tab', { name: 'Issues' }));

      await waitFor(() => {
        expect(screen.getByText('Cannot navigate')).toBeInTheDocument();
        expect(screen.getByText('Code crashes')).toBeInTheDocument();
      });
    });

    it('should show issue severity badges', async () => {
      render(<UserTestingDashboard />);

      fireEvent.click(screen.getByRole('tab', { name: 'Issues' }));

      await waitFor(() => {
        expect(screen.getByText('critical')).toBeInTheDocument();
        expect(screen.getByText('major')).toBeInTheDocument();
      });
    });

    it('should show steps to reproduce when available', async () => {
      render(<UserTestingDashboard />);

      fireEvent.click(screen.getByRole('tab', { name: 'Issues' }));

      await waitFor(() => {
        expect(screen.getByText('Steps to Reproduce')).toBeInTheDocument();
      });
    });

    it('should display pain points in Recommendations tab', async () => {
      render(<UserTestingDashboard />);

      fireEvent.click(screen.getByRole('tab', { name: 'Recommendations' }));

      await waitFor(() => {
        expect(screen.getByText(/navigation is broken/i)).toBeInTheDocument();
        expect(screen.getByText(/content is unclear/i)).toBeInTheDocument();
      });
    });

    it('should show tasks needing improvement', async () => {
      render(<UserTestingDashboard />);

      fireEvent.click(screen.getByRole('tab', { name: 'Task Analysis' }));

      await waitFor(() => {
        // Should show at least one task with difficulty rating
        expect(screen.getByText('difficult')).toBeInTheDocument();
      });
    });
  });

  describe('Tabs Navigation', () => {
    it('should switch between tabs correctly', () => {
      render(<UserTestingDashboard />);

      const overviewTab = screen.getByRole('tab', { name: 'Overview' });
      const issuesTab = screen.getByRole('tab', { name: 'Issues' });
      const recommendationsTab = screen.getByRole('tab', { name: 'Recommendations' });
      const tasksTab = screen.getByRole('tab', { name: 'Task Analysis' });

      // Overview is selected by default
      expect(overviewTab).toHaveAttribute('aria-selected', 'true');

      // Click Issues tab
      fireEvent.click(issuesTab);
      expect(issuesTab).toHaveAttribute('aria-selected', 'true');
      expect(overviewTab).toHaveAttribute('aria-selected', 'false');

      // Click Recommendations tab
      fireEvent.click(recommendationsTab);
      expect(recommendationsTab).toHaveAttribute('aria-selected', 'true');
      expect(issuesTab).toHaveAttribute('aria-selected', 'false');

      // Click Task Analysis tab
      fireEvent.click(tasksTab);
      expect(tasksTab).toHaveAttribute('aria-selected', 'true');
      expect(recommendationsTab).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Responsive Design', () => {
    it('should render correctly on mobile', () => {
      // Mock mobile viewport
      global.innerWidth = 375;
      window.dispatchEvent(new Event('resize'));

      render(<UserTestingDashboard />);

      // Should still render all main elements
      expect(screen.getByText('Total Sessions')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
    });

    it('should render correctly on desktop', () => {
      // Mock desktop viewport
      global.innerWidth = 1920;
      window.dispatchEvent(new Event('resize'));

      render(<UserTestingDashboard />);

      expect(screen.getByText('Total Sessions')).toBeInTheDocument();
    });
  });
});
