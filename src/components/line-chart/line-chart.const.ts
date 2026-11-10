/**
 * The space around the plot, in px, for the axes' labels: the y axis's numbers on the left (right-aligned, 8px from
 * the plot), the x axis's under it (8px down, one 16px line), and half a label above and to the right, so the top
 * number and the last one along the bottom aren't cut. The plot's overlay sits at the same insets in
 * `line-chart.styles.ts` (`top-2 right-2 bottom-6 left-10`): change both together.
 */
export const LINE_CHART_MARGIN = { top: 8, right: 8, bottom: 24, left: 40 } as const

/** The gap between an axis's labels and the plot, in px. */
export const LINE_CHART_TICK_GAP = 8

/** About how far apart the axes' labels sit, in px: the number of ticks follows the space there is. */
export const LINE_CHART_TICK_SPACING = { x: 56, y: 40 } as const

/**
 * How wide the x axis's labels are taken to be, so they never touch: about 7.5px a character of `caption` text, with
 * 16px between two. An estimate, so the ticks are known before anything is drawn.
 */
export const LINE_CHART_LABEL_FIT = { charWidth: 7.5, gap: 16 } as const

/** How strong the soft fill under the line is, at the line and at the bottom of the plot. */
export const LINE_CHART_AREA_OPACITY = { top: 0.16, bottom: 0 } as const

/** What screen readers hear while the data loads. */
export const LINE_CHART_LOADING_LABEL = 'Loading chart'
