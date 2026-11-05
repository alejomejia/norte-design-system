// The public surface of the utils domain: everything outside this folder imports from `@/lib/utils`.
export { contrastRatio, isInSrgbGamut, type LinearRgb, oklchToLinearRgb, parseOklch, toHex } from './color'
export { mergeRefs } from './refs'
export { drawShader, type ShaderUniforms } from './shader'
export { cn, type Rgb, readCssColor, toCSSVars, tv, type VariantProps } from './styles'
export { initials } from './text'
export { formatElapsed } from './time'
export { isExternalUrl } from './url'
