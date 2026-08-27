'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const networks = [
  {
    id: 'x',
    label: 'Compartir en X',
    href: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    icon: (
      <path d="M18.9 2H22l-6.8 7.8L23.3 22h-6.3l-4.9-6.4L6.5 22H3.4l7.3-8.3L1.5 2h6.5l4.4 5.9L18.9 2Zm-1.1 18h1.7L7.1 3.8H5.3L17.8 20Z" />
    ),
  },
  {
    id: 'facebook',
    label: 'Compartir en Facebook',
    href: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    icon: (
      <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.7c0-.9.3-1.6 1.7-1.6h1.6V4.2c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.6H7.6V14h2.8v8h3.1Z" />
    ),
  },
  {
    id: 'whatsapp',
    label: 'Compartir por WhatsApp',
    href: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    icon: (
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.2-.3.3-.5v-.5L9.6 7.7c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.2.2 1.8 2.8 4.4 3.9 2.6 1.1 2.6.7 3 .7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.3Z" />
    ),
  },
  {
    id: 'telegram',
    label: 'Compartir por Telegram',
    href: (url: string, title: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    icon: (
      <path d="M21.9 4.6 19 19.3c-.2 1-.8 1.2-1.6.8l-4.5-3.3-2.2 2.1c-.2.2-.4.4-.9.4l.3-4.6L18.6 7c.4-.3-.1-.5-.6-.2L7.7 13.2l-4.4-1.4c-1-.3-1-1 .2-1.4L20.5 3.2c.8-.3 1.5.2 1.4 1.4Z" />
    ),
  },
]

export const ShareButtons: React.FC = () => {
  const pathname = usePathname()
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')

  useEffect(() => {
    setUrl(window.location.href)
    setTitle(document.title)
  }, [pathname])

  return (
    <div className="flex items-center gap-3">
      <span className="kicker text-fog">Compartir</span>
      <ul className="m-0 flex list-none gap-2 p-0">
        {networks.map(({ id, label, href, icon }) => (
          <li key={id}>
            <a
              href={href(url, title)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rule bg-paper text-fog transition-colors duration-100 hover:border-teal hover:text-teal"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                {icon}
              </svg>
            </a>
          </li>
        ))}
        <li>
          <a
            href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`}
            aria-label="Compartir por email"
            title="Compartir por email"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rule bg-paper text-fog transition-colors duration-100 hover:border-teal hover:text-teal"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m2 7 10 6L22 7" />
            </svg>
          </a>
        </li>
      </ul>
    </div>
  )
}
