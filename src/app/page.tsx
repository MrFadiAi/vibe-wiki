import { Hero } from "@/components/home/Hero";
import { LearningPaths } from "@/components/home/LearningPaths";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <LearningPaths />
    </div>
  );
}
