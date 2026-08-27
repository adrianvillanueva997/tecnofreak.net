import Link from 'next/link'
import React from 'react'

import { Media } from '@/components/Media'
import { formatDate } from '@/utilities/formatDate'
import type { Post } from '@/payload-types'

export type CardPostData = Pick<
  Post,
  'slug' | 'title' | 'heroImage' | 'meta' | 'categories' | 'publishedAt'
>

export const PostCard: React.FC<{
  post: CardPostData
  variant?: 'lead' | 'secondary' | 'compact'
  loading?: 'lazy' | 'eager'
}> = ({ post, variant = 'secondary', loading = 'lazy' }) => {
  const lead = variant === 'lead'
  const tag =
    post.categories && Array.isArray(post.categories) && typeof post.categories[0] === 'object'
      ? (post.categories[0] as { title: string })
      : null
  const hero = post.heroImage && typeof post.heroImage === 'object' ? post.heroImage : null

  if (variant === 'compact') {
    return (
      <article className="group">
        <Link
          href={`/posts/${post.slug}`}
          className="grid grid-cols-[7rem_1fr] items-start gap-4"
          aria-label={post.title}
        >
          <div className="relative aspect-video overflow-hidden border border-rule bg-paper-2">
            {hero ? (
              <Media
                resource={hero}
                className="absolute inset-0 h-full w-full"
                imgClassName="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                size="(min-width: 768px) 12vw, 30vw"
              />
            ) : (
              <span aria-hidden="true" className="tile-letter absolute -bottom-2 right-1 text-[3rem]">
                {post.title.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex min-w-0 flex-col self-center">
            {tag && <p className="kicker text-teal">{tag.title}</p>}
            <h3 className="font-display mt-1 line-clamp-3 font-bold leading-snug tracking-tight transition-colors duration-100 group-hover:text-teal">
              {post.title}
            </h3>
            {post.meta?.description && (
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-fog">
                {post.meta.description}
              </p>
            )}
            <time className="kicker mt-2 text-fog" dateTime={post.publishedAt ?? undefined}>
              {formatDate(post.publishedAt)}
            </time>
          </div>
        </Link>
      </article>
    )
  }

  return (
    <article className={`group flex flex-col ${lead ? 'rise' : ''}`}>
      <Link href={`/posts/${post.slug}`} className="flex h-full flex-col" aria-label={post.title}>
        <div
          className={`relative overflow-hidden border border-rule bg-paper-2 ${
            lead ? 'aspect-[2/1]' : 'aspect-[16/9]'
          }`}
        >
          {hero ? (
            <Media
              resource={hero}
              className="absolute inset-0 h-full w-full"
              imgClassName="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
              size={lead ? '(min-width: 768px) 60vw, 100vw' : '(min-width: 768px) 30vw, 100vw'}
              loading={loading}
            />
          ) : (
            <span
              aria-hidden="true"
              className={`tile-letter absolute -bottom-4 right-3 ${
                lead ? 'text-[9rem] sm:text-[12rem]' : 'text-[6rem]'
              }`}
            >
              {post.title.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex grow flex-col pt-3">
          {tag && <p className="kicker text-teal">{tag.title}</p>}
          <h3
            className={`font-display mt-1.5 font-bold leading-[1.12] tracking-tight transition-colors duration-100 group-hover:text-teal ${
              lead ? 'text-2xl sm:text-3xl lg:text-[2.1rem]' : 'text-lg leading-snug'
            }`}
          >
            {post.title}
          </h3>
          {post.meta?.description && (
            <p
              className={`mt-2 leading-relaxed text-fog ${
                lead ? '' : 'hidden text-sm sm:line-clamp-2 sm:block'
              }`}
            >
              {post.meta.description}
            </p>
          )}
          <div className="mt-auto pt-2.5">
            <time className="kicker text-fog" dateTime={post.publishedAt ?? undefined}>
              {formatDate(post.publishedAt)}
            </time>
          </div>
        </div>
      </Link>
    </article>
  )
}
