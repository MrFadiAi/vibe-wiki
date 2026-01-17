"use client";

import { Search } from "lucide-react";

export function SearchBar() {
  const handleOpen = () => {
    window.dispatchEvent(new Event('open-vibe-search'));
  };

  return (
    <button
      onClick={handleOpen}
      className="group flex items-center gap-3 px-5 py-2.5 w-full max-w-md rounded-2xl glass border border-border/50 text-muted-foreground hover:border-neon-cyan/50 hover:text-foreground hover:bg-white/5 transition-all duration-300"
    >
      <Search className="w-4 h-4 group-hover:text-neon-cyan transition-colors" />
      <span className="text-sm flex-1 text-right">ابحث في الدليل...</span>
      <div className="hidden sm:flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
        <kbd className="inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium rounded bg-muted/50 border border-border font-mono">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
    </button>
  );
}
