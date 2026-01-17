import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getArticleBySlug, allArticles } from "@/data/wiki-content";
import { ArticleContent } from "@/components/ArticleContent";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { ArticleHeader } from "@/components/article/ArticleHeader";
import { TableOfContents } from "@/components/article/TableOfContents";
import { extractHeadings } from "@/lib/article-utils";

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
      title: "الصفحة غير موجودة | Vibe Wiki",
    };
  }

  const title = `${article.title} | Vibe Wiki`;
  // Create a clean description from content (strip markdown chars if possible, or just take substring)
  const description = article.content
    .replace(/[#*`]/g, '') // Basic markdown stripping
    .substring(0, 160)
    .trim() + '...';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://vibe-wiki.vercel.app/wiki/${slug}`,
      publishedTime: new Date().toISOString(), // In a real app, use article date
      images: [
        {
          url: '/icon-512.svg', // Using SVG as placeholder or generic image
          width: 512,
          height: 512,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: ['/icon-512.svg'],
    },
  };
}

export default async function WikiPage({ params }: WikiPageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // Extract headings for ToC (now using server-side utility)
  const headings = extractHeadings(article.content);

  return (
    <>
      {/* Scroll progress bar at top */}
      <ScrollProgress />

      {/* Table of Contents - fixed on desktop, hidden on mobile */}
      <TableOfContents headings={headings} />

      {/* Main content area with margin for ToC on large screens */}
      <div className="lg:mr-72">
        {/* Article Header with breadcrumbs, title, reading time */}
        <ArticleHeader
          title={article.title}
          section={article.section}
          content={article.content}
          slug={article.slug}
        />

        {/* Article Content */}
        <ArticleContent article={article} />
      </div>
    </>
  );
}
