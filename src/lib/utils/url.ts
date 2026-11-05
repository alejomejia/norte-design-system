/** Whether a link leads to another site: a full `http(s)://` URL, or a protocol-relative one (`//cdn.example`). */
export function isExternalUrl(href: string | undefined): href is string {
  return href !== undefined && /^(https?:)?\/\//i.test(href)
}
