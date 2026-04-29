import { describe, it, expect } from 'vitest';
import {
  extractUserSections,
  injectUserSections,
  mergeWithExisting,
  parseMarkers,
  MarkerError,
  OPEN,
  CLOSE,
} from '../../../src/generator/merge/section-markers.js';

const open = (id: string) => `// ${OPEN} id="${id}">`;
const close = `// ${CLOSE}`;

describe('parseMarkers', () => {
  it('returns an empty list when no markers are present', () => {
    expect(parseMarkers('const x = 1;\n')).toEqual([]);
  });

  it('parses a single marker block', () => {
    const text = `before\n${open('a')}\nuser\n${close}\nafter\n`;
    const result = parseMarkers(text);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a');
    expect(result[0].content).toBe('user');
  });

  it('parses multiple sibling marker blocks', () => {
    const text = `${open('a')}\nA\n${close}\n${open('b')}\nB\n${close}\n`;
    const result = parseMarkers(text);
    expect(result.map((s) => s.id)).toEqual(['a', 'b']);
    expect(result.map((s) => s.content)).toEqual(['A', 'B']);
  });

  it('throws on duplicate ids', () => {
    const text = `${open('dup')}\n${close}\n${open('dup')}\n${close}`;
    expect(() => parseMarkers(text)).toThrow(MarkerError);
    expect(() => parseMarkers(text)).toThrow(/duplicate id "dup"/i);
  });

  it('throws on an open marker without a close', () => {
    const text = `${open('a')}\nuser\n`;
    expect(() => parseMarkers(text)).toThrow(MarkerError);
    expect(() => parseMarkers(text)).toThrow(/no closing/i);
  });

  it('throws on a close marker without an open', () => {
    const text = `\n${close}\n`;
    expect(() => parseMarkers(text)).toThrow(MarkerError);
    expect(() => parseMarkers(text)).toThrow(/closing.*without/i);
  });

  it('throws on nested markers', () => {
    const text = `${open('outer')}\n${open('inner')}\n${close}\n${close}`;
    expect(() => parseMarkers(text)).toThrow(MarkerError);
    expect(() => parseMarkers(text)).toThrow(/nested/i);
  });
});

describe('extractUserSections', () => {
  it('returns an empty map for content without markers', () => {
    expect(extractUserSections('no markers here')).toEqual(new Map());
  });

  it('extracts ids and their inner content', () => {
    const text = `${open('imports')}\nimport foo from "bar";\n${close}\n${open('setup')}\nawait login();\n${close}\n`;
    const sections = extractUserSections(text);
    expect(sections.get('imports')).toBe('import foo from "bar";');
    expect(sections.get('setup')).toBe('await login();');
  });

  it('preserves indentation inside the block', () => {
    const text = `${open('a')}\n  // indented\n  const x = 1;\n${close}\n`;
    expect(extractUserSections(text).get('a')).toBe('  // indented\n  const x = 1;');
  });
});

describe('injectUserSections', () => {
  it('returns generated content unchanged when no sections are provided', () => {
    const generated = `${open('a')}\n${close}\n`;
    expect(injectUserSections(generated, new Map())).toBe(generated);
  });

  it('injects user content into matching block ids', () => {
    const generated = `${open('a')}\n${close}\n`;
    const result = injectUserSections(generated, new Map([['a', 'USER']]));
    expect(result).toBe(`${open('a')}\nUSER\n${close}\n`);
  });

  it('replaces any existing inner content', () => {
    const generated = `${open('a')}\nplaceholder\n${close}\n`;
    const result = injectUserSections(generated, new Map([['a', 'USER']]));
    expect(result).toBe(`${open('a')}\nUSER\n${close}\n`);
  });

  it('ignores user sections whose id is not in the generated output', () => {
    const generated = `${open('a')}\n${close}\n`;
    const result = injectUserSections(
      generated,
      new Map([
        ['a', 'A'],
        ['removed', 'orphan'],
      ]),
    );
    expect(result).toBe(`${open('a')}\nA\n${close}\n`);
    expect(result).not.toContain('orphan');
  });
});

describe('mergeWithExisting', () => {
  it('returns generated content unchanged when existing is null', () => {
    const generated = `${open('a')}\n${close}\n`;
    expect(mergeWithExisting(generated, null)).toBe(generated);
  });

  it('preserves user code across regenerations', () => {
    const v1 = `${open('imports')}\n${close}\n${open('setup')}\n${close}\n`;
    const userEdited = `${open('imports')}\nimport "x";\n${close}\n${open('setup')}\nawait login();\n${close}\n`;
    const v2 = `${open('imports')}\n${close}\n${open('setup')}\n${close}\n`;
    const merged = mergeWithExisting(v2, userEdited);
    expect(merged).toContain('import "x";');
    expect(merged).toContain('await login();');
  });

  it('survives a no-op regeneration (existing already has user content)', () => {
    const generated = `${open('a')}\nuser\n${close}\n`;
    const existing = `${open('a')}\nuser\n${close}\n`;
    expect(mergeWithExisting(generated, existing)).toBe(existing);
  });

  it('does not preserve user content for blocks dropped from generated output', () => {
    const existing = `${open('removed')}\nuser\n${close}\n`;
    const generated = `// no markers\n`;
    const merged = mergeWithExisting(generated, existing);
    expect(merged).toBe(generated);
  });

  it('throws on malformed existing content (better to fail loudly)', () => {
    const existing = `${open('a')}\n`;
    const generated = `${open('a')}\n${close}\n`;
    expect(() => mergeWithExisting(generated, existing)).toThrow(MarkerError);
  });
});
