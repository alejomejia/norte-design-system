'use client'

import { useEffect, useRef, useState } from 'react'

import { Icon } from '@/components/icon'
import { IconButton } from '@/components/icon-button'
import { useElapsed } from '@/lib/hooks'
import { formatElapsed } from '@/lib/utils'

import { VOICE_INPUT_BARS, VOICE_INPUT_LABELS } from './voice-input.const'
import { useLevelBars } from './voice-input.hooks'
import { voiceInputStyles } from './voice-input.styles'

export type VoiceInputProps = {
  /** Whether it's recording. */
  recording: boolean
  /** Called when the person starts or stops recording: open or close the microphone there. */
  onRecordingChange: (recording: boolean) => void
  /**
   * The microphone's stream while recording (`getUserMedia({ audio: true })`), for the bars to follow the voice.
   * Without it, they move on their own.
   */
  stream?: MediaStream | null
  /** The control's words, for screen readers and its tooltip. */
  labels?: { start: string; stop: string; recording: string }
  className?: string
}

/**
 * Dictation for a prompt: a mic button that grows into a recording pill, with level bars that follow the voice and a
 * timer. It draws the recording; the app owns the microphone and the transcription. Focus moves to the stop button
 * while recording and back to the mic after. Idea from React Bits' Voice Pill.
 *
 * @example
 * <VoiceInput recording={recording} onRecordingChange={toggleDictation} stream={micStream} />
 */
export function VoiceInput({
  recording,
  onRecordingChange,
  stream,
  labels = VOICE_INPUT_LABELS,
  className,
}: VoiceInputProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const barsRef = useRef<(HTMLSpanElement | null)[]>([])
  const micRef = useRef<HTMLButtonElement>(null)
  const stopRef = useRef<HTMLButtonElement>(null)

  // The timer counts from the moment recording starts. Adjusted while rendering, so it starts at zero.
  const [startedAt, setStartedAt] = useState(0)
  const [wasRecording, setWasRecording] = useState(recording)
  if (recording !== wasRecording) {
    setWasRecording(recording)
    if (recording) setStartedAt(Date.now())
  }
  const elapsed = useElapsed(rootRef, startedAt, { running: recording })
  useLevelBars(rootRef, barsRef, { active: recording, stream })

  // The button that was pressed disappears, so focus moves to the one that takes its place.
  const focusedOnce = useRef(false)
  useEffect(() => {
    if (!focusedOnce.current) {
      focusedOnce.current = true
      return
    }
    ;(recording ? stopRef : micRef).current?.focus()
  }, [recording])

  const styles = voiceInputStyles()
  return (
    <div ref={rootRef} className={styles.root({ className })}>
      {/* Under the pill while recording: out of reach until it shows again. */}
      <IconButton
        ref={micRef}
        inert={recording}
        icon="voice"
        label={labels.start}
        onClick={() => onRecordingChange(true)}
      />
      <div data-recording={recording || undefined} inert={!recording} className={styles.pill()}>
        <button
          ref={stopRef}
          type="button"
          aria-label={labels.stop}
          onClick={() => onRecordingChange(false)}
          className={styles.stop()}
        >
          {/* Filled, the way a stop button is drawn everywhere. */}
          <Icon name="stop" className="size-3 fill-current" />
        </button>
        <span aria-hidden="true" className={styles.bars()}>
          {Array.from({ length: VOICE_INPUT_BARS }, (_, index) => (
            <span
              key={index}
              ref={(bar) => {
                barsRef.current[index] = bar
              }}
              className={styles.bar()}
            />
          ))}
        </span>
        <span className={styles.timer()}>
          <span className="sr-only">{labels.recording}: </span>
          {formatElapsed(elapsed)}
        </span>
      </div>
    </div>
  )
}
