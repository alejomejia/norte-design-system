'use client'

import { curveMonotoneX } from '@visx/curve'
import { scaleLinear } from '@visx/scale'
import { AreaClosed, LinePath } from '@visx/shape'
import { type FocusEvent, type KeyboardEvent, type PointerEvent, useId, useMemo, useRef, useState } from 'react'

import { fitTicks, nearestIndex, tickCount, toCSSVars } from '@/lib/utils'

import {
  LINE_CHART_AREA_OPACITY,
  LINE_CHART_LABEL_FIT,
  LINE_CHART_MARGIN,
  LINE_CHART_TICK_GAP,
  LINE_CHART_TICK_SPACING,
} from './line-chart.const'
import { useUpdateGlide } from './line-chart.hooks'
import { lineChartStyles } from './line-chart.styles'
import { type LineChartPoint } from './line-chart.types'
import { spanOf } from './line-chart.utils'

export type LineChartPlotProps = {
  /** The points in view, one at least. */
  data: LineChartPoint[]
  /** The point before them, when a window hides older ones: drawn past the left edge, so the line runs to it. */
  lead?: LineChartPoint
  /** The chart's measured box, in px. */
  width: number
  height: number
  label: string
  formatX: (x: number) => string
  formatY: (y: number) => string
  area: boolean
}

/**
 * The drawing: the grid and the axes' labels, the line and its fill, and the plot over them that the pointer and the
 * keyboard read, with the crosshair, dot and readout of the point they're on. Sized to the box the root measured.
 */
export function LineChartPlot({ data, lead, width, height, label, formatX, formatY, area }: LineChartPlotProps) {
  const styles = lineChartStyles()
  const id = useId()
  const plotRef = useRef<SVGSVGElement>(null)
  const plotWidth = Math.max(0, width - LINE_CHART_MARGIN.left - LINE_CHART_MARGIN.right)
  const plotHeight = Math.max(0, height - LINE_CHART_MARGIN.top - LINE_CHART_MARGIN.bottom)
  const drawn = useMemo(() => (lead ? [lead, ...data] : data), [lead, data])

  const xs = useMemo(() => data.map((point) => point.x), [data])
  const yCount = tickCount(plotHeight, LINE_CHART_TICK_SPACING.y)

  const xScale = useMemo(() => scaleLinear({ domain: spanOf(xs), range: [0, plotWidth] }), [xs, plotWidth])
  const yScale = useMemo(() => {
    // From zero at least, so a line's height reads as its size; one unit high when every value is the same.
    const ys = data.map((point) => point.y)
    const low = Math.min(0, ...ys)
    const high = Math.max(0, ...ys)
    return scaleLinear({ domain: [low, high === low ? low + 1 : high], range: [plotHeight, 0], nice: yCount })
  }, [data, plotHeight, yCount])

  const xTicks = useMemo(
    () => fitTicks(xScale, plotWidth, formatX, { spacing: LINE_CHART_TICK_SPACING.x, ...LINE_CHART_LABEL_FIT }),
    [xScale, plotWidth, formatX],
  )
  const yTicks = useMemo(() => yScale.ticks(yCount), [yScale, yCount])

  // What the plot shows, so the next update glides from it.
  const frame = useMemo(() => {
    const [x0 = 0, x1 = 1] = xScale.domain()
    const [y0 = 0, y1 = 1] = yScale.domain()
    return { x: [x0, x1], y: [y0, y1], width: plotWidth, height: plotHeight, xTicks, yTicks } as const
  }, [xScale, yScale, plotWidth, plotHeight, xTicks, yTicks])
  useUpdateGlide(plotRef, frame)

  // The point the pointer or the keyboard is on, kept while the readout fades out; `session` counts each time it shows,
  // so the readout mounts again in place (and fades in there) instead of gliding over from where it last was.
  const [active, setActive] = useState<number | null>(null)
  const [shown, setShown] = useState(false)
  const [session, setSession] = useState(0)
  const last = data.length - 1
  const current = active === null ? null : Math.min(active, last)

  function show(index: number) {
    setActive(index)
    if (!shown) {
      setShown(true)
      setSession((count) => count + 1)
    }
  }

  function hide() {
    setShown(false)
  }

  function pointAt(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    return nearestIndex(xs, xScale.invert(event.clientX - box.left))
  }

  function handlePointer(event: PointerEvent<HTMLDivElement>) {
    show(pointAt(event))
  }

  function handlePointerLeave(event: PointerEvent<HTMLDivElement>) {
    // A keyboard walk keeps its point when the pointer passes through.
    if (!event.currentTarget.matches(':focus-visible')) hide()
  }

  function handleFocus(event: FocusEvent<HTMLDivElement>) {
    // From the keyboard, the latest point shows at once; a click shows the one under the pointer instead.
    if (event.currentTarget.matches(':focus-visible')) show(current ?? last)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const from = current ?? last
    const to = {
      ArrowRight: Math.min(from + 1, last),
      ArrowUp: Math.min(from + 1, last),
      ArrowLeft: Math.max(from - 1, 0),
      ArrowDown: Math.max(from - 1, 0),
      Home: 0,
      End: last,
    }[event.key]
    if (to !== undefined) {
      event.preventDefault()
      show(to)
    } else if (event.key === 'Escape' && shown) {
      // Dismissed without moving focus (WCAG 1.4.13). Only when it's showing, so Escape still closes a dialog around it.
      event.stopPropagation()
      hide()
    }
  }

  // The slider's value is the latest point until one is chosen; the crosshair shows only once one is.
  const valuePoint = data[current ?? last]
  const point = current === null ? undefined : data[current]
  const left = point ? xScale(point.x) : 0
  const top = point ? yScale(point.y) : 0

  return (
    <>
      <svg aria-hidden="true" width={width} height={height} className={styles.svg()}>
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" x2="0" y1="0" y2="1" className={styles.gradient()}>
            <stop offset="0" stopColor="currentColor" stopOpacity={LINE_CHART_AREA_OPACITY.top} />
            <stop offset="1" stopColor="currentColor" stopOpacity={LINE_CHART_AREA_OPACITY.bottom} />
          </linearGradient>
          {/* A little past the plot, so the line's round caps at either end aren't cut. */}
          <clipPath id={`${id}-reveal`}>
            <rect x={-2} y={-2} width={plotWidth + 4} height={plotHeight + 4} className={styles.reveal()} />
          </clipPath>
        </defs>
        {/* The plot as a viewport of its own, so what glides inside it transforms from the plot's corner. */}
        <svg
          ref={plotRef}
          aria-hidden="true"
          x={LINE_CHART_MARGIN.left}
          y={LINE_CHART_MARGIN.top}
          width={plotWidth}
          height={plotHeight}
          className={styles.viewport()}
        >
          {yTicks.map((tick) => {
            // On the half pixel, so a 1px line covers one row of pixels instead of blurring across two.
            const y = Math.round(yScale(tick)) + 0.5
            return (
              <g key={tick} data-tick-y={tick}>
                <line x1={0} x2={plotWidth} y1={y} y2={y} className={styles.grid()} />
                <text
                  x={-LINE_CHART_TICK_GAP}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="central"
                  className={styles.tick()}
                >
                  {formatY(tick)}
                </text>
              </g>
            )
          })}
          {xTicks.map((tick) => (
            <text
              key={tick}
              data-tick-x={tick}
              x={xScale(tick)}
              y={plotHeight + LINE_CHART_TICK_GAP}
              textAnchor="middle"
              dominantBaseline="hanging"
              className={styles.tick()}
            >
              {formatX(tick)}
            </text>
          ))}
          <g clipPath={`url(#${id}-reveal)`}>
            <g data-glide="series">
              {area && (
                <AreaClosed
                  data={drawn}
                  x={(d) => xScale(d.x)}
                  y={(d) => yScale(d.y)}
                  yScale={yScale}
                  curve={curveMonotoneX}
                  fill={`url(#${id}-fill)`}
                  className={styles.area()}
                />
              )}
              {/* A stroke that keeps its 2px while the line stretches during a glide. */}
              <LinePath
                data={drawn}
                x={(d) => xScale(d.x)}
                y={(d) => yScale(d.y)}
                curve={curveMonotoneX}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                className={styles.line()}
              />
            </g>
          </g>
        </svg>
      </svg>
      {/* A slider over the points: screen readers say each one as the arrows reach it, with no live region. */}
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={last}
        aria-valuenow={current ?? last}
        aria-valuetext={valuePoint && `${formatX(valuePoint.x)}: ${formatY(valuePoint.y)}`}
        className={styles.plot()}
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={hide}
        onFocus={handleFocus}
        onBlur={hide}
        onKeyDown={handleKeyDown}
      >
        {point && (
          <div
            key={session}
            aria-hidden="true"
            data-hidden={!shown || undefined}
            className={styles.pointer()}
            style={toCSSVars({ x: Math.round(left), y: Math.round(top) })}
          >
            <div className={styles.crosshairGlide()}>
              <div className={styles.crosshair()} />
            </div>
            <div className={styles.dotGlide()}>
              <div className={styles.dot()} />
            </div>
            <div className={styles.tooltipGlide()}>
              <div data-side={left > plotWidth / 2 ? 'left' : 'right'} className={styles.tooltip()}>
                <span className={styles.tooltipLabel()}>{formatX(point.x)}</span>
                <span className={styles.tooltipValue()}>
                  <span className={styles.tooltipKey()} />
                  {formatY(point.y)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
