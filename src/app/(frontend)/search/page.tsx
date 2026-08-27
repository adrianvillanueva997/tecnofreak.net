import type { Metadata } from 'next/types'

import { PostGrid } from '@/components/PostGrid'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'

type Args = {
  searchParams: Promise<{
    q: string
  }>
}
export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query } = await searchParamsPromise
  const payload = await getPayload({ config: configPromise })

  // The `search` collection mirrors published posts; its docs lack post fields
  // like heroImage/publishedAt, so we resolve hits back to real posts for display.
  const hits = await payload.find({
    collection: 'search',
    depth: 0,
    limit: 24,
    pagination: false,
    ...(query
      ? {
          where: {
            or: [
              { title: { like: query } },
              { 'meta.description': { like: query } },
              { 'meta.title': { like: query } },
              { slug: { like: query } },
            ],
          },
        }
      : {}),
  })

  const postIds = hits.docs
    .map((d) => (typeof d.doc === 'object' ? d.doc?.value : d.doc))
    .filter((v): v is number => typeof v === 'number')

  const posts =
    postIds.length > 0
      ? await payload.find({
          collection: 'posts',
          depth: 1,
          limit: postIds.length,
          overrideAccess: false,
          where: { and: [{ id: { in: postIds } }, { _status: { equals: 'published' } }] },
        })
      : { docs: [] }

  // Preserve the relevance order returned by the search query
  const byId = new Map(posts.docs.map((p) => [p.id, p]))
  const ordered = postIds
    .map((id) => byId.get(id))
    .filter((p): p is (typeof posts.docs)[number] => Boolean(p))

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 pb-16">
      <PageClient />
      <div className="mx-auto max-w-xl">
        <h1 className="font-display text-[clamp(1.9rem,4.5vw,3rem)] font-bold leading-[1.08] tracking-tight">
          Buscar
        </h1>
        <div className="mt-6">
          <Search />
        </div>
      </div>

      <div className="mt-12">
        {ordered.length > 0 ? (
          <PostGrid posts={ordered} />
        ) : (
          <p className="kicker text-fog">
            {query
              ? 'Sin resultados. Prueba con otros términos.'
              : 'Escribe para buscar en todas las noticias.'}
          </p>
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Buscar',
    description: 'Busca en todas las noticias de tecnofreak.net.',
  }
}
