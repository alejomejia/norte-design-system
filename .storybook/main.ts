import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

import { type StorybookConfig } from '@storybook/react-vite'

import { analyticsScript } from './analytics-script.ts'

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string }

/**
 * Each release's date, from its git tag (`v0.1.0` → `2026-11-04`), for the Changelog page: Changesets doesn't write dates
 * into `CHANGELOG.md`. Empty where git or the tags aren't there, like a build from a copy of the files.
 */
function releaseDates(): Record<string, string> {
  try {
    const tags = execSync("git tag --list 'v*' --format='%(refname:short) %(creatordate:short)'", { encoding: 'utf8' })
    return Object.fromEntries(
      tags
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [tag = '', date = ''] = line.split(' ')
          return [tag.slice(1), date]
        }),
    )
  } catch {
    return {}
  }
}

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.tsx'],
  // `@storybook/addon-vitest` stays out: its test widget filled the bottom of the sidebar, where the repository's card
  // goes (`manager-source-link.ts`). Its Vitest plugin runs the component tests without it (`vitest.config.ts`).
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: '@storybook/react-vite',
  typescript: {
    // Reads the props' TypeScript types and their JSDoc, so the docs tables show exactly what consumers get.
    reactDocgen: 'react-docgen-typescript',
    // The root tsconfig only holds project references, so its program has no files: the app's has the components.
    reactDocgenTypescriptOptions: {
      tsconfigPath: './tsconfig.app.json',
      // An optional prop's type without `| undefined`, so a boolean gets a switch and a union of strings its options.
      shouldRemoveUndefinedFromOptional: true,
      shouldExtractLiteralValuesFromEnum: true,
    },
  },
  // The browser tab shows Norte's mark instead of Storybook's. Storybook picks up a favicon served at the root.
  staticDirs: [{ from: './favicon.svg', to: '/favicon.svg' }],
  // Umami's tracker, in production builds only (decision 0017): `pnpm dev` never loads it. It goes in the manager, the
  // page around the stories: the preview's iframe would count every visit twice, under URLs nobody shares.
  managerHead: (head, { configType }) => (configType === 'PRODUCTION' ? `${head ?? ''}${analyticsScript()}` : head),
  core: {
    disableTelemetry: true,
  },
  features: {
    // Off: the marks Storybook puts on stories changed since the last commit (a dot at the end of each row, and a
    // filter above the tree). They only exist while running Storybook locally, never in the published one.
    changeDetection: false,
    // Off: the backgrounds tool and its grid toggle. The handbook has one light theme, and stories lay themselves out.
    backgrounds: false,
  },

  viteFinal(viteConfig) {
    // `vite.config.ts` describes the library build. Storybook only needs the React plugin and the aliases, so drop the
    // declaration emitter and the lib entry.
    viteConfig.plugins = viteConfig.plugins?.flat().filter((plugin) => {
      return !(plugin && typeof plugin === 'object' && 'name' in plugin && plugin.name === 'unplugin-dts')
    })
    // Its library output (external dependencies, one file per module) is replaced: Storybook bundles everything. Function
    // names are kept through minification: Storybook writes each story's code from the component's name, which the
    // published build would otherwise shorten to a letter (`<r>`).
    viteConfig.build = { ...viteConfig.build, lib: false, rolldownOptions: { output: { keepNames: true } } }
    // The version the page headers show, and the release dates the Changelog shows.
    viteConfig.define = {
      ...viteConfig.define,
      __PACKAGE_VERSION__: JSON.stringify(version),
      __RELEASE_DATES__: JSON.stringify(releaseDates()),
    }
    return viteConfig
  },
}

export default config
