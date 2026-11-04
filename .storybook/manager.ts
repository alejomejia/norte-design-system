import { createElement } from 'react'
import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'

// Storybook bundles the manager with its own esbuild, which doesn't know the `@/` alias.
import { STATUSES, statusOf } from '../src/handbook/statuses'
import { THEME_VARS } from './theme'

import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './manager.css'

/** Norte's mark, a needle pointing north, next to the wordmark. Storybook renders `brandTitle` as HTML. */
const BRAND = `<span class="nt-brand"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5 13.5 14 8 10.75 2.5 14Z" /></svg>Norte</span>`

addons.setConfig({
  theme: create({ ...THEME_VARS, brandTitle: BRAND, brandUrl: './', brandTarget: '_self' }),
  sidebar: {
    // Components show their status next to their name: Ready, Beta, Planned or Deprecated.
    renderLabel(item) {
      const status = item.type === 'component' ? statusOf(item.tags) : undefined
      if (!status) return item.name
      return createElement(
        'span',
        { className: 'nt-label' },
        createElement('span', { className: 'nt-label-name' }, item.name),
        createElement('span', { className: `nt-status nt-status--${status}` }, STATUSES[status]),
      )
    },
  },
})
