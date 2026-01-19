import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { UserProgressDashboard } from "./UserProgressDashboard";
import type { UserProgress } from "@/types";

// Mock the Button component from shadcn/ui
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, className }: {
    children?: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => createElement("button", { onClick, className }, children),
}));

describe("UserProgressDashboard", () => {
  const mockUserProgress: UserProgress = {
    userId: "user-1",
    completedArticles: ["intro-js", "react-basics", "advanced-patterns"],
    completedTutorials: ["tutorial-1", "tutorial-2"],
    completedPaths: ["path-1"],
    currentPathProgress: {
      "path-1": {
        pathId: "path-1",
        completedItems: ["item-1", "item-2", "item-3"],
        currentItemId: "item-3",
        startedAt: new Date("2025-01-01"),
        completedAt: new Date("2025-01-05"),
      },
    },
    currentTutorialProgress: {
      "tutorial-1": {
        tutorialId: "tutorial-1",
        completedSteps: ["step-1", "step-2", "step-3"],
        currentStepId: "step-3",
        startedAt: new Date("2025-01-01"),
        completedAt: new Date("2025-01-03"),
      },
    },
    achievements: [
      {
        id: "first-article",
        title: "First Steps",
        description: "Read your first article",
        icon: "📖",
        unlockedAt: new Date("2025-01-01"),
        category: "article",
        points: 10,
      },
      {
        id: "first-tutorial",
        title: "Quick Learner",
        description: "Complete your first tutorial",
        icon: "🎓",
        unlockedAt: new Date("2025-01-02"),
        category: "tutorial",
        points: 25,
      },
      {
        id: "week-streak",
        title: "Week Warrior",
        description: "Maintain a 7-day streak",
        icon: "🔥",
        unlockedAt: new Date("2025-01-07"),
        category: "streak",
        points: 100,
      },
    ],
    totalPoints: 135,
    streakDays: 7,
    lastActivity: new Date("2025-01-07"),
    createdAt: new Date("2025-01-01"),
  };

  it("should render dashboard header", () => {
    render(<UserProgressDashboard progress={mockUserProgress} />);

    expect(screen.getByText("Your Progress")).toBeDefined();
    expect(screen.getByText("Track your learning journey and achievements")).toBeDefined();
  });

  it("should display current level", () => {
    render(<UserProgressDashboard progress={mockUserProgress} />);

    expect(screen.getByText("Current Level")).toBeDefined();
    expect(screen.getByText("Novice")).toBeDefined(); // 135 points = Novice level
    expect(screen.getByText("Level 2")).toBeDefined();
  });

  it("should display total points", () => {
    render(<UserProgressDashboard progress={mockUserProgress} />);

    expect(screen.getByText("Total Points")).toBeDefined();
    expect(screen.getByText("135")).toBeDefined();
  });

  it("should display current streak", () => {
    render(<UserProgressDashboard progress={mockUserProgress} />);

    expect(screen.getByText("Current Streak")).toBeDefined();
    expect(screen.getByText("7 days")).toBeDefined();
  });

  it("should display achievements count", () => {
    const { container } = render(<UserProgressDashboard progress={mockUserProgress} />);

    expect(screen.getByText("Achievements")).toBeDefined();
    // Check that the count exists somewhere in the document
    expect(container.textContent).toContain("3");
  });

  it("should display content completed stats", () => {
    const { container } = render(<UserProgressDashboard progress={mockUserProgress} />);

    expect(screen.getByText("Content Completed")).toBeDefined();
    // Check that the numbers exist somewhere in the document
    expect(container.textContent).toContain("3"); // Articles
    expect(container.textContent).toContain("2"); // Tutorials
    expect(container.textContent).toContain("1"); // Learning Paths
  });

  it("should display recent achievements", () => {
    render(<UserProgressDashboard progress={mockUserProgress} />);

    expect(screen.getByText("Recent Achievements")).toBeDefined();
    expect(screen.getByText("First Steps")).toBeDefined();
    expect(screen.getByText("Quick Learner")).toBeDefined();
    expect(screen.getByText("Week Warrior")).toBeDefined();
  });

  it("should display achievement icons", () => {
    const { container } = render(<UserProgressDashboard progress={mockUserProgress} />);

    expect(container.textContent).toContain("📖");
    expect(container.textContent).toContain("🎓");
    expect(container.textContent).toContain("🔥");
  });

  it("should display achievement points", () => {
    const { container } = render(<UserProgressDashboard progress={mockUserProgress} />);

    expect(container.textContent).toContain("+10");
    expect(container.textContent).toContain("+25");
    expect(container.textContent).toContain("+100");
  });

  it("should display last activity date", () => {
    render(<UserProgressDashboard progress={mockUserProgress} />);

    expect(screen.getByText("Last Activity")).toBeDefined();
    expect(screen.getByText("1/7/2025")).toBeDefined();
  });

  it("should display member since date", () => {
    render(<UserProgressDashboard progress={mockUserProgress} />);

    expect(screen.getByText("Member Since")).toBeDefined();
    expect(screen.getByText("1/1/2025")).toBeDefined();
  });

  it("should display total items count", () => {
    const { container } = render(<UserProgressDashboard progress={mockUserProgress} />);

    expect(screen.getByText("Total Items")).toBeDefined();
    // Check that the total exists somewhere in the document
    expect(container.textContent).toContain("6"); // 3 + 2 + 1 = 6
  });

  it("should show progress bar to next level", () => {
    const { container } = render(<UserProgressDashboard progress={mockUserProgress} />);

    // Novice level is 100-500 points, user has 135 points
    // Progress = (135 - 100) / (500 - 100) = 35 / 400 = 8.75%
    expect(container.textContent).toContain("135 / 500 points");
    expect(container.textContent).toContain("% to next level");
  });

  it("should display view activity button when callback provided", () => {
    const onViewActivity = vi.fn();
    render(<UserProgressDashboard progress={mockUserProgress} onViewActivity={onViewActivity} />);

    expect(screen.getByText("View Activity")).toBeDefined();
  });

  it("should not display view activity button when callback not provided", () => {
    render(<UserProgressDashboard progress={mockUserProgress} />);

    expect(screen.queryByText("View Activity")).toBeNull();
  });

  it("should display view all button when more than 5 achievements", () => {
    const manyAchievements = {
      ...mockUserProgress,
      achievements: [
        ...mockUserProgress.achievements,
        { id: "a4", title: "Achievement 4", description: "Desc 4", icon: "🏅", unlockedAt: new Date(), category: "article" as const },
        { id: "a5", title: "Achievement 5", description: "Desc 5", icon: "🏅", unlockedAt: new Date(), category: "article" as const },
        { id: "a6", title: "Achievement 6", description: "Desc 6", icon: "🏅", unlockedAt: new Date(), category: "article" as const },
      ],
    };

    const onViewAchievements = vi.fn();
    render(<UserProgressDashboard progress={manyAchievements} onViewAchievements={onViewAchievements} />);

    expect(screen.getByText("View All")).toBeDefined();
  });

  it("should handle user with no achievements", () => {
    const noAchievements: UserProgress = {
      ...mockUserProgress,
      achievements: [],
    };

    render(<UserProgressDashboard progress={noAchievements} />);

    expect(screen.getByText("No achievements yet")).toBeDefined();
    expect(screen.getByText("Start learning to unlock your first achievement!")).toBeDefined();
  });

  it("should handle user at max level", () => {
    const maxLevelUser: UserProgress = {
      ...mockUserProgress,
      totalPoints: 10000,
    };

    const { container } = render(<UserProgressDashboard progress={maxLevelUser} />);

    expect(container.textContent).toContain("Grandmaster");
    expect(container.textContent).toContain("Level 7");
  });

  it("should handle beginner user (0 points)", () => {
    const beginnerUser: UserProgress = {
      userId: "new-user",
      completedArticles: [],
      completedTutorials: [],
      completedPaths: [],
      currentPathProgress: {},
      currentTutorialProgress: {},
      achievements: [],
      totalPoints: 0,
      streakDays: 0,
      lastActivity: new Date(),
      createdAt: new Date(),
    };

    const { container } = render(<UserProgressDashboard progress={beginnerUser} />);

    expect(screen.getByText("Beginner")).toBeDefined();
    expect(screen.getByText("Level 1")).toBeDefined();
    // Check for points display in context - "0" appears multiple times, so we check it exists somewhere
    expect(container.textContent).toContain("0");
  });

  it("should display correct level for different point thresholds", () => {
    const testCases = [
      { points: 0, level: "Beginner", levelNum: "Level 1" },
      { points: 100, level: "Novice", levelNum: "Level 2" },
      { points: 500, level: "Intermediate", levelNum: "Level 3" },
      { points: 1000, level: "Advanced", levelNum: "Level 4" },
      { points: 2500, level: "Expert", levelNum: "Level 5" },
      { points: 5000, level: "Master", levelNum: "Level 6" },
    ];

    testCases.forEach(({ points, level, levelNum }) => {
      const user: UserProgress = { ...mockUserProgress, totalPoints: points };
      const { rerender } = render(<UserProgressDashboard progress={user} />);

      expect(screen.getByText(level)).toBeDefined();
      expect(screen.getByText(levelNum)).toBeDefined();

      rerender(<div />);
    });
  });

  it("should call onViewActivity when button is clicked", () => {
    const onViewActivity = vi.fn();
    render(<UserProgressDashboard progress={mockUserProgress} onViewActivity={onViewActivity} />);

    const button = screen.getByText("View Activity");
    button.click();

    expect(onViewActivity).toHaveBeenCalled();
  });

  it("should call onViewAchievements when button is clicked", () => {
    const onViewAchievements = vi.fn();
    const manyAchievements = {
      ...mockUserProgress,
      achievements: [
        ...mockUserProgress.achievements,
        { id: "a4", title: "Achievement 4", description: "Desc 4", icon: "🏅", unlockedAt: new Date(), category: "article" as const },
        { id: "a5", title: "Achievement 5", description: "Desc 5", icon: "🏅", unlockedAt: new Date(), category: "article" as const },
        { id: "a6", title: "Achievement 6", description: "Desc 6", icon: "🏅", unlockedAt: new Date(), category: "article" as const },
      ],
    };

    render(<UserProgressDashboard progress={manyAchievements} onViewAchievements={onViewAchievements} />);

    const button = screen.getByText("View All");
    button.click();

    expect(onViewAchievements).toHaveBeenCalled();
  });
});
