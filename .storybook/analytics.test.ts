import { describe, expect, it } from 'vitest'

import { createBeforeSend, storybookPage } from './analytics'
import { ANALYTICS_DOMAIN } from './analytics-script'

const ORIGIN = `https://${ANALYTICS_DOMAIN}`

/** A before-send hook whose page is whatever the test last set. */
function hookAt(href: string) {
  const location = { href }
  const beforeSend = createBeforeSend(() => location.href)
  return {
    beforeSend,
    go(path: string) {
      location.href = `${ORIGIN}/${path}`
    },
  }
}

describe('storybookPage', () => {
  it('reads the open story from the query, without its args or globals', () => {
    expect(storybookPage(`${ORIGIN}/?path=/story/button--primary&args=size:lg&globals=measureEnabled:!true`)).toBe(
      '/story/button--primary',
    )
    expect(storybookPage(`${ORIGIN}/?path=/docs/button--docs`)).toBe('/docs/button--docs')
  })

  it('has no page before Storybook opens a story', () => {
    expect(storybookPage(`${ORIGIN}/`)).toBeUndefined()
  })
})

describe('createBeforeSend', () => {
  it('sends a page view with the open story as its URL', () => {
    const { beforeSend } = hookAt(`${ORIGIN}/?path=/story/button--primary`)
    expect(beforeSend('event', { url: `${ORIGIN}/`, title: 'Norte' })).toEqual({
      url: '/story/button--primary',
      title: 'Norte',
    })
  })

  it('drops a page view before Storybook opens a story', () => {
    expect(hookAt(`${ORIGIN}/`).beforeSend('event', { url: `${ORIGIN}/` })).toBeNull()
  })

  it('drops page views of the same story, like a change of controls', () => {
    const { beforeSend, go } = hookAt(`${ORIGIN}/?path=/story/button--primary`)
    expect(beforeSend('event', {})).not.toBeNull()
    go('?path=/story/button--primary&args=size:lg')
    expect(beforeSend('event', {})).toBeNull()
    go('?path=/story/badge--playground')
    expect(beforeSend('event', {})).not.toBeNull()
    go('?path=/story/button--primary')
    expect(beforeSend('event', {})).not.toBeNull()
  })

  it('sends every named event, with the open story as its URL', () => {
    const { beforeSend } = hookAt(`${ORIGIN}/?path=/story/button--primary`)
    expect(beforeSend('event', { name: 'copy-code' })).toEqual({ name: 'copy-code', url: '/story/button--primary' })
    expect(beforeSend('event', { name: 'copy-code' })).toEqual({ name: 'copy-code', url: '/story/button--primary' })
  })

  it('passes other payloads through untouched', () => {
    const { beforeSend } = hookAt(`${ORIGIN}/?path=/story/button--primary`)
    expect(beforeSend('identify', { id: 'x' })).toEqual({ id: 'x' })
  })
})
