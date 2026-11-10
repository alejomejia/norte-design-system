/** Whether a link leads to another site: a full `http(s)://` URL, or a protocol-relative one (`//cdn.example`). */
export function isExternalUrl(href: string | undefined): href is string {
  return href !== undefined && /^(https?:)?\/\//i.test(href)
}

/**
 * The site a link leads to, without `www.`: `brightloop.example` for `https://www.brightloop.example/pricing`.
 * `undefined` for a page inside the app, or a URL that can't be read.
 */
export function domainOf(href: string | undefined): string | undefined {
  if (!isExternalUrl(href)) return undefined
  try {
    // A base, so a protocol-relative URL (`//cdn.example`) parses too.
    return new URL(href, 'https://localhost').hostname.replace(/^www\./, '') || undefined
  } catch {
    return undefined
  }
}
