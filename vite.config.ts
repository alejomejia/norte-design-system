import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

/**
 * Library build (`pnpm build`): one ES module with React left external, `.d.ts`
 * files next to the JS, and `theme.css`. No compiled CSS ships: the components
 * keep their Tailwind classes, and the app's own Tailwind generates them (see
 * the README). Storybook reuses this config and drops the library-only parts in
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
      // Storybook-only files: stories, the handbook pages and the placeholders of planned components.
      exclude: ['src/**/*.stories.tsx', 'src/handbook/**', 'src/placeholders/**'],
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
      fileName: 'index',
    },
    rolldownOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
    copyPublicDir: false,
    sourcemap: true,
  },
})
