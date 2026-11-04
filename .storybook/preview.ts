import { type Decorator, type Preview } from '@storybook/react-vite'

import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import '@/styles/index.css'

/** Sets the theme from the toolbar on `<html>`, the way an app does: the roles remap and every story follows. */
const withTheme: Decorator = (Story, { globals }) => {
  document.documentElement.dataset.theme = globals.theme === 'dark' ? 'dark' : 'light'
  return Story()
}

const preview: Preview = {
  // Every component gets a generated docs page, with the table of its props.
  tags: ['autodocs'],
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Light or dark theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
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
