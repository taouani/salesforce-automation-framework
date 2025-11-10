/**
 * Tests for Aura CSS parser
 */

import { describe, it, expect } from 'vitest';
import { parseAuraCSSFile } from '../../src/parser/aura-css-parser.js';
import { join } from 'path';
import { writeFile, mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';

describe('Aura CSS Parser', () => {
  const testDir = join(process.cwd(), 'test-temp-aura-css');

  beforeAll(async () => {
    if (!existsSync(testDir)) {
      await mkdir(testDir, { recursive: true });
    }
  });

  afterAll(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  it('should parse CSS file and extract selectors', async () => {
    const testFile = join(testDir, 'TestComponent.css');
    const css = `
.THIS .my-class {
  color: red;
  display: block;
}

.THIS .hidden {
  display: none;
}`;

    await writeFile(testFile, css, 'utf-8');

    const result = await parseAuraCSSFile(testFile);

    expect(result.selectors).toBeDefined();
    expect(Array.isArray(result.selectors)).toBe(true);
    expect(result.selectors.length).toBeGreaterThan(0);
  });

  it('should extract CSS custom properties', async () => {
    const testFile = join(testDir, 'TestComponent2.css');
    const css = `
:root {
  --primary-color: #0070d2;
  --secondary-color: #16325c;
}`;

    await writeFile(testFile, css, 'utf-8');

    const result = await parseAuraCSSFile(testFile);

    expect(result.customProperties).toBeDefined();
    expect(Object.keys(result.customProperties).length).toBeGreaterThan(0);
  });

  it('should extract media queries', async () => {
    const testFile = join(testDir, 'TestComponent3.css');
    const css = `
@media (max-width: 768px) {
  .THIS .responsive {
    width: 100%;
  }
}`;

    await writeFile(testFile, css, 'utf-8');

    const result = await parseAuraCSSFile(testFile);

    expect(result.mediaQueries).toBeDefined();
    expect(Array.isArray(result.mediaQueries)).toBe(true);
  });
});

