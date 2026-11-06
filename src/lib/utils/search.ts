/** Lowercased, without accents, so "sofia" finds "Sofía". */
function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()
    .trim()
}

/**
 * How well `label` matches what someone typed, for ranking search results: the label starting with it ranks first
 * (4), then a word of it starting with it (3), then the label containing it (2), then a keyword containing it (1.5),
 * then the query's letters in order, like `rsch` for Research (1). 0 means no match. Case and accents are ignored.
 *
 * @example
 * matchScore('Research agent', 'age') // 3
 */
export function matchScore(label: string, query: string, keywords: readonly string[] = []): number {
  const text = fold(label)
  const typed = fold(query)
  if (!typed) return 0
  if (text.startsWith(typed)) return 4
  if (text.split(/[\s/._-]+/).some((word) => word.startsWith(typed))) return 3
  if (text.includes(typed)) return 2
  if (keywords.some((keyword) => fold(keyword).includes(typed))) return 1.5

  let index = 0
  for (const char of text) if (char === typed[index]) index++
  return index >= typed.length ? 1 : 0
}
