/**
 * Tests for folder structure generator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateFolderStructure } from '../../src/generator/folder-structure.js';
import { join } from 'path';
import { existsSync } from 'fs';
import { readdir, rm } from 'fs/promises';

describe('Folder Structure Generator', () => {
  const testDir = join(process.cwd(), 'test-temp-structure');

  beforeEach(async () => {
    // Clean up test directory
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  afterEach(async () => {
    // Clean up test directory
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  it('should create all required folders', async () => {
    await generateFolderStructure(testDir, { force: false });
    
    const dirs = await readdir(testDir);
    expect(dirs).toContain('pages');
    expect(dirs).toContain('tests');
    expect(dirs).toContain('config');
    expect(dirs).toContain('utils');
    expect(dirs).toContain('models');
    expect(dirs).toContain('fixtures');
  });

  it('should create parent directories if needed', async () => {
    const nestedPath = join(testDir, 'nested', 'deep', 'structure');
    await generateFolderStructure(nestedPath, { force: false });
    
    expect(existsSync(join(nestedPath, 'pages'))).toBe(true);
  });

  it('should overwrite existing directories with force flag', async () => {
    // Create initial structure
    await generateFolderStructure(testDir, { force: false });
    
    // Create a file in one of the directories
    const testFile = join(testDir, 'pages', 'test.txt');
    const { writeFile } = await import('fs/promises');
    await writeFile(testFile, 'test');
    
    // Regenerate with force flag
    await generateFolderStructure(testDir, { force: true });
    
    // Verify structure still exists
    expect(existsSync(join(testDir, 'pages'))).toBe(true);
  });
});

