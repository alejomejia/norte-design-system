'use client'

import { useId } from 'react'

import { Skeleton } from '@/components/skeleton'
import { formatCompact } from '@/lib/utils'

import {
  type BAR_CHART_LABEL_FONTS,
  BAR_CHART_LOADING_LABEL,
  BAR_CHART_LOADING_ROWS,
  BAR_CHART_LOADING_SHAPES,
} from './bar-chart.const'
import { barChartStyles } from './bar-chart.styles'
import { type BarChartItem } from './bar-chart.types'
import { BarChartPlot } from './bar-chart-plot'

export type { BarChartItem } from './bar-chart.types'

export type BarChartProps = {
  /**
   * The bars, drawn from the top in this order: sort them as they should read. Labels are unique, so a bar keeps its
   * place as the data changes. With none, it draws nothing: show an `EmptyState` in its place.
   */
  data: BarChartItem[]
  /** What the bars measure, like "Tool calls": names the chart, and heads its table's values for screen readers. */
  label: string
  /** What a glance at the bars shows, in a sentence, for screen readers: the largest, what stands out. */
  summary?: string
  /** What the bars' labels name, like "Tool": the first column of the chart's table for screen readers. */
  categoryLabel: string
  /** Writes a value for the axis, the readout and the table. Compact by default: `13400` as "13.4K". */
  formatValue?: (value: number) => string
  /** The labels' font: `mono` for names that are code, like a tool's. */
  labelFont?: (typeof BAR_CHART_LABEL_FONTS)[number]
  /** Shows a placeholder of rows while the data loads: one per bar in `data`, five when it has none. */
  loading?: boolean
  /** What screen readers hear while it loads. */
  loadingLabel?: string
  /** Its width, like `w-80`: it fills its box and redraws as the box resizes. Its height follows the rows. */
  className?: string
}

/**
 * How several things compare, one bar each, like the tool calls of a run by tool. Pointing at a row or walking the rows
 * with the arrow keys reads its bar, and screen readers get a summary and the data as a table. It fills its box's width
 * and grows a row per bar; when the data changes, the bars glide to their new lengths and places. Built on visx; idea
 * from Tremor's bar chart.
 *
 * @example
 * <BarChart
 *   label="Tool calls"
 *   categoryLabel="Tool"
 *   summary="23 calls, most of them fetch_url (10), reading the pricing pages and their archived versions."
 *   data={[{ label: 'fetch_url', value: 10 }, { label: 'web_search', value: 8 }]}
 *   labelFont="mono"
 * />
 */
export function BarChart({
  data,
  label,
  summary,
  categoryLabel,
  formatValue = formatCompact,
  labelFont = 'sans',
  loading = false,
  loadingLabel = BAR_CHART_LOADING_LABEL,
  className,
}: BarChartProps) {
  const styles = barChartStyles({ labelFont })
  const summaryId = useId()
  const loadingRows = data.length || BAR_CHART_LOADING_ROWS

  return (
    <figure
      aria-label={label}
      aria-describedby={summary ? summaryId : undefined}
      className={styles.root({ className })}
    >
      {loading ? (
        <Skeleton label={loadingLabel} className={styles.skeleton()}>
          {/* The rows never reorder, so their number is their identity. */}
          {Array.from({ length: loadingRows }, (_, row) => row).map((row) => {
            const shape = BAR_CHART_LOADING_SHAPES[row % BAR_CHART_LOADING_SHAPES.length]
            return (
              <div key={row} className={styles.skeletonRow()}>
                <div className={styles.skeletonLabel()}>
                  <Skeleton.Box className={styles.skeletonLabelBox({ className: shape?.label })} />
                </div>
                <div className={styles.skeletonPlot()}>
                  <Skeleton.Box className={styles.skeletonBar({ className: shape?.bar })} />
                </div>
              </div>
            )
          })}
        </Skeleton>
      ) : (
        data.length > 0 && (
          <>
            <BarChartPlot data={data} label={label} formatValue={formatValue} labelFont={labelFont} />
            <table className="sr-only">
              <caption>{label}</caption>
              <thead>
                <tr>
                  <th scope="col">{categoryLabel}</th>
                  <th scope="col">{label}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.label}>
                    <th scope="row">{item.label}</th>
                    <td>{formatValue(item.value)}</td>
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
