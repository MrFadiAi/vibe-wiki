"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  Zap,
  Clock,
  Bookmark,
  BookOpen,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { wikiContent, allArticles } from "@/data/wiki-content";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useHistory } from "@/hooks/useHistory";

// Estimate reading time based on content length (~200 words per minute)
function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  // Rough estimate: 5 characters per word for Arabic text
  const words = content.length / 5;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

// Get article title by slug
function getArticleTitle(slug: string): string | null {
  const article = allArticles.find((a) => a.slug === slug);
  return article?.title || null;
}

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(wikiContent.map((s) => s.name)) // All expanded by default
  );
  
  const { bookmarks } = useBookmarks();
  const { history: recentlyViewed } = useHistory();

  const currentSlug = pathname.replace("/wiki/", "");

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionName)) {
        next.delete(sectionName);
      } else {
        next.add(sectionName);
      }
      return next;
    });
  };

  return (
    <>
      {/* Mobile menu button - Right side for RTL */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 p-3 rounded-xl glass border border-border lg:hidden hover:border-neon-cyan/50 transition-all group"
        aria-label="فتح القائمة"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-neon-cyan" />
        ) : (
          <Menu className="w-5 h-5 group-hover:text-neon-cyan transition-colors" />
        )}
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-md z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Right side for RTL */}
      <aside
        className={cn(
          "fixed top-0 right-0 z-40 h-screen w-80 border-l border-border glass-strong transition-transform duration-500 ease-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-4 p-6 border-b border-border hover:bg-white/5 transition-all duration-300"
            onClick={() => setIsOpen(false)}
          >
            <div className="relative p-3 rounded-2xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink animate-gradient">
              <Sparkles className="w-6 h-6 text-white" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink blur-xl opacity-50 -z-10" />
            </div>
            <div>
              <h1 className="font-bold text-xl gradient-text">البرمجة بالإحساس</h1>
              <p className="text-sm text-muted-foreground">الدليل الشامل</p>
            </div>
          </Link>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-4 py-6">
            <nav className="space-y-6">
              {/* Recently Viewed Section */}
              {recentlyViewed.length > 0 && (
                <div className="pb-4 border-b border-border/50">
                  <div className="flex items-center gap-2 px-3 mb-3">
                    <Clock className="w-3.5 h-3.5 text-neon-cyan" />
                    <h2 className="text-xs font-bold tracking-wider text-muted-foreground">
                      شوهد مؤخراً
                    </h2>
                  </div>
                  <ul className="space-y-1">
                    {recentlyViewed.slice(0, 3).map((slug) => {
                      const title = getArticleTitle(slug);
                      if (!title) return null;
                      const isActive = currentSlug === slug;
                      return (
                        <li key={`recent-${slug}`}>
                          <Link
                            href={`/wiki/${slug}`}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "group flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all duration-300",
                              isActive
                                ? "bg-gradient-to-l from-neon-cyan/20 to-transparent text-neon-cyan"
                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            )}
                          >
                            <span className="flex-1 truncate">{title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Bookmarks Section */}
              {bookmarks.length > 0 && (
                <div className="pb-4 border-b border-border/50">
                  <div className="flex items-center gap-2 px-3 mb-3">
                    <Bookmark className="w-3.5 h-3.5 text-neon-pink" />
                    <h2 className="text-xs font-bold tracking-wider text-muted-foreground">
                      المحفوظات
                    </h2>
                  </div>
                  <ul className="space-y-1">
                    {bookmarks.slice(0, 5).map((slug) => {
                      const title = getArticleTitle(slug);
                      if (!title) return null;
                      const isActive = currentSlug === slug;
                      return (
                        <li key={`bookmark-${slug}`}>
                          <Link
                            href={`/wiki/${slug}`}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "group flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all duration-300",
                              isActive
                                ? "bg-gradient-to-l from-neon-pink/20 to-transparent text-neon-pink"
                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            )}
                          >
                            <span className="flex-1 truncate">{title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Main Content Sections */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-3">
                  <BookOpen className="w-3.5 h-3.5 text-neon-purple" />
                  <h2 className="text-xs font-bold tracking-wider text-muted-foreground">
                    المحتوى
                  </h2>
                </div>

                {wikiContent.map((section) => {
                  const isExpanded = expandedSections.has(section.name);

                  return (
                    <div key={section.name} className="space-y-1">
                      {/* Section Header - Collapsible */}
                      <button
                        onClick={() => toggleSection(section.name)}
                        className={cn(
                          "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl",
                          "text-right transition-all duration-300",
                          "hover:bg-white/5 group"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple" />
                          <h3 className="text-sm font-semibold text-foreground/90 group-hover:text-foreground">
                            {section.name}
                          </h3>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 0 : -90 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </motion.div>
                      </button>

                      {/* Section Articles - Animated */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden space-y-1"
                          >
                            {section.articles.map((article) => {
                              const isActive = currentSlug === article.slug;
                              const readingTime = estimateReadingTime(article.content);

                              return (
                                <motion.li
                                  key={article.slug}
                                  initial={{ x: 20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Link
                                    href={`/wiki/${article.slug}`}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                      "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300",
                                      isActive
                                        ? "bg-gradient-to-l from-neon-cyan/20 to-transparent text-neon-cyan border-r-2 border-neon-cyan"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5 hover:pr-5"
                                    )}
                                  >
                                    <ChevronLeft
                                      className={cn(
                                        "w-4 h-4 transition-all duration-300",
                                        isActive
                                          ? "text-neon-cyan"
                                          : "opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0"
                                      )}
                                    />
                                    <span className="flex-1">{article.title}</span>
                                    <span
                                      className={cn(
                                        "text-xs transition-opacity duration-300",
                                        isActive
                                          ? "text-neon-cyan/70"
                                          : "text-muted-foreground/50 group-hover:text-muted-foreground"
                                      )}
                                    >
                                      {readingTime} د
                                    </span>
                                    {isActive && (
                                      <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse-glow" />
                                    )}
                                  </Link>
                                </motion.li>
                              );
                            })}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-l from-neon-purple/10 to-transparent">
              <Zap className="w-4 h-4 text-neon-purple" />
              <p className="text-sm text-muted-foreground">
                صُنع بـ{" "}
                <span className="text-neon-pink">♥</span> و{" "}
                <span className="gradient-text font-semibold">الذكاء الاصطناعي</span>
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
