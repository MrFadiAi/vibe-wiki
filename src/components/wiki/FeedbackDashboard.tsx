'use client';

/**
 * Feedback Dashboard Component
 *
 * Displays feedback analytics, statistics, and actionable insights
 * for iterating on the Vibe Wiki based on user feedback.
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
  Clock,
  Star,
  Filter,
  Download,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Bug,
  Lightbulb,
  Accessibility,
  Globe,
  Zap,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  FeedbackItem,
  FeedbackAnalysis,
  FeedbackCategory,
  FeedbackPriority,
  FeedbackStatus,
  IterationAction,
} from '@/types/user-testing';
import {
  analyzeFeedback,
  aggregateFeedbackByTime,
  generateIterationActions,
  filterFeedback,
  searchFeedback,
  exportFeedback,
  FEEDBACK_CATEGORIES,
  FEEDBACK_PRIORITIES,
  FEEDBACK_STATUS,
} from '@/lib/feedback-utils';

interface FeedbackDashboardProps {
  feedback: FeedbackItem[];
  onUpdateFeedback?: (id: string, updates: Partial<FeedbackItem>) => void;
  onExport?: () => void;
  onRefresh?: () => void;
  className?: string;
}

/**
 * Priority order for sorting
 */
const PRIORITY_ORDER: Record<FeedbackPriority, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  trivial: 1,
};

/**
 * Category icons mapping
 */
const CATEGORY_ICONS: Record<FeedbackCategory, React.ReactNode> = {
  usability: <Settings className="h-4 w-4" />,
  content: <MessageSquare className="h-4 w-4" />,
  performance: <Zap className="h-4 w-4" />,
  accessibility: <Accessibility className="h-4 w-4" />,
  feature: <Lightbulb className="h-4 w-4" />,
  bug: <Bug className="h-4 w-4" />,
  translation: <Globe className="h-4 w-4" />,
  other: <AlertCircle className="h-4 w-4" />,
};

/**
 * Status icons mapping
 */
const STATUS_ICONS: Record<FeedbackStatus, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  reviewing: <RefreshCw className="h-4 w-4" />,
  accepted: <CheckCircle2 className="h-4 w-4" />,
  rejected: <X className="h-4 w-4" />,
  in_progress: <RefreshCw className="h-4 w-4 animate-spin" />,
  completed: <CheckCircle2 className="h-4 w-4" />,
};

export function FeedbackDashboard({
  feedback,
  onUpdateFeedback,
  onExport,
  onRefresh,
  className = '',
}: FeedbackDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<FeedbackStatus | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<FeedbackPriority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'top-issues']));
  const [sortField, setSortField] = useState<'priority' | 'upvotes' | 'date'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Analyze feedback
  const analysis = useMemo(() => analyzeFeedback(feedback), [feedback]);

  // Filter feedback
  const filteredFeedback = useMemo(() => {
    let result = feedback;

    // Apply filters
    result = filterFeedback(result, {
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      priority: selectedPriority !== 'all' ? selectedPriority : undefined,
    });

    // Apply search
    if (searchQuery.trim()) {
      result = searchFeedback(result, searchQuery);
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      let comparison = 0;

      if (sortField === 'priority') {
        comparison = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
      } else if (sortField === 'upvotes') {
        comparison = b.upvotes - a.upvotes;
      } else if (sortField === 'date') {
        comparison = b.createdAt.getTime() - a.createdAt.getTime();
      }

      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return result;
  }, [feedback, selectedCategory, selectedStatus, selectedPriority, searchQuery, sortField, sortOrder]);

  // Generate iteration actions
  const iterationActions = useMemo(() => generateIterationActions(feedback), [feedback]);

  // Time aggregation
  const weeklyAggregation = useMemo(() => aggregateFeedbackByTime(feedback, 'week'), [feedback]);

  /**
   * Toggles section expansion
   */
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  /**
   * Gets trend icon based on direction
   */
  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  /**
   * Handles status update
   */
  const handleStatusUpdate = (id: string, newStatus: FeedbackStatus) => {
    if (onUpdateFeedback) {
      onUpdateFeedback(id, { status: newStatus });
    }
  };

  /**
   * Handles upvote
   */
  const handleUpvote = (id: string) => {
    const item = feedback.find((f) => f.id === id);
    if (item && onUpdateFeedback) {
      onUpdateFeedback(id, { upvotes: item.upvotes + 1 });
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Feedback Dashboard</h2>
          <p className="text-gray-400 mt-1">
            {analysis.total} total feedback items • {filteredFeedback.length} displayed
          </p>
        </div>
        <div className="flex gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      {expandedSections.has('overview') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <StatCard
            title="Total Feedback"
            value={analysis.total.toString()}
            icon={<MessageSquare className="h-5 w-5" />}
            color="blue"
          />
          <StatCard
            title="Pending Review"
            value={(analysis.byStatus.pending || 0).toString()}
            icon={<Clock className="h-5 w-5" />}
            color="yellow"
          />
          <StatCard
            title="Completed"
            value={(analysis.byStatus.completed || 0).toString()}
            icon={<CheckCircle2 className="h-5 w-5" />}
            color="green"
          />
          <StatCard
            title="Avg Rating"
            value={analysis.averageRating ? analysis.averageRating.toFixed(1) : 'N/A'}
            icon={<Star className="h-5 w-5" />}
            color="purple"
          />
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center p-4 bg-gray-900/50 rounded-lg border border-gray-800">
        <Filter className="h-4 w-4 text-gray-400" />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as FeedbackCategory | 'all')}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
        >
          <option value="all">All Categories</option>
          {Object.entries(FEEDBACK_CATEGORIES).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as FeedbackStatus | 'all')}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
        >
          <option value="all">All Statuses</option>
          {Object.entries(FEEDBACK_STATUS).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value as FeedbackPriority | 'all')}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
        >
          <option value="all">All Priorities</option>
          {Object.entries(FEEDBACK_PRIORITIES).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search feedback..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px] bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500"
        />

        <select
          value={`${sortField}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-');
            setSortField(field as 'priority' | 'upvotes' | 'date');
            setSortOrder(order as 'asc' | 'desc');
          }}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
        >
          <option value="priority-desc">Priority (High to Low)</option>
          <option value="priority-asc">Priority (Low to High)</option>
          <option value="upvotes-desc">Upvotes (High to Low)</option>
          <option value="upvotes-asc">Upvotes (Low to High)</option>
          <option value="date-desc">Date (Newest First)</option>
          <option value="date-asc">Date (Oldest First)</option>
        </select>
      </div>

      {/* Category Breakdown */}
      <CollapsibleSection
        title="Category Breakdown"
        isExpanded={expandedSections.has('categories')}
        onToggle={() => toggleSection('categories')}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(analysis.byCategory).map(([category, count]) => (
            <div
              key={category}
              className="p-4 bg-gray-900/50 rounded-lg border border-gray-800"
              style={{
                borderColor: FEEDBACK_CATEGORIES[category as FeedbackCategory]?.color,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                {CATEGORY_ICONS[category as FeedbackCategory]}
                <span className="text-white font-medium">
                  {FEEDBACK_CATEGORIES[category as FeedbackCategory]?.label}
                </span>
              </div>
              <div className="text-2xl font-bold text-white">{count}</div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Top Issues */}
      <CollapsibleSection
        title="Top Issues"
        subtitle="Highest priority feedback items"
        isExpanded={expandedSections.has('top-issues')}
        onToggle={() => toggleSection('top-issues')}
      >
        <div className="space-y-3">
          {analysis.topIssues.slice(0, 5).map((issue) => (
            <div
              key={issue.id}
              className="p-4 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {CATEGORY_ICONS[issue.category]}
                    <Badge
                      text={FEEDBACK_PRIORITIES[issue.priority].label}
                      color={FEEDBACK_PRIORITIES[issue.priority].color}
                    />
                    <Badge
                      text={FEEDBACK_STATUS[issue.status].label}
                      color={FEEDBACK_STATUS[issue.status].color}
                    />
                  </div>
                  <h4 className="text-white font-medium">{issue.title}</h4>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    <span>Score: {issue.score}</span>
                    <span>↑ {issue.upvotes}</span>
                    <span>{issue.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Recent Trends */}
      <CollapsibleSection
        title="Recent Trends"
        subtitle="Feedback changes over the last 30 days"
        isExpanded={expandedSections.has('trends')}
        onToggle={() => toggleSection('trends')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analysis.recentTrends.map((trend) => (
            <div
              key={trend.category}
              className="p-4 bg-gray-900/50 rounded-lg border border-gray-800"
            >
              <div className="flex items-center gap-2 mb-2">
                {CATEGORY_ICONS[trend.category]}
                <span className="text-white text-sm">
                  {FEEDBACK_CATEGORIES[trend.category].label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{trend.recentCount}</div>
                  <div className="text-xs text-gray-400">Last 30 days</div>
                </div>
                <div className="text-right">
                  {getTrendIcon(trend.direction)}
                  <div className={`text-sm font-medium ${
                    trend.direction === 'increasing' ? 'text-red-400' :
                    trend.direction === 'decreasing' ? 'text-green-400' :
                    'text-gray-400'
                  }`}>
                    {trend.changePercent > 0 ? '+' : ''}{trend.changePercent.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Recommendations */}
      <CollapsibleSection
        title="Recommendations"
        subtitle="Actionable improvement suggestions"
        isExpanded={expandedSections.has('recommendations')}
        onToggle={() => toggleSection('recommendations')}
      >
        <div className="space-y-3">
          {analysis.recommendations.map((rec, index) => (
            <div
              key={`${rec.category}-${index}`}
              className="p-4 bg-gray-900/50 rounded-lg border-l-4"
              style={{ borderLeftColor: FEEDBACK_PRIORITIES[rec.priority].color }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge
                    text={rec.type}
                    color={FEEDBACK_PRIORITIES[rec.priority].color}
                    className="mb-2"
                  />
                  <h4 className="text-white font-medium">{rec.title}</h4>
                  <p className="text-gray-400 text-sm mt-1">{rec.description}</p>
                  <div className="flex gap-2 mt-2">
                    {rec.affectedAreas.map((area) => (
                      <span
                        key={area}
                        className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Iteration Actions */}
      <CollapsibleSection
        title="Iteration Actions"
        subtitle="Suggested actions based on feedback"
        isExpanded={expandedSections.has('actions')}
        onToggle={() => toggleSection('actions')}
      >
        <div className="space-y-3">
          {iterationActions.slice(0, 5).map((action) => (
            <div
              key={action.id}
              className="p-4 bg-gray-900/50 rounded-lg border border-gray-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      text={action.type}
                      color={FEEDBACK_PRIORITIES[action.priority].color}
                    />
                    <Badge
                      text={action.estimatedEffort}
                      color="#6b7280"
                    />
                  </div>
                  <h4 className="text-white font-medium">{action.title}</h4>
                  <p className="text-gray-400 text-sm mt-1">{action.description}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    {action.feedbackIds.length} feedback item(s)
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Feedback List */}
      <CollapsibleSection
        title={`All Feedback (${filteredFeedback.length})`}
        isExpanded={expandedSections.has('all-feedback')}
        onToggle={() => toggleSection('all-feedback')}
      >
        <div className="space-y-3">
          <AnimatePresence>
            {filteredFeedback.slice(0, 20).map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {CATEGORY_ICONS[item.category]}
                      <Badge
                        text={FEEDBACK_CATEGORIES[item.category].label}
                        color={FEEDBACK_CATEGORIES[item.category].color}
                      />
                      <Badge
                        text={FEEDBACK_PRIORITIES[item.priority].label}
                        color={FEEDBACK_PRIORITIES[item.priority].color}
                      />
                      <Badge
                        text={FEEDBACK_STATUS[item.status].label}
                        color={FEEDBACK_STATUS[item.status].color}
                      />
                    </div>
                    <h4 className="text-white font-medium">{item.title}</h4>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>By {item.userId}</span>
                      <span>{item.createdAt.toLocaleDateString()}</span>
                      {item.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          {item.rating}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpvote(item.id)}
                      className="text-gray-400 hover:text-white"
                    >
                      <span className="flex items-center gap-1">
                        ↑ {item.upvotes}
                      </span>
                    </Button>
                    {onUpdateFeedback && (
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusUpdate(item.id, e.target.value as FeedbackStatus)}
                        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white"
                      >
                        {Object.entries(FEEDBACK_STATUS).map(([key, { label }]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredFeedback.length > 20 && (
            <div className="text-center text-gray-400 text-sm py-4">
              Showing 20 of {filteredFeedback.length} feedback items
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
}

/**
 * Stat Card Component
 */
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

/**
 * Badge Component
 */
interface BadgeProps {
  text: string;
  color: string;
  className?: string;
}

function Badge({ text, color, className = '' }: BadgeProps) {
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded ${className}`}
      style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
    >
      {text}
    </span>
  );
}

/**
 * Collapsible Section Component
 */
interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ title, subtitle, isExpanded, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-gray-900/50 hover:bg-gray-900 transition-colors flex items-center justify-between"
      >
        <div>
          <h3 className="text-white font-medium">{title}</h3>
          {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-gray-800">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
