import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { WikiArticle } from "@/data/wiki-content";

interface PrevNextNavProps {
  prev: WikiArticle | null;
  next: WikiArticle | null;
}

export function PrevNextNav({ prev, next }: PrevNextNavProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16 pt-8 border-t border-white/10">
      {prev ? (
        <Link
          href={`/wiki/${prev.slug}`}
          className="group flex flex-col items-start gap-2 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-neon-cyan/50 transition-all text-right"
        >
          <span className="text-sm text-muted-foreground flex items-center gap-1 group-hover:text-neon-cyan">
            <ArrowRight className="h-4 w-4" />
            السابق
          </span>
          <span className="font-semibold">{prev.title}</span>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/wiki/${next.slug}`}
          className="group flex flex-col items-end gap-2 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-neon-purple/50 transition-all text-left"
        >
          <span className="text-sm text-muted-foreground flex items-center gap-1 group-hover:text-neon-purple">
            التالي
            <ArrowLeft className="h-4 w-4" />
          </span>
          <span className="font-semibold">{next.title}</span>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
