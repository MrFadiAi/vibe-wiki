import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Cpu, PenTool, Rocket, Terminal, GitBranch, Database, Layout } from "lucide-react";

const tutorials = [
  {
    title: "Getting Started with Vibe Coding",
    description: "Learn the fundamentals of AI-assisted programming and flow state development.",
    icon: <Rocket className="h-6 w-6 text-neon-green" />,
    level: "Beginner",
    duration: "15 min",
    href: "/wiki/what-is-vibe-coding",
    color: "from-neon-green/20 to-transparent",
  },
  {
    title: "Setting Up Your Environment",
    description: "Install and configure Cursor, Windsurf, and essential development tools.",
    icon: <Terminal className="h-6 w-6 text-neon-cyan" />,
    level: "Beginner",
    duration: "20 min",
    href: "/wiki/prep-your-machine",
    color: "from-neon-cyan/20 to-transparent",
  },
  {
    title: "The Vibe Stack Explained",
    description: "Master Next.js, Tailwind CSS, and Supabase for rapid development.",
    icon: <Layout className="h-6 w-6 text-neon-purple" />,
    level: "Intermediate",
    duration: "25 min",
    href: "/wiki/the-vibe-stack",
    color: "from-neon-purple/20 to-transparent",
  },
  {
    title: "Version Control with Git",
    description: "Learn essential Git workflows for collaborative AI-assisted development.",
    icon: <GitBranch className="h-6 w-6 text-neon-pink" />,
    level: "Intermediate",
    duration: "30 min",
    href: "/wiki/git-basics",
    color: "from-neon-pink/20 to-transparent",
  },
  {
    title: "Understanding LLMs",
    description: "Deep dive into Large Language Models and how they assist in coding.",
    icon: <Cpu className="h-6 w-6 text-neon-green" />,
    level: "Advanced",
    duration: "35 min",
    href: "/wiki/llms-explained",
    color: "from-neon-green/20 to-transparent",
  },
  {
    title: "Design to Code Workflow",
    description: "Transform Figma designs into production-ready code using AI.",
    icon: <PenTool className="h-6 w-6 text-neon-cyan" />,
    level: "Intermediate",
    duration: "40 min",
    href: "/wiki/design-to-code",
    color: "from-neon-cyan/20 to-transparent",
  },
  {
    title: "Database Design with Supabase",
    description: "Build scalable backends with PostgreSQL and real-time subscriptions.",
    icon: <Database className="h-6 w-6 text-neon-purple" />,
    level: "Advanced",
    duration: "45 min",
    href: "/wiki/supabase-guide",
    color: "from-neon-purple/20 to-transparent",
  },
  {
    title: "Building Your First App",
    description: "Complete project: Build and deploy a full-stack application.",
    icon: <BookOpen className="h-6 w-6 text-neon-pink" />,
    level: "Beginner",
    duration: "60 min",
    href: "/wiki/first-project",
    color: "from-neon-pink/20 to-transparent",
  },
];

export default function TutorialsPage() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Tutorials</h1>
        <p className="text-lg text-muted-foreground">
          Step-by-step guides to master vibe coding and AI-assisted development.
        </p>
      </div>

      {/* Tutorial Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tutorials.map((tutorial, index) => (
          <motion.div
            key={tutorial.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={tutorial.href}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-white/20 hover:bg-white/10 transition-all"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${tutorial.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative flex flex-col gap-4 flex-1">
                {/* Icon */}
                <div className="rounded-lg bg-white/5 p-3 w-fit ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300">
                  {tutorial.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold leading-7 mb-2">{tutorial.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground group-hover:text-foreground transition-colors">
                    {tutorial.description}
                  </p>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <span className="text-xs px-2 py-1 rounded-full bg-white/5 ring-1 ring-white/10">
                    {tutorial.level}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {tutorial.duration}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
