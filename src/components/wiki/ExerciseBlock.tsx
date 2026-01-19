"use client";

import * as React from "react";
import { Lightbulb, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { InteractiveCodeBlock } from "./InteractiveCodeBlock";
import type { Exercise } from "@/types";

interface ExerciseBlockProps {
  exercise: Exercise;
  onComplete?: (_success: boolean) => void;
}

export function ExerciseBlock({ exercise }: ExerciseBlockProps) {
  const [code, setCode] = React.useState(exercise.starterCode);
  const [showSolution, setShowSolution] = React.useState(false);
  const [hintLevel, setHintLevel] = React.useState(0);
  const [hasCompleted, setHasCompleted] = React.useState<boolean | null>(null);

  const hasHints = exercise.hints && exercise.hints.length > 0;
  const hasSolution = Boolean(exercise.solution);
  const currentHint =
    hasHints && hintLevel > 0
      ? exercise.hints.slice(0, hintLevel).join("\n\n")
      : undefined;

  const handleShowNextHint = () => {
    if (hasHints && hintLevel < (exercise.hints?.length ?? 0)) {
      setHintLevel(hintLevel + 1);
    }
  };

  const handleToggleSolution = () => {
    setShowSolution(!showSolution);
  };

  const handleReset = () => {
    setCode(exercise.starterCode);
    setHintLevel(0);
    setShowSolution(false);
    setHasCompleted(null);
  };

  return (
    <div className="my-6 rounded-xl border border-white/10 bg-zinc-900/50 overflow-hidden">
      {/* Exercise Header */}
      <div className="px-5 py-4 border-b border-white/10 bg-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-zinc-50 flex items-center gap-2">
              {exercise.title}
              {hasCompleted !== null && (
                hasCompleted ? (
                  <CheckCircle className="h-5 w-5 text-neon-green" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )
              )}
            </h4>
            <p className="text-sm text-zinc-400 mt-1">
              {exercise.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-mono bg-zinc-800 text-zinc-300 rounded">
              {exercise.language}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-3 p-3 rounded-lg bg-zinc-800/50 border border-white/5">
          <p className="text-sm text-zinc-300 whitespace-pre-wrap">
            {exercise.instruction}
          </p>
        </div>
      </div>

      {/* Hints Section */}
      {hasHints && (
        <div className="px-5 py-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Lightbulb className="h-4 w-4" />
              <span>
                Hints available ({hintLevel}/{exercise.hints?.length})
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleShowNextHint}
              disabled={hintLevel >= (exercise.hints?.length ?? 0)}
              className="h-7 text-xs"
            >
              {hintLevel === 0 ? "Show Hint" : "Next Hint"}
            </Button>
          </div>
          {currentHint && (
            <div className="mt-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-200 whitespace-pre-wrap">
                {currentHint}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Code Editor */}
      <div className="p-4">
        <InteractiveCodeBlock
          code={showSolution ? exercise.solution || code : code}
          language={exercise.language}
        >
          <code className="text-sm text-zinc-300 whitespace-pre-wrap">
            {showSolution ? exercise.solution || code : code}
          </code>
        </InteractiveCodeBlock>
      </div>

      {/* Expected Output (if defined) */}
      {exercise.expectedOutput && (
        <div className="px-5 pb-4">
          <div className="p-3 rounded-lg bg-zinc-800/50 border border-white/5">
            <p className="text-xs font-medium text-zinc-400 mb-2">
              Expected Output:
            </p>
            <div className="font-mono text-sm text-zinc-300">
              {Array.isArray(exercise.expectedOutput) ? (
                <ul className="list-disc list-inside space-y-1">
                  {exercise.expectedOutput.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              ) : (
                <pre className="whitespace-pre-wrap">{exercise.expectedOutput}</pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-5 py-3 bg-zinc-900/50 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasSolution && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleToggleSolution}
              className="h-8 text-xs gap-1.5"
            >
              {showSolution ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  Hide Solution
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  Show Solution
                </>
              )}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            className="h-8 text-xs"
          >
            Reset
          </Button>
        </div>
        {hasCompleted !== null && (
          <span
            className={cn(
              "text-sm font-medium",
              hasCompleted ? "text-neon-green" : "text-red-400"
            )}
          >
            {hasCompleted ? "Exercise Complete!" : "Keep trying!"}
          </span>
        )}
      </div>
    </div>
  );
}
