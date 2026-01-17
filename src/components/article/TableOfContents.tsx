"use client";

import { useEffect, useState, useCallback } from "react";

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: TocHeading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [progress, setProgress] = useState(0);

  // Track scroll position and active heading
  const handleScroll = useCallback(() => {
    // Calculate reading progress
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    setProgress(Math.min(scrollProgress, 100));

    // Find active heading using intersection
    const headingElements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    if (headingElements.length === 0) return;

    // Find the heading closest to the top of the viewport
    let currentActive = headingElements[0]?.id || "";
    const scrollOffset = 150; // Account for sticky header

    for (const element of headingElements) {
      const rect = element.getBoundingClientRect();
      if (rect.top <= scrollOffset) {
        currentActive = element.id;
      }
    }

    setActiveId(currentActive);
  }, [headings]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav className="hidden lg:block fixed top-24 left-8 w-64 max-h-[calc(100vh-8rem)] overflow-y-auto z-40">
      <div className="glass rounded-2xl border border-border p-4">
        {/* Header with progress */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <h4 className="text-sm font-semibold text-foreground">المحتويات</h4>
          <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full bg-secondary rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Headings list */}
        <ul className="space-y-1">
          {headings.map((heading) => {
            const isActive = activeId === heading.id;
            const isH3 = heading.level === 3;

            return (
              <li key={heading.id}>
                <button
                  onClick={() => handleClick(heading.id)}
                  className={`
                    w-full text-right py-2 px-3 rounded-lg text-sm transition-all duration-200
                    ${isH3 ? "mr-4 text-xs" : ""}
                    ${
                      isActive
                        ? "bg-neon-cyan/10 text-neon-cyan border-r-2 border-neon-cyan text-glow-cyan"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }
                  `}
                >
                  <span className="line-clamp-2">{heading.text}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export default TableOfContents;
