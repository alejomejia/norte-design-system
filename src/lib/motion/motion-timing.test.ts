import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { parseTokens } from '@/handbook/tokens/tokens'

import { MOTION_DURATION, MOTION_EASE, MOTION_SPRING } from './motion-timing'

const tokens = parseTokens(readFileSync(new URL('../../styles/theme.css', import.meta.url), 'utf8'))

describe('Motion timing', () => {
  it.each(Object.entries(MOTION_DURATION))('duration %s matches its token', (name, seconds) => {
    expect(tokens.get(`duration-${name}`)?.value).toBe(`${seconds * 1000}ms`)
  })

  it.each(Object.entries(MOTION_EASE))('easing %s matches its token', (name, points) => {
    expect(tokens.get(`ease-${name}`)?.value).toBe(`cubic-bezier(${points.join(', ')})`)
  })

  it('the spring matches the one --ease-spring was made from', () => {
    expect(tokens.get('ease-spring')?.note).toContain(`spring(${MOTION_SPRING.visualDuration}, ${MOTION_SPRING.bounce})`)
  })
})
