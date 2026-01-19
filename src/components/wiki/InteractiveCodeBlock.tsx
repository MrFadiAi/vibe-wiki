"use client";

import * as React from "react";
import { Play, Check, Copy, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface InteractiveCodeBlockProps {
  code: string;
  language: string;
  children: React.ReactNode;
}

interface ExecutionResult {
  success: boolean;
  output: string[];
  error?: string;
}

// Languages that can be executed in browser
const EXECUTABLE_LANGUAGES = ["javascript", "js", "typescript", "ts"];

function isExecutableLanguage(language: string): boolean {
  return EXECUTABLE_LANGUAGES.includes(language.toLowerCase());
}

// Sandboxed code execution using Function constructor
// This is safer than raw eval but still runs in browser context
function executeCode(code: string): ExecutionResult {
  const output: string[] = [];
  
  try {
    // Create a custom console that captures output
    const customConsole = {
      log: (...args: unknown[]) => {
        output.push(args.map(arg => formatOutput(arg)).join(" "));
      },
      error: (...args: unknown[]) => {
        output.push(`[Error] ${args.map(arg => formatOutput(arg)).join(" ")}`);
      },
      warn: (...args: unknown[]) => {
        output.push(`[Warn] ${args.map(arg => formatOutput(arg)).join(" ")}`);
      },
      info: (...args: unknown[]) => {
        output.push(`[Info] ${args.map(arg => formatOutput(arg)).join(" ")}`);
      },
      table: (data: unknown) => {
        output.push(JSON.stringify(data, null, 2));
      },
    };

    // Wrap code to capture return value
    const wrappedCode = `
      "use strict";
      ${code}
    `;

    // Create and execute function with custom console
    const fn = new Function("console", wrappedCode);
    const result = fn(customConsole);
    
    // If there's a return value, add it to output
    if (result !== undefined) {
      output.push(`→ ${formatOutput(result)}`);
    }

    return { success: true, output };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { 
      success: false, 
      output, 
      error: errorMessage 
    };
  }
}

function formatOutput(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "function") return `[Function: ${value.name || "anonymous"}]`;
  if (Array.isArray(value)) {
    try {
      return JSON.stringify(value);
    } catch {
      return "[Array]";
    }
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "[Object]";
    }
  }
  return String(value);
}

export function InteractiveCodeBlock({ 
  code, 
  language, 
  children 
}: InteractiveCodeBlockProps) {
  const [hasCopied, setHasCopied] = React.useState(false);
  const [isRunning, setIsRunning] = React.useState(false);
  const [result, setResult] = React.useState<ExecutionResult | null>(null);
  const [showOutput, setShowOutput] = React.useState(false);

  const isExecutable = isExecutableLanguage(language);

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setHasCopied(true);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setShowOutput(true);
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const executionResult = executeCode(code);
    setResult(executionResult);
    setIsRunning(false);
  };

  const handleClearOutput = () => {
    setShowOutput(false);
    setResult(null);
  };

  return (
    <div className="relative group">
      <div className="relative">
        <pre className="rounded-xl p-4 overflow-x-auto bg-zinc-900 border border-white/10">
          {children}
        </pre>
        
        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {language && (
            <span className="px-2 py-0.5 text-xs font-mono text-zinc-400 bg-zinc-800 rounded mr-1">
              {language}
            </span>
          )}
          
          {isExecutable && (
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-7 w-7 text-zinc-50 hover:bg-neon-cyan/20 hover:text-neon-cyan transition-colors",
                isRunning && "animate-pulse"
              )}
              onClick={handleRun}
              disabled={isRunning}
              title="Run code"
            >
              <span className="sr-only">Run</span>
              {isRunning ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
          
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-zinc-50 hover:bg-zinc-700 hover:text-zinc-50 transition-colors"
            onClick={handleCopy}
            title="Copy code"
          >
            <span className="sr-only">Copy</span>
            {hasCopied ? (
              <Check className="h-3.5 w-3.5 text-neon-green" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
      
      {showOutput && (
        <div className="mt-2 rounded-lg border border-white/10 bg-zinc-950 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/50 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isRunning ? "bg-yellow-500 animate-pulse" : 
                result?.success ? "bg-neon-green" : "bg-red-500"
              )} />
              <span className="text-xs font-medium text-zinc-400">
                {isRunning ? "Running..." : "Output"}
              </span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-zinc-500 hover:text-zinc-300"
              onClick={handleClearOutput}
              title="Close output"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="p-3 font-mono text-sm max-h-64 overflow-y-auto">
            {isRunning ? (
              <div className="flex items-center gap-2 text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Executing...</span>
              </div>
            ) : result ? (
              <div className="space-y-1">
                {result.output.length > 0 ? (
                  result.output.map((line, index) => (
                    <div 
                      key={index} 
                      className={cn(
                        "whitespace-pre-wrap",
                        line.startsWith("[Error]") ? "text-red-400" :
                        line.startsWith("[Warn]") ? "text-yellow-400" :
                        line.startsWith("→") ? "text-neon-cyan" :
                        "text-zinc-300"
                      )}
                    >
                      {line}
                    </div>
                  ))
                ) : (
                  <span className="text-zinc-500 italic">No output</span>
                )}
                {result.error && (
                  <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/30 text-red-400">
                    <span className="font-semibold">Error: </span>
                    {result.error}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
