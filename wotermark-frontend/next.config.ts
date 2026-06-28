import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'
const backendOrigin = process.env.BACKEND_ORIGIN ?? 'http://localhost:8080'

const nextConfig: NextConfig = {
  // next/image optimization needs a server; disable it (also required for export).
  images: { unoptimized: true },
  ...(isDev
    ? {
        // Dev only: proxy /api/* to the Go backend so the frontend works on
        // :5173 with no CORS and without the nginx router. Ignored by the
        // static production build (your reverse proxy / Cloudflare serves /api).
        async rewrites() {
          return [{ source: '/api/:path*', destination: `${backendOrigin}/api/:path*` }]
        },
      }
    : {
        // Full static export (SSG) — outputs ./out, served as plain files behind
        // nginx/Cloudflare (see Dockerfile). No Node server at runtime.
        output: 'export',
      }),
}

export default nextConfig
