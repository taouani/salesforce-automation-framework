/**
 * Integration tests for test generation
 * Tests end-to-end test generation with real metadata
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateTests } from '../../src/generator/test-generation/test-generation-engine.js';
import type { ObjectDefinition, FieldDefinition } from '../../src/types/xml-parsed.js';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';

describe('Test Generation Integration', () => {
  const testOutputDir = join(process.cwd(), 'test-output-integration');

  beforeEach(async () => {
    // Clean up before each test
    await rm(testOutputDir, { recursive: true, force: true });
    await mkdir(testOutputDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up after each test
    await rm(testOutputDir, { recursive: true, force: true });
  });

  it('should generate tests for objects', async () => {
    const mockObjects: ObjectDefinition[] = [
      {
        fullName: 'Account',
        label: 'Account',
        fields: [
          {
            fullName: 'Name',
            type: 'String',
            label: 'Account Name',
            required: true,
          } as FieldDefinition,
        ],
        validationRules: [],
        recordTypes: [],
        relationships: [],
      },
    ];

    const result = await generateTests(
      {
        objects: mockObjects,
        relationshipMap: new Map(),
      },
      {
        outputDirectory: testOutputDir,
        authApproach: 'both',
        includeFixtures: true,
        includeTestData: true,
      }
    );

    expect(result.generatedFiles.length).toBeGreaterThan(0);
    expect(result.summary.totalFiles).toBeGreaterThan(0);
    expect(result.errors.length).toBe(0);
  });
});

