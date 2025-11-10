/**
 * Tests for BasePage generator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateBasePage } from '../../src/generator/basepage-generator.js';
import { join } from 'path';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { rm } from 'fs/promises';

describe('BasePage Generator', () => {
  const testDir = join(process.cwd(), 'test-temp-basepage');

  beforeEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
    const { mkdir } = await import('fs/promises');
    await mkdir(join(testDir, 'pages'), { recursive: true });
  });

  afterEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  it('should generate BasePage class file', async () => {
    await generateBasePage(testDir);
    expect(existsSync(join(testDir, 'pages', 'base-page.ts'))).toBe(true);
  });

  it('should generate BasePage with correct structure', async () => {
    await generateBasePage(testDir);
    const content = await readFile(join(testDir, 'pages', 'base-page.ts'), 'utf-8');
    expect(content).toContain('abstract class BasePage');
    expect(content).toContain('goToObject');
    expect(content).toContain('goToRecord');
  });
});

