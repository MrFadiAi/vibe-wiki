"use client";

import * as React from "react";
import {
  Trophy,
  Target,
  Flame,
  BookOpen,
  GraduationCap,
  Map,
  TrendingUp,
  Award,
  Clock,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserProgress, ProgressStats } from "@/types";

interface UserProgressDashboardProps {
  progress: UserProgress;
  onViewActivity?: () => void;
  onViewAchievements?: () => void;
}

export function UserProgressDashboard({
  progress,
  onViewActivity,
  onViewAchievements,
}: UserProgressDashboardProps) {
  const stats: ProgressStats = React.useMemo(() => {
    return {
      totalArticlesRead: progress.completedArticles.length,
      totalTutorialsCompleted: progress.completedTutorials.length,
      totalPathsCompleted: progress.completedPaths.length,
      totalTimeSpent: 0,
      currentStreak: progress.streakDays,
      achievementsCount: progress.achievements.length,
      totalPoints: progress.totalPoints,
      completionRate: 0,
    };
  }, [progress]);

  const level = React.useMemo(() => {
    const levels = [
      { points: 0, title: "Beginner" },
      { points: 100, title: "Novice" },
      { points: 500, title: "Intermediate" },
      { points: 1000, title: "Advanced" },
      { points: 2500, title: "Expert" },
      { points: 5000, title: "Master" },
      { points: 10000, title: "Grandmaster" },
    ];

    let currentLevel = levels[0];
    for (const level of levels) {
      if (progress.totalPoints >= level.points) {
        currentLevel = level;
      } else {
        break;
      }
    }

    const currentLevelIndex = levels.indexOf(currentLevel);
    const nextLevel = levels[currentLevelIndex + 1];

    return {
      level: currentLevelIndex + 1,
      title: currentLevel.title,
      currentPoints: progress.totalPoints,
      levelPoints: currentLevel.points,
      nextLevelPoints: nextLevel?.points || currentLevel.points,
      hasMoreLevels: !!nextLevel,
    };
  }, [progress.totalPoints]);

  const progressToNextLevel = level.hasMoreLevels
    ? ((level.currentPoints - level.levelPoints) / (level.nextLevelPoints - level.levelPoints)) * 100
    : 100;

  const recentAchievements = React.useMemo(() => {
    return [...progress.achievements]
      .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
      .slice(0, 5);
  }, [progress.achievements]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="p-6 rounded-xl border border-white/10 bg-zinc-900/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-zinc-50 mb-2">Your Progress</h1>
            <p className="text-zinc-400">Track your learning journey and achievements</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-zinc-400">Current Level</div>
            <div className="text-2xl font-bold text-neon-cyan">{level.title}</div>
            <div className="text-sm text-zinc-500">Level {level.level}</div>
          </div>
        </div>

        {/* Level Progress Bar */}
        {level.hasMoreLevels && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
              <span>
                {level.currentPoints} / {level.nextLevelPoints} points
              </span>
              <span>{Math.round(progressToNextLevel)}% to next level</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-neon-cyan transition-all duration-500"
                style={{ width: `${Math.min(progressToNextLevel, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Points Card */}
        <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Star className="h-5 w-5 text-yellow-400" />
            </div>
            <span className="text-sm text-zinc-400">Total Points</span>
          </div>
          <div className="text-2xl font-bold text-zinc-50">{stats.totalPoints}</div>
        </div>

        {/* Streak Card */}
        <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <Flame className="h-5 w-5 text-orange-400" />
            </div>
            <span className="text-sm text-zinc-400">Current Streak</span>
          </div>
          <div className="text-2xl font-bold text-zinc-50">{stats.currentStreak} days</div>
        </div>

        {/* Achievements Card */}
        <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Trophy className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-sm text-zinc-400">Achievements</span>
          </div>
          <div className="text-2xl font-bold text-zinc-50">{stats.achievementsCount}</div>
        </div>

        {/* Completion Rate Card */}
        <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Target className="h-5 w-5 text-green-400" />
            </div>
            <span className="text-sm text-zinc-400">Level Progress</span>
          </div>
          <div className="text-2xl font-bold text-zinc-50">
            {level.hasMoreLevels ? `${Math.round(progressToNextLevel)}%` : "Max"}
          </div>
        </div>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Articles & Tutorials */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-white/10 bg-zinc-900/50">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">Content Completed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Articles */}
            <div className="p-4 rounded-lg bg-zinc-800/50 border border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-5 w-5 text-neon-cyan" />
                <span className="text-sm text-zinc-400">Articles</span>
              </div>
              <div className="text-3xl font-bold text-zinc-50">{stats.totalArticlesRead}</div>
            </div>

            {/* Tutorials */}
            <div className="p-4 rounded-lg bg-zinc-800/50 border border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="h-5 w-5 text-neon-green" />
                <span className="text-sm text-zinc-400">Tutorials</span>
              </div>
              <div className="text-3xl font-bold text-zinc-50">{stats.totalTutorialsCompleted}</div>
            </div>

            {/* Paths */}
            <div className="p-4 rounded-lg bg-zinc-800/50 border border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <Map className="h-5 w-5 text-neon-purple" />
                <span className="text-sm text-zinc-400">Learning Paths</span>
              </div>
              <div className="text-3xl font-bold text-zinc-50">{stats.totalPathsCompleted}</div>
            </div>
          </div>

          {/* Activity Trend */}
          <div className="mt-6 p-4 rounded-lg bg-zinc-800/30 border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-neon-cyan" />
                <div>
                  <div className="text-sm font-medium text-zinc-300">Keep Learning!</div>
                  <div className="text-xs text-zinc-500">Continue your streak to unlock more achievements</div>
                </div>
              </div>
              {onViewActivity && (
                <Button variant="ghost" size="sm" onClick={onViewActivity}>
                  View Activity
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="p-6 rounded-xl border border-white/10 bg-zinc-900/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-zinc-50">Recent Achievements</h2>
            {onViewAchievements && progress.achievements.length > 5 && (
              <Button variant="ghost" size="sm" onClick={onViewAchievements}>
                View All
              </Button>
            )}
          </div>

          {recentAchievements.length > 0 ? (
            <div className="space-y-3">
              {recentAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="p-3 rounded-lg bg-zinc-800/50 border border-white/5"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-zinc-300 truncate">
                          {achievement.title}
                        </span>
                        {achievement.points && (
                          <span className="text-xs text-yellow-400">+{achievement.points}</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-2">{achievement.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm text-zinc-400">No achievements yet</p>
              <p className="text-xs text-zinc-500">Start learning to unlock your first achievement!</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-gradient-to-br from-neon-cyan/10 to-transparent border border-neon-cyan/20">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-neon-cyan" />
            <div>
              <div className="text-xs text-zinc-400">Last Activity</div>
              <div className="text-sm font-medium text-zinc-300">
                {new Date(progress.lastActivity).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-br from-neon-green/10 to-transparent border border-neon-green/20">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-neon-green" />
            <div>
              <div className="text-xs text-zinc-400">Member Since</div>
              <div className="text-sm font-medium text-zinc-300">
                {new Date(progress.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-br from-neon-purple/10 to-transparent border border-neon-purple/20">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-neon-purple" />
            <div>
              <div className="text-xs text-zinc-400">Total Items</div>
              <div className="text-sm font-medium text-zinc-300">
                {stats.totalArticlesRead + stats.totalTutorialsCompleted + stats.totalPathsCompleted}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-yellow-400" />
            <div>
              <div className="text-xs text-zinc-400">Points to Next Level</div>
              <div className="text-sm font-medium text-zinc-300">
                {level.hasMoreLevels
                  ? `${level.nextLevelPoints - level.currentPoints}`
                  : "Max Level"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
