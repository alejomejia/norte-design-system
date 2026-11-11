// The package's `/utils` entry: the pure helpers apps may use, safe in Server Components. Each one is documented on
// Helpers → Utilities, and `src/handbook/helpers/helpers.test.ts` fails if one isn't. The rest of `lib/utils` stays
// internal: it's how the components work, not part of the API.

export {
  cn,
  domainOf,
  formatCompact,
  formatElapsed,
  initials,
  toCSSVars,
  tv,
  type VariantProps,
} from './lib/utils'
