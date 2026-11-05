import { useEffect, useRef, useState } from 'react'

import { useInViewport, useReducedMotion } from '@/lib/hooks'

/** The device pixel ratio the map renders at, at most: its lines are antialiased, so more is GPU time no one sees. */
const MAX_PIXEL_RATIO = 1.5

/** The moment the still map shows under reduced motion, in seconds: one with the signal crossing the lines. */
const STILL_TIME = 14

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

/*
 * A topographic map of a terrain that drifts north. The height is fractal noise, warped by more noise so ridges bend
 * like real ones; contour lines are drawn where it crosses a level, every fifth one brighter (an index line, like on a
 * survey map). One level lights up and sweeps up and down the terrain: the signal. Everything fades toward the bottom
 * left, where the page title sits, under a blue glow from the top right.
 */
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
out vec4 fragColor;

vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

// Gradient noise, smooth and between about -0.5 and 0.5.
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash(i), f), dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// Three octaves, each turned and scaled: large landforms with some detail, without a clutter of tiny rings.
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 turn = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 3; i++) {
    value += amplitude * noise(p);
    p = turn * p;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 screen = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 uv = vec2(screen.x * aspect, screen.y);
  float t = u_time;

  // Sampling further south over time makes the terrain move north.
  vec2 p = uv * 1.1 + vec2(0.0, -t * 0.045);
  vec2 warp = vec2(fbm(p + vec2(0.0, t * 0.03)), fbm(p + vec2(5.2, 1.3) - t * 0.022));
  float height = fbm(p + warp * 0.6);

  // Distance to the nearest contour, in levels, antialiased by how fast the height changes on screen.
  float levels = height * 14.0;
  float gap = 0.5 - abs(fract(levels) - 0.5);
  float isIndex = 1.0 - step(0.5, mod(floor(levels + 0.5), 5.0));
  float width = fwidth(levels) * (1.2 + isIndex * 0.6);
  float line = 1.0 - smoothstep(0.0, width, gap);

  float signal = exp(-pow((height - sin(t * 0.38) * 0.32) * 20.0, 2.0));
  float reveal = smoothstep(0.08, 0.95, screen.x * 0.75 + screen.y * 0.45);
  float glow = smoothstep(1.2, 0.0, length((screen - vec2(0.9, 1.0)) * vec2(aspect, 1.0)) / aspect * 1.6);

  vec3 background = vec3(0.035, 0.039, 0.051);
  vec3 lineColor = mix(vec3(0.2, 0.32, 0.74), vec3(0.52, 0.66, 1.0), isIndex);
  vec3 signalColor = vec3(0.62, 0.76, 1.0);

  vec3 color = background + vec3(0.13, 0.25, 0.9) * glow * 0.32;
  color += lineColor * line * (0.24 + 0.3 * isIndex) * reveal;
  color += signalColor * line * signal * 0.9 * reveal;
  fragColor = vec4(color, 1.0);
}`

/** A shader program on a canvas: what the map needs to draw a frame and to fit its box. */
type Renderer = {
  draw: (time: number) => void
  resize: () => void
  dispose: () => void
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader))
    return null
  }
  return shader
}

/** Sets up the map's shader on a canvas, or gives nothing where WebGL 2 isn't there (the glow behind it stays). */
function createRenderer(canvas: HTMLCanvasElement): Renderer | null {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power' })
  if (!gl) return null

  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  const program = gl.createProgram()
  if (!vertex || !fragment || !program) return null
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)

  // One triangle that covers the whole canvas: every pixel runs the fragment shader once.
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, 'a_position')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

  const resolution = gl.getUniformLocation(program, 'u_resolution')
  const time = gl.getUniformLocation(program, 'u_time')

  return {
    draw(seconds) {
      gl.uniform2f(resolution, canvas.width, canvas.height)
      gl.uniform1f(time, seconds)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    resize() {
      const ratio = Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO)
      canvas.width = Math.round(canvas.clientWidth * ratio)
      canvas.height = Math.round(canvas.clientHeight * ratio)
      gl.viewport(0, 0, canvas.width, canvas.height)
    },
    dispose() {
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
    },
  }
}

/**
 * The Introduction's cover: a live topographic map drifting north, Norte's name drawn as terrain. A WebGL shader, so
 * the GPU does the work and the page stays smooth. It draws only while on screen in a visible tab, and shows one still
 * map under reduced motion. Fills the page header (`PageHeader`'s `cover`).
 */
export function Topography() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<Renderer | null>(null)
  // Seconds the map has run, kept across pauses so it picks up where it stopped.
  const elapsedRef = useRef(STILL_TIME)
  const [ready, setReady] = useState(false)
  const visible = useInViewport(canvasRef)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const renderer = createRenderer(canvas)
    if (!renderer) return
    rendererRef.current = renderer

    const observer = new ResizeObserver(() => {
      renderer.resize()
      renderer.draw(elapsedRef.current)
    })
    observer.observe(canvas)
    setReady(true)

    return () => {
      observer.disconnect()
      renderer.dispose()
      rendererRef.current = null
    }
  }, [])

  useEffect(() => {
    const renderer = rendererRef.current
    if (!renderer || !ready) return
    if (reducedMotion) {
      renderer.draw(STILL_TIME)
      return
    }
    if (!visible) return

    let frame = 0
    let last = performance.now()
    function tick(now: number) {
      elapsedRef.current += (now - last) / 1000
      last = now
      renderer?.draw(elapsedRef.current)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [visible, reducedMotion, ready])

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 bg-[radial-gradient(60%_90%_at_90%_0%,oklch(0.546_0.245_262/30%),transparent)]"
    >
      {/* Fades in on its first frame, instead of flashing in over the glow. */}
      <canvas
        ref={canvasRef}
        data-ready={ready || undefined}
        className="size-full opacity-0 transition-opacity duration-(--duration-slower) data-ready:opacity-100"
      />
    </div>
  )
}
