/**
 * Migrates posts from the Keystatic/Astro prototype into Payload.
 *
 * Source: /Users/avm/proyectos/cms/new-keystatic-project
 *   - src/content/posts/*.mdoc        (YAML frontmatter + markdown body)
 *   - src/assets/images/posts/**      (cover + inline images)
 *
 * Run:
 *   pnpm payload run scripts/migrate-keystatic.ts            (real run)
 *   pnpm payload run scripts/migrate-keystatic.ts --dry-run  (no writes)
 *
 * Idempotent by post slug: existing posts are skipped.
 */
import fs from 'fs'
import path from 'path'
import { load as yamlLoad } from 'js-yaml'
import sharp from 'sharp'

import configPromise from '@payload-config'
import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  UploadFeature,
  convertMarkdownToLexical,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { getPayload } from 'payload'

import { Banner } from '../src/blocks/Banner/config'
import { Code } from '../src/blocks/Code/config'
import { MediaBlock } from '../src/blocks/MediaBlock/config'

const KEYSTATIC_ROOT = process.env.KEYSTATIC_ROOT
  ? path.resolve(process.env.KEYSTATIC_ROOT)
  : '/Users/avm/proyectos/cms/new-keystatic-project'
const POSTS_DIR = path.join(KEYSTATIC_ROOT, 'src/content/posts')
const ASSETS_DIR = path.join(KEYSTATIC_ROOT, 'src')

const DRY_RUN = process.argv.includes('--dry-run')

interface Frontmatter {
  title: string
  descripcion?: string
  fecha?: string
  etiquetas?: string[]
  portada?: string
}

interface ParsedPost {
  slug: string
  filePath: string
  frontmatter: Frontmatter
  body: string
}

function slugify(tag: string): string {
  return tag
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&[a-z]+;/gi, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Split frontmatter from body; tolerates closing fence glued to first body line (`---## H1`). */
function parseMdoc(filePath: string): ParsedPost | null {
  const raw = fs.readFileSync(filePath, 'utf8')
  const match = /^---\r?\n([\s\S]*?)\r?\n---([\s\S]*)$/.exec(raw)
  if (!match) return null
  const frontmatter = yamlLoad(match[1]) as Frontmatter
  let body = match[2]
  if (!body.startsWith('\n')) body = '\n' + body
  const slug = path.basename(filePath).replace(/\.mdoc$/, '')
  if (!frontmatter?.title) return null
  return { slug, filePath, frontmatter, body }
}

/** Resolve a relative asset path from an mdoc file to a real file under ASSETS_DIR. */
function resolveAsset(fromMdocPath: string, ref: string): string | null {
  const cleaned = ref.split('?')[0].split('#')[0].trim()
  try {
    const abs = path.resolve(path.dirname(fromMdocPath), decodeURIComponent(cleaned))
    return abs.startsWith(ASSETS_DIR) && fs.existsSync(abs) && fs.statSync(abs).isFile() ? abs : null
  } catch {
    return null
  }
}

async function main() {
  const payload = await getPayload({ config: configPromise })

  // Editor config mirroring Posts.content features (UploadFeature handles ![media:id]() placeholders)
  const adapter = lexicalEditor({
    features: ({ rootFeatures }) => [
      ...rootFeatures,
      HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
      BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
      UploadFeature({ collections: { media: { fields: [] } } }),
      FixedToolbarFeature(),
      InlineToolbarFeature(),
      HorizontalRuleFeature(),
    ],
  })
  const { editorConfig } = await adapter({
    config: payload.config,
    isRoot: true,
    parentIsLocalized: false,
  })

  // Existing state for idempotency
  const existingPosts = await payload.find({ collection: 'posts', limit: 0, depth: 0 })
  const existingSlugs = new Set(existingPosts.docs.map((d) => d.slug))
  const existingCats = await payload.find({ collection: 'categories', limit: 0, depth: 0 })
  const categoryIds = new Map<string, number>()
  for (const c of existingCats.docs) categoryIds.set(c.slug, c.id)
  const existingMedia = await payload.find({ collection: 'media', limit: 0, depth: 0 })
  const existingMediaByFilename = new Map<string, number>()
  for (const m of existingMedia.docs)
    if (m.filename) existingMediaByFilename.set(m.filename, m.id)

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.mdoc'))
    .sort()
  const parsed: ParsedPost[] = []
  for (const f of files) {
    const p = parseMdoc(path.join(POSTS_DIR, f))
    if (p) parsed.push(p)
    else console.warn(`SKIP (unparseable): ${f}`)
  }
  console.log(`Found ${parsed.length} mdoc posts, ${existingSlugs.size} existing posts in DB`)

  const stats = {
    mediaCreated: 0,
    mediaReused: 0,
    junkSkipped: 0,
    categoriesCreated: 0,
    externalImages: 0,
    missingAssets: [] as string[],
  }
  const mediaIds = new Map<string, number>() // resolved fs path -> media id

  async function uploadAsset(absPath: string, alt: string): Promise<number | null> {
    const cached = mediaIds.get(absPath)
    if (cached) {
      stats.mediaReused++
      return cached
    }
    // Skip degenerate images (e.g. broken 1000x1 tracking pixels that break sharp resizing)
    try {
      const meta = await sharp(absPath).metadata()
      if ((meta.width ?? 9999) < 8 || (meta.height ?? 9999) < 8) {
        stats.junkSkipped++
        return null
      }
    } catch {
      // unreadable as image: let Payload deal with it
    }
    // Reuse by filename so re-runs don't duplicate already-uploaded files
    const existing = existingMediaByFilename.get(path.basename(absPath))
    if (existing && !DRY_RUN) {
      mediaIds.set(absPath, existing)
      stats.mediaReused++
      return existing
    }
    if (DRY_RUN) return null
    const doc = await payload.create({ collection: 'media', data: { alt }, filePath: absPath })
    mediaIds.set(absPath, doc.id)
    stats.mediaCreated++
    return doc.id
  }

  // 1. Categories from all etiquetas (dedupe by slugified key, keep first-seen casing)
  const tagTitles = new Map<string, string>()
  for (const p of parsed) {
    for (const t of p.frontmatter.etiquetas ?? []) {
      const key = slugify(t)
      if (!tagTitles.has(key)) tagTitles.set(key, t.trim())
    }
  }
  const categoryFailures: string[] = []
  for (const [slug, title] of tagTitles) {
    if (!slug) {
      categoryFailures.push(`(empty slug) <- ${JSON.stringify(title)}`)
      continue
    }
    if (categoryIds.has(slug)) continue
    if (DRY_RUN) {
      categoryIds.set(slug, -1)
    } else {
      try {
        const doc = await payload.create({ collection: 'categories', data: { title, slug } })
        categoryIds.set(slug, doc.id)
        stats.categoriesCreated++
      } catch (err) {
        categoryFailures.push(`${slug}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  }
  if (categoryFailures.length)
    console.log(`category failures (${categoryFailures.length}):\n  ` + categoryFailures.join('\n  '))
  console.log(`Categories: ${tagTitles.size} unique tags (${stats.categoriesCreated} to create)`)

  // 2. Posts
  let created = 0
  let skipped = 0
  const failures: Array<{ slug: string; error: string }> = []

  for (const p of parsed) {
    if (existingSlugs.has(p.slug)) {
      skipped++
      continue
    }
    try {
      // Cover image
      let coverId: number | null = null
      if (p.frontmatter.portada) {
        const coverPath = resolveAsset(p.filePath, p.frontmatter.portada)
        if (coverPath) coverId = await uploadAsset(coverPath, p.frontmatter.title)
        else stats.missingAssets.push(`${p.slug}: portada ${p.frontmatter.portada}`)
      }

      // Inline images: upload locals first, then rewrite refs to ![media:id]()
      // Capture allows balanced single-level parens in filenames and anchors on a file extension
      const INLINE_IMG_RE =
        /!\[([^\]]*)\]\(((?:[^()]|\([^()]*\))+?\.(?:jpe?g|png|gif|webp|avif|svg)["']?)\)/gi
      const inlineIds = new Map<string, number>() // original src -> media id
      let body = p.body.replace(INLINE_IMG_RE, (full, alt: string, srcRaw: string) => {
        const src = srcRaw.replace(/["']+$/, '')
        if (/^(https?:)?\/\//i.test(src)) {
          stats.externalImages++
          return full
        }
        const abs = resolveAsset(p.filePath, src)
        if (!abs) {
          stats.missingAssets.push(`${p.slug}: inline ${src}`)
          return ''
        }
        inlineIds.set(src, -1)
        void alt
        return full
      })
      for (const [src] of inlineIds) {
        const abs = resolveAsset(p.filePath, src)!
        const id = await uploadAsset(abs, '')
        if (id) inlineIds.set(src, id)
      }
      body = body.replace(INLINE_IMG_RE, (full, _alt, srcRaw: string) => {
        const id = inlineIds.get(srcRaw.replace(/["']+$/, ''))
        return id && id > 0 ? `![media:${id}]()` : full
      })

      const content = convertMarkdownToLexical({ editorConfig, markdown: body })
      const catIds = (p.frontmatter.etiquetas ?? [])
        .map((t) => categoryIds.get(slugify(t)))
        .filter((id): id is number => typeof id === 'number' && id > 0)

      if (!DRY_RUN) {
        await payload.create({
          collection: 'posts',
          draft: false,
          context: { disableRevalidate: true },
          data: {
            slug: p.slug,
            title: p.frontmatter.title,
            ...(coverId ? { heroImage: coverId } : {}),
            content,
            categories: catIds,
            meta: {
              ...(p.frontmatter.descripcion ? { description: p.frontmatter.descripcion } : {}),
              ...(coverId ? { image: coverId } : {}),
            },
            publishedAt: p.frontmatter.fecha ? `${p.frontmatter.fecha}T12:00:00.000Z` : undefined,
            _status: 'published',
          },
        })
      }
      created++
      if (created % 25 === 0) console.log(`  …${created} migrated`)
    } catch (err) {
      failures.push({ slug: p.slug, error: err instanceof Error ? err.message : String(err) })
    }
  }

  console.log('\n=== Migration summary ===')
  console.log(
    `posts: ${created} created, ${skipped} skipped (already present), ${failures.length} failed`,
  )
  console.log(`media: ${stats.mediaCreated} uploaded, ${stats.mediaReused} reused, ${stats.junkSkipped} junk skipped`)
  console.log(`categories created: ${stats.categoriesCreated}`)
  console.log(`external images left as-is: ${stats.externalImages}`)
  if (stats.missingAssets.length)
    console.log(
      `missing assets (${stats.missingAssets.length}):\n  ` +
        stats.missingAssets.slice(0, 20).join('\n  '),
    )
  if (failures.length) {
    console.log(`failures:\n` + failures.map((f) => `  ${f.slug}: ${f.error}`).join('\n'))
    process.exitCode = 1
  }
}

void main().catch((err) => {
  console.error('MIGRATION FAILED:', err)
  process.exitCode = 1
})
