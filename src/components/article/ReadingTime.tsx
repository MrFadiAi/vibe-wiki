"use client";

import { calculateReadingTime } from "@/lib/article-utils";

interface ReadingTimeProps {
  content: string;
  wordsPerMinute?: number;
}

export function ReadingTime({ content, wordsPerMinute = 200 }: ReadingTimeProps) {
  const minutes = calculateReadingTime(content, wordsPerMinute);

  // Arabic format
  const timeText = minutes === 1 
    ? "دقيقة واحدة" 
    : minutes === 2 
    ? "دقيقتان" 
    : `${minutes} دقائق`;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {/* Clock icon */}
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>قراءة {timeText}</span>
    </div>
  );
}

export default ReadingTime;
