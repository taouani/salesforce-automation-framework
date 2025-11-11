/**
 * Tests for test data utilities generator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { generateTestDataUtilitiesFile } from '../../src/generator/test-data/test-data-utilities-generator.js';
import type { ObjectDefinition, FieldDefinition } from '../../src/types/xml-parsed.js';

describe('Test Data Utilities Generator', () => {
  const testOutputDir = join(process.cwd(), 'test-output-utilities');

  beforeEach(async () => {
    // Clean up before each test
    await rm(testOutputDir, { recursive: true, force: true });
    await mkdir(join(testOutputDir, 'utils'), { recursive: true });
  });

  afterEach(async () => {
    // Clean up after each test
    await rm(testOutputDir, { recursive: true, force: true });
  });

  it('should generate test data utilities file', async () => {
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

    const relationshipMap = new Map<string, Array<{ fieldName: string; type: 'MasterDetail' | 'Lookup'; relatedObject: string }>>();
    
    const filePath = await generateTestDataUtilitiesFile(testOutputDir, mockObjects, relationshipMap);
    
    expect(filePath).toContain('test-data-helpers.ts');
    expect(filePath).toContain('utils');
  });
});

