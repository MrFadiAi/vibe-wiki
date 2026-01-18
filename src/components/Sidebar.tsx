"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { wikiContent } from "@/data/wiki-content";
import { ChevronDown, BookOpen, Hash } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2" onClick={onLinkClick}>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan to-neon-purple">
            Vibe Coding
          </span>
        </Link>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-6">
          {wikiContent.map((section) => (
            <div key={section.name} className="space-y-2">
              <button
                onClick={() => toggleSection(section.name)}
                className="flex w-full items-center justify-between text-sm font-semibold text-muted-foreground hover:text-neon-cyan transition-colors"
              >
                <span className="uppercase tracking-wider text-xs">{section.name}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    openSections[section.name] ? "rotate-180" : ""
                  )}
                />
              </button>

              <AnimatePresence>
                {!openSections[section.name] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-1 border-r border-white/5 pr-4">
                      {section.articles.map((article) => {
                        const href = `/wiki/${article.slug}`;
                        const isActive = pathname === href;

                        return (
                          <li key={article.slug}>
                            <Link
                              href={href}
                              onClick={onLinkClick}
                              className={cn(
                                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200 relative",
                                isActive
                                  ? "bg-neon-cyan/10 text-neon-cyan font-medium"
                                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                              )}
                            >
                              {isActive && (
                                <motion.div
                                  layoutId="active-indicator"
                                  className="absolute right-0 h-6 w-1 rounded-l-full bg-neon-cyan"
                                />
                              )}
                              <Hash className="h-3 w-3 opacity-50" />
                              <span>{article.title}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
      </ScrollArea>
      
      {/* Footer */}
      <div className="p-6 border-t border-white/5">
        <div className="rounded-xl bg-gradient-to-br from-neon-purple/10 to-transparent p-4 border border-neon-purple/20">
            <p className="text-xs text-muted-foreground text-center">
              مبني بالحب والذكاء الاصطناعي 💜
            </p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed top-0 right-0 z-40 h-screen w-80 border-l border-white/5 bg-background/95 backdrop-blur-xl hidden lg:block">
      <SidebarContent />
    </aside>
  );
}
