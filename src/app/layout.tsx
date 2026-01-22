import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import { Cairo } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import CommandMenu from "@/components/search/CommandMenu";

const cairo = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#030712",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "موسوعة البرمجة بالذكاء الاصطناعي",
    template: "%s | موسوعة البرمجة",
  },
  description: "الدليل الشامل للبرمجة مع الذكاء الاصطناعي.",
  keywords: ["برمجة", "ذكاء اصطناعي", "Next.js", "Cursor", "Windsurf"],
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${geistMono.variable} antialiased bg-background text-foreground font-[family-name:var(--font-arabic)] min-h-screen selection:bg-neon-cyan/30 selection:text-neon-cyan`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <CommandMenu />
          
          <div className="relative min-h-screen">
            {/* Sidebar - Fixed on Right */}
            <Sidebar />
            
            {/* Main Content Area */}
            <div className="lg:mr-80 min-h-screen flex flex-col transition-[margin] duration-300 ease-in-out">
              {/* Background Effects */}
              <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-purple/10 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-cyan/10 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />
              </div>

              <main className="relative z-10 flex-1 px-4 py-8 md:px-8 lg:px-12 max-w-7xl mx-auto w-full">
                {children}
              </main>
            </div>
          </div>

          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
