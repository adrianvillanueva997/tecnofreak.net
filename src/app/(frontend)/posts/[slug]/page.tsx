import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { PostCard } from '@/components/PostCard'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { AdBanner } from '@/components/AdBanner'
import { ShareButtons } from '@/components/ShareButtons'
import { CommentsSection } from '@/components/Comments'
import { ProductBoxBlock } from '@/blocks/ProductBox/Component'
import configPromise from '@payload-config'
import { formatDate } from '@/utilities/formatDate'
import { getPayload } from 'payload'
import Link from 'next/link'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import type { Post, Product } from '@/payload-types'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = posts.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  const cats = Array.isArray(post.categories)
    ? (post.categories.filter((c) => typeof c === 'object') as Array<{ id: number; title: string; slug: string }>)
    : []
  const hero = post.heroImage && typeof post.heroImage === 'object' ? post.heroImage : null

  const payload = await getPayload({ config: configPromise })

  // Sigue leyendo: manual picks first, then same-tag news, then latest as filler
  let related = Array.isArray(post.relatedPosts)
    ? (post.relatedPosts.filter((p) => typeof p === 'object') as Post[])
    : []

  if (related.length < 3 && !draft && cats.length > 0) {
    const byTag = await payload.find({
      collection: 'posts',
      draft: false,
      depth: 1,
      limit: 6,
      overrideAccess: false,
      sort: '-publishedAt',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { slug: { not_equals: post.slug } },
          { categories: { in: cats.map((c) => c.id) } },
        ],
      },
    })
    for (const p of byTag.docs as Post[]) {
      if (related.length >= 3) break
      if (!related.some((r) => r.id === p.id)) related.push(p)
    }
  }

  if (related.length < 3 && !draft) {
    const recent = await payload.find({
      collection: 'posts',
      draft: false,
      depth: 1,
      limit: 6,
      overrideAccess: false,
      sort: '-publishedAt',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { slug: { not_equals: post.slug } },
          ...(related.length ? [{ id: { not_in: related.map((r) => r.id) } }] : []),
        ],
      },
    })
    for (const p of recent.docs as Post[]) {
      if (related.length >= 3) break
      if (!related.some((r) => r.id === p.id)) related.push(p)
    }
  }

  let affiliate: Product[] = []
  if (Array.isArray(post.affiliateProducts))
    affiliate = post.affiliateProducts.filter((p): p is Product => typeof p === 'object')
  const hasInlineAffiliates =
    affiliate.length > 0 ||
    JSON.stringify(post.content ?? {}).includes('"productBox"')

  return (
    <>
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <article className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
        <header>
          <p className="kicker text-teal">Artículo</p>
          <h1 className="font-display mt-3 text-[clamp(1.9rem,4.5vw,3rem)] font-bold leading-[1.08] tracking-tight">
            {post.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-rule pb-5">
            {post.publishedAt && (
              <time className="kicker text-fog" dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
            )}
            {cats.map((c) => (
              <Link
                key={c.id}
                href={`/etiquetas/${c.slug}`}
                className="kicker text-fog transition-colors duration-100 hover:text-teal"
              >
                {c.title}
              </Link>
            ))}
          </div>
        </header>

        {hero && (
          <div className="mt-8 aspect-[16/9] overflow-hidden border border-rule">
            <Media
              resource={hero}
              className="h-full w-full"
              imgClassName="h-full w-full object-cover"
              loading="eager"
              priority
            />
          </div>
        )}

        <RichText className="mt-8" data={post.content} enableGutter={false} />

        {affiliate.length > 0 && (
          <section aria-label="Productos destacados" className="mt-10">
            <h2 className="kicker border-t-2 border-ink pt-3 text-fog">Productos destacados</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {affiliate.map((p) => (
                <ProductBoxBlock key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {hasInlineAffiliates && (
          <p className="kicker mt-8 text-fog">
            Como afiliado de Amazon, tecnofreak.net percibe una comisión por las compras
            cualificadas. Esto no afecta al precio que pagas.
          </p>
        )}

        <div className="mt-10 border-t border-rule pt-5">
          <ShareButtons />
        </div>

        <AdBanner />

        <CommentsSection postId={post.id} />
      </article>

      {related.length > 0 && (
        <section aria-label="Sigue leyendo" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <h2 className="font-display border-b-2 border-teal pb-2 text-lg font-bold uppercase tracking-wide">
            Sigue leyendo
          </h2>
          <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {related.slice(0, 3).map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    depth: 2,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
