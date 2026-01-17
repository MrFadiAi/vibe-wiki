'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, BookOpen, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WikiArticle } from '@/data/wiki-content';

interface PathCardProps {
  title: string;
  description: string;
  level: string;
  estimatedTime: string;
  icon: React.ReactNode;
  articles: WikiArticle[];
  color: 'cyan' | 'purple' | 'pink' | 'green';
  delay?: number;
}

export default function PathCard({ 
  title, 
  description, 
  level, 
  estimatedTime, 
  icon, 
  articles, 
  color,
  delay = 0 
}: PathCardProps) {
  const firstArticleSlug = articles[0]?.slug || '#';
  const articleCount = articles.length;

  const colorStyles = {
    cyan: {
      border: 'hover:border-neon-cyan/50',
      glow: 'group-hover:shadow-[0_0_30px_-10px_rgba(0,255,255,0.3)]',
      text: 'text-neon-cyan',
      bg: 'bg-neon-cyan/10',
      gradient: 'from-neon-cyan to-transparent'
    },
    purple: {
      border: 'hover:border-neon-purple/50',
      glow: 'group-hover:shadow-[0_0_30px_-10px_rgba(189,52,254,0.3)]',
      text: 'text-neon-purple',
      bg: 'bg-neon-purple/10',
      gradient: 'from-neon-purple to-transparent'
    },
    pink: {
      border: 'hover:border-neon-pink/50',
      glow: 'group-hover:shadow-[0_0_30px_-10px_rgba(255,0,255,0.3)]',
      text: 'text-neon-pink',
      bg: 'bg-neon-pink/10',
      gradient: 'from-neon-pink to-transparent'
    },
    green: {
      border: 'hover:border-emerald-500/50',
      glow: 'group-hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      gradient: 'from-emerald-500 to-transparent'
    }
  };

  const currentStyle = colorStyles[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
    >
      <Link href={`/wiki/${firstArticleSlug}`} className="block h-full">
        <div className={cn(
          "relative h-full p-6 rounded-3xl glass border border-white/5 transition-all duration-300 group overflow-hidden flex flex-col",
          currentStyle.border,
          currentStyle.glow
        )}>
          {/* Hover Gradient Overlay */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500",
            currentStyle.gradient
          )} />

          {/* Header */}
          <div className="flex items-start justify-between mb-6 relative z-10">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
              currentStyle.bg,
              currentStyle.text
            )}>
              {icon}
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary/50 border border-white/5">
                {level}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex-1">
            <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors duration-300">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed line-clamp-2">
              {description}
            </p>
          </div>

          {/* Footer Info */}
          <div className="relative z-10 pt-6 mt-auto border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                {articleCount} مقال
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {estimatedTime}
              </span>
            </div>
            
            <div className={cn(
              "flex items-center gap-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 font-bold",
              currentStyle.text
            )}>
              ابـدأ
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
