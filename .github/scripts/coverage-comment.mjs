#!/usr/bin/env node
// Build the PR coverage comment: a head-vs-base diff for whichever apps ran.
//
// Reads artifacts downloaded by ci.yml (one folder per artifact):
//   <ARTIFACTS_DIR>/coverage-frontend-{head,base}/coverage-summary.json  (vitest)
//   <ARTIFACTS_DIR>/coverage-backend-{head,base}/coverage.func.txt        (go tool cover -func)
// and writes Markdown to OUTPUT_FILE. Missing/empty inputs degrade gracefully
// to "no baseline" — this is a report, it never throws the build.

import fs from 'node:fs'
import path from 'node:path'

const ARTIFACTS_DIR = process.env.ARTIFACTS_DIR || 'coverage-artifacts'
const OUTPUT_FILE = process.env.OUTPUT_FILE || 'coverage-comment.md'
const HEAD_SHA = process.env.HEAD_SHA || ''
const BASE_REF = process.env.BASE_REF || 'base'
const BASE_SHA = process.env.BASE_SHA || ''
const MARKER = '<!-- coverage-report -->'
const MAX_ROWS = 50 // cap noisy per-file/per-function diff tables

const read = file => {
  try {
    return fs.readFileSync(file, 'utf8')
  } catch {
    return null
  }
}

const pct = n => (typeof n === 'number' && Number.isFinite(n) ? `${n.toFixed(2)}%` : '—')
const short7 = sha => (sha ? sha.slice(0, 7) : '')

// 🟢/🔴/▪️ delta, or "no baseline" when the base side is absent.
function delta(base, head) {
  if (typeof head !== 'number') return '—'
  if (typeof base !== 'number') return '🆕 no baseline'
  const d = head - base
  if (Math.abs(d) < 0.005) return '▪️ ±0.00%'
  const sign = d > 0 ? '+' : '−'
  return `${d > 0 ? '🟢' : '🔴'} ${sign}${Math.abs(d).toFixed(2)}%`
}

// ---- Frontend (vitest json-summary) ----
function parseFrontend(refName) {
  const raw = read(path.join(ARTIFACTS_DIR, `coverage-frontend-${refName}`, 'coverage-summary.json'))
  if (!raw) return null
  let json
  try {
    json = JSON.parse(raw)
  } catch {
    return null
  }
  if (!json || !json.total || typeof json.total.lines?.pct !== 'number') return null
  const metric = m => json.total[m]?.pct
  const files = {}
  for (const [key, val] of Object.entries(json)) {
    if (key === 'total' || typeof val?.lines?.pct !== 'number') continue
    const name = key.includes('/src/') ? `src/${key.split('/src/').pop()}` : path.basename(key)
    files[name] = val.lines.pct
  }
  return { total: { lines: metric('lines'), statements: metric('statements'), functions: metric('functions'), branches: metric('branches') }, files }
}

// ---- Backend (go tool cover -func text) ----
function parseBackend(refName) {
  const raw = read(path.join(ARTIFACTS_DIR, `coverage-backend-${refName}`, 'coverage.func.txt'))
  if (!raw || !raw.trim()) return null
  let total = null
  const funcs = {}
  for (const line of raw.split('\n')) {
    const totalMatch = line.match(/^total:\s+\(statements\)\s+([\d.]+)%/)
    if (totalMatch) {
      total = parseFloat(totalMatch[1])
      continue
    }
    const m = line.match(/^(.*?\.go):(\d+):\s+(\S+)\s+([\d.]+)%\s*$/)
    if (m) {
      const file = m[1].replace(/^wotermark-backend\//, '')
      funcs[`${file}:${m[3]}`] = parseFloat(m[4])
    }
  }
  if (total === null) return null
  return { total, funcs }
}

// A head-vs-base table for a map of name -> pct, keeping only changed/new/removed rows.
function diffTable(headMap, baseMap, label) {
  const names = new Set([...Object.keys(headMap || {}), ...Object.keys(baseMap || {})])
  const rows = []
  for (const name of names) {
    const h = headMap?.[name]
    const b = baseMap?.[name]
    if (typeof h === 'number' && typeof b === 'number' && Math.abs(h - b) < 0.005) continue
    rows.push({ name, b, h })
  }
  if (!rows.length) return `_No per-${label} changes._`
  rows.sort((a, b) => {
    const da = typeof a.h === 'number' && typeof a.b === 'number' ? a.h - a.b : -Infinity
    const db = typeof b.h === 'number' && typeof b.b === 'number' ? b.h - b.b : -Infinity
    return da - db // biggest drops first
  })
  const shown = rows.slice(0, MAX_ROWS)
  const lines = [`| ${label[0].toUpperCase() + label.slice(1)} | Base | PR | Δ |`, '|---|---:|---:|:--|']
  for (const r of shown) lines.push(`| \`${r.name}\` | ${pct(r.b)} | ${pct(r.h)} | ${delta(r.b, r.h)} |`)
  if (rows.length > shown.length) lines.push(`\n_…and ${rows.length - shown.length} more._`)
  return lines.join('\n')
}

// ---- Assemble ----
const fe = { head: parseFrontend('head'), base: parseFrontend('base') }
const be = { head: parseBackend('head'), base: parseBackend('base') }

const out = [MARKER, '## 🧪 Coverage report', '']

if (!fe.head && !be.head) {
  out.push('_No coverage was produced for this change._')
} else {
  out.push('| Project | Coverage | Δ vs base |', '|---|---:|:--|')
  if (fe.head) out.push(`| **Frontend** (lines) | ${pct(fe.head.total.lines)} | ${delta(fe.base?.total.lines, fe.head.total.lines)} |`)
  if (be.head) out.push(`| **Backend** (statements) | ${pct(be.head.total)} | ${delta(be.base?.total, be.head.total)} |`)
  out.push('')

  if (fe.head) {
    out.push('<details>', '<summary>Frontend details</summary>', '')
    out.push('| Metric | Base | PR | Δ |', '|---|---:|---:|:--|')
    for (const m of ['lines', 'statements', 'functions', 'branches']) {
      const label = m[0].toUpperCase() + m.slice(1)
      out.push(`| ${label} | ${pct(fe.base?.total[m])} | ${pct(fe.head.total[m])} | ${delta(fe.base?.total[m], fe.head.total[m])} |`)
    }
    out.push('', '**Changed files (line coverage)**', '', diffTable(fe.head.files, fe.base?.files, 'file'), '', '</details>', '')
  }

  if (be.head) {
    out.push('<details>', '<summary>Backend details</summary>', '')
    out.push(`Total statement coverage: **${pct(be.head.total)}** (base ${pct(be.base?.total)}, ${delta(be.base?.total, be.head.total)})`, '')
    out.push('**Changed functions**', '', diffTable(be.head.funcs, be.base?.funcs, 'function'), '', '</details>', '')
  }

  const skipped = []
  if (!fe.head) skipped.push('frontend')
  if (!be.head) skipped.push('backend')
  if (skipped.length) out.push(`_${skipped.join(' and ')} not affected by this PR — not run._`, '')
}

const footer = `Comparing \`${short7(HEAD_SHA)}\` against base \`${BASE_REF}\`${BASE_SHA ? ` (\`${short7(BASE_SHA)}\`)` : ''}. Report only — coverage never fails the build.`
out.push('---', footer)

fs.writeFileSync(OUTPUT_FILE, out.join('\n') + '\n')
console.log(`Wrote ${OUTPUT_FILE}`)
