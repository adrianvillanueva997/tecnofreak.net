import React from 'react'

import { CommentForm } from '@/components/Comments/Form'
import { formatDate } from '@/utilities/formatDate'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Comment } from '@/payload-types'

export const CommentsSection: React.FC<{ postId: number }> = async ({ postId }) => {
  const payload = await getPayload({ config: configPromise })
  const comments = await payload.find({
    collection: 'comments',
    depth: 0,
    limit: 100,
    sort: '-createdAt',
    where: {
      and: [{ post: { equals: postId } }, { approved: { equals: true } }],
    },
  })

  return (
    <section aria-label="Comentarios" className="mt-10 border-t border-rule pt-5">
      <h2 className="kicker text-fog">
        Comentarios ({comments.totalDocs})
      </h2>

      {comments.docs.length > 0 && (
        <ul className="m-0 mt-5 list-none p-0">
          {comments.docs.map((c: Comment) => (
            <li key={c.id} className="border-b border-rule py-4 last:border-b-0">
              <p className="kicker text-teal">{c.author}</p>
              <time className="kicker ml-2 text-fog" dateTime={c.createdAt ?? undefined}>
                {formatDate(c.createdAt)}
              </time>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                {c.body}
              </div>
            </li>
          ))}
        </ul>
      )}

      {comments.totalDocs === 0 && (
        <p className="mt-4 text-sm text-fog">Sé el primero en comentar.</p>
      )}

      <h3 className="kicker mt-8 text-fog">Deja un comentario</h3>
      <div className="mt-4">
        <CommentForm postId={postId} />
      </div>
      <p className="kicker mt-3 text-fog">Los comentarios pasan revisión antes de publicarse.</p>
    </section>
  )
}
