"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { wikiContent } from "@/data/wiki-content";
import { ChevronDown, BookOpen, Hash, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  // Default all sections to open for better discovery, or keep specific ones open
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Initialize with all sections open effectively or just specific logic
  useEffect(() => {
    const initialState: Record<string, boolean> = {};
    wikiContent.forEach(section => {
      initialState[section.name] = true;
    });
    setOpenSections(initialState);
  }, []);

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="flex h-full flex-col bg-slate-950/50">
      {/* Header */}
      <div className="p-6 pb-4">
        <Link href="/" className="group flex items-center gap-3" onClick={onLinkClick}>
          <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-gradient-to-br from-neon-cyan via-blue-600 to-neon-purple p-[1px] transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-slate-950 backface-hidden">
              <Sparkles className="h-5 w-5 text-neon-cyan transition-colors group-hover:text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-neon-cyan transition-colors">
              Vibe Coding
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/80">
              Wiki & Guide
            </span>
          </div>
        </Link>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-4">
        <nav className="space-y-6 pb-8">
          {wikiContent.map((section, index) => (
            <div key={section.name} className="space-y-2">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.name)}
                className="group flex w-full items-center justify-between py-2 text-sm font-semibold text-muted-foreground transition-all hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/5 text-[10px] font-bold text-muted-foreground transition-colors group-hover:bg-neon-cyan/10 group-hover:text-neon-cyan">
                    {index + 1}
                  </span>
                  <span className="uppercase tracking-wider text-xs font-bold">{section.name.split(':')[0]}</span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 opacity-50 transition-transform duration-300 group-hover:opacity-100",
                    !openSections[section.name] ? "-rotate-90" : ""
                  )}
                />
              </button>

              <AnimatePresence initial={false}>
                {openSections[section.name] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <ul className="relative space-y-0.5 border-r border-white/5 pr-3 mr-2.5">
                      {/* Decorative line connector */}
                      <div className="absolute right-[-1px] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                      
                      {section.articles.map((article) => {
                        const href = `/wiki/${article.slug}`;
                        const isActive = pathname === href;

                        return (
                          <li key={article.slug}>
                            <Link
                              href={href}
                              onClick={onLinkClick}
                              className={cn(
                                "group/item relative flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-200",
                                isActive
                                  ? "bg-neon-cyan/10 text-neon-cyan font-medium shadow-[inset_0_0_0_1px_rgba(0,240,255,0.2)]"
                                  : "text-muted-foreground/80 hover:bg-white/5 hover:text-white"
                              )}
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <span className={cn(
                                  "h-1.5 w-1.5 rounded-full transition-all duration-300",
                                  isActive ? "bg-neon-cyan shadow-[0_0_8px_rgba(0,240,255,0.8)]" : "bg-white/20 group-hover/item:bg-white/50"
                                )} />
                                <span className="truncate">{article.title}</span>
                              </div>
                              
                              {isActive && (
                                <motion.div
                                  layoutId="sidebar-active-glow"
                                  className="absolute inset-0 rounded-lg bg-neon-cyan/5"
                                  initial={false}
                                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                              )}
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
      <div className="p-4 pt-2">
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 via-transparent to-neon-cyan/5 opacity-50" />
          <div className="relative flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              مبني للإبداع <span className="mx-1 text-neon-purple">♥</span>
            </p>
            <a 
              href="https://x.com/Mr_CryptoYT" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] text-neon-cyan hover:text-neon-purple transition-colors font-mono"
            >
              Created by @Mr_CryptoYT
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed top-0 right-0 z-40 h-screen w-80 border-l border-white/10 bg-slate-950/80 backdrop-blur-2xl hidden lg:block shadow-2xl">
      <SidebarContent />
    </aside>
  );
}
