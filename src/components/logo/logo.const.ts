/** What screen readers hear: the logo is one image with this name. */
export const LOGO_LABEL = 'Norte'

/** What a logo shows: the mark and the wordmark, the mark alone, or the mark on a tile, like an app's icon. */
export const LOGO_VARIANTS = ['full', 'mark', 'tile'] as const

/** Its sizes: the mark at Icon's sizes, `s` (16px), `m` (24px) or `l` (32px), with the wordmark set to match. */
export const LOGO_SIZES = ['s', 'm', 'l'] as const

/** The background it sits on: `default` for light ones, `inverse` for dark ones. */
export const LOGO_TONES = ['default', 'inverse'] as const

/**
 * The mark, a needle pointing north, on a 16 by 16 grid. It's split down its middle, the left half a step darker, as if
 * lit from the right. It swings around its notch, at (8, 10).
 */
export const LOGO_NEEDLE = {
  viewBox: '0 0 16 16',
  shade: 'M8 1.5v9.25L2.5 14Z',
  light: 'M8 1.5 13.5 14 8 10.75Z',
} as const

/**
 * The wordmark, "Norte" in Inter Variable at weight 600 with -0.02em of tracking and the font's kerning, outlined so it
 * looks the same whatever font an app loads. 100 units are one em, so the box is 0.7388em tall: from the cap height to
 * the bottom of the round letters, which dip below the baseline. Outlined once with fontkit; to redraw it, outline the
 * same text at the same settings.
 */
export const LOGO_WORDMARK = {
  viewBox: '0 0 252.3 73.88',
  path: 'M0 72.75L0 0L14.75 0L39.89 40.09Q41.46 42.58 43.21 45.73Q44.97 48.88 46.88 52.76Q48.78 56.64 50.63 61.38L49.17 61.38Q48.83 57.28 48.56 52.95Q48.29 48.63 48.17 44.75Q48.05 40.87 48.05 38.18L48.05 0L61.28 0L61.28 72.75L46.48 72.75L23.78 36.67Q21.63 33.2 19.73 29.83Q17.82 26.46 15.63 22.22Q13.43 17.97 10.3 11.96L12.16 11.96Q12.45 17.29 12.7 22.05Q12.94 26.81 13.11 30.57Q13.28 34.33 13.28 36.62L13.28 72.75ZM97.02 73.88Q89.06 73.88 83.21 70.34Q77.35 66.8 74.15 60.47Q70.95 54.15 70.95 45.75Q70.95 37.26 74.15 30.88Q77.35 24.51 83.21 21Q89.06 17.48 97.02 17.48Q105.03 17.48 110.89 21Q116.75 24.51 119.95 30.88Q123.15 37.26 123.15 45.75Q123.15 54.15 119.95 60.47Q116.75 66.8 110.89 70.34Q105.03 73.88 97.02 73.88ZM97.02 63.57Q101.47 63.57 104.42 61.18Q107.38 58.79 108.82 54.74Q110.26 50.68 110.26 45.7Q110.26 40.67 108.82 36.62Q107.38 32.57 104.42 30.18Q101.47 27.78 97.02 27.78Q92.58 27.78 89.67 30.18Q86.77 32.57 85.33 36.6Q83.89 40.63 83.89 45.7Q83.89 50.68 85.33 54.74Q86.77 58.79 89.67 61.18Q92.58 63.57 97.02 63.57ZM132.23 72.75L132.23 18.16L144.54 18.16L144.54 27.29L145.12 27.29Q146.59 22.56 150.25 20Q153.91 17.43 158.6 17.43Q159.67 17.43 160.99 17.53Q162.31 17.63 163.24 17.77L163.24 29.44Q162.46 29.2 160.7 29Q158.94 28.81 157.23 28.81Q153.71 28.81 150.91 30.32Q148.1 31.84 146.51 34.5Q144.93 37.16 144.93 40.63L144.93 72.75ZM196.98 18.16L196.98 28.13L165.97 28.13L165.97 18.16ZM173.74 5.18L186.43 5.18L186.43 57.37Q186.43 60.35 187.7 61.74Q188.97 63.13 191.85 63.13Q192.73 63.13 194.17 62.92Q195.61 62.7 196.49 62.5L198.49 72.31Q196.39 72.95 194.2 73.22Q192 73.49 190 73.49Q182.13 73.49 177.94 69.58Q173.74 65.67 173.74 58.45ZM228.18 73.88Q219.93 73.88 214 70.41Q208.06 66.94 204.87 60.64Q201.67 54.35 201.67 45.8Q201.67 37.35 204.82 31.01Q207.97 24.66 213.75 21.07Q219.54 17.48 227.35 17.48Q232.33 17.48 236.85 19.09Q241.37 20.7 244.86 24.07Q248.35 27.44 250.33 32.64Q252.3 37.84 252.3 45.02L252.3 49.02L207.67 49.02L207.67 40.38L246 40.38L240.05 42.92Q240.05 38.33 238.63 34.84Q237.21 31.35 234.41 29.39Q231.6 27.44 227.4 27.44Q223.2 27.44 220.27 29.42Q217.34 31.4 215.8 34.69Q214.27 37.99 214.27 42.04L214.27 48Q214.27 53.17 216.02 56.74Q217.78 60.3 220.96 62.11Q224.13 63.92 228.33 63.92Q231.11 63.92 233.38 63.11Q235.65 62.3 237.31 60.72Q238.97 59.13 239.8 56.84L251.47 59.23Q250.15 63.62 246.98 66.92Q243.81 70.21 239.05 72.05Q234.29 73.88 228.18 73.88Z',
} as const
