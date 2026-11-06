/**
 * The initials of a name, as an avatar shows them: the first letter of the first and last words, uppercased. One word
 * gives one letter. Letters are taken by code point, so accents and emoji stay whole.
 *
 * @example
 * initials('Sofía Herrera') // 'SH'
 */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const first = words.at(0)
  const last = words.length > 1 ? words.at(-1) : undefined
  return [first, last]
    .map((word) => (word ? (Array.from(word)[0] ?? '') : ''))
    .join('')
    .toLocaleUpperCase()
}
