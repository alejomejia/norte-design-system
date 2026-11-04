/** Prints why a hook stopped git, and how to fix it, then exits with an error so nothing is committed or pushed. */
export function fail(title: string, problems: string[], fix: string): never {
  console.error(`\n✖ ${title}\n`)
  for (const problem of problems) console.error(`  • ${problem}`)
  console.error(`\n  ${fix}`)
  console.error('  The rules: CONTRIBUTING.md\n')
  process.exit(1)
}
