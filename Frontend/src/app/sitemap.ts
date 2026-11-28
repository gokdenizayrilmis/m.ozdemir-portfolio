import { MetadataRoute } from 'next';
import { treatmentService, categoryService, blogService } from '@/services';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || 'https://drmustafaozdemir.com'
  ).replace(/\/$/, '');

  const [treatments, categories, blogs] = await Promise.all([
    treatmentService.getAll(),
    categoryService.getAll(),
    blogService.getAll(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/hakkimizda`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kvkk`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/kategori/${c.slug}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const treatmentRoutes: MetadataRoute.Sitemap = treatments.map((t) => ({
    url: `${baseUrl}/${t.slug}`,
    lastModified: t.updatedAt ? new Date(t.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.95, // High priority for treatments (Google Ads & SEO landing)
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogs.map((b) => ({
    url: `${baseUrl}/blog/${b.slug}`,
    lastModified: b.updatedAt ? new Date(b.updatedAt) : new Date(b.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...treatmentRoutes,
    ...blogRoutes,
  ];
}

