"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Sparkles, Menu, X, Zap } from "lucide-react";
import { useState } from "react";
import { wikiContent } from "@/data/wiki-content";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentSlug = pathname.replace("/wiki/", "");

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
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

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
            <nav className="space-y-8">
              {wikiContent.map((section, sectionIndex) => (
                <div key={section.name}>
                  <div className="flex items-center gap-2 px-3 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple" />
                    <h2 className="text-xs font-bold tracking-wider text-muted-foreground">
                      {section.name}
                    </h2>
                  </div>
                  <ul className="space-y-1">
                    {section.articles.map((article) => {
                      const isActive = currentSlug === article.slug;
                      return (
                        <li key={article.slug}>
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
                            {isActive && (
                              <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse-glow" />
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
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
