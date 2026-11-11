import { createElement } from 'react'
import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'

// Storybook bundles the manager with its own esbuild, which doesn't know the `@/` alias.
import { LOGO_NEEDLE, LOGO_WORDMARK } from '../src/components/logo/logo.const'
import { STATUSES, statusOf } from '../src/handbook/statuses'
import { watchPageViews } from './analytics'
import { watchCodeBlocks } from './code-blocks'
import { watchCopy } from './manager-copy'
import { watchEmptyStates } from './manager-empty-states'
import { watchSidebarGroups } from './manager-groups'
import { watchSearchResults } from './manager-search'
import { watchSidebarSections } from './manager-sections'
import { watchSourceLink } from './manager-source-link'
import { watchRangeLabels } from './range-controls'
import { THEME_VARS } from './theme'
import { limitTooltips } from './tooltips'

import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './manager-styles/index.css'

/**
 * Norte's logo, the needle and the outlined wordmark, drawn from Logo's own paths so the two never drift apart.
 * Storybook renders `brandTitle` as HTML, so it's a string rather than the component.
 */
const BRAND = `<span class="nt-brand"><svg class="nt-brand-mark" viewBox="${LOGO_NEEDLE.viewBox}" aria-hidden="true"><path class="nt-brand-shade" d="${LOGO_NEEDLE.shade}" /><path d="${LOGO_NEEDLE.light}" /></svg><svg class="nt-brand-wordmark" viewBox="${LOGO_WORDMARK.viewBox}" role="img" aria-label="Norte"><path d="${LOGO_WORDMARK.path}" /></svg></span>`

addons.setConfig({
  theme: create({ ...THEME_VARS, brandTitle: BRAND, brandUrl: './', brandTarget: '_self' }),
  layoutCustomisations: {
    // The toolbar (zoom, viewport, measure…) only acts on a story's canvas: docs pages go without it.
    showToolbar: (state, defaultValue) => (state.viewMode === 'docs' ? false : defaultValue),
  },
  sidebar: {
    // Each label carries its nesting level (1 for the items right under a section): Storybook sets the indent inline
    // and exposes the level nowhere else, and `manager-styles/sidebar-tree.css` needs it to draw the nesting. A
    // component's label also gets its status badge: Storybook gives a component the tags all its stories share.
    renderLabel(item) {
      const status = item.type === 'component' ? statusOf(item.tags) : undefined
      return createElement(
        'span',
        { 'data-level': item.depth },
        item.name,
        status && createElement('span', { className: 'nt-status', 'data-status': status }, STATUSES[status]),
      )
    },
  },
})

watchCopy()
// The Code panel under a story.
watchCodeBlocks('#storybook-panel-root')
// The addon panel's empty states, and the Interactions tab's button that runs a story's play (`manual-play.ts`).
addons.register('norte/empty-states', (api) => watchEmptyStates(api))
watchSearchResults()
watchSidebarGroups()
watchSidebarSections()
watchSourceLink()
watchRangeLabels()
limitTooltips()
// What the published Storybook sends to Umami: one page view per story.
watchPageViews()
