import { type ThemeVarsPartial } from 'storybook/theming'

/**
 * Norte's palette for the Storybook UI, as hex literals. Storybook's theme runs color math on these (hover tints,
 * transparency), which CSS variables can't go through. They are the hex values of the tokens in `theme.css`, as the
 * Colors page lists them.
 */
export const PALETTE = {
  white: '#ffffff',
  neutral50: '#f9fafb',
  neutral100: '#f3f4f6',
  neutral200: '#e3e5e9',
  neutral400: '#8f9298',
  neutral500: '#6b6f76',
  neutral600: '#50545b',
  neutral900: '#15171b',
  blue600: '#085efb',
}

const FONT_SANS = '"Inter Variable", Inter, ui-sans-serif, system-ui, sans-serif'
const FONT_MONO = '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, monospace'

/** The Storybook theme, shared by the UI (`manager.ts`) and the docs pages (`preview.ts`). The brand is added in `manager.ts`. */
export const THEME_VARS = {
  base: 'light',
  fontBase: FONT_SANS,
  fontCode: FONT_MONO,

  colorPrimary: PALETTE.blue600,
  colorSecondary: PALETTE.blue600,

  appBg: PALETTE.neutral50,
  appContentBg: PALETTE.white,
  appPreviewBg: PALETTE.white,
  appBorderColor: PALETTE.neutral200,
  appBorderRadius: 8,

  textColor: PALETTE.neutral900,
  textInverseColor: PALETTE.white,
  textMutedColor: PALETTE.neutral500,

  barTextColor: PALETTE.neutral500,
  barHoverColor: PALETTE.neutral900,
  barSelectedColor: PALETTE.neutral900,
  barBg: PALETTE.white,

  buttonBg: PALETTE.white,
  buttonBorder: PALETTE.neutral200,
  booleanBg: PALETTE.neutral100,
  booleanSelectedBg: PALETTE.white,

  inputBg: PALETTE.white,
  inputBorder: PALETTE.neutral200,
  inputTextColor: PALETTE.neutral900,
  inputBorderRadius: 8,
} satisfies ThemeVarsPartial
