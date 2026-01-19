"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { InteractiveCodeBlock } from "./InteractiveCodeBlock";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <article className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h1:text-transparent prose-h1:bg-clip-text prose-h1:bg-gradient-to-r prose-h1:from-neon-cyan prose-h1:to-neon-purple prose-a:text-neon-cyan prose-a:no-underline hover:prose-a:underline prose-pre:bg-transparent prose-pre:border-0 prose-pre:p-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeSlug]}
        components={{
          pre: ({ children }) => {
            const codeElement = React.Children.toArray(children).find(
              (child) => React.isValidElement(child) && child.type === "code"
            ) as React.ReactElement | undefined;
             
            const codeProps = codeElement?.props as { className?: string; children?: React.ReactNode } | undefined;
            const rawCode = codeProps?.children;
            const className = codeProps?.className || "";
            const languageMatch = /language-(\w+)/.exec(className);
            const language = languageMatch ? languageMatch[1] : "";
             
            return (
              <InteractiveCodeBlock 
                code={String(rawCode || "").replace(/\n$/, "")} 
                language={language}
              >
                {children}
              </InteractiveCodeBlock>
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
