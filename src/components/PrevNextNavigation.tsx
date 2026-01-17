import Link from "next/link";
import { ChevronRight, ChevronLeft, ArrowLeft, ArrowRight } from "lucide-react";
import { WikiArticle } from "@/data/wiki-content";
import { cn } from "@/lib/utils";

interface PrevNextNavigationProps {
  prev: WikiArticle | null;
  next: WikiArticle | null;
}

export function PrevNextNavigation({ prev, next }: PrevNextNavigationProps) {
  return (
    <nav className="flex flex-col sm:flex-row gap-4 mt-16 pt-8 border-t border-border">
      {/* Next article (appears on left in RTL) */}
      {next ? (
        <Link
          href={`/wiki/${next.slug}`}
          className={cn(
            "group flex-1 flex items-center gap-4 p-6 rounded-2xl glass border border-border",
            "hover:border-neon-purple/50 hover:bg-neon-purple/5 transition-all duration-300 card-hover"
          )}
        >
          <div className="p-3 rounded-xl bg-neon-purple/10 group-hover:bg-neon-purple/20 transition-colors">
            <ArrowRight className="w-5 h-5 text-neon-purple group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="flex-1">
            <span className="block text-xs text-muted-foreground mb-1">
              المقال التالي
            </span>
            <span className="block font-semibold text-foreground group-hover:text-neon-purple transition-colors">
              {next.title}
            </span>
            <span className="block text-sm text-muted-foreground mt-1">{next.section}</span>
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {/* Previous article (appears on right in RTL) */}
      {prev ? (
        <Link
          href={`/wiki/${prev.slug}`}
          className={cn(
            "group flex-1 flex items-center gap-4 p-6 rounded-2xl glass border border-border",
            "hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all duration-300 card-hover"
          )}
        >
          <div className="flex-1 text-left">
            <span className="block text-xs text-muted-foreground mb-1">
              المقال السابق
            </span>
            <span className="block font-semibold text-foreground group-hover:text-neon-cyan transition-colors">
              {prev.title}
            </span>
            <span className="block text-sm text-muted-foreground mt-1">{prev.section}</span>
          </div>
          <div className="p-3 rounded-xl bg-neon-cyan/10 group-hover:bg-neon-cyan/20 transition-colors">
            <ArrowLeft className="w-5 h-5 text-neon-cyan group-hover:-translate-x-1 transition-transform" />
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
