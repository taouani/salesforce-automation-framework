/**
 * Tests for configuration file generators
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  generatePlaywrightConfig,
  generateTypeScriptConfig,
  generatePackageJson,
  generateEnvExample,
  generateGitignore,
  generateReadme,
} from '../../src/generator/config-generators.js';
import { join } from 'path';
import { existsSync } from 'fs';
import { readFile, rm } from 'fs/promises';

describe('Configuration File Generators', () => {
  const testDir = join(process.cwd(), 'test-temp-config');

  beforeEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
    const { mkdir } = await import('fs/promises');
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  it('should generate Playwright config file', async () => {
    const filePath = join(testDir, 'playwright.config.ts');
    await generatePlaywrightConfig(filePath);
    
    expect(existsSync(filePath)).toBe(true);
    const content = await readFile(filePath, 'utf-8');
    expect(content).toContain('playwright');
    expect(content).toContain('baseURL');
  });

  it('should generate TypeScript config file', async () => {
    const filePath = join(testDir, 'tsconfig.json');
    await generateTypeScriptConfig(filePath);
    
    expect(existsSync(filePath)).toBe(true);
    const content = await readFile(filePath, 'utf-8');
    expect(content).toContain('compilerOptions');
  });

  it('should generate package.json file', async () => {
    const filePath = join(testDir, 'package.json');
    await generatePackageJson(filePath);
    
    expect(existsSync(filePath)).toBe(true);
    const content = await readFile(filePath, 'utf-8');
    const pkg = JSON.parse(content);
    expect(pkg.dependencies).toHaveProperty('@playwright/test');
    expect(pkg.dependencies).toHaveProperty('@faker-js/faker');
  });
});

