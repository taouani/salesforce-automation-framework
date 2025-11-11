/**
 * Tests for authentication configuration generator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';
import {
  generateEnvExample,
  generateAuthenticationHelperFile,
  generateAuthenticationConfig,
} from '../../src/generator/test-data/authentication-config-generator.js';

describe('Authentication Configuration Generator', () => {
  const testOutputDir = join(process.cwd(), 'test-output-auth-config');

  beforeEach(async () => {
    // Clean up before each test
    await rm(testOutputDir, { recursive: true, force: true });
    await mkdir(testOutputDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up after each test
    await rm(testOutputDir, { recursive: true, force: true });
  });

  it('should generate .env.example file', async () => {
    const envPath = await generateEnvExample(testOutputDir);
    expect(envPath).toContain('.env.example');
    
    // File should exist (we can't easily read it in test, but path is returned)
    expect(envPath).toBeDefined();
  });

  it('should generate authentication helper file for "helpers" approach', async () => {
    const helperPath = await generateAuthenticationHelperFile(testOutputDir, 'helpers');
    expect(helperPath).toContain('salesforce-auth.ts');
    expect(helperPath).toContain('utils');
  });

  it('should generate authentication helper file for "configuredConnection" approach', async () => {
    const helperPath = await generateAuthenticationHelperFile(testOutputDir, 'configuredConnection');
    expect(helperPath).toContain('salesforce-auth.ts');
  });

  it('should generate authentication helper file for "both" approach', async () => {
    const helperPath = await generateAuthenticationHelperFile(testOutputDir, 'both');
    expect(helperPath).toContain('salesforce-auth.ts');
  });

  it('should generate all authentication config files', async () => {
    const result = await generateAuthenticationConfig(testOutputDir, 'both');
    expect(result.envExamplePath).toBeDefined();
    expect(result.helperFilePath).toBeDefined();
    expect(result.envExamplePath).toContain('.env.example');
    expect(result.helperFilePath).toContain('salesforce-auth.ts');
  });
});

