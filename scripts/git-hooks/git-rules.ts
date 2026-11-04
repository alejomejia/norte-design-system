/**
 * The commit rules of CONTRIBUTING.md, as pure functions: each check returns the list of problems it found, empty when
 * the input is valid. The hooks in `.githooks/` call them; `git-rules.test.ts` covers them.
 */

/** The Conventional Commits types this repo accepts. */
export const COMMIT_TYPES = ['feat', 'fix', 'refactor', 'style', 'docs', 'test', 'build', 'chore'] as const

/** The longest first line a commit can have. */
export const MAX_SUBJECT_LENGTH = 72

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const SUBJECT = /^(?<type>[a-z]+)(\((?<scope>[^)]*)\))?!?: (?<summary>.*)$/
const AI_ATTRIBUTION = [
  /^co-authored-by:.*\b(claude|anthropic|copilot|chatgpt|openai|cursor|gemini)\b/im,
  /generated (with|by) .*\b(claude|copilot|chatgpt|cursor|gemini|ai)\b/i,
  /^claude-session:/im,
]

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
