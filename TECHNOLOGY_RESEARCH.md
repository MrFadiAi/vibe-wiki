# Wiki Project: Technology Research & Documentation

This document outlines the best practices, implementation patterns, and setup guides for the key technologies used in the Wiki project.

---

## 1. Next.js 15 App Router Best Practices

### Core Principles
- **Server-First Approach**: Use Server Components (RSC) by default to minimize client-side JavaScript.
- **Async Request APIs**: In Next.js 15, APIs like `cookies()`, `headers()`, `params`, and `searchParams` are now asynchronous. Always `await` them.
- **Caching**: GET Route Handlers and Client Router Cache are no longer cached by default in Next.js 15. Opt-in using `export const dynamic = 'force-static'` or similar if needed.
- **Route Groups**: Use `(groupname)` to organize routes without affecting the URL structure (e.g., for different layouts).

### Example: Async Params
```tsx
// app/wiki/[slug]/page.tsx
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <div>Wiki Page: {slug}</div>;
}
```

---

## 2. Shadcn/ui Component Library Patterns

### Adding Components
Use the latest CLI to add components to an existing project.
```bash
# Add a single component
npx shadcn@latest add dialog

# For Next.js 15 (React 19) peer dependency issues
npx shadcn@latest add dialog --legacy-peer-deps
```

### Key Components for Wiki
- **Dialog**: For quick edit modals or settings.
- **Command**: For the command palette (search).
- **Tabs**: For switching between "Read" and "Edit" modes.
- **Sheet**: For mobile sidebar navigation.

---

## 3. Dark Mode with Next-Themes & Tailwind CSS v4

### Tailwind CSS v4 Configuration
Tailwind CSS v4 removes `darkMode: "class"`. Instead, use a custom variant in your CSS.

```css
/* app/globals.css */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

### Implementation with `next-themes`
1. Install `next-themes`.
2. Wrap your layout in a `ThemeProvider`.

```tsx
// app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## 4. Client-Side Search (Fuse.js)

### Implementation Pattern
Use `Fuse.js` for fuzzy search. For performance, dynamically import the library when the user starts typing.

```tsx
"use client";
import { useState } from 'react';

export function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (val.length > 2) {
      const Fuse = (await import('fuse.js')).default;
      const fuse = new Fuse(searchData, { keys: ["title", "content"] });
      setResults(fuse.search(val));
    }
  };

  return <input value={query} onChange={handleSearch} placeholder="Search wiki..." />;
}
```

---

## 5. Mermaid.js Integration

### Custom Mermaid Component
Render diagrams on the client side using the `mermaid` library. Ensure unique IDs for each diagram.

```tsx
"use client";
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, theme: 'default' });

export function MermaidDiagram({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, code).then(({ svg }) => {
        ref.current!.innerHTML = svg;
      });
    }
  }, [code]);

  return <div ref={ref} />;
}
```

---

## 6. PWA Setup for Next.js 15

### Built-in Support
Next.js 15 supports `manifest.ts` and `robots.ts` natively.

```ts
// app/manifest.ts
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vibe Wiki',
    short_name: 'Wiki',
    description: 'An agentic wiki for everyone',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
```

### Service Worker
Place a manual service worker in `public/sw.js` or use **Serwist** for more advanced caching strategies.

---

## 7. SEO Optimization & Dynamic OG Images

### Metadata API
Use `generateMetadata` for dynamic pages.

```tsx
// app/wiki/[slug]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getWikiPost(slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: [`/api/og?title=${post.title}`],
    },
  };
}
```

### Dynamic OG Images with `next/og`
Leverage `ImageResponse` (which uses Satori internally) in a Route Handler.

```tsx
// app/api/og/route.tsx
import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Vibe Wiki';

  return new ImageResponse(
    (
      <div style={{ display: 'flex', fontSize: 60, color: 'white', background: 'black', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        {title}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```
