'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const nav = [
  { href: '/', label: 'Inicio' },
  { href: '/posts', label: 'Noticias' },
  { href: '/etiquetas', label: 'Etiquetas' },
  { href: '/productos', label: 'Productos' },
  { href: '/acerca', label: 'Acerca' },
]

export function HeaderClient() {
  const path = usePathname()
  const isActive = (href: string) => (href === '/' ? path === '/' : path.startsWith(href))

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center">
          <span className="font-display text-xl font-bold leading-none tracking-tight">
            tecnofreak<span className="text-teal">.net</span>
          </span>
        </Link>
        <nav aria-label="Principal" className="ml-auto">
          <ul className="m-0 flex list-none items-center p-0">
            {nav.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? 'page' : undefined}
                  className={`inline-flex min-h-11 items-center whitespace-nowrap px-3 text-sm font-medium transition-colors duration-100 ${
                    isActive(href) ? 'text-teal' : 'text-fog hover:text-ink'
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="ml-1 hidden border-l border-rule pl-1 sm:block">
              <a
                href="/rss.xml"
                className="kicker inline-flex min-h-11 items-center px-3 text-fog transition-colors duration-100 hover:text-teal"
              >
                RSS
              </a>
            </li>
            <li className="md:hidden">
              <Link
                href="/search"
                className="inline-flex min-h-11 items-center px-3 text-sm font-medium text-fog transition-colors duration-100 hover:text-ink"
              >
                Buscar
              </Link>
            </li>
          </ul>
        </nav>
        <form action="/search" method="get" role="search" className="hidden md:block">
          <input
            type="search"
            name="q"
            placeholder="Buscar…"
            aria-label="Buscar en el sitio"
            className="min-h-9 w-32 border border-rule bg-paper-2 px-3 text-sm text-ink outline-none transition-[width] duration-150 placeholder:text-fog/70 focus:border-teal focus:w-48"
          />
        </form>
      </div>
    </header>
  )
}
