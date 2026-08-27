import Link from 'next/link'
import React from 'react'

import { PostGrid } from '@/components/PostGrid'
import type { CardPostData } from '@/components/PostCard'

export interface PostsArchiveProps {
  docs: CardPostData[]
  page: number
  totalPages: number
  totalDocs: number
  /** Base path for pagination links ('/posts' o '/posts/year/2018') */
  basePath: string
  /** Enlace «Anterior» cuando page===2 */
  firstPageHref: string
  activeYear?: string
  yearCounts: { year: string; count: number }[]
}

export function PostsArchive({
  docs,
  page,
  totalPages,
  totalDocs,
  basePath,
  firstPageHref,
  activeYear,
  yearCounts,
}: PostsArchiveProps) {
  const heading = activeYear ? `Noticias de ${activeYear}` : 'Todas las noticias'
  const prevHref =
    page > 1 ? (page === 2 ? firstPageHref : `${basePath}/page/${page - 1}`) : null
  const nextHref = page < totalPages ? `${basePath}/page/${page + 1}` : null

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <header className="mt-8 border-b-2 border-teal pb-5">
        <p className="kicker text-teal">{activeYear ? 'Etiqueta temporal' : 'Archivo'}</p>
        <h1 className="font-display mt-2 text-[clamp(1.9rem,4.5vw,3rem)] font-bold leading-[1.08] tracking-tight">
          {heading}
        </h1>
        <p className="kicker mt-3 text-fog">
          {totalDocs} {totalDocs === 1 ? 'artículo' : 'artículos'}
          {totalPages > 1 ? ` · página ${page} de ${totalPages}` : ''}
        </p>
      </header>

      {/* Navegación por años */}
      <nav aria-label="Filtrar por año" className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/posts"
          aria-current={!activeYear ? 'page' : undefined}
          className={`inline-flex min-h-9 items-center border px-3 kicker transition-colors duration-100 ${
            !activeYear
              ? 'border-teal bg-teal-soft text-teal'
              : 'border-rule bg-paper text-fog hover:border-teal hover:text-teal'
          }`}
        >
          Todos
        </Link>
        {yearCounts.map(({ year, count }) => (
          <Link
            key={year}
            href={`/posts/year/${year}`}
            aria-current={activeYear === year ? 'page' : undefined}
            className={`inline-flex min-h-9 items-center border px-3 kicker transition-colors duration-100 ${
              activeYear === year
                ? 'border-teal bg-teal-soft text-teal'
                : 'border-rule bg-paper text-fog hover:border-teal hover:text-teal'
            }`}
          >
            {year} <span className="ml-1.5 opacity-60">{count}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        <PostGrid posts={docs} />
      </div>

      {(prevHref || nextHref) && (
        <nav
          aria-label="Paginación"
          className="my-10 flex items-center justify-between gap-4 border-t border-rule pt-5"
        >
          {prevHref ? (
            <a
              href={prevHref}
              className="text-sm font-semibold underline decoration-1 underline-offset-4 transition-colors duration-100 hover:text-teal"
            >
              ← Anterior
            </a>
          ) : (
            <span />
          )}
          <span className="kicker text-fog">
            {page} / {totalPages}
          </span>
          {nextHref ? (
            <a href={nextHref} className="link-more ml-auto text-sm">
              Siguiente
            </a>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  )
}
