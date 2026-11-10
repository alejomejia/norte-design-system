'use client'

import { useId, useMemo, useRef } from 'react'

import { Skeleton } from '@/components/skeleton'
import { useElementSize } from '@/lib/hooks'
import { formatCompact } from '@/lib/utils'

import { LINE_CHART_LOADING_LABEL } from './line-chart.const'
import { lineChartStyles } from './line-chart.styles'
import { type LineChartPoint } from './line-chart.types'
import { LineChartPlot } from './line-chart-plot'

export type { LineChartPoint } from './line-chart.types'

export type LineChartProps = {
  /** The points, sorted by `x`. With none, it draws nothing: show an `EmptyState` in its place. */
  data: LineChartPoint[]
  /**
   * Shows only the latest this many points, for a live chart: as more arrive it scrolls instead of crowding, the oldest
   * leaving on the left. All of them by default.
   */
  maxPoints?: number
  /** What the line measures, like "Tokens per minute": names the chart, and heads its table for screen readers. */
  label: string
  /** What a glance at the line shows, in a sentence, for screen readers: its peak, its trend, what stands out. */
  summary?: string
  /** What the x axis counts, like "Elapsed": the first column of the chart's table for screen readers. */
  xLabel: string
  /** Writes an x value for the axis, the readout and the table: `2.5` as "2m 30s". */
  formatX?: (x: number) => string
  /** Writes a y value for the axis, the readout and the table. Compact by default: `13400` as "13.4K". */
  formatY?: (y: number) => string
  /** Fills the space under the line with a soft wash of its color. */
  area?: boolean
  /** Shows a placeholder the chart's size while the data loads. */
  loading?: boolean
  /** What screen readers hear while it loads. */
  loadingLabel?: string
  /** Its size, like `h-64`: it fills its box, 192px high by default, and redraws as the box resizes. */
  className?: string
}

/** An x value as a plain number, in English by default, so a server and a browser print the same. */
function formatNumber(value: number) {
  return value.toLocaleString('en')
}

/**
 * How one number moved over time, like the tokens a run spent each minute. Pointing at it or walking it with the arrow
 * keys reads the nearest point, and screen readers get a summary and the data as a table. It fills its box and redraws
 * as the box resizes; new data glides in, and with `maxPoints` a live chart scrolls. Built on visx; idea from Tremor's
 * area chart.
 *
 * @example
 * <LineChart
 *   label="Tokens per minute"
 *   xLabel="Elapsed"
 *   summary="Peaked at 13.4K tokens a minute at 2m, while reading the pricing pages."
 *   data={[{ x: 0, y: 0 }, { x: 0.5, y: 4200 }, { x: 1, y: 7800 }]}
 *   formatX={(minutes) => `${minutes}m`}
 * />
 */
export function LineChart({
  data,
  label,
  summary,
  xLabel,
  formatX = formatNumber,
  formatY = formatCompact,
  area = true,
  loading = false,
  loadingLabel = LINE_CHART_LOADING_LABEL,
  maxPoints,
  className,
}: LineChartProps) {
  const styles = lineChartStyles()
  const ref = useRef<HTMLElement>(null)
  const { width, height } = useElementSize(ref)
  const summaryId = useId()
  // The window of points in view, and the one before it, drawn past the left edge so the line runs to it.
  const windowed = maxPoints !== undefined && data.length > maxPoints
  const points = useMemo(() => (windowed ? data.slice(-maxPoints) : data), [data, windowed, maxPoints])
  const lead = windowed ? data[data.length - maxPoints - 1] : undefined

  return (
    <figure
      ref={ref}
      aria-label={label}
      aria-describedby={summary ? summaryId : undefined}
      className={styles.root({ className })}
    >
      {loading ? (
        <Skeleton label={loadingLabel} className="absolute inset-0">
          <Skeleton.Box className="h-full" />
        </Skeleton>
      ) : (
        points.length > 0 && (
          <>
            {width > 0 && (
              <LineChartPlot
                data={points}
                lead={lead}
                width={width}
                height={height}
                label={label}
                formatX={formatX}
                formatY={formatY}
                area={area}
              />
            )}
            <table className="sr-only">
              <caption>{label}</caption>
              <thead>
                <tr>
                  <th scope="col">{xLabel}</th>
                  <th scope="col">{label}</th>
                </tr>
              </thead>
              <tbody>
                {points.map((point) => (
                  <tr key={point.x}>
                    <th scope="row">{formatX(point.x)}</th>
                    <td>{formatY(point.y)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )
      )}
      {/* Hidden, so it's read once, as the figure's description, not again as its content. */}
      {summary && (
        <p id={summaryId} hidden>
          {summary}
        </p>
      )}
    </figure>
  )
}
