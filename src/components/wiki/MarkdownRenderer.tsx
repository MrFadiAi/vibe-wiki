"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/ui/CopyButton";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <article className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h1:text-transparent prose-h1:bg-clip-text prose-h1:bg-gradient-to-r prose-h1:from-neon-cyan prose-h1:to-neon-purple prose-a:text-neon-cyan prose-a:no-underline hover:prose-a:underline prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-white/10">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeSlug]}
        components={{
          pre: ({ children, ...props }) => {
             // Extract code string for CopyButton
             const codeElement = React.Children.toArray(children).find(
               (child) => React.isValidElement(child) && child.type === 'code'
             ) as React.ReactElement | undefined;
             
             const rawCode = (codeElement?.props as any)?.children;
             
             return (
               <div className="relative group">
                 <pre {...props} className={cn("rounded-xl p-4 overflow-x-auto", props.className)}>
                   {children}
                 </pre>
                 {rawCode && (
                   <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                     <CopyButton value={String(rawCode).replace(/\n$/, '')} />
                   </div>
                 )}
               </div>
             );
          },
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;
            return (
              <code
                className={cn(
                  isInline ? "bg-white/10 text-neon-cyan rounded px-1.5 py-0.5 font-mono text-sm" : "",
                  className
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
