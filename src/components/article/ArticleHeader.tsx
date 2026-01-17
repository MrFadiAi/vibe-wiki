"use client";

import { Breadcrumbs, BreadcrumbItem } from "./Breadcrumbs";
import { ReadingTime } from "./ReadingTime";
import { Bookmark } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useHistory } from "@/hooks/useHistory";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ArticleHeaderProps {
  title: string;
  section: string;
  content: string;
  date?: string;
  slug: string;
}

export function ArticleHeader({ title, section, content, date, slug }: ArticleHeaderProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { addToHistory } = useHistory();
  const bookmarked = isBookmarked(slug);

  // Track view on mount
  useEffect(() => {
    addToHistory(slug);
  }, [slug, addToHistory]);

  // Build breadcrumb paths
  const breadcrumbs: BreadcrumbItem[] = [
    { label: section, href: "#" }, // Section link - could be enhanced with actual section pages
    { label: title, href: "#" }, // Current article (won't be a link due to isLast check)
  ];

  return (
    <header className="mb-10 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs paths={breadcrumbs} />

      <div className="flex items-start justify-between gap-4">
        <h1 className="text-4xl md:text-5xl font-bold gradient-text leading-tight flex-1">
          {title}
        </h1>
        <button
          onClick={() => toggleBookmark(slug)}
          className={cn(
            "p-3 rounded-xl transition-all duration-300 border",
            bookmarked
              ? "bg-neon-pink/10 border-neon-pink text-neon-pink"
              : "bg-white/5 border-white/10 text-muted-foreground hover:text-neon-pink hover:border-neon-pink/50"
          )}
          aria-label={bookmarked ? "إزالة من المحفوظات" : "إضافة للمحفوظات"}
        >
          <Bookmark className={cn("w-6 h-6", bookmarked && "fill-current")} />
        </button>
      </div>

      {/* Meta info row */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {/* Section badge */}
        <span className="px-3 py-1.5 rounded-full bg-neon-purple/10 text-neon-purple text-xs font-medium border border-neon-purple/20">
          {section}
        </span>

        {/* Separator */}
        <span className="w-px h-4 bg-border" />

        {/* Reading time */}
        <ReadingTime content={content} />

        {/* Date if provided */}
        {date && (
          <>
            <span className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{date}</span>
            </div>
          </>
        )}
      </div>

      {/* Decorative line */}
      <div className="h-px bg-gradient-to-l from-transparent via-border to-transparent" />
    </header>
  );
}

export default ArticleHeader;
