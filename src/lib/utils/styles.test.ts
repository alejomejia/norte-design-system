import { describe, expect, it } from 'vitest'

import { cn, toCSSVars, tv } from './styles'

describe('cn', () => {
  it('keeps a Norte text size next to a text color', () => {
    expect(cn('text-caption', 'text-ink')).toBe('text-caption text-ink')
  })

  it('lets a later class win a conflict', () => {
    expect(cn('px-2', false, 'px-4')).toBe('px-4')
  })
})

describe('tv', () => {
  const recipe = tv({
    base: 'text-body-s text-ink',
    variants: { tone: { accent: 'text-accent-ink', large: 'text-heading-m' } },
  })

  it('merges with the same config as cn', () => {
    expect(recipe({ tone: 'accent' })).toBe('text-body-s text-accent-ink')
    expect(recipe({ tone: 'large' })).toBe('text-ink text-heading-m')
  })

  it('merges className over the recipe', () => {
    expect(recipe({ className: 'text-ink-muted' })).toBe('text-body-s text-ink-muted')
  })
})

describe('cn with easings', () => {
  it("keeps only the last of Norte's easings", () => {
    expect(cn('ease-standard', 'ease-spring')).toBe('ease-spring')
  })
})

describe('toCSSVars', () => {
  it('turns numbers into rem and leaves strings alone', () => {
    expect(toCSSVars({ gap: 16, swatch: 'var(--color-ink)', empty: null })).toEqual({
      '--gap': '1rem',
      '--swatch': 'var(--color-ink)',
    })
  })
})
