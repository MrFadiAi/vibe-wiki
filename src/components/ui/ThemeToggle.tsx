"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="relative p-2.5 rounded-xl glass border border-border hover:border-neon-cyan/50 transition-all duration-300"
        aria-label="تبديل الوضع"
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative p-2.5 rounded-xl glass border border-border transition-all duration-300 group overflow-hidden",
        "hover:border-neon-cyan/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]",
        "active:scale-95"
      )}
      aria-label={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
    >
      {/* Background glow effect */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          isDark
            ? "bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10"
            : "bg-gradient-to-br from-sunset-300/20 to-sunset-500/20"
        )}
      />

      {/* Icon container with animation */}
      <div className="relative w-5 h-5">
        {/* Sun icon */}
        <Sun
          className={cn(
            "absolute inset-0 w-5 h-5 transition-all duration-500",
            isDark
              ? "opacity-0 rotate-90 scale-0 text-sunset-400"
              : "opacity-100 rotate-0 scale-100 text-sunset-400"
          )}
        />
        {/* Moon icon */}
        <Moon
          className={cn(
            "absolute inset-0 w-5 h-5 transition-all duration-500",
            isDark
              ? "opacity-100 rotate-0 scale-100 text-neon-cyan"
              : "opacity-0 -rotate-90 scale-0 text-neon-cyan"
          )}
        />
      </div>

      {/* Animated ring on hover */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          isDark
            ? "ring-1 ring-neon-cyan/30"
            : "ring-1 ring-sunset-400/30"
        )}
      />
    </button>
  );
}
