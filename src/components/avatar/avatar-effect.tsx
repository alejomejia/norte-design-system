'use client'

import { useEffect, useRef } from 'react'

import { useAnimationFrame, useInViewport, useReducedMotion } from '@/lib/hooks'
import { drawShader, type Rgb, readCssColor } from '@/lib/utils'

import { type AVATAR_EFFECTS, type AVATAR_SIZES } from './avatar.const'
import { AVATAR_SHADERS } from './avatar.shaders'
import { type AvatarAgentColors, avatarSeed } from './avatar.utils'

/** The longest step the effect takes between two frames, in seconds: after a stall it carries on, it doesn't leap. */
const MAX_STEP = 0.1

type Frame = { shader: string; time: number; seed: number; colors: readonly [Rgb, Rgb, Rgb] }

/** Paints one frame of an effect. */
function paintFrame(canvas: HTMLCanvasElement, { shader, time, seed, colors }: Frame) {
  drawShader(canvas, shader, {
    u_time: time,
    u_seed: seed,
    u_deep: colors[0],
    u_mid: colors[1],
    u_light: colors[2],
  })
}

type AvatarEffectProps = {
  /** The agent's name: it seeds the pattern, so every agent has its own. */
  name: string
  effect: (typeof AVATAR_EFFECTS)[number]
  colors: AvatarAgentColors
  /** Moves the effect; otherwise it holds one still frame. */
  live: boolean
  size: (typeof AVATAR_SIZES)[number]
  className?: string
}

/**
 * An agent's moving colors: a shader painted into a small canvas at the avatar's size in device pixels (2x at most). It
 * paints one still frame, and moves only while the agent is working, on screen, in a tab that's showing, and for people
 * who haven't asked for less motion. Every live avatar shares one animation loop and one WebGL context. Without WebGL
 * the canvas stays empty and the shape's CSS gradient shows through.
 */
export function AvatarEffect({ name, effect, colors: [deep, mid, light], live, size, className }: AvatarEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const colorsRef = useRef<readonly [Rgb, Rgb, Rgb] | null>(null)
  // Time runs only while the effect moves, so it picks up where it stopped instead of jumping.
  const timeRef = useRef(0)
  const lastFrameRef = useRef<number | null>(null)

  const visible = useInViewport(canvasRef)
  const reducedMotion = useReducedMotion()
  const moving = live && visible && !reducedMotion
  const seed = avatarSeed(name)
  const shader = AVATAR_SHADERS[effect]

  // Sizes the canvas in device pixels, reads the colors (a shader can't read CSS) and paints a still frame. A new `size`
  // runs it again, so the canvas measures itself at the new size.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // Measured, not looked up, so an avatar made bigger with `className` stays sharp.
    const side = Math.round(canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 2))
    canvas.width = side
    canvas.height = side
    const colors = [readCssColor(canvas, deep), readCssColor(canvas, mid), readCssColor(canvas, light)] as const
    colorsRef.current = colors
    paintFrame(canvas, { shader, time: timeRef.current, seed, colors })
  }, [size, deep, mid, light, seed, shader])

  useEffect(() => {
    if (!moving) lastFrameRef.current = null
  }, [moving])

  useAnimationFrame((now) => {
    const last = lastFrameRef.current
    lastFrameRef.current = now
    if (last !== null) timeRef.current += Math.min((now - last) / 1000, MAX_STEP)
    const canvas = canvasRef.current
    const colors = colorsRef.current
    if (canvas && colors) paintFrame(canvas, { shader, time: timeRef.current, seed, colors })
  }, moving)

  return <canvas ref={canvasRef} className={className} />
}
