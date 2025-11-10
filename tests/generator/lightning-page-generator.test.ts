/**
 * Tests for Lightning page object generator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { generateLightningPageObject } from '../../src/generator/page-object/lightning-page-generator.js';
import type { LightningPageDefinition } from '../../src/types/page-object.js';

describe('Lightning Page Object Generator', () => {
  const testOutputDir = join(process.cwd(), 'test-output-lightning-pages');

  beforeEach(async () => {
    if (existsSync(testOutputDir)) {
      await rm(testOutputDir, { recursive: true });
    }
    await mkdir(testOutputDir, { recursive: true });
  });

  afterEach(async () => {
    if (existsSync(testOutputDir)) {
      await rm(testOutputDir, { recursive: true });
    }
  });

  it('should generate Lightning page object class', async () => {
    const definition: LightningPageDefinition = {
      name: 'AccountRecordPage',
      type: 'Lightning',
      pageName: 'Account_Record_Page',
      pageType: 'Record',
      locators: [],
      methods: [],
    };

    const filePath = await generateLightningPageObject(testOutputDir, definition);

    expect(existsSync(filePath)).toBe(true);
  });
});

