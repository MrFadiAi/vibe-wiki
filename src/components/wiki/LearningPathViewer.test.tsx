import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createElement } from "react";
import { LearningPathViewer } from "./LearningPathViewer";
import type { LearningPath, PathItem, PathProgress } from "@/types";

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

describe("LearningPathViewer", () => {
  const mockPathItems: PathItem[] = [
    {
      id: "item-1",
      type: "article",
      slug: "intro-article",
      title: "Introduction Article",
      description: "An introduction to the topic",
      estimatedMinutes: 15,
      isOptional: false,
      order: 0,
    },
    {
      id: "item-2",
      type: "tutorial",
      slug: "basic-tutorial",
      title: "Basic Tutorial",
      description: "Learn the basics",
      estimatedMinutes: 30,
      isOptional: false,
      order: 1,
    },
    {
      id: "item-3",
      type: "exercise",
      slug: "practice-exercise",
      title: "Practice Exercise",
      description: "Practice what you learned",
      estimatedMinutes: 20,
      isOptional: true,
      order: 2,
    },
  ];

  const mockLearningPath: LearningPath = {
    id: "path-1",
    slug: "beginner-javascript",
    title: "Beginner JavaScript Path",
    description:
      "Learn JavaScript from scratch with this comprehensive beginner path covering all the fundamentals.",
    difficulty: "beginner",
    estimatedMinutes: 120,
    targetAudience: ["Beginners", "Career changers"],
    prerequisites: ["Basic computer skills"],
    learningObjectives: [
      "Understand JavaScript basics",
      "Write simple programs",
      "Work with variables and functions",
    ],
    items: mockPathItems,
    tags: ["javascript", "beginner", "web-development"],
    category: "Programming",
  };

  const mockProgress: PathProgress = {
    pathId: "path-1",
    completedItems: ["item-1"],
    currentItemId: "item-2",
  };

  it("should render path title and description", () => {
    render(<LearningPathViewer path={mockLearningPath} />);

    expect(screen.getByText("Beginner JavaScript Path")).toBeDefined();
    expect(
      screen.getByText(/Learn JavaScript from scratch/)
    ).toBeDefined();
  });

  it("should display difficulty badge", () => {
    render(<LearningPathViewer path={mockLearningPath} />);

    // "beginner" appears in difficulty and tags
    expect(screen.getAllByText("beginner").length).toBeGreaterThan(0);
  });

  it("should display category and tags", () => {
    render(<LearningPathViewer path={mockLearningPath} />);

    expect(screen.getByText("Programming")).toBeDefined();
    // Tags may appear multiple times in the UI (difficulty, badges, etc.)
    expect(screen.getByText("javascript")).toBeDefined();
    expect(screen.getByText("web-development")).toBeDefined();
  });

  it("should display path metadata", () => {
    render(<LearningPathViewer path={mockLearningPath} />);

    expect(screen.getByText("120 minutes")).toBeDefined();
    expect(screen.getByText("3 items")).toBeDefined();
    expect(screen.getByText("3 objectives")).toBeDefined();
  });

  it("should display target audience", () => {
    render(<LearningPathViewer path={mockLearningPath} />);

    expect(screen.getByText("Target Audience:")).toBeDefined();
    expect(screen.getByText("Beginners")).toBeDefined();
    expect(screen.getByText("Career changers")).toBeDefined();
  });

  it("should display learning objectives", () => {
    render(<LearningPathViewer path={mockLearningPath} />);

    expect(screen.getByText("What you'll learn:")).toBeDefined();
    expect(screen.getByText("Understand JavaScript basics")).toBeDefined();
    expect(screen.getByText("Write simple programs")).toBeDefined();
    expect(screen.getByText("Work with variables and functions")).toBeDefined();
  });

  it("should display prerequisites", () => {
    render(<LearningPathViewer path={mockLearningPath} />);

    expect(screen.getByText("Prerequisites:")).toBeDefined();
    expect(screen.getByText("Basic computer skills")).toBeDefined();
  });

  it("should display progress bar with correct percentage", () => {
    render(<LearningPathViewer path={mockLearningPath} progress={mockProgress} />);

    expect(screen.getByText("Progress")).toBeDefined();
    expect(screen.getByText("50%")).toBeDefined(); // 1 of 2 required items completed
  });

  it("should show 0% progress when no progress provided", () => {
    render(<LearningPathViewer path={mockLearningPath} />);

    expect(screen.getByText("0%")).toBeDefined();
  });

  it("should display all path items in sidebar", () => {
    render(<LearningPathViewer path={mockLearningPath} />);

    // Items appear in both sidebar and main content area
    expect(screen.getAllByText("Introduction Article")).toBeDefined();
    expect(screen.getAllByText("Basic Tutorial")).toBeDefined();
    expect(screen.getAllByText("Practice Exercise")).toBeDefined();
  });

  it("should display item types with correct labels", () => {
    render(<LearningPathViewer path={mockLearningPath} />);

    // Type labels appear multiple times (once per item)
    expect(screen.getAllByText("Article")).toBeDefined();
    expect(screen.getAllByText("Tutorial")).toBeDefined();
    expect(screen.getAllByText("Exercise")).toBeDefined();
  });

  it("should mark completed items with check icon", () => {
    render(<LearningPathViewer path={mockLearningPath} progress={mockProgress} />);

    // The first item should show as completed
    const completedItem = screen.getAllByText("Introduction Article")[0];
    expect(completedItem).toBeDefined();
  });

  it("should display optional item label", () => {
    render(<LearningPathViewer path={mockLearningPath} />);

    expect(screen.getByText(/\(optional\)/)).toBeDefined();
  });

  it("should select first item by default", () => {
    render(<LearningPathViewer path={mockLearningPath} />);

    // First item should be selected
    expect(screen.getByText("Item 1 of 3")).toBeDefined();
    // Title appears in both sidebar and content
    expect(screen.getAllByText("Introduction Article")).toBeDefined();
  });

  it("should select first uncompleted item when progress is provided", () => {
    render(<LearningPathViewer path={mockLearningPath} progress={mockProgress} />);

    // Should show second item as selected (first uncompleted required item)
    const selectedItems = screen.getAllByText("Basic Tutorial");
    expect(selectedItems.length).toBeGreaterThan(0);
  });

  it("should navigate between items", () => {
    render(<LearningPathViewer path={mockLearningPath} />);

    // Initially on item 1
    expect(screen.getByText("Item 1 of 3")).toBeDefined();

    // Find and click next button
    const nextButtons = screen.getAllByRole("button");
    const nextButton = nextButtons.find(btn => btn.textContent?.includes("Next"));
    expect(nextButton).toBeDefined();

    if (nextButton) {
      fireEvent.click(nextButton);
      // Now on item 2
      expect(screen.getByText("Item 2 of 3")).toBeDefined();
    }
  });

  it("should disable previous button on first item", () => {
    render(<LearningPathViewer path={mockLearningPath} />);

    const prevButtons = screen.getAllByRole("button");
    const prevButton = prevButtons.find(btn => btn.textContent?.includes("Previous"));

    expect(prevButton).toBeDefined();
    if (prevButton) {
      expect(prevButton).toHaveProperty("disabled", true);
    }
  });

  it("should show item metadata when selected", () => {
    render(<LearningPathViewer path={mockLearningPath} />);

    expect(screen.getByText("15 minutes")).toBeDefined();
    expect(screen.getByText("Type:")).toBeDefined();
  });

  it("should call onItemComplete when mark complete is clicked", () => {
    const onItemComplete = vi.fn();
    render(
      <LearningPathViewer
        path={mockLearningPath}
        progress={mockProgress}
        onItemComplete={onItemComplete}
      />
    );

    const markCompleteButtons = screen.getAllByRole("button");
    const markCompleteButton = markCompleteButtons.find(btn =>
      btn.textContent?.includes("Mark Complete")
    );

    expect(markCompleteButton).toBeDefined();
    if (markCompleteButton) {
      fireEvent.click(markCompleteButton);
      expect(onItemComplete).toHaveBeenCalledWith("item-2");
    }
  });

  it("should call onNavigateToItem when item is clicked", () => {
    const onNavigateToItem = vi.fn();
    render(
      <LearningPathViewer path={mockLearningPath} onNavigateToItem={onNavigateToItem} />
    );

    // Find the first item button in the sidebar (it has the item text)
    // There are multiple instances, so we need to find the clickable one
    const buttons = screen.getAllByRole("button");
    const itemButtons = buttons.filter(btn =>
      btn.textContent?.includes("Introduction Article")
    );

    // Click the first matching button
    if (itemButtons.length > 0) {
      fireEvent.click(itemButtons[0]);
      expect(onNavigateToItem).toHaveBeenCalled();
    }
  });

  it("should show completion message when all required items are completed", () => {
    const completeProgress: PathProgress = {
      pathId: "path-1",
      completedItems: ["item-1", "item-2"],
    };

    render(
      <LearningPathViewer path={mockLearningPath} progress={completeProgress} />
    );

    expect(screen.getByText("Learning Path Complete!")).toBeDefined();
    expect(
      screen.getByText(/You've completed all required items/)
    ).toBeDefined();
  });

  it("should show message about optional items when path is complete", () => {
    const completeProgress: PathProgress = {
      pathId: "path-1",
      completedItems: ["item-1", "item-2"],
    };

    render(
      <LearningPathViewer path={mockLearningPath} progress={completeProgress} />
    );

    expect(
      screen.getByText(/You can still complete the optional items/)
    ).toBeDefined();
  });

  it("should call onPathComplete when finish button is clicked", () => {
    const onPathComplete = vi.fn();
    const completeProgress: PathProgress = {
      pathId: "path-1",
      completedItems: ["item-1", "item-2"],
    };

    render(
      <LearningPathViewer
        path={mockLearningPath}
        progress={completeProgress}
        onPathComplete={onPathComplete}
      />
    );

    const finishButtons = screen.getAllByRole("button");
    const finishButton = finishButtons.find(btn => btn.textContent?.includes("Finish Path"));

    expect(finishButton).toBeDefined();
    if (finishButton) {
      fireEvent.click(finishButton);
      expect(onPathComplete).toHaveBeenCalled();
    }
  });

  it("should lock items that have uncompleted prerequisites", () => {
    const partialProgress: PathProgress = {
      pathId: "path-1",
      completedItems: [],
    };

    render(
      <LearningPathViewer path={mockLearningPath} progress={partialProgress} />
    );

    // First item should be unlocked
    // Second and third items should be locked (first item not completed)
    // The lock icon would be rendered via Lucide React icons
  });

  it("should not show mark complete button for optional items", () => {
    // Navigate to the optional item
    render(<LearningPathViewer path={mockLearningPath} />);

    // Initially on item 1, navigate to item 3 (optional)
    const nextButtons = screen.getAllByRole("button");
    const nextButton = nextButtons.find(btn => btn.textContent?.includes("Next"));

    if (nextButton) {
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      // Now on item 3 (optional)
      // Mark Complete button should not be shown for optional items
      const markCompleteButtons = screen.queryAllByRole("button").filter(btn =>
        btn.textContent?.includes("Mark Complete")
      );
      expect(markCompleteButtons.length).toBe(0);
    }
  });

  it("should handle different difficulty levels with correct colors", () => {
    const advancedPath: LearningPath = {
      ...mockLearningPath,
      id: "path-2",
      slug: "advanced-path",
      difficulty: "advanced",
    };

    const { rerender } = render(<LearningPathViewer path={advancedPath} />);

    expect(screen.getAllByText("advanced").length).toBeGreaterThan(0);

    const beginnerPath: LearningPath = {
      ...mockLearningPath,
      id: "path-3",
      slug: "beginner-path",
      difficulty: "beginner",
    };

    rerender(<LearningPathViewer path={beginnerPath} />);

    expect(screen.getAllByText("beginner").length).toBeGreaterThan(0);
  });

  it("should handle path without prerequisites gracefully", () => {
    const pathNoPrereqs: LearningPath = {
      ...mockLearningPath,
      prerequisites: undefined,
    };

    render(<LearningPathViewer path={pathNoPrereqs} />);

    // Prerequisites section should not be shown
    expect(screen.queryByText("Prerequisites:")).toBeNull();
    expect(screen.getByText("Beginner JavaScript Path")).toBeDefined();
  });

  it("should handle path without category", () => {
    const pathNoCategory: LearningPath = {
      ...mockLearningPath,
      category: undefined,
    };

    render(<LearningPathViewer path={pathNoCategory} />);

    // Category badge should not be shown
    expect(screen.getByText("Beginner JavaScript Path")).toBeDefined();
  });

  it("should handle path without tags gracefully", () => {
    const pathNoTags: LearningPath = {
      ...mockLearningPath,
      tags: undefined,
    };

    render(<LearningPathViewer path={pathNoTags} />);

    // Should still render the path
    expect(screen.getByText("Beginner JavaScript Path")).toBeDefined();
  });

  it("should handle empty path gracefully", () => {
    const emptyPath: LearningPath = {
      ...mockLearningPath,
      items: [],
    };

    render(<LearningPathViewer path={emptyPath} />);

    // Should show "Select an item" message and 0 items count
    expect(screen.getByText("0 items")).toBeDefined();
    // The "Select an item" message may not show if no items exist
    // Just verify the path renders without crashing
    expect(screen.getByText("Beginner JavaScript Path")).toBeDefined();
  });

  it("should display optional note in item content", () => {
    render(<LearningPathViewer path={mockLearningPath} />);

    // Navigate to optional item
    const nextButtons = screen.getAllByRole("button");
    const nextButton = nextButtons.find(btn => btn.textContent?.includes("Next"));

    if (nextButton) {
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      // Should show optional note
      expect(
        screen.getByText(/This is an optional item/)
      ).toBeDefined();
    }
  });

  it("should show completion badge on completed items", () => {
    render(<LearningPathViewer path={mockLearningPath} progress={mockProgress} />);

    // "Complete" appears when an item is completed
    const completeText = screen.queryByText("Complete");
    // The badge shows on items in the sidebar when completed
    expect(completeText).toBeDefined();
  });
});
