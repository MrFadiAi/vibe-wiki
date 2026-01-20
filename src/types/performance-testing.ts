/**
 * Performance Testing Types
 *
 * Type definitions for the performance testing infrastructure.
 * Provides types for measuring and analyzing web performance metrics.
 */

/**
 * Core Web Vitals metrics
 * Based on Google's Core Web Vitals: LCP, FID, CLS
 */
export interface CoreWebVitals {
  /** Largest Contentful Paint - measures loading performance (target: < 2.5s) */
  lcp: number;
  /** First Input Delay - measures interactivity (target: < 100ms) */
  fid: number;
  /** Cumulative Layout Shift - measures visual stability (target: < 0.1) */
  cls: number;
  /** First Contentful Paint - time to first content render (target: < 1.8s) */
  fcp: number;
  /** Time to Interactive - time to full interactivity (target: < 3.8s) */
  tti: number;
  /** Total Blocking Time - sum of all long task durations (target: < 200ms) */
  tbt: number;
  /** Speed Index - visual speed of page load (target: < 3.4s) */
  si: number;
}

/**
 * Resource loading metrics
 */
export interface ResourceMetrics {
  /** Total number of resources loaded */
  totalCount: number;
  /** Total size of all resources in bytes */
  totalSize: number;
  /** Number of resources by type */
  byType: Record<string, number>;
  /** Size by resource type in bytes */
  sizeByType: Record<string, number>;
  /** Slow resources (> 1 second load time) */
  slowResources: SlowResource[];
}

/**
 * Individual slow resource entry
 */
export interface SlowResource {
  /** Resource name/URL */
  name: string;
  /** Resource type (script, stylesheet, image, etc.) */
  type: string;
  /** Load time in milliseconds */
  duration: number;
  /** Size in bytes */
  size: number;
}

/**
 * Navigation timing metrics
 */
export interface NavigationMetrics {
  /** DNS lookup time in milliseconds */
  dnsLookup: number;
  /** TCP connection time in milliseconds */
  tcpConnection: number;
  /** TLS negotiation time in milliseconds */
  tlsNegotiation: number;
  /** Request time (time to first byte) in milliseconds */
  requestTime: number;
  /** Response download time in milliseconds */
  responseTime: number;
  /** DOM processing time in milliseconds */
  domProcessing: number;
  /** Total page load time in milliseconds */
  totalLoadTime: number;
}

/**
 * Render metrics
 */
export interface RenderMetrics {
  /** Number of DOM nodes */
  domNodes: number;
  /** DOM depth (max nesting level) */
  domDepth: number;
  /** Number of stylesheets */
  stylesheets: number;
  /** Number of scripts */
  scripts: number;
  /** Number of images */
  images: number;
  /** Number of iframes */
  iframes: number;
}

/**
 * Memory metrics
 */
export interface MemoryMetrics {
  /** Used JS heap size in bytes */
  usedJSHeapSize: number;
  /** Total JS heap size allocated in bytes */
  totalJSHeapSize: number;
  /** JS heap size limit in bytes */
  jsHeapSizeLimit: number;
  /** Memory usage percentage */
  usagePercentage: number;
}

/**
 * Network information
 */
export interface NetworkInfo {
  /** Effective connection type (slow-2g, 2g, 3g, 4g) */
  effectiveType: string;
  /** Downlink speed in Mbps */
  downlink: number;
  /** Round-trip time in milliseconds */
  rtt: number;
  /** Save data mode enabled */
  saveData: boolean;
}

/**
 * Performance budget entry
 */
export interface PerformanceBudget {
  /** Budget category name */
  name: string;
  /** Budget type (size, count, time) */
  type: 'size' | 'count' | 'time';
  /** Resource type this applies to */
  resourceType: string;
  /** Maximum allowed value */
  budget: number;
  /** Current actual value */
  actual: number;
  /** Whether budget is within limits */
  passed: boolean;
  /** Over budget amount (if applicable) */
  over?: number;
}

/**
 * Performance score
 */
export interface PerformanceScore {
  /** Overall score (0-100) */
  overall: number;
  /** Individual metric scores */
  metrics: Record<string, number>;
  /** Performance grade (A-F) */
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  /** Assessment level */
  level: 'excellent' | 'good' | 'needs-improvement' | 'poor';
}

/**
 * Performance issue
 */
export interface PerformanceIssue {
  /** Issue identifier */
  id: string;
  /** Issue category */
  category: PerformanceIssueCategory;
  /** Issue severity */
  severity: 'critical' | 'major' | 'minor' | 'suggestion';
  /** Issue title */
  title: string;
  /** Issue description */
  description: string;
  /** How to fix */
  recommendation: string;
  /** URLs/resources affected */
  affectedResources: string[];
  /** Potential impact */
  impact: 'high' | 'medium' | 'low';
}

/**
 * Performance issue categories
 */
export type PerformanceIssueCategory =
  | 'loading'
  | 'interactivity'
  | 'visual-stability'
  | 'resources'
  | 'rendering'
  | 'memory'
  | 'network'
  | 'accessibility';

/**
 * Complete performance test results
 */
export interface PerformanceTestResult {
  /** Unique test identifier */
  id: string;
  /** Test timestamp */
  timestamp: Date;
  /** Test name/description */
  name: string;
  /** URL tested */
  url: string;
  /** Network condition during test */
  network: NetworkInfo;
  /** Device information */
  device: DeviceInfo;
  /** Core Web Vitals */
  coreWebVitals: CoreWebVitals;
  /** Resource metrics */
  resources: ResourceMetrics;
  /** Navigation metrics */
  navigation: NavigationMetrics;
  /** Render metrics */
  render: RenderMetrics;
  /** Memory metrics */
  memory: MemoryMetrics;
  /** Performance score */
  score: PerformanceScore;
  /** Performance budget results */
  budgets: PerformanceBudget[];
  /** Performance issues found */
  issues: PerformanceIssue[];
  /** Test duration in milliseconds */
  testDuration: number;
}

/**
 * Device information
 */
export interface DeviceInfo {
  /** User agent string */
  userAgent: string;
  /** Screen width */
  screenWidth: number;
  /** Screen height */
  screenHeight: number;
  /** Device pixel ratio */
  pixelRatio: number;
  /** CPU cores (if available) */
  cpuCores?: number;
  /** Device memory in GB (if available) */
  deviceMemory?: number;
}

/**
 * Performance test configuration
 */
export interface PerformanceTestConfig {
  /** Test name */
  name: string;
  /** URL to test */
  url: string;
  /** Whether to measure Core Web Vitals */
  measureCoreWebVitals: boolean;
  /** Whether to analyze resources */
  analyzeResources: boolean;
  /** Whether to check performance budgets */
  checkBudgets: boolean;
  /** Custom performance budgets */
  customBudgets?: PerformanceBudget[];
  /** Network throttling profile */
  networkProfile?: 'online' | 'offline' | 'slow-2g' | '2g' | '3g' | '4g';
  /** Whether to run in background (non-blocking) */
  runInBackground: boolean;
  /** Maximum test duration in milliseconds */
  maxDuration?: number;
}

/**
 * Performance metrics summary
 */
export interface PerformanceMetricsSummary {
  /** Total tests run */
  totalTests: number;
  /** Tests passing budgets */
  passingTests: number;
  /** Tests failing budgets */
  failingTests: number;
  /** Average performance score */
  averageScore: number;
  /** Average LCP time */
  averageLCP: number;
  /** Average FID time */
  averageFID: number;
  /** Average CLS score */
  averageCLS: number;
  /** Total issues found */
  totalIssues: number;
  /** Issues by severity */
  issuesBySeverity: Record<string, number>;
  /** Issues by category */
  issuesByCategory: Record<string, number>;
}

/**
 * Performance comparison result
 */
export interface PerformanceComparison {
  /** Baseline test results */
  baseline: PerformanceTestResult;
  /** Current test results */
  current: PerformanceTestResult;
  /** Metric differences */
  differences: Record<string, number>;
  /** Percentage changes */
  percentageChanges: Record<string, number>;
  /** Improvement assessment */
  assessment: 'improved' | 'degraded' | 'unchanged';
}

/**
 * Performance threshold
 */
export interface PerformanceThreshold {
  /** Metric name */
  metric: string;
  /** Warning threshold */
  warning: number;
  /** Critical threshold */
  critical: number;
  /** Direction (lower is better or higher is better) */
  direction: 'lower-is-better' | 'higher-is-better';
}

/**
 * Performance report
 */
export interface PerformanceReport {
  /** Report ID */
  id: string;
  /** Report generation date */
  generatedAt: Date;
  /** Test results included */
  results: PerformanceTestResult[];
  /** Summary metrics */
  summary: PerformanceMetricsSummary;
  /** Recommendations */
  recommendations: string[];
  /** Performance trends (if historical data available) */
  trends?: PerformanceComparison[];
}
