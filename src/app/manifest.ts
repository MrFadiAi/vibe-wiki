import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vibe Wiki - البرمجة بالإحساس',
    short_name: 'Vibe Wiki',
    description: 'دليل البرمجة بالذكاء الاصطناعي والحدس والتدفق الإبداعي',
    start_url: '/',
    display: 'standalone',
    background_color: '#030712', // bg-background (approx)
    theme_color: '#030712',
    icons: [
      {
        src: '/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  };
}
