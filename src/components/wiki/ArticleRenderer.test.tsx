/**
 * ArticleRenderer Tests
 * Tests for article rendering with diagram integration
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleRenderer, SimpleArticleRenderer } from "./ArticleRenderer";
import type { ArticleDiagram } from "@/types";

// Mock the diagram registry
vi.mock("@/data/diagram-registry", () => ({
  getDiagramByFilename: vi.fn((filename: string) => {
    const mockRegistry: Record<string, { altAr: string; captionAr: string; titleAr: string }> = {
      "test-diagram.svg": {
        altAr: "اختبار رسم بياني",
        captionAr: "الشكل ١: رسم بياني للاختبار",
        titleAr: "رسم بياني للاختبار",
      },
      "workflow-vibecoding.svg": {
        altAr: "سير عمل البرمجة بالإحساس",
        captionAr: "الشكل ٢: سير عمل البرمجة بالإحساس",
        titleAr: "سير عمل البرمجة بالإحساس",
      },
    };

    return mockRegistry[filename] || null;
  }),
  isPriorityDiagram: vi.fn(() => false),
}));

// Mock SVGDiagram component
vi.mock("./SVGDiagram", () => ({
  SVGDiagram: ({ diagram, priority }: { diagram: unknown; priority?: boolean }) => (
    <div data-testid="svg-diagram" data-priority={priority}>
      <img src={(diagram as { src: string }).src} alt={(diagram as { alt: string }).alt} />
      <figcaption>{(diagram as { caption: string }).caption}</figcaption>
    </div>
  ),
}));

// Mock MarkdownRenderer
vi.mock("./MarkdownRenderer", () => ({
  MarkdownRenderer: ({ content, className }: { content: string; className?: string }) => (
    <div className={className} data-testid="markdown-renderer">
      {content}
    </div>
  ),
}));

describe("ArticleRenderer", () => {
  const mockContent = `
# Introduction

This is the introduction content.

## Section 1

This is section 1 content.

## Section 2

This is section 2 content.
  `.trim();

  describe("Basic Rendering", () => {
    it("should render markdown content without diagrams", () => {
      render(<ArticleRenderer content={mockContent} />);

      const renderer = screen.getByTestId("markdown-renderer");
      expect(renderer).toBeInTheDocument();
      expect(renderer.textContent).toContain("Introduction");
    });

    it("should render with custom className", () => {
      render(<ArticleRenderer content={mockContent} className="custom-class" />);

      const article = screen.getByTestId("markdown-renderer").closest("article");
      expect(article).toHaveClass("custom-class");
    });
  });

  describe("Diagram Integration", () => {
    it("should render diagrams with 'inline' position after specified section", () => {
      const diagrams: ArticleDiagram[] = [
        {
          id: "test-1",
          filename: "test-diagram.svg",
          alt: "Test diagram",
          caption: "Figure 1: Test",
          position: "inline",
          sectionHeading: "Section 1",
        },
      ];

      render(<ArticleRenderer content={mockContent} diagrams={diagrams} />);

      const diagramsElements = screen.getAllByTestId("svg-diagram");
      expect(diagramsElements).toHaveLength(1);
    });

    it("should render diagrams with 'before-section' position", () => {
      const diagrams: ArticleDiagram[] = [
        {
          id: "test-2",
          filename: "test-diagram.svg",
          alt: "Test diagram",
          caption: "Figure 2: Test",
          position: "before-section",
          sectionHeading: "Section 1",
        },
      ];

      render(<ArticleRenderer content={mockContent} diagrams={diagrams} />);

      const diagramsElements = screen.getAllByTestId("svg-diagram");
      expect(diagramsElements).toHaveLength(1);
    });

    it("should render diagrams with 'after-section' position", () => {
      const diagrams: ArticleDiagram[] = [
        {
          id: "test-3",
          filename: "test-diagram.svg",
          alt: "Test diagram",
          caption: "Figure 3: Test",
          position: "after-section",
          sectionHeading: "Section 1",
        },
      ];

      render(<ArticleRenderer content={mockContent} diagrams={diagrams} />);

      const diagramsElements = screen.getAllByTestId("svg-diagram");
      expect(diagramsElements).toHaveLength(1);
    });

    it("should render multiple diagrams in correct order", () => {
      const diagrams: ArticleDiagram[] = [
        {
          id: "test-1",
          filename: "test-diagram.svg",
          alt: "Test diagram 1",
          caption: "Figure 1: Test 1",
          position: "before-section",
          sectionHeading: "Section 1",
        },
        {
          id: "test-2",
          filename: "test-diagram.svg",
          alt: "Test diagram 2",
          caption: "Figure 2: Test 2",
          position: "after-section",
          sectionHeading: "Section 1",
        },
      ];

      render(<ArticleRenderer content={mockContent} diagrams={diagrams} />);

      const diagramsElements = screen.getAllByTestId("svg-diagram");
      expect(diagramsElements).toHaveLength(2);
    });

    it("should pass priority prop for priority diagrams", () => {
      const diagrams: ArticleDiagram[] = [
        {
          id: "test-priority",
          filename: "test-diagram.svg",
          alt: "Test priority diagram",
          caption: "Figure P: Priority Test",
          position: "inline",
          sectionHeading: "Section 1",
          priority: true,
        },
      ];

      render(<ArticleRenderer content={mockContent} diagrams={diagrams} />);

      const diagramElement = screen.getByTestId("svg-diagram");
      expect(diagramElement).toHaveAttribute("data-priority", "true");
    });
  });

  describe("Fallback Behavior", () => {
    it("should render unmatched diagrams at the end", () => {
      const diagrams: ArticleDiagram[] = [
        {
          id: "test-unmatched",
          filename: "test-diagram.svg",
          alt: "Test unmatched diagram",
          caption: "Figure X: Unmatched",
          position: "after-section",
          sectionHeading: "NonExistent Section",
        },
      ];

      render(<ArticleRenderer content={mockContent} diagrams={diagrams} />);

      const diagramsElements = screen.getAllByTestId("svg-diagram");
      expect(diagramsElements).toHaveLength(1);
    });

    it("should handle empty diagrams array", () => {
      render(<ArticleRenderer content={mockContent} diagrams={[]} />);

      const diagramsElements = screen.queryByTestId("svg-diagram");
      expect(diagramsElements).not.toBeInTheDocument();
    });
  });
});

describe("SimpleArticleRenderer", () => {
  const mockContent = "# Simple Test Content\n\nThis is a simple test.";

  it("should render content without diagrams when diagrams is empty", () => {
    render(<SimpleArticleRenderer content={mockContent} />);

    const renderer = screen.getByTestId("markdown-renderer");
    expect(renderer).toBeInTheDocument();
    expect(renderer.textContent).toContain("Simple Test Content");
  });

  it("should render all diagrams before content", () => {
    const diagrams: ArticleDiagram[] = [
      {
        id: "simple-1",
        filename: "test-diagram.svg",
        alt: "Test diagram 1",
        caption: "Figure 1: Simple Test 1",
      },
      {
        id: "simple-2",
        filename: "test-diagram.svg",
        alt: "Test diagram 2",
        caption: "Figure 2: Simple Test 2",
      },
    ];

    render(<SimpleArticleRenderer content={mockContent} diagrams={diagrams} />);

    const diagramsElements = screen.getAllByTestId("svg-diagram");
    expect(diagramsElements).toHaveLength(2);
  });

  it("should handle missing diagram entries gracefully", () => {
    const diagrams: ArticleDiagram[] = [
      {
        id: "missing",
        filename: "nonexistent-diagram.svg",
        alt: "Missing diagram",
        caption: "This diagram does not exist in registry",
      },
    ];

    render(<SimpleArticleRenderer content={mockContent} diagrams={diagrams} />);

    const diagramsElements = screen.queryByTestId("svg-diagram");
    expect(diagramsElements).not.toBeInTheDocument();
  });
});
