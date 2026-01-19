'use client';

import React, { useEffect } from 'react';
import { useProgressStats, useAchievements, useActivityFeed } from '@/hooks/use-progress';
import { BookOpen, Code, Target, Award, Clock, Flame, TrendingUp } from 'lucide-react';

interface ProgressDashboardProps {
  totalContent?: {
    articles: number;
    tutorials: number;
    paths: number;
  };
}

export function ProgressDashboard({ totalContent = { articles: 50, tutorials: 20, paths: 10 } }: ProgressDashboardProps) {
  const { stats, refresh } = useProgressStats();
  const { recentAchievements } = useAchievements();
  const { recentActivities } = useActivityFeed();

  useEffect(() => {
    refresh(totalContent);
  }, [totalContent, refresh]);

  if (!stats) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          label="Articles Read"
          value={stats.totalArticlesRead}
          total={totalContent.articles}
          color="blue"
        />
        <StatCard
          icon={<Code className="w-5 h-5" />}
          label="Tutorials Completed"
          value={stats.totalTutorialsCompleted}
          total={totalContent.tutorials}
          color="green"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Paths Completed"
          value={stats.totalPathsCompleted}
          total={totalContent.paths}
          color="purple"
        />
        <StatCard
          icon={<Award className="w-5 h-5" />}
          label="Total Points"
          value={stats.totalPoints}
          color="yellow"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Spent</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalTimeSpent} min</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Streak</span>
          </div>
          <p className="text-2xl font-bold">{stats.currentStreak} days</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</span>
          </div>
          <p className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Recent Achievements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentActivities.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivities.slice(0, 5).map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  total?: number;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}

function StatCard({ icon, label, value, total, color }: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
    yellow: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-2 rounded ${colorClasses[color]}`}>{icon}</div>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-bold">
        {value}
        {total !== undefined && <span className="text-sm font-normal text-gray-500"> / {total}</span>}
      </p>
    </div>
  );
}

interface AchievementCardProps {
  achievement: {
    title: string;
    description: string;
    icon: string;
    category: string;
    points?: number;
  };
}

function AchievementCard({ achievement }: AchievementCardProps) {
  const categoryColors = {
    article: 'border-blue-500',
    tutorial: 'border-green-500',
    path: 'border-purple-500',
    streak: 'border-orange-500',
    skill: 'border-yellow-500',
  };

  return (
    <div className={`border-l-4 ${categoryColors[achievement.category as keyof typeof categoryColors]} bg-gray-50 dark:bg-gray-900 rounded p-3`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{achievement.icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{achievement.title}</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">{achievement.description}</p>
          {achievement.points && (
            <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400 mt-1">+{achievement.points} pts</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface ActivityItemProps {
  activity: {
    type: string;
    contentTitle: string;
    timestamp: Date;
    points?: number;
  };
}

function ActivityItem({ activity }: ActivityItemProps) {
  const typeIcons = {
    article_completed: '📖',
    tutorial_completed: '👨‍💻',
    path_completed: '🎯',
    step_completed: '✓',
    achievement_unlocked: '🏆',
  };

  const typeLabels = {
    article_completed: 'Completed article',
    tutorial_completed: 'Completed tutorial',
    path_completed: 'Completed learning path',
    step_completed: 'Completed step',
    achievement_unlocked: 'Unlocked achievement',
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-xl">{typeIcons[activity.type as keyof typeof typeIcons]}</span>
      <div className="flex-1">
        <p className="text-gray-900 dark:text-gray-100">
          {typeLabels[activity.type as keyof typeof typeLabels]}: <span className="font-medium">{activity.contentTitle}</span>
        </p>
        <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
      </div>
      {activity.points && (
        <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">+{activity.points}</span>
      )}
    </div>
  );
}
