/**
 * Return the first `count` sentences of `text`, re-joined with single spaces.
 *
 * Boundaries are sentence-ending punctuation (`.`, `!`, `?`) that is followed by
 * whitespace, so decimals like "6.5" and slash dates like "2024/25" stay intact.
 * Implemented with a sentinel split (no regex lookbehind) so it runs on older
 * Safari too. Used by the cards to keep excerpt previews a deterministic length
 * regardless of how wide the column ends up.
 */
export function firstSentences(text: string, count: number): string {
  const SENTINEL = String.fromCharCode(0); // null char — never appears in prose
  const sentences = text
    .replace(/([.!?])\s+/g, `$1${SENTINEL}`) // boundary = punctuation + space
    .split(SENTINEL)
    .map((s) => s.trim())
    .filter(Boolean);
  return sentences.slice(0, count).join(" ");
}
