import Link from 'next/link'
import React from 'react'

import { formatDate } from '@/utilities/formatDate'
import type { Post } from '@/payload-types'

export type PostRowData = Pick<Post, 'slug' | 'title' | 'categories' | 'publishedAt'>

export const PostRow: React.FC<{ post: PostRowData; first?: boolean }> = ({ post, first = false }) => {
  const tag =
    post.categories && Array.isArray(post.categories) && typeof post.categories[0] === 'object'
      ? (post.categories[0] as { title: string })
      : null

  return (
    <li className={`border-b border-rule ${first ? 'border-t' : ''}`}>
      <Link
        href={`/posts/${post.slug}`}
        className="group grid grid-cols-[1fr_auto] items-baseline gap-x-4 py-4 sm:grid-cols-[8.5rem_1fr_auto]"
      >
        <time
          className="kicker col-start-1 row-start-2 text-fog sm:row-start-1"
          dateTime={post.publishedAt ?? undefined}
        >
          {formatDate(post.publishedAt)}
        </time>
        <span className="col-span-2 row-start-1 font-display text-lg font-medium leading-snug tracking-tight transition-colors duration-100 group-hover:text-teal sm:col-span-1 sm:col-start-2">
          {post.title}
        </span>
        {tag && <span className="kicker hidden text-right text-fog sm:inline">{tag.title}</span>}
      </Link>
    </li>
  )
}
