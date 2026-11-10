import { fileURLToPath, URL } from 'node:url'

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config.ts'

/**
 * Two projects:
 * - `unit` (`pnpm test`): pure logic, in Node. A `<name>.test.ts` sits next to the file it tests.
 * - `storybook` (`pnpm test:stories`, or the test widget in Storybook's sidebar): every story is a test. It renders in
 *   a real Chromium and fails if it throws, if its `play` function fails or if the accessibility checks find a
 *   violation.
 */
export default mergeConfig(
  viteConfig,
  defineConfig({
    // Vite finds dependencies as tests import them, and one found mid-run (a component's first story, Motion's lazy
    // features) is optimized with a page reload that fails the running story. Scanning every story up front finds them
    // all before the first test.
    optimizeDeps: { entries: ['src/**/*.stories.tsx'] },
    test: {
      coverage: {
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.stories.tsx', 'src/handbook/**'],
      },
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            environment: 'node',
            include: ['src/**/*.test.ts', 'scripts/**/*.test.ts', '.storybook/**/*.test.ts'],
          },
        },
        {
          extends: true,
          plugins: [storybookTest({ configDir: fileURLToPath(new URL('./.storybook', import.meta.url)) })],
          test: {
            name: 'storybook',
            browser: {
              enabled: true,
              headless: true,
              provider: playwright(),
              instances: [{ browser: 'chromium' }],
            },
          },
        },
      ],
    },
  }),
)
