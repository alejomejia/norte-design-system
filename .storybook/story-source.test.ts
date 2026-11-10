import { describe, expect, it } from 'vitest'

import { withShortTags } from './story-source'

/** A tag as Storybook writes it with an array prop, one key per line, and a function prop. */
function chartTag(points: number) {
  const data = Array.from({ length: points }, (_, x) => `    {\n      x: ${x},\n      y: ${x * 10}\n    },`)
  return ['<LineChart', '  data={[', ...data, '  ]}', '  formatX={() => {}}', '  label="Tokens per minute"', '/>'].join(
    '\n',
  )
}

describe('withShortTags', () => {
  it('puts props back on the tag line when they fit', () => {
    expect(withShortTags('<Button\n  variant="ghost"\n  size="s"\n>\n  Retry\n</Button>')).toBe(
      '<Button variant="ghost" size="s">\n  Retry\n</Button>',
    )
    expect(withShortTags('<Spinner\n  size="s"\n/>')).toBe('<Spinner size="s" />')
  })

  it('leaves a tag that is too long over its lines', () => {
    const long = `<Alert\n  title="${'Orbit timed out. '.repeat(4)}"\n  tone="danger"\n/>`
    expect(withShortTags(long)).toBe(long)
  })

  it('gives up at once on a tag a prop line breaks', () => {
    // The old pattern retried every split of every line's indent: two points took 0.2s, three took two minutes, and
    // the page froze. Two keep the test quick to fail.
    const code = chartTag(2)
    const start = performance.now()
    expect(withShortTags(code)).toBe(code)
    expect(performance.now() - start).toBeLessThan(20)
  })

  it('handles a tag with a long prop', () => {
    const code = chartTag(40)
    expect(withShortTags(code)).toBe(code)
  })
})
