'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Command, ArrowRight, Clock, Hash, FileText } from 'lucide-react';
import { searchArticles, SearchResult } from '@/lib/search-index';
import { cn } from '@/lib/utils';
import { WikiArticle } from '@/data/wiki-content';

export default function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem('vibe-wiki-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  // Toggle with CMD+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    
    const openSearch = () => setIsOpen(true);
    
    document.addEventListener('keydown', down);
    window.addEventListener('open-vibe-search', openSearch);
    
    return () => {
      document.removeEventListener('keydown', down);
      window.removeEventListener('open-vibe-search', openSearch);
    };
  }, []);

  // Search effect
  useEffect(() => {
    if (query.trim()) {
      const hits = searchArticles(query);
      setResults(hits);
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const saveRecentSearch = (term: string) => {
    const newRecent = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('vibe-wiki-recent-searches', JSON.stringify(newRecent));
  };

  const handleSelect = useCallback((article: WikiArticle) => {
    saveRecentSearch(article.title);
    setIsOpen(false);
    router.push(`/wiki/${article.slug}`);
    setQuery('');
  }, [router, recentSearches]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % (results.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + (results.length || 1)) % (results.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results.length > 0) {
          handleSelect(results[selectedIndex].item);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, handleSelect]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-4 md:pt-[15vh] px-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className="w-full max-w-2xl bg-background/95 border border-white/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh] md:max-h-[70vh] glass-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Header */}
            <div className="flex items-center px-4 py-4 border-b border-white/10 gap-3">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن مقال، موضوع، أو كود..."
                className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground/50 text-foreground"
                dir="rtl"
              />
              <div className="flex items-center gap-2">
                <kbd className="hidden md:inline-flex h-6 select-none items-center gap-1 rounded border bg-muted/50 px-2 font-mono text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">ESC</span>
                </kbd>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
              {query === '' ? (
                // Empty State / Recent
                <div className="p-4 space-y-6">
                  {recentSearches.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-3 px-2 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        عمليات البحث الأخيرة
                      </h4>
                      <div className="space-y-1">
                        {recentSearches.map((term, i) => (
                          <button
                            key={i}
                            onClick={() => setQuery(term)}
                            className="w-full text-right px-3 py-2 text-sm text-foreground/80 hover:bg-white/5 rounded-lg transition-colors flex items-center justify-between group"
                          >
                            <span>{term}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-neon-cyan" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-3 px-2 flex items-center gap-2">
                      <Hash className="w-3 h-3" />
                      مقترحات سريعة
                    </h4>
                    <div className="flex flex-wrap gap-2 px-2">
                      {['Cursor', 'Git', 'Node.js', 'Vercel', 'Prompt Engineering'].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setQuery(tag)}
                          className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs hover:border-neon-cyan/30 hover:bg-neon-cyan/5 transition-all cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : results.length > 0 ? (
                // Results List
                <div className="space-y-1">
                  {results.map((result, index) => (
                    <button
                      key={result.item.slug}
                      onClick={() => handleSelect(result.item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "w-full text-right p-3 rounded-xl transition-all flex items-start gap-4 group relative overflow-hidden",
                        selectedIndex === index ? "bg-neon-cyan/10" : "hover:bg-white/5"
                      )}
                    >
                      {selectedIndex === index && (
                        <motion.div
                          layoutId="active-result"
                          className="absolute inset-0 border border-neon-cyan/30 rounded-xl pointer-events-none"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      
                      <div className={cn(
                        "mt-1 p-2 rounded-lg bg-background border border-white/10",
                        selectedIndex === index ? "text-neon-cyan border-neon-cyan/30" : "text-muted-foreground"
                      )}>
                        <FileText className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={cn(
                            "font-semibold truncate",
                            selectedIndex === index ? "text-neon-cyan" : "text-foreground"
                          )}>
                            {result.item.title}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground whitespace-nowrap">
                            {result.item.section}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 opacity-80 pl-4">
                           {/* Simple excerpt generation */}
                           {result.item.content.substring(0, 100).replace(/#/g, '')}...
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                // No Results
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Search className="w-12 h-12 mb-4 opacity-20" />
                  <p>لا توجد نتائج لـ "{query}"</p>
                  <p className="text-sm opacity-50">جرب البحث بكلمات مختلفة أو تصفح الأقسام</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 bg-white/5 flex items-center justify-between text-[10px] text-muted-foreground px-4">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-sans">↩</kbd>
                  لاختيار المقال
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-sans">↑↓</kbd>
                  للتنقل
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Command className="w-3 h-3" />
                <span>Vibe Search</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
