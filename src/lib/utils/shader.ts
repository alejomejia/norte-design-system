/** A shader's inputs by name: one number is a `float`, two a `vec2`, three a `vec3`. */
export type ShaderUniforms = Record<string, number | readonly [number, number] | readonly [number, number, number]>

/** Covers the canvas with one triangle; the fragment shader reads `gl_FragCoord` and `u_resolution`. */
const VERTEX_SHADER = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`

type Program = { program: WebGLProgram; position: number; locations: Map<string, WebGLUniformLocation | null> }

type Renderer = { gl: WebGLRenderingContext; buffer: WebGLBuffer; programs: Map<string, Program> }

/** `undefined` until first used, `null` where WebGL isn't available. */
let renderer: Renderer | null | undefined

function createRenderer(): Renderer | null {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, premultipliedAlpha: false })
  const buffer = gl?.createBuffer()
  if (!gl || !buffer) return null
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  // A lost context (the GPU reset, too many tabs) is rebuilt on the next draw.
  canvas.addEventListener('webglcontextlost', () => {
    renderer = undefined
  })
  return { gl, buffer, programs: new Map() }
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader
  console.error(gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)
  return null
}

function programFor({ gl, programs }: Renderer, fragment: string): Program | null {
  const cached = programs.get(fragment)
  if (cached) return cached
  const vertexShader = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, fragment)
  const program = gl.createProgram()
  if (!vertexShader || !fragmentShader || !program) return null
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program))
    return null
  }
  const entry = { program, position: gl.getAttribLocation(program, 'a_position'), locations: new Map() }
  programs.set(fragment, entry)
  return entry
}

function setUniform(
  gl: WebGLRenderingContext,
  { program, locations }: Program,
  name: string,
  value: ShaderUniforms[string],
) {
  if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name))
  const location = locations.get(name) ?? null
  if (typeof value === 'number') gl.uniform1f(location, value)
  else if (value.length === 2) gl.uniform2f(location, value[0], value[1])
  else gl.uniform3f(location, value[0], value[1], value[2])
}

/**
 * Paints a fragment shader into a 2D canvas, at the canvas's size. Every caller shares one hidden WebGL context (a
 * browser allows only a handful per page): the shader draws there, and the frame is copied into `target`. So a page can
 * hold any number of small shader canvases, like a list of agent avatars. The shader gets `u_resolution` (in device
 * pixels) and `uniforms`. Returns `false` where WebGL isn't available, so the caller can show a fallback. Client-only.
 */
export function drawShader(target: HTMLCanvasElement, fragment: string, uniforms: ShaderUniforms): boolean {
  if (renderer === undefined) renderer = createRenderer()
  const context = target.getContext('2d')
  if (!renderer || !context) return false
  const program = programFor(renderer, fragment)
  if (!program) return false

  const { gl, buffer } = renderer
  const { width, height } = target
  // The shared canvas only grows, so drawing small avatars after a big one never reallocates it.
  if (gl.canvas.width < width) gl.canvas.width = width
  if (gl.canvas.height < height) gl.canvas.height = height

  gl.viewport(0, 0, width, height)
  gl.useProgram(program.program)
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.enableVertexAttribArray(program.position)
  gl.vertexAttribPointer(program.position, 2, gl.FLOAT, false, 0, 0)
  setUniform(gl, program, 'u_resolution', [width, height])
  for (const [name, value] of Object.entries(uniforms)) setUniform(gl, program, name, value)
  gl.drawArrays(gl.TRIANGLES, 0, 3)

  // WebGL's origin is the bottom left, so the frame sits at the bottom of the shared canvas. Copied in the same task as
  // the draw, before the browser clears the buffer.
  context.clearRect(0, 0, width, height)
  context.drawImage(gl.canvas, 0, gl.canvas.height - height, width, height, 0, 0, width, height)
  return true
}
