/**
 * Norte's code block: a header with the language and a copy button, then the code with line numbers. It covers the code
 * of the docs pages (MDX code fences, and the code under each canvas) and the Code panel under a story. Storybook
 * renders all of them with React, with no option for any of this and no element per line, so a watcher builds each
 * block next to Storybook's own code, which stays in the page, hidden, as the source of the text. The look is in
 * `manager-styles/code-blocks.css`.
 */

const LANGUAGE_NAMES: Readonly<Record<string, string>> = {
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'React',
  jsx: 'React',
  js: 'JavaScript',
  javascript: 'JavaScript',
  html: 'HTML',
  markup: 'HTML',
  css: 'CSS',
  json: 'JSON',
  sh: 'Terminal',
  bash: 'Terminal',
  shell: 'Terminal',
}

/** How long the copy button shows its check and "Copied". */
const COPIED_DURATION = 2000

/** The code each block last rendered: a block is only rebuilt when Storybook changes its code. */
const renderedCode = new WeakMap<Element, string>()
const copiedTimers = new WeakMap<HTMLButtonElement, number>()

function getTitle(source: HTMLPreElement) {
  const language = source.querySelector('[class*="language-"]')?.className.match(/language-(\w+)/)?.[1] ?? ''
  return LANGUAGE_NAMES[language] ?? 'Code'
}

function createIcon(name: string) {
  const icon = document.createElement('span')
  icon.className = 'nt-code-block__icon'
  icon.dataset.icon = name
  return icon
}

async function copyCode(block: Element, button: HTMLButtonElement, label: HTMLElement, status: HTMLElement) {
  await navigator.clipboard.writeText(block.querySelector('pre.prismjs')?.textContent?.trimEnd() ?? '')

  button.dataset.copied = ''
  label.textContent = 'Copied'
  status.textContent = 'Copied'
  clearTimeout(copiedTimers.get(button))
  copiedTimers.set(
    button,
    window.setTimeout(() => {
      delete button.dataset.copied
      label.textContent = 'Copy'
      status.textContent = ''
    }, COPIED_DURATION),
  )
}

function createHeader(block: Element, title: string) {
  const heading = document.createElement('div')
  heading.className = 'nt-code-block__title'
  heading.append(createIcon(title === 'Terminal' ? 'terminal' : 'file-code'), title)

  const copy = document.createElement('button')
  copy.type = 'button'
  copy.className = 'nt-code-block__copy'
  copy.setAttribute('aria-label', 'Copy code')
  // A word next to the icon, so the button reads as one at a glance.
  const label = document.createElement('span')
  label.textContent = 'Copy'
  copy.append(createIcon('copy'), label)

  // Announces the copy to screen readers, which keep hearing the button's own name, "Copy code".
  const status = document.createElement('span')
  status.className = 'sb-sr-only'
  status.setAttribute('aria-live', 'polite')

  copy.addEventListener('click', () => copyCode(block, copy, label, status))

  const header = document.createElement('div')
  header.className = 'nt-code-block__header'
  header.append(heading, copy, status)
  return header
}

/** Wraps a piece of text in copies of the tokens around it, so it keeps its syntax colors. */
function wrapInTokens(text: string, tokens: readonly Element[]) {
  return tokens.reduceRight<Node>((child, token) => {
    const copy = document.createElement('span')
    copy.className = token.className
    copy.append(child)
    return copy
  }, document.createTextNode(text))
}

/** Splits Storybook's highlighted code into one element per line, the hook for the line numbers. */
function createLines(source: HTMLPreElement) {
  const code = document.createElement('code')

  function addLine() {
    const line = document.createElement('span')
    line.className = 'nt-code-block__line'
    code.append(line)
    return line
  }

  let line = addLine()

  function walk(node: Node, tokens: readonly Element[]) {
    if (node instanceof Text) {
      node.data.split('\n').forEach((part, index) => {
        if (index > 0) line = addLine()
        if (part) line.append(wrapInTokens(part, tokens))
      })
    } else if (node instanceof Element) {
      // Only the tokens carry colors. Storybook's other wrappers are left out.
      const inner = node.classList.contains('token') ? [...tokens, node] : tokens
      for (const child of node.childNodes) walk(child, inner)
    }
  }

  for (const child of source.childNodes) walk(child, [])
  // A final line break leaves an empty last line.
  if (code.children.length > 1 && !line.hasChildNodes()) line.remove()
  return code
}

function renderCodeBlocks(root: string) {
  for (const source of document.querySelectorAll<HTMLPreElement>(`${root} pre.prismjs`)) {
    const block = source.closest('.docblock-source') ?? source.closest('.sbdocs-preview > div')
    const code = source.textContent ?? ''
    if (!block || renderedCode.get(block) === code) continue
    renderedCode.set(block, code)

    // Appended after Storybook's own children, where React never inserts anything, and marked with an attribute, which
    // React leaves alone, unlike a class.
    block.setAttribute('data-code-block', '')
    if (!block.querySelector(':scope > .nt-code-block__header')) block.append(createHeader(block, getTitle(source)))

    let content = block.querySelector(':scope > .nt-code-block__content')
    if (!content) {
      content = document.createElement('pre')
      content.className = 'nt-code-block__content'
      // Long lines scroll sideways, so keyboard users need to reach the block.
      content.setAttribute('tabindex', '0')
      block.append(content)
    }
    content.replaceChildren(createLines(source))
  }
}

/**
 * Builds the code blocks inside `root` (a selector) now and whenever Storybook renders new code there (another page, the
 * code toggle, a changed arg).
 */
export function watchCodeBlocks(root: string) {
  renderCodeBlocks(root)
  // A rebuild triggers the observer again, but finds every block's code unchanged, so it stops there.
  new MutationObserver(() => renderCodeBlocks(root)).observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
  })
}
