import { createElement } from 'react'
import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'

// Storybook bundles the manager with its own esbuild, which doesn't know the `@/` alias.
import { STATUSES, statusOf } from '../src/handbook/statuses'
import { watchCodeBlocks } from './code-blocks'
import { watchCopy } from './manager-copy'
import { watchEmptyStates } from './manager-empty-states'
import { watchSidebarGroups } from './manager-groups'
import { watchSearchResults } from './manager-search'
import { watchRangeLabels } from './range-controls'
import { THEME_VARS } from './theme'
import { limitTooltips } from './tooltips'

import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './manager-styles/index.css'

/**
 * Norte's mark, a needle pointing north, next to the wordmark. The needle is split down its middle: the left half a step
 * darker, as if lit from the right. Storybook renders `brandTitle` as HTML.
 */
const BRAND = `<span class="nt-brand"><svg viewBox="0 0 16 16" aria-hidden="true"><path class="nt-brand-shade" d="M8 1.5v9.25L2.5 14Z" /><path d="M8 1.5 13.5 14 8 10.75Z" /></svg>Norte</span>`

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
watchEmptyStates()
watchSearchResults()
watchSidebarGroups()
watchRangeLabels()
limitTooltips()
