import { type Preview } from '@storybook/react-vite'

import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import '@/styles/index.css'

const preview: Preview = {
  // Every component gets a generated docs page, with the table of its props.
  tags: ['autodocs'],
  parameters: {
    // The component tests (`vitest.config.ts`) fail a story with an accessibility violation, like a failing `play`.
    a11y: { test: 'error' },
    controls: { expanded: true },
    options: {
      // The map of the sidebar: sections, their groups and their components, in order. A new component takes its place
      // here; the planned ones live in `src/placeholders/`.
      storySort: {
        order: [
          'Handbook',
          ['Introduction', 'Roadmap', 'Changelog', 'Contributing'],
          'Foundations',
          ['Colors', 'Typography', 'Spacing', 'Shape', 'Motion'],
          'Elements',
          [
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
        ],
      },
    },
  },
}

export default preview
