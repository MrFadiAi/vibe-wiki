"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText, ArrowLeft } from "lucide-react";
import { allArticles } from "@/data/wiki-content";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredArticles = query
    ? allArticles.filter(
        (article) =>
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.content.toLowerCase().includes(query.toLowerCase()) ||
          article.section.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyNavigation = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredArticles.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && filteredArticles[selectedIndex]) {
      router.push(`/wiki/${filteredArticles[selectedIndex].slug}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  const handleSelect = (slug: string) => {
    router.push(`/wiki/${slug}`);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="group flex items-center gap-3 px-5 py-3 w-full max-w-md rounded-2xl glass border border-border text-muted-foreground hover:border-neon-cyan/50 hover:text-foreground transition-all duration-300"
      >
        <Search className="w-4 h-4 group-hover:text-neon-cyan transition-colors" />
        <span className="text-sm flex-1 text-right">ابحث في المحتوى...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-secondary border border-border font-mono">
          <span>⌘</span>K
        </kbd>
      </button>

      {/* Search modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            onClick={() => {
              setIsOpen(false);
              setQuery("");
            }}
          />

          {/* Modal */}
          <div
            ref={containerRef}
            className="relative w-full max-w-2xl mx-4 rounded-3xl glass-strong shadow-2xl shadow-neon-cyan/10 overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-4 px-6 py-5 border-b border-border">
              <Search className="w-5 h-5 text-neon-cyan" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyNavigation}
                placeholder="اكتب للبحث في المقالات..."
                className="border-0 bg-transparent focus-visible:ring-0 text-lg py-2 text-right"
                dir="rtl"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-2 rounded-xl hover:bg-secondary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Results */}
            {query && (
              <div className="max-h-96 overflow-y-auto p-3">
                {filteredArticles.length > 0 ? (
                  <ul className="space-y-1">
                    {filteredArticles.map((article, index) => (
                      <li key={article.slug}>
                        <button
                          onClick={() => handleSelect(article.slug)}
                          className={cn(
                            "w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-right transition-all duration-200",
                            index === selectedIndex
                              ? "bg-gradient-to-l from-neon-cyan/20 to-transparent border border-neon-cyan/30"
                              : "hover:bg-white/5"
                          )}
                        >
                          <div className={cn(
                            "p-2.5 rounded-xl transition-colors",
                            index === selectedIndex ? "bg-neon-cyan/20" : "bg-secondary"
                          )}>
                            <FileText className={cn(
                              "w-4 h-4",
                              index === selectedIndex ? "text-neon-cyan" : "text-muted-foreground"
                            )} />
                          </div>
                          <div className="flex-1 text-right">
                            <span className={cn(
                              "block font-medium text-base",
                              index === selectedIndex && "text-neon-cyan"
                            )}>
                              {article.title}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {article.section}
                            </span>
                          </div>
                          {index === selectedIndex && (
                            <ArrowLeft className="w-4 h-4 text-neon-cyan" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                      <Search className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      لم يتم العثور على نتائج لـ &quot;{query}&quot;
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-center gap-6 px-6 py-4 border-t border-border text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <kbd className="px-2 py-1 rounded-lg bg-secondary border border-border">↑</kbd>
                <kbd className="px-2 py-1 rounded-lg bg-secondary border border-border">↓</kbd>
                للتنقل
              </span>
              <span className="flex items-center gap-2">
                <kbd className="px-2 py-1 rounded-lg bg-secondary border border-border">↵</kbd>
                للفتح
              </span>
              <span className="flex items-center gap-2">
                <kbd className="px-2 py-1 rounded-lg bg-secondary border border-border">esc</kbd>
                للإغلاق
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
