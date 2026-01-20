/**
 * Performance Testing Utilities
 *
 * Comprehensive utilities for measuring and analyzing web performance metrics.
 * Supports Core Web Vitals, resource analysis, and performance budgeting.
 */

import type {
  CoreWebVitals,
  ResourceMetrics,
  NavigationMetrics,
  RenderMetrics,
  MemoryMetrics,
  NetworkInfo,
  DeviceInfo,
  PerformanceIssue,
  PerformanceScore,
  PerformanceBudget,
  PerformanceTestResult,
  PerformanceTestConfig,
  PerformanceThreshold,
  SlowResource,
  PerformanceIssueCategory,
} from '../types/performance-testing';

/**
 * Default performance thresholds based on Web Vitals baselines
 */
export const DEFAULT_THRESHOLDS: Record<string, PerformanceThreshold> = {
  lcp: {
    metric: 'lcp',
    warning: 2500, // 2.5s
    critical: 4000, // 4s
    direction: 'lower-is-better',
  },
  fid: {
    metric: 'fid',
    warning: 100, // 100ms
    critical: 300, // 300ms
    direction: 'lower-is-better',
  },
  cls: {
    metric: 'cls',
    warning: 0.1,
    critical: 0.25,
    direction: 'lower-is-better',
  },
  fcp: {
    metric: 'fcp',
    warning: 1800, // 1.8s
    critical: 3000, // 3s
    direction: 'lower-is-better',
  },
  tti: {
    metric: 'tti',
    warning: 3800, // 3.8s
    critical: 7300, // 7.3s
    direction: 'lower-is-better',
  },
  tbt: {
    metric: 'tbt',
    warning: 200, // 200ms
    critical: 600, // 600ms
    direction: 'lower-is-better',
  },
  si: {
    metric: 'si',
    warning: 3400, // 3.4s
    critical: 5800, // 5.8s
    direction: 'lower-is-better',
  },
};

/**
 * Default performance budgets
 */
export const DEFAULT_BUDGETS: Omit<PerformanceBudget, 'actual' | 'passed' | 'over'>[] = [
  {
    name: 'Total JavaScript Size',
    type: 'size',
    resourceType: 'script',
    budget: 200 * 1024, // 200 KB
  },
  {
    name: 'Total CSS Size',
    type: 'size',
    resourceType: 'stylesheet',
    budget: 50 * 1024, // 50 KB
  },
  {
    name: 'Total Image Size',
    type: 'size',
    resourceType: 'image',
    budget: 500 * 1024, // 500 KB
  },
  {
    name: 'Script Count',
    type: 'count',
    resourceType: 'script',
    budget: 10,
  },
  {
    name: 'Stylesheet Count',
    type: 'count',
    resourceType: 'stylesheet',
    budget: 3,
  },
];

/**
 * Generate a unique test ID
 */
export function generateTestId(): string {
  return `perf-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get current network information
 */
export function getNetworkInfo(): NetworkInfo {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  if (connection) {
    return {
      effectiveType: connection.effectiveType || '4g',
      downlink: connection.downlink || 10,
      rtt: connection.rtt || 100,
      saveData: connection.saveData || false,
    };
  }

  return {
    effectiveType: '4g',
    downlink: 10,
    rtt: 100,
    saveData: false,
  };
}

/**
 * Get device information
 */
export function getDeviceInfo(): DeviceInfo {
  return {
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    pixelRatio: window.devicePixelRatio || 1,
    cpuCores: (navigator as any).hardwareConcurrency || undefined,
    deviceMemory: (navigator as any).deviceMemory || undefined,
  };
}

/**
 * Measure Core Web Vitals
 * Uses PerformanceObserver API where available
 */
export async function measureCoreWebVitals(): Promise<CoreWebVitals> {
  return new Promise((resolve) => {
    const vitals: Partial<CoreWebVitals> = {
      lcp: 0,
      fid: 0,
      cls: 0,
      fcp: 0,
      tti: 0,
      tbt: 0,
      si: 0,
    };

    let completed = 0;
    const totalMetrics = 7;

    const checkComplete = () => {
      completed++;
      if (completed >= totalMetrics) {
        resolve(vitals as CoreWebVitals);
      }
    };

    // Helper to get metric from PerformanceObserver
    const observeMetric = (type: string, callback: (entry: any) => void) => {
      try {
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(callback);
          });
          observer.observe({ type, buffered: true });
        }
      } catch (e) {
        // Silently fail for unsupported metrics
        checkComplete();
      }
    };

    // Largest Contentful Paint
    try {
      observeMetric('largest-contentful-paint', (entry: any) => {
        vitals.lcp = entry.renderTime || entry.loadTime;
        checkComplete();
      });
    } catch (e) {
      checkComplete();
    }

    // First Input Delay
    try {
      observeMetric('first-input', (entry: any) => {
        vitals.fid = entry.processingStart - entry.startTime;
        checkComplete();
      });
    } catch (e) {
      checkComplete();
    }

    // Cumulative Layout Shift
    try {
      let clsValue = 0;
      observeMetric('layout-shift', (entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          vitals.cls = clsValue;
        }
      });
      setTimeout(() => checkComplete(), 5000); // CLS needs time to accumulate
    } catch (e) {
      checkComplete();
    }

    // Get other metrics from Performance API
    if ('performance' in window) {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      if (perfData) {
        vitals.fcp = perfData.loadEventEnd - perfData.fetchStart;
        vitals.si = vitals.fcp; // Approximation

        // Calculate TBT (Total Blocking Time)
        const longTasks = performance.getEntriesByType('longtask');
        let tbt = 0;
        longTasks.forEach((task: any) => {
          tbt += task.duration - 50;
        });
        vitals.tbt = tbt;

        // Approximate TTI
        vitals.tti = perfData.domInteractive - perfData.fetchStart + vitals.tbt;
      }
    }

    // Complete any remaining metrics
    setTimeout(() => {
      resolve(vitals as CoreWebVitals);
    }, 6000);
  });
}

/**
 * Analyze resource loading
 */
export function analyzeResources(): ResourceMetrics {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  const byType: Record<string, number> = {};
  const sizeByType: Record<string, number> = {};
  const slowResources: SlowResource[] = [];

  let totalSize = 0;

  resources.forEach((resource) => {
    const type = getResourceType(resource.initiatorType);
    byType[type] = (byType[type] || 0) + 1;

    const size = resource.transferSize || 0;
    sizeByType[type] = (sizeByType[type] || 0) + size;
    totalSize += size;

    const duration = resource.responseEnd - resource.startTime;
    if (duration > 1000) {
      slowResources.push({
        name: resource.name,
        type,
        duration,
        size,
      });
    }
  });

  return {
    totalCount: resources.length,
    totalSize,
    byType,
    sizeByType,
    slowResources,
  };
}

/**
 * Get resource type from initiator type
 */
function getResourceType(initiatorType: string): string {
  const typeMap: Record<string, string> = {
    script: 'script',
    link: 'stylesheet',
    img: 'image',
    css: 'stylesheet',
    fetch: 'fetch',
    xmlhttprequest: 'xhr',
    iframe: 'subdocument',
  };

  return typeMap[initiatorType] || initiatorType;
}

/**
 * Measure navigation timing
 */
export function measureNavigationTiming(): NavigationMetrics {
  const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

  if (!perfData) {
    return {
      dnsLookup: 0,
      tcpConnection: 0,
      tlsNegotiation: 0,
      requestTime: 0,
      responseTime: 0,
      domProcessing: 0,
      totalLoadTime: 0,
    };
  }

  return {
    dnsLookup: perfData.domainLookupEnd - perfData.domainLookupStart,
    tcpConnection: perfData.connectEnd - perfData.connectStart,
    tlsNegotiation: perfData.secureConnectionStart > 0
      ? perfData.connectEnd - perfData.secureConnectionStart
      : 0,
    requestTime: perfData.responseStart - perfData.requestStart,
    responseTime: perfData.responseEnd - perfData.responseStart,
    domProcessing: perfData.domComplete - perfData.domLoading,
    totalLoadTime: perfData.loadEventEnd - perfData.fetchStart,
  };
}

/**
 * Measure render metrics
 */
export function measureRenderMetrics(): RenderMetrics {
  const domNodes = document.querySelectorAll('*').length;

  let domDepth = 0;
  const measureDepth = (element: Element, depth: number) => {
    if (depth > domDepth) domDepth = depth;
    for (let i = 0; i < element.children.length; i++) {
      measureDepth(element.children[i], depth + 1);
    }
  };
  measureDepth(document.body, 0);

  return {
    domNodes,
    domDepth,
    stylesheets: document.styleSheets.length,
    scripts: document.scripts.length,
    images: document.images.length,
    iframes: document.querySelectorAll('iframe').length,
  };
}

/**
 * Measure memory usage
 */
export function measureMemory(): MemoryMetrics {
  const memory = (performance as any).memory;

  if (memory) {
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };
  }

  return {
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0,
    usagePercentage: 0,
  };
}

/**
 * Calculate performance score
 */
export function calculatePerformanceScore(
  coreWebVitals: CoreWebVitals,
  thresholds: Record<string, PerformanceThreshold> = DEFAULT_THRESHOLDS
): PerformanceScore {
  const metrics: Record<string, number> = {};
  let totalScore = 0;
  let metricCount = 0;

  Object.entries(coreWebVitals).forEach(([metric, value]) => {
    const threshold = thresholds[metric];
    if (threshold) {
      let score = 100;

      if (threshold.direction === 'lower-is-better') {
        if (value >= threshold.critical) {
          score = 0;
        } else if (value >= threshold.warning) {
          // Linear interpolation between warning and critical
          score = 100 - ((value - threshold.warning) / (threshold.critical - threshold.warning)) * 100;
        }
      } else {
        if (value <= threshold.critical) {
          score = 0;
        } else if (value <= threshold.warning) {
          score = ((value - threshold.critical) / (threshold.warning - threshold.critical)) * 100;
        }
      }

      metrics[metric] = Math.max(0, Math.min(100, score));
      totalScore += metrics[metric];
      metricCount++;
    }
  });

  const overall = metricCount > 0 ? totalScore / metricCount : 0;

  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  let level: 'excellent' | 'good' | 'needs-improvement' | 'poor';

  if (overall >= 90) {
    grade = 'A';
    level = 'excellent';
  } else if (overall >= 75) {
    grade = 'B';
    level = 'good';
  } else if (overall >= 60) {
    grade = 'C';
    level = 'needs-improvement';
  } else if (overall >= 40) {
    grade = 'D';
    level = 'needs-improvement';
  } else {
    grade = 'F';
    level = 'poor';
  }

  return {
    overall,
    metrics,
    grade,
    level,
  };
}

/**
 * Check performance budgets
 */
export function checkPerformanceBudgets(
  resources: ResourceMetrics,
  render: RenderMetrics,
  customBudgets?: Omit<PerformanceBudget, 'actual' | 'passed' | 'over'>[]
): PerformanceBudget[] {
  const budgets = customBudgets || DEFAULT_BUDGETS;

  return budgets.map((budget) => {
    let actual: number;

    if (budget.resourceType === 'script') {
      if (budget.type === 'size') {
        actual = resources.sizeByType.script || 0;
      } else {
        actual = resources.byType.script || 0;
      }
    } else if (budget.resourceType === 'stylesheet') {
      if (budget.type === 'size') {
        actual = resources.sizeByType.stylesheet || 0;
      } else {
        actual = resources.byType.stylesheet || 0;
      }
    } else if (budget.resourceType === 'image') {
      if (budget.type === 'size') {
        actual = resources.sizeByType.image || 0;
      } else {
        actual = resources.byType.image || 0;
      }
    } else {
      actual = 0;
    }

    const passed = actual <= budget.budget;
    const over = passed ? undefined : actual - budget.budget;

    return {
      ...budget,
      actual,
      passed,
      over,
    };
  });
}

/**
 * Identify performance issues
 */
export function identifyPerformanceIssues(
  coreWebVitals: CoreWebVitals,
  resources: ResourceMetrics,
  navigation: NavigationMetrics,
  render: RenderMetrics,
  thresholds: Record<string, PerformanceThreshold> = DEFAULT_THRESHOLDS
): PerformanceIssue[] {
  const issues: PerformanceIssue[] = [];

  // Check LCP
  if (coreWebVitals.lcp > thresholds.lcp.critical) {
    issues.push({
      id: `lcp-critical-${Date.now()}`,
      category: 'loading',
      severity: 'critical',
      title: 'Largest Contentful Paint is too slow',
      description: `LCP is ${(coreWebVitals.lcp / 1000).toFixed(2)}s, which is above the critical threshold of ${(thresholds.lcp.critical / 1000).toFixed(2)}s`,
      recommendation: 'Optimize largest content element: reduce image sizes, preload critical resources, remove render-blocking resources',
      affectedResources: [],
      impact: 'high',
    });
  }

  // Check FID
  if (coreWebVitals.fid > thresholds.fid.critical) {
    issues.push({
      id: `fid-critical-${Date.now()}`,
      category: 'interactivity',
      severity: 'critical',
      title: 'First Input Delay is too high',
      description: `FID is ${coreWebVitals.fid.toFixed(0)}ms, which is above the critical threshold of ${thresholds.fid.critical}ms`,
      recommendation: 'Reduce JavaScript execution time, break up long tasks, use web workers for heavy computation',
      affectedResources: [],
      impact: 'high',
    });
  }

  // Check CLS
  if (coreWebVitals.cls > thresholds.cls.critical) {
    issues.push({
      id: `cls-critical-${Date.now()}`,
      category: 'visual-stability',
      severity: 'critical',
      title: 'Cumulative Layout Shift is too high',
      description: `CLS is ${coreWebVitals.cls.toFixed(3)}, which is above the critical threshold of ${thresholds.cls.critical}`,
      recommendation: 'Reserve space for images and ads, avoid inserting content above existing content, use CSS transforms for animations',
      affectedResources: [],
      impact: 'high',
    });
  }

  // Check slow resources
  if (resources.slowResources.length > 0) {
    issues.push({
      id: `slow-resources-${Date.now()}`,
      category: 'resources',
      severity: 'major',
      title: `${resources.slowResources.length} slow resources detected`,
      description: `Found ${resources.slowResources.length} resources taking more than 1 second to load`,
      recommendation: 'Optimize and compress resources, use CDN, implement lazy loading, consider splitting large files',
      affectedResources: resources.slowResources.slice(0, 5).map((r) => r.name),
      impact: 'medium',
    });
  }

  // Check large DOM
  if (render.domNodes > 1500) {
    issues.push({
      id: `large-dom-${Date.now()}`,
      category: 'rendering',
      severity: 'minor',
      title: 'Large DOM size',
      description: `Page has ${render.domNodes} DOM nodes, which is above the recommended 1500`,
      recommendation: 'Reduce DOM complexity, use virtualization for long lists, avoid unnecessary nesting',
      affectedResources: [],
      impact: 'low',
    });
  }

  // Check high memory usage
  const memory = measureMemory();
  if (memory.usagePercentage > 80) {
    issues.push({
      id: `high-memory-${Date.now()}`,
      category: 'memory',
      severity: 'major',
      title: 'High memory usage',
      description: `Memory usage is at ${memory.usagePercentage.toFixed(1)}%`,
      recommendation: 'Check for memory leaks, clean up event listeners, use object pooling for frequently created objects',
      affectedResources: [],
      impact: 'medium',
    });
  }

  return issues;
}

/**
 * Run complete performance test
 */
export async function runPerformanceTest(
  config: PerformanceTestConfig
): Promise<PerformanceTestResult> {
  const startTime = performance.now();

  const [coreWebVitals, navigation] = await Promise.all([
    measureCoreWebVitals(),
    Promise.resolve(measureNavigationTiming()),
  ]);

  const resources = analyzeResources();
  const render = measureRenderMetrics();
  const memory = measureMemory();
  const network = getNetworkInfo();
  const device = getDeviceInfo();

  const score = calculatePerformanceScore(coreWebVitals);
  const budgets = checkPerformanceBudgets(resources, render, config.customBudgets);
  const issues = identifyPerformanceIssues(coreWebVitals, resources, navigation, render);

  const testDuration = performance.now() - startTime;

  return {
    id: generateTestId(),
    timestamp: new Date(),
    name: config.name,
    url: config.url,
    network,
    device,
    coreWebVitals,
    resources,
    navigation,
    render,
    memory,
    score,
    budgets,
    issues,
    testDuration,
  };
}

/**
 * Save performance test result to localStorage
 */
export function savePerformanceTestResult(result: PerformanceTestResult): void {
  const key = 'vibe-wiki-performance-tests';
  const existingResults = loadPerformanceTestResults();
  existingResults.push(result);

  // Keep only the last 100 results
  const limitedResults = existingResults.slice(-100);

  localStorage.setItem(key, JSON.stringify(limitedResults));
}

/**
 * Load all performance test results from localStorage
 */
export function loadPerformanceTestResults(): PerformanceTestResult[] {
  const key = 'vibe-wiki-performance-tests';
  const data = localStorage.getItem(key);

  if (!data) {
    return [];
  }

  try {
    const parsed = JSON.parse(data);
    return parsed.map((result: any) => ({
      ...result,
      timestamp: new Date(result.timestamp),
    }));
  } catch (e) {
    console.error('Failed to parse performance test results:', e);
    return [];
  }
}

/**
 * Clear all performance test results
 */
export function clearPerformanceTestResults(): void {
  localStorage.removeItem('vibe-wiki-performance-tests');
}

/**
 * Get performance test summary
 */
export function getPerformanceTestSummary(): {
  totalTests: number;
  averageScore: number;
  averageLCP: number;
  averageFID: number;
  averageCLS: number;
  totalIssues: number;
  recentTests: PerformanceTestResult[];
} {
  const results = loadPerformanceTestResults();

  if (results.length === 0) {
    return {
      totalTests: 0,
      averageScore: 0,
      averageLCP: 0,
      averageFID: 0,
      averageCLS: 0,
      totalIssues: 0,
      recentTests: [],
    };
  }

  const totalScore = results.reduce((sum, r) => sum + r.score.overall, 0);
  const totalLCP = results.reduce((sum, r) => sum + r.coreWebVitals.lcp, 0);
  const totalFID = results.reduce((sum, r) => sum + r.coreWebVitals.fid, 0);
  const totalCLS = results.reduce((sum, r) => sum + r.coreWebVitals.cls, 0);
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);

  return {
    totalTests: results.length,
    averageScore: totalScore / results.length,
    averageLCP: totalLCP / results.length,
    averageFID: totalFID / results.length,
    averageCLS: totalCLS / results.length,
    totalIssues,
    recentTests: results.slice(-10),
  };
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 2)} ${sizes[i]}`;
}

/**
 * Format milliseconds to human-readable time
 */
export function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${ms.toFixed(0)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}
