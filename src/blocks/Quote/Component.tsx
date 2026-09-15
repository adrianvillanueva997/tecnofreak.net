import type React from 'react'
import type { QuoteBlock as QuoteBlockProps } from '@/payload-types'

type Props = QuoteBlockProps & {
  className?: string
}

export const QuoteBlock: React.FC<Props> = ({ attribution, className, quote, sourceUrl }) => {
  const attributionContent = attribution ? (
    <cite className="mt-3 block text-sm not-italic text-muted-foreground">
      {sourceUrl ? (
        <a href={sourceUrl} rel="noreferrer">
          {attribution}
        </a>
      ) : (
        attribution
      )}
    </cite>
  ) : null

  return (
    <blockquote
			className={['not-prose my-8 border-l-4 border-teal bg-paper-2 px-6 py-5 text-ink', className]
        .filter(Boolean)
        .join(' ')}
    >
      <p className="m-0 text-xl leading-relaxed">{quote}</p>
      {attributionContent}
    </blockquote>
  )
}
