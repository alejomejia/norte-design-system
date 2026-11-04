/**
 * A story's code without its event handlers. Storybook prints the spies of `fn()` as `onClick={function…}`, which is
 * noise in code meant to be copied into an app.
 */
export function withoutHandlers(code: string): string {
  return code.replace(/\s+on[A-Z]\w*=\{(?:function\s*\w*\(\)\s*\{\}|\(\)\s*=>\s*\{\})\}/g, '')
}
