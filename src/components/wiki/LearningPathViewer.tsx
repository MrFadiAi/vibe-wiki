"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  Users,
  BookOpen,
  Code,
  FileText,
  CheckCircle2,
  Circle,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { LearningPath, PathItem, PathProgress, PathItemType } from "@/types";

interface LearningPathViewerProps {
  path: LearningPath;
  progress?: PathProgress;
  onItemComplete?: (itemId: string) => void;
  onPathComplete?: () => void;
  onNavigateToItem?: (item: PathItem) => void;
}

const ITEM_TYPE_ICONS: Record<PathItemType, React.ComponentType<{ className?: string }>> = {
  article: FileText,
  tutorial: BookOpen,
  exercise: Code,
};

const ITEM_TYPE_LABELS: Record<PathItemType, string> = {
  article: "Article",
  tutorial: "Tutorial",
  exercise: "Exercise",
};

export function LearningPathViewer({
  path,
  progress,
  onItemComplete,
  onPathComplete,
  onNavigateToItem,
}: LearningPathViewerProps) {
  // Initialize progress if not provided
  const pathProgress = progress ?? {
    pathId: path.id,
    completedItems: [],
  };

  const [selectedItem, setSelectedItem] = React.useState<PathItem | null>(() => {
    // Start with the first uncompleted item, or the first item if all are complete
    const firstUncompleted = path.items.find(
      (item) => !item.isOptional && !pathProgress.completedItems.includes(item.id)
    );
    return firstUncompleted ?? path.items[0] ?? null;
  });

  const handleSelectItem = (item: PathItem) => {
    setSelectedItem(item);
    if (onNavigateToItem) {
      onNavigateToItem(item);
    }
  };

  const handlePreviousItem = () => {
    if (!selectedItem) return;
    const currentIndex = path.items.findIndex((i) => i.id === selectedItem.id);
    if (currentIndex > 0) {
      handleSelectItem(path.items[currentIndex - 1]);
    }
  };

  const handleNextItem = () => {
    if (!selectedItem) return;
    const currentIndex = path.items.findIndex((i) => i.id === selectedItem.id);
    if (currentIndex < path.items.length - 1) {
      handleSelectItem(path.items[currentIndex + 1]);
    }
  };

  const handleMarkComplete = () => {
    if (selectedItem && onItemComplete) {
      onItemComplete(selectedItem.id);
    }
  };

  const isItemSelectedLocked = (item: PathItem): boolean => {
    // Check if all previous required items are completed
    const itemIndex = path.items.findIndex((i) => i.id === item.id);
    for (let i = 0; i < itemIndex; i++) {
      const previousItem = path.items[i];
      if (!previousItem.isOptional && !pathProgress.completedItems.includes(previousItem.id)) {
        return true;
      }
    }
    return false;
  };

  const isCompleted = (item: PathItem): boolean => {
    return pathProgress.completedItems.includes(item.id);
  };

  const currentIndex = selectedItem ? path.items.findIndex((i) => i.id === selectedItem.id) : -1;
  const isFirstItem = currentIndex <= 0;
  const isLastItem = currentIndex >= path.items.length - 1;
  const allRequiredComplete = path.items
    .filter((i) => !i.isOptional)
    .every((item) => pathProgress.completedItems.includes(item.id));

  // Calculate progress
  const requiredItems = path.items.filter((i) => !i.isOptional);
  const progressPercentage =
    requiredItems.length > 0
      ? (pathProgress.completedItems.filter((id) =>
          requiredItems.some((item) => item.id === id)
        ).length /
          requiredItems.length) *
        100
      : 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Path Header */}
      <div className="mb-8 p-6 rounded-xl border border-white/10 bg-zinc-900/50">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded",
                  path.difficulty === "beginner" && "bg-green-500/20 text-green-300",
                  path.difficulty === "intermediate" && "bg-yellow-500/20 text-yellow-300",
                  path.difficulty === "advanced" && "bg-red-500/20 text-red-300"
                )}
              >
                {path.difficulty}
              </span>
              {path.category && (
                <span className="px-2 py-0.5 text-xs font-medium bg-zinc-800 text-zinc-400 rounded">
                  {path.category}
                </span>
              )}
              {path.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs font-medium bg-zinc-800 text-zinc-400 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-3xl font-bold text-zinc-50 mb-2">{path.title}</h1>
            <p className="text-zinc-400">{path.description}</p>
          </div>
        </div>

        {/* Path Meta */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{path.estimatedMinutes} minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>{path.items.length} items</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>{path.learningObjectives.length} objectives</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{path.targetAudience.join(", ")}</span>
          </div>
        </div>

        {/* Target Audience */}
        {path.targetAudience.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-zinc-800/50 border border-white/5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-2">Target Audience:</h3>
            <div className="flex flex-wrap gap-2">
              {path.targetAudience.map((audience, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-zinc-700 text-zinc-300 rounded"
                >
                  {audience}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Learning Objectives */}
        {path.learningObjectives.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-zinc-800/50 border border-white/5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-2">
              What you&apos;ll learn:
            </h3>
            <ul className="space-y-1">
              {path.learningObjectives.map((objective, index) => (
                <li
                  key={index}
                  className="text-sm text-zinc-400 flex items-start gap-2"
                >
                  <span className="text-neon-cyan mt-1">•</span>
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prerequisites */}
        {path.prerequisites && path.prerequisites.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <h3 className="text-sm font-semibold text-yellow-300 mb-2">Prerequisites:</h3>
            <ul className="space-y-1">
              {path.prerequisites.map((prereq, index) => (
                <li
                  key={index}
                  className="text-sm text-yellow-200 flex items-start gap-2"
                >
                  <span className="text-yellow-400 mt-1">•</span>
                  <span>{prereq}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500",
                allRequiredComplete ? "bg-neon-green" : "bg-neon-cyan"
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Path Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Path Items Sidebar */}
        <div className="lg:col-span-1">
          <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/50">
            <h2 className="text-lg font-semibold text-zinc-50 mb-4">Path Content</h2>
            <div className="space-y-2">
              {path.items.map((item, index) => {
                const ItemIcon = ITEM_TYPE_ICONS[item.type];
                const isLocked = isItemSelectedLocked(item);
                const completed = isCompleted(item);
                const isSelected = selectedItem?.id === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => !isLocked && handleSelectItem(item)}
                    disabled={isLocked}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-colors",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      isSelected
                        ? "bg-neon-cyan/20 border-neon-cyan/50"
                        : completed
                          ? "bg-neon-green/10 border-neon-green/30 hover:bg-neon-green/20"
                          : "bg-zinc-800/50 border-white/5 hover:bg-zinc-800"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {isLocked ? (
                          <Lock className="h-4 w-4 text-zinc-500" />
                        ) : completed ? (
                          <CheckCircle2 className="h-4 w-4 text-neon-green" />
                        ) : (
                          <Circle className="h-4 w-4 text-zinc-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-zinc-500">{index + 1}</span>
                          <ItemIcon className="h-3 w-3 text-zinc-400" />
                          <span className="text-xs text-zinc-500">
                            {ITEM_TYPE_LABELS[item.type]}
                          </span>
                          {item.isOptional && (
                            <span className="text-xs text-zinc-500">(optional)</span>
                          )}
                        </div>
                        <p
                          className={cn(
                            "text-sm font-medium truncate",
                            isSelected
                              ? "text-neon-cyan"
                              : completed
                                ? "text-neon-green"
                                : "text-zinc-300"
                          )}
                        >
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
                          <Clock className="h-3 w-3" />
                          <span>{item.estimatedMinutes} min</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Item Content */}
        <div className="lg:col-span-2">
          {selectedItem ? (
            <div
              className={cn(
                "p-6 rounded-xl border bg-zinc-900/30",
                isCompleted(selectedItem)
                  ? "border-neon-green/50"
                  : "border-white/10"
              )}
            >
              {/* Item Header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-zinc-500">
                      Item {currentIndex + 1} of {path.items.length}
                    </span>
                    {React.createElement(ITEM_TYPE_ICONS[selectedItem.type], {
                      className: "h-4 w-4 text-zinc-400",
                    })}
                    <span className="text-xs text-zinc-500">
                      {ITEM_TYPE_LABELS[selectedItem.type]}
                    </span>
                    {selectedItem.isOptional && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-zinc-700 text-zinc-400 rounded">
                        Optional
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-50">{selectedItem.title}</h2>
                  {selectedItem.description && (
                    <p className="text-zinc-400 mt-2">{selectedItem.description}</p>
                  )}
                </div>
                {isCompleted(selectedItem) && (
                  <span className="px-3 py-1 text-xs font-medium bg-neon-green/20 text-neon-green rounded-full">
                    Complete
                  </span>
                )}
              </div>

              {/* Item Meta */}
              <div className="flex items-center gap-4 text-sm text-zinc-400 mb-6 pb-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{selectedItem.estimatedMinutes} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">Type:</span>
                  <span>{ITEM_TYPE_LABELS[selectedItem.type]}</span>
                </div>
              </div>

              {/* Item Content Placeholder */}
              <div className="prose prose-invert prose-zinc max-w-none">
                <p className="text-zinc-400 italic">
                  This is a placeholder for the {ITEM_TYPE_LABELS[selectedItem.type].toLowerCase()} content:{" "}
                  <strong>{selectedItem.title}</strong>
                </p>
                <p className="text-zinc-400">
                  In a full implementation, this would render the actual article, tutorial, or exercise
                  content based on the item type and slug.
                </p>
                {selectedItem.isOptional && (
                  <div className="mt-4 p-4 rounded-lg bg-zinc-800/50 border border-white/5">
                    <p className="text-sm text-zinc-400">
                      <strong>Note:</strong> This is an optional item. You can skip it if you want to
                      focus on the core learning path.
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="mt-8 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePreviousItem}
                  disabled={isFirstItem}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {!isCompleted(selectedItem) && !selectedItem.isOptional && (
                    <Button onClick={handleMarkComplete} className="gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Mark Complete
                    </Button>
                  )}
                  <Button
                    variant={isLastItem ? "default" : "ghost"}
                    size={isLastItem ? "default" : "sm"}
                    onClick={isLastItem ? onPathComplete : handleNextItem}
                    disabled={isLastItem && !allRequiredComplete}
                    className="gap-1"
                  >
                    {isLastItem ? "Finish Path" : "Next"}
                    {!isLastItem && <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-white/10 bg-zinc-900/30 text-center">
              <p className="text-zinc-400">Select an item from the path to view its content.</p>
            </div>
          )}

          {/* Path Complete */}
          {allRequiredComplete && (
            <div className="mt-8 p-6 rounded-xl border border-neon-green/50 bg-neon-green/10 text-center">
              <h3 className="text-2xl font-bold text-neon-green mb-2">
                Learning Path Complete!
              </h3>
              <p className="text-zinc-300 mb-4">
                Congratulations! You&apos;ve completed all required items in this learning path.
              </p>
              {path.items.filter((i) => i.isOptional).length > 0 && (
                <p className="text-sm text-zinc-400 mb-4">
                  You can still complete the optional items if you want to deepen your knowledge.
                </p>
              )}
              <Button onClick={onPathComplete}>Finish Path</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
