'use client'

import { scaleLinear } from '@visx/scale'
import { type FocusEvent, type KeyboardEvent, type PointerEvent, useId, useMemo, useRef, useState } from 'react'

import { useElementSize } from '@/lib/hooks'
import { fitTicks, tickCount, toCSSVars } from '@/lib/utils'

import {
  BAR_CHART_LABEL_FIT,
  type BAR_CHART_LABEL_FONTS,
  BAR_CHART_RADIUS,
  BAR_CHART_ROW,
  BAR_CHART_TICK_GAP,
  BAR_CHART_TICK_SPACING,
  BAR_CHART_TOOLTIP_GAP,
} from './bar-chart.const'
import { useResized } from './bar-chart.hooks'
import { barChartStyles } from './bar-chart.styles'
import { type BarChartItem } from './bar-chart.types'

export type BarChartPlotProps = {
  /** The bars, one at least, in the order they're drawn from the top. */
  data: BarChartItem[]
  label: string
  formatValue: (value: number) => string
  labelFont: (typeof BAR_CHART_LABEL_FONTS)[number]
}

/**
 * The drawing: the rows the pointer and the keyboard read, each a label and a bar, over the grid and the value axis's
 * labels, with the readout of the row they're on. The plot measures its own width, what's left beside the labels.
 */
export function BarChartPlot({ data, label, formatValue, labelFont }: BarChartPlotProps) {
  const styles = barChartStyles({ labelFont })
  const id = useId()
  const rowsRef = useRef<HTMLDivElement>(null)
  const plotRef = useRef<HTMLDivElement>(null)
  const { width } = useElementSize(plotRef)
  const { width: rowsWidth } = useElementSize(rowsRef)
  const resizing = useResized(width)
  const height = data.length * BAR_CHART_ROW.height
  // Every bar is this long, moved left of the baseline by what it lacks: its round start stays hidden behind it.
  const barLength = width + BAR_CHART_RADIUS

  const count = tickCount(width, BAR_CHART_TICK_SPACING)
  const scale = useMemo(() => {
    // From zero, so a bar's length reads as its size; one unit long when every value is zero.
    const high = Math.max(0, ...data.map((item) => item.value))
    return scaleLinear({ domain: [0, high || 1], range: [0, width], nice: count })
  }, [data, width, count])
  const ticks = useMemo(() => {
    const fitted = fitTicks(scale, width, formatValue, { spacing: BAR_CHART_TICK_SPACING, ...BAR_CHART_LABEL_FIT })
    // Counts get whole ticks: no "2.5 calls" between 2 and 3.
    return data.every((item) => Number.isInteger(item.value)) ? fitted.filter(Number.isInteger) : fitted
  }, [scale, width, formatValue, data])

  // The row the pointer or the keyboard is on, kept while the readout fades out; `session` counts each time it shows,
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

  function handlePointer(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    const row = Math.floor((event.clientY - box.top) / BAR_CHART_ROW.height)
    show(Math.min(Math.max(row, 0), last))
  }

  function handlePointerLeave(event: PointerEvent<HTMLDivElement>) {
    // A keyboard walk keeps its row when the pointer passes through.
    if (!event.currentTarget.matches(':focus-visible')) hide()
  }

  function handleFocus(event: FocusEvent<HTMLDivElement>) {
    // From the keyboard, the first bar shows at once; a click shows the one under the pointer instead.
    if (event.currentTarget.matches(':focus-visible')) show(current ?? 0)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const from = current ?? 0
    const to = {
      ArrowDown: Math.min(from + 1, last),
      ArrowRight: Math.min(from + 1, last),
      ArrowUp: Math.max(from - 1, 0),
      ArrowLeft: Math.max(from - 1, 0),
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

  // The slider's value is the first bar until one is chosen; the readout shows only once one is.
  const valueItem = data[current ?? 0]
  const item = current === null ? undefined : data[current]
  // On a whole pixel, like the sizes it's measured against.
  const end = item ? Math.round(scale(item.value)) : 0
  // The readout opens on the side of the bar's end with more room, over the labels too, and wraps to fit it there, so a
  // long label never spills out of the chart. A pixel short, as the measured widths are rounded.
  const roomLeft = rowsWidth - width + end - BAR_CHART_TOOLTIP_GAP - 1
  const roomRight = width - end - BAR_CHART_TOOLTIP_GAP - 1
  const side = roomLeft > roomRight ? 'left' : 'right'

  return (
    // A slider over the rows: screen readers say each bar as the arrows reach it, with no live region.
    <div
      ref={rowsRef}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={last}
      aria-valuenow={current ?? 0}
      aria-valuetext={valueItem && `${valueItem.label}: ${formatValue(valueItem.value)}`}
      className={styles.rows()}
      style={toCSSVars({ height })}
      onPointerDown={handlePointer}
      onPointerMove={handlePointer}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={hide}
      onFocus={handleFocus}
      onBlur={hide}
      onKeyDown={handleKeyDown}
    >
      <div aria-hidden="true" className={styles.labels()}>
        {data.map((bar, index) => (
          <div key={bar.label} className={styles.label()} style={toCSSVars({ y: index * BAR_CHART_ROW.height })}>
            <span data-active={(shown && index === current) || undefined} className={styles.labelText()}>
              {bar.label}
            </span>
          </div>
        ))}
      </div>
      <div ref={plotRef} aria-hidden="true" className={styles.plot()}>
        {width > 0 && (
          <>
            <svg
              aria-hidden="true"
              width={width}
              height={height}
              data-resizing={resizing || undefined}
              className={styles.svg()}
            >
              <defs>
                {/* The baseline: what's left of it is hidden, the bars' round starts with it. */}
                <clipPath id={`${id}-baseline`}>
                  <rect x={0} y={0} width={barLength} height={height} />
                </clipPath>
              </defs>
              {ticks.map((tick) => (
                // On the half pixel, so a 1px line covers one column of pixels instead of blurring across two.
                <g key={tick} className={styles.tick()} style={toCSSVars({ x: Math.round(scale(tick)) + 0.5 })}>
                  <line x1={0} x2={0} y1={0} y2={height} className={styles.grid()} />
                  <text
                    x={0}
                    y={height + BAR_CHART_TICK_GAP}
                    textAnchor="middle"
                    dominantBaseline="hanging"
                    className={styles.tickLabel()}
                  >
                    {formatValue(tick)}
                  </text>
                </g>
              ))}
              <g clipPath={`url(#${id}-baseline)`}>
                {data.map((bar, index) => (
                  <g
                    key={bar.label}
                    className={styles.row()}
                    style={toCSSVars({
                      y: index * BAR_CHART_ROW.height + (BAR_CHART_ROW.height - BAR_CHART_ROW.bar) / 2,
                    })}
                  >
                    <g
                      data-dimmed={(shown && current !== null && index !== current) || undefined}
                      className={styles.dim()}
                    >
                      <g className={styles.reveal()}>
                        <rect
                          x={0}
                          y={0}
                          width={barLength}
                          height={BAR_CHART_ROW.bar}
                          rx={BAR_CHART_RADIUS}
                          className={styles.bar()}
                          style={toCSSVars({ x: scale(bar.value) - barLength })}
                        />
                      </g>
                    </g>
                  </g>
                ))}
              </g>
            </svg>
            {item && (
              <div
                key={session}
                data-hidden={!shown || undefined}
                className={styles.pointer()}
                style={toCSSVars({
                  x: end,
                  y: (current ?? 0) * BAR_CHART_ROW.height + BAR_CHART_ROW.height / 2,
                  room: Math.max(roomLeft, roomRight),
                })}
              >
                <div className={styles.tooltipGlide()}>
                  <div data-side={side} className={styles.tooltip()}>
                    <span className={styles.tooltipLabel()}>{item.label}</span>
                    <span className={styles.tooltipValue()}>
                      <span className={styles.tooltipKey()} />
                      {formatValue(item.value)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
