import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getArticleBySlug, allArticles } from "@/data/wiki-content";
import { ArticleContent } from "@/components/ArticleContent";

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
      title: "Not Found | The Vibe Coding Manifesto",
    };
  }

  return {
    title: `${article.title} | The Vibe Coding Manifesto`,
    description: `Learn about ${article.title} in the ${article.section} section of The Vibe Coding Manifesto.`,
  };
}

export default async function WikiPage({ params }: WikiPageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return <ArticleContent article={article} />;
}
