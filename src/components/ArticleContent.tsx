"use client";

import { WikiArticle, getAdjacentArticles } from "@/data/wiki-content";
import { PrevNextNavigation } from "@/components/PrevNextNavigation";

interface ArticleContentProps {
  article: WikiArticle;
}

export function ArticleContent({ article }: ArticleContentProps) {
  const { prev, next } = getAdjacentArticles(article.slug);

  // Parse markdown-like content to HTML
  const parseContent = (content: string): string => {
    let html = content;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-10 mb-4 text-foreground">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-12 mb-5 gradient-text">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-4xl md:text-5xl font-bold mb-8 gradient-text leading-tight">$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="italic text-foreground">$1</strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="text-neon-cyan not-italic">$1</em>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="px-2 py-1 rounded-lg bg-neon-cyan/10 text-neon-cyan text-sm font-mono border border-neon-cyan/20" dir="ltr">$1</code>');

    // Code blocks with language
    html = html.replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      (_, lang, code) => {
        const trimmedCode = code.trim();
        const escapedCode = trimmedCode
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        return `<div class="group relative my-8" dir="ltr">
          ${lang ? `<div class="absolute top-0 right-0 px-4 py-2 text-xs text-neon-purple bg-neon-purple/10 rounded-tr-xl rounded-bl-xl font-mono border-b border-l border-neon-purple/20">${lang}</div>` : ''}
          <pre class="p-6 ${lang ? 'pt-12' : ''} rounded-2xl glass border border-border overflow-x-auto"><code class="text-sm font-mono text-foreground leading-relaxed block">${escapedCode}</code></pre>
          <button 
            onclick="navigator.clipboard.writeText(this.dataset.code).then(() => { this.innerHTML = '<svg class=\\'w-4 h-4 text-neon-green\\' fill=\\'none\\' stroke=\\'currentColor\\' viewBox=\\'0 0 24 24\\'><path stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'2\\' d=\\'M5 13l4 4L19 7\\'></path></svg>'; setTimeout(() => this.innerHTML = '<svg class=\\'w-4 h-4\\' fill=\\'none\\' stroke=\\'currentColor\\' viewBox=\\'0 0 24 24\\'><path stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'2\\' d=\\'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z\\'></path></svg>', 2000) })"
            data-code="${trimmedCode.replace(/"/g, '&quot;')}"
            class="absolute top-3 left-3 p-2.5 rounded-xl glass border border-border opacity-0 group-hover:opacity-100 hover:border-neon-cyan/50 hover:bg-neon-cyan/10 transition-all duration-300"
            aria-label="نسخ الكود"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </button>
        </div>`;
      }
    );

    // Tables
    html = html.replace(
      /\|(.+)\|\n\|[-|]+\|\n((?:\|.+\|\n?)+)/g,
      (_, headerRow, bodyRows) => {
        const headers = headerRow.split('|').filter((h: string) => h.trim());
        const rows = bodyRows.trim().split('\n').map((row: string) => 
          row.split('|').filter((cell: string) => cell.trim())
        );
        
        return `<div class="my-8 overflow-x-auto rounded-2xl glass border border-border">
          <table class="w-full border-collapse">
            <thead>
              <tr class="border-b border-border bg-white/5">
                ${headers.map((h: string) => `<th class="px-6 py-4 text-right text-sm font-semibold text-neon-cyan">${h.trim()}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map((row: string[]) => `
                <tr class="border-b border-border/50 hover:bg-white/5 transition-colors">
                  ${row.map((cell: string) => `<td class="px-6 py-4 text-sm text-right">${cell.trim()}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`;
      }
    );

    // Unordered lists
    html = html.replace(/^- (.*$)/gim, '<li class="flex items-start gap-3 py-2 text-muted-foreground"><span class="mt-2 w-2 h-2 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple flex-shrink-0"></span><span>$1</span></li>');
    html = html.replace(/(<li.*<\/li>\n?)+/g, '<ul class="my-6 space-y-1">$&</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="py-2 text-muted-foreground list-decimal mr-6">$1</li>');

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote class="my-6 pr-6 border-r-4 border-neon-purple bg-neon-purple/5 py-4 pl-4 rounded-l-xl text-muted-foreground">$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr class="my-12 border-0 h-px bg-gradient-to-l from-transparent via-border to-transparent" />');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-neon-cyan hover:text-neon-purple underline underline-offset-4 decoration-neon-cyan/30 hover:decoration-neon-purple/50 transition-colors" target="_blank" rel="noopener noreferrer">$1</a>');

    // Paragraphs (wrap remaining text)
    html = html.replace(/^(?!<[a-z])(.*[^\n])$/gim, (match) => {
      if (match.trim() && !match.startsWith('<')) {
        return `<p class="my-5 text-muted-foreground leading-relaxed text-lg">${match}</p>`;
      }
      return match;
    });

    return html;
  };

  return (
    <article className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-10 text-sm">
        <span className="px-3 py-1.5 rounded-full bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
          {article.section}
        </span>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground font-medium">{article.title}</span>
      </div>

      {/* Content */}
      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: parseContent(article.content) }}
      />

      {/* Navigation */}
      <PrevNextNavigation prev={prev} next={next} />
    </article>
  );
}
