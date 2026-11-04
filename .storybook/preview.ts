import { type Preview } from '@storybook/react-vite'

import { create } from 'storybook/theming'

import { DocsLink } from '@/handbook/blocks/docs-link'
import { DocsPage } from '@/handbook/blocks/docs-page'

import { addArgCategories } from './arg-categories'
import { watchCodeBlocks } from './code-blocks'
import { addDefaultArgs } from './default-args'
import { watchTableOfContents } from './docs-toc'
import { focusMeasureOnStory, hideMeasureContentBox, ignoreMeasureInAccessibilityChecks } from './measure'
import { addRangeSteps, watchRangeLabels } from './range-controls'
import { transformSource } from './story-source'
import { THEME_VARS } from './theme'
import { limitTooltips } from './tooltips'

import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import '@/styles/index.css'
// The docs pages share the UI's variables, icons and status badges, and the props table and the code blocks are the
// same Storybook components in the addon panel and on a component page, so they share their styles too.
import './manager-styles/variables.css'
import './manager-styles/icons.css'
import './manager-styles/status.css'
import './manager-styles/controls.css'
import './manager-styles/code-blocks.css'
import './docs-styles/index.css'
import './preview.css'

const preview: Preview = {
  // Every component gets a generated docs page, with the table of its props.
  tags: ['autodocs'],
  // Controls start at each prop's default (`default-args.ts`).
  argsEnhancers: [addDefaultArgs],
  // Number props are sliders, with a step that fits their span (`range-controls.ts`), and the props table has sections
  // (`arg-categories.ts`).
  argTypesEnhancers: [addRangeSteps, addArgCategories],
  parameters: {
    // The component tests (`vitest.config.ts`) fail a story with an accessibility violation, like a failing `play`.
    a11y: { test: 'error' },
    controls: {
      // The Controls panel shows each prop's description too, under its name (`manager-styles/controls.css`).
      expanded: true,
      matchers: { color: /(background|color)$/i },
    },
    docs: {
      theme: create(THEME_VARS),
      // Every component page opens with the same header card as the handbook pages.
      page: DocsPage,
      // Every link of the docs: one that leaves Storybook opens in a new tab (`docs-link.tsx`).
      components: { a: DocsLink },
      toc: {
        title: 'On this page',
        // Sections and their subsections: the h2 and h3 of handbook pages, and "Stories" and each story on component
        // pages.
        headingSelector: 'h2, h3',
        unsafeTocbotOptions: {
          // tocbot tracks the current heading by listening to this container's scroll, which never happens: the
          // tracking is `docs-toc.ts`'s. Storybook's settings made tocbot's own lag (it updated once scrolling stopped)
          // and skip the last sections of a page.
          scrollContainer: '.sbdocs-toc--custom',
          // tocbot still marks a heading of its own when a scroll ends or a link is clicked. Under these names its marks
          // style nothing, so they don't fight the tracker's `is-active-link`.
          activeLinkClass: 'tocbot-active-link',
          activeListItemClass: 'tocbot-active-li',
          // Every subsection stays listed, whichever section is current.
          collapseDepth: 6,
        },
      },
      // Code stays behind "Show code" (`story-source.ts`). The Playground, the canvas at the top of a component's page,
      // shows it, so it follows the props table's controls live.
      canvas: { sourceState: 'hidden' },
      source: { type: 'dynamic', transform: transformSource },
      // The Code panel under each story: its code with the current controls, ready to paste into an app.
      codePanel: true,
    },
    options: {
      // The map of the sidebar: sections, their groups and their components, in order. A new component takes its place
      // here; the planned ones live in `src/placeholders/`.
      storySort: {
        order: [
          'Handbook',
          ['Introduction', 'Composition', 'Roadmap', 'Changelog', 'Contributing'],
          'Foundations',
          ['Colors', 'Typography', 'Spacing', 'Shape', 'Motion', 'Icons'],
          'Elements',
          [
            'Overview',
            'Actions',
            ['Button', 'Icon button', 'Link'],
            'Form controls',
            ['Text field', 'Textarea', 'Select', 'Checkbox', 'Switch'],
            'Media',
            ['Logo', 'Icon', 'Avatar'],
            'Indicators',
            ['Badge', 'Spinner', 'Skeleton', 'Keyboard key'],
          ],
          'Components',
          [
            'Overlays',
            ['Dialog', 'Menu', 'Popover', 'Tooltip'],
            'Feedback',
            ['Toast', 'Alert', 'Empty state'],
            'Navigation',
            ['Tabs', 'Breadcrumb', 'Command menu'],
            'Content',
            ['Card', 'Accordion'],
          ],
          'AI',
          [
            'Conversation',
            ['Prompt input', 'Message', 'Streaming text', 'Suggestions'],
            'Agents',
            ['Tool call', 'Approval request', 'Run timeline', 'Run status'],
            'Sources',
            ['Citation', 'Source list'],
          ],
          'Data',
          ['Charts', ['Line chart', 'Bar chart'], 'Tables', ['Data table', 'Stat']],
          'Pages',
          ['Workspace', ['Run view', 'Agents', 'Sign in']],
          // Temporary: options to choose from, side by side (`src/explorations/`).
          'Explorations',
        ],
      },
    },
  },
}

watchCodeBlocks('#storybook-docs')
watchTableOfContents()
hideMeasureContentBox()
focusMeasureOnStory()
ignoreMeasureInAccessibilityChecks()
// The sliders of the props table.
watchRangeLabels()
// The docs pages' tooltips (canvas toolbars, the props table), and the titles of the props table's section rows.
limitTooltips('.docblock-argstable')

export default preview
