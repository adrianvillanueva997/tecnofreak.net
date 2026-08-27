'use client'

import Link from 'next/link'
import React, { useMemo, useState } from 'react'

import { slugifyTag } from '@/utilities/formatDate'

export interface TagItem {
  id: number
  title: string
  slug: string
  count: number
}

/** Agrupa por inicial (sin acentos) y ordena cada grupo por popularidad */
function groupByLetter(tags: TagItem[]): { letter: string; items: TagItem[] }[] {
  const groups = new Map<string, TagItem[]>()
  for (const t of tags) {
    const key = slugifyTag(t.title).charAt(0).toUpperCase() || '#'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(t)
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'es'))
    .map(([letter, items]) => ({
      letter,
      items: items.sort((a, b) => b.count - a.count || a.title.localeCompare(b.title, 'es')),
    }))
}

export const TagsDirectory: React.FC<{ tags: TagItem[] }> = ({ tags }) => {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tags
    return tags.filter((t) => t.title.toLowerCase().includes(q))
  }, [tags, query])

  const groups = useMemo(() => groupByLetter(filtered), [filtered])

  return (
    <>
      <div className="mt-6">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar etiqueta…"
          aria-label="Buscar etiqueta"
          className="min-h-11 w-full border border-rule bg-paper px-4 text-sm text-ink outline-none transition-colors duration-100 placeholder:text-fog/70 focus:border-teal sm:max-w-md"
        />
      </div>

      {groups.length === 0 ? (
        <p className="kicker mt-6 text-fog">Ninguna etiqueta coincide.</p>
      ) : (
        <div className="mt-2">
          {groups.map(({ letter, items }) => (
            <section key={letter} aria-label={`Etiquetas con ${letter}`} className="mt-8 first:mt-4">
              <h2 className="font-display border-b border-rule pb-1 text-base font-bold text-fog">
                {letter}
                <span className="kicker ml-2 font-normal">{items.length}</span>
              </h2>
              <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
                {items.map((tag) => (
                  <li key={tag.id}>
                    <Link
                      href={`/etiquetas/${tag.slug}`}
                      className="inline-flex min-h-9 items-center gap-1.5 border border-rule bg-paper px-3 text-sm font-medium text-ink transition-colors duration-100 hover:border-teal hover:text-teal"
                    >
                      {tag.title}
                      <span className="kicker text-fog">{tag.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
