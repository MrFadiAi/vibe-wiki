"use client";

import { useState, useEffect } from "react";
import { SidebarContent } from "@/components/Sidebar";
import { Home, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when pathname changes
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-background/80 backdrop-blur-xl lg:hidden pb-safe">
        <div className="flex h-16 items-center justify-around px-4">
          <Link
            href="/"
            className={cn(
              "flex flex-col items-center gap-1 p-2 text-xs transition-colors",
              pathname === "/" ? "text-neon-cyan" : "text-muted-foreground"
            )}
          >
            <Home className="h-5 w-5" />
            <span>الرئيسية</span>
          </Link>

          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'k', 'metaKey': true}))}
            className="flex flex-col items-center gap-1 p-2 text-xs text-muted-foreground hover:text-neon-cyan transition-colors"
          >
            <Search className="h-5 w-5" />
            <span>بحث</span>
          </button>

          <button
            onClick={() => setIsOpen(true)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 text-xs transition-colors",
              isOpen ? "text-neon-cyan" : "text-muted-foreground"
            )}
          >
            <Menu className="h-5 w-5" />
            <span>القائمة</span>
          </button>
        </div>
      </nav>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-background lg:hidden flex flex-col"
          >
            {/* Close Button */}
            <div className="absolute top-4 left-4 z-50">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
              >
                <X className="h-6 w-6 text-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden pt-12">
               <SidebarContent onLinkClick={() => setIsOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
