import { type ReactNode } from 'react'
import { type Status } from '@/handbook/statuses'

import { StatusBadge } from './status-badge'

/** The released version (`package.json`, injected by `.storybook/main.ts`), or "Unreleased" before the first release. */
const VERSION = __PACKAGE_VERSION__ === '0.0.0' ? 'Unreleased' : `Version ${__PACKAGE_VERSION__}`

type PageHeaderProps = {
  /** Where the page sits: `Foundations`, or `Elements · Actions`. */
  section: string
  title: string
  status?: Status
  /** Replaces the dark background with an image or an animation, like the Introduction's cover. */
  cover?: ReactNode
  /** The lead paragraph under the card. */
  children?: ReactNode
}

/**
 * Every handbook and component page opens with this: a dark card with where the page sits, the package version, the
 * status and the title, then a lead paragraph.
 */
export function PageHeader({ section, title, status, cover, children }: PageHeaderProps) {
  return (
    <header className="sb-unstyled relative mb-12">
      {/* The first item of "On this page", the page's title: read by its list, hidden from everyone else. Storybook
       * scrolls a heading to 40px below the top, so it sits above the header and its link goes back to the very top. */}
      {/* biome-ignore lint/a11y/useHeadingContent: hidden on purpose, screen readers get the title from the `h1` below */}
      <h2 id="top" aria-hidden="true" className="sr-only -top-16">
        {title}
      </h2>
      <div className="relative isolate flex min-h-72 flex-col justify-between overflow-hidden rounded-xl bg-neutral-950 p-8 text-white">
        {cover ?? <GridGlow />}
        <div className="flex items-baseline justify-between gap-4 text-body-s">
          <span className="font-medium">{section}</span>
          <span className="text-white/60">{VERSION}</span>
        </div>
        <div className="flex flex-col items-start gap-3">
          {status && <StatusBadge status={status} />}
          <h1 className="text-display font-semibold text-white">{title}</h1>
        </div>
      </div>
      {children && <div className="mt-8 max-w-2xl text-heading-s text-ink-muted">{children}</div>}
    </header>
  )
}

/** The default background: a faint grid that fades in toward one corner, under a blue glow. */
function GridGlow() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_100%_100%,oklch(0.546_0.245_262/35%),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(1_0_0/6%)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/6%)_1px,transparent_1px)] [mask-image:radial-gradient(70%_100%_at_100%_100%,black,transparent)] bg-size-[2rem_2rem]" />
    </div>
  )
}
