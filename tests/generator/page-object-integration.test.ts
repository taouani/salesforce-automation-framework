/**
 * Integration tests for Page Object Model Generator
 * Tests end-to-end generation workflow
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { generatePageObjects } from '../../src/generator/page-object/generation-engine.js';
import type { GenerationConfig } from '../../src/types/page-object.js';
import type { ObjectDefinition } from '../../types/xml-parsed.js';

describe('Page Object Model Generator Integration', () => {
  const testOutputDir = join(process.cwd(), 'test-output-integration');

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

  it('should generate base page object classes', async () => {
    const config: GenerationConfig = {
      outputDirectory: testOutputDir,
    };

    const result = await generatePageObjects(config, {});

    expect(result.generatedFiles.length).toBeGreaterThan(0);
    expect(result.errors.length).toBe(0);
    
    // Check that base classes were generated
    const baseObjectPagePath = join(testOutputDir, 'pages', 'base', 'base-object-page.ts');
    const baseLightningPagePath = join(testOutputDir, 'pages', 'base', 'base-lightning-page.ts');
    const baseComponentPagePath = join(testOutputDir, 'pages', 'base', 'base-component-page.ts');
    const baseFlowScreenPath = join(testOutputDir, 'pages', 'base', 'base-flow-screen.ts');

    expect(existsSync(baseObjectPagePath)).toBe(true);
    expect(existsSync(baseLightningPagePath)).toBe(true);
    expect(existsSync(baseComponentPagePath)).toBe(true);
    expect(existsSync(baseFlowScreenPath)).toBe(true);
  });

  it('should generate object page objects from metadata', async () => {
    const config: GenerationConfig = {
      outputDirectory: testOutputDir,
    };

    const testObject: ObjectDefinition = {
      fullName: 'TestObject__c',
      label: 'Test Object',
      fields: [
        {
          fullName: 'Name',
          label: 'Name',
          type: 'String',
          required: true,
        },
      ],
      validationRules: [],
      recordTypes: [],
      relationships: [],
    };

    const result = await generatePageObjects(config, {
      objects: [testObject],
    });

    expect(result.generatedFiles.length).toBeGreaterThan(4); // Base classes + object page
    expect(result.errors.length).toBe(0);
    
    // Check that object page was generated
    const objectPagePath = join(testOutputDir, 'pages', 'objects', 'testObject__c-page.ts');
    expect(existsSync(objectPagePath)).toBe(true);
  });

  it('should handle missing metadata gracefully', async () => {
    const config: GenerationConfig = {
      outputDirectory: testOutputDir,
    };

    const result = await generatePageObjects(config, {});

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.errors.length).toBe(0);
    expect(result.generatedFiles.length).toBe(4); // Only base classes
  });
});

