'use client';

import { Sprout, Rocket, Gem, Palette } from 'lucide-react';
import PathCard from './PathCard';
import { allArticles } from '@/data/wiki-content';

export default function LearningPaths() {
  // Helper to find articles by slug
  const getArticles = (slugs: string[]) => {
    return slugs
      .map(slug => allArticles.find(a => a.slug === slug))
      .filter((a): a is typeof allArticles[0] => !!a);
  };

  const paths = [
    {
      title: "للمبتدئين (Beginner)",
      description: "ابدأ رحلتك في عالم البرمجة بالإحساس. تعلم الأساسيات وكيفية التفكير كمطور في عصر الذكاء الاصطناعي.",
      level: "مبتدئ 🌱",
      estimatedTime: "30 دقيقة",
      icon: <Sprout className="w-6 h-6" />,
      color: "green" as const,
      articles: getArticles(['what-is-vibe-coding', 'prep-your-machine', 'the-terminal']),
    },
    {
      title: "المتوسط (Intermediate)",
      description: "انتقل إلى بناء المشاريع الحقيقية. أتقن الأدوات الأساسية والتحكم في الإصدارات.",
      level: "متوسط 🚀",
      estimatedTime: "45 دقيقة",
      icon: <Rocket className="w-6 h-6" />,
      color: "cyan" as const,
      articles: getArticles(['nodejs-setup', 'what-is-git', 'github-basics']),
    },
    {
      title: "المتقدم (Advanced)",
      description: "تعمق في هندسة البرومبت، وفهم نماذج اللغة الكبيرة، وبناء الأنظمة المعقدة.",
      level: "متقدم 💎",
      estimatedTime: "60 دقيقة",
      icon: <Gem className="w-6 h-6" />,
      color: "purple" as const,
      articles: getArticles(['llms-explained', 'prompt-engineering', 'the-editor']),
    },
    {
      title: "للمصممين (Designers)",
      description: "مسار خاص للمبدعين. كيف تحول تصاميمك إلى كود حي باستخدام أدوات Vibe Coding.",
      level: "مصمم 🎨",
      estimatedTime: "40 دقيقة",
      icon: <Palette className="w-6 h-6" />,
      color: "pink" as const,
      articles: getArticles(['the-vibe-stack', 'hello-world-with-ai', 'deployment']),
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="container px-4 mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              مسارات التعلم المقترحة
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              اختر المسار الذي يناسب مستواك واهتماماتك. تم تصميم كل مسار ليأخذك من نقطة إلى أخرى بأسرع وقت.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {paths.map((path, index) => (
            <PathCard
              key={path.title}
              {...path}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
