import { tv } from '@/lib/utils'

/**
 * The prompt: a card that holds a text area that grows with its text (`field-sizing: content`, up to 240px, then
 * scrolls) over a toolbar. Typing in it outlines the card in the accent and lifts it a little.
 */
export const promptInputStyles = tv({
  slots: {
    root: [
      'flex flex-col gap-2 rounded-xl border border-line bg-surface p-3 shadow-s',
      'transition-[border-color,box-shadow] duration-(--duration-base) ease-standard',
      'has-[textarea:focus-visible]:border-accent has-[textarea:focus-visible]:shadow-m',
    ],
    textarea:
      'field-sizing-content max-h-60 min-h-12 w-full resize-none bg-transparent px-1 text-body text-ink outline-none placeholder:text-ink-subtle',
    toolbar: 'flex items-center justify-between gap-2',
    group: 'flex items-center gap-1',
  },
})
