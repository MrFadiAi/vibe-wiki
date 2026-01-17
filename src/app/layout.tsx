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
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#030712",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://vibe-wiki.vercel.app"),
  title: {
    default: "دليل البرمجة بالإحساس | Vibe Coding",
    template: "%s | Vibe Coding",
  },
  description: "تعلم البرمجة مع الذكاء الاصطناعي والحدس والتدفق الإبداعي. الدليل الشامل للبرمجة العصرية.",
  keywords: ["برمجة", "ذكاء اصطناعي", "تطوير ويب", "Next.js", "كيرسر", "هندسة البرومبت"],
  authors: [{ name: "مجتمع Vibe Coding" }],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon-192.svg",
    shortcut: "/icon-192.svg",
    apple: "/icon-192.svg",
  },
  openGraph: {
    title: "دليل البرمجة بالإحساس",
    description: "تعلم البرمجة مع الذكاء الاصطناعي والحدس والتدفق الإبداعي.",
    type: "website",
    locale: "ar_SA",
    siteName: "Vibe Coding Wiki",
    images: [
      {
        url: "/icon-512.svg",
        width: 512,
        height: 512,
        alt: "Vibe Coding Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "دليل البرمجة بالإحساس",
    description: "تعلم البرمجة مع الذكاء الاصطناعي والحدس والتدفق الإبداعي.",
    images: ["/icon-512.svg"],
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
        className={`${cairo.variable} ${geistMono.variable} antialiased bg-background text-foreground font-[family-name:var(--font-arabic)]`}
      >
        <ThemeProvider>
          <CommandMenu />
          <div className="flex min-h-screen">
            {/* Sidebar - Right side for RTL */}
            <Sidebar />

            {/* Main content area */}
            <div className="flex-1 lg:pr-80">
              {/* Page content */}
              <main className="px-6 py-10 lg:px-16 pb-24 lg:pb-10">
                {children}
              </main>
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
