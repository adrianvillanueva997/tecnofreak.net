'use client'

import React, { useState } from 'react'

export const CommentForm: React.FC<{ postId: number }> = ({ postId }) => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post: postId,
          author: form.get('author'),
          email: form.get('email') || undefined,
          body: form.get('body'),
          website: form.get('website'), // honeypot
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { errors?: { message?: string }[] } | null
        throw new Error(data?.errors?.[0]?.message ?? 'No se pudo enviar el comentario.')
      }
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Error inesperado.')
    }
  }

  if (status === 'sent')
    return (
      <p className="border border-rule bg-paper-2 p-4 text-sm text-fog">
        ¡Gracias! Tu comentario se publicará en cuanto lo revisemos.
      </p>
    )

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="author"
          required
          maxLength={60}
          placeholder="Nombre *"
          aria-label="Tu nombre"
          className="min-h-11 border border-rule bg-paper px-3 text-sm text-ink outline-none placeholder:text-fog/70 focus:border-teal"
        />
        <input
          name="email"
          type="email"
          placeholder="Email (opcional, no se publica)"
          aria-label="Tu email"
          className="min-h-11 border border-rule bg-paper px-3 text-sm text-ink outline-none placeholder:text-fog/70 focus:border-teal"
        />
      </div>
      <textarea
        name="body"
        required
        maxLength={2000}
        rows={4}
        placeholder="Escribe tu comentario… *"
        aria-label="Tu comentario"
        className="border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-fog/70 focus:border-teal"
      />
      {/* Honeypot anti-spam: oculto para humanos */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {status === 'error' && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex min-h-11 items-center rounded-full bg-ink px-6 text-sm font-semibold text-paper transition-colors duration-100 hover:bg-teal disabled:opacity-50"
        >
          {status === 'sending' ? 'Enviando…' : 'Publicar comentario'}
        </button>
      </div>
    </form>
  )
}
