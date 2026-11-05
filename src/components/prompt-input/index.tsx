'use client'

import { type KeyboardEvent, useState } from 'react'

import { IconButton } from '@/components/icon-button'
import { Select, type SelectItem } from '@/components/select'
import { Tooltip } from '@/components/tooltip'
import { VoiceInput } from '@/components/voice-input'

import { PROMPT_INPUT_LABELS } from './prompt-input.const'
import { promptInputStyles } from './prompt-input.styles'

export type PromptInputProps = {
  /** The text, when the app controls it. Without it, the prompt keeps its own and clears it on send. */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Called with the text when it's sent: Enter, or the send button. Shift + Enter adds a line instead. */
  onSubmit: (prompt: string) => void
  /** While the agent runs: the send button becomes a stop button. */
  running?: boolean
  /** Called by the stop button. */
  onStop?: () => void
  /** The models to pick from, in a quiet select in the toolbar. Without them, there's no picker. */
  models?: SelectItem[]
  model?: string
  defaultModel?: string
  onModelChange?: (model: string) => void
  /** Called by the attach button: open a file picker there. Without it, there's no attach button. */
  onAttach?: () => void
  /** Dictation: with `onRecordingChange`, the toolbar gets a `VoiceInput`. */
  recording?: boolean
  onRecordingChange?: (recording: boolean) => void
  /** The microphone's stream while recording, for the level bars. */
  stream?: MediaStream | null
  /** The prompt's words: its name, its placeholder and its buttons'. */
  labels?: typeof PROMPT_INPUT_LABELS
  className?: string
}

/**
 * Where a person asks an agent for something: a text area that grows as they write, a toolbar with attachments, the
 * model and dictation, and a send button that becomes a stop button while the agent runs. Enter sends, Shift + Enter
 * adds a line, and Enter never sends while an input method is still composing a word. Idea from React Bits' Prompt Bar.
 *
 * @example
 * <PromptInput onSubmit={startRun} running={run.active} onStop={stopRun} models={MODELS} defaultModel="balanced" />
 */
export function PromptInput({
  value,
  defaultValue = '',
  onValueChange,
  onSubmit,
  running = false,
  onStop,
  models,
  model,
  defaultModel,
  onModelChange,
  onAttach,
  recording = false,
  onRecordingChange,
  stream,
  labels = PROMPT_INPUT_LABELS,
  className,
}: PromptInputProps) {
  const [ownValue, setOwnValue] = useState(defaultValue)
  const text = value ?? ownValue
  const canSend = text.trim().length > 0 && !running

  function change(next: string) {
    if (value === undefined) setOwnValue(next)
    onValueChange?.(next)
  }

  function submit() {
    if (!canSend) return
    onSubmit(text.trim())
    if (value === undefined) setOwnValue('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter while an input method composes (Japanese, Chinese…) confirms the word: it must not send.
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    submit()
  }

  const styles = promptInputStyles()
  return (
    <form
      className={styles.root({ className })}
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <textarea
        aria-label={labels.prompt}
        rows={1}
        value={text}
        placeholder={labels.placeholder}
        onChange={(event) => change(event.currentTarget.value)}
        onKeyDown={handleKeyDown}
        className={styles.textarea()}
      />
      <div className={styles.toolbar()}>
        <div className={styles.group()}>
          {onAttach && <IconButton size="s" icon="attach" label={labels.attach} onClick={onAttach} />}
          {models && (
            <Select
              variant="ghost"
              aria-label={labels.model}
              items={models}
              value={model}
              defaultValue={defaultModel}
              onValueChange={(next) => {
                if (next) onModelChange?.(next)
              }}
            />
          )}
        </div>
        <div className={styles.group()}>
          {onRecordingChange && (
            <VoiceInput recording={recording} onRecordingChange={onRecordingChange} stream={stream} />
          )}
          {running ? (
            <IconButton variant="secondary" icon="stop" label={labels.stop} onClick={onStop} />
          ) : (
            <Tooltip content={labels.send} shortcut={['↵']}>
              <IconButton type="submit" variant="primary" icon="send" label={labels.send} disabled={!canSend} />
            </Tooltip>
          )}
        </div>
      </div>
    </form>
  )
}
