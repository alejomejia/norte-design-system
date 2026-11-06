/**
 * Play functions run only when asked: a story opens at rest, and its interactions run from the Interactions panel
 * (Rerun, or stepping through them) or from the sidebar's test runner. Storybook has no option for it (only embed mode
 * skips them), but it reads the current render's `autoplay` after the project's `beforeEach`, so that's where it's set.
 * The component tests (`pnpm test:stories`) run stories without this preview, so they still play every one.
 */
import { FORCE_REMOUNT } from 'storybook/internal/core-events'
import { addons } from 'storybook/preview-api'

type StoryRender = { id?: string; renderOptions?: { autoplay: boolean } }

type PreviewGlobal = { __STORYBOOK_PREVIEW__?: { currentRender?: StoryRender } }

/** The story whose interactions were asked for, until its render consumes it. */
let requested: string | undefined

/** Remembers when the Interactions panel asks a story to run again: that render plays. */
export function listenForPlayRequests() {
  addons.getChannel().on(FORCE_REMOUNT, ({ storyId }: { storyId: string }) => {
    requested = storyId
  })
}

/** A project `beforeEach`: turns the current story's autoplay off, unless its interactions were just asked for. */
export function playOnlyWhenAsked({ id, viewMode }: { id: string; viewMode?: string }) {
  const render = (globalThis as PreviewGlobal).__STORYBOOK_PREVIEW__?.currentRender
  if (viewMode !== 'story' || render?.id !== id || !render.renderOptions) return
  render.renderOptions.autoplay = requested === id
  requested = undefined
}
