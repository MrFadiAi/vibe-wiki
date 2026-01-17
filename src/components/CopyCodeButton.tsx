"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyCodeButtonProps {
  code: string;
  className?: string;
}

export function CopyCodeButton({ code, className }: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className={cn(
        "absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-secondary/80 hover:bg-secondary",
        className
      )}
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? (
        <Check className="w-4 h-4 text-neon-green" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </Button>
  );
}
