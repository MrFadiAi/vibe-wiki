'use client';
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'vibe-wiki-recent';
const EVENT_KEY = 'vibe-wiki-history-updated';
const MAX_ITEMS = 5;

export function useHistory() {
  const [history, setHistory] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const load = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setHistory(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to parse history:', e);
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

  const addToHistory = (slug: string) => {
    try {
        // Read current from localStorage to ensure we have latest, 
        // though the effect keeps state updated, race conditions could happen.
        // For simplicity, we rely on state but for robustness:
        const currentSaved = localStorage.getItem(STORAGE_KEY);
        const currentHistory = currentSaved ? JSON.parse(currentSaved) : [];
        
        // Avoid duplicates and keep only last MAX_ITEMS
        const updated = [slug, ...currentHistory.filter((s: string) => s !== slug)].slice(0, MAX_ITEMS);
        
        setHistory(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event(EVENT_KEY));
    } catch (e) {
        console.error('Failed to update history:', e);
    }
  };

  return { history, addToHistory, isInitialized };
}
