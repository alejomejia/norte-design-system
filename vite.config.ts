import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

/** What the app installs (dependencies and peers): imported, never bundled, so the app ships one copy of each. */
const EXTERNAL = [...Object.keys(packageJson.dependencies ?? {}), ...Object.keys(packageJson.peerDependencies ?? {})]

/** Whether an import is one of `EXTERNAL`, or a path inside one (`@base-ui/react/button`, `react/jsx-runtime`). */
function isExternal(id: string) {
  return EXTERNAL.some((name) => id === name || id.startsWith(`${name}/`))
}

/**
 * Library build (`pnpm build`): ES modules with every dependency left external, `.d.ts` files next to the JS, and
 * `theme.css`. One file per source module (`preserveModules`), so each keeps its own `'use client'` and apps only load
 * what they import. No compiled CSS ships: the components keep their Tailwind classes, and the app's own Tailwind
 * generates them (see the README). Storybook reuses this config and drops the library-only parts in
 * `.storybook/main.ts`.
 */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'norte:theme-css',
      apply: 'build',
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'theme.css', source: readFileSync('src/styles/theme.css', 'utf8') })
      },
    },
    dts({
      tsconfigPath: './tsconfig.app.json',
      entryRoot: 'src',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      // Storybook-only files: stories and the handbook pages.
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.ts', 'src/handbook/**'],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
    },
    rolldownOptions: {
      external: isExternal,
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
    copyPublicDir: false,
    sourcemap: true,
  },
})
