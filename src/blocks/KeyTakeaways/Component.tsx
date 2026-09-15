import type React from 'react'
import type { KeyTakeawaysBlock as KeyTakeawaysBlockProps } from '@/payload-types'

type Props = KeyTakeawaysBlockProps & {
  className?: string
}

export const KeyTakeawaysBlock: React.FC<Props> = ({ className, items }) => (
  <section
    aria-label="Puntos clave"
    className={['not-prose my-8 rounded-xl border border-teal/30 bg-teal/5 p-6', className]
      .filter(Boolean)
      .join(' ')}
  >
    <h2 className="m-0 text-lg font-semibold">Puntos clave</h2>
    <ul className="mt-3 mb-0 space-y-2 pl-5">
      {(items ?? []).map(({ id, text }) => (
        <li key={id || text}>{text}</li>
      ))}
    </ul>
  </section>
)
