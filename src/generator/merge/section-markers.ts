/**
 * User-code section markers for merge-safe regeneration.
 *
 * Generated files mark hand-editable regions with paired comment markers:
 *
 *   // <SF-SCANNER:USER-CODE id="setup">
 *   ...user code...
 *   // </SF-SCANNER:USER-CODE>
 *
 * On regeneration, the file generator extracts the inner content of every
 * marked region from the existing file and re-injects it into the freshly
 * rendered output. Blocks dropped from the new output cause the user content
 * to be discarded — that is intentional, otherwise we'd silently leak
 * orphaned code into files where the generator no longer expects it.
 */

export const OPEN = '<SF-SCANNER:USER-CODE';
export const CLOSE = '</SF-SCANNER:USER-CODE>';

const OPEN_RE = /\/\/\s*<SF-SCANNER:USER-CODE\s+id="([^"\n]+)"\s*>/g;
const CLOSE_RE = /\/\/\s*<\/SF-SCANNER:USER-CODE\s*>/g;

export class MarkerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MarkerError';
  }
}

export interface MarkerSection {
  id: string;
  /** Index of the first character of the opening marker line. */
  openStart: number;
  /** Index just past the newline after the opening marker. */
  contentStart: number;
  /** Index of the first character of the closing marker line. */
  contentEnd: number;
  /** Index just past the newline after the closing marker. */
  closeEnd: number;
  /** Inner content (everything strictly between the two marker lines, stripped of trailing newline). */
  content: string;
}

interface RawMarker {
  kind: 'open' | 'close';
  id?: string;
  /** Match start in source. */
  index: number;
  /** Match length. */
  length: number;
}

function findRawMarkers(text: string): RawMarker[] {
  const markers: RawMarker[] = [];

  OPEN_RE.lastIndex = 0;
  for (let m: RegExpExecArray | null; (m = OPEN_RE.exec(text)) !== null; ) {
    markers.push({ kind: 'open', id: m[1], index: m.index, length: m[0].length });
  }

  CLOSE_RE.lastIndex = 0;
  for (let m: RegExpExecArray | null; (m = CLOSE_RE.exec(text)) !== null; ) {
    markers.push({ kind: 'close', index: m.index, length: m[0].length });
  }

  markers.sort((a, b) => a.index - b.index);
  return markers;
}

/**
 * Parses every marker block out of `text`.
 *
 * Throws `MarkerError` on duplicate ids, unbalanced markers, or nested blocks.
 */
export function parseMarkers(text: string): MarkerSection[] {
  const raw = findRawMarkers(text);
  const sections: MarkerSection[] = [];
  const seenIds = new Set<string>();

  let openMarker: RawMarker | null = null;

  for (const marker of raw) {
    if (marker.kind === 'open') {
      if (openMarker) {
        throw new MarkerError(
          `Nested SF-SCANNER:USER-CODE marker (id="${marker.id}") inside an open block (id="${openMarker.id}")`,
        );
      }
      if (seenIds.has(marker.id!)) {
        throw new MarkerError(`Duplicate id "${marker.id}" in SF-SCANNER:USER-CODE markers`);
      }
      seenIds.add(marker.id!);
      openMarker = marker;
    } else {
      if (!openMarker) {
        throw new MarkerError('Found a closing SF-SCANNER:USER-CODE marker without a matching open');
      }
      const openStart = openMarker.index;
      const openEnd = openMarker.index + openMarker.length;
      const contentStart = advancePastEol(text, openEnd);
      // The close marker may be preceded by indentation on its own line.
      // Treat the content as ending at the start of that line so we don't
      // accumulate the close marker's indent into the user-content slice
      // on round trips.
      const closeLineStart = lineStart(text, marker.index);
      const closeEnd = advancePastEol(text, marker.index + marker.length);

      const inner = text.slice(contentStart, closeLineStart);
      sections.push({
        id: openMarker.id!,
        openStart,
        contentStart,
        contentEnd: closeLineStart,
        closeEnd,
        content: stripTrailingNewline(inner),
      });
      openMarker = null;
    }
  }

  if (openMarker) {
    throw new MarkerError(
      `SF-SCANNER:USER-CODE block (id="${openMarker.id}") has no closing marker`,
    );
  }

  return sections;
}

/** Returns a map of id -> inner content extracted from `text`. */
export function extractUserSections(text: string): Map<string, string> {
  const result = new Map<string, string>();
  for (const section of parseMarkers(text)) {
    result.set(section.id, section.content);
  }
  return result;
}

/**
 * Replaces the inner content of each marker block in `generated` with the
 * matching id from `sections`. Blocks not present in `sections` are left
 * untouched. Sections whose id is not in `generated` are silently dropped.
 */
export function injectUserSections(
  generated: string,
  sections: Map<string, string>,
): string {
  if (sections.size === 0) return generated;

  const blocks = parseMarkers(generated);
  if (blocks.length === 0) return generated;

  let output = '';
  let cursor = 0;

  for (const block of blocks) {
    output += generated.slice(cursor, block.contentStart);
    const replacement = sections.get(block.id);
    if (replacement !== undefined) {
      const trimmed = stripTrailingNewline(replacement);
      output += trimmed.length > 0 ? trimmed + '\n' : '';
    } else {
      output += generated.slice(block.contentStart, block.contentEnd);
    }
    cursor = block.contentEnd;
  }

  output += generated.slice(cursor);
  return output;
}

/**
 * Convenience wrapper: extract user sections from `existing` (if any) and
 * inject them into `generated`. Returns `generated` unchanged when there is
 * no existing file or it has no markers.
 */
export function mergeWithExisting(generated: string, existing: string | null): string {
  if (existing == null) return generated;
  const sections = extractUserSections(existing);
  if (sections.size === 0) return generated;
  return injectUserSections(generated, sections);
}

function advancePastEol(text: string, index: number): number {
  if (index >= text.length) return text.length;
  if (text[index] === '\r' && text[index + 1] === '\n') return index + 2;
  if (text[index] === '\n' || text[index] === '\r') return index + 1;
  return index;
}

/** Walks back from `index` to the start of the line it falls on. */
function lineStart(text: string, index: number): number {
  let i = index;
  while (i > 0 && text[i - 1] !== '\n' && text[i - 1] !== '\r') {
    i--;
  }
  return i;
}

function stripTrailingNewline(s: string): string {
  if (s.endsWith('\r\n')) return s.slice(0, -2);
  if (s.endsWith('\n') || s.endsWith('\r')) return s.slice(0, -1);
  return s;
}

/**
 * Renders an empty USER-CODE block. Use this when a generator wants to expose
 * a hand-editable region in its output (e.g. as the trailing line of a test).
 */
export function emptyUserCodeBlock(id: string, indent = ''): string {
  return `${indent}// ${OPEN} id="${id}">\n${indent}// ${CLOSE}`;
}

/**
 * Inserts a USER-CODE block immediately before the final `});` (or `})`) of a
 * Playwright `test(...)` body. Returns the original string unchanged if the
 * pattern isn't found, so callers don't need to special-case malformed input.
 */
export function withUserCodeTail(testBody: string, id: string): string {
  const match = /([ \t]*)(\}\)\s*;?\s*)$/.exec(testBody);
  if (!match) return testBody;
  const closingIndex = match.index;
  const closing = match[0];
  const indent = match[1] + '  ';
  const head = testBody.slice(0, closingIndex).replace(/\s+$/, '');
  return `${head}\n${emptyUserCodeBlock(id, indent)}\n${closing}`;
}
