'use client'

import { type ComponentProps, Fragment, type ReactNode, useRef, useState } from 'react'

import { useInViewport, useReducedMotion } from '@/lib/hooks'

import { type STREAMING_TEXT_REVEALS } from './streaming-text.const'
import { useSmoothText, useStreamAnnouncement } from './streaming-text.hooks'
import { streamingTextStyles } from './streaming-text.styles'
import { parseBlocks, parseInline } from './streaming-text.utils'

export type StreamingTextProps = Omit<ComponentProps<'div'>, 'className' | 'children'> & {
  /**
   * Everything written so far, growing as it arrives. Paragraphs are split by a blank line, `- ` and `1. ` lines make
   * lists, `**bold**` is bold and `[1]` is a citation.
   */
  text: string
  /** While true, new words fade in at a steady pace and a caret follows them. Off, the text shows whole and still. */
  streaming?: boolean
  /**
   * How each new word comes in: `rise` 4px into place as it fades in, `fade` in, clear a `blur`, or arrive in accent
   * `ink` and dry to the text's color. Under reduced motion, words simply appear.
   */
  reveal?: (typeof STREAMING_TEXT_REVEALS)[number]
  /** What a citation marker (`[1]`) becomes: a `Citation`, a link. Without it, the marker stays as written. */
  renderCitation?: (index: number) => ReactNode
  className?: string
}

function writtenCitation(index: number) {
  return `[${index}]`
}

/**
 * Text an agent writes as it arrives: paragraphs, lists, bold and citations, revealed word by word at a calm, steady
 * pace with a caret after the last word. Screen readers hear each paragraph once it's complete, not every word.
 *
 * @example
 * <Message.Content>
 *   <StreamingText text={reply.text} streaming={reply.status === 'streaming'} />
 * </Message.Content>
 */
export function StreamingText({
  text,
  streaming = false,
  reveal = 'rise',
  renderCitation = writtenCitation,
  className,
  ...props
}: StreamingTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useInViewport(ref)
  const reducedMotion = useReducedMotion()
  const shown = useSmoothText(text, { streaming, smooth: visible && !reducedMotion })
  const announcement = useStreamAnnouncement(text, streaming)
  // The caret only exists for text that streamed here: text loaded done never had one.
  const [streamed, setStreamed] = useState(streaming)
  if (streaming && !streamed) setStreamed(true)

  const styles = streamingTextStyles({ reveal, writing: shown.writing })
  const blocks = parseBlocks(shown.text, shown.writing)
  const caret = streamed && (
    <span aria-hidden="true" className={styles.caret()}>
      <span className={styles.caretBar()} />
    </span>
  )

  // Words and citations are keyed by their place in the whole text, which only grows: a word that's in stays mounted,
  // so it fades in once. Once the last word has faded in, words go back to plain text.
  const keys = { word: 0, citation: 0 }
  function words(source: string) {
    if (!shown.animating) return source
    return source.split(/(\s+)/).map((part) =>
      part && !/^\s/.test(part) ? (
        <span key={`w${keys.word++}`} className={styles.word()}>
          {part}
        </span>
      ) : (
        part
      ),
    )
  }
  function inline(source: string, last: boolean) {
    return (
      <>
        {parseInline(source).map((piece, index) => {
          if (piece.type === 'citation') {
            return (
              <span key={`c${keys.citation++}`} className={shown.animating ? styles.word() : undefined}>
                {renderCitation(piece.index)}
              </span>
            )
          }
          return piece.bold ? (
            <strong key={`b${index}`} className={styles.strong()}>
              {words(piece.text)}
            </strong>
          ) : (
            <Fragment key={`t${index}`}>{words(piece.text)}</Fragment>
          )
        })}
        {last && caret}
      </>
    )
  }

  return (
    <div
      {...props}
      ref={ref}
      data-writing={shown.writing || undefined}
      data-paused={!visible || undefined}
      className={styles.root({ className })}
    >
      {blocks.map((block, index) => {
        const last = index === blocks.length - 1
        if (block.type === 'paragraph') {
          return (
            // Blocks are only ever added at the end, so a block's position is its identity.
            <p key={index} className={styles.paragraph()}>
              {inline(block.text, last)}
            </p>
          )
        }
        const List = block.ordered ? 'ol' : 'ul'
        return (
          <List
            key={index}
            start={block.ordered && block.start !== 1 ? block.start : undefined}
            className={streamingTextStyles({ ordered: block.ordered }).list()}
          >
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex} className={styles.item()}>
                {inline(item, last && itemIndex === block.items.length - 1)}
              </li>
            ))}
          </List>
        )
      })}
      {blocks.length === 0 && shown.writing && <p className={styles.paragraph()}>{caret}</p>}
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </div>
  )
}
