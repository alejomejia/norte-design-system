/** The way the recording pill grows from the mic: `left` for a mic at the end of a toolbar. */
export const VOICE_INPUT_SIDES = ['right', 'left'] as const

/** How many level bars the recording pill shows. */
export const VOICE_INPUT_BARS = 5

/** The words of the control. English defaults: pass `labels` to translate. */
export const VOICE_INPUT_LABELS = {
  start: 'Dictate',
  stop: 'Stop recording',
  recording: 'Recording',
}

/** The lowest a bar goes, as a share of its height, so silence still shows the bars. */
export const VOICE_INPUT_MIN_LEVEL = 0.2
