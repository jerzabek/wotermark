// One-off asset generator. Run with: node scripts/generate-icons.mjs
// Produces favicons, PWA icons and the OG share image from a simple "W" mark.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pub = resolve(root, 'public')
mkdirSync(pub, { recursive: true })

const GREEN = '#4d7c0f'
const LIGHT = '#f7fee7'
const DARK = '#1a2e05'

// The W is a font-free polyline so rendering never depends on installed fonts.
const wMark = (stroke) =>
  `<polyline points="24,30 38,72 50,48 62,72 76,30" fill="none" stroke="${stroke}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`

const roundedIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="22" fill="${GREEN}"/>
  ${wMark(LIGHT)}
</svg>`

// Maskable / apple: full-bleed opaque background, mark kept inside the safe zone.
const fullBleedIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${GREEN}"/>
  <g transform="translate(50 50) scale(0.78) translate(-50 -50)">${wMark(LIGHT)}</g>
</svg>`

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${LIGHT}"/>
  <rect x="80" y="175" width="280" height="280" rx="56" fill="${GREEN}"/>
  <g transform="translate(220 315) scale(2.4) translate(-50 -50)">${wMark(LIGHT)}</g>
  <text x="430" y="300" font-family="Helvetica, Arial, sans-serif" font-size="96" font-weight="800" fill="${DARK}">Wotermark</text>
  <text x="434" y="372" font-family="Helvetica, Arial, sans-serif" font-size="44" font-weight="500" fill="${GREEN}">Batch image watermarking</text>
</svg>`

writeFileSync(resolve(pub, 'favicon.svg'), roundedIcon)

const jobs = [
  [roundedIcon, 'icon-192.png', 192],
  [roundedIcon, 'icon-512.png', 512],
  [fullBleedIcon, 'icon-512-maskable.png', 512],
  [fullBleedIcon, 'apple-touch-icon.png', 180],
]

for (const [svg, name, size] of jobs) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(resolve(pub, name))
  console.log('wrote', name)
}

await sharp(Buffer.from(og)).png().toFile(resolve(pub, 'og.png'))
console.log('wrote og.png')
console.log('wrote favicon.svg')
