/** A block of streamed text: a paragraph, or a list of items. Their text still holds the inline syntax. */
export type StreamingTextBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; start: number; items: string[] }

/** A piece of a block's text: words, bold or not, or a citation marker (`[1]`). */
export type StreamingTextInline = { type: 'text'; text: string; bold: boolean } | { type: 'citation'; index: number }

/** `- item`, `* item`, `+ item`, `1. item` or `1) item`. */
const LIST_ITEM = /^\s*(?:[-*+]|(\d+)[.)])\s+(.*)$/
/** A line that could still become a list item: a marker, or a number, with no words yet. */
const BARE_MARKER = /^\s*(?:[-*+]|\d+[.)]?)\s*$/
/** Syntax cut off at the end of a stream: an unclosed `[1`, or a lone `*` that may become `**`. */
const PARTIAL_END = /(?:\[\d*|(?<!\*)\*)$/
const INLINE_TOKEN = /(\*\*|\[\d+\])/
const CITATION = /^\[(\d+)\]$/

/**
 * Splits text into paragraphs (a blank line between them) and lists (`- ` or `1. ` lines). While `streaming`, syntax
 * cut off at the end waits for the rest: a marker with no words yet, an unclosed `[1` or a lone `*`.
 *
 * @example
 * parseBlocks('Three changed.\n\n- Fieldnote\n- Tandem')
 * // [{ type: 'paragraph', text: 'Three changed.' }, { type: 'list', ordered: false, start: 1, items: ['Fieldnote', 'Tandem'] }]
 */
export function parseBlocks(text: string, streaming = false): StreamingTextBlock[] {
  let lines = (streaming ? text.replace(PARTIAL_END, '') : text).split('\n')
  if (streaming && BARE_MARKER.test(lines.at(-1) ?? '')) lines = lines.slice(0, -1)

  const blocks: StreamingTextBlock[] = []
  let current: StreamingTextBlock | undefined

  for (const line of lines) {
    if (!line.trim()) {
      current = undefined
      continue
    }
    const item = LIST_ITEM.exec(line)
    if (item) {
      const ordered = item[1] !== undefined
      if (current?.type !== 'list' || current.ordered !== ordered) {
        current = { type: 'list', ordered, start: ordered ? Number(item[1]) : 1, items: [] }
        blocks.push(current)
      }
      current.items.push(item[2] ?? '')
    } else if (current?.type === 'list') {
      // A line right under an item, with no blank line between, carries on that item.
      current.items[current.items.length - 1] += `\n${line.trim()}`
    } else if (current) {
      current.text += `\n${line}`
    } else {
      current = { type: 'paragraph', text: line }
      blocks.push(current)
    }
  }
  return blocks
}

/**
 * Splits a block's text into words and citations: `**` turns bold on and off (an unclosed one runs to the end, so
 * bold words show as they stream), and `[1]` is a citation.
 *
 * @example
 * parseInline('**Fieldnote** raised it. [1]')
 * // [{ type: 'text', text: 'Fieldnote', bold: true }, { type: 'text', text: ' raised it. ', bold: false }, { type: 'citation', index: 1 }]
 */
export function parseInline(text: string): StreamingTextInline[] {
  const pieces: StreamingTextInline[] = []
  let bold = false
  for (const token of text.split(INLINE_TOKEN)) {
    if (token === '**') {
      bold = !bold
      continue
    }
    const citation = CITATION.exec(token)
    if (citation) pieces.push({ type: 'citation', index: Number(citation[1]) })
    else if (token) pieces.push({ type: 'text', text: token, bold })
  }
  return pieces
}

/** A block's words as one plain line, without its syntax or citations: what a screen reader hears. */
export function plainText(text: string): string {
  return parseInline(text)
    .map((piece) => (piece.type === 'text' ? piece.text : ''))
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Where the next reveal of a stream stops: a `fraction` of what's still hidden, at least one word, and always at the
 * end of a word, so words arrive whole. Text past `from` that has no space yet (a word still arriving) comes whole.
 *
 * @example
 * revealStep('Fieldnote raised its price', 0, 0.1) // 9, the end of "Fieldnote"
 */
export function revealStep(text: string, from: number, fraction: number): number {
  const target = Math.min(text.length, from + Math.max(1, Math.ceil((text.length - from) * fraction)))
  // Skip the spaces before the next word, then stop where that word ends.
  const start = Math.max(target, from + (text.slice(from).match(/^\s*/)?.[0].length ?? 0) + 1)
  const end = text.slice(start).search(/\s/)
  return end === -1 ? text.length : start + end
}
