/**
 * Warms the Next.js image optimizer cache by crawling all site pages
 * and requesting every /_next/image variant they reference.
 *
 * Usage: node scripts/warm-image-cache.mjs [baseUrl]
 * Default baseUrl: http://localhost:3000
 */
import fs from 'fs'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3000'
const CONCURRENCY = 4

async function get(url) {
  const res = await fetch(url)
  return res.text()
}

function collectImageUrls(html) {
  const urls = new Set()
  for (const m of html.matchAll(/\/_next\/image\?[^"'\s\\]+/g)) {
    urls.add(m[0].replace(/&amp;/g, '&'))
  }
  return [...urls]
}

const out = (m) => process.stdout.write(m + '\n')

// 1. Gather page URLs from sitemap (follows sitemap indexes) + known routes
out(`Crawling ${BASE} …`)
const pageUrls = new Set(['/', '/posts', '/etiquetas', '/acerca'])
const seenMaps = new Set()
const mapQueue = ['/sitemap.xml']
for (;;) {
  const mapPath = mapQueue.pop()
  if (!mapPath || seenMaps.has(mapPath)) continue
  seenMaps.add(mapPath)
  let xml
  try {
    xml = await get(BASE + mapPath)
  } catch {
    continue
  }
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const loc = m[1]
    if (loc.endsWith('.xml')) mapQueue.push(new URL(loc, BASE).pathname)
    else pageUrls.add(loc)
  }
}
out(`Pages: ${pageUrls.size}`)

// 2. Collect image variants from every page
const imageUrls = new Set()
let done = 0
for (const page of pageUrls) {
  try {
    const html = await get(page)
    for (const u of collectImageUrls(html)) imageUrls.add(u.startsWith('http') ? u : BASE + u)
  } catch {
    out(`page failed: ${page}`)
  }
  if (++done % 50 === 0) out(`  scanned ${done}/${pageUrls.size} pages…`)
}
out(`Unique image variants: ${imageUrls.size}`)

// 3. Request each variant (limited concurrency)
let ok = 0
let failed = 0
const queue = [...imageUrls]
async function worker() {
  for (;;) {
    const url = queue.pop()
    if (!url) return
    try {
      const res = await fetch(url)
      res.ok ? ok++ : failed++
    } catch {
      failed++
    }
    if ((ok + failed) % 100 === 0) out(`  warmed ${ok + failed}/${imageUrls.size} …`)
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))
out(`Done. OK=${ok} FAILED=${failed}`)

fs.writeSync(2, '')
process.exit(failed > 0 ? 1 : 0)
