/**
 * Performance Dashboard Component
 *
 * Displays performance test results, metrics, and analysis.
 * Provides visual feedback on Core Web Vitals and performance budgets.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  runPerformanceTest,
  loadPerformanceTestResults,
  getPerformanceTestSummary,
  clearPerformanceTestResults,
  savePerformanceTestResult,
  formatBytes,
  formatTime,
} from '../../lib/performance-testing-utils';
import type { PerformanceTestResult } from '../../types/performance-testing';

interface PerformanceDashboardProps {
  /**
   * Whether the dashboard is visible
   */
  isVisible?: boolean;
  /**
   * Optional custom test name
   */
  testName?: string;
}

/**
 * Color mapping for performance grades
 */
const gradeColors: Record<string, string> = {
  A: 'bg-green-100 text-green-800 border-green-300',
  B: 'bg-blue-100 text-blue-800 border-blue-300',
  C: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  D: 'bg-orange-100 text-orange-800 border-orange-300',
  F: 'bg-red-100 text-red-800 border-red-300',
};

/**
 * Severity color mapping
 */
const severityColors: Record<string, string> = {
  critical: 'text-red-600 bg-red-50 border-red-200',
  major: 'text-orange-600 bg-orange-50 border-orange-200',
  minor: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  suggestion: 'text-blue-600 bg-blue-50 border-blue-200',
};

/**
 * Performance score bar component
 */
function ScoreBar({ score, metric, threshold }: { score: number; metric: string; threshold?: { warning: number; critical: number } }) {
  const getColor = () => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-sm font-medium text-gray-700">{metric}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-300 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-12 text-right text-sm font-bold text-gray-900">{score.toFixed(0)}</span>
    </div>
  );
}

/**
 * Metric card component
 */
function MetricCard({ label, value, unit, status }: { label: string; value: number; unit: string; status: 'good' | 'warning' | 'critical' }) {
  const statusColors = {
    good: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    critical: 'border-red-200 bg-red-50',
  };

  return (
    <div className={`p-3 rounded-lg border ${statusColors[status]}`}>
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className="text-lg font-bold text-gray-900">
        {unit === 'ms' || unit === 's' ? formatTime(value) : value.toFixed(unit === 'score' ? 0 : 2)}
        {unit === 'score' ? '' : ` ${unit}`}
      </div>
    </div>
  );
}

/**
 * Performance Dashboard Component
 */
export function PerformanceDashboard({ isVisible = true, testName = 'Performance Test' }: PerformanceDashboardProps) {
  const [currentTest, setCurrentTest] = useState<PerformanceTestResult | null>(null);
  const [summary, setSummary] = useState(getPerformanceTestSummary());
  const [history, setHistory] = useState<PerformanceTestResult[]>(loadPerformanceTestResults());
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'budgets' | 'issues' | 'history'>('overview');

  // Refresh data when tab changes to history
  useEffect(() => {
    if (activeTab === 'history') {
      setHistory(loadPerformanceTestResults());
      setSummary(getPerformanceTestSummary());
    }
  }, [activeTab]);

  /**
   * Run a new performance test
   */
  const handleRunTest = async () => {
    setIsRunning(true);
    try {
      const result = await runPerformanceTest({
        name: testName,
        url: window.location.href,
        measureCoreWebVitals: true,
        analyzeResources: true,
        checkBudgets: true,
        runInBackground: false,
      });

      setCurrentTest(result);
      savePerformanceTestResult(result);
      setHistory(loadPerformanceTestResults());
      setSummary(getPerformanceTestSummary());
    } catch (error) {
      console.error('Performance test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * Clear all test history
   */
  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all test history?')) {
      clearPerformanceTestResults();
      setHistory([]);
      setSummary(getPerformanceTestSummary());
      setCurrentTest(null);
      setSelectedTestId(null);
    }
  };

  /**
   * Get status for a metric value
   */
  const getMetricStatus = (value: number, warning: number, critical: number): 'good' | 'warning' | 'critical' => {
    if (value <= warning) return 'good';
    if (value <= critical) return 'warning';
    return 'critical';
  };

  /**
   * Get displayed result (either selected or most recent)
   */
  const displayedResult = selectedTestId
    ? history.find((r) => r.id === selectedTestId) || currentTest
    : currentTest || history[history.length - 1] || null;

  if (!isVisible) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">لوحة قياس الأداء</h1>
            <p className="text-sm text-gray-600 mt-1">Performance Dashboard</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRunTest}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? 'جاري الاختبار...' : 'تشغيل اختبار'}
            </button>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                مسح السجل
              </button>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        {summary.totalTests > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{summary.totalTests}</div>
              <div className="text-xs text-gray-600">اختبارات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.averageScore.toFixed(0)}</div>
              <div className="text-xs text-gray-600">متوسط الدرجة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatTime(summary.averageLCP)}</div>
              <div className="text-xs text-gray-600">متوسط LCP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatTime(summary.averageFID)}</div>
              <div className="text-xs text-gray-600">متوسط FID</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{summary.averageCLS.toFixed(3)}</div>
              <div className="text-xs text-gray-600">متوسط CLS</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex gap-1 px-4">
            {[
              { key: 'overview', label: 'نظرة عامة' },
              { key: 'metrics', label: 'المقاييس' },
              { key: 'budgets', label: 'الميزانيات' },
              { key: 'issues', label: 'المشاكل' },
              { key: 'history', label: 'السجل' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {displayedResult && (
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {/* Overall Score */}
              <div className="text-center mb-8">
                <div
                  className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ${gradeColors[displayedResult.score.grade]}`}
                >
                  <div>
                    <div className="text-4xl font-bold">{displayedResult.score.overall.toFixed(0)}</div>
                    <div className="text-sm font-medium">الدرجة</div>
                  </div>
                </div>
                <div className="mt-2 text-lg font-semibold">{displayedResult.score.grade} - {displayedResult.score.level}</div>
              </div>

              {/* Core Web Vitals */}
              <h3 className="text-lg font-bold text-gray-900 mb-4">المؤشرات الأساسية للأداء</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <MetricCard
                  label="LCP - أكبر محتوى مرئي"
                  value={displayedResult.coreWebVitals.lcp}
                  unit="ms"
                  status={getMetricStatus(displayedResult.coreWebVitals.lcp, 2500, 4000)}
                />
                <MetricCard
                  label="FID - تأخير الإدخال الأول"
                  value={displayedResult.coreWebVitals.fid}
                  unit="ms"
                  status={getMetricStatus(displayedResult.coreWebVitals.fid, 100, 300)}
                />
                <MetricCard
                  label="CLS - تغيير التخطيط التراكمي"
                  value={displayedResult.coreWebVitals.cls}
                  unit="score"
                  status={getMetricStatus(displayedResult.coreWebVitals.cls, 0.1, 0.25)}
                />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">الموارد</div>
                  <div className="text-xl font-bold">{displayedResult.resources.totalCount}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">الحجم الكلي</div>
                  <div className="text-xl font-bold">{formatBytes(displayedResult.resources.totalSize)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">عقد DOM</div>
                  <div className="text-xl font-bold">{displayedResult.render.domNodes}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">وقت الاختبار</div>
                  <div className="text-xl font-bold">{formatTime(displayedResult.testDuration)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Metrics Tab */}
          {activeTab === 'metrics' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">تفاصيل المقاييس</h3>

              {/* Performance Scores */}
              <div className="mb-8">
                <h4 className="text-md font-semibold text-gray-800 mb-3">درجات الأداء</h4>
                <div className="space-y-3">
                  {Object.entries(displayedResult.score.metrics).map(([metric, score]) => (
                    <ScoreBar key={metric} score={score} metric={metric.toUpperCase()} />
                  ))}
                </div>
              </div>

              {/* All Core Web Vitals */}
              <div className="mb-8">
                <h4 className="text-md font-semibold text-gray-800 mb-3">المؤشرات الأساسية للأداء</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard
                    label="LCP"
                    value={displayedResult.coreWebVitals.lcp}
                    unit="ms"
                    status={getMetricStatus(displayedResult.coreWebVitals.lcp, 2500, 4000)}
                  />
                  <MetricCard
                    label="FID"
                    value={displayedResult.coreWebVitals.fid}
                    unit="ms"
                    status={getMetricStatus(displayedResult.coreWebVitals.fid, 100, 300)}
                  />
                  <MetricCard
                    label="CLS"
                    value={displayedResult.coreWebVitals.cls}
                    unit="score"
                    status={getMetricStatus(displayedResult.coreWebVitals.cls, 0.1, 0.25)}
                  />
                  <MetricCard
                    label="FCP"
                    value={displayedResult.coreWebVitals.fcp}
                    unit="ms"
                    status={getMetricStatus(displayedResult.coreWebVitals.fcp, 1800, 3000)}
                  />
                  <MetricCard
                    label="TTI"
                    value={displayedResult.coreWebVitals.tti}
                    unit="ms"
                    status={getMetricStatus(displayedResult.coreWebVitals.tti, 3800, 7300)}
                  />
                  <MetricCard
                    label="TBT"
                    value={displayedResult.coreWebVitals.tbt}
                    unit="ms"
                    status={getMetricStatus(displayedResult.coreWebVitals.tbt, 200, 600)}
                  />
                  <MetricCard
                    label="SI"
                    value={displayedResult.coreWebVitals.si}
                    unit="ms"
                    status={getMetricStatus(displayedResult.coreWebVitals.si, 3400, 5800)}
                  />
                </div>
              </div>

              {/* Navigation Timing */}
              <div className="mb-8">
                <h4 className="text-md font-semibold text-gray-800 mb-3">توقيت التنقل</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">DNS</div>
                    <div className="font-bold">{formatTime(displayedResult.navigation.dnsLookup)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">TCP</div>
                    <div className="font-bold">{formatTime(displayedResult.navigation.tcpConnection)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">TLS</div>
                    <div className="font-bold">{formatTime(displayedResult.navigation.tlsNegotiation)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">طلب</div>
                    <div className="font-bold">{formatTime(displayedResult.navigation.requestTime)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">استجابة</div>
                    <div className="font-bold">{formatTime(displayedResult.navigation.responseTime)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">معالجة DOM</div>
                    <div className="font-bold">{formatTime(displayedResult.navigation.domProcessing)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">وقت التحميل الكلي</div>
                    <div className="font-bold">{formatTime(displayedResult.navigation.totalLoadTime)}</div>
                  </div>
                </div>
              </div>

              {/* Render Metrics */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-3">مقاييس العرض</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">عقد DOM</div>
                    <div className="font-bold">{displayedResult.render.domNodes}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">عمق DOM</div>
                    <div className="font-bold">{displayedResult.render.domDepth}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">أوراق الأنماط</div>
                    <div className="font-bold">{displayedResult.render.stylesheets}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">النصوص البرمجية</div>
                    <div className="font-bold">{displayedResult.render.scripts}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">الصور</div>
                    <div className="font-bold">{displayedResult.render.images}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">إطارات iframe</div>
                    <div className="font-bold">{displayedResult.render.iframes}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Budgets Tab */}
          {activeTab === 'budgets' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">نتائج ميزانية الأداء</h3>
              <div className="space-y-4">
                {displayedResult.budgets.map((budget, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      budget.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-900">{budget.name}</div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          budget.passed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {budget.passed ? '✓ نجح' : '✗ فشل'}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">النوع:</span>
                        <span className="ml-2 font-medium">{budget.resourceType}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">الميزانية:</span>
                        <span className="ml-2 font-medium">
                          {budget.type === 'size'
                            ? formatBytes(budget.budget)
                            : budget.budget}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">الفعلي:</span>
                        <span className="ml-2 font-medium">
                          {budget.type === 'size'
                            ? formatBytes(budget.actual)
                            : budget.actual}
                        </span>
                      </div>
                      {!budget.passed && budget.over && (
                        <div className="text-red-600 font-medium">
                          +{budget.type === 'size' ? formatBytes(budget.over) : budget.over}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Issues Tab */}
          {activeTab === 'issues' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                المشاكل المكتشفة ({displayedResult.issues.length})
              </h3>
              {displayedResult.issues.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-2">✓</div>
                  <div>لم يتم العثور على مشاكل!</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedResult.issues.map((issue) => (
                    <div
                      key={issue.id}
                      className={`p-4 rounded-lg border-2 ${severityColors[issue.severity]}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-bold text-gray-900">{issue.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{issue.description}</div>
                        </div>
                        <div className="flex gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium border ${severityColors[issue.severity]}`}
                          >
                            {issue.severity}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs border border-gray-300">
                            {issue.category}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-white bg-opacity-50 rounded-lg">
                        <div className="text-xs font-semibold text-gray-700 mb-1">التوصية:</div>
                        <div className="text-sm">{issue.recommendation}</div>
                      </div>
                      {issue.affectedResources.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-600 mb-1">الموارد المتأثرة:</div>
                          <div className="flex flex-wrap gap-1">
                            {issue.affectedResources.slice(0, 3).map((resource, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-white bg-opacity-50 rounded text-xs border border-gray-200"
                              >
                                {resource.length > 50 ? resource.substring(0, 50) + '...' : resource}
                              </span>
                            ))}
                            {issue.affectedResources.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{issue.affectedResources.length - 3} أكثر
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">سجل الاختبارات</h3>
              {history.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  لا يوجد سجل اختبارات بعد
                </div>
              ) : (
                <div className="space-y-3">
                  {history.slice().reverse().map((result) => (
                    <div
                      key={result.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedTestId === result.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedTestId(result.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">{result.name}</div>
                          <div className="text-xs text-gray-600">
                            {new Date(result.timestamp).toLocaleString('ar-EG')}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${gradeColors[result.score.grade]}`}
                          >
                            {result.score.overall.toFixed(0)} - {result.score.grade}
                          </div>
                          <div className="text-sm text-gray-600">
                            {result.issues.length} مشاكل
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* No results message */}
      {!displayedResult && summary.totalTests === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">ابدأ اختبار الأداء</h3>
          <p className="text-gray-600 mb-6">
            اضغط على زر "تشغيل اختبار" لبدء قياس أداء الموقع
          </p>
        </div>
      )}
    </div>
  );
}
