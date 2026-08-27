import type { Metadata } from 'next/types'

import { PostsArchive } from '@/components/PostsArchive'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { notFound } from 'next/navigation'

import { getYearCounts } from '@/utilities/getYearCounts'

export const revalidate = 600

const PER_PAGE = 24

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const page = Number(pageNumber)
  if (!Number.isInteger(page) || page < 2) notFound()

  const [posts, yearCounts] = await Promise.all([
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: PER_PAGE,
      page,
      overrideAccess: false,
      sort: '-publishedAt',
      where: { _status: { equals: 'published' } },
    }),
    getYearCounts(),
  ])

  if (page > posts.totalPages) notFound()

  return (
    <PostsArchive
      docs={posts.docs}
      page={posts.page ?? page}
      totalPages={Math.max(1, posts.totalPages)}
      totalDocs={posts.totalDocs}
      basePath="/posts"
      firstPageHref="/posts"
      yearCounts={yearCounts}
    />
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  return {
    title: `Todas las noticias — página ${pageNumber}`,
    description: 'Archivo completo de artículos de tecnofreak.net, filtrable por año.',
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'posts',
    overrideAccess: false,
    where: { _status: { equals: 'published' } },
  })

  const totalPages = Math.max(1, Math.ceil(totalDocs / PER_PAGE))
  const pages: { pageNumber: string }[] = []
  for (let i = 2; i <= totalPages; i++) pages.push({ pageNumber: String(i) })
  return pages
}
