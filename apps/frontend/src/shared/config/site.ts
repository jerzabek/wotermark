/**
 * Single source of truth for site-wide metadata.
 * SITE_URL feeds canonical URLs, Open Graph tags, the sitemap, robots.txt and
 * JSON-LD. It is read from NEXT_PUBLIC_SITE_URL (see .env.development for local
 * defaults and .env.example for production) and falls back to the prod domain.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wotermark.jarza.cc'
export const SITE_NAME = 'Wotermark'
export const SITE_TAGLINE = 'Batch image watermarking, right in your browser'
export const SITE_DESCRIPTION =
  'Free online tool to batch-apply a watermark to many images at once. Your images are processed without being stored — fast, simple and private.'
export const SITE_AUTHOR = 'Ivan Jeržabek'
export const SITE_LOCALE = 'en'

/** Optional public source repo. Leave empty to hide the GitHub link in the footer. */
export const REPO_URL = 'https://github.com/jerzabek/wotermark'
