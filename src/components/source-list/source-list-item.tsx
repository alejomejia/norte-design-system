import { CitationFavicon } from '@/components/citation/citation-favicon'
import { Icon } from '@/components/icon'
import { LINK_NEW_TAB_REL } from '@/components/link/link.const'
import { domainOf, isExternalUrl, toCSSVars } from '@/lib/utils'

import { SOURCE_LIST_STAGGER } from './source-list.const'
import { sourceListStyles } from './source-list.styles'
import { type SourceListLabels, type SourceListSource } from './source-list.types'

export type SourceListItemProps = {
  source: SourceListSource
  /** Its number in the answer's citations; none for a source that failed. */
  number?: number
  /** Its place in the list, for its turn to rise. */
  position: number
  labels: SourceListLabels
}

/**
 * One source as a row: the whole row links to it, and a failed one says why under its title. The link is named by
 * what it shows, joined by words only screen readers hear: "Source 2: Pricing: plans for every team, brightloop.example
 * (opens in a new tab)", or "Orbit pricing, orbit.example, failed: Timed out after 30s".
 */
export function SourceListItem({ source, number, position, labels }: SourceListItemProps) {
  const { href, title, favicon, domain = domainOf(href), status = 'read', reason } = source
  const failed = status === 'failed'
  const opensNewTab = isExternalUrl(href)
  const styles = sourceListStyles({ failed })

  return (
    <li className={styles.item()} style={toCSSVars({ 'source-delay': `${position * SOURCE_LIST_STAGGER}ms` })}>
      <a href={href} {...(opensNewTab && { target: '_blank', rel: LINK_NEW_TAB_REL })} className={styles.link()}>
        {failed ? (
          <Icon name="error" className={styles.failedIcon()} />
        ) : (
          <span className={styles.number()}>
            <span className="sr-only">{labels.source} </span>
            {number}
            <span className="sr-only">: </span>
          </span>
        )}
        <CitationFavicon favicon={favicon} domain={domain} />
        <span className={styles.title()}>{title}</span>
        <span className={styles.domain()}>
          {domain && <span className="sr-only">, </span>}
          {domain}
          {failed && <span className="sr-only">{`, ${labels.failedSource}${reason ? ':' : ''} `}</span>}
        </span>
        <Icon name={opensNewTab ? 'external' : 'arrow-right'} className={styles.arrow()} />
        {failed && reason && <span className={styles.reason()}>{reason}</span>}
        {opensNewTab && <span className="sr-only"> {labels.newTab}</span>}
      </a>
    </li>
  )
}
