'use client'

import { useEffect, useRef } from 'react'
import React from 'react'

/**
 * Banner de AdSense alargado y responsive (formato auto a ancho completo).
 * Solo se renderiza en producción; en desarrollo devuelve null.
 */
export const AdBanner: React.FC<{ slot?: string; className?: string; label?: string }> = ({
  slot = '1829090800',
  className = '',
  label = 'Publicidad',
}) => {
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] }
      w.adsbygoogle = w.adsbygoogle || []
      w.adsbygoogle.push({})
      pushed.current = true
    } catch {
      // AdSense aún no cargado: el siguiente montaje lo reintenta
    }
  }, [])

  if (process.env.NODE_ENV !== 'production') return null

  return (
    <aside aria-label={label} className={`my-8 w-full ${className}`}>
      <ins
        className="adsbygoogle block"
        style={{ display: 'block', minHeight: 110 }}
        data-ad-client="ca-pub-1455213377925841"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  )
}
