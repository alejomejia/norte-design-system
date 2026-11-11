// The package's `/hooks` entry: the client hooks apps may use. Each one is documented on Helpers → Hooks, and
// `src/handbook/helpers/helpers.test.ts` fails if one isn't. Each hook's file carries its own `'use client'`, so this
// entry needs none.

export { useCopy, useElapsed, useInViewport, useMediaQuery, useReducedMotion } from './lib/hooks'
