import { MetadataRoute } from 'next';
import { allArticles } from '@/data/wiki-content';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://vibe-wiki.vercel.app';
  
  return [
    { 
      url: baseUrl, 
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...allArticles.map(article => ({
      url: `${baseUrl}/wiki/${article.slug}`,
      lastModified: new Date(), // Ideally this would be the actual article date
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  ];
}
