import { tv } from '@/lib/utils'

/**
 * The prompt: a card that holds a ghost Textarea, which grows with its text (two lines to ten, then it scrolls), over a
 * toolbar. Typing in it outlines the card in the accent and lifts it a little.
 */
export const promptInputStyles = tv({
  slots: {
    root: [
      'flex flex-col gap-2 rounded-xl border border-line bg-surface p-3 shadow-s',
      'transition-[border-color,box-shadow] duration-(--duration-base) ease-standard',
      'has-[textarea:focus-visible]:border-accent has-[textarea:focus-visible]:shadow-m',
    ],
    toolbar: 'flex items-center justify-between gap-2',
    group: 'flex items-center gap-1',
  },
})
