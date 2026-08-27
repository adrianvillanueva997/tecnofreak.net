'use client'

import React, { useMemo, useState } from 'react'

import { ProductBoxBlock } from '@/blocks/ProductBox/Component'
import type { Product } from '@/payload-types'

export const ProductsExplorer: React.FC<{ products: Product[] }> = ({ products }) => {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) =>
      `${p.title} ${p.brand ?? ''}`.toLowerCase().includes(q),
    )
  }, [products, query])

  return (
    <>
      <div className="mt-6">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filtrar por nombre o marca…"
          aria-label="Filtrar productos"
          className="min-h-11 w-full border border-rule bg-paper px-4 text-sm text-ink outline-none transition-colors duration-100 placeholder:text-fog/70 focus:border-teal sm:max-w-md"
        />
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {filtered.map((p) => (
          <ProductBoxBlock key={p.id} product={p} />
        ))}
        {filtered.length === 0 && (
          <p className="kicker mt-4 text-fog">
            {query ? 'Ningún producto coincide con tu búsqueda.' : 'Aún no hay productos.'}
          </p>
        )}
      </div>
    </>
  )
}
