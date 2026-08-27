import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const revalidate = 600

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    depth: 0,
    limit: 50,
    overrideAccess: false,
    sort: '-publishedAt',
    where: { _status: { equals: 'published' } },
    select: { title: true, slug: true, meta: true, publishedAt: true },
  })

  const items = posts.docs
    .map((post) => {
      const url = `${SITE_URL}/posts/${post.slug}`
      const description = post.meta?.description ?? ''
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      ${post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ''}
      ${description ? `<description>${escapeXml(description)}</description>` : ''}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>tecnofreak.net</title>
    <link>${SITE_URL}</link>
    <description>Noticias, análisis y opiniones sobre tecnología en español.</description>
    <language>es</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
