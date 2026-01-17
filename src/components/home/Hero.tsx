'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, Sparkles, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const taglines = [
  "مستقبل البرمجة يبدأ هنا",
  "اصنع أفكارك بالذكاء الاصطناعي",
  "من الفكرة إلى المنتج في دقائق"
];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % taglines.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-20">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-neon-purple/20 via-neon-cyan/5 to-transparent blur-[100px] animate-pulse-slow" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-cyan/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-pink/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
      </div>

      <div className="container relative z-10 px-4 text-center max-w-5xl mx-auto">
        {/* Animated Tagline Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass border border-neon-cyan/20 mb-10 overflow-hidden relative group cursor-default"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Zap className="w-4 h-4 text-neon-cyan animate-pulse" />
          <div className="relative h-6 w-64 overflow-hidden text-sm font-medium text-neon-cyan text-right">
            <AnimatePresence mode="wait">
              <motion.span
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-end"
              >
                {taglines[index]}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[1.1]"
        >
          <span className="block text-foreground drop-shadow-lg">مانيفستو</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink animate-gradient-x drop-shadow-2xl filter">
            البرمجة بالإحساس
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed font-light"
        >
          تعلم كيف تبني أفكارك باستخدام <span className="text-neon-cyan font-bold glow-cyan">الذكاء الاصطناعي</span>، 
          ثق بـ <span className="text-neon-purple font-bold glow-purple">حدسك</span>، 
          واستمتع بـ <span className="text-neon-pink font-bold glow-pink">التدفق الإبداعي</span>. 
          <br className="hidden md:block" />
          توقف عن حفظ الأكواد، وابدأ في بناء المنتجات.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Button asChild size="xl" className="h-16 px-12 text-lg rounded-2xl bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-bold hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(0,255,255,0.5)] transition-all duration-300 border-0 group relative overflow-hidden">
            <Link href="/wiki/what-is-vibe-coding" className="flex items-center gap-3">
              <span className="relative z-10">ابدأ التعلم الآن</span>
              <ArrowLeft className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="xl" className="h-16 px-12 text-lg rounded-2xl border-white/10 glass hover:bg-white/5 hover:border-neon-pink/50 text-foreground font-semibold hover:scale-105 transition-all duration-300 group">
            <Link href="/wiki/the-vibe-stack" className="flex items-center gap-3">
              <span className="group-hover:text-neon-pink transition-colors">اكتشف الحزمة التقنية</span>
              <Sparkles className="w-5 h-5 text-neon-pink opacity-50 group-hover:opacity-100 transition-opacity" />
            </Link>
          </Button>
        </motion.div>

        {/* Floating Code/Icons Elements (Decorative) */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-[10%] hidden lg:block opacity-20 pointer-events-none"
        >
          <Rocket className="w-24 h-24 text-neon-purple rotate-12" />
        </motion.div>
        
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 left-[10%] hidden lg:block opacity-20 pointer-events-none"
        >
          <div className="font-mono text-neon-cyan text-left text-sm p-4 rounded-xl border border-neon-cyan/30 glass">
            <div>npm run dev</div>
            <div className="text-green-400">Ready in 2.4s</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
