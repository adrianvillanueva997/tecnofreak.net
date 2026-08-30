'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const nav = [
  { href: '/', label: 'Inicio' },
  { href: '/posts', label: 'Noticias' },
  { href: '/etiquetas', label: 'Etiquetas' },
  { href: '/productos', label: 'Productos' },
  { href: '/acerca', label: 'Acerca' },
]

export function HeaderClient() {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const isActive = (href: string) => (href === '/' ? path === '/' : path.startsWith(href))

  useEffect(() => {
    setOpen(false)
  }, [path])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center">
          <span className="font-display text-xl font-bold leading-none tracking-tight">
            tecnofreak<span className="text-teal">.net</span>
          </span>
        </Link>
        {/* Desktop nav */}
        <nav aria-label="Principal" className="ml-auto hidden md:block">
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
            <li className="ml-1 border-l border-rule pl-1">
              <a
                href="/rss.xml"
                className="kicker inline-flex min-h-11 items-center px-3 text-fog transition-colors duration-100 hover:text-teal"
              >
                RSS
              </a>
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
        {/* Mobile toggle */}
        <button
          type="button"
          className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-transparent px-2 text-fog transition-colors hover:text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div
          id="mobile-nav"
          className="absolute inset-x-0 top-14 max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-rule bg-paper px-4 py-3 shadow-sm md:hidden"
        >
          <nav aria-label="Principal móvil">
            <ul className="m-0 flex list-none flex-col p-0">
              {nav.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive(href) ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                    className={`flex min-h-11 items-center rounded-md px-3 text-base font-medium transition-colors ${
                      isActive(href) ? 'bg-teal-soft text-teal' : 'text-ink hover:bg-paper-2'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 border-t border-rule pt-2">
                <a
                  href="/rss.xml"
                  className="kicker flex min-h-11 items-center px-3 text-fog transition-colors hover:text-teal"
                >
                  RSS
                </a>
              </li>
            </ul>
          </nav>
          <form action="/search" method="get" role="search" className="mt-3">
            <input
              type="search"
              name="q"
              placeholder="Buscar…"
              aria-label="Buscar en el sitio"
              className="h-11 w-full rounded-md border border-rule bg-paper-2 px-3 text-sm text-ink outline-none placeholder:text-fog/70 focus:border-teal"
            />
          </form>
        </div>
      )}
    </header>
  )
}
