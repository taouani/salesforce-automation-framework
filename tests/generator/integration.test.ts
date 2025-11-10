/**
 * Integration tests for test structure generator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateTestStructure } from '../../src/generator/index.js';
import { join } from 'path';
import { existsSync } from 'fs';
import { readFile, readdir, rm } from 'fs/promises';

describe('Test Structure Generator Integration', () => {
  const testDir = join(process.cwd(), 'test-temp-integration');

  beforeEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  afterEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  it('should generate complete test structure end-to-end', async () => {
    await generateTestStructure({
      outputPath: testDir,
      force: false,
      projectName: 'test-project',
    });

    // Verify folder structure
    const dirs = await readdir(testDir);
    expect(dirs).toContain('pages');
    expect(dirs).toContain('tests');
    expect(dirs).toContain('config');
    expect(dirs).toContain('utils');
    expect(dirs).toContain('models');
    expect(dirs).toContain('fixtures');

    // Verify config files
    expect(existsSync(join(testDir, 'playwright.config.ts'))).toBe(true);
    expect(existsSync(join(testDir, 'tsconfig.json'))).toBe(true);
    expect(existsSync(join(testDir, 'package.json'))).toBe(true);
    expect(existsSync(join(testDir, '.env.example'))).toBe(true);
    expect(existsSync(join(testDir, '.gitignore'))).toBe(true);
    expect(existsSync(join(testDir, 'README.md'))).toBe(true);

    // Verify utility files
    expect(existsSync(join(testDir, 'utils', 'login-helpers.ts'))).toBe(true);
    expect(existsSync(join(testDir, 'utils', 'wait-utilities.ts'))).toBe(true);
    expect(existsSync(join(testDir, 'utils', 'test-data-helpers.ts'))).toBe(true);
    expect(existsSync(join(testDir, 'utils', 'screenshot-utilities.ts'))).toBe(true);
    expect(existsSync(join(testDir, 'utils', 'additional-utilities.ts'))).toBe(true);

    // Verify BasePage
    expect(existsSync(join(testDir, 'pages', 'base-page.ts'))).toBe(true);
  });

  it('should generate properly formatted code', async () => {
    await generateTestStructure({
      outputPath: testDir,
      force: false,
      projectName: 'test-project',
    });

    // Check that TypeScript files are properly formatted
    const basePageContent = await readFile(join(testDir, 'pages', 'base-page.ts'), 'utf-8');
    expect(basePageContent).toContain('export abstract class BasePage');
    expect(basePageContent).toContain('/**');
  });

  it('should work with force flag', async () => {
    // Generate first time
    await generateTestStructure({
      outputPath: testDir,
      force: false,
    });

    // Generate again with force flag
    await generateTestStructure({
      outputPath: testDir,
      force: true,
    });

    // Verify structure still exists
    expect(existsSync(join(testDir, 'pages'))).toBe(true);
  });
});

