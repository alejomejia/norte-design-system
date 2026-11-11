/** The two ways in: an account that exists, or a new one. */
export const SIGN_IN_MODES = ['sign-in', 'sign-up'] as const

/** Where the form is: the details that ask for a code, the code, and in. */
export const SIGN_IN_STEPS = ['details', 'code', 'done'] as const

/** The only code this demo accepts: run #128, then 406. */
export const SIGN_IN_DEMO_CODE = '128406'

/** How long the pretend server takes to send or check a code, in ms: long enough to see the button's spinner. */
export const SIGN_IN_LATENCY = 800

/** How long the button's check shows before the page moves on, in ms. */
export const SIGN_IN_SUCCESS_HOLD = 900

/** How long before a new code can be asked for, in seconds. */
export const SIGN_IN_RESEND_AFTER = 30

/** How far apart the first step's rows rise in as the page opens, in ms. */
export const SIGN_IN_STAGGER = 60

/** A loose check, like the browser's: something, an @, something, a dot, something. The server has the final say. */
export const SIGN_IN_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Every word on the page. */
export const SIGN_IN_COPY = {
  'sign-in': {
    title: 'Sign in to Norte',
    lead: 'Pick up where your agents left off.',
    submit: 'Continue with email',
    switchPrompt: 'New to Norte?',
    switchAction: 'Create an account',
    done: "You're in",
  },
  'sign-up': {
    title: 'Create your account',
    lead: 'Start a workspace for your team. Free for 14 days, no card needed.',
    submit: 'Create account',
    switchPrompt: 'Already have an account?',
    switchAction: 'Sign in',
    done: 'Welcome to Norte',
  },
  nameLabel: 'Full name',
  namePlaceholder: 'Sofía Herrera',
  nameMissing: 'Enter your name, as your team will see it.',
  emailLabel: 'Work email',
  emailPlaceholder: 'name@norte.com',
  emailMissing: 'Enter your work email.',
  emailInvalid: 'Enter a full email address, like name@norte.com.',
  terms: 'By creating an account, you agree to the',
  termsLink: 'Terms',
  privacyLink: 'Privacy Policy',
  codeTitle: 'Check your email',
  codeSentTo: 'We sent a 6-digit code to',
  codeExpires: 'It expires in 10 minutes.',
  changeEmail: 'Change',
  codeLabel: 'Verification code',
  codeWrong: "That code doesn't match. Check the latest email, or send a new one.",
  codeIncomplete: 'Enter all 6 digits from the email.',
  verify: 'Verify',
  verified: 'Verified',
  resendPrompt: "Didn't get it?",
  resendIn: 'Send a new one in',
  resend: 'Send a new code',
  codeSent: 'Code sent',
  newCodeSent: 'New code sent',
  demoHint: 'This is a demo: use 128 406.',
  signedInAs: 'Signed in as',
  opening: 'Opening your workspace…',
  otherAccount: 'Use another account',
} as const

/** The brand panel's words, beside the form on wide screens. */
export const SIGN_IN_PANEL_COPY = {
  title: 'Hand off the research. Keep the final say.',
  lead: 'Agents in Norte plan the work, use your tools, and ask before anything leaves the building.',
  tokens: 'Tokens',
  cost: 'Cost',
  calls: 'Tool calls',
  approvalTitle: 'Approval',
  approvalWhat: 'Email the summary to the leadership team',
  approvalDrafting: 'Drafting',
  approvalWaiting: 'Needs approval',
} as const

/**
 * Run #128 as the brand panel plays it. `beats` are when each beat starts, in ms from the start; after the last, the
 * panel holds for `hold` ms and starts over. Each plan step and tool call says on which beat it starts and ends.
 */
export const SIGN_IN_REPLAY = {
  beats: [0, 1400, 2600, 3600, 5000, 6000, 7000, 10400],
  hold: 5000,
  /** The beat the summary is written on, a word every `wordEvery` ms. */
  streamBeat: 6,
  wordEvery: 70,
  /** From this beat the run waits for Sofía to approve the email. */
  waitBeat: 7,
  /**
   * The tokens the run has used by each beat, ending on run #128's 38.2K; while the summary is written they climb with
   * its words. The cost follows them, at `costPerToken` (run #128's $0.84 for 38.2K).
   */
  tokens: [400, 3_100, 8_600, 14_200, 19_800, 24_500, 29_300, 38_200],
  costPerToken: 0.84 / 38_200,
  /** The tool calls the run has made by each beat, ending on run #128's 23. */
  calls: [0, 1, 4, 9, 13, 17, 20, 23],
  /** Who the summary goes to once Sofía approves: the leadership team. */
  recipients: ['Sofía Herrera', 'Daniel Okafor', 'Mei Lin', 'Lucas Moreau', 'Amara Diallo', 'Jonas Berg'],
  ask: "Compare our five main competitors' pricing for teams of 10 to 50 seats, and email a summary of what changed to the leadership team.",
  /** What the run is doing, beat by beat. */
  details: [
    'Reading the brief',
    'Reading the brief',
    'Visiting pricing pages',
    'Visiting pricing pages',
    'Visiting pricing pages',
    'Comparing seat prices',
    'Drafting the summary',
    'Email to 6 people',
  ],
  plan: [
    { label: "Read the brief and last quarter's report", from: 1, to: 2 },
    { label: 'Visit each pricing page and its archive', from: 2, to: 5 },
    { label: 'Compare seat prices and annual discounts', from: 5, to: 6 },
    { label: 'Draft the summary', from: 6, to: 7 },
  ],
  tools: [
    { name: 'read_file', detail: 'briefs/q3-pricing.md', from: 1, to: 2, result: 'success' },
    { name: 'fetch_url', detail: 'fieldnote.example.com/pricing', from: 2, to: 3, result: 'success' },
    { name: 'fetch_url', detail: 'orbit.example.com/pricing', from: 3, to: 4, result: 'error' },
  ],
  summary:
    "Three of the five raised seat prices for teams of 10 to 50. Tandem went from $15 to $18 a seat, and Kitewise cut its annual discount from 20% to 15%. Orbit's page timed out, so its numbers are last quarter's.",
} as const
