import { type BarChartItem } from '@/components/bar-chart'
import { type CommandMenuGroup, type CommandMenuItem } from '@/components/command-menu'
import { type LineChartPoint } from '@/components/line-chart'
import { type SelectItem } from '@/components/select'
import { type SourceListSource } from '@/components/source-list'
import { type ToolCallStatus } from '@/components/tool-call'

/** Where run #128 is: writing its summary, waiting for Sofía's answer, then sent or held back. */
export const RUN_VIEW_PHASES = ['writing', 'waiting', 'approved', 'rejected'] as const

/** The panel's tabs. */
export const RUN_VIEW_TABS = ['results', 'details', 'logs'] as const

/** When run #128 was asked, and when it asked to send the email. */
export const RUN_VIEW_ASKED_AT = new Date(2026, 10, 6, 10, 42)
export const RUN_VIEW_REQUESTED_AT = new Date(2026, 10, 6, 10, 46)

/** How long run #128 had been going when the page opens, in ms: the last seconds of its 4m 12s are the summary. */
export const RUN_VIEW_ELAPSED_AT_OPEN = 246_000

/** Timings of the pretend workspace, in ms. */
export const RUN_VIEW_TIMING = {
  /** How long the thread stays empty as the page opens, before Sofía's ask arrives. */
  open: 800,
  /** Between Sofía's ask and the agent starting to think about it. */
  reply: 600,
  /** Between two words of a streamed answer. */
  word: 60,
  /** Between the plan's steps ticking off, as the agent works through it. */
  tick: 1100,
  /** Before the reasoning shows, once the plan is done. */
  reasoning: 800,
  /** Between one tool call showing and the next. */
  call: 450,
  /** Before the timeout's alert shows, and before the summary starts after it. */
  alert: 900,
  /** How long the results take to load as the page opens: long enough to see the skeletons. */
  results: 1400,
  /** How long the agent thinks before it answers: the ask as the page opens, and each follow-up. */
  think: 1200,
  /** How long deleting the run takes. */
  delete: 800,
  /** How long sending an invite takes. */
  invite: 800,
} as const

/** Below this width the sidebar leaves (the command menu takes over the navigation): `md`. */
export const RUN_VIEW_SIDEBAR_QUERY = '(min-width: 48rem)'

/** From this width the sidebar opens with its names; narrower, it starts as icons: `xl`. */
export const RUN_VIEW_WIDE_QUERY = '(min-width: 80rem)'

/** Below this width the breadcrumb folds its middle: `sm`. */
export const RUN_VIEW_NARROW_QUERY = '(max-width: 39.99rem)'

/** A loose check, like the browser's: something, an @, something, a dot, something. The server has the final say. */
export const RUN_VIEW_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** The people in the story, by their emails. Sofía is the one signed in. */
export const RUN_VIEW_ME = { name: 'Sofía Herrera', email: 'sofia@norte.com', role: 'Head of Growth' } as const

/** Who the summary goes to once Sofía approves: the leadership team. */
export const RUN_VIEW_RECIPIENTS = [
  'Sofía Herrera',
  'Daniel Okafor',
  'Mei Lin',
  'Lucas Moreau',
  'Amara Diallo',
  'Jonas Berg',
] as const

/** Every word on the page. */
export const RUN_VIEW_COPY = {
  workspace: 'Norte',
  workspaceMenu: {
    settings: 'Workspace settings',
    invite: 'Invite people',
    create: 'New workspace',
  },
  nav: {
    home: 'Home',
    agents: 'Agents',
    runs: 'Runs',
    approvals: 'Approvals',
    approvalsWaiting: (count: number) => `${count} waiting`,
    team: 'Growth',
    agent: 'Research agent',
    briefs: 'Briefs',
    reports: 'Reports',
    settings: 'Settings',
  },
  accountMenu: {
    profile: 'Profile',
    preferences: 'Preferences',
    signOut: 'Sign out',
  },
  title: 'Run #128, Research agent',
  demo: 'This is a demo: only run #128 is here.',
  path: { agents: 'Agents', agent: 'Research agent', run: 'Run #128' },
  badge: {
    writing: 'Drafting',
    waiting: 'Needs approval',
    approved: 'Sent',
    rejected: 'Not sent',
  },
  runDetail: {
    writing: 'Drafting the summary',
    waiting: 'Waiting for your approval',
    approved: 'Email sent to 6 people',
    rejected: 'Email not sent',
  },
  agentName: 'Research agent',
  share: 'Share',
  shareRun: 'Share run',
  shareTitle: 'Share run #128',
  shareLead: 'People with access can see its results, sources and summary, and answer its approvals.',
  inviteLabel: 'Invite by email',
  invitePlaceholder: 'name@norte.com',
  inviteMissing: 'Enter an email to invite.',
  inviteInvalid: 'Enter a full email address, like name@norte.com.',
  invite: 'Invite',
  invited: (email: string) => `Invited ${email}`,
  invitedNote: 'They get an email with a link to run #128.',
  peopleWithAccess: 'People with access',
  you: '(you)',
  owner: 'Owner',
  teamAccess: 'Growth team',
  teamAccessNote: '8 people',
  canView: 'Can view',
  copyLink: 'Copy link',
  linkCopied: 'Link copied',
  done: 'Done',
  runActions: 'Run actions',
  rerun: 'Run again',
  rerunWhy: 'Waiting for your approval',
  exportCsv: 'Export results as CSV',
  deleteRun: 'Delete run',
  deleteTitle: 'Delete run #128?',
  deleteLead:
    "Its results, sources and the summary draft go with it, and the approval it's waiting for is cancelled. This can't be undone.",
  cancel: 'Cancel',
  deleted: 'Run #128 deleted',
  deletedNote: "This is a demo, so it's still here.",
  search: 'Search',
  ask: "Compare our five main competitors' pricing for teams of 10 to 50 seats, and email a summary of what changed to the leadership team.",
  failedTitle: "Orbit's pricing page timed out",
  failedBody: "Its numbers are last quarter's. Check orbit.example/pricing before you rely on them.",
  moreCalls: (count: number) => `+${count} more`,
  copySummary: 'Copy summary',
  approvalTitle: 'Send “Competitor pricing, Q3: what changed” to the leadership team?',
  approvalTo: 'To',
  approvalPeople: 'Leadership team · 6 people',
  approvalNext: "Sends from sofia@norte.com. You'll have 5 seconds to undo it.",
  sent: 'Email sent',
  sentNote: '“Competitor pricing, Q3: what changed” went to the leadership team.',
  notSent: 'Email not sent',
  notSentNote: 'The summary stays in reports/pricing-q3.md.',
  suggestions: 'Suggested follow-ups',
  stopped: 'Stopped before answering.',
  panel: 'Run #128',
  tabs: { results: 'Results', details: 'Details', logs: 'Logs' },
  resultsCaption: 'Seat prices for teams of 10 to 50 seats, a seat a month',
  resultsNote: "Billed monthly. Orbit's price is from last quarter's report.",
  columns: { competitor: 'Competitor', price: 'Price', change: 'Change' },
  unknown: 'Unknown',
  unreadable: 'Timed out',
  noChange: 'No change',
  up: (amount: number) => `Up $${amount}`,
  selected: (count: number) => `${count} selected`,
  askAbout: 'Ask about these',
  askAboutPrompt: (names: string[]) =>
    `Tell me more about ${new Intl.ListFormat('en', { type: 'conjunction' }).format(names)}'s pricing.`,
  statsTitle: 'This run',
  stats: { duration: 'Duration', tokens: 'Tokens', cost: 'Cost', calls: 'Tool calls' },
  versus: 'vs run #127',
  costTitle: 'Cost breakdown',
  costLead: 'What run #128 spent, by step.',
  costTotal: 'Total',
  tokensTitle: 'Tokens per minute',
  elapsed: 'Elapsed',
  callsTitle: 'Tool calls by tool',
  tool: 'Tool',
  settingsTitle: 'Settings',
  settingsLead: "Changes apply from the agent's next run.",
  settings: {
    instructions: 'Instructions',
    instructionsHint: 'What it always does',
    model: 'Model and limits',
    modelHint: 'Balanced, up to $5 a run',
    permissions: 'Permissions',
    permissionsHint: 'What it may do on its own',
  },
  instructionsLabel: 'Instructions',
  instructionsDescription: 'The agent reads these before every run.',
  modelLabel: 'Model',
  limitLabel: 'Spend limit per run',
  limitDescription: 'The run stops and asks before it spends more, in US dollars.',
  askBeforeEmail: 'Ask before sending email',
  browse: 'Browse the web',
  keepLogs: 'Keep logs',
  logsOffTitle: 'No logs for this run',
  logsOffBody: "Logs were off when run #128 started. Turn them on to keep each step's input and output for 30 days.",
  logsOnTitle: 'Logs are on',
  logsOnBody: "The agent's next run keeps each step's input and output here for 30 days.",
  turnOnLogs: 'Turn on logs',
  turnOffLogs: 'Turn off',
} as const

/** The models the prompt and the settings pick from. */
export const RUN_VIEW_MODELS: SelectItem[] = [
  { value: 'fast', label: 'Fast' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'deep', label: 'Deep' },
]

/** The agent's standing instructions, as the settings open with them. */
export const RUN_VIEW_INSTRUCTIONS =
  'Compare like for like: the plan a team of 10 to 50 seats would buy. Cite every price, and say when a number comes from an older report.'

/** The run's plan. The last two steps move with the page: the summary as it's written, then the email. */
export const RUN_VIEW_PLAN = [
  "Read the brief and last quarter's report",
  'Visit each pricing page and its archived version',
  'Compare seat prices and annual discounts',
  'Draft the summary',
  'Email the summary to the leadership team',
] as const

/** How many plan steps are done as the summary starts: the agent is on the fourth. */
export const RUN_VIEW_PLAN_DONE = 3

/** What the agent worked through, folded under its plan. Took 18 seconds. */
export const RUN_VIEW_REASONING = {
  steps: [
    "The brief asks for teams of 10 to 50 seats, so I'll compare each competitor's mid-tier plan, not its cheapest.",
    "Last quarter's report has the baseline prices, so I can say what changed, not just what it costs now.",
    "Archived pages show when a price moved. Fieldnote's archive still shows $12 in June.",
    "Orbit's page timed out twice. I'll keep last quarter's numbers and say so, rather than guess.",
  ],
  duration: 18_000,
} as const

/** The calls worth showing, in the order they ran, with how long each took (ms). 14 more are in Details. */
export const RUN_VIEW_TOOL_CALLS: { name: string; detail: string; status: ToolCallStatus; duration: number }[] = [
  { name: 'web_search', detail: 'team pricing 10 to 50 seats', status: 'success', duration: 1800 },
  { name: 'read_file', detail: 'briefs/q3-pricing.md', status: 'success', duration: 400 },
  { name: 'read_file', detail: 'reports/pricing-q2.md', status: 'success', duration: 600 },
  { name: 'fetch_url', detail: 'fieldnote.example/pricing', status: 'success', duration: 2300 },
  { name: 'fetch_url', detail: 'brightloop.example/pricing', status: 'success', duration: 1900 },
  { name: 'fetch_url', detail: 'tandem.example/plans', status: 'success', duration: 2100 },
  { name: 'fetch_url', detail: 'orbit.example/pricing', status: 'error', duration: 30_000 },
  { name: 'fetch_url', detail: 'kitewise.example/pricing', status: 'success', duration: 1700 },
  { name: 'write_summary', detail: 'reports/pricing-q3.md', status: 'success', duration: 5200 },
]

/** Run #128's tool calls before the email: 23. */
export const RUN_VIEW_CALLS = 23

/**
 * The sources the summary cites, in its order, and the one it couldn't read. A citation's number is its place here,
 * counting only the sources read.
 */
export const RUN_VIEW_SOURCES: SourceListSource[] = [
  {
    href: 'https://fieldnote.example/pricing',
    title: 'Fieldnote pricing',
    excerpt: 'Team: $14 per seat a month, billed monthly. Save 20% with annual billing.',
  },
  {
    href: 'https://brightloop.example/pricing',
    title: 'Pricing: plans for every team',
    excerpt: 'Growth, for 10 to 50 seats: $16 a seat each month. 15% off when you pay yearly.',
  },
  {
    href: 'https://www.tandem.example/plans',
    title: 'Tandem plans and pricing',
    excerpt: 'Teams: $18 per seat per month. Annual plans save 15%.',
  },
  {
    href: 'https://kitewise.example/pricing',
    title: 'Kitewise pricing',
    excerpt: 'Team: $11 per user a month. Pay yearly and save 15%.',
  },
  { href: 'https://orbit.example/pricing', title: 'Orbit pricing', status: 'failed', reason: 'Timed out after 30s' },
]

/** What the agent found, in the order it visited the pages. Orbit's timed out: no price, no source. */
export const RUN_VIEW_COMPETITORS: {
  id: string
  name: string
  /** A seat a month for teams of 10 to 50; `null` when the page couldn't be read. */
  price: number | null
  previous: number
  /** The citation that backs the price: its number in the summary. */
  source?: number
}[] = [
  { id: 'fieldnote', name: 'Fieldnote', price: 14, previous: 12, source: 1 },
  { id: 'brightloop', name: 'Brightloop', price: 16, previous: 15, source: 2 },
  { id: 'tandem', name: 'Tandem', price: 18, previous: 15, source: 3 },
  { id: 'orbit', name: 'Orbit', price: null, previous: 14 },
  { id: 'kitewise', name: 'Kitewise', price: 11, previous: 11, source: 4 },
]

/** The summary the agent writes as the page opens. `[n]` are citations; a blank line starts a paragraph. */
export const RUN_VIEW_SUMMARY =
  "Three of the five raised their seat price for teams of 10 to 50. Fieldnote went from $12 to $14 [1], Brightloop from $15 to $16 [2], and Tandem from $15 to $18 [3], the biggest jump.\n\nKitewise kept its price at $11 but cut its annual discount from 20% to 15% [4]. Orbit's page timed out, so its numbers are last quarter's.\n\nThe email to the leadership team is drafted in **reports/pricing-q3.md**. I'll send it once you approve."

/** The email the approval previews: its paragraphs, then its list. */
export const RUN_VIEW_EMAIL = {
  greeting: 'Hi all,',
  lead: 'Three of our five main competitors raised their seat price for teams of 10 to 50 seats this quarter:',
  changes: [
    'Fieldnote: from $12 to $14 a seat a month.',
    'Brightloop: from $15 to $16.',
    'Tandem: from $15 to $18, the biggest jump.',
  ],
  rest: "Kitewise kept its price but cut its annual discount from 20% to 15%. Orbit's pricing page timed out, so its numbers are from last quarter's report. The full comparison is in reports/pricing-q3.md.",
  signature: 'Sofía',
} as const

/** The follow-ups offered under the conversation: the chip, and the prompt it writes when it isn't the chip's text. */
export const RUN_VIEW_SUGGESTIONS = [
  { label: 'Add annual prices', prompt: 'Add annual prices' },
  { label: 'Only EU', prompt: 'Only include prices for customers in the EU' },
  { label: "Retry Orbit's page", prompt: "Retry Orbit's pricing page" },
] as const

/** The agent's answers to the suggestions, by prompt; anything else gets `fallback`. */
export const RUN_VIEW_REPLIES: Record<string, string> & { fallback: string } = {
  'Add annual prices':
    'Billed yearly, a seat a month comes to $11.20 at Fieldnote [1], $13.60 at Brightloop [2], $15.30 at Tandem [3] and $9.35 at Kitewise [4]. Orbit stays unknown until its page loads.',
  'Only include prices for customers in the EU':
    'In the EU, Fieldnote and Tandem charge the same numbers in euros [1] [3]. Brightloop and Kitewise add VAT at checkout, so their prices on the page are before tax [2] [4].',
  "Retry Orbit's pricing page":
    "Orbit's pricing page timed out again after 30 seconds. I'll keep last quarter's $14 a seat in the summary and flag it, as before.",
  fallback:
    "That's new work, so I'd start it as run #129 with today's results as its brief. This page is a demo, so the run stops here.",
}

/** The tokens run #128 spent each minute, read every 30 seconds over its 4m 12s. They add up to its 38.2k. */
export const RUN_VIEW_TOKENS_PER_MINUTE: LineChartPoint[] = [
  { x: 0, y: 0 },
  { x: 0.5, y: 4200 },
  { x: 1, y: 7800 },
  { x: 1.5, y: 11_600 },
  { x: 2, y: 13_400 },
  { x: 2.5, y: 6100 },
  { x: 3, y: 12_200 },
  { x: 3.5, y: 10_400 },
  { x: 4, y: 7900 },
  { x: 4.2, y: 7000 },
]

export const RUN_VIEW_TOKENS_SUMMARY =
  "Peaked at 13.4k tokens a minute at 2m, while reading the pricing pages, and dipped to 6.1k at 2m 30s as Orbit's page timed out."

/** Run #128's tool calls, by tool, before the email: `send_email` runs once Sofía approves. */
export const RUN_VIEW_CALLS_BY_TOOL: BarChartItem[] = [
  { label: 'fetch_url', value: 10 },
  { label: 'web_search', value: 8 },
  { label: 'write_summary', value: 3 },
  { label: 'read_file', value: 2 },
  { label: 'send_email', value: 0 },
]

export const RUN_VIEW_CALLS_SUMMARY =
  'Most calls were fetch_url (10), reading the five pricing pages and their archived versions. send_email runs once the email is approved.'

/** What the run spent, by step, for the cost stat's help: it adds up to 38.2k tokens and $0.84. */
export const RUN_VIEW_COST = [
  { step: 'Reading and searching', tokens: '6.4k', cost: '$0.14' },
  { step: 'Visiting pricing pages', tokens: '22.2k', cost: '$0.49' },
  { step: 'Comparing and drafting', tokens: '9.6k', cost: '$0.21' },
] as const

export const RUN_VIEW_COST_TOTAL = { tokens: '38.2k', cost: '$0.84' } as const

/** What Sofía opened last, first in the command menu. */
export const RUN_VIEW_RECENT: CommandMenuItem[] = [
  { value: 'brief', label: 'briefs/q3-pricing.md', icon: 'file', description: 'Brief' },
  { value: 'run-127', label: 'Run #127', icon: 'run', description: 'Research agent · last week' },
]

/** The command menu's groups, without what choosing each does: the page adds that. */
export const RUN_VIEW_COMMANDS: CommandMenuGroup[] = [
  {
    label: 'Go to',
    items: [
      { value: 'home', label: 'Home', icon: 'home' },
      { value: 'agents', label: 'Agents', icon: 'agent' },
      { value: 'runs', label: 'Runs', icon: 'run' },
      { value: 'approvals', label: 'Approvals', icon: 'approve' },
      { value: 'settings', label: 'Settings', icon: 'settings', keywords: ['preferences', 'workspace'] },
    ],
  },
  {
    label: 'Run #128',
    items: [
      { value: 'share', label: 'Share run', icon: 'share', keywords: ['invite', 'people'] },
      { value: 'copy-link', label: 'Copy link', icon: 'link' },
      { value: 'details', label: 'Show details', icon: 'info', keywords: ['cost', 'tokens', 'settings'] },
      { value: 'delete', label: 'Delete run', icon: 'delete', tone: 'danger' },
    ],
  },
  {
    label: 'Files',
    items: [
      { value: 'brief', label: 'briefs/q3-pricing.md', icon: 'file', description: 'Brief' },
      { value: 'report', label: 'reports/pricing-q3.md', icon: 'file', description: 'Summary draft' },
    ],
  },
]

/** The link Copy link puts on the clipboard. */
export const RUN_VIEW_LINK = 'https://norte.com/growth/agents/research-agent/runs/128'
