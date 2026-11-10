'use client'

import { useState } from 'react'

import { Icon } from '@/components/icon'

import { citationFaviconStyles } from './citation.styles'

export type CitationFaviconProps = {
  /** The site's icon. */
  favicon?: string
  /** The site's name: its first letter stands in for a missing favicon. None for a page in the app. */
  domain?: string
  className?: string
}

/**
 * A source's site icon, decorative since the site's name is always said beside it: its favicon, the site's first
 * letter when it has none or it doesn't load, or a file for a page in the app. Shared by Citation and Source list.
 */
export function CitationFavicon({ favicon, domain, className }: CitationFaviconProps) {
  const styles = citationFaviconStyles()
  // The favicon that failed to load, so a new one gets its own try without an effect to reset it.
  const [brokenFavicon, setBrokenFavicon] = useState<string>()

  if (favicon !== undefined && favicon !== brokenFavicon) {
    return (
      <img src={favicon} alt="" className={styles.favicon({ className })} onError={() => setBrokenFavicon(favicon)} />
    )
  }
  if (domain) {
    return (
      <span aria-hidden className={styles.initial({ className })}>
        {domain.charAt(0)}
      </span>
    )
  }
  return <Icon name="file" className={styles.file({ className })} />
}
