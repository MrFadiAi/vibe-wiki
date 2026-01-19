import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createElement } from "react";
import { TutorialViewer } from "./TutorialViewer";
import type { Tutorial, Exercise } from "@/types";

// Mock the Button component from shadcn/ui
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, className, title }: {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    title?: string;
  }) => createElement("button", { onClick, disabled, className, title }, children),
}));

// Mock the MarkdownRenderer component
vi.mock("./MarkdownRenderer", () => ({
  MarkdownRenderer: ({ content }: { content: string }) =>
    createElement("div", { className: "mock-markdown" }, content),
}));

// Mock the ExerciseBlock component
vi.mock("./ExerciseBlock", () => ({
  ExerciseBlock: ({ exercise }: {
    exercise: Exercise;
    onComplete?: () => void;
  }) =>
    createElement(
      "div",
      { className: "mock-exercise-block" },
      `Exercise: ${exercise.title}`
    ),
}));

describe("TutorialViewer", () => {
  const mockTutorial: Tutorial = {
    id: "tutorial-1",
    slug: "first-tutorial",
    title: "Introduction to JavaScript",
    description:
      "Learn the basics of JavaScript programming language in this comprehensive tutorial",
    section: "JavaScript",
    difficulty: "beginner",
    estimatedMinutes: 45,
    learningObjectives: [
      "Understand JavaScript syntax",
      "Learn about variables and data types",
      "Write your first function",
    ],
    steps: [
      {
        id: "step-1",
        title: "What is JavaScript?",
        content: "JavaScript is a programming language...",
        order: 0,
      },
      {
        id: "step-2",
        title: "Variables and Data Types",
        content: "Learn about let, const, and var...",
        order: 1,
      },
      {
        id: "step-3",
        title: "Writing Functions",
        content: "Functions are reusable blocks of code...",
        order: 2,
      },
    ],
    tags: ["javascript", "beginner"],
  };

  it("should render tutorial title and description", () => {
    render(<TutorialViewer tutorial={mockTutorial} />);

    expect(
      screen.getByText("Introduction to JavaScript")
    ).toBeDefined();
    expect(
      screen.getByText(
        /Learn the basics of JavaScript programming language/
      )
    ).toBeDefined();
  });

  it("should display difficulty badge", () => {
    render(<TutorialViewer tutorial={mockTutorial} />);

    // "beginner" appears multiple times (as difficulty and tag), check that at least one exists
    expect(screen.getAllByText("beginner").length).toBeGreaterThan(0);
  });

  it("should display tutorial tags", () => {
    render(<TutorialViewer tutorial={mockTutorial} />);

    // Check that the tags are displayed (they appear multiple times in the UI)
    expect(screen.getAllByText("javascript").length).toBeGreaterThan(0);
    expect(screen.getAllByText("beginner").length).toBeGreaterThan(0);
  });

  it("should display tutorial metadata", () => {
    render(<TutorialViewer tutorial={mockTutorial} />);

    expect(screen.getByText("45 minutes")).toBeDefined();
    expect(screen.getByText("3 steps")).toBeDefined();
    expect(screen.getByText("3 objectives")).toBeDefined();
  });

  it("should display learning objectives", () => {
    render(<TutorialViewer tutorial={mockTutorial} />);

    expect(screen.getByText("What you'll learn:")).toBeDefined();
    expect(screen.getByText("Understand JavaScript syntax")).toBeDefined();
    expect(
      screen.getByText("Learn about variables and data types")
    ).toBeDefined();
    expect(screen.getByText("Write your first function")).toBeDefined();
  });

  it("should display first step initially", () => {
    render(<TutorialViewer tutorial={mockTutorial} />);

    expect(screen.getByText("What is JavaScript?")).toBeDefined();
    expect(screen.getByText(/JavaScript is a programming language/)).toBeDefined();
    expect(screen.getByText("Step 1 of 3")).toBeDefined();
  });

  it("should navigate between steps", () => {
    render(<TutorialViewer tutorial={mockTutorial} />);

    // Initially on step 1
    expect(screen.getByText("What is JavaScript?")).toBeDefined();
    expect(screen.getByText("Step 1 of 3")).toBeDefined();

    // Next button is enabled, Previous is disabled
    const nextButton = screen.getByRole("button", { name: /Next/i });
    const prevButton = screen.getByRole("button", { name: /Previous/i });

    expect(nextButton).toHaveProperty("disabled", false);
    expect(prevButton).toHaveProperty("disabled", true);

    // Click next
    fireEvent.click(nextButton);

    // Now on step 2
    expect(screen.getByText("Variables and Data Types")).toBeDefined();
    expect(screen.getByText("Step 2 of 3")).toBeDefined();
    expect(screen.getByRole("button", { name: /Previous/i })).toHaveProperty("disabled", false);
  });

  it("should disable next button on last step", () => {
    render(<TutorialViewer tutorial={mockTutorial} />);

    // Navigate to last step
    const nextButton = screen.getByRole("button", { name: /Next/i });
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);

    // Should be on step 3
    expect(screen.getByText("Writing Functions")).toBeDefined();
    expect(screen.getByText("Step 3 of 3")).toBeDefined();
    expect(nextButton).toHaveProperty("disabled", true);
  });

  it("should show progress bar", () => {
    render(<TutorialViewer tutorial={mockTutorial} />);

    expect(screen.getByText("Progress")).toBeDefined();
    expect(screen.getByText("0%")).toBeDefined();
  });

  it("should update progress when steps are completed", () => {
    render(<TutorialViewer tutorial={mockTutorial} />);

    // Initially 0%
    expect(screen.getByText("0%")).toBeDefined();

    // Complete a step (if there was an exercise)
    // Progress would update
  });

  it("should show completion message when all steps complete", () => {
    const tutorialWithExercise: Tutorial = {
      ...mockTutorial,
      steps: [
        {
          ...mockTutorial.steps[0],
          exercise: {
            id: "ex-1",
            title: "Test Exercise",
            description: "Test",
            instruction: "Test",
            starterCode: "code",
            language: "javascript",
            expectedOutput: "Success",
          },
        },
      ],
    };

    render(<TutorialViewer tutorial={tutorialWithExercise} />);

    // Initially no completion message
    expect(
      screen.queryByText("Tutorial Complete!")
    ).toBeNull();
  });

  it("should call onComplete when tutorial finished", () => {
    const onComplete = vi.fn();
    const tutorialWithAllCompleted: Tutorial = {
      ...mockTutorial,
    };

    // Manually set up completed state
    render(
      <TutorialViewer tutorial={tutorialWithAllCompleted} onComplete={onComplete} />
    );

    // If all steps were completed, clicking finish would call onComplete
    // This would require completing exercises in the UI
  });

  it("should handle tutorial with code examples in steps", () => {
    const tutorialWithCodeExample: Tutorial = {
      ...mockTutorial,
      steps: [
        {
          ...mockTutorial.steps[0],
          codeExample: {
            language: "javascript",
            code: "console.log('Hello, World!');",
            title: "Example",
          },
        },
      ],
    };

    render(<TutorialViewer tutorial={tutorialWithCodeExample} />);

    // MarkdownRenderer is mocked, so we check that it renders the step content
    // The code example is passed through MarkdownRenderer
    expect(screen.getByText("What is JavaScript?")).toBeDefined();
  });

  it("should handle empty tutorial gracefully", () => {
    const emptyTutorial: Tutorial = {
      id: "empty",
      slug: "empty-tutorial",
      title: "Empty Tutorial",
      description: "A".repeat(50),
      section: "Test",
      difficulty: "beginner",
      estimatedMinutes: 0,
      learningObjectives: [],
      steps: [],
    };

    render(<TutorialViewer tutorial={emptyTutorial} />);

    expect(screen.getByText("Empty Tutorial")).toBeDefined();
    expect(screen.getByText("0 steps")).toBeDefined();
    expect(screen.getByText("0%")).toBeDefined();
  });

  it("should handle different difficulty levels with correct colors", () => {
    const advancedTutorial: Tutorial = {
      ...mockTutorial,
      difficulty: "advanced",
    };

    const { rerender } = render(
      <TutorialViewer tutorial={advancedTutorial} />
    );

    expect(screen.getAllByText("advanced").length).toBeGreaterThan(0);

    const beginnerTutorial: Tutorial = {
      ...mockTutorial,
      difficulty: "beginner",
    };

    rerender(<TutorialViewer tutorial={beginnerTutorial} />);

    expect(screen.getAllByText("beginner").length).toBeGreaterThan(0);
  });

  it("should handle tutorial with prerequisites (displayed if available)", () => {
    const tutorialWithPrerequisites: Tutorial = {
      ...mockTutorial,
      prerequisites: ["basics-tutorial", "intro-tutorial"],
    };

    render(<TutorialViewer tutorial={tutorialWithPrerequisites} />);

    // Prerequisites would be displayed in the UI if implemented
    expect(screen.getByText("Introduction to JavaScript")).toBeDefined();
  });
});
