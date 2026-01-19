"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, BookOpen, Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ExerciseBlock } from "./ExerciseBlock";
import type { Tutorial } from "@/types";

interface TutorialViewerProps {
  tutorial: Tutorial;
  onComplete?: () => void;
}

export function TutorialViewer({ tutorial, onComplete }: TutorialViewerProps) {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<Set<string>>(
    new Set()
  );

  // Handle empty steps gracefully
  const hasSteps = tutorial.steps.length > 0;
  const currentStep = hasSteps ? tutorial.steps[currentStepIndex] : null;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = !hasSteps || currentStepIndex === tutorial.steps.length - 1;
  const allStepsComplete = hasSteps && completedSteps.size === tutorial.steps.length;

  const goToPreviousStep = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const goToNextStep = () => {
    if (!isLastStep) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleStepComplete = () => {
    if (currentStep) {
      setCompletedSteps((prev) => new Set(prev).add(currentStep.id));
    }
  };

  const currentStepCompleted = currentStep ? completedSteps.has(currentStep.id) : false;

  // Calculate progress
  const progressPercentage =
    tutorial.steps.length > 0
      ? (completedSteps.size / tutorial.steps.length) * 100
      : 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tutorial Header */}
      <div className="mb-8 p-6 rounded-xl border border-white/10 bg-zinc-900/50">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded",
                  tutorial.difficulty === "beginner" &&
                    "bg-green-500/20 text-green-300",
                  tutorial.difficulty === "intermediate" &&
                    "bg-yellow-500/20 text-yellow-300",
                  tutorial.difficulty === "advanced" &&
                    "bg-red-500/20 text-red-300"
                )}
              >
                {tutorial.difficulty}
              </span>
              {tutorial.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs font-medium bg-zinc-800 text-zinc-400 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-3xl font-bold text-zinc-50 mb-2">
              {tutorial.title}
            </h1>
            <p className="text-zinc-400">{tutorial.description}</p>
          </div>
        </div>

        {/* Tutorial Meta */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{tutorial.estimatedMinutes} minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>{tutorial.steps.length} steps</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>{tutorial.learningObjectives.length} objectives</span>
          </div>
        </div>

        {/* Learning Objectives */}
        {tutorial.learningObjectives.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-zinc-800/50 border border-white/5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-2">
              What you&apos;ll learn:
            </h3>
            <ul className="space-y-1">
              {tutorial.learningObjectives.map((objective, index) => (
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
                allStepsComplete
                  ? "bg-neon-green"
                  : "bg-neon-cyan"
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step Navigation - only show if there are steps */}
      {hasSteps && (
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousStep}
            disabled={isFirstStep}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="text-sm text-zinc-400">
            Step {currentStepIndex + 1} of {tutorial.steps.length}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextStep}
            disabled={isLastStep}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Current Step Content */}
      {currentStep ? (
        <div
          className={cn(
            "p-6 rounded-xl border bg-zinc-900/30",
            currentStepCompleted
              ? "border-neon-green/50"
              : "border-white/10"
          )}
        >
          {/* Step Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-zinc-50">
                {currentStep.title}
              </h2>
            </div>
            {currentStepCompleted && (
              <span className="px-3 py-1 text-xs font-medium bg-neon-green/20 text-neon-green rounded-full">
                Complete
              </span>
            )}
          </div>

          {/* Step Content */}
          <div className="prose prose-invert prose-zinc max-w-none mb-6">
            <MarkdownRenderer content={currentStep.content} />
          </div>

          {/* Code Example */}
          {currentStep.codeExample && (
            <div className="mb-6">
              <MarkdownRenderer
                content={`\`\`\`${currentStep.codeExample.language}${currentStep.codeExample.title ? ` ${currentStep.codeExample.title}` : ""}\n${currentStep.codeExample.code}\n\`\`\``}
              />
            </div>
          )}

          {/* Exercise */}
          {currentStep.exercise && (
            <ExerciseBlock
              exercise={currentStep.exercise}
              onComplete={handleStepComplete}
            />
          )}

          {/* Step Complete Message */}
          {currentStepCompleted && !currentStep.exercise && (
            <div className="mt-6 p-4 rounded-lg bg-neon-green/10 border border-neon-green/30 text-center">
              <p className="text-neon-green font-medium">Step complete!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-xl border border-white/10 bg-zinc-900/30 text-center">
          <p className="text-zinc-400">This tutorial has no steps yet.</p>
        </div>
      )}

      {/* Tutorial Complete */}
      {allStepsComplete && (
        <div className="mt-8 p-6 rounded-xl border border-neon-green/50 bg-neon-green/10 text-center">
          <h3 className="text-2xl font-bold text-neon-green mb-2">
            Tutorial Complete!
          </h3>
          <p className="text-zinc-300 mb-4">
            Congratulations! You&apos;ve completed all steps in this tutorial.
          </p>
          <Button onClick={onComplete}>Finish Tutorial</Button>
        </div>
      )}
    </div>
  );
}
