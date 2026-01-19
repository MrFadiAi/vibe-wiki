import { allArticles } from "@/lib/article-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Clock, FileCode, ArrowRight } from "lucide-react";
import { calculateReadingTime } from "@/lib/article-utils";

function getUniqueSections(articles: typeof allArticles): string[] {
  const sections = new Set(articles.map(a => a.section));
  return Array.from(sections).sort();
}

function getArticlesBySection(articles: typeof allArticles, section: string) {
  return articles.filter(a => a.section === section);
}

export default function BrowsePage() {
  const sections = getUniqueSections(allArticles);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight">Browse All Content</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Explore {allArticles.length} articles across {sections.length} categories
          </p>
        </div>
      </div>

      {/* Navigation back to home */}
      <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/">
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Content by section */}
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8 space-y-16">
        {sections.map((section) => {
          const sectionArticles = getArticlesBySection(allArticles, section);
          return (
            <section key={section}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">{section}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {sectionArticles.length} article{sectionArticles.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sectionArticles.map((article) => {
                  const readingTime = calculateReadingTime(article.content);
                  const hasCode = article.codeBlocks && article.codeBlocks.length > 0;

                  return (
                    <Card
                      key={article.slug}
                      className="group hover:border-white/20 transition-all duration-300 bg-white/5 border-white/10"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="line-clamp-2 group-hover:text-neon-cyan transition-colors">
                            {article.title}
                          </CardTitle>
                        </div>
                        <CardDescription className="line-clamp-3 mt-2">
                          {article.content.slice(0, 150)}...
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            {hasCode && (
                              <div className="flex items-center gap-1" title="Contains code examples">
                                <FileCode className="h-3.5 w-3.5" />
                                <span>Code</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1" title="Reading time">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{readingTime} min</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild className="gap-1 group-hover:bg-neon-cyan/10 group-hover:text-neon-cyan">
                            <Link href={`/wiki/${article.slug}`}>
                              Read
                              <BookOpen className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
