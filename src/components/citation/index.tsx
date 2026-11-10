'use client'

import { PreviewCard } from '@base-ui/react/preview-card'
import { type ReactNode, useState } from 'react'

import { LINK_NEW_TAB_REL } from '@/components/link/link.const'
import { domainOf, isExternalUrl } from '@/lib/utils'

import { CITATION_DELAY, CITATION_LABEL, CITATION_NEW_TAB_LABEL, CITATION_SIDE_OFFSET } from './citation.const'
import { citationStyles } from './citation.styles'

/** A source an agent read: what a citation points to, and what a list of sources lists. */
export type CitationSource = {
  /** Where it lives: another site (`https://…`), opened in a new tab, or a page in the app. */
  href: string
  /** Its title, shown in the preview and heard after the number. */
  title: string
  /** The passage the agent used, quoted in the preview. */
  excerpt?: ReactNode
  /** The site's icon. Without it, or when it doesn't load, the site's first letter stands in. */
  favicon?: string
  /** The site's name above the title. Read from `href` when left out; none for a page in the app. */
  domain?: string
}

export type CitationProps = Omit<
  PreviewCard.Trigger.Props,
  'className' | 'children' | 'href' | 'title' | 'delay' | 'handle' | 'payload'
> &
  CitationSource & {
    /** The number it shows: its place in the answer's list of sources. */
    index: number
    /** How long the pointer rests on it before the preview opens, in ms. Focus opens it too. */
    delay?: number
    /** What screen readers hear before the number and the title: "Source 2: Pricing: plans for every team". */
    label?: string
    /** Announced after the name of a citation that opens its source in a new tab. */
    newTabLabel?: string
    className?: string
  }

/**
 * A numbered marker in an agent's answer that points to one of its sources. It's a link to the source, and hovering or
 * focusing it previews the source's site, title and the passage the agent used. Built on Base UI's PreviewCard.
 *
 * @example
 * <p>
 *   Brightloop raised its Team plan to $14 a seat
 *   <Citation index={2} href="https://brightloop.example/pricing" title="Pricing: plans for every team" />.
 * </p>
 */
export function Citation({
  index,
  href,
  title,
  excerpt,
  favicon,
  domain = domainOf(href),
  delay = CITATION_DELAY,
  label = CITATION_LABEL,
  newTabLabel = CITATION_NEW_TAB_LABEL,
  rel,
  className,
  ...props
}: CitationProps) {
  const styles = citationStyles()
  const opensNewTab = isExternalUrl(href)
  // The favicon that failed to load, so a new one gets its own try without an effect to reset it.
  const [brokenFavicon, setBrokenFavicon] = useState<string>()
  const showsFavicon = favicon !== undefined && favicon !== brokenFavicon

  return (
    <PreviewCard.Root>
      <PreviewCard.Trigger
        href={href}
        delay={delay}
        aria-label={`${label} ${index}: ${title}${opensNewTab ? ` ${newTabLabel}` : ''}`}
        {...props}
        {...(opensNewTab ? { target: '_blank', rel: rel ? `${LINK_NEW_TAB_REL} ${rel}` : LINK_NEW_TAB_REL } : { rel })}
        className={styles.marker({ className })}
      >
        {index}
      </PreviewCard.Trigger>
      <PreviewCard.Portal>
        <PreviewCard.Positioner sideOffset={CITATION_SIDE_OFFSET} className={styles.positioner()}>
          <PreviewCard.Popup className={styles.popup()}>
            <div className={styles.header()}>
              {domain && (
                <p className={styles.site()}>
                  {showsFavicon ? (
                    <img src={favicon} alt="" className={styles.favicon()} onError={() => setBrokenFavicon(favicon)} />
                  ) : (
                    <span aria-hidden className={styles.initial()}>
                      {domain.charAt(0)}
                    </span>
                  )}
                  <span className={styles.domain()}>{domain}</span>
                </p>
              )}
              <p className={styles.title()}>{title}</p>
            </div>
            {excerpt && (
              <blockquote cite={href} className={styles.excerpt()}>
                {excerpt}
              </blockquote>
            )}
          </PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    </PreviewCard.Root>
  )
}
