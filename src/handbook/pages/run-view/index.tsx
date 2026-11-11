'use client'

import { useRef, useState } from 'react'

import { type CommandMenuItem } from '@/components/command-menu'
import { ToastProvider, useToast } from '@/components/toast'
import { useCopy, useMediaQuery } from '@/lib/hooks'

import { RUN_VIEW_COPY, RUN_VIEW_LINK, RUN_VIEW_WIDE_QUERY } from './run-view.const'
import { runViewStyles } from './run-view.styles'
import { type RunViewPhase, type RunViewTab } from './run-view.types'
import { RunViewConversation } from './run-view-conversation'
import { RunViewHeader } from './run-view-header'
import { RunViewPanel } from './run-view-panel'
import { RunViewSidebar } from './run-view-sidebar'

const styles = runViewStyles()

/** Approvals waiting in the workspace while run #128's is one of them. */
const APPROVALS_WAITING = 3

export type RunViewPageProps = {
  /** The panel's tab as the page opens. */
  defaultTab?: RunViewTab
}

/**
 * Run #128 as Sofía sees it: her ask, the agent finishing its summary of five competitors' pricing, then waiting for her
 * to approve the email to the leadership team. Built only from Norte's components, so an app can rebuild it from the
 * package.
 */
export function RunViewPage(props: RunViewPageProps) {
  return (
    <ToastProvider>
      <RunViewWorkspace {...props} />
    </ToastProvider>
  )
}

/** The page inside its toasts' provider: the state its regions share, and what each action does. */
function RunViewWorkspace({ defaultTab = 'results' }: RunViewPageProps) {
  const toast = useToast()
  const [, copy] = useCopy()
  const wide = useMediaQuery(RUN_VIEW_WIDE_QUERY)
  const promptRef = useRef<HTMLTextAreaElement>(null)

  const [phase, setPhase] = useState<RunViewPhase>('writing')
  const [tab, setTab] = useState<RunViewTab>(defaultTab)
  const [shareOpen, setShareOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [keepLogs, setKeepLogs] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('balanced')

  // The sidebar opens with its names on wide windows and as icons on narrower ones. Toggling it holds until the window
  // crosses that width again.
  const [toggled, setToggled] = useState<{ wide: boolean; collapsed: boolean }>()
  const collapsed = toggled?.wide === wide ? toggled.collapsed : !wide

  const answered = phase === 'approved' || phase === 'rejected'

  function elsewhere() {
    toast.add({ title: RUN_VIEW_COPY.demo, type: 'info' })
  }

  async function copyLink() {
    if (await copy(RUN_VIEW_LINK)) toast.add({ title: RUN_VIEW_COPY.linkCopied, type: 'success' })
  }

  function approve() {
    setPhase('approved')
    toast.add({ title: RUN_VIEW_COPY.sent, description: RUN_VIEW_COPY.sentNote, type: 'success' })
  }

  function reject() {
    setPhase('rejected')
    toast.add({ title: RUN_VIEW_COPY.notSent, description: RUN_VIEW_COPY.notSentNote, type: 'info' })
  }

  /** Writes a prompt and focuses it, ready to send or to add to. */
  function draft(text: string) {
    setPrompt(text)
    promptRef.current?.focus({ preventScroll: true })
  }

  function command(item: CommandMenuItem) {
    if (item.value === 'share') setShareOpen(true)
    else if (item.value === 'copy-link') copyLink()
    else if (item.value === 'details') setTab('details')
    else if (item.value === 'delete') setDeleteOpen(true)
    else elsewhere()
  }

  return (
    <div className={styles.page()}>
      <RunViewSidebar
        approvals={APPROVALS_WAITING - (answered ? 1 : 0)}
        collapsed={collapsed}
        onCollapsedChange={(next) => setToggled({ wide, collapsed: next })}
        onElsewhere={elsewhere}
        className={styles.sidebar()}
      />
      <div className={styles.shell()}>
        <RunViewHeader
          phase={phase}
          shareOpen={shareOpen}
          onShareOpenChange={setShareOpen}
          deleteOpen={deleteOpen}
          onDeleteOpenChange={setDeleteOpen}
          onCopyLink={copyLink}
          onCommand={command}
          onElsewhere={elsewhere}
        />
        <RunViewConversation
          phase={phase}
          onWritten={() => setPhase('waiting')}
          onApprove={approve}
          onReject={reject}
          prompt={prompt}
          onPromptChange={setPrompt}
          promptRef={promptRef}
          model={model}
          onModelChange={setModel}
          onSuggest={draft}
        />
        <RunViewPanel
          phase={phase}
          tab={tab}
          onTabChange={setTab}
          keepLogs={keepLogs}
          onKeepLogsChange={setKeepLogs}
          model={model}
          onModelChange={setModel}
          onAsk={draft}
        />
      </div>
    </div>
  )
}
