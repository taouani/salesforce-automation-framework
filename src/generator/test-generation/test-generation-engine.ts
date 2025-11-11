/**
 * Test Generation Engine
 * Orchestrates the generation of all test specifications
 */

import { join } from 'path';
import { logger } from '../../utils/logger.js';
import { renderTemplate } from '../template-engine.js';
import { readTemplate } from '../template-loader.js';
import { writeGeneratedFile } from '../file-generator.js';
import type {
  TestGenerationResult,
  TestGroupDefinition,
  GeneratedTestFileDefinition,
  TestGenerationError,
} from '../../types/test-generation.js';
import type { ObjectDefinition } from '../../types/xml-parsed.js';
import type { LWCComponentDefinition } from '../../types/lwc-parsed.js';
import type { AuraComponentDefinition } from '../../types/aura-parsed.js';
import type { FlowDefinition } from '../../types/flow-parsed.js';
import { generateCRUDTestGroup } from '../test-specs/crud-test-generator.js';
import { generateValidationRuleTestGroup } from '../test-specs/validation-rule-test-generator.js';
import { generateRecordTypeTestGroup } from '../test-specs/record-type-test-generator.js';
import { generateFieldValidationTestGroup } from '../test-specs/field-validation-test-generator.js';
import { generateRelationshipTestGroup } from '../test-specs/relationship-test-generator.js';
import { generateTestDataUtilitiesFile } from '../test-data/test-data-utilities-generator.js';
import { generateTestFixturesFile } from '../test-fixtures/test-fixtures-generator.js';
import { generateAuthenticationConfig } from '../test-data/authentication-config-generator.js';
import { generateSalesforceAPIClientFile } from '../test-data/salesforce-api-client-generator.js';
import { generateAllDocumentation } from './documentation-generator.js';

export interface TestGenerationMetadata {
  objects?: ObjectDefinition[];
  lwcComponents?: LWCComponentDefinition[];
  auraComponents?: AuraComponentDefinition[];
  flows?: FlowDefinition[];
  relationshipMap?: Map<string, Array<{ fieldName: string; type: 'MasterDetail' | 'Lookup'; relatedObject: string }>>;
}

export interface TestGenerationOptions {
  outputDirectory: string;
  authApproach?: 'helpers' | 'configuredConnection' | 'both';
  includeFixtures?: boolean;
  includeTestData?: boolean;
}

/**
 * Main test generation engine
 */
export async function generateTests(
  metadata: TestGenerationMetadata,
  options: TestGenerationOptions
): Promise<TestGenerationResult> {
  const errors: TestGenerationError[] = [];
  const warnings: string[] = [];
  const generatedFiles: GeneratedTestFileDefinition[] = [];
  const generatedFactories: GeneratedTestFileDefinition[] = [];
  const generatedFixtures: GeneratedTestFileDefinition[] = [];

  try {
    logger.info({ outputDirectory: options.outputDirectory }, 'Starting test generation');

    // Generate test data utilities
    if (options.includeTestData !== false && metadata.objects) {
      try {
        // Generate Salesforce API client first (required by test data utilities)
        await generateSalesforceAPIClientFile(options.outputDirectory);
        
        const relationshipMap = metadata.relationshipMap || new Map();
        const factoryPath = await generateTestDataUtilitiesFile(
          options.outputDirectory,
          metadata.objects,
          relationshipMap
        );
        generatedFactories.push({
          path: factoryPath,
          content: '',
          type: 'factory',
        });
      } catch (error) {
        errors.push({
          message: `Failed to generate test data utilities: ${error instanceof Error ? error.message : String(error)}`,
          type: 'generation',
          cause: error instanceof Error ? error : undefined,
        });
      }
    }

    // Generate authentication config
    try {
      await generateAuthenticationConfig(
        options.outputDirectory,
        options.authApproach || 'both'
      );
    } catch (error) {
      warnings.push(`Failed to generate authentication config: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Generate test fixtures
    if (options.includeFixtures !== false) {
      try {
        const fixturePath = await generateTestFixturesFile(options.outputDirectory);
        generatedFixtures.push({
          path: fixturePath,
          content: '',
          type: 'fixture',
        });
      } catch (error) {
        errors.push({
          message: `Failed to generate test fixtures: ${error instanceof Error ? error.message : String(error)}`,
          type: 'generation',
        });
      }
    }

    // Generate test files for objects
    if (metadata.objects) {
      for (const objectDef of metadata.objects) {
        try {
          const testFile = await generateObjectTestFile(objectDef, metadata, options);
          generatedFiles.push({
            path: testFile.path,
            content: testFile.content,
            type: 'test',
            objectName: objectDef.fullName,
          });
        } catch (error) {
          errors.push({
            file: objectDef.fullName,
            message: `Failed to generate test file: ${error instanceof Error ? error.message : String(error)}`,
            type: 'generation',
            cause: error instanceof Error ? error : undefined,
          });
        }
      }
    }

    // Generate documentation
    try {
      await generateAllDocumentation(options.outputDirectory);
    } catch (error) {
      warnings.push(`Failed to generate documentation: ${error instanceof Error ? error.message : String(error)}`);
    }

    const summary = {
      totalFiles: generatedFiles.length + generatedFactories.length + generatedFixtures.length,
      successfulFiles: generatedFiles.length + generatedFactories.length + generatedFixtures.length - errors.length,
      failedFiles: errors.length,
      totalErrors: errors.length,
      totalWarnings: warnings.length,
    };

    logger.info(summary, 'Test generation completed');

    return {
      generatedFiles,
      generatedFactories,
      generatedFixtures,
      errors,
      warnings,
      summary,
    };
  } catch (error) {
    logger.error({ error }, 'Test generation failed');
    throw error;
  }
}

/**
 * Generates a test file for an object
 */
async function generateObjectTestFile(
  objectDef: ObjectDefinition,
  metadata: TestGenerationMetadata,
  options: TestGenerationOptions
): Promise<{ path: string; content: string }> {
  const testGroups: TestGroupDefinition[] = [];

  // Generate CRUD tests
  testGroups.push(generateCRUDTestGroup(objectDef));

  // Generate validation rule tests
  if (objectDef.validationRules && objectDef.validationRules.length > 0) {
    testGroups.push(generateValidationRuleTestGroup(objectDef, objectDef.validationRules));
  }

  // Generate record type tests
  if (objectDef.recordTypes && objectDef.recordTypes.length > 0) {
    testGroups.push(generateRecordTypeTestGroup(objectDef, objectDef.recordTypes));
  }

  // Generate field validation tests
  if (objectDef.fields && objectDef.fields.length > 0) {
    testGroups.push(generateFieldValidationTestGroup(objectDef, objectDef.fields));
  }

  // Generate relationship tests
  if (objectDef.relationships && objectDef.relationships.length > 0) {
    // Create a set of available object names for filtering relationships
    const availableObjects: Set<string> | undefined = metadata.objects && Array.isArray(metadata.objects)
      ? new Set(metadata.objects.map((obj: any) => String(obj.fullName || '')))
      : undefined;
    testGroups.push(generateRelationshipTestGroup(objectDef, objectDef.relationships, availableObjects));
  }

  // Render template
  const template = await readTemplate('test/object-test.hbs');
  // Generate page object file name (e.g., AccountPage -> account-page)
  const pageObjectClassName = `${objectDef.fullName}Page`;
  const pageObjectFileName = `${pageObjectClassName.charAt(0).toLowerCase() + pageObjectClassName.slice(1).replace('Page', '-page')}`;
  const content = renderTemplate(template, {
    objectName: objectDef.fullName,
    pageObjectName: pageObjectClassName,
    pageObjectFileName: pageObjectFileName,
    pageObjectImport: true,
    testGroups,
  });

  const filePath = join(options.outputDirectory, 'tests', `${objectDef.fullName.toLowerCase()}.spec.ts`);
  await writeGeneratedFile(filePath, content, { format: true, fileType: 'typescript' });

  return { path: filePath, content };
}

