import React from 'react'

import { Media } from '@/components/Media'
import { buildAmazonUrl } from '@/utilities/amazon'
import type { Product } from '@/payload-types'

type Props = {
  className?: string
  product: Product | number | null
  imgClassName?: string
}

/** Tarjeta-banner de producto afiliado. Debe recibir el producto poblado (depth ≥ 1);
 *  si la imagen llega solo como ID se muestra la losa tipográfica. */
export const ProductBoxBlock: React.FC<Props> = ({ product }) => {
  if (!product || typeof product === 'number') return null

  const stars = product.rating
    ? '★★★★★'.slice(0, Math.round(product.rating)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(product.rating))
    : null

  // Títulos estilo Amazon traen especificaciones tras «|»: mostramos solo el nombre principal
  const [mainTitle] = product.title.split('|')
  const cardTitle = (mainTitle || product.title).trim()

  return (
    <article className="not-prose my-6 break-words overflow-hidden rounded-lg border border-rule bg-paper-2">
      <div className="flex flex-col md:flex-row">
        {/* Imagen */}
        <div className="flex aspect-square w-full items-center justify-center border-b border-rule bg-white p-4 md:aspect-auto md:w-48 md:shrink-0 md:self-stretch md:border-b-0 md:border-r">
          {product.image && typeof product.image === 'object' ? (
            <Media
              resource={product.image}
              className="h-full w-full"
              imgClassName="max-h-full min-h-0 w-full object-contain"
            />
          ) : (
            <span aria-hidden="true" className="tile-letter select-none text-[5rem]">
              {product.title.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Contenido */}
        <div className="flex min-w-0 grow flex-col p-5">
          {product.brand && <p className="kicker text-teal">{product.brand}</p>}
          <h3
            className="font-display mt-1 line-clamp-2 text-lg font-bold leading-snug tracking-tight sm:text-xl"
            title={product.title}
          >
            {cardTitle}
          </h3>
          {stars != null && (
            <p aria-label={`Valoración ${product.rating} de 5`} className="mt-1.5 text-sm text-fog">
              {stars}
              <span className="ml-1">({product.rating})</span>
            </p>
          )}
          {product.features && (
            <ul className="m-0 mt-3 hidden list-none space-y-1 p-0 text-sm leading-relaxed text-fog sm:block">
              {product.features
                .split('\n')
                .filter(Boolean)
                .slice(0, 3)
                .map((f, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden="true" className="text-teal">
                      ✓
                    </span>
                    {f.trim()}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Precio + CTA */}
        <div className="flex items-center justify-between gap-4 border-t border-rule bg-paper px-5 py-4 md:flex-col md:justify-center md:gap-3 md:border-l md:border-t-0 md:p-5 md:text-center">
          <div>
            {product.price ? (
              <p className="font-display text-2xl font-bold leading-none">{product.price}</p>
            ) : (
              <p className="kicker text-fog">Disponible en Amazon</p>
            )}
          </div>
          <a
            href={buildAmazonUrl(product.asin)}
            target="_blank"
            rel="sponsored nofollow noopener"
            className="inline-flex h-11 grow items-center justify-center gap-2 whitespace-nowrap rounded-full bg-ink px-6 text-sm font-semibold text-paper transition-colors duration-100 hover:bg-teal md:grow-0"
          >
            Ver en Amazon
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  )
}
