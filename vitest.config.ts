import { fileURLToPath, URL } from 'node:url'

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config.ts'

/**
 * Component tests (`pnpm test:stories`, or the test widget in Storybook's sidebar): every story is a test. It renders
 * in a real Chromium and fails if it throws, if its `play` function fails or if the accessibility checks find a
 * violation.
 */
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      coverage: {
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.stories.tsx', 'src/handbook/**'],
      },
      projects: [
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
