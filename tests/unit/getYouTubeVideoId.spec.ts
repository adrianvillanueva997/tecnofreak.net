import { describe, expect, it } from 'vitest'
import { getYouTubeVideoId } from '@/utilities/getYouTubeVideoId'

describe('getYouTubeVideoId', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ?t=42', 'dQw4w9WgXcQ'],
    ['https://youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
  ])('extracts the ID from %s', (url, expected) => {
    expect(getYouTubeVideoId(url)).toBe(expected)
  })

  it.each(['https://example.com/watch?v=dQw4w9WgXcQ', 'not a URL', 'https://youtu.be/too-short'])(
    'rejects %s',
    (url) => {
      expect(getYouTubeVideoId(url)).toBeNull()
    },
  )
})
