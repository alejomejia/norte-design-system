// Run by `pnpm install` (the `prepare` script): points git at the hooks in `.githooks/`. Skipped outside a git
// checkout, for example when the package is installed from the registry.
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'

if (existsSync('.git')) execFileSync('git', ['config', 'core.hooksPath', '.githooks'])
