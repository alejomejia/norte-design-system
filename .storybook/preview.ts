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
      storySort: { order: ['Handbook', ['Introduction'], 'Foundations', 'Elements', 'Components', 'Patterns'] },
    },
  },
}

export default preview
