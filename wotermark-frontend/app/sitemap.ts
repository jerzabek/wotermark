import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/shared/config/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/about', '/privacy', '/contact']

  return routes.map(route => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: route === '' ? 'monthly' : 'yearly',
    priority: route === '' ? 1 : 0.6,
  }))
}
