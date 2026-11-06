import { type AVATAR_EFFECTS } from './avatar.const'

/**
 * What every effect shares: its inputs, a value noise with its fractal sum (fbm), and a film grain. Inputs: `u_time` in
 * seconds, `u_seed` (from the agent's name, so two agents never look alike), and the three colors, deep to light. The
 * grain is one hash per pixel, blended over the color like a noise texture in overlay mode: it darkens the darks and
 * lifts the lights, so it reads as texture, not as gray dust. It's fixed to the pixel, not the time, so it holds still
 * while the colors move under it, like film grain, and never flickers. It costs nothing beyond that hash: no texture,
 * no extra layer, no blend mode.
 */
const PRELUDE = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_seed;
uniform vec3 u_deep;
uniform vec3 u_mid;
uniform vec3 u_light;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 turn = mat2(0.8, 0.6, -0.6, 0.8);
  for (int octave = 0; octave < 4; octave++) {
    value += amplitude * noise(p);
    p = turn * p * 2.02;
    amplitude *= 0.5;
  }
  return value;
}

vec3 grain(vec3 color) {
  float n = hash(gl_FragCoord.xy);
  vec3 overlay = mix(2.0 * color * n, 1.0 - 2.0 * (1.0 - color) * (1.0 - n), step(0.5, color));
  return mix(color, overlay, 0.18);
}

/** -1 to 1 across the canvas, y up. */
vec2 centered() {
  return (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
}
`

/**
 * A slow, liquid gradient lit like a sphere: the noise is folded into itself twice (domain warping), so the colors
 * swirl and stretch rather than drift, then a soft light from the top left and a shade toward the bottom right give it
 * volume.
 */
const ORB = `${PRELUDE}
void main() {
  vec2 p = centered();
  float t = u_time * 0.09;
  vec2 s = vec2(u_seed, u_seed * 1.7);
  vec2 q = vec2(fbm(p * 0.5 + s + vec2(0.0, t)), fbm(p * 0.5 + s + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p * 0.6 + 1.6 * q + vec2(1.7, 9.2) + t * 0.7), fbm(p * 0.6 + 1.6 * q + vec2(8.3, 2.8) - t * 0.6));
  float f = fbm(p * 0.5 + 1.6 * r + s);

  // The colors cycle along the noise (deep, mid, light and back), so every orb shows all three, whatever its seed.
  float band = abs(fract(f * 1.1 + q.x * 0.35 + 0.25) * 2.0 - 1.0);
  vec3 color = mix(u_deep, u_mid, smoothstep(0.0, 0.55, band));
  color = mix(color, u_light, smoothstep(0.45, 1.0, band));
  // Light from the top left, shade toward the bottom right.
  color = mix(color, u_light, 0.28 * (1.0 - smoothstep(0.0, 1.1, length(p - vec2(-0.45, 0.5)))));
  color *= 1.0 - 0.28 * smoothstep(0.3, 1.5, length(p - vec2(-0.3, 0.35)));
  gl_FragColor = vec4(grain(color), 1.0);
}
`

/**
 * A mesh gradient: four points of color wander on slow loops, and every pixel blends them by how close they are, so
 * the colors meet in smooth fields with no visible edge.
 */
const MESH = `${PRELUDE}
vec2 wander(float speed, float phase, float reach) {
  float a = u_time * speed + phase + u_seed;
  return vec2(cos(a), sin(a * 1.3)) * reach;
}

void main() {
  vec2 p = centered();
  vec2 points[4];
  points[0] = wander(0.35, 0.0, 0.6);
  points[1] = wander(-0.28, 2.1, 0.7);
  points[2] = wander(0.22, 4.2, 0.5);
  points[3] = wander(-0.4, 1.0, 0.8);
  vec3 colors[4];
  colors[0] = u_mid;
  colors[1] = u_light;
  colors[2] = u_deep;
  colors[3] = u_mid;

  vec3 sum = vec3(0.0);
  float total = 0.0;
  for (int i = 0; i < 4; i++) {
    float d = distance(p, points[i]);
    float weight = 1.0 / (d * d * d + 0.02);
    sum += colors[i] * weight;
    total += weight;
  }
  gl_FragColor = vec4(grain(sum / total), 1.0);
}
`

/** Each effect's fragment shader, for `drawShader`. */
export const AVATAR_SHADERS = {
  orb: ORB,
  mesh: MESH,
} as const satisfies Record<(typeof AVATAR_EFFECTS)[number], string>
