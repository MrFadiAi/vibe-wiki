"use client";

import { WikiArticle, getAdjacentArticles } from "@/data/wiki-content";
import { PrevNextNavigation } from "@/components/PrevNextNavigation";
import { CodeBlock } from "@/components/mdx/CodeBlock";
import React from "react";

interface ArticleContentProps {
  article: WikiArticle;
}

// Custom component wrapper types
interface ElementProps {
  children?: React.ReactNode;
  className?: string;
}

// Parse markdown content into structured elements and render with custom components
export function ArticleContent({ article }: ArticleContentProps) {
  const { prev, next } = getAdjacentArticles(article.slug);

  const renderContent = (content: string) => {
    const elements: React.ReactNode[] = [];
    let key = 0;

    // Split content into blocks for better parsing
    const lines = content.split("\n");
    let currentIndex = 0;

    while (currentIndex < lines.length) {
      const line = lines[currentIndex];

      // Skip empty lines
      if (!line.trim()) {
        currentIndex++;
        continue;
      }

      // Code blocks (```language ... ```)
      if (line.trim().startsWith("```")) {
        const langMatch = line.trim().match(/^```(\w+)?/);
        const language = langMatch?.[1] || "plaintext";
        const codeLines: string[] = [];
        currentIndex++;

        while (currentIndex < lines.length && !lines[currentIndex].trim().startsWith("```")) {
          codeLines.push(lines[currentIndex]);
          currentIndex++;
        }
        currentIndex++; // Skip closing ```

        elements.push(
          <CodeBlock
            key={key++}
            code={codeLines.join("\n")}
            language={language}
          />
        );
        continue;
      }

      // Headers
      if (line.startsWith("### ")) {
        const text = line.slice(4);
        const id = text.replace(/\s+/g, "-").toLowerCase();
        elements.push(
          <h3 key={key++} id={id} className="text-xl md:text-2xl font-semibold mb-4 mt-10 text-foreground scroll-mt-24">
            {parseInlineElements(text)}
          </h3>
        );
        currentIndex++;
        continue;
      }

      if (line.startsWith("## ")) {
        const text = line.slice(3);
        const id = text.replace(/\s+/g, "-").toLowerCase();
        elements.push(
          <h2 key={key++} id={id} className="text-2xl md:text-3xl font-bold mb-5 mt-12 gradient-text scroll-mt-24">
            {parseInlineElements(text)}
          </h2>
        );
        currentIndex++;
        continue;
      }

      if (line.startsWith("# ")) {
        const text = line.slice(2);
        elements.push(
          <h1 key={key++} className="text-4xl md:text-5xl font-bold mb-8 gradient-text leading-tight scroll-mt-24">
            {parseInlineElements(text)}
          </h1>
        );
        currentIndex++;
        continue;
      }

      // Blockquote
      if (line.startsWith("> ")) {
        const text = line.slice(2);
        elements.push(
          <blockquote key={key++} className="my-6 pr-6 border-r-4 border-neon-purple bg-neon-purple/5 py-4 pl-4 rounded-l-xl text-muted-foreground italic">
            {parseInlineElements(text)}
          </blockquote>
        );
        currentIndex++;
        continue;
      }

      // Horizontal rule
      if (line.trim() === "---") {
        elements.push(
          <hr key={key++} className="my-12 border-0 h-px bg-gradient-to-l from-transparent via-border to-transparent" />
        );
        currentIndex++;
        continue;
      }

      // Unordered list (collect consecutive list items)
      if (line.startsWith("- ")) {
        const listItems: React.ReactNode[] = [];
        while (currentIndex < lines.length && lines[currentIndex].startsWith("- ")) {
          const itemText = lines[currentIndex].slice(2);
          listItems.push(
            <li key={listItems.length} className="flex items-start gap-3 py-2 text-muted-foreground">
              <span className="mt-2.5 w-2 h-2 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple flex-shrink-0" />
              <span className="flex-1">{parseInlineElements(itemText)}</span>
            </li>
          );
          currentIndex++;
        }
        elements.push(
          <ul key={key++} className="my-6 space-y-1 mr-6">
            {listItems}
          </ul>
        );
        continue;
      }

      // Ordered list
      if (/^\d+\.\s/.test(line)) {
        const listItems: React.ReactNode[] = [];
        while (currentIndex < lines.length && /^\d+\.\s/.test(lines[currentIndex])) {
          const itemText = lines[currentIndex].replace(/^\d+\.\s/, "");
          listItems.push(
            <li key={listItems.length} className="py-2 text-muted-foreground list-decimal mr-6">
              {parseInlineElements(itemText)}
            </li>
          );
          currentIndex++;
        }
        elements.push(
          <ol key={key++} className="my-6 space-y-1 marker:text-neon-cyan">
            {listItems}
          </ol>
        );
        continue;
      }

      // Table detection
      if (line.includes("|") && lines[currentIndex + 1]?.includes("---")) {
        const tableRows: string[][] = [];
        let headerRow: string[] = [];

        // Parse header
        headerRow = line.split("|").map((cell) => cell.trim()).filter(Boolean);
        currentIndex++; // Skip header row
        currentIndex++; // Skip separator row

        // Parse body rows
        while (currentIndex < lines.length && lines[currentIndex].includes("|")) {
          const row = lines[currentIndex].split("|").map((cell) => cell.trim()).filter(Boolean);
          tableRows.push(row);
          currentIndex++;
        }

        elements.push(
          <div key={key++} className="my-8 overflow-x-auto rounded-2xl glass border border-border">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border bg-white/5">
                  {headerRow.map((cell, i) => (
                    <th key={i} className="px-6 py-4 text-right text-sm font-semibold text-neon-cyan">
                      {parseInlineElements(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-6 py-4 text-sm text-right">
                        {parseInlineElements(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }

      // Regular paragraph
      if (line.trim()) {
        elements.push(
          <p key={key++} className="my-5 text-lg leading-relaxed text-muted-foreground">
            {parseInlineElements(line)}
          </p>
        );
      }
      currentIndex++;
    }

    return elements;
  };

  // Parse inline elements (bold, italic, code, links)
  const parseInlineElements = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Inline code `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(
          <code
            key={key++}
            className="px-2 py-1 rounded-lg bg-neon-cyan/10 text-neon-cyan text-sm font-mono border border-neon-cyan/20"
            dir="ltr"
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Bold + Italic ***text***
      const boldItalicMatch = remaining.match(/^\*\*\*(.+?)\*\*\*/);
      if (boldItalicMatch) {
        parts.push(
          <strong key={key++} className="italic text-foreground font-semibold">
            {boldItalicMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldItalicMatch[0].length);
        continue;
      }

      // Bold **text**
      const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
      if (boldMatch) {
        parts.push(
          <strong key={key++} className="text-foreground font-semibold">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Italic *text*
      const italicMatch = remaining.match(/^\*(.+?)\*/);
      if (italicMatch) {
        parts.push(
          <em key={key++} className="text-neon-cyan not-italic">
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Links [text](url)
      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const isExternal = linkMatch[2].startsWith("http");
        parts.push(
          <a
            key={key++}
            href={linkMatch[2]}
            className="text-neon-cyan hover:text-neon-purple underline underline-offset-4 decoration-neon-cyan/30 hover:decoration-neon-purple/50 transition-colors"
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
          >
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.slice(linkMatch[0].length);
        continue;
      }

      // Regular text - find next special character or take all
      const nextSpecial = remaining.search(/[`*\[]/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        // If special char at start but no match, take one char and continue
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return parts.length === 1 ? parts[0] : parts;
  };

  return (
    <article className="max-w-4xl mx-auto">
      {/* Content */}
      <div className="prose prose-invert max-w-none">
        {renderContent(article.content)}
      </div>

      {/* Navigation */}
      <PrevNextNavigation prev={prev} next={next} />
    </article>
  );
}

export default ArticleContent;
