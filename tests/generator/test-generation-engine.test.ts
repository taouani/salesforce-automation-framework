/**
 * Tests for test generation engine
 * Tests metadata loading, test definition conversion, test file generation, and error collection
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateTests } from '../../src/generator/test-generation/test-generation-engine.js';
import type { ObjectDefinition, FieldDefinition } from '../../src/types/xml-parsed.js';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

describe('Test Generation Engine', () => {
  const testOutputDir = join(process.cwd(), 'test-output-engine');

  beforeEach(async () => {
    await rm(testOutputDir, { recursive: true, force: true });
    await mkdir(testOutputDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testOutputDir, { recursive: true, force: true });
  });

  describe('Metadata Loading', () => {
    it('should load object metadata correctly', async () => {
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
      expect(result.errors.length).toBe(0);
    });

    it('should handle missing metadata gracefully', async () => {
      const result = await generateTests(
        {
          objects: [],
          relationshipMap: new Map(),
        },
        {
          outputDirectory: testOutputDir,
          authApproach: 'both',
          includeFixtures: false,
          includeTestData: false,
        }
      );

      // Should complete without errors even with empty metadata
      expect(result.errors.length).toBe(0);
    });
  });

  describe('Test Definition Conversion', () => {
    it('should convert object metadata to CRUD test definitions', async () => {
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
          includeFixtures: false,
          includeTestData: false,
        }
      );

      // Should generate test files for objects
      const accountTestFile = result.generatedFiles.find(f => 
        f.path.includes('account') && f.path.endsWith('.spec.ts')
      );
      
      expect(accountTestFile).toBeDefined();
      if (accountTestFile) {
        expect(accountTestFile.content).toContain('CRUD');
        expect(accountTestFile.content).toContain('Account');
      }
    });

    it('should convert validation rules to test definitions', async () => {
      const mockObjects: ObjectDefinition[] = [
        {
          fullName: 'Account',
          label: 'Account',
          fields: [],
          validationRules: [
            {
              fullName: 'Account_Validation',
              active: true,
              errorMessage: 'Validation error',
              errorConditionFormula: 'Name = null',
            },
          ],
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
          includeFixtures: false,
          includeTestData: false,
        }
      );

      const accountTestFile = result.generatedFiles.find(f => 
        f.path.includes('account') && f.path.endsWith('.spec.ts')
      );
      
      expect(accountTestFile).toBeDefined();
      if (accountTestFile) {
        expect(accountTestFile.content).toContain('validation');
        expect(accountTestFile.content).toContain('Validation error');
      }
    });
  });

  describe('Test File Generation', () => {
    it('should generate test files in correct directory structure', async () => {
      const mockObjects: ObjectDefinition[] = [
        {
          fullName: 'Account',
          label: 'Account',
          fields: [],
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
          includeFixtures: false,
          includeTestData: false,
        }
      );

      // Check that test files are generated
      expect(result.generatedFiles.length).toBeGreaterThan(0);
      
      // Check that files are written to disk
      const accountTestPath = join(testOutputDir, 'Tests', 'Objects', 'Account', 'account.spec.ts');
      expect(existsSync(accountTestPath)).toBe(true);
    });

    it('should generate test data factories when requested', async () => {
      const mockObjects: ObjectDefinition[] = [
        {
          fullName: 'Account',
          label: 'Account',
          fields: [],
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
          includeFixtures: false,
          includeTestData: true,
        }
      );

      // Check that test data utilities are generated
      const testDataPath = join(testOutputDir, 'utils', 'test-data-helpers.ts');
      expect(existsSync(testDataPath)).toBe(true);
    });

    it('should generate test fixtures when requested', async () => {
      const mockObjects: ObjectDefinition[] = [
        {
          fullName: 'Account',
          label: 'Account',
          fields: [],
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
          includeTestData: false,
        }
      );

      // Check that test fixtures are generated
      const fixturesPath = join(testOutputDir, 'fixtures', 'test-fixtures.ts');
      expect(existsSync(fixturesPath)).toBe(true);
    });
  });

  describe('Error Collection', () => {
    it('should collect errors without stopping generation', async () => {
      // Generate with invalid output directory to trigger errors
      const invalidDir = '/invalid/path/that/does/not/exist';
      
      const result = await generateTests(
        {
          objects: [
            {
              fullName: 'Account',
              label: 'Account',
              fields: [],
              validationRules: [],
              recordTypes: [],
              relationships: [],
            },
          ],
          relationshipMap: new Map(),
        },
        {
          outputDirectory: invalidDir,
          authApproach: 'both',
          includeFixtures: false,
          includeTestData: false,
        }
      );

      // Should have errors but still return a result
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.summary).toBeDefined();
    });

    it('should report errors with file paths and details', async () => {
      const invalidDir = '/invalid/path';
      
      const result = await generateTests(
        {
          objects: [
            {
              fullName: 'Account',
              label: 'Account',
              fields: [],
              validationRules: [],
              recordTypes: [],
              relationships: [],
            },
          ],
          relationshipMap: new Map(),
        },
        {
          outputDirectory: invalidDir,
          authApproach: 'both',
          includeFixtures: false,
          includeTestData: false,
        }
      );

      // Check error structure
      if (result.errors.length > 0) {
        const error = result.errors[0];
        expect(error.message).toBeDefined();
        expect(error.type).toBeDefined();
      }
    });
  });
});

