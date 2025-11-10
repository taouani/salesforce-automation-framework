/**
 * Tests for CSS parser
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parseCSSFile } from '../../src/parser/css-parser.js';
import { join } from 'path';
import { writeFile, mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';

describe('CSS Parser', () => {
  const testDir = join(process.cwd(), 'test-temp-css-parser');

  beforeEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  it('should parse CSS custom properties', async () => {
    const css = ':host { --custom-color: red; }';
    const filePath = join(testDir, 'test.css');
    await writeFile(filePath, css, 'utf-8');
    
    const result = await parseCSSFile(filePath);
    expect(result.customProperties).toBeDefined();
    expect(Object.keys(result.customProperties).length).toBeGreaterThan(0);
  });

  it('should parse class selectors', async () => {
    const css = '.my-class { color: blue; }';
    const filePath = join(testDir, 'test.css');
    await writeFile(filePath, css, 'utf-8');
    
    const result = await parseCSSFile(filePath);
    expect(result.selectors).toBeDefined();
    expect(result.selectors.length).toBeGreaterThan(0);
  });

  it('should parse media queries', async () => {
    const css = '@media (max-width: 768px) { .mobile { display: block; } }';
    const filePath = join(testDir, 'test.css');
    await writeFile(filePath, css, 'utf-8');
    
    const result = await parseCSSFile(filePath);
    expect(result.mediaQueries).toBeDefined();
    expect(result.mediaQueries.length).toBeGreaterThan(0);
  });
});

