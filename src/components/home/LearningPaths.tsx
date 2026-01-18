"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Cpu, Terminal, Rocket, PenTool } from "lucide-react";

const paths = [
  {
    title: "للمبتدئين (Beginner)",
    description: "ابدأ رحلتك. افهم الفلسفة والأدوات الأساسية.",
    icon: <Rocket className="h-6 w-6 text-neon-green" />,
    href: "/wiki/what-is-vibe-coding",
    color: "from-neon-green/20 to-transparent",
  },
  {
    title: "المتوسط (Intermediate)",
    description: "ابنِ مشاريع حقيقية. أتقن Git و Next.js.",
    icon: <Terminal className="h-6 w-6 text-neon-cyan" />,
    href: "/wiki/prep-your-machine",
    color: "from-neon-cyan/20 to-transparent",
  },
  {
    title: "المتقدم (Advanced)",
    description: "هندسة البرومبت، نماذج اللغة، والأنظمة المعقدة.",
    icon: <Cpu className="h-6 w-6 text-neon-purple" />,
    href: "/wiki/llms-explained",
    color: "from-neon-purple/20 to-transparent",
  },
  {
    title: "للمصممين (Designers)",
    description: "حول تصاميمك إلى كود حي باستخدام الذكاء الاصطناعي.",
    icon: <PenTool className="h-6 w-6 text-neon-pink" />,
    href: "/wiki/the-vibe-stack",
    color: "from-neon-pink/20 to-transparent",
  },
];

export function LearningPaths() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">مسارات التعلم</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            اختر المسار الذي يناسب مستواك واهتماماتك.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {paths.map((path, index) => (
            <motion.div
              key={path.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={path.href}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-white/20 hover:bg-white/10 transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${path.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative flex flex-col gap-4">
                  <div className="rounded-lg bg-white/5 p-3 w-fit ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300">
                    {path.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold leading-7">{path.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground group-hover:text-foreground transition-colors">
                      {path.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
