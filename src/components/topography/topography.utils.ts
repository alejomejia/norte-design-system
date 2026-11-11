import { type Rgb } from '@/lib/utils'

import {
  TOPOGRAPHY_FRAGMENT_SHADER,
  TOPOGRAPHY_MAX_PIXEL_RATIO,
  type TOPOGRAPHY_TONES,
  TOPOGRAPHY_VERTEX_SHADER,
} from './topography.const'

/** A shader program on a canvas: what the map needs to draw a frame and to fit its box. */
export type TopographyRenderer = {
  draw: (time: number) => void
  resize: () => void
  dispose: () => void
}

/** Compiles one shader, or gives `null` and logs why. Client-only. */
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

/**
 * Sets up the map's shader on a canvas, or gives `null` where WebGL 2 isn't there (the dark tone's glow stays). The
 * light tone draws its lines in `ink`, on a transparent canvas. Client-only.
 */
export function createTopographyRenderer(
  canvas: HTMLCanvasElement,
  tone: (typeof TOPOGRAPHY_TONES)[number],
  ink: Rgb,
): TopographyRenderer | null {
  const light = tone === 'light'
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: light, powerPreference: 'low-power' })
  if (!gl) return null

  const vertex = compile(gl, gl.VERTEX_SHADER, TOPOGRAPHY_VERTEX_SHADER)
  const fragment = compile(gl, gl.FRAGMENT_SHADER, TOPOGRAPHY_FRAGMENT_SHADER)
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
  gl.uniform1f(gl.getUniformLocation(program, 'u_light'), light ? 1 : 0)
  gl.uniform3f(gl.getUniformLocation(program, 'u_ink'), ...ink)

  return {
    draw(seconds) {
      gl.uniform2f(resolution, canvas.width, canvas.height)
      gl.uniform1f(time, seconds)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    resize() {
      const ratio = Math.min(window.devicePixelRatio, TOPOGRAPHY_MAX_PIXEL_RATIO)
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
