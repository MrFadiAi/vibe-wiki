import { describe, it, expect } from "vitest";
import type { Exercise, Tutorial, TutorialStep, DifficultyLevel } from "@/types";
import {
  validateTutorial,
  validateExercise,
  createTutorial,
  createTutorialStep,
  createExercise,
  calculateTutorialTime,
  getTutorialExercises,
  hasPrerequisite,
  getTutorialsByDifficulty,
  getTutorialsByTag,
  generateCertificateData,
  validateOutput,
  formatHint,
  createInteractiveExample,
  validateInteractiveExample,
  generateProgressSummary,
} from "./tutorial-utils";

describe("tutorial-utils", () => {
  describe("validateTutorial", () => {
    it("should validate a correct tutorial", () => {
      const tutorial: Tutorial = {
        id: "test-1",
        slug: "my-first-tutorial",
        title: "My First Tutorial",
        description: "This is a tutorial description that is long enough to pass validation",
        section: "Getting Started",
        difficulty: "beginner",
        estimatedMinutes: 30,
        learningObjectives: ["Learn basics", "Build something"],
        steps: [
          {
            id: "step-1",
            title: "Step 1",
            content: "Content for step 1",
            order: 0,
          },
        ],
      };

      const result = validateTutorial(tutorial);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should reject tutorial with invalid slug format", () => {
      const tutorial: Tutorial = {
        id: "test-1",
        slug: "Invalid_Slug_With_Underscores",
        title: "Tutorial",
        description: "A".repeat(50),
        section: "Test",
        difficulty: "beginner",
        estimatedMinutes: 30,
        learningObjectives: ["Learn"],
        steps: [{ id: "step-1", title: "Step", content: "Content", order: 0 }],
      };

      const result = validateTutorial(tutorial);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Tutorial slug must contain only lowercase letters, numbers, and hyphens"
      );
    });

    it("should reject tutorial with title too short", () => {
      const tutorial: Tutorial = {
        id: "test-1",
        slug: "valid-slug",
        title: "Hi",
        description: "A".repeat(50),
        section: "Test",
        difficulty: "beginner",
        estimatedMinutes: 30,
        learningObjectives: ["Learn"],
        steps: [{ id: "step-1", title: "Step", content: "Content", order: 0 }],
      };

      const result = validateTutorial(tutorial);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Tutorial title must be between 5 and 200 characters"
      );
    });

    it("should reject tutorial with invalid difficulty", () => {
      const tutorial: Tutorial = {
        id: "test-1",
        slug: "valid-slug",
        title: "Valid Title",
        description: "A".repeat(50),
        section: "Test",
        difficulty: "expert" as DifficultyLevel,
        estimatedMinutes: 30,
        learningObjectives: ["Learn"],
        steps: [{ id: "step-1", title: "Step", content: "Content", order: 0 }],
      };

      const result = validateTutorial(tutorial);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Tutorial difficulty must be one of: beginner, intermediate, advanced"
      );
    });

    it("should reject tutorial with no learning objectives", () => {
      const tutorial: Tutorial = {
        id: "test-1",
        slug: "valid-slug",
        title: "Valid Title",
        description: "A".repeat(50),
        section: "Test",
        difficulty: "beginner",
        estimatedMinutes: 30,
        learningObjectives: [],
        steps: [{ id: "step-1", title: "Step", content: "Content", order: 0 }],
      };

      const result = validateTutorial(tutorial);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Tutorial must have at least one learning objective"
      );
    });
  });

  describe("validateExercise", () => {
    it("should validate a correct exercise", () => {
      const exercise: Exercise = {
        id: "ex-1",
        title: "Sum Two Numbers",
        description: "Write a function that sums two numbers",
        instruction: "Create a function called add that takes two parameters",
        starterCode: "function add(a, b) {",
        language: "javascript",
      };

      const result = validateExercise(exercise);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should reject exercise without starter code", () => {
      const exercise: Exercise = {
        id: "ex-1",
        title: "Exercise",
        description: "Description",
        instruction: "Instruction",
        starterCode: "",
        language: "javascript",
      };

      const result = validateExercise(exercise);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Exercise must have starter code");
    });
  });

  describe("createTutorial", () => {
    it("should create a tutorial with generated id and empty arrays", () => {
      const tutorial = createTutorial({
        slug: "test-tutorial",
        title: "Test Tutorial",
        description: "A test tutorial",
        section: "Test",
        difficulty: "beginner",
      });

      expect(tutorial.id).toBeDefined();
      expect(tutorial.slug).toBe("test-tutorial");
      expect(tutorial.steps).toEqual([]);
      expect(tutorial.learningObjectives).toEqual([]);
      expect(tutorial.estimatedMinutes).toBe(30);
    });

    it("should use provided estimatedMinutes", () => {
      const tutorial = createTutorial({
        slug: "test-tutorial",
        title: "Test Tutorial",
        description: "A test tutorial",
        section: "Test",
        difficulty: "beginner",
        estimatedMinutes: 60,
      });

      expect(tutorial.estimatedMinutes).toBe(60);
    });
  });

  describe("createTutorialStep", () => {
    it("should create a step with generated id and order 0", () => {
      const step = createTutorialStep({
        title: "Test Step",
        content: "Step content",
      });

      expect(step.id).toBeDefined();
      expect(step.title).toBe("Test Step");
      expect(step.order).toBe(0);
    });
  });

  describe("createExercise", () => {
    it("should create an exercise with generated id", () => {
      const exercise = createExercise({
        title: "Test Exercise",
        description: "Test description",
        instruction: "Test instruction",
        starterCode: "const x = 1;",
        language: "javascript",
      });

      expect(exercise.id).toBeDefined();
      expect(exercise.title).toBe("Test Exercise");
    });
  });

  describe("calculateTutorialTime", () => {
    it("should return base time for tutorial without exercises", () => {
      const tutorial: Tutorial = {
        id: "t1",
        slug: "test",
        title: "Test",
        description: "A".repeat(50),
        section: "Test",
        difficulty: "beginner",
        estimatedMinutes: 30,
        learningObjectives: ["Learn"],
        steps: [
          { id: "s1", title: "Step 1", content: "Content", order: 0 },
        ],
      };

      expect(calculateTutorialTime(tutorial)).toBe(30);
    });

    it("should add time for exercises with solutions", () => {
      const tutorial: Tutorial = {
        id: "t1",
        slug: "test",
        title: "Test",
        description: "A".repeat(50),
        section: "Test",
        difficulty: "beginner",
        estimatedMinutes: 30,
        learningObjectives: ["Learn"],
        steps: [
          {
            id: "s1",
            title: "Step 1",
            content: "Content",
            order: 0,
            exercise: {
              id: "ex1",
              title: "Exercise",
              description: "Test",
              instruction: "Test",
              starterCode: "code",
              language: "js",
              solution: "solution",
            },
          },
        ],
      };

      // 30 base + 15 for exercise with solution
      expect(calculateTutorialTime(tutorial)).toBe(45);
    });
  });

  describe("getTutorialExercises", () => {
    it("should return all exercises from tutorial steps", () => {
      const exercise1: Exercise = {
        id: "ex1",
        title: "Exercise 1",
        description: "Test",
        instruction: "Test",
        starterCode: "code1",
        language: "js",
      };
      const exercise2: Exercise = {
        id: "ex2",
        title: "Exercise 2",
        description: "Test",
        instruction: "Test",
        starterCode: "code2",
        language: "js",
      };

      const tutorial: Tutorial = {
        id: "t1",
        slug: "test",
        title: "Test",
        description: "A".repeat(50),
        section: "Test",
        difficulty: "beginner",
        estimatedMinutes: 30,
        learningObjectives: ["Learn"],
        steps: [
          { id: "s1", title: "Step 1", content: "Content", order: 0, exercise: exercise1 },
          { id: "s2", title: "Step 2", content: "Content", order: 1, exercise: exercise2 },
        ],
      };

      const exercises = getTutorialExercises(tutorial);
      expect(exercises).toHaveLength(2);
      expect(exercises[0]).toEqual(exercise1);
      expect(exercises[1]).toEqual(exercise2);
    });

    it("should return empty array for tutorial without exercises", () => {
      const tutorial: Tutorial = {
        id: "t1",
        slug: "test",
        title: "Test",
        description: "A".repeat(50),
        section: "Test",
        difficulty: "beginner",
        estimatedMinutes: 30,
        learningObjectives: ["Learn"],
        steps: [
          { id: "s1", title: "Step 1", content: "Content", order: 0 },
        ],
      };

      expect(getTutorialExercises(tutorial)).toEqual([]);
    });
  });

  describe("hasPrerequisite", () => {
    it("should return true when tutorial has the prerequisite", () => {
      const tutorial: Tutorial = {
        id: "t1",
        slug: "test",
        title: "Test",
        description: "A".repeat(50),
        section: "Test",
        difficulty: "beginner",
        estimatedMinutes: 30,
        learningObjectives: ["Learn"],
        steps: [{ id: "s1", title: "Step 1", content: "Content", order: 0 }],
        prerequisites: ["basics-tutorial"],
      };

      expect(hasPrerequisite(tutorial, "basics-tutorial")).toBe(true);
    });

    it("should return false when tutorial does not have the prerequisite", () => {
      const tutorial: Tutorial = {
        id: "t1",
        slug: "test",
        title: "Test",
        description: "A".repeat(50),
        section: "Test",
        difficulty: "beginner",
        estimatedMinutes: 30,
        learningObjectives: ["Learn"],
        steps: [{ id: "s1", title: "Step 1", content: "Content", order: 0 }],
        prerequisites: ["basics-tutorial"],
      };

      expect(hasPrerequisite(tutorial, "advanced-tutorial")).toBe(false);
    });

    it("should return false when tutorial has no prerequisites", () => {
      const tutorial: Tutorial = {
        id: "t1",
        slug: "test",
        title: "Test",
        description: "A".repeat(50),
        section: "Test",
        difficulty: "beginner",
        estimatedMinutes: 30,
        learningObjectives: ["Learn"],
        steps: [{ id: "s1", title: "Step 1", content: "Content", order: 0 }],
      };

      expect(hasPrerequisite(tutorial, "anything")).toBe(false);
    });
  });

  describe("getTutorialsByDifficulty", () => {
    it("should filter tutorials by difficulty", () => {
      const tutorials: Tutorial[] = [
        {
          id: "t1",
          slug: "beginner-1",
          title: "Beginner",
          description: "A".repeat(50),
          section: "Test",
          difficulty: "beginner",
          estimatedMinutes: 30,
          learningObjectives: ["Learn"],
          steps: [{ id: "s1", title: "Step", content: "Content", order: 0 }],
        },
        {
          id: "t2",
          slug: "advanced-1",
          title: "Advanced",
          description: "A".repeat(50),
          section: "Test",
          difficulty: "advanced",
          estimatedMinutes: 60,
          learningObjectives: ["Learn"],
          steps: [{ id: "s1", title: "Step", content: "Content", order: 0 }],
        },
      ];

      const beginnerTutorials = getTutorialsByDifficulty(tutorials, "beginner");
      expect(beginnerTutorials).toHaveLength(1);
      expect(beginnerTutorials[0].difficulty).toBe("beginner");

      const advancedTutorials = getTutorialsByDifficulty(tutorials, "advanced");
      expect(advancedTutorials).toHaveLength(1);
      expect(advancedTutorials[0].difficulty).toBe("advanced");
    });
  });

  describe("getTutorialsByTag", () => {
    it("should filter tutorials by tag", () => {
      const tutorials: Tutorial[] = [
        {
          id: "t1",
          slug: "tutorial-1",
          title: "Tutorial 1",
          description: "A".repeat(50),
          section: "Test",
          difficulty: "beginner",
          estimatedMinutes: 30,
          learningObjectives: ["Learn"],
          steps: [{ id: "s1", title: "Step", content: "Content", order: 0 }],
          tags: ["react", "javascript"],
        },
        {
          id: "t2",
          slug: "tutorial-2",
          title: "Tutorial 2",
          description: "A".repeat(50),
          section: "Test",
          difficulty: "beginner",
          estimatedMinutes: 30,
          learningObjectives: ["Learn"],
          steps: [{ id: "s1", title: "Step", content: "Content", order: 0 }],
          tags: ["python"],
        },
      ];

      const reactTutorials = getTutorialsByTag(tutorials, "react");
      expect(reactTutorials).toHaveLength(1);
      expect(reactTutorials[0].tags).toContain("react");

      const pythonTutorials = getTutorialsByTag(tutorials, "python");
      expect(pythonTutorials).toHaveLength(1);
      expect(pythonTutorials[0].tags).toContain("python");

      const noTutorials = getTutorialsByTag(tutorials, "rust");
      expect(noTutorials).toHaveLength(0);
    });
  });

  describe("generateCertificateData", () => {
    it("should generate certificate data with all required fields", () => {
      const tutorial: Tutorial = {
        id: "t1",
        slug: "test-tutorial",
        title: "Test Tutorial",
        description: "A".repeat(50),
        section: "Test",
        difficulty: "beginner",
        estimatedMinutes: 30,
        learningObjectives: ["Learn basics", "Build app"],
        steps: [
          {
            id: "s1",
            title: "Step 1",
            content: "Content",
            order: 0,
            exercise: {
              id: "ex1",
              title: "Exercise",
              description: "Test",
              instruction: "Test",
              starterCode: "code",
              language: "js",
              solution: "solution",
            },
          },
        ],
      };

      const certificate = generateCertificateData(tutorial, "John Doe");

      expect(certificate.tutorialId).toBe("t1");
      expect(certificate.tutorialTitle).toBe("Test Tutorial");
      expect(certificate.userName).toBe("John Doe");
      expect(certificate.difficulty).toBe("beginner");
      expect(certificate.estimatedMinutes).toBe(45); // 30 + 15 for exercise
      expect(certificate.objectivesAchieved).toEqual([
        "Learn basics",
        "Build app",
      ]);
      expect(certificate.completionDate).toBeDefined();
    });
  });

  describe("validateOutput", () => {
    it("should validate single string output", () => {
      expect(validateOutput("Hello, World!", "Hello, World!")).toBe(true);
      expect(validateOutput("Hello, World!", "Different Output")).toBe(false);
      expect(validateOutput("  Hello, World!  ", "Hello, World!")).toBe(true); // trimmed
    });

    it("should validate array of expected outputs", () => {
      const actual = "Line 1\nLine 2\nLine 3";
      expect(validateOutput(actual, ["Line 1", "Line 2", "Line 3"])).toBe(true);
      expect(validateOutput(actual, ["Line 1", "Line 2"])).toBe(false);
      expect(
        validateOutput("Line 1\nLine 2\n\n", ["Line 1", "Line 2"])
      ).toBe(true); // empty lines filtered
    });

    it("should handle extra whitespace", () => {
      expect(validateOutput("  Hello  ", "Hello")).toBe(true);
      expect(
        validateOutput("  Line 1  \n  Line 2  ", ["Line 1", "Line 2"])
      ).toBe(true);
    });
  });

  describe("formatHint", () => {
    it("should return first sentence for level 1", () => {
      const hint = "Start by defining a function. Then add parameters. Finally return the result.";
      expect(formatHint(hint, 1)).toBe("Start by defining a function.");
    });

    it("should return first two sentences for level 2", () => {
      const hint = "Start by defining a function. Then add parameters. Finally return the result.";
      expect(formatHint(hint, 2)).toBe("Start by defining a function.  Then add parameters.");
    });

    it("should return full hint for level higher than sentence count", () => {
      const hint = "First sentence. Second sentence.";
      expect(formatHint(hint, 5)).toBe(hint);
    });

    it("should return full hint if no sentences found", () => {
      const hint = "No periods here";
      expect(formatHint(hint, 1)).toBe("No periods here");
    });
  });

  describe("createInteractiveExample", () => {
    it("should create an interactive example with generated id", () => {
      const example = createInteractiveExample({
        title: "Example",
        description: "Test",
        code: "console.log('test');",
        language: "javascript",
      });

      expect(example.id).toBeDefined();
      expect(example.title).toBe("Example");
      expect(example.code).toBe("console.log('test');");
    });
  });

  describe("validateInteractiveExample", () => {
    it("should validate a correct interactive example", () => {
      const example = {
        id: "ex-1",
        title: "Example",
        description: "Test",
        code: "console.log('test');",
        language: "javascript",
      };

      const result = validateInteractiveExample(example);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should reject example without code", () => {
      const example = {
        id: "ex-1",
        title: "Example",
        description: "Test",
        code: "",
        language: "javascript",
      };

      const result = validateInteractiveExample(example);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Example must have code");
    });
  });

  describe("generateProgressSummary", () => {
    it("should calculate progress correctly", () => {
      const tutorial: Tutorial = {
        id: "t1",
        slug: "test",
        title: "Test",
        description: "A".repeat(50),
        section: "Test",
        difficulty: "beginner",
        estimatedMinutes: 30,
        learningObjectives: ["Learn"],
        steps: [
          { id: "s1", title: "Step 1", content: "Content", order: 0 },
          { id: "s2", title: "Step 2", content: "Content", order: 1 },
          { id: "s3", title: "Step 3", content: "Content", order: 2 },
          { id: "s4", title: "Step 4", content: "Content", order: 3 },
        ],
      };

      const completed = new Set(["s1", "s3"]);
      const summary = generateProgressSummary(tutorial, completed);

      expect(summary.totalSteps).toBe(4);
      expect(summary.completedSteps).toBe(2);
      expect(summary.percentageComplete).toBe(50);
      expect(summary.remainingSteps).toBe(2);
    });

    it("should handle empty tutorial", () => {
      const tutorial: Tutorial = {
        id: "t1",
        slug: "test",
        title: "Test",
        description: "A".repeat(50),
        section: "Test",
        difficulty: "beginner",
        estimatedMinutes: 30,
        learningObjectives: ["Learn"],
        steps: [],
      };

      const summary = generateProgressSummary(tutorial, new Set());

      expect(summary.totalSteps).toBe(0);
      expect(summary.completedSteps).toBe(0);
      expect(summary.percentageComplete).toBe(0);
      expect(summary.remainingSteps).toBe(0);
    });

    it("should round percentage correctly", () => {
      const tutorial: Tutorial = {
        id: "t1",
        slug: "test",
        title: "Test",
        description: "A".repeat(50),
        section: "Test",
        difficulty: "beginner",
        estimatedMinutes: 30,
        learningObjectives: ["Learn"],
        steps: [
          { id: "s1", title: "Step 1", content: "Content", order: 0 },
          { id: "s2", title: "Step 2", content: "Content", order: 1 },
          { id: "s3", title: "Step 3", content: "Content", order: 2 },
        ],
      };

      // 1/3 = 33.33% -> 33%
      const summary1 = generateProgressSummary(tutorial, new Set(["s1"]));
      expect(summary1.percentageComplete).toBe(33);

      // 2/3 = 66.66% -> 67%
      const summary2 = generateProgressSummary(tutorial, new Set(["s1", "s2"]));
      expect(summary2.percentageComplete).toBe(67);
    });
  });
});
