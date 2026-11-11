import { describe, expect, it } from 'vitest'

import { ANALYTICS_DOMAIN, analyticsScript } from './analytics-script'

describe('analyticsScript', () => {
  it("loads Umami Cloud's tracker for the published domain only, behind the before-send hook", () => {
    const script = analyticsScript()
    expect(script).toContain('src="https://cloud.umami.is/script.js"')
    expect(script).toMatch(/data-website-id="[\da-f-]{36}"/)
    expect(script).toContain(`data-domains="${ANALYTICS_DOMAIN}"`)
    expect(script).toContain('data-before-send="norteBeforeSend"')
  })
})
