/**
 * The branch and commit rules of CONTRIBUTING.md, as pure functions: each check returns the list of problems it found,
 * empty when the input is valid. The hooks in `.githooks/` call them; `git-rules.test.ts` covers them.
 */

/** The verbs a branch description can start with. */
export const BRANCH_VERBS = ['add', 'fix', 'update', 'remove', 'refactor', 'upgrade'] as const

/** The Conventional Commits types this repo accepts. */
export const COMMIT_TYPES = ['feat', 'fix', 'refactor', 'style', 'docs', 'test', 'build', 'chore'] as const

/** The longest first line a commit can have. */
export const MAX_SUBJECT_LENGTH = 72

const RELEASE_BRANCH = /^release\/v\d+\.\d+\.\d+$/
const TICKET_BRANCH = /^nt-(\d+)\/(.*)$/
const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const SUBJECT = /^(?<type>[a-z]+)(\((?<scope>[^)]*)\))?!?: (?<summary>.*)$/
const AI_ATTRIBUTION = [
  /^co-authored-by:.*\b(claude|anthropic|copilot|chatgpt|openai|cursor|gemini)\b/im,
  /generated (with|by) .*\b(claude|copilot|chatgpt|cursor|gemini|ai)\b/i,
  /^claude-session:/im,
]

/** Problems with a branch name: `nt-<issue>/<verb>-<what>`, or `release/vX.Y.Z` for releases. */
export function checkBranchName(name: string): string[] {
  if (RELEASE_BRANCH.test(name)) return []
  if (name.startsWith('release/')) return ['A release branch is exactly `release/vX.Y.Z`, like `release/v0.2.0`.']

  const match = TICKET_BRANCH.exec(name)
  if (!match) {
    if (/^nt-\d+\//i.test(name)) return ['The issue prefix is lowercase: `nt-12/…`, not `NT-12/…`.']
    return ['A branch starts with its GitHub issue: `nt-<issue>/<verb>-<what>`, like `nt-12/add-button`.']
  }

  const description = match[2] ?? ''
  if (!KEBAB_CASE.test(description)) {
    return ['The description is lowercase kebab-case, ASCII only: `add-button`, not `AddButton` or `add_button`.']
  }

  const problems: string[] = []
  const words = description.split('-')
  const verb = words[0] ?? ''
  if (!(BRANCH_VERBS as readonly string[]).includes(verb)) {
    problems.push(`The description starts with one of: ${BRANCH_VERBS.join(', ')}. Found \`${verb}\`.`)
  }
  if (words.length < 2 || words.length > 5) {
    problems.push(`The description has 2 to 5 words, the verb included. Found ${words.length}.`)
  }
  return problems
}

/** Commits git writes itself (merges, reverts, fixups) skip the format rules. */
function isGeneratedByGit(subject: string): boolean {
  return /^(Merge |Revert "|fixup! |squash! |amend! )/.test(subject)
}

/** Problems with a commit message: `type(scope): summary`, an optional body after an empty line, no AI attribution. */
export function checkCommitMessage(message: string): string[] {
  // Git drops the comment lines and the trailing blank lines before saving the message.
  const lines = message
    .split('\n')
    .filter((line) => !line.startsWith('#'))
    .join('\n')
    .trimEnd()
    .split('\n')
  const subject = lines[0] ?? ''
  if (isGeneratedByGit(subject)) return []

  const problems: string[] = []
  const match = SUBJECT.exec(subject)
  if (!match?.groups) {
    problems.push('The first line is `type(scope): summary`, like `feat(button): add a loading state`.')
  } else {
    const { type = '', scope, summary = '' } = match.groups
    if (!(COMMIT_TYPES as readonly string[]).includes(type)) {
      problems.push(`The type is one of: ${COMMIT_TYPES.join(', ')}. Found \`${type}\`.`)
    }
    if (scope !== undefined && !KEBAB_CASE.test(scope)) {
      problems.push(`The scope is a lowercase kebab-case name, like \`button\` or \`tokens\`. Found \`${scope}\`.`)
    }
    if (!/^[a-z0-9]/.test(summary)) problems.push('The summary starts with a lowercase letter.')
    if (summary.endsWith('.')) problems.push('The summary has no period at the end.')
  }

  if (subject.length > MAX_SUBJECT_LENGTH) {
    problems.push(`The first line is ${MAX_SUBJECT_LENGTH} characters at most. It has ${subject.length}.`)
  }
  if (lines.length > 1 && lines[1] !== '') problems.push('Leave an empty line between the first line and the body.')
  if (AI_ATTRIBUTION.some((pattern) => pattern.test(message))) {
    problems.push('No AI attribution: remove the co-author, "Generated with" or session lines of an AI assistant.')
  }
  return problems
}
