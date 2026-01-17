"use client";

import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  paths: BreadcrumbItem[];
}

export function Breadcrumbs({ paths }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm flex-wrap">
      {/* Home icon */}
      <Link
        href="/"
        className="p-1.5 rounded-lg text-muted-foreground hover:text-neon-cyan hover:bg-neon-cyan/10 transition-all"
        aria-label="الرئيسية"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </Link>

      {paths.map((path, index) => {
        const isLast = index === paths.length - 1;

        return (
          <div key={path.href} className="flex items-center gap-2">
            {/* RTL-friendly arrow (points left in RTL) */}
            <svg className="w-4 h-4 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>

            {isLast ? (
              // Current page (not a link)
              <span className="text-foreground font-medium line-clamp-1">
                {path.label}
              </span>
            ) : (
              // Section badge/link
              <Link
                href={path.href}
                className="px-3 py-1.5 rounded-full bg-neon-purple/10 text-neon-purple text-xs font-medium 
                  border border-neon-purple/20 hover:bg-neon-purple/20 hover:border-neon-purple/40 transition-all"
              >
                {path.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;
