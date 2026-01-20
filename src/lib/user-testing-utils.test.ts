/**
 * User Testing Utilities Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createTestingSession,
  getTestingSession,
  completeTask,
  reportIssue,
  submitSessionFeedback,
  getDefaultTestingTasks,
  getTasksForPersona,
  calculateSessionProgress,
  getTestingSessionSummary,
  getIssuesBySeverity,
  getIssuesByCategory,
  getIssuesByTester,
  clearTestingData,
  exportTestingData,
  getAverageDifficultyRating,
  getTasksNeedingImprovement,
  validateTestingSession,
  validateSessionFeedback,
  USER_PERSONAS,
} from '@/lib/user-testing-utils';
import type { UserTestingSession, TestingIssue, TaskCompletionStatus, DifficultyRating } from '@/types/user-testing';

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

describe('User Testing Utilities', () => {
  beforeEach(() => {
    clearTestingData();
    vi.clearAllMocks();
  });

  afterEach(() => {
    clearTestingData();
  });

  describe('getDefaultTestingTasks', () => {
    it('should return 8 default testing tasks', () => {
      const tasks = getDefaultTestingTasks();
      expect(tasks).toHaveLength(8);
    });

    it('should have tasks with required properties', () => {
      const tasks = getDefaultTestingTasks();
      tasks.forEach(task => {
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('title');
        expect(task).toHaveProperty('description');
        expect(task).toHaveProperty('targetPage');
        expect(task).toHaveProperty('expectedOutcome');
        expect(task).toHaveProperty('maxDuration');
        expect(task).toHaveProperty('order');
      });
    });

    it('should have only task 8 as optional', () => {
      const tasks = getDefaultTestingTasks();
      const optionalTasks = tasks.filter(t => t.optional);
      expect(optionalTasks).toHaveLength(1);
      expect(optionalTasks[0].id).toBe('task-8');
    });
  });

  describe('createTestingSession', () => {
    it('should create a new testing session', () => {
      const session = createTestingSession(
        'tester-1',
        'complete_beginner',
        'beginner',
        0
      );

      expect(session.testerId).toBe('tester-1');
      expect(session.testerRole).toBe('complete_beginner');
      expect(session.experienceLevel).toBe('beginner');
      expect(session.programmingExperience).toBe(0);
      expect(session.tasks).toEqual([]);
      expect(session.issues).toEqual([]);
      expect(session.startedAt).toBeInstanceOf(Date);
      expect(session.id).toMatch(/^session-\d+-[a-z0-9]+$/);
    });

    it('should create session with metadata', () => {
      const session = createTestingSession(
        'tester-2',
        'traditional_developer',
        'advanced',
        10,
        {
          age: 30,
          location: 'US',
          nativeLanguage: 'English',
          browser: 'Chrome',
          deviceType: 'desktop',
          screenResolution: '1920x1080',
        }
      );

      expect(session.age).toBe(30);
      expect(session.location).toBe('US');
      expect(session.nativeLanguage).toBe('English');
      expect(session.browser).toBe('Chrome');
      expect(session.deviceType).toBe('desktop');
      expect(session.screenResolution).toBe('1920x1080');
    });
  });

  describe('getTestingSession', () => {
    it('should return null for non-existent session', () => {
      const session = getTestingSession('non-existent');
      expect(session).toBeNull();
    });

    it('should return existing session', () => {
      const created = createTestingSession('tester-1', 'student', 'intermediate', 2);
      const retrieved = getTestingSession(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.testerId).toBe('tester-1');
    });
  });

  describe('completeTask', () => {
    it('should complete a task successfully', () => {
      const session = createTestingSession('tester-1', 'complete_beginner', 'beginner', 0);
      const updated = completeTask(
        session.id,
        'task-1',
        'completed',
        120,
        'easy'
      );

      expect(updated).not.toBeNull();
      expect(updated?.tasks).toHaveLength(1);
      expect(updated?.tasks[0].taskId).toBe('task-1');
      expect(updated?.tasks[0].status).toBe('completed');
      expect(updated?.tasks[0].duration).toBe(120);
      expect(updated?.tasks[0].difficultyRating).toBe('easy');
    });

    it('should handle task completed with help', () => {
      const session = createTestingSession('tester-1', 'student', 'intermediate', 2);
      const updated = completeTask(
        session.id,
        'task-2',
        'completed_with_help',
        300,
        'moderate',
        'Used the hint button',
      );

      expect(updated?.tasks[0].status).toBe('completed_with_help');
      expect(updated?.tasks[0].comments).toBe('Used the hint button');
    });

    it('should handle abandoned tasks', () => {
      const session = createTestingSession('tester-1', 'educator', 'advanced', 15);
      const updated = completeTask(
        session.id,
        'task-3',
        'abandoned',
        60,
        'difficult',
        undefined,
        'Could not find the page'
      );

      expect(updated?.tasks[0].status).toBe('abandoned');
      expect(updated?.tasks[0].abandonedReason).toBe('Could not find the page');
    });

    it('should return null for non-existent session', () => {
      const result = completeTask('non-existent', 'task-1', 'completed', 60, 'easy');
      expect(result).toBeNull();
    });

    it('should update existing task result', () => {
      const session = createTestingSession('tester-1', 'student', 'intermediate', 2);
      completeTask(session.id, 'task-1', 'completed', 120, 'easy');
      const updated = completeTask(session.id, 'task-1', 'completed', 180, 'moderate');

      expect(updated?.tasks).toHaveLength(1);
      expect(updated?.tasks[0].duration).toBe(180);
      expect(updated?.tasks[0].difficultyRating).toBe('moderate');
    });
  });

  describe('reportIssue', () => {
    it('should report a new issue', () => {
      const session = createTestingSession('tester-1', 'complete_beginner', 'beginner', 0);
      const issue = reportIssue(session.id, 'tester-1', {
        category: 'navigation',
        severity: 'major',
        title: 'Cannot find the Getting Started link',
        description: 'The navigation menu is confusing',
      });

      expect(issue.id).toMatch(/^issue-\d+-[a-z0-9]+$/);
      expect(issue.category).toBe('navigation');
      expect(issue.severity).toBe('major');
      expect(issue.title).toBe('Cannot find the Getting Started link');
      expect(issue.description).toBe('The navigation menu is confusing');
      expect(issue.testerId).toBe('tester-1');
      expect(issue.timestamp).toBeInstanceOf(Date);
    });

    it('should add issue to session', () => {
      const session = createTestingSession('tester-1', 'student', 'intermediate', 2);
      reportIssue(session.id, 'tester-1', {
        category: 'content_clarity',
        severity: 'minor',
        title: 'Explanation unclear',
        description: 'The explanation of vibecoding is too technical',
      });

      const updated = getTestingSession(session.id);
      expect(updated?.issues).toHaveLength(1);
      expect(updated?.issues[0].category).toBe('content_clarity');
    });

    it('should report issue with all optional fields', () => {
      const session = createTestingSession('tester-1', 'educator', 'advanced', 15);
      const issue = reportIssue(session.id, 'tester-1', {
        category: 'technical_error',
        severity: 'critical',
        title: 'Code example crashes',
        description: 'The JavaScript example throws an error',
        stepsToReproduce: ['1. Navigate to /wiki/example', '2. Click Run button', '3. Error appears'],
        expectedBehavior: 'Code should execute successfully',
        actualBehavior: 'TypeError: undefined is not a function',
        page: '/wiki/example',
        taskId: 'task-8',
      });

      expect(issue.stepsToReproduce).toHaveLength(3);
      expect(issue.expectedBehavior).toBe('Code should execute successfully');
      expect(issue.actualBehavior).toBe('TypeError: undefined is not a function');
      expect(issue.page).toBe('/wiki/example');
      expect(issue.taskId).toBe('task-8');
    });
  });

  describe('submitSessionFeedback', () => {
    it('should submit session feedback', () => {
      const session = createTestingSession('tester-1', 'complete_beginner', 'beginner', 0);
      const updated = submitSessionFeedback(session.id, {
        overallRating: 5,
        easeOfNavigation: 4,
        contentClarity: 5,
        visualDesign: 5,
        likelihoodToRecommend: 9,
        whatWorkedWell: 'Very clear explanations',
        whatNeedsImprovement: 'Would like more examples',
      });

      expect(updated?.sessionFeedback).toBeDefined();
      expect(updated?.sessionFeedback?.overallRating).toBe(5);
      expect(updated?.sessionFeedback?.easeOfNavigation).toBe(4);
      expect(updated?.sessionFeedback?.likelihoodToRecommend).toBe(9);
      expect(updated?.completedAt).toBeInstanceOf(Date);
    });

    it('should return null for non-existent session', () => {
      const result = submitSessionFeedback('non-existent', {
        overallRating: 3,
        easeOfNavigation: 3,
        contentClarity: 3,
        visualDesign: 3,
        likelihoodToRecommend: 5,
      });
      expect(result).toBeNull();
    });

    it('should accept full feedback with all fields', () => {
      const session = createTestingSession('tester-1', 'student', 'intermediate', 2);
      const updated = submitSessionFeedback(session.id, {
        overallRating: 4,
        easeOfNavigation: 3,
        contentClarity: 4,
        visualDesign: 5,
        likelihoodToRecommend: 7,
        whatWorkedWell: 'Great design and clear content',
        whatNeedsImprovement: 'Navigation could be improved',
        featureRequests: 'Dark mode, search shortcuts',
        additionalComments: 'Overall excellent experience',
      });

      expect(updated?.sessionFeedback?.featureRequests).toBe('Dark mode, search shortcuts');
      expect(updated?.sessionFeedback?.additionalComments).toBe('Overall excellent experience');
    });
  });

  describe('getTasksForPersona', () => {
    it('should return tasks for complete beginner persona', () => {
      const tasks = getTasksForPersona('persona-beginner');
      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks.every(t => t.id === 'task-1' || t.id === 'task-2' || t.id === 'task-3' || t.id === 'task-7')).toBe(true);
    });

    it('should return tasks for traditional developer persona', () => {
      const tasks = getTasksForPersona('persona-developer');
      expect(tasks.length).toBeGreaterThan(0);
    });

    it('should return all default tasks for invalid persona', () => {
      const tasks = getTasksForPersona('invalid-persona');
      expect(tasks).toHaveLength(8);
    });
  });

  describe('USER_PERSONAS', () => {
    it('should have 4 defined personas', () => {
      expect(USER_PERSONAS).toHaveLength(4);
    });

    it('should have personas with required properties', () => {
      USER_PERSONAS.forEach(persona => {
        expect(persona).toHaveProperty('id');
        expect(persona).toHaveProperty('name');
        expect(persona).toHaveProperty('role');
        expect(persona).toHaveProperty('description');
        expect(persona).toHaveProperty('goals');
        expect(persona).toHaveProperty('painPoints');
        expect(persona).toHaveProperty('technicalBackground');
        expect(persona).toHaveProperty('targetTasks');
      });
    });
  });

  describe('calculateSessionProgress', () => {
    it('should return 0 for session with no tasks', () => {
      const session = createTestingSession('tester-1', 'complete_beginner', 'beginner', 0);
      const progress = calculateSessionProgress(session);
      expect(progress).toBe(0);
    });

    it('should calculate progress based on required tasks', () => {
      const session = createTestingSession('tester-1', 'student', 'intermediate', 2);
      const tasks = getDefaultTestingTasks().filter(t => !t.optional);

      // Complete half of required tasks
      tasks.slice(0, Math.floor(tasks.length / 2)).forEach(task => {
        completeTask(session.id, task.id, 'completed', 60, 'easy');
      });

      const progress = calculateSessionProgress(session);
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(100);
    });

    it('should not count optional tasks in progress', () => {
      const session = createTestingSession('tester-1', 'educator', 'advanced', 15);
      const tasks = getDefaultTestingTasks();

      // Complete only optional task
      const optionalTask = tasks.find(t => t.optional);
      if (optionalTask) {
        completeTask(session.id, optionalTask.id, 'completed', 60, 'easy');
      }

      const progress = calculateSessionProgress(session);
      expect(progress).toBe(0);
    });

    it('should return 100 when all required tasks completed', () => {
      const session = createTestingSession('tester-1', 'traditional_developer', 'advanced', 10);
      const tasks = getDefaultTestingTasks().filter(t => !t.optional);

      tasks.forEach(task => {
        completeTask(session.id, task.id, 'completed', 60, 'easy');
      });

      const progress = calculateSessionProgress(session);
      expect(progress).toBe(100);
    });

    it('should count completed_with_help as completed', () => {
      const session = createTestingSession('tester-1', 'student', 'intermediate', 2);
      const tasks = getDefaultTestingTasks().filter(t => !t.optional);

      tasks.forEach(task => {
        completeTask(session.id, task.id, 'completed_with_help', 60, 'moderate');
      });

      const progress = calculateSessionProgress(session);
      expect(progress).toBe(100);
    });

    it('should not count abandoned or skipped tasks', () => {
      const session = createTestingSession('tester-1', 'complete_beginner', 'beginner', 0);
      const tasks = getDefaultTestingTasks().filter(t => !t.optional);

      // Abandon all tasks
      tasks.forEach(task => {
        completeTask(session.id, task.id, 'abandoned', 30, 'difficult', undefined, 'Too hard');
      });

      const progress = calculateSessionProgress(session);
      expect(progress).toBe(0);
    });
  });

  describe('getTestingSessionSummary', () => {
    it('should return empty summary when no sessions', () => {
      const summary = getTestingSessionSummary();
      expect(summary.totalSessions).toBe(0);
      expect(summary.completedSessions).toBe(0);
      expect(summary.averageSessionDuration).toBe(0);
      expect(summary.taskCompletionRate).toBe(0);
      expect(summary.averageRating).toBe(0);
    });

    it('should calculate summary from completed sessions', () => {
      const session1 = createTestingSession('tester-1', 'complete_beginner', 'beginner', 0);
      const tasks = getDefaultTestingTasks().filter(t => !t.optional);
      tasks.forEach(task => {
        completeTask(session1.id, task.id, 'completed', 60, 'easy');
      });
      submitSessionFeedback(session1.id, {
        overallRating: 5,
        easeOfNavigation: 4,
        contentClarity: 5,
        visualDesign: 5,
        likelihoodToRecommend: 10,
      });

      const summary = getTestingSessionSummary();
      expect(summary.totalSessions).toBe(1);
      expect(summary.completedSessions).toBe(1);
      expect(summary.averageRating).toBe(5);
      expect(summary.taskCompletionRate).toBe(100);
    });

    it('should track issues by severity', () => {
      const session = createTestingSession('tester-1', 'student', 'intermediate', 2);

      reportIssue(session.id, 'tester-1', {
        category: 'navigation',
        severity: 'critical',
        title: 'Critical issue',
        description: 'Test',
      });

      reportIssue(session.id, 'tester-1', {
        category: 'content_clarity',
        severity: 'minor',
        title: 'Minor issue',
        description: 'Test',
      });

      const summary = getTestingSessionSummary();
      expect(summary.issuesBySeverity.critical).toBe(1);
      expect(summary.issuesBySeverity.minor).toBe(1);
    });

    it('should track issues by category', () => {
      const session = createTestingSession('tester-1', 'educator', 'advanced', 15);

      reportIssue(session.id, 'tester-1', {
        category: 'navigation',
        severity: 'major',
        title: 'Nav issue 1',
        description: 'Test',
      });

      reportIssue(session.id, 'tester-1', {
        category: 'navigation',
        severity: 'major',
        title: 'Nav issue 2',
        description: 'Test',
      });

      reportIssue(session.id, 'tester-1', {
        category: 'content_clarity',
        severity: 'minor',
        title: 'Content issue',
        description: 'Test',
      });

      const summary = getTestingSessionSummary();
      expect(summary.issuesByCategory.navigation).toBe(2);
      expect(summary.issuesByCategory.content_clarity).toBe(1);
    });

    it('should generate recommendations based on data', () => {
      const session = createTestingSession('tester-1', 'complete_beginner', 'beginner', 0);

      // Report critical issues
      reportIssue(session.id, 'tester-1', {
        category: 'technical_error',
        severity: 'critical',
        title: 'Critical bug',
        description: 'Test',
      });

      // Submit low rating
      submitSessionFeedback(session.id, {
        overallRating: 3,
        easeOfNavigation: 3,
        contentClarity: 3,
        visualDesign: 3,
        likelihoodToRecommend: 4,
      });

      const summary = getTestingSessionSummary();
      expect(summary.recommendations.length).toBeGreaterThan(0);
      expect(summary.recommendations.some(r => r.includes('critical'))).toBe(true);
    });

    it('should calculate average session duration', () => {
      const session1 = createTestingSession('tester-1', 'student', 'intermediate', 2);
      submitSessionFeedback(session1.id, {
        overallRating: 4,
        easeOfNavigation: 4,
        contentClarity: 4,
        visualDesign: 4,
        likelihoodToRecommend: 7,
      });

      const summary = getTestingSessionSummary();
      expect(summary.averageSessionDuration).toBeGreaterThan(0);
    });

    it('should return top issues ordered by severity and recency', () => {
      const session = createTestingSession('tester-1', 'traditional_developer', 'advanced', 10);

      reportIssue(session.id, 'tester-1', {
        category: 'other',
        severity: 'cosmetic',
        title: 'Old cosmetic issue',
        description: 'Test',
      });

      // Sleep to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      reportIssue(session.id, 'tester-1', {
        category: 'technical_error',
        severity: 'critical',
        title: 'Recent critical issue',
        description: 'Test',
      });

      const summary = getTestingSessionSummary();
      expect(summary.topIssues[0].severity).toBe('critical');
    });
  });

  describe('getIssuesBySeverity', () => {
    it('should return issues filtered by severity', () => {
      const session = createTestingSession('tester-1', 'complete_beginner', 'beginner', 0);

      reportIssue(session.id, 'tester-1', {
        category: 'navigation',
        severity: 'critical',
        title: 'Critical issue',
        description: 'Test',
      });

      reportIssue(session.id, 'tester-1', {
        category: 'content_clarity',
        severity: 'minor',
        title: 'Minor issue',
        description: 'Test',
      });

      const criticalIssues = getIssuesBySeverity('critical');
      expect(criticalIssues).toHaveLength(1);
      expect(criticalIssues[0].severity).toBe('critical');

      const minorIssues = getIssuesBySeverity('minor');
      expect(minorIssues).toHaveLength(1);
      expect(minorIssues[0].severity).toBe('minor');
    });

    it('should return empty array for non-existent severity', () => {
      const issues = getIssuesBySeverity('critical');
      expect(issues).toEqual([]);
    });
  });

  describe('getIssuesByCategory', () => {
    it('should return issues filtered by category', () => {
      const session = createTestingSession('tester-1', 'student', 'intermediate', 2);

      reportIssue(session.id, 'tester-1', {
        category: 'navigation',
        severity: 'major',
        title: 'Nav issue 1',
        description: 'Test',
      });

      reportIssue(session.id, 'tester-1', {
        category: 'navigation',
        severity: 'major',
        title: 'Nav issue 2',
        description: 'Test',
      });

      reportIssue(session.id, 'tester-1', {
        category: 'content_clarity',
        severity: 'minor',
        title: 'Content issue',
        description: 'Test',
      });

      const navIssues = getIssuesByCategory('navigation');
      expect(navIssues).toHaveLength(2);
      expect(navIssues.every(i => i.category === 'navigation')).toBe(true);
    });

    it('should return empty array for non-existent category', () => {
      const issues = getIssuesByCategory('navigation');
      expect(issues).toEqual([]);
    });
  });

  describe('getIssuesByTester', () => {
    it('should return issues filtered by tester', () => {
      const session1 = createTestingSession('tester-1', 'complete_beginner', 'beginner', 0);
      const session2 = createTestingSession('tester-2', 'student', 'intermediate', 2);

      reportIssue(session1.id, 'tester-1', {
        category: 'navigation',
        severity: 'major',
        title: 'Issue from tester 1',
        description: 'Test',
      });

      reportIssue(session2.id, 'tester-2', {
        category: 'content_clarity',
        severity: 'minor',
        title: 'Issue from tester 2',
        description: 'Test',
      });

      const tester1Issues = getIssuesByTester('tester-1');
      expect(tester1Issues).toHaveLength(1);
      expect(tester1Issues[0].testerId).toBe('tester-1');

      const tester2Issues = getIssuesByTester('tester-2');
      expect(tester2Issues).toHaveLength(1);
      expect(tester2Issues[0].testerId).toBe('tester-2');
    });

    it('should return empty array for non-existent tester', () => {
      const issues = getIssuesByTester('non-existent');
      expect(issues).toEqual([]);
    });
  });

  describe('clearTestingData', () => {
    it('should clear all testing data', () => {
      createTestingSession('tester-1', 'complete_beginner', 'beginner', 0);
      createTestingSession('tester-2', 'student', 'intermediate', 2);

      expect(getTestingSessionSummary().totalSessions).toBe(2);

      clearTestingData();

      expect(getTestingSessionSummary().totalSessions).toBe(0);
    });
  });

  describe('exportTestingData', () => {
    it('should export testing data as JSON', () => {
      const session = createTestingSession('tester-1', 'educator', 'advanced', 15);
      submitSessionFeedback(session.id, {
        overallRating: 5,
        easeOfNavigation: 5,
        contentClarity: 5,
        visualDesign: 5,
        likelihoodToRecommend: 10,
      });

      const exported = exportTestingData();
      const data = JSON.parse(exported);

      expect(data).toHaveProperty('exportDate');
      expect(data).toHaveProperty('summary');
      expect(data).toHaveProperty('sessions');
      expect(data).toHaveProperty('issues');
      expect(data.sessions).toHaveLength(1);
    });

    it('should include valid JSON structure', () => {
      const exported = exportTestingData();
      expect(() => JSON.parse(exported)).not.toThrow();
    });
  });

  describe('getAverageDifficultyRating', () => {
    it('should return null for task with no ratings', () => {
      const rating = getAverageDifficultyRating('task-1');
      expect(rating).toBeNull();
    });

    it('should calculate average difficulty rating', () => {
      const session = createTestingSession('tester-1', 'complete_beginner', 'beginner', 0);
      completeTask(session.id, 'task-1', 'completed', 60, 'easy');
      completeTask(session.id, 'task-1', 'completed', 60, 'moderate');

      const rating = getAverageDifficultyRating('task-1');
      expect(rating).toBe('easy'); // average of 2 and 3 is 2.5, which rounds to easy
    });

    it('should return very_difficult for all high ratings', () => {
      const session = createTestingSession('tester-1', 'student', 'intermediate', 2);
      completeTask(session.id, 'task-2', 'completed', 60, 'very_difficult');
      completeTask(session.id, 'task-2', 'completed', 60, 'very_difficult');

      const rating = getAverageDifficultyRating('task-2');
      expect(rating).toBe('very_difficult');
    });
  });

  describe('getTasksNeedingImprovement', () => {
    it('should return tasks with high difficulty rating', () => {
      const session = createTestingSession('tester-1', 'traditional_developer', 'advanced', 10);
      completeTask(session.id, 'task-1', 'completed', 60, 'very_difficult');

      const needsImprovement = getTasksNeedingImprovement();
      expect(needsImprovement.length).toBeGreaterThan(0);
      expect(needsImprovement.some(item => item.task.id === 'task-1')).toBe(true);
    });

    it('should return tasks with low completion rate', () => {
      const session1 = createTestingSession('tester-1', 'educator', 'advanced', 15);
      const session2 = createTestingSession('tester-2', 'complete_beginner', 'beginner', 0);
      const session3 = createTestingSession('tester-3', 'student', 'intermediate', 2);

      // Only 1 out of 3 completes the task
      completeTask(session1.id, 'task-2', 'completed', 60, 'easy');
      completeTask(session2.id, 'task-2', 'abandoned', 30, 'difficult', undefined, 'Too hard');
      completeTask(session3.id, 'task-2', 'abandoned', 20, 'difficult', undefined, 'Gave up');

      const needsImprovement = getTasksNeedingImprovement();
      const task2Item = needsImprovement.find(item => item.task.id === 'task-2');
      expect(task2Item?.completionRate).toBeLessThan(70);
    });

    it('should return empty array when all tasks are fine', () => {
      const needsImprovement = getTasksNeedingImprovement();
      expect(needsImprovement).toEqual([]);
    });
  });

  describe('validateTestingSession', () => {
    it('should validate correct session', () => {
      const session = createTestingSession('tester-1', 'complete_beginner', 'beginner', 0);
      expect(validateTestingSession(session)).toBe(true);
    });

    it('should reject session without id', () => {
      const invalidSession = {
        id: '',
        testerId: 'tester-1',
        testerRole: 'complete_beginner' as const,
        experienceLevel: 'beginner' as const,
        programmingExperience: 0,
        tasks: [],
        issues: [],
        startedAt: new Date(),
      };
      expect(validateTestingSession(invalidSession)).toBe(false);
    });

    it('should reject session without testerId', () => {
      const invalidSession = {
        id: 'session-1',
        testerId: '',
        testerRole: 'complete_beginner' as const,
        experienceLevel: 'beginner' as const,
        programmingExperience: 0,
        tasks: [],
        issues: [],
        startedAt: new Date(),
      };
      expect(validateTestingSession(invalidSession)).toBe(false);
    });

    it('should reject session with invalid programmingExperience', () => {
      const invalidSession = {
        id: 'session-1',
        testerId: 'tester-1',
        testerRole: 'complete_beginner' as const,
        experienceLevel: 'beginner' as const,
        programmingExperience: 'invalid' as unknown as number,
        tasks: [],
        issues: [],
        startedAt: new Date(),
      };
      expect(validateTestingSession(invalidSession)).toBe(false);
    });

    it('should reject session with invalid tasks array', () => {
      const invalidSession = {
        id: 'session-1',
        testerId: 'tester-1',
        testerRole: 'complete_beginner' as const,
        experienceLevel: 'beginner' as const,
        programmingExperience: 0,
        tasks: 'invalid' as unknown as [],
        issues: [],
        startedAt: new Date(),
      };
      expect(validateTestingSession(invalidSession)).toBe(false);
    });
  });

  describe('validateSessionFeedback', () => {
    it('should validate correct feedback', () => {
      const feedback = {
        sessionId: 'session-1',
        overallRating: 5,
        easeOfNavigation: 4,
        contentClarity: 5,
        visualDesign: 5,
        likelihoodToRecommend: 9,
      };
      expect(validateSessionFeedback(feedback)).toBe(true);
    });

    it('should reject feedback without sessionId', () => {
      const invalidFeedback = {
        sessionId: '',
        overallRating: 5,
        easeOfNavigation: 4,
        contentClarity: 5,
        visualDesign: 5,
        likelihoodToRecommend: 9,
      };
      expect(validateSessionFeedback(invalidFeedback)).toBe(false);
    });

    it('should reject feedback with invalid overallRating', () => {
      const invalidFeedback = {
        sessionId: 'session-1',
        overallRating: 0 as 5,
        easeOfNavigation: 4,
        contentClarity: 5,
        visualDesign: 5,
        likelihoodToRecommend: 9,
      };
      expect(validateSessionFeedback(invalidFeedback)).toBe(false);
    });

    it('should reject feedback with invalid likelihoodToRecommend (negative)', () => {
      const invalidFeedback = {
        sessionId: 'session-1',
        overallRating: 5,
        easeOfNavigation: 4,
        contentClarity: 5,
        visualDesign: 5,
        likelihoodToRecommend: -1,
      };
      expect(validateSessionFeedback(invalidFeedback)).toBe(false);
    });

    it('should reject feedback with invalid likelihoodToRecommend (too high)', () => {
      const invalidFeedback = {
        sessionId: 'session-1',
        overallRating: 5,
        easeOfNavigation: 4,
        contentClarity: 5,
        visualDesign: 5,
        likelihoodToRecommend: 11,
      };
      expect(validateSessionFeedback(invalidFeedback)).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete testing workflow', () => {
      // Create session
      const session = createTestingSession('tester-1', 'complete_beginner', 'beginner', 0);

      // Complete some tasks
      const tasks = getDefaultTestingTasks().filter(t => !t.optional).slice(0, 3);
      tasks.forEach(task => {
        completeTask(session.id, task.id, 'completed', 60, 'easy');
      });

      // Report an issue
      reportIssue(session.id, 'tester-1', {
        category: 'content_clarity',
        severity: 'minor',
        title: 'Confusing explanation',
        description: 'The vibecoding explanation could be clearer',
      });

      // Submit feedback
      submitSessionFeedback(session.id, {
        overallRating: 4,
        easeOfNavigation: 4,
        contentClarity: 3,
        visualDesign: 5,
        likelihoodToRecommend: 7,
        whatNeedsImprovement: 'Some explanations are too technical',
      });

      // Verify session is complete
      const updatedSession = getTestingSession(session.id);
      expect(updatedSession?.sessionFeedback).toBeDefined();
      expect(updatedSession?.completedAt).toBeDefined();
      expect(updatedSession?.tasks).toHaveLength(3);
      expect(updatedSession?.issues).toHaveLength(1);

      // Verify summary includes this session
      const summary = getTestingSessionSummary();
      expect(summary.totalSessions).toBe(1);
      expect(summary.completedSessions).toBe(1);
    });

    it('should handle multiple simultaneous testing sessions', () => {
      // Create multiple sessions
      const session1 = createTestingSession('tester-1', 'complete_beginner', 'beginner', 0);
      const session2 = createTestingSession('tester-2', 'traditional_developer', 'advanced', 10);
      const session3 = createTestingSession('tester-3', 'student', 'intermediate', 2);

      // Complete some tasks in each
      completeTask(session1.id, 'task-1', 'completed', 120, 'easy');
      completeTask(session2.id, 'task-1', 'completed', 30, 'very_easy');
      completeTask(session3.id, 'task-1', 'completed_with_help', 180, 'moderate', 'Needed hints');

      // Verify all sessions are tracked
      const summary = getTestingSessionSummary();
      expect(summary.totalSessions).toBe(3);
      expect(summary.taskCompletionRate).toBeGreaterThan(0);
    });
  });
});
