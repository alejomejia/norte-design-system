'use client'

import { type MouseEvent } from 'react'

import { Avatar } from '@/components/avatar'
import { Logo } from '@/components/logo'
import { Menu } from '@/components/menu'
import { Sidebar } from '@/components/sidebar'
import sofiaPhoto from '@/handbook/assets/people/sofia-herrera.jpg'

import { RUN_VIEW_COPY, RUN_VIEW_ME } from './run-view.const'

export type RunViewSidebarProps = {
  /** Approvals still waiting in the workspace, run #128's among them until Sofía answers it. */
  approvals: number
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  /** Anywhere else in the workspace: the demo has only this page. */
  onElsewhere: () => void
  className?: string
}

/** The workspace's sidebar: the switcher, its pages with Runs open, and Sofía's menu. */
export function RunViewSidebar({
  approvals,
  collapsed,
  onCollapsedChange,
  onElsewhere,
  className,
}: RunViewSidebarProps) {
  const { nav, workspaceMenu, accountMenu } = RUN_VIEW_COPY

  // The pages are links, so they keep a link's behavior (a new tab, the address); here they only say it's a demo.
  function goElsewhere(event: MouseEvent) {
    event.preventDefault()
    onElsewhere()
  }

  return (
    <Sidebar collapsed={collapsed} onCollapsedChange={onCollapsedChange} className={className}>
      <Sidebar.Header>
        <Menu>
          <Menu.Trigger
            render={
              <Sidebar.Button
                media={<Logo variant="tile" tone="inverse" size="s" className="ring-1 ring-line ring-inset" />}
                trailingIcon="chevron-down"
              >
                {RUN_VIEW_COPY.workspace}
              </Sidebar.Button>
            }
          />
          <Menu.Popup>
            <Menu.Item icon="settings" onClick={onElsewhere}>
              {workspaceMenu.settings}
            </Menu.Item>
            <Menu.Item icon="team" onClick={onElsewhere}>
              {workspaceMenu.invite}
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item icon="plus" onClick={onElsewhere}>
              {workspaceMenu.create}
            </Menu.Item>
          </Menu.Popup>
        </Menu>
      </Sidebar.Header>
      <Sidebar.Nav>
        <Sidebar.Section>
          <Sidebar.Item icon="home" href="#home" onClick={goElsewhere}>
            {nav.home}
          </Sidebar.Item>
          <Sidebar.Item icon="agent" href="#agents" onClick={goElsewhere}>
            {nav.agents}
          </Sidebar.Item>
          <Sidebar.Item icon="run" href="#runs" current>
            {nav.runs}
          </Sidebar.Item>
          <Sidebar.Item
            icon="permission"
            href="#approvals"
            onClick={goElsewhere}
            count={approvals}
            countLabel={nav.approvalsWaiting(approvals)}
            countTone="accent"
          >
            {nav.approvals}
          </Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Section label={nav.team}>
          <Sidebar.Item icon="ai" href="#research-agent" onClick={goElsewhere}>
            {nav.agent}
          </Sidebar.Item>
          <Sidebar.Item icon="folder" href="#briefs" onClick={goElsewhere}>
            {nav.briefs}
          </Sidebar.Item>
          <Sidebar.Item icon="file" href="#reports" onClick={goElsewhere} count={12}>
            {nav.reports}
          </Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Section>
          <Sidebar.Item icon="settings" href="#settings" onClick={goElsewhere}>
            {nav.settings}
          </Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Nav>
      <Sidebar.Footer>
        <Menu>
          <Menu.Trigger
            render={
              <Sidebar.Button media={<Avatar name={RUN_VIEW_ME.name} src={sofiaPhoto} size="s" />}>
                {RUN_VIEW_ME.name}
              </Sidebar.Button>
            }
          />
          <Menu.Popup side="top">
            <Menu.Item icon="user" onClick={onElsewhere}>
              {accountMenu.profile}
            </Menu.Item>
            <Menu.Item icon="settings" onClick={onElsewhere}>
              {accountMenu.preferences}
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item icon="arrow-right" onClick={onElsewhere}>
              {accountMenu.signOut}
            </Menu.Item>
          </Menu.Popup>
        </Menu>
        <Sidebar.Toggle />
      </Sidebar.Footer>
    </Sidebar>
  )
}
