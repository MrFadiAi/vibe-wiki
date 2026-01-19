import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getArticleBySlug, allArticles, calculateReadingTime, getPrevNextArticles } from "@/lib/article-utils";
import { MarkdownRenderer } from "@/components/wiki/MarkdownRenderer";
import { PrevNextNav } from "@/components/wiki/PrevNextNav";
import { Clock } from "lucide-react";

interface WikiPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return allArticles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: WikiPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  
  if (!article) {
    return {
      title: "الصفحة غير موجودة",
    };
  }

  return {
    title: article.title,
    description: article.content.substring(0, 160).replace(/[#*`]/g, ""),
  };
}

export default async function WikiPage({ params }: WikiPageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const readingTime = calculateReadingTime(article.content);
  const { prev, next } = getPrevNextArticles(slug);

  return (
    <article className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <header className="mb-12 border-b border-white/10 pb-8">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="px-3 py-1 rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
            {article.section}
          </span>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{readingTime} دقيقة للقراءة</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold gradient-text leading-tight mb-6">
          {article.title}
        </h1>
      </header>

      {/* Content */}
      <MarkdownRenderer content={article.content} />
      
      {/* Navigation */}
      <PrevNextNav prev={prev} next={next} />
    </article>
  );
}
