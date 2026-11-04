/**
 * Just enough color math to check the tokens: OKLCH to sRGB, and WCAG 2 contrast. Formulas from Björn Ottosson's OKLab
 * (https://bottosson.github.io/posts/oklab/) and WCAG 2.2's relative luminance.
 */

/** A color in linear sRGB, each channel 0–1 when it's inside the sRGB gamut. */
export type LinearRgb = [r: number, g: number, b: number]

/** Parses `oklch(L C H)`, with L as a number (0–1) or a percentage. */
export function parseOklch(value: string): [l: number, c: number, h: number] {
  const match = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(value.trim())
  if (!match) throw new Error(`Not an oklch() color: ${value}`)
  const [, l = '0', percent, c = '0', h = '0'] = match
  return [Number(l) / (percent ? 100 : 1), Number(c), Number(h)]
}

export function oklchToLinearRgb([l, c, h]: [number, number, number]): LinearRgb {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const lms = [
    l + 0.3963377774 * a + 0.2158037573 * b,
    l - 0.1055613458 * a - 0.0638541728 * b,
    l - 0.0894841775 * a - 1.291485548 * b,
  ].map((value) => value ** 3) as [number, number, number]
  const [L, M, S] = lms
  return [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ]
}

/** Whether every channel fits sRGB, so the color looks the same on every screen (with a little rounding slack). */
export function isInSrgbGamut(rgb: LinearRgb): boolean {
  return rgb.every((channel) => channel >= -0.001 && channel <= 1.001)
}

/** WCAG relative luminance. The channels are already linear, so no gamma step is needed. */
function luminance(rgb: LinearRgb): number {
  const [r, g, b] = rgb.map((channel) => Math.min(Math.max(channel, 0), 1)) as LinearRgb
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** The WCAG contrast ratio between two colors, from 1 to 21. */
export function contrastRatio(a: LinearRgb, b: LinearRgb): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (lighter + 0.05) / (darker + 0.05)
}
