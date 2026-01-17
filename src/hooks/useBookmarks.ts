'use client';
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'vibe-wiki-bookmarks';
const EVENT_KEY = 'vibe-wiki-bookmarks-updated';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const load = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setBookmarks(JSON.parse(saved));
        } else {
            setBookmarks([]);
        }
      } catch (e) {
        console.error('Failed to parse bookmarks:', e);
      }
    };

    load();
    setIsInitialized(true);

    const handleUpdate = () => load();
    window.addEventListener(EVENT_KEY, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(EVENT_KEY, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const addBookmark = (slug: string) => {
    // Prevent duplicates
    if (bookmarks.includes(slug)) return;
    
    const updated = [...bookmarks, slug];
    setBookmarks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(EVENT_KEY));
  };

  const removeBookmark = (slug: string) => {
    const updated = bookmarks.filter(s => s !== slug);
    setBookmarks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(EVENT_KEY));
  };

  const isBookmarked = (slug: string) => bookmarks.includes(slug);

  const toggleBookmark = (slug: string) => {
    if (isBookmarked(slug)) {
      removeBookmark(slug);
    } else {
      addBookmark(slug);
    }
  };

  return { bookmarks, addBookmark, removeBookmark, isBookmarked, toggleBookmark, isInitialized };
}
