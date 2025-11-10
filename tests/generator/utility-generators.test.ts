/**
 * Tests for utility function generators
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  generateLoginHelpers,
  generateWaitUtilities,
  generateTestDataHelpers,
  generateScreenshotUtilities,
  generateAdditionalUtilities,
} from '../../src/generator/utility-generators.js';
import { join } from 'path';
import { existsSync } from 'fs';
import { rm } from 'fs/promises';

describe('Utility Generators', () => {
  const testDir = join(process.cwd(), 'test-temp-utils');

  beforeEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
    const { mkdir } = await import('fs/promises');
    await mkdir(join(testDir, 'utils'), { recursive: true });
  });

  afterEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  it('should generate login helpers file', async () => {
    await generateLoginHelpers(testDir);
    expect(existsSync(join(testDir, 'utils', 'login-helpers.ts'))).toBe(true);
  });

  it('should generate wait utilities file', async () => {
    await generateWaitUtilities(testDir);
    expect(existsSync(join(testDir, 'utils', 'wait-utilities.ts'))).toBe(true);
  });

  it('should generate test data helpers file', async () => {
    await generateTestDataHelpers(testDir);
    expect(existsSync(join(testDir, 'utils', 'test-data-helpers.ts'))).toBe(true);
  });
});

