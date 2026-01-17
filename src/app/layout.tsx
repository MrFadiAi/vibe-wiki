import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { SearchBar } from "@/components/SearchBar";

const cairo = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "دليل البرمجة بالإحساس | Vibe Coding",
  description: "تعلم البرمجة مع الذكاء الاصطناعي والحدس والتدفق الإبداعي. الدليل الشامل للبرمجة العصرية.",
  keywords: ["برمجة", "ذكاء اصطناعي", "تطوير ويب", "Next.js", "كيرسر", "هندسة البرومبت"],
  authors: [{ name: "مجتمع Vibe Coding" }],
  openGraph: {
    title: "دليل البرمجة بالإحساس",
    description: "تعلم البرمجة مع الذكاء الاصطناعي والحدس والتدفق الإبداعي.",
    type: "website",
    locale: "ar_SA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body
        className={`${cairo.variable} ${geistMono.variable} antialiased bg-background text-foreground font-[family-name:var(--font-arabic)]`}
      >
        <div className="flex min-h-screen">
          {/* Sidebar - Right side for RTL */}
          <Sidebar />

          {/* Main content area */}
          <div className="flex-1 lg:pr-80">
            {/* Header with search */}
            <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-4 border-b border-border glass-strong">
              <div className="lg:hidden w-12" /> {/* Spacer for mobile menu button */}
              <div className="flex-1 max-w-2xl mr-auto">
                <SearchBar />
              </div>
            </header>

            {/* Page content */}
            <main className="px-6 py-10 lg:px-16">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
