"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <div className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8 flex justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-muted-foreground ring-1 ring-white/10 hover:ring-neon-cyan/20 transition-all">
                الدليل الشامل للجيل الجديد من المبرمجين{" "}
                <Link href="/wiki/what-is-vibe-coding" className="font-semibold text-neon-cyan">
                  <span className="absolute inset-0" aria-hidden="true" />
                  اقرأ المزيد <span aria-hidden="true">&larr;</span>
                </Link>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
              <span className="block text-foreground">تعلم البرمجة</span>
              <span className="block bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent pb-2">
                بالإحساس والذكاء الاصطناعي
              </span>
            </h1>
            
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              لا تحفظ الأكواد. افهم المبادئ، واستخدم الذكاء الاصطناعي كقوة خارقة، وابنِ مشاريع أحلامك بسرعة البرق.
            </p>
            
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg" variant="neon" className="group">
                <Link href="/wiki/what-is-vibe-coding">
                  ابدأ الرحلة
                  <Sparkles className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="group">
                <Link href="/wiki/the-vibe-stack">
                  استكشف الأدوات <ArrowRight className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="group">
                <Link href="/browse">
                  تصفح كل المحتوى <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
