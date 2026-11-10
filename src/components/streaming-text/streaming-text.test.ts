import { describe, expect, it } from 'vitest'

import { parseBlocks, parseInline, plainText, revealStep } from './streaming-text.utils'

describe('parseBlocks', () => {
  it('splits paragraphs on blank lines and keeps soft line breaks inside one', () => {
    expect(parseBlocks('Three changed.\nOne held.\n\nOrbit timed out.')).toEqual([
      { type: 'paragraph', text: 'Three changed.\nOne held.' },
      { type: 'paragraph', text: 'Orbit timed out.' },
    ])
  })

  it('reads bulleted and numbered lists, and where a numbered list starts', () => {
    expect(parseBlocks('- Fieldnote\n* Tandem\n\n3. Send it\n4) Check Orbit')).toEqual([
      { type: 'list', ordered: false, start: 1, items: ['Fieldnote', 'Tandem'] },
      { type: 'list', ordered: true, start: 3, items: ['Send it', 'Check Orbit'] },
    ])
  })

  it('starts a new list when the marker kind changes', () => {
    expect(parseBlocks('- Fieldnote\n1. Send it')).toHaveLength(2)
  })

  it('carries a line right under an item on that item', () => {
    expect(parseBlocks('- Fieldnote went\nfrom $12 to $14')).toEqual([
      { type: 'list', ordered: false, start: 1, items: ['Fieldnote went\nfrom $12 to $14'] },
    ])
  })

  it('ends a list at a blank line', () => {
    expect(parseBlocks('- Fieldnote\n\nOrbit timed out.').at(-1)).toEqual({
      type: 'paragraph',
      text: 'Orbit timed out.',
    })
  })

  it('holds back a marker with no words yet while streaming', () => {
    for (const end of ['-', '- ', '*', '2', '2.', '2. ']) {
      expect(parseBlocks(`Three changed.\n${end}`, true)).toEqual([{ type: 'paragraph', text: 'Three changed.' }])
    }
  })

  it('holds back an unclosed citation and a lone star while streaming', () => {
    expect(parseBlocks('Fieldnote raised it. [1', true)).toEqual([{ type: 'paragraph', text: 'Fieldnote raised it. ' }])
    expect(parseBlocks('Fieldnote raised it. [', true)).toEqual([{ type: 'paragraph', text: 'Fieldnote raised it. ' }])
    expect(parseBlocks('Then *', true)).toEqual([{ type: 'paragraph', text: 'Then ' }])
    expect(parseBlocks('**Fieldnote**', true)).toEqual([{ type: 'paragraph', text: '**Fieldnote**' }])
  })

  it('shows everything once the stream is done', () => {
    expect(parseBlocks('Price: 2', false)).toEqual([{ type: 'paragraph', text: 'Price: 2' }])
    expect(parseBlocks('See [1', false)).toEqual([{ type: 'paragraph', text: 'See [1' }])
  })

  it('gives nothing for empty text', () => {
    expect(parseBlocks('')).toEqual([])
    expect(parseBlocks('\n\n')).toEqual([])
  })
})

describe('parseInline', () => {
  it('reads bold and citations', () => {
    expect(parseInline('**Fieldnote** raised it. [1][2]')).toEqual([
      { type: 'text', text: 'Fieldnote', bold: true },
      { type: 'text', text: ' raised it. ', bold: false },
      { type: 'citation', index: 1 },
      { type: 'citation', index: 2 },
    ])
  })

  it('runs an unclosed bold to the end, so bold words show as they stream', () => {
    expect(parseInline('**Fieldn')).toEqual([{ type: 'text', text: 'Fieldn', bold: true }])
  })

  it('leaves brackets that are not citations as text', () => {
    expect(parseInline('[draft]')).toEqual([{ type: 'text', text: '[draft]', bold: false }])
  })
})

describe('plainText', () => {
  it('drops syntax and citations and folds whitespace', () => {
    expect(plainText('**Fieldnote** went\nfrom $12 to $14. [1]')).toBe('Fieldnote went from $12 to $14.')
  })
})

describe('revealStep', () => {
  const text = 'Fieldnote raised its price'

  it('stops at the end of a word', () => {
    expect(revealStep(text, 0, 0.1)).toBe(9)
    expect(revealStep(text, 9, 0.1)).toBe(16)
  })

  it('reveals at least one word, even for a tiny fraction', () => {
    expect(revealStep(text, 16, 0)).toBe(20)
  })

  it('reveals a large share of a long backlog at once', () => {
    expect(revealStep(text, 0, 0.7)).toBe(20)
  })

  it('reveals a word still arriving whole, and stops at the end', () => {
    expect(revealStep('Fieldnote rai', 9, 0)).toBe(13)
    expect(revealStep(text, text.length, 0.5)).toBe(text.length)
  })
})
