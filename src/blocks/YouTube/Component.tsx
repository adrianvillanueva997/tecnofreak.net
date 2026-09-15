import type React from 'react'
import type { YouTubeBlock as YouTubeBlockProps } from '@/payload-types'
import { getYouTubeVideoId } from '@/utilities/getYouTubeVideoId'

type Props = YouTubeBlockProps & {
  className?: string
}

export const YouTubeBlock: React.FC<Props> = ({ className, title, url }) => {
  const videoId = getYouTubeVideoId(url)

  if (!videoId) return null

  return (
    <div
      className={['not-prose my-8 overflow-hidden rounded-xl', className].filter(Boolean).join(' ')}
    >
      <div className="aspect-video w-full bg-black">
        <iframe
          className="h-full w-full"
          title={title || 'Vídeo de YouTube'}
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  )
}
