import Link from "next/link";
import { ArrowLeft, Sparkles, Terminal, GitBranch, Cpu, Rocket } from "lucide-react";
import { wikiContent, allArticles } from "@/data/wiki-content";
import { Button } from "@/components/ui/button";
import Hero from "@/components/home/Hero";
import LearningPaths from "@/components/home/LearningPaths";

const sectionIcons: Record<string, React.ReactNode> = {
  "التحول الكبير (The Vibe Shift)": <Sparkles className="w-6 h-6" />,
  "الأجهزة والبيئة (Hardware & Environment)": <Terminal className="w-6 h-6" />,
  "التحكم في الإصدارات (Version Control)": <GitBranch className="w-6 h-6" />,
  "حقيبة أدوات الذكاء الاصطناعي (The AI Toolbelt)": <Cpu className="w-6 h-6" />,
  "البناء والشحن (Building & Shipping)": <Rocket className="w-6 h-6" />,
};

export default function Home() {
  const firstArticle = allArticles[0];

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-20">
      {/* Animated Hero Section */}
      <Hero />

      {/* Learning Paths Grid */}
      <LearningPaths />

      {/* Stats / Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        <div className="p-8 rounded-3xl glass border border-border group hover:border-neon-cyan/30 transition-all card-hover">
          <div className="w-12 h-12 rounded-2xl bg-neon-cyan/10 flex items-center justify-center mb-6 text-neon-cyan group-hover:scale-110 transition-transform">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3">سرعة خارقة</h3>
          <p className="text-muted-foreground leading-relaxed">
            استغل قدرات الذكاء الاصطناعي لإنتاج أكواد تعمل في ثوانٍ بدلاً من ساعات.
          </p>
        </div>
        <div className="p-8 rounded-3xl glass border border-border group hover:border-neon-purple/30 transition-all card-hover">
          <div className="w-12 h-12 rounded-2xl bg-neon-purple/10 flex items-center justify-center mb-6 text-neon-purple group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3">تركيز إبداعي</h3>
          <p className="text-muted-foreground leading-relaxed">
            اترك العمل الروتيني للآلة وركز طاقتك على حل المشكلات والابتكار.
          </p>
        </div>
        <div className="p-8 rounded-3xl glass border border-border group hover:border-neon-pink/30 transition-all card-hover">
          <div className="w-12 h-12 rounded-2xl bg-neon-pink/10 flex items-center justify-center mb-6 text-neon-pink group-hover:scale-110 transition-transform">
            <Rocket className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3">شحن فوري</h3>
          <p className="text-muted-foreground leading-relaxed">
            حوّل أفكارك إلى منتجات حقيقية منشورة على الإنترنت بضغطة واحدة.
          </p>
        </div>
      </section>

      {/* Sections List */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold tracking-tight">محتويات الدليل</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent mr-8" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wikiContent.map((section) => (
            <Link
              key={section.name}
              href={`/wiki/${section.articles[0].slug}`}
              className="group relative p-8 rounded-3xl glass border border-border hover:border-neon-cyan/50 transition-all overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan to-neon-purple opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start gap-6">
                <div className="p-4 rounded-2xl bg-secondary text-neon-cyan group-hover:glow-cyan transition-all">
                  {sectionIcons[section.name] || <Sparkles className="w-6 h-6" />}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold group-hover:text-neon-cyan transition-colors mb-1">
                      {section.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {section.articles.length} مقالات تعليمية
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {section.articles.slice(0, 2).map((article) => (
                      <li key={article.slug} className="text-sm flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                        <ArrowLeft className="w-3 h-3 text-neon-purple" />
                        {article.title}
                      </li>
                    ))}
                    {section.articles.length > 2 && (
                      <li className="text-xs text-neon-cyan font-medium">
                        +{section.articles.length - 2} مقالات أخرى...
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Philosophy Banner */}
      <section className="px-4">
        <div className="relative p-12 rounded-[40px] overflow-hidden border border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-background to-neon-cyan/10 -z-10" />
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none -z-10" />
          
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Sparkles className="w-12 h-12 text-neon-purple mx-auto animate-pulse-glow" />
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              &ldquo;البرمجة بالإحساس ليست مجرد طريقة جديدة لكتابة الكود، بل هي فلسفة لتمكين المبدعين من بناء المستقبل.&rdquo;
            </h2>
            <div className="flex items-center justify-center gap-4 text-muted-foreground">
              <div className="h-px w-12 bg-border" />
              <span className="text-sm font-medium tracking-widest uppercase">فريق Vibe Coding</span>
              <div className="h-px w-12 bg-border" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Call to Action */}
      <section className="text-center py-10 px-4">
        <h3 className="text-2xl font-bold mb-6">جاهز للانضمام إلى الثورة؟</h3>
        <Button asChild size="lg" className="rounded-2xl px-12 bg-white text-black hover:bg-white/90 font-bold h-14">
          <Link href={`/wiki/${firstArticle.slug}`}>
            ابدأ رحلتك الآن
          </Link>
        </Button>
      </section>
    </div>
  );
}
