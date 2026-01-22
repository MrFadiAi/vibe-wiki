"use client";

import React from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { SVGDiagram } from "./SVGDiagram";
import { getDiagramByFilename, isPriorityDiagram } from "@/data/diagram-registry";
import type { ArticleDiagram } from "@/types";

interface ArticleRendererProps {
  content: string;
  diagrams?: ArticleDiagram[];
  className?: string;
}

interface DiagramPosition {
  index: number;
  position: "before" | "after" | "inline";
  heading?: string;
  diagram: ArticleDiagram;
}

/**
 * Parse markdown content and identify headings for diagram placement
 */
type Section = {
  type: "heading" | "content";
  level: number;
  text: string;
  content?: string;
  startIndex: number;
  endIndex: number;
};

function parseMarkdownWithHeadings(content: string): Section[] {
  const lines = content.split("\n");
  const sections: Section[] = [];

  let currentSection: Section | null = null;
  let currentContent = "";
  let startIndex = 0;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      // Save previous section
      if (currentSection) {
        sections.push({
          ...currentSection,
          endIndex: index - 1,
          content: currentContent.trim(),
        });
      }

      // Start new section
      currentSection = {
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
        startIndex: index,
        endIndex: index,
      };
      currentContent = "";
    } else {
      if (currentSection) {
        currentContent += line + "\n";
      } else if (line.trim()) {
        // Content before first heading
        currentSection = {
          type: "content",
          level: 0,
          text: "Introduction",
          startIndex,
          endIndex: index,
        };
        currentContent = line + "\n";
      }
    }
  }

  // Save last section
  if (currentSection) {
    sections.push({
      ...currentSection,
      endIndex: lines.length - 1,
      content: currentContent.trim(),
    });
  }

  return sections;
}

/**
 * Find insertion points for diagrams based on their position settings
 */
function findDiagramInsertionPoints(
  sections: ReturnType<typeof parseMarkdownWithHeadings>,
  diagrams: ArticleDiagram[]
): Array<{
  sectionIndex: number;
  position: "before" | "after" | "inline";
  diagram: ArticleDiagram;
}> {
  const insertionPoints: Array<{
    sectionIndex: number;
    position: "before" | "after" | "inline";
    diagram: ArticleDiagram;
  }> = [];

  diagrams.forEach((diagram) => {
    if (diagram.position === "inline") {
      // Find section by heading text
      if (diagram.sectionHeading) {
        const sectionIndex = sections.findIndex((section) =>
          section.type === "heading" && section.text === diagram.sectionHeading
        );
        if (sectionIndex !== -1) {
          insertionPoints.push({
            sectionIndex,
            position: "after",
            diagram,
          });
        }
      }
    } else if (diagram.position === "before-section") {
      if (diagram.sectionHeading) {
        const sectionIndex = sections.findIndex((section) =>
          section.type === "heading" && section.text === diagram.sectionHeading
        );
        if (sectionIndex !== -1) {
          insertionPoints.push({
            sectionIndex,
            position: "before",
            diagram,
          });
        }
      }
    } else if (diagram.position === "after-section") {
      if (diagram.sectionHeading) {
        const sectionIndex = sections.findIndex((section) =>
          section.type === "heading" && section.text === diagram.sectionHeading
        );
        if (sectionIndex !== -1) {
          insertionPoints.push({
            sectionIndex,
            position: "after",
            diagram,
          });
        }
      }
    }
  });

  // Sort by section index and position (before comes before after)
  insertionPoints.sort((a, b) => {
    if (a.sectionIndex !== b.sectionIndex) {
      return a.sectionIndex - b.sectionIndex;
    }
    return a.position === "before" ? -1 : 1;
  });

  return insertionPoints;
}

/**
 * Convert ArticleDiagram to SVGDiagram format
 */
function convertToSVGDiagram(diagram: ArticleDiagram) {
  const entry = getDiagramByFilename(diagram.filename);

  if (!entry) {
    console.warn(`Diagram not found in registry: ${diagram.filename}`);
    return null;
  }

  return {
    src: `/images/diagrams/${diagram.filename}`,
    alt: diagram.alt || entry.altAr,
    caption: diagram.caption || entry.captionAr,
    title: entry.titleAr,
    description: entry.altAr,
    maxWidth: "3xl" as const,
  };
}

/**
 * ArticleRenderer Component
 * Renders article content with diagrams inserted at appropriate positions
 */
export function ArticleRenderer({
  content,
  diagrams = [],
  className = "",
}: ArticleRendererProps) {
  if (diagrams.length === 0) {
    return <MarkdownRenderer content={content} className={className} />;
  }

  // Parse markdown into sections
  const sections = parseMarkdownWithHeadings(content);

  // Find diagram insertion points
  const insertionPoints = findDiagramInsertionPoints(sections, diagrams);

  // Render sections with diagrams
  const renderedSections: React.ReactNode[] = [];
  const processedDiagramIds = new Set<string>();

  sections.forEach((section, sectionIndex) => {
    // Check for diagrams before this section
    const beforeDiagrams = insertionPoints.filter(
      (ip) => ip.sectionIndex === sectionIndex && ip.position === "before"
    );

    beforeDiagrams.forEach((insertionPoint) => {
      const svgDiagram = convertToSVGDiagram(insertionPoint.diagram);
      if (svgDiagram && !processedDiagramIds.has(insertionPoint.diagram.id)) {
        renderedSections.push(
          <div key={`diagram-before-${sectionIndex}-${insertionPoint.diagram.id}`}>
            <SVGDiagram
              diagram={svgDiagram}
              priority={
                insertionPoint.diagram.priority ||
                isPriorityDiagram(insertionPoint.diagram.filename)
              }
            />
          </div>
        );
        processedDiagramIds.add(insertionPoint.diagram.id);
      }
    });

    // Render the section content
    if (section.content) {
      renderedSections.push(
        <div key={`section-${sectionIndex}`} className="article-section">
          {section.type === "heading" && section.level > 1 && (
            <h2 className={`text-${4 - section.level}xl font-bold mb-4`}>
              {section.text}
            </h2>
          )}
          <MarkdownRenderer content={section.content} />
        </div>
      );
    }

    // Check for diagrams after this section
    const afterDiagrams = insertionPoints.filter(
      (ip) => ip.sectionIndex === sectionIndex && ip.position === "after"
    );

    afterDiagrams.forEach((insertionPoint) => {
      const svgDiagram = convertToSVGDiagram(insertionPoint.diagram);
      if (svgDiagram && !processedDiagramIds.has(insertionPoint.diagram.id)) {
        renderedSections.push(
          <div key={`diagram-after-${sectionIndex}-${insertionPoint.diagram.id}`}>
            <SVGDiagram
              diagram={svgDiagram}
              priority={
                insertionPoint.diagram.priority ||
                isPriorityDiagram(insertionPoint.diagram.filename)
              }
            />
          </div>
        );
        processedDiagramIds.add(insertionPoint.diagram.id);
      }
    });
  });

  // Handle any remaining diagrams (placed at the end)
  diagrams
    .filter((d) => !processedDiagramIds.has(d.id))
    .forEach((diagram) => {
      const svgDiagram = convertToSVGDiagram(diagram);
      if (svgDiagram) {
        renderedSections.push(
          <div key={`diagram-end-${diagram.id}`}>
            <SVGDiagram
              diagram={svgDiagram}
              priority={diagram.priority || isPriorityDiagram(diagram.filename)}
            />
          </div>
        );
        processedDiagramIds.add(diagram.id);
      }
    });

  return (
    <article className={`article-renderer ${className}`}>
      {renderedSections}
    </article>
  );
}

/**
 * Simplified version for basic article rendering without diagram positioning
 */
export function SimpleArticleRenderer({
  content,
  diagrams,
  className = "",
}: ArticleRendererProps) {
  if (!diagrams || diagrams.length === 0) {
    return <MarkdownRenderer content={content} className={className} />;
  }

  return (
    <article className={`simple-article-renderer ${className}`}>
      {diagrams.map((diagram) => {
        const svgDiagram = convertToSVGDiagram(diagram);
        if (!svgDiagram) return null;

        return (
          <div key={diagram.id} className="diagram-section my-8">
            <SVGDiagram
              diagram={svgDiagram}
              priority={diagram.priority || isPriorityDiagram(diagram.filename)}
            />
          </div>
        );
      })}
      <MarkdownRenderer content={content} />
    </article>
  );
}

export default ArticleRenderer;
