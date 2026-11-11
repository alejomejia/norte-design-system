'use client'

import { type MouseEvent, useState } from 'react'

import { Badge } from '@/components/badge'
import { Breadcrumb } from '@/components/breadcrumb'
import { Button } from '@/components/button'
import { CommandMenu, type CommandMenuItem } from '@/components/command-menu'
import { AlertDialog } from '@/components/dialog'
import { IconButton } from '@/components/icon-button'
import { Menu } from '@/components/menu'
import { useToast } from '@/components/toast'
import { Tooltip } from '@/components/tooltip'
import { useMediaQuery } from '@/lib/hooks'

import {
  RUN_VIEW_COMMANDS,
  RUN_VIEW_COPY,
  RUN_VIEW_NARROW_QUERY,
  RUN_VIEW_RECENT,
  RUN_VIEW_TIMING,
} from './run-view.const'
import { useAfter } from './run-view.hooks'
import { runViewHeaderStyles } from './run-view.styles'
import { type RunViewPhase } from './run-view.types'
import { RunViewShare } from './run-view-share'

const styles = runViewHeaderStyles()

/** The state badge's tone, by phase: it waits in amber, like the run's bar. */
const BADGE_TONES = { writing: 'neutral', waiting: 'warning', approved: 'success', rejected: 'neutral' } as const

export type RunViewHeaderProps = {
  phase: RunViewPhase
  shareOpen: boolean
  onShareOpenChange: (open: boolean) => void
  deleteOpen: boolean
  onDeleteOpenChange: (open: boolean) => void
  onCopyLink: () => void
  /** A command chosen in the command menu. */
  onCommand: (item: CommandMenuItem) => void
  /** Anywhere else in the workspace: the demo has only this page. */
  onElsewhere: () => void
}

/**
 * The page's header: the breadcrumb and the run's state, then Share, the run's menu (whose Delete asks first) and the
 * command menu, ⌘K from anywhere on the page.
 */
export function RunViewHeader({
  phase,
  shareOpen,
  onShareOpenChange,
  deleteOpen,
  onDeleteOpenChange,
  onCopyLink,
  onCommand,
  onElsewhere,
}: RunViewHeaderProps) {
  const toast = useToast()
  const narrow = useMediaQuery(RUN_VIEW_NARROW_QUERY)
  const [deleting, setDeleting] = useState(false)
  const { path } = RUN_VIEW_COPY

  useAfter(deleting, RUN_VIEW_TIMING.delete, () => {
    setDeleting(false)
    onDeleteOpenChange(false)
    toast.add({ title: RUN_VIEW_COPY.deleted, description: RUN_VIEW_COPY.deletedNote, type: 'success' })
  })

  function goElsewhere(event: MouseEvent) {
    event.preventDefault()
    onElsewhere()
  }

  return (
    <header className={styles.root()}>
      <h1 className={styles.title()}>{RUN_VIEW_COPY.title}</h1>
      <div className={styles.where()}>
        <Breadcrumb truncate="ancestors" maxItems={narrow ? 2 : undefined} itemsAfter={narrow ? 1 : undefined}>
          <Breadcrumb.Item href="#agents" onClick={goElsewhere}>
            {path.agents}
          </Breadcrumb.Item>
          <Breadcrumb.Item href="#research-agent" onClick={goElsewhere}>
            {path.agent}
          </Breadcrumb.Item>
          <Breadcrumb.Item>{path.run}</Breadcrumb.Item>
        </Breadcrumb>
        <Badge tone={BADGE_TONES[phase]} dot live={phase === 'waiting'} className={styles.badge()}>
          {RUN_VIEW_COPY.badge[phase]}
        </Badge>
      </div>
      <div className={styles.actions()}>
        <RunViewShare open={shareOpen} onOpenChange={onShareOpenChange} onCopyLink={onCopyLink} />
        <Menu>
          <Tooltip content={RUN_VIEW_COPY.runActions}>
            <Menu.Trigger render={<IconButton icon="more" label={RUN_VIEW_COPY.runActions} size="s" />} />
          </Tooltip>
          <Menu.Popup align="end">
            <Menu.Item icon="share" onClick={() => onShareOpenChange(true)}>
              {RUN_VIEW_COPY.shareRun}
            </Menu.Item>
            <Menu.Item icon="link" onClick={onCopyLink}>
              {RUN_VIEW_COPY.copyLink}
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item icon="delete" tone="danger" onClick={() => onDeleteOpenChange(true)}>
              {RUN_VIEW_COPY.deleteRun}
            </Menu.Item>
          </Menu.Popup>
        </Menu>
        <CommandMenu groups={RUN_VIEW_COMMANDS} recent={RUN_VIEW_RECENT} onSelect={onCommand}>
          <CommandMenu.Trigger className={styles.search()} />
          <Tooltip content={RUN_VIEW_COPY.search}>
            <CommandMenu.Trigger
              render={
                <IconButton icon="search" label={RUN_VIEW_COPY.search} size="s" className={styles.searchIcon()} />
              }
            />
          </Tooltip>
        </CommandMenu>
      </div>
      <AlertDialog open={deleteOpen} onOpenChange={(open) => !deleting && onDeleteOpenChange(open)}>
        <AlertDialog.Popup>
          <AlertDialog.Header>
            <AlertDialog.Title>{RUN_VIEW_COPY.deleteTitle}</AlertDialog.Title>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <AlertDialog.Description>{RUN_VIEW_COPY.deleteLead}</AlertDialog.Description>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <AlertDialog.Close render={<Button variant="secondary">{RUN_VIEW_COPY.cancel}</Button>} />
            <Button variant="danger" loading={deleting} onClick={() => setDeleting(true)}>
              {RUN_VIEW_COPY.deleteRun}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Popup>
      </AlertDialog>
    </header>
  )
}
