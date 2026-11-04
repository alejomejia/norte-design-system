import { type StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: '@storybook/react-vite',
  typescript: {
    // Reads the props' TypeScript types and their JSDoc, so the docs tables show exactly what consumers get.
    reactDocgen: 'react-docgen-typescript',
  },
  core: {
    disableTelemetry: true,
  },
  viteFinal(viteConfig) {
    // `vite.config.ts` describes the library build. Storybook only needs the React plugin and the aliases, so drop the
    // declaration emitter and the lib entry.
    viteConfig.plugins = viteConfig.plugins?.flat().filter((plugin) => {
      return !(plugin && typeof plugin === 'object' && 'name' in plugin && plugin.name === 'unplugin-dts')
    })
    if (viteConfig.build) delete viteConfig.build.lib
    return viteConfig
  },
}

export default config
