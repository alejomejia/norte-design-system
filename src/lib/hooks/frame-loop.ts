/** Called once per frame with the frame's timestamp, in ms. */
type FrameCallback = (now: number) => void

const callbacks = new Set<FrameCallback>()
let frame = 0

function tick(now: number) {
  for (const callback of callbacks) callback(now)
  frame = callbacks.size > 0 ? requestAnimationFrame(tick) : 0
}

/**
 * Runs `callback` every frame on one `requestAnimationFrame` loop shared by every subscriber, so twenty live avatars
 * cost one loop, not twenty. The loop starts with the first subscriber and stops with the last. Returns the
 * unsubscribe. Client-only.
 */
export function subscribeToFrames(callback: FrameCallback): () => void {
  callbacks.add(callback)
  if (frame === 0) frame = requestAnimationFrame(tick)

  return function unsubscribe() {
    callbacks.delete(callback)
    if (callbacks.size === 0 && frame !== 0) {
      cancelAnimationFrame(frame)
      frame = 0
    }
  }
}
