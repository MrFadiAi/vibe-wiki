"use client";

import { useEffect, useRef, useState, useId } from "react";
import mermaid from "mermaid";

interface MermaidProps {
  chart: string;
  title?: string;
}

// Initialize mermaid with dark theme
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    primaryColor: "#22d3ee",
    primaryTextColor: "#f8fafc",
    primaryBorderColor: "#22d3ee",
    lineColor: "#94a3b8",
    secondaryColor: "#a855f7",
    tertiaryColor: "#1e293b",
    background: "#0f172a",
    mainBkg: "#0f172a",
    nodeBkg: "#1e293b",
    clusterBkg: "#1e293b",
    titleColor: "#f8fafc",
    edgeLabelBackground: "#1e293b",
  },
  securityLevel: "loose",
  fontFamily: "inherit",
});

export function Mermaid({ chart, title }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const uniqueId = useId().replace(/:/g, "-");

  useEffect(() => {
    const renderChart = async () => {
      if (!chart.trim()) {
        setError("No chart definition provided");
        return;
      }

      try {
        // Validate and render
        const { svg: renderedSvg } = await mermaid.render(`mermaid-${uniqueId}`, chart.trim());
        setSvg(renderedSvg);
        setError(null);
      } catch (err) {
        console.error("Mermaid render error:", err);
        setError(err instanceof Error ? err.message : "Failed to render diagram");
        setSvg("");
      }
    };

    renderChart();
  }, [chart, uniqueId]);

  if (error) {
    return (
      <div className="my-8 p-6 rounded-2xl glass border border-destructive/30">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-destructive font-medium">خطأ في رسم المخطط</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <pre className="mt-3 p-3 rounded-lg bg-background/50 text-xs text-muted-foreground overflow-x-auto" dir="ltr">
              {chart}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-8">
      {/* Title bar if provided */}
      {title && (
        <div className="flex items-center gap-3 px-4 py-2 rounded-t-2xl bg-secondary/80 border border-b-0 border-border">
          <svg className="w-5 h-5 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          <span className="text-sm text-foreground font-medium">{title}</span>
          <span className="px-2 py-0.5 text-xs font-medium text-neon-purple bg-neon-purple/10 rounded-full border border-neon-purple/20">
            Mermaid
          </span>
        </div>
      )}

      {/* Diagram container */}
      <div 
        ref={containerRef}
        className={`flex justify-center p-6 glass border border-border overflow-x-auto ${title ? 'rounded-b-2xl border-t-0' : 'rounded-2xl'}`}
        dir="ltr"
      >
        {svg ? (
          <div 
            className="mermaid-diagram max-w-full" 
            dangerouslySetInnerHTML={{ __html: svg }} 
          />
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>جاري تحميل المخطط...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Mermaid;
