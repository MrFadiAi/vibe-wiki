/**
 * Tests for performance testing utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateTestId,
  getNetworkInfo,
  getDeviceInfo,
  calculatePerformanceScore,
  checkPerformanceBudgets,
  identifyPerformanceIssues,
  formatBytes,
  formatTime,
  DEFAULT_THRESHOLDS,
  DEFAULT_BUDGETS,
  savePerformanceTestResult,
  loadPerformanceTestResults,
  clearPerformanceTestResults,
  getPerformanceTestSummary,
} from './performance-testing-utils';
import type {
  CoreWebVitals,
  ResourceMetrics,
  NavigationMetrics,
  RenderMetrics,
  PerformanceTestResult,
} from '../types/performance-testing';

describe('generateTestId', () => {
  it('should generate unique test IDs', () => {
    const id1 = generateTestId();
    const id2 = generateTestId();

    expect(id1).toMatch(/^perf-test-\d+-[a-z0-9]+$/);
    expect(id2).toMatch(/^perf-test-\d+-[a-z0-9]+$/);
    expect(id1).not.toBe(id2);
  });
});

describe('formatBytes', () => {
  it('should format zero bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('should format bytes correctly', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
    expect(formatBytes(2.5 * 1024 * 1024)).toBe('2.5 MB');
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
  });
});

describe('formatTime', () => {
  it('should format milliseconds correctly', () => {
    expect(formatTime(100)).toBe('100ms');
    expect(formatTime(999)).toBe('999ms');
    expect(formatTime(1000)).toBe('1.00s');
    expect(formatTime(1500)).toBe('1.50s');
    expect(formatTime(2500)).toBe('2.50s');
  });
});

describe('calculatePerformanceScore', () => {
  const perfectCoreWebVitals: CoreWebVitals = {
    lcp: 1000, // Good (< 2.5s)
    fid: 50, // Good (< 100ms)
    cls: 0.05, // Good (< 0.1)
    fcp: 1000, // Good (< 1.8s)
    tti: 2000, // Good (< 3.8s)
    tbt: 100, // Good (< 200ms)
    si: 2000, // Good (< 3.4s)
  };

  it('should calculate score for perfect metrics', () => {
    const score = calculatePerformanceScore(perfectCoreWebVitals);

    expect(score.overall).toBe(100);
    expect(score.grade).toBe('A');
    expect(score.level).toBe('excellent');
  });

  it('should calculate score for warning-level metrics', () => {
    const warningVitals: CoreWebVitals = {
      ...perfectCoreWebVitals,
      lcp: 3000, // Between warning (2.5s) and critical (4s)
    };

    const score = calculatePerformanceScore(warningVitals);

    expect(score.overall).toBeGreaterThan(0);
    expect(score.overall).toBeLessThan(100);
    expect(score.metrics.lcp).toBeGreaterThan(0);
    expect(score.metrics.lcp).toBeLessThan(100);
  });

  it('should calculate score for critical-level metrics', () => {
    const criticalVitals: CoreWebVitals = {
      ...perfectCoreWebVitals,
      lcp: 5000, // Above critical (4s)
    };

    const score = calculatePerformanceScore(criticalVitals);

    expect(score.metrics.lcp).toBe(0);
  });

  it('should assign correct grades', () => {
    const excellentVitals: CoreWebVitals = { ...perfectCoreWebVitals, lcp: 1000 };
    expect(calculatePerformanceScore(excellentVitals).grade).toBe('A');

    const goodVitals: CoreWebVitals = { ...perfectCoreWebVitals, lcp: 3000 };
    expect(calculatePerformanceScore(goodVitals).grade).toBe('B');

    const needsImprovementVitals: CoreWebVitals = { ...perfectCoreWebVitals, lcp: 3600 };
    const score1 = calculatePerformanceScore(needsImprovementVitals);
    expect(score1.grade).toMatch(/^[C-D]$/);

    const poorVitals: CoreWebVitals = { ...perfectCoreWebVitals, lcp: 5000 };
    expect(calculatePerformanceScore(poorVitals).grade).toBe('F');
  });
});

describe('checkPerformanceBudgets', () => {
  const goodResources: ResourceMetrics = {
    totalCount: 10,
    totalSize: 300 * 1024,
    byType: {
      script: 5,
      stylesheet: 2,
      image: 3,
    },
    sizeByType: {
      script: 150 * 1024, // 150 KB - under 200 KB budget
      stylesheet: 30 * 1024, // 30 KB - under 50 KB budget
      image: 400 * 1024, // 400 KB - under 500 KB budget
    },
    slowResources: [],
  };

  const goodRender: RenderMetrics = {
    domNodes: 1000,
    domDepth: 10,
    stylesheets: 2,
    scripts: 5,
    images: 3,
    iframes: 0,
  };

  it('should pass budgets within limits', () => {
    const budgets = checkPerformanceBudgets(goodResources, goodRender);

    expect(budgets).toHaveLength(DEFAULT_BUDGETS.length);
    expect(budgets.every((b) => b.passed)).toBe(true);
  });

  it('should fail budgets over limits', () => {
    const badResources: ResourceMetrics = {
      ...goodResources,
      sizeByType: {
        script: 250 * 1024, // 250 KB - over 200 KB budget
        stylesheet: 60 * 1024, // 60 KB - over 50 KB budget
        image: 600 * 1024, // 600 KB - over 500 KB budget
      },
    };

    const budgets = checkPerformanceBudgets(badResources, goodRender);

    expect(budgets.some((b) => !b.passed)).toBe(true);

    const scriptBudget = budgets.find((b) => b.resourceType === 'script' && b.type === 'size');
    expect(scriptBudget?.passed).toBe(false);
    expect(scriptBudget?.over).toBe(50 * 1024);
  });

  it('should use custom budgets when provided', () => {
    const customBudgets = [
      {
        name: 'Custom JS Budget',
        type: 'size' as const,
        resourceType: 'script',
        budget: 100 * 1024,
      },
    ];

    const budgets = checkPerformanceBudgets(goodResources, goodRender, customBudgets);

    expect(budgets).toHaveLength(1);
    expect(budgets[0].name).toBe('Custom JS Budget');
    expect(budgets[0].passed).toBe(false); // 150 KB > 100 KB
  });
});

describe('identifyPerformanceIssues', () => {
  const goodCoreWebVitals: CoreWebVitals = {
    lcp: 1000,
    fid: 50,
    cls: 0.05,
    fcp: 1000,
    tti: 2000,
    tbt: 100,
    si: 2000,
  };

  const goodResources: ResourceMetrics = {
    totalCount: 10,
    totalSize: 100 * 1024,
    byType: {},
    sizeByType: {},
    slowResources: [],
  };

  const goodNavigation: NavigationMetrics = {
    dnsLookup: 50,
    tcpConnection: 50,
    tlsNegotiation: 50,
    requestTime: 100,
    responseTime: 100,
    domProcessing: 200,
    totalLoadTime: 1000,
  };

  const goodRender: RenderMetrics = {
    domNodes: 800,
    domDepth: 10,
    stylesheets: 2,
    scripts: 3,
    images: 2,
    iframes: 0,
  };

  it('should return no issues for good metrics', () => {
    const issues = identifyPerformanceIssues(
      goodCoreWebVitals,
      goodResources,
      goodNavigation,
      goodRender
    );

    expect(issues).toHaveLength(0);
  });

  it('should identify LCP issues', () => {
    const badVitals: CoreWebVitals = {
      ...goodCoreWebVitals,
      lcp: 5000, // Above 4s critical threshold
    };

    const issues = identifyPerformanceIssues(
      badVitals,
      goodResources,
      goodNavigation,
      goodRender
    );

    const lcpIssue = issues.find((i) => i.category === 'loading');
    expect(lcpIssue).toBeDefined();
    expect(lcpIssue?.severity).toBe('critical');
    expect(lcpIssue?.impact).toBe('high');
  });

  it('should identify FID issues', () => {
    const badVitals: CoreWebVitals = {
      ...goodCoreWebVitals,
      fid: 500, // Above 300ms critical threshold
    };

    const issues = identifyPerformanceIssues(
      badVitals,
      goodResources,
      goodNavigation,
      goodRender
    );

    const fidIssue = issues.find((i) => i.category === 'interactivity');
    expect(fidIssue).toBeDefined();
    expect(fidIssue?.severity).toBe('critical');
  });

  it('should identify CLS issues', () => {
    const badVitals: CoreWebVitals = {
      ...goodCoreWebVitals,
      cls: 0.5, // Above 0.25 critical threshold
    };

    const issues = identifyPerformanceIssues(
      badVitals,
      goodResources,
      goodNavigation,
      goodRender
    );

    const clsIssue = issues.find((i) => i.category === 'visual-stability');
    expect(clsIssue).toBeDefined();
    expect(clsIssue?.severity).toBe('critical');
  });

  it('should identify slow resources', () => {
    const badResources: ResourceMetrics = {
      ...goodResources,
      slowResources: [
        {
          name: 'https://example.com/slow.js',
          type: 'script',
          duration: 2000,
          size: 100 * 1024,
        },
        {
          name: 'https://example.com/slow.css',
          type: 'stylesheet',
          duration: 1500,
          size: 50 * 1024,
        },
      ],
    };

    const issues = identifyPerformanceIssues(
      goodCoreWebVitals,
      badResources,
      goodNavigation,
      goodRender
    );

    const resourceIssue = issues.find((i) => i.category === 'resources');
    expect(resourceIssue).toBeDefined();
    expect(resourceIssue?.severity).toBe('major');
    expect(resourceIssue?.title).toContain('2 slow resources');
  });

  it('should identify large DOM', () => {
    const badRender: RenderMetrics = {
      ...goodRender,
      domNodes: 2000, // Above 1500 threshold
    };

    const issues = identifyPerformanceIssues(
      goodCoreWebVitals,
      goodResources,
      goodNavigation,
      badRender
    );

    const domIssue = issues.find((i) => i.category === 'rendering');
    expect(domIssue).toBeDefined();
    expect(domIssue?.severity).toBe('minor');
    expect(domIssue?.title).toContain('Large DOM');
  });
});

describe('localStorage persistence', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    clearPerformanceTestResults();
  });

  describe('savePerformanceTestResult', () => {
    it('should save a test result to localStorage', () => {
      const result: PerformanceTestResult = {
        id: 'test-1',
        timestamp: new Date('2024-01-01T00:00:00Z'),
        name: 'Test 1',
        url: 'https://example.com',
        network: {
          effectiveType: '4g',
          downlink: 10,
          rtt: 100,
          saveData: false,
        },
        device: {
          userAgent: 'test',
          screenWidth: 1920,
          screenHeight: 1080,
          pixelRatio: 1,
        },
        coreWebVitals: {
          lcp: 1000,
          fid: 50,
          cls: 0.05,
          fcp: 1000,
          tti: 2000,
          tbt: 100,
          si: 2000,
        },
        resources: {
          totalCount: 10,
          totalSize: 100000,
          byType: {},
          sizeByType: {},
          slowResources: [],
        },
        navigation: {
          dnsLookup: 50,
          tcpConnection: 50,
          tlsNegotiation: 50,
          requestTime: 100,
          responseTime: 100,
          domProcessing: 200,
          totalLoadTime: 1000,
        },
        render: {
          domNodes: 800,
          domDepth: 10,
          stylesheets: 2,
          scripts: 3,
          images: 2,
          iframes: 0,
        },
        memory: {
          usedJSHeapSize: 50 * 1024 * 1024,
          totalJSHeapSize: 100 * 1024 * 1024,
          jsHeapSizeLimit: 200 * 1024 * 1024,
          usagePercentage: 25,
        },
        score: {
          overall: 95,
          metrics: {},
          grade: 'A',
          level: 'excellent',
        },
        budgets: [],
        issues: [],
        testDuration: 100,
      };

      savePerformanceTestResult(result);

      const loaded = loadPerformanceTestResults();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('test-1');
      expect(loaded[0].name).toBe('Test 1');
    });

    it('should limit stored results to 100', () => {
      // Create 105 test results
      for (let i = 0; i < 105; i++) {
        const result: PerformanceTestResult = {
          id: `test-${i}`,
          timestamp: new Date(),
          name: `Test ${i}`,
          url: 'https://example.com',
          network: {
            effectiveType: '4g',
            downlink: 10,
            rtt: 100,
            saveData: false,
          },
          device: {
            userAgent: 'test',
            screenWidth: 1920,
            screenHeight: 1080,
            pixelRatio: 1,
          },
          coreWebVitals: {
            lcp: 1000,
            fid: 50,
            cls: 0.05,
            fcp: 1000,
            tti: 2000,
            tbt: 100,
            si: 2000,
          },
          resources: {
            totalCount: 10,
            totalSize: 100000,
            byType: {},
            sizeByType: {},
            slowResources: [],
          },
          navigation: {
            dnsLookup: 50,
            tcpConnection: 50,
            tlsNegotiation: 50,
            requestTime: 100,
            responseTime: 100,
            domProcessing: 200,
            totalLoadTime: 1000,
          },
          render: {
            domNodes: 800,
            domDepth: 10,
            stylesheets: 2,
            scripts: 3,
            images: 2,
            iframes: 0,
          },
          memory: {
            usedJSHeapSize: 50 * 1024 * 1024,
            totalJSHeapSize: 100 * 1024 * 1024,
            jsHeapSizeLimit: 200 * 1024 * 1024,
            usagePercentage: 25,
          },
          score: {
            overall: 95,
            metrics: {},
            grade: 'A',
            level: 'excellent',
          },
          budgets: [],
          issues: [],
          testDuration: 100,
        };

        savePerformanceTestResult(result);
      }

      const loaded = loadPerformanceTestResults();
      expect(loaded).toHaveLength(100);
      // Should keep the last 100 (test-5 through test-104)
      expect(loaded[0].id).toBe('test-5');
      expect(loaded[99].id).toBe('test-104');
    });
  });

  describe('loadPerformanceTestResults', () => {
    it('should return empty array when no results exist', () => {
      const loaded = loadPerformanceTestResults();
      expect(loaded).toHaveLength(0);
    });

    it('should parse timestamps correctly', () => {
      const testDate = new Date('2024-01-15T12:30:00Z');
      const result: PerformanceTestResult = {
        id: 'test-1',
        timestamp: testDate,
        name: 'Test 1',
        url: 'https://example.com',
        network: {
          effectiveType: '4g',
          downlink: 10,
          rtt: 100,
          saveData: false,
        },
        device: {
          userAgent: 'test',
          screenWidth: 1920,
          screenHeight: 1080,
          pixelRatio: 1,
        },
        coreWebVitals: {
          lcp: 1000,
          fid: 50,
          cls: 0.05,
          fcp: 1000,
          tti: 2000,
          tbt: 100,
          si: 2000,
        },
        resources: {
          totalCount: 10,
          totalSize: 100000,
          byType: {},
          sizeByType: {},
          slowResources: [],
        },
        navigation: {
          dnsLookup: 50,
          tcpConnection: 50,
          tlsNegotiation: 50,
          requestTime: 100,
          responseTime: 100,
          domProcessing: 200,
          totalLoadTime: 1000,
        },
        render: {
          domNodes: 800,
          domDepth: 10,
          stylesheets: 2,
          scripts: 3,
          images: 2,
          iframes: 0,
        },
        memory: {
          usedJSHeapSize: 50 * 1024 * 1024,
          totalJSHeapSize: 100 * 1024 * 1024,
          jsHeapSizeLimit: 200 * 1024 * 1024,
          usagePercentage: 25,
        },
        score: {
          overall: 95,
          metrics: {},
          grade: 'A',
          level: 'excellent',
        },
        budgets: [],
        issues: [],
        testDuration: 100,
      };

      savePerformanceTestResult(result);
      const loaded = loadPerformanceTestResults();

      expect(loaded[0].timestamp).toEqual(testDate);
    });
  });

  describe('clearPerformanceTestResults', () => {
    it('should clear all stored results', () => {
      const result: PerformanceTestResult = {
        id: 'test-1',
        timestamp: new Date(),
        name: 'Test 1',
        url: 'https://example.com',
        network: {
          effectiveType: '4g',
          downlink: 10,
          rtt: 100,
          saveData: false,
        },
        device: {
          userAgent: 'test',
          screenWidth: 1920,
          screenHeight: 1080,
          pixelRatio: 1,
        },
        coreWebVitals: {
          lcp: 1000,
          fid: 50,
          cls: 0.05,
          fcp: 1000,
          tti: 2000,
          tbt: 100,
          si: 2000,
        },
        resources: {
          totalCount: 10,
          totalSize: 100000,
          byType: {},
          sizeByType: {},
          slowResources: [],
        },
        navigation: {
          dnsLookup: 50,
          tcpConnection: 50,
          tlsNegotiation: 50,
          requestTime: 100,
          responseTime: 100,
          domProcessing: 200,
          totalLoadTime: 1000,
        },
        render: {
          domNodes: 800,
          domDepth: 10,
          stylesheets: 2,
          scripts: 3,
          images: 2,
          iframes: 0,
        },
        memory: {
          usedJSHeapSize: 50 * 1024 * 1024,
          totalJSHeapSize: 100 * 1024 * 1024,
          jsHeapSizeLimit: 200 * 1024 * 1024,
          usagePercentage: 25,
        },
        score: {
          overall: 95,
          metrics: {},
          grade: 'A',
          level: 'excellent',
        },
        budgets: [],
        issues: [],
        testDuration: 100,
      };

      savePerformanceTestResult(result);
      expect(loadPerformanceTestResults()).toHaveLength(1);

      clearPerformanceTestResults();
      expect(loadPerformanceTestResults()).toHaveLength(0);
    });
  });

  describe('getPerformanceTestSummary', () => {
    it('should return zeros when no results exist', () => {
      const summary = getPerformanceTestSummary();

      expect(summary.totalTests).toBe(0);
      expect(summary.averageScore).toBe(0);
      expect(summary.averageLCP).toBe(0);
      expect(summary.averageFID).toBe(0);
      expect(summary.averageCLS).toBe(0);
      expect(summary.totalIssues).toBe(0);
      expect(summary.recentTests).toHaveLength(0);
    });

    it('should calculate summary statistics', () => {
      const result1: PerformanceTestResult = {
        id: 'test-1',
        timestamp: new Date(),
        name: 'Test 1',
        url: 'https://example.com',
        network: {
          effectiveType: '4g',
          downlink: 10,
          rtt: 100,
          saveData: false,
        },
        device: {
          userAgent: 'test',
          screenWidth: 1920,
          screenHeight: 1080,
          pixelRatio: 1,
        },
        coreWebVitals: {
          lcp: 2000,
          fid: 80,
          cls: 0.08,
          fcp: 1500,
          tti: 3000,
          tbt: 150,
          si: 2500,
        },
        resources: {
          totalCount: 10,
          totalSize: 100000,
          byType: {},
          sizeByType: {},
          slowResources: [],
        },
        navigation: {
          dnsLookup: 50,
          tcpConnection: 50,
          tlsNegotiation: 50,
          requestTime: 100,
          responseTime: 100,
          domProcessing: 200,
          totalLoadTime: 1000,
        },
        render: {
          domNodes: 800,
          domDepth: 10,
          stylesheets: 2,
          scripts: 3,
          images: 2,
          iframes: 0,
        },
        memory: {
          usedJSHeapSize: 50 * 1024 * 1024,
          totalJSHeapSize: 100 * 1024 * 1024,
          jsHeapSizeLimit: 200 * 1024 * 1024,
          usagePercentage: 25,
        },
        score: {
          overall: 90,
          metrics: {},
          grade: 'A',
          level: 'excellent',
        },
        budgets: [],
        issues: [
          {
            id: 'issue-1',
            category: 'loading',
            severity: 'minor',
            title: 'Test issue',
            description: 'Test',
            recommendation: 'Fix it',
            affectedResources: [],
            impact: 'low',
          },
        ],
        testDuration: 100,
      };

      const result2: PerformanceTestResult = {
        ...result1,
        id: 'test-2',
        name: 'Test 2',
        coreWebVitals: {
          lcp: 3000,
          fid: 120,
          cls: 0.12,
          fcp: 2000,
          tti: 4000,
          tbt: 250,
          si: 3500,
        },
        score: {
          overall: 70,
          metrics: {},
          grade: 'B',
          level: 'good',
        },
        issues: [],
      };

      savePerformanceTestResult(result1);
      savePerformanceTestResult(result2);

      const summary = getPerformanceTestSummary();

      expect(summary.totalTests).toBe(2);
      expect(summary.averageScore).toBe(80);
      expect(summary.averageLCP).toBe(2500);
      expect(summary.averageFID).toBe(100);
      expect(summary.averageCLS).toBe(0.1);
      expect(summary.totalIssues).toBe(1);
      expect(summary.recentTests).toHaveLength(2);
    });

    it('should return only last 10 tests in recentTests', () => {
      for (let i = 0; i < 15; i++) {
        const result: PerformanceTestResult = {
          id: `test-${i}`,
          timestamp: new Date(),
          name: `Test ${i}`,
          url: 'https://example.com',
          network: {
            effectiveType: '4g',
            downlink: 10,
            rtt: 100,
            saveData: false,
          },
          device: {
            userAgent: 'test',
            screenWidth: 1920,
            screenHeight: 1080,
            pixelRatio: 1,
          },
          coreWebVitals: {
            lcp: 2000,
            fid: 80,
            cls: 0.08,
            fcp: 1500,
            tti: 3000,
            tbt: 150,
            si: 2500,
          },
          resources: {
            totalCount: 10,
            totalSize: 100000,
            byType: {},
            sizeByType: {},
            slowResources: [],
          },
          navigation: {
            dnsLookup: 50,
            tcpConnection: 50,
            tlsNegotiation: 50,
            requestTime: 100,
            responseTime: 100,
            domProcessing: 200,
            totalLoadTime: 1000,
          },
          render: {
            domNodes: 800,
            domDepth: 10,
            stylesheets: 2,
            scripts: 3,
            images: 2,
            iframes: 0,
          },
          memory: {
            usedJSHeapSize: 50 * 1024 * 1024,
            totalJSHeapSize: 100 * 1024 * 1024,
            jsHeapSizeLimit: 200 * 1024 * 1024,
            usagePercentage: 25,
          },
          score: {
            overall: 90,
            metrics: {},
            grade: 'A',
            level: 'excellent',
          },
          budgets: [],
          issues: [],
          testDuration: 100,
        };

        savePerformanceTestResult(result);
      }

      const summary = getPerformanceTestSummary();
      expect(summary.recentTests).toHaveLength(10);
    });
  });
});
