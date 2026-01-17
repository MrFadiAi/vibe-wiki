"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SearchBar } from "@/components/SearchBar";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/wiki/what-is-vibe-coding", label: "ابدأ من هنا" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-border/50",
        "bg-background/60 backdrop-blur-xl",
        "supports-[backdrop-filter]:bg-background/40"
      )}
    >
      {/* Main header content */}
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Right side - Logo (RTL) */}
        <Link
          href="/"
          className="group flex items-center gap-3 transition-all duration-300 hover:opacity-90"
        >
          <div className="relative p-2 rounded-xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink animate-gradient">
            <Sparkles className="w-5 h-5 text-white" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink blur-lg opacity-50 -z-10 group-hover:opacity-75 transition-opacity" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg gradient-text leading-tight">
              البرمجة بالإحساس
            </h1>
            <p className="text-xs text-muted-foreground">Vibe Coding</p>
          </div>
        </Link>

        {/* Center - Search (desktop) */}
        <div className="hidden lg:flex flex-1 max-w-xl mx-8">
          <SearchBar />
        </div>

        {/* Left side - Nav + Theme Toggle (RTL) */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-l from-neon-cyan/20 to-transparent text-neon-cyan"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="sr-only">(الصفحة الحالية)</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              "lg:hidden p-2.5 rounded-xl glass border border-border transition-all duration-300",
              "hover:border-neon-cyan/50 active:scale-95",
              mobileMenuOpen && "border-neon-cyan/50 bg-neon-cyan/5"
            )}
            aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-neon-cyan" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300 ease-out",
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 py-4 space-y-3 border-t border-border/50 bg-background/80 backdrop-blur-xl">
          {/* Mobile search */}
          <div className="pb-2">
            <SearchBar />
          </div>

          {/* Mobile nav links */}
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-l from-neon-cyan/20 to-transparent text-neon-cyan border-r-2 border-neon-cyan"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
