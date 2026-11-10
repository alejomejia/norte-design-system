'use client'

import { useId, useState } from 'react'

import { Accordion } from '@/components/accordion'
import { Badge } from '@/components/badge'
import { BarChart } from '@/components/bar-chart'
import { Button } from '@/components/button'
import { Citation } from '@/components/citation'
import { DataTable, type DataTableColumn } from '@/components/data-table'
import { EmptyState } from '@/components/empty-state'
import { LineChart } from '@/components/line-chart'
import { Popover } from '@/components/popover'
import { Select } from '@/components/select'
import { Stat } from '@/components/stat'
import { Switch } from '@/components/switch'
import { Tabs } from '@/components/tabs'
import { TextField } from '@/components/text-field'
import { Textarea } from '@/components/textarea'
import { formatCompact } from '@/lib/utils'

import {
  RUN_VIEW_CALLS,
  RUN_VIEW_CALLS_BY_TOOL,
  RUN_VIEW_CALLS_SUMMARY,
  RUN_VIEW_COMPETITORS,
  RUN_VIEW_COPY,
  RUN_VIEW_COST,
  RUN_VIEW_COST_TOTAL,
  RUN_VIEW_INSTRUCTIONS,
  RUN_VIEW_MODELS,
  RUN_VIEW_SOURCES,
  RUN_VIEW_TIMING,
  RUN_VIEW_TOKENS_PER_MINUTE,
  RUN_VIEW_TOKENS_SUMMARY,
} from './run-view.const'
import { useAfter } from './run-view.hooks'
import { runViewPanelStyles, runViewStyles } from './run-view.styles'
import { type RunViewPhase, type RunViewTab } from './run-view.types'

const page = runViewStyles()
const styles = runViewPanelStyles()

type Competitor = (typeof RUN_VIEW_COMPETITORS)[number]

/** The sources a citation can point to: the ones read, numbered in order. */
const CITED = RUN_VIEW_SOURCES.filter((source) => source.status !== 'failed')

/** How a competitor's seat price moved since last quarter, in dollars; `null` when it couldn't be read. */
function priceChange(row: Competitor) {
  return row.price === null ? null : row.price - row.previous
}

/** The change as a badge (the words say it, the tone repeats it), then the citation that backs it. */
function changeCell(row: Competitor) {
  const change = priceChange(row)
  const source = row.source ? CITED[row.source - 1] : undefined
  return (
    <span className={styles.change()}>
      {change === null ? (
        <Badge tone="danger">{RUN_VIEW_COPY.unreadable}</Badge>
      ) : change === 0 ? (
        <Badge>{RUN_VIEW_COPY.noChange}</Badge>
      ) : (
        <Badge tone="warning" dot>
          {RUN_VIEW_COPY.up(change)}
        </Badge>
      )}
      {row.source && source && <Citation index={row.source} {...source} />}
    </span>
  )
}

/** Results' columns: the competitor, its seat price and how it moved, with the source in the change's cell. */
const COLUMNS: DataTableColumn<Competitor>[] = [
  {
    id: 'competitor',
    header: RUN_VIEW_COPY.columns.competitor,
    cell: (row) => row.name,
    sortValue: (row) => row.name,
  },
  {
    id: 'price',
    header: RUN_VIEW_COPY.columns.price,
    cell: (row) => (row.price === null ? RUN_VIEW_COPY.unknown : `$${row.price}`),
    sortValue: (row) => row.price,
    align: 'end',
  },
  { id: 'change', header: RUN_VIEW_COPY.columns.change, cell: changeCell, sortValue: priceChange },
]

/** Minutes into the run, the way its timer says them: "30s", "2m 30s", "4m 12s". */
function elapsed(minutes: number) {
  const seconds = Math.round(minutes * 60)
  const whole = Math.floor(seconds / 60)
  const rest = seconds % 60
  if (!rest) return `${whole}m`
  return whole ? `${whole}m ${rest}s` : `${rest}s`
}

/** Tokens the way the run's stats say them: "38.2k". */
function tokens(value: number) {
  return formatCompact(value).toLowerCase()
}

export type RunViewPanelProps = {
  phase: RunViewPhase
  tab: RunViewTab
  onTabChange: (tab: RunViewTab) => void
  keepLogs: boolean
  onKeepLogsChange: (keepLogs: boolean) => void
  model: string
  onModelChange: (model: string) => void
  /** Writes a prompt about the selected competitors, and focuses the prompt. */
  onAsk: (prompt: string) => void
}

/**
 * The run's panel, in three tabs. Results: the competitors' prices (skeletons while they load), to sort and select, and
 * ask about the selected. Details: the run's stats (the cost's breakdown in a popover), its tokens a minute, its tool
 * calls by tool, and the agent's settings. Logs: empty, since logging was off; turning it on there or in the settings is
 * the same switch.
 */
export function RunViewPanel({
  phase,
  tab,
  onTabChange,
  keepLogs,
  onKeepLogsChange,
  model,
  onModelChange,
  onAsk,
}: RunViewPanelProps) {
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const ids = { stats: useId(), tokens: useId(), calls: useId(), settings: useId() }
  useAfter(loading, RUN_VIEW_TIMING.results, () => setLoading(false))

  // The email is a tool call too: once it's sent, the run has made one more.
  const sent = phase === 'approved'
  const calls = RUN_VIEW_CALLS + (sent ? 1 : 0)
  const callsByTool = RUN_VIEW_CALLS_BY_TOOL.map((item) =>
    item.label === 'send_email' && sent ? { ...item, value: 1 } : item,
  )

  function askAboutSelected() {
    const names = RUN_VIEW_COMPETITORS.filter((row) => selected.includes(row.id)).map((row) => row.name)
    onAsk(RUN_VIEW_COPY.askAboutPrompt(names))
  }

  return (
    <aside aria-label={RUN_VIEW_COPY.panel} className={page.panel()}>
      <Tabs value={tab} onValueChange={(value) => onTabChange(value as RunViewTab)} className={styles.tabs()}>
        <div className={styles.bar()}>
          <Tabs.List aria-label={RUN_VIEW_COPY.panel}>
            <Tabs.Tab value="results" count={RUN_VIEW_COMPETITORS.length}>
              {RUN_VIEW_COPY.tabs.results}
            </Tabs.Tab>
            <Tabs.Tab value="details">{RUN_VIEW_COPY.tabs.details}</Tabs.Tab>
            <Tabs.Tab value="logs">{RUN_VIEW_COPY.tabs.logs}</Tabs.Tab>
          </Tabs.List>
        </div>

        <Tabs.Panel value="results" className={styles.tabPanel()}>
          <div className={styles.section()}>
            <DataTable
              caption={RUN_VIEW_COPY.resultsCaption}
              showCaption
              columns={COLUMNS}
              rows={RUN_VIEW_COMPETITORS}
              getRowId={(row) => row.id}
              selectable
              selectedRows={selected}
              onSelectedRowsChange={setSelected}
              loading={loading}
              loadingRows={RUN_VIEW_COMPETITORS.length}
              className={styles.table()}
            />
            {selected.length > 0 ? (
              <div className={styles.selection()}>
                <span>{RUN_VIEW_COPY.selected(selected.length)}</span>
                <Button variant="secondary" size="s" onClick={askAboutSelected}>
                  {RUN_VIEW_COPY.askAbout}
                </Button>
              </div>
            ) : (
              <p className={styles.note()}>{RUN_VIEW_COPY.resultsNote}</p>
            )}
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="details" className={styles.tabPanel()}>
          <section aria-labelledby={ids.stats} className={styles.section()}>
            <h2 id={ids.stats} className={styles.heading()}>
              {RUN_VIEW_COPY.statsTitle}
            </h2>
            <Stat.Group columns={2} variant="muted">
              <Stat
                label={RUN_VIEW_COPY.stats.duration}
                value="4m 12s"
                trend="up"
                change="38s"
                better="down"
                comparison={RUN_VIEW_COPY.versus}
              />
              <Stat
                label={RUN_VIEW_COPY.stats.tokens}
                value={RUN_VIEW_COST_TOTAL.tokens}
                trend="down"
                change="8%"
                better="down"
                comparison={RUN_VIEW_COPY.versus}
              />
              <Stat
                label={RUN_VIEW_COPY.stats.cost}
                value={RUN_VIEW_COST_TOTAL.cost}
                trend="down"
                change="$0.06"
                better="down"
                comparison={RUN_VIEW_COPY.versus}
                helpLabel={RUN_VIEW_COPY.costTitle}
                help={
                  <>
                    <Popover.Header>
                      <Popover.Title>{RUN_VIEW_COPY.costTitle}</Popover.Title>
                      <Popover.Description>{RUN_VIEW_COPY.costLead}</Popover.Description>
                    </Popover.Header>
                    <dl className={styles.cost()}>
                      {RUN_VIEW_COST.map((row) => (
                        <div key={row.step} className={styles.costRow()}>
                          <dt className={styles.costStep()}>{row.step}</dt>
                          <dd>{row.tokens}</dd>
                          <dd>{row.cost}</dd>
                        </div>
                      ))}
                      <dt className={styles.costStep({ className: styles.costTotal() })}>{RUN_VIEW_COPY.costTotal}</dt>
                      <dd className={styles.costTotal()}>{RUN_VIEW_COST_TOTAL.tokens}</dd>
                      <dd className={styles.costTotal()}>{RUN_VIEW_COST_TOTAL.cost}</dd>
                    </dl>
                  </>
                }
              />
              <Stat
                label={RUN_VIEW_COPY.stats.calls}
                value={calls}
                trend={sent ? 'up' : 'flat'}
                change={sent ? '1' : undefined}
                better="none"
                comparison={RUN_VIEW_COPY.versus}
              />
            </Stat.Group>
          </section>

          <section aria-labelledby={ids.tokens} className={styles.section()}>
            <h2 id={ids.tokens} className={styles.heading()}>
              {RUN_VIEW_COPY.tokensTitle}
            </h2>
            <LineChart
              data={RUN_VIEW_TOKENS_PER_MINUTE}
              label={RUN_VIEW_COPY.tokensTitle}
              summary={RUN_VIEW_TOKENS_SUMMARY}
              xLabel={RUN_VIEW_COPY.elapsed}
              formatX={elapsed}
              formatY={tokens}
              area
              className={styles.chart()}
            />
          </section>

          <section aria-labelledby={ids.calls} className={styles.section()}>
            <h2 id={ids.calls} className={styles.heading()}>
              {RUN_VIEW_COPY.callsTitle}
            </h2>
            <BarChart
              data={callsByTool}
              label={RUN_VIEW_COPY.stats.calls}
              summary={RUN_VIEW_CALLS_SUMMARY}
              categoryLabel={RUN_VIEW_COPY.tool}
              labelFont="mono"
            />
          </section>

          <section aria-labelledby={ids.settings} className={styles.section()}>
            <div>
              <h2 id={ids.settings} className={styles.heading()}>
                {RUN_VIEW_COPY.settingsTitle}
              </h2>
              <p className={styles.lead()}>{RUN_VIEW_COPY.settingsLead}</p>
            </div>
            <Accordion variant="outline" headingLevel={3}>
              <Accordion.Item value="instructions">
                <Accordion.Trigger description={RUN_VIEW_COPY.settings.instructionsHint}>
                  {RUN_VIEW_COPY.settings.instructions}
                </Accordion.Trigger>
                <Accordion.Panel>
                  <Textarea
                    label={RUN_VIEW_COPY.instructionsLabel}
                    description={RUN_VIEW_COPY.instructionsDescription}
                    defaultValue={RUN_VIEW_INSTRUCTIONS}
                    maxLength={2000}
                    showCount
                  />
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="model">
                <Accordion.Trigger description={RUN_VIEW_COPY.settings.modelHint}>
                  {RUN_VIEW_COPY.settings.model}
                </Accordion.Trigger>
                <Accordion.Panel className={styles.fields()}>
                  <Select
                    label={RUN_VIEW_COPY.modelLabel}
                    items={RUN_VIEW_MODELS}
                    value={model}
                    onValueChange={(value) => value && onModelChange(value)}
                  />
                  <TextField
                    label={RUN_VIEW_COPY.limitLabel}
                    description={RUN_VIEW_COPY.limitDescription}
                    defaultValue="5.00"
                    inputMode="decimal"
                  />
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="permissions">
                <Accordion.Trigger description={RUN_VIEW_COPY.settings.permissionsHint}>
                  {RUN_VIEW_COPY.settings.permissions}
                </Accordion.Trigger>
                <Accordion.Panel className={styles.fields()}>
                  <Switch defaultChecked>{RUN_VIEW_COPY.askBeforeEmail}</Switch>
                  <Switch defaultChecked>{RUN_VIEW_COPY.browse}</Switch>
                  <Switch checked={keepLogs} onCheckedChange={onKeepLogsChange}>
                    {RUN_VIEW_COPY.keepLogs}
                  </Switch>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </section>
        </Tabs.Panel>

        <Tabs.Panel value="logs" className={styles.tabPanel()}>
          <EmptyState
            variant="dashed"
            size="s"
            icon={keepLogs ? 'history' : 'terminal'}
            titleRender={(props) => <h2 {...props} />}
            title={keepLogs ? RUN_VIEW_COPY.logsOnTitle : RUN_VIEW_COPY.logsOffTitle}
            description={keepLogs ? RUN_VIEW_COPY.logsOnBody : RUN_VIEW_COPY.logsOffBody}
            actions={
              <Button variant={keepLogs ? 'ghost' : 'secondary'} size="s" onClick={() => onKeepLogsChange(!keepLogs)}>
                {keepLogs ? RUN_VIEW_COPY.turnOffLogs : RUN_VIEW_COPY.turnOnLogs}
              </Button>
            }
          />
        </Tabs.Panel>
      </Tabs>
    </aside>
  )
}
