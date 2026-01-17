"use client";

import { useEffect, useRef, useState } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({ code, language = "plaintext", title, showLineNumbers = false }: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (codeRef.current) {
      // Reset any previous highlighting
      codeRef.current.removeAttribute("data-highlighted");
      codeRef.current.className = `language-${language}`;
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const lines = code.split("\n");

  return (
    <div className="group relative my-8" dir="ltr">
      {/* Header bar with language badge and title */}
      <div className="flex items-center justify-between px-4 py-2 rounded-t-2xl bg-secondary/80 border border-b-0 border-border">
        <div className="flex items-center gap-3">
          {/* Language badge */}
          <span className="px-3 py-1 text-xs font-mono font-medium text-neon-purple bg-neon-purple/10 rounded-full border border-neon-purple/20">
            {language}
          </span>
          {/* Title if provided */}
          {title && (
            <span className="text-sm text-muted-foreground font-medium">
              {title}
            </span>
          )}
        </div>
        
        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
            bg-background/50 border border-border
            hover:bg-neon-cyan/10 hover:border-neon-cyan/30 hover:text-neon-cyan
            transition-all duration-300"
          aria-label="نسخ الكود"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-neon-green">تم النسخ!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>نسخ</span>
            </>
          )}
        </button>
      </div>

      {/* Code block */}
      <div className="relative rounded-b-2xl glass border border-t-0 border-border overflow-hidden">
        <div className="overflow-x-auto">
          <pre className="!m-0 !rounded-none !border-none !bg-transparent p-6">
            {showLineNumbers ? (
              <div className="flex">
                {/* Line numbers */}
                <div className="flex-shrink-0 pr-4 border-r border-border/50 select-none">
                  {lines.map((_, i) => (
                    <div key={i} className="text-muted-foreground/50 text-right text-sm leading-relaxed">
                      {i + 1}
                    </div>
                  ))}
                </div>
                {/* Code */}
                <code
                  ref={codeRef}
                  className={`language-${language} block pl-4 text-sm leading-relaxed`}
                >
                  {code}
                </code>
              </div>
            ) : (
              <code
                ref={codeRef}
                className={`language-${language} block text-sm leading-relaxed`}
              >
                {code}
              </code>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default CodeBlock;
