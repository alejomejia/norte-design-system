import { readFileSync } from 'node:fs'

import { type StorybookConfig } from '@storybook/react-vite'

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string }

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
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
    if (viteConfig.build) delete viteConfig.build.lib
    // Keep function names through minification: Storybook writes each story's code from the component's name, which
    // the published build would otherwise shorten to a letter (`<r>`).
    viteConfig.build = {
      ...viteConfig.build,
      rolldownOptions: {
        ...viteConfig.build?.rolldownOptions,
        output: { ...viteConfig.build?.rolldownOptions?.output, keepNames: true },
      },
    }
    // The version the page headers show.
    viteConfig.define = { ...viteConfig.define, __PACKAGE_VERSION__: JSON.stringify(version) }
    return viteConfig
  },
}

export default config
