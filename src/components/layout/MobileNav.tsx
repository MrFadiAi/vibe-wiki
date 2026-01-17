"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bookmark, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useBookmarks } from "@/hooks/useBookmarks";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  action?: "drawer";
}

const navItems: NavItem[] = [
  { href: "/", icon: Home, label: "الرئيسية" },
  { href: "#search", icon: Search, label: "بحث", action: "drawer" },
  { href: "#bookmarks", icon: Bookmark, label: "المحفوظات", action: "drawer" },
  { href: "#menu", icon: Menu, label: "القائمة", action: "drawer" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const { bookmarks } = useBookmarks();
  const bookmarkCount = bookmarks.length;

  const handleAction = (item: NavItem) => {
    if (item.action === "drawer") {
      // Toggle the sidebar or trigger search
      if (item.href === "#search") {
        // Focus on search input if exists
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="بحث"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else if (item.href === "#menu") {
        // Find and click the sidebar toggle button
        const menuButton = document.querySelector('[aria-label="فتح القائمة"]') as HTMLButtonElement;
        if (menuButton) {
          menuButton.click();
        }
      } else if (item.href === "#bookmarks") {
        // Scroll to bookmarks section if on sidebar, or open sidebar
        const menuButton = document.querySelector('[aria-label="فتح القائمة"]') as HTMLButtonElement;
        if (menuButton) {
          menuButton.click();
        }
      }
      setActiveAction(item.href);
      setTimeout(() => setActiveAction(null), 200);
    }
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "lg:hidden", // Only visible on mobile/tablet
        "border-t border-border/50",
        "bg-background/80 backdrop-blur-xl",
        "supports-[backdrop-filter]:bg-background/60",
        "safe-area-inset-bottom" // For devices with home indicator
      )}
      role="navigation"
      aria-label="القائمة السفلية"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.action
            ? activeAction === item.href
            : pathname === item.href;
          const isBookmark = item.href === "#bookmarks";

          const content = (
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-1",
                "w-full h-full min-h-[48px] min-w-[48px]", // Tap-friendly sizing
                "rounded-xl transition-all duration-300",
                "active:scale-95",
                isActive
                  ? "text-neon-cyan"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Icon container with glow effect */}
              <div className="relative">
                <Icon
                  className={cn(
                    "w-6 h-6 transition-all duration-300",
                    isActive && "drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                  )}
                />
                {/* Bookmark badge */}
                {isBookmark && bookmarkCount > 0 && (
                  <span
                    className={cn(
                      "absolute -top-1 -right-1 flex items-center justify-center",
                      "min-w-[16px] h-4 px-1 text-[10px] font-bold",
                      "bg-gradient-to-br from-neon-pink to-neon-purple text-white",
                      "rounded-full shadow-lg",
                      "animate-scale-up"
                    )}
                  >
                    {bookmarkCount > 9 ? "9+" : bookmarkCount}
                  </span>
                )}
                {/* Active indicator glow */}
                {isActive && (
                  <div
                    className={cn(
                      "absolute inset-0 -z-10",
                      "bg-neon-cyan/20 blur-xl rounded-full",
                      "animate-pulse-glow"
                    )}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-[10px] font-medium transition-all duration-300",
                  isActive && "text-glow-cyan"
                )}
              >
                {item.label}
              </span>

              {/* Active dot indicator */}
              {isActive && (
                <div
                  className={cn(
                    "absolute -bottom-0.5 w-1 h-1 rounded-full",
                    "bg-neon-cyan shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                  )}
                />
              )}
            </div>
          );

          // If it's an action item, render as button
          if (item.action) {
            return (
              <button
                key={item.href}
                onClick={() => handleAction(item)}
                className="relative flex-1 flex items-center justify-center py-2"
                aria-label={item.label}
              >
                {content}
              </button>
            );
          }

          // Otherwise render as link
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex-1 flex items-center justify-center py-2"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {content}
            </Link>
          );
        })}
      </div>

      {/* Decorative top gradient line */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-px",
          "bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent"
        )}
      />
    </nav>
  );
}
