/**
 * User Testing Dashboard Component
 * Displays testing session summaries, issues, and recommendations
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  CheckCircle,
  AlertTriangle,
  Star,
  TrendingUp,
  Download,
  RefreshCw,
  Bug,
  Target,
  Clock,
  ThumbsUp,
  MessageSquare,
  Filter,
} from 'lucide-react';
import {
  getTestingSessionSummary,
  exportTestingData,
  getIssuesBySeverity,
  getIssuesByCategory,
  clearTestingData,
  getTasksNeedingImprovement,
} from '@/lib/user-testing-utils';
import type { TestingSessionSummary, TestingIssue, IssueSeverity, IssueCategory } from '@/types/user-testing';

const SEVERITY_COLORS: Record<IssueSeverity, string> = {
  critical: '#ef4444',
  major: '#f97316',
  minor: '#eab308',
  cosmetic: '#22c55e',
};

const CATEGORY_COLORS: Record<IssueCategory, string> = {
  navigation: '#00d9ff',
  content_clarity: '#a855f7',
  technical_error: '#ef4444',
  accessibility: '#10b981',
  performance: '#f59e0b',
  ui_ux: '#ec4899',
  language_translation: '#3b82f6',
  code_example: '#8b5cf6',
  broken_link: '#ef4444',
  other: '#6b7280',
};

interface UserTestingDashboardProps {
  className?: string;
}

export function UserTestingDashboard({ className }: UserTestingDashboardProps) {
  const [summary, setSummary] = useState<TestingSessionSummary | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<IssueSeverity | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'all'>('all');
  const [filteredIssues, setFilteredIssues] = useState<TestingIssue[]>([]);
  const [tasksNeedingImprovement, setTasksNeedingImprovement] = useState<any[]>([]);

  const loadDashboardData = () => {
    const sessionSummary = getTestingSessionSummary();
    setSummary(sessionSummary);

    // Load filtered issues
    let issues: TestingIssue[] = [];
    if (selectedSeverity === 'all') {
      if (selectedCategory === 'all') {
        issues = sessionSummary.topIssues;
      } else {
        issues = getIssuesByCategory(selectedCategory);
      }
    } else {
      const severityIssues = getIssuesBySeverity(selectedSeverity);
      if (selectedCategory === 'all') {
        issues = severityIssues;
      } else {
        issues = severityIssues.filter(i => i.category === selectedCategory);
      }
    }
    setFilteredIssues(issues);

    // Load tasks needing improvement
    setTasksNeedingImprovement(getTasksNeedingImprovement());
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedSeverity, selectedCategory]);

  const handleExport = () => {
    const data = exportTestingData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibe-wiki-testing-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all testing data? This cannot be undone.')) {
      clearTestingData();
      loadDashboardData();
    }
  };

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const severityData = Object.entries(summary.issuesBySeverity).map(([severity, count]) => ({
    name: severity,
    value: count,
    fill: SEVERITY_COLORS[severity as IssueSeverity],
  }));

  const categoryData = Object.entries(summary.issuesByCategory)
    .filter(([_, count]) => count > 0)
    .map(([category, count]) => ({
      name: category.replace('_', ' '),
      value: count,
      fill: CATEGORY_COLORS[category as IssueCategory],
    }));

  return (
    <div className={className}>
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {summary.completedSessions} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.taskCompletionRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              Average completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.averageRating > 0 ? summary.averageRating.toFixed(1) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of 5.0
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.averageSessionDuration > 0
                ? `${Math.round(summary.averageSessionDuration)}m`
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Per session
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-6">
        <Button onClick={loadDashboardData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
        <Button onClick={handleClearData} variant="outline" size="sm" className="ml-auto text-destructive">
          Clear Data
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="tasks">Task Analysis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Issues by Severity */}
            <Card>
              <CardHeader>
                <CardTitle>Issues by Severity</CardTitle>
                <CardDescription>Distribution of reported issues</CardDescription>
              </CardHeader>
              <CardContent>
                {severityData.some(d => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={severityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {severityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No issues reported yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Issues by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Issues by Category</CardTitle>
                <CardDescription>Issue categories breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryData.some(d => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#00d9ff" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No issues reported yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          {summary.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recommendations
                </CardTitle>
                <CardDescription>AI-generated recommendations based on testing data</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {summary.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Severity</label>
                  <div className="flex gap-2">
                    {(['all', 'critical', 'major', 'minor', 'cosmetic'] as const).map((severity) => (
                      <Button
                        key={severity}
                        variant={selectedSeverity === severity ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedSeverity(severity)}
                      >
                        {severity}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'navigation', 'content_clarity', 'technical_error', 'accessibility', 'performance', 'ui_ux', 'other'] as const).map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues List */}
          <div className="space-y-2">
            {filteredIssues.length > 0 ? (
              filteredIssues.map((issue) => (
                <Card key={issue.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{issue.title}</CardTitle>
                        <div className="flex gap-2">
                          <Badge
                            style={{
                              backgroundColor: SEVERITY_COLORS[issue.severity],
                              color: 'white',
                            }}
                          >
                            {issue.severity}
                          </Badge>
                          <Badge variant="outline">{issue.category.replace('_', ' ')}</Badge>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(issue.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                    {issue.stepsToReproduce && (
                      <details className="mt-2">
                        <summary className="text-sm font-medium cursor-pointer">Steps to Reproduce</summary>
                        <ol className="mt-2 text-sm list-decimal list-inside text-muted-foreground">
                          {issue.stepsToReproduce.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                      </details>
                    )}
                    {issue.page && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Page: <code className="bg-muted px-1 py-0.5 rounded">{issue.page}</code>
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8 text-muted-foreground">
                  No issues match the current filters
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Common Pain Points</CardTitle>
              <CardDescription>Feedback from testing sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {summary.commonPainPoints.length > 0 ? (
                <ul className="space-y-2">
                  {summary.commonPainPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No pain points reported yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Task Analysis Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tasks Needing Improvement</CardTitle>
              <CardDescription>
                Tasks with high difficulty ratings or low completion rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tasksNeedingImprovement.length > 0 ? (
                <div className="space-y-4">
                  {tasksNeedingImprovement.map((item) => (
                    <div key={item.task.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{item.task.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.task.description}</p>
                        </div>
                        <Badge
                          style={{
                            backgroundColor:
                              item.difficulty === 'very_difficult'
                                ? '#ef4444'
                                : item.difficulty === 'difficult'
                                  ? '#f97316'
                                  : '#eab308',
                            color: 'white',
                          }}
                        >
                          {item.difficulty?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span>Completion: {item.completionRate.toFixed(0)}%</span>
                        </div>
                        {item.completionRate < 70 && (
                          <Badge variant="destructive">Below Target</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>All tasks are performing well!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
