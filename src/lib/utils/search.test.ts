import { describe, expect, it } from 'vitest'

import { matchScore } from './search'

describe('matchScore', () => {
  it.each([
    ['Research agent', 'res', 4],
    ['Research agent', 'agent', 3],
    ['reports/pricing-q3.md', 'pricing', 3],
    ['Approvals', 'prov', 2],
    ['Sofía Herrera', 'sofia', 4],
    ['Share run', 'SHARE', 4],
    ['Research agent', 'rsch', 1],
    ['Research agent', 'invoices', 0],
    ['Research agent', '   ', 0],
  ])('scores %j for %j as %d', (label, query, expected) => {
    expect(matchScore(label, query)).toBe(expected)
  })

  it('finds a label through its keywords', () => {
    expect(matchScore('Share run', 'invite', ['invite', 'people'])).toBe(1.5)
  })
})
