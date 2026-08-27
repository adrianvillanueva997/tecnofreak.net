import Link from 'next/link'
import React from 'react'

const items = [
  { href: '/', label: 'Inicio' },
  { href: '/etiquetas', label: 'Etiquetas' },
  { href: '/acerca', label: 'Acerca' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-rule bg-paper-2">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-baseline md:justify-between">
        <div>
          <p className="font-display text-lg font-bold leading-none tracking-tight">
            tecnofreak<span className="text-teal">.net</span>
          </p>
          <p className="mt-1 max-w-prose text-sm text-fog">
            Tecnología explicada sin jerga innecesaria.
          </p>
        </div>
        <ul className="flex list-none flex-wrap gap-x-5 gap-y-1 p-0 text-sm m-0">
          {items.map(({ href, label }) => (
            <li key={href}>
              <Link className="transition-colors duration-100 hover:text-teal" href={href}>
                {label}
              </Link>
            </li>
          ))}
          <li>
            <a
              className="font-mono transition-colors duration-100 hover:text-teal"
              href="/rss.xml"
            >
              RSS
            </a>
          </li>
          <li>
            <Link
              className="font-mono transition-colors duration-100 hover:text-teal"
              href="/admin"
            >
              Panel
            </Link>
          </li>
        </ul>
      </div>
      <div className="border-t border-rule">
        <p className="kicker mx-auto max-w-6xl px-4 py-4 text-fog sm:px-6">
          © {year} tecnofreak.net
        </p>
      </div>
    </footer>
  )
}
