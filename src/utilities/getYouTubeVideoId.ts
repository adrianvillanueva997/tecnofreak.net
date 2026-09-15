export function getYouTubeVideoId(value: string): string | null {
  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase().replace(/^www\./, '')
    let id = ''

    if (host === 'youtu.be') {
      id = url.pathname.slice(1)
    } else if (host === 'youtube.com' || host === 'm.youtube.com') {
      const parts = url.pathname.split('/').filter(Boolean)
      id =
        (parts[0] === 'watch' && url.searchParams.get('v')) ||
        (parts[0] === 'embed' && parts[1]) ||
        (parts[0] === 'shorts' && parts[1]) ||
        ''
    }

    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
  } catch {
    return null
  }
}
