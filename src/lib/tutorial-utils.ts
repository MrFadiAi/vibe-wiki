import type {
  Tutorial,
  TutorialStep,
  Exercise,
  DifficultyLevel,
  InteractiveExample,
} from "@/types";

/**
 * Validates a tutorial object to ensure it has all required fields and valid data.
 */
export function validateTutorial(tutorial: Tutorial): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!tutorial.id || typeof tutorial.id !== "string") {
    errors.push("Tutorial must have a valid id");
  }
  if (!tutorial.slug || typeof tutorial.slug !== "string") {
    errors.push("Tutorial must have a valid slug");
  } else if (!/^[a-z0-9-]+$/.test(tutorial.slug)) {
    errors.push(
      "Tutorial slug must contain only lowercase letters, numbers, and hyphens"
    );
  }
  if (!tutorial.title || typeof tutorial.title !== "string") {
    errors.push("Tutorial must have a valid title");
  } else if (tutorial.title.length < 5 || tutorial.title.length > 200) {
    errors.push("Tutorial title must be between 5 and 200 characters");
  }
  if (!tutorial.description || typeof tutorial.description !== "string") {
    errors.push("Tutorial must have a valid description");
  } else if (tutorial.description.length < 50) {
    errors.push("Tutorial description must be at least 50 characters");
  }
  if (!tutorial.section || typeof tutorial.section !== "string") {
    errors.push("Tutorial must have a valid section");
  }

  // Difficulty level
  const validDifficulties: DifficultyLevel[] = [
    "beginner",
    "intermediate",
    "advanced",
  ];
  if (!validDifficulties.includes(tutorial.difficulty)) {
    errors.push(
      `Tutorial difficulty must be one of: ${validDifficulties.join(", ")}`
    );
  }

  // Estimated time
  if (
    !tutorial.estimatedMinutes ||
    typeof tutorial.estimatedMinutes !== "number" ||
    tutorial.estimatedMinutes < 1 ||
    tutorial.estimatedMinutes > 480
  ) {
    errors.push("Tutorial estimated time must be between 1 and 480 minutes");
  }

  // Learning objectives
  if (
    !tutorial.learningObjectives ||
    !Array.isArray(tutorial.learningObjectives) ||
    tutorial.learningObjectives.length === 0
  ) {
    errors.push("Tutorial must have at least one learning objective");
  }

  // Steps
  if (
    !tutorial.steps ||
    !Array.isArray(tutorial.steps) ||
    tutorial.steps.length === 0
  ) {
    errors.push("Tutorial must have at least one step");
  } else {
    tutorial.steps.forEach((step, index) => {
      if (!step.id || typeof step.id !== "string") {
        errors.push(`Step ${index + 1} must have a valid id`);
      }
      if (!step.title || typeof step.title !== "string") {
        errors.push(`Step ${index + 1} must have a valid title`);
      }
      if (!step.content || typeof step.content !== "string") {
        errors.push(`Step ${index + 1} must have valid content`);
      }
      if (typeof step.order !== "number" || step.order < 0) {
        errors.push(`Step ${index + 1} must have a valid order`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an exercise object.
 */
export function validateExercise(exercise: Exercise): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!exercise.id || typeof exercise.id !== "string") {
    errors.push("Exercise must have a valid id");
  }
  if (!exercise.title || typeof exercise.title !== "string") {
    errors.push("Exercise must have a valid title");
  }
  if (!exercise.description || typeof exercise.description !== "string") {
    errors.push("Exercise must have a valid description");
  }
  if (!exercise.instruction || typeof exercise.instruction !== "string") {
    errors.push("Exercise must have valid instructions");
  }
  if (!exercise.starterCode || typeof exercise.starterCode !== "string") {
    errors.push("Exercise must have starter code");
  }
  if (!exercise.language || typeof exercise.language !== "string") {
    errors.push("Exercise must have a valid language");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Factory function to create a tutorial with required fields.
 */
export function createTutorial(
  data: Omit<
    Tutorial,
    "id" | "steps" | "learningObjectives" | "estimatedMinutes"
  >
): Tutorial {
  const id = generateId();
  const steps: TutorialStep[] = [];
  const learningObjectives: string[] = [];
  const estimatedMinutes = data.estimatedMinutes || 30;

  return {
    ...data,
    id,
    steps,
    learningObjectives,
    estimatedMinutes,
  };
}

/**
 * Factory function to create a tutorial step.
 */
export function createTutorialStep(
  data: Omit<TutorialStep, "id" | "order">
): TutorialStep {
  return {
    ...data,
    id: generateId(),
    order: 0, // Should be set when adding to tutorial
  };
}

/**
 * Factory function to create an exercise.
 */
export function createExercise(
  data: Omit<Exercise, "id">
): Exercise {
  return {
    ...data,
    id: generateId(),
  };
}

/**
 * Generates a unique ID for tutorials, steps, and exercises.
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculates total reading time for a tutorial (steps + exercises).
 */
export function calculateTutorialTime(tutorial: Tutorial): number {
  let totalMinutes = tutorial.estimatedMinutes;

  // Add time for exercises (15 minutes per exercise with a solution)
  tutorial.steps.forEach((step) => {
    if (step.exercise?.solution) {
      totalMinutes += 15;
    }
  });

  return totalMinutes;
}

/**
 * Gets all exercises from a tutorial.
 */
export function getTutorialExercises(tutorial: Tutorial): Exercise[] {
  const exercises: Exercise[] = [];

  tutorial.steps.forEach((step) => {
    if (step.exercise) {
      exercises.push(step.exercise);
    }
  });

  return exercises;
}

/**
 * Checks if a tutorial has a specific prerequisite.
 */
export function hasPrerequisite(
  tutorial: Tutorial,
  prerequisiteSlug: string
): boolean {
  return tutorial.prerequisites?.includes(prerequisiteSlug) ?? false;
}

/**
 * Gets tutorials by difficulty level.
 */
export function getTutorialsByDifficulty(
  tutorials: Tutorial[],
  difficulty: DifficultyLevel
): Tutorial[] {
  return tutorials.filter((t) => t.difficulty === difficulty);
}

/**
 * Gets tutorials by tag.
 */
export function getTutorialsByTag(
  tutorials: Tutorial[],
  tag: string
): Tutorial[] {
  return tutorials.filter((t) => t.tags?.includes(tag));
}

/**
 * Generates a tutorial completion certificate data.
 */
export function generateCertificateData(tutorial: Tutorial, userName: string) {
  return {
    tutorialId: tutorial.id,
    tutorialTitle: tutorial.title,
    userName,
    completionDate: new Date().toISOString(),
    difficulty: tutorial.difficulty,
    estimatedMinutes: calculateTutorialTime(tutorial),
    objectivesAchieved: tutorial.learningObjectives,
  };
}

/**
 * Validates code output against expected output.
 */
export function validateOutput(
  actualOutput: string,
  expectedOutput: string | string[]
): boolean {
  if (Array.isArray(expectedOutput)) {
    const actualLines = actualOutput
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (actualLines.length !== expectedOutput.length) {
      return false;
    }

    return actualLines.every((line, index) => line === expectedOutput[index]);
  }

  return actualOutput.trim() === expectedOutput.trim();
}

/**
 * Formats a hint for display (show progressively more detail).
 */
export function formatHint(hint: string, level: number = 1): string {
  const sentences = hint.match(/[^.!?]+[.!?]+/g) || [hint];

  if (level >= sentences.length) {
    return hint;
  }

  return sentences.slice(0, level).join(" ");
}

/**
 * Creates an interactive example object.
 */
export function createInteractiveExample(
  data: Omit<InteractiveExample, "id">
): InteractiveExample {
  return {
    ...data,
    id: generateId(),
  };
}

/**
 * Validates an interactive example.
 */
export function validateInteractiveExample(
  example: InteractiveExample
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!example.id || typeof example.id !== "string") {
    errors.push("Example must have a valid id");
  }
  if (!example.title || typeof example.title !== "string") {
    errors.push("Example must have a valid title");
  }
  if (!example.code || typeof example.code !== "string") {
    errors.push("Example must have code");
  }
  if (!example.language || typeof example.language !== "string") {
    errors.push("Example must have a valid language");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generates a tutorial progress summary.
 */
export function generateProgressSummary(
  tutorial: Tutorial,
  completedSteps: Set<string>
): {
  totalSteps: number;
  completedSteps: number;
  percentageComplete: number;
  remainingSteps: number;
} {
  const totalSteps = tutorial.steps.length;
  const completed = completedSteps.size;
  const percentage = totalSteps > 0 ? (completed / totalSteps) * 100 : 0;

  return {
    totalSteps,
    completedSteps: completed,
    percentageComplete: Math.round(percentage),
    remainingSteps: totalSteps - completed,
  };
}
