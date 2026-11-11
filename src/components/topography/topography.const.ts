/** How the map looks: `dark`, a night survey map with a glow, or `light`, its lines alone, for a light surface. */
export const TOPOGRAPHY_TONES = ['dark', 'light'] as const

/** The device pixel ratio the map renders at, at most: its lines are antialiased, so more is GPU time no one sees. */
export const TOPOGRAPHY_MAX_PIXEL_RATIO = 1.5

/** The moment the still map shows under reduced motion, in seconds: one with the signal crossing the lines. */
export const TOPOGRAPHY_STILL_TIME = 14

/** Passes the corners of the triangle that covers the canvas through as they are. */
export const TOPOGRAPHY_VERTEX_SHADER = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

/*
 * A topographic map of a terrain that drifts north. The height is fractal noise, warped by more noise so ridges bend
 * like real ones; contour lines are drawn where it crosses a level, every fifth one brighter (an index line, like on a
 * survey map). One level lights up and sweeps up and down the terrain: the signal. Everything fades toward the bottom
 * left, where the page title sits, under a blue glow from the top right.
 *
 * The light tone (`u_light`) draws the lines alone, in `u_ink`, on a transparent canvas: no night sky, no glow and no
 * fade, for a texture over a light surface. Its colors are premultiplied, as the canvas expects.
 */
export const TOPOGRAPHY_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_light;
uniform vec3 u_ink;
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

  if (u_light > 0.5) {
    float alpha = clamp(line * (0.5 + 0.5 * isIndex + signal * 0.5), 0.0, 1.0);
    fragColor = vec4(u_ink * alpha, alpha);
    return;
  }

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
