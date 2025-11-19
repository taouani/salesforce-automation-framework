/**
 * Test Generation Engine
 * Orchestrates the generation of all test specifications
 */

import { join } from 'path';
import { mkdir } from 'fs/promises';
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
import { generateComponentTestGroup } from '../test-specs/component-test-generator.js';
import { generateFlowTestGroup } from '../test-specs/flow-test-generator.js';
import { generateTestDataUtilitiesFile } from '../test-data/test-data-utilities-generator.js';
import { generateTestFixturesFile } from '../test-fixtures/test-fixtures-generator.js';
import { generateAuthenticationConfig } from '../test-data/authentication-config-generator.js';
import { generateSalesforceAPIClientFile } from '../test-data/salesforce-api-client-generator.js';
import { generateAllDocumentation } from './documentation-generator.js';
import { generatePackageJson, generateTypeScriptConfig, generatePlaywrightConfig } from '../config-generators.js';
import { generateAllUtilities } from '../utility-generators.js';
import { 
  generatePageObjectClassName, 
  generateFileNameFromClassName, 
  sanitizeClassName,
  generateTestDataFactoryFunctionName,
  generateDeleteFunctionName
} from '../name-sanitizer.js';

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

    // Generate project configuration files (package.json, tsconfig.json, playwright.config.ts)
    try {
      await generatePackageJson(join(options.outputDirectory, 'package.json'), 'salesforce-test-project');
      await generateTypeScriptConfig(join(options.outputDirectory, 'tsconfig.json'));
      await generatePlaywrightConfig(join(options.outputDirectory, 'playwright.config.ts'));
      // Generate utility files (wait-utilities, etc.)
      await generateAllUtilities(options.outputDirectory);
      logger.info({ outputDirectory: options.outputDirectory }, 'Generated project configuration files');
    } catch (error) {
      warnings.push(`Failed to generate project configuration: ${error instanceof Error ? error.message : String(error)}`);
    }

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

    // Generate test files for LWC components
    if (metadata.lwcComponents && Array.isArray(metadata.lwcComponents)) {
      for (const componentDef of metadata.lwcComponents) {
        try {
          const testFile = await generateComponentTestFile(componentDef, 'LWC', options);
          generatedFiles.push({
            path: testFile.path,
            content: testFile.content,
            type: 'test',
            componentName: String(componentDef.name || 'Unknown'),
          });
        } catch (error) {
          errors.push({
            file: String(componentDef.name || 'Unknown'),
            message: `Failed to generate LWC component test file: ${error instanceof Error ? error.message : String(error)}`,
            type: 'generation',
            cause: error instanceof Error ? error : undefined,
          });
        }
      }
    }

    // Generate test files for Aura components
    if (metadata.auraComponents && Array.isArray(metadata.auraComponents)) {
      for (const componentDef of metadata.auraComponents) {
        try {
          const testFile = await generateComponentTestFile(componentDef, 'Aura', options);
          generatedFiles.push({
            path: testFile.path,
            content: testFile.content,
            type: 'test',
            componentName: String(componentDef.metadata?.name || 'Unknown'),
          });
        } catch (error) {
          errors.push({
            file: String(componentDef.metadata?.name || 'Unknown'),
            message: `Failed to generate Aura component test file: ${error instanceof Error ? error.message : String(error)}`,
            type: 'generation',
            cause: error instanceof Error ? error : undefined,
          });
        }
      }
    }

    // Generate test files for flows
    if (metadata.flows && Array.isArray(metadata.flows)) {
      for (const flowDef of metadata.flows) {
        try {
          const testFile = await generateFlowTestFile(flowDef, options);
          generatedFiles.push({
            path: testFile.path,
            content: testFile.content,
            type: 'test',
            flowName: String(flowDef.fullName || 'Unknown'),
          });
        } catch (error) {
          errors.push({
            file: String(flowDef.fullName || 'Unknown'),
            message: `Failed to generate flow test file: ${error instanceof Error ? error.message : String(error)}`,
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error({ error: errorMessage, stack: errorStack }, 'Test generation failed');
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

  // Generate sanitized names for consistent usage
  const pageObjectClassName = generatePageObjectClassName(objectDef.fullName);
  const createFunctionName = generateTestDataFactoryFunctionName(objectDef.fullName);
  const deleteFunctionName = generateDeleteFunctionName(objectDef.fullName);
  
  const sanitizedNames = {
    pageObjectClassName,
    createFunctionName,
    deleteFunctionName,
  };
  
  // Generate CRUD tests
  testGroups.push(generateCRUDTestGroup(objectDef, sanitizedNames));

  // Generate validation rule tests
  if (objectDef.validationRules && objectDef.validationRules.length > 0) {
    testGroups.push(generateValidationRuleTestGroup(objectDef, objectDef.validationRules, sanitizedNames));
  }

  // Generate record type tests
  if (objectDef.recordTypes && objectDef.recordTypes.length > 0) {
    testGroups.push(generateRecordTypeTestGroup(objectDef, objectDef.recordTypes, sanitizedNames));
  }

  // Generate field validation tests
  if (objectDef.fields && objectDef.fields.length > 0) {
    testGroups.push(generateFieldValidationTestGroup(objectDef, objectDef.fields, sanitizedNames));
  }

  // Generate relationship tests
  const relatedPageObjects: Set<string> = new Set();
  const relatedObjectSanitizedNames = new Map<string, {
    pageObjectClassName: string;
    createFunctionName: string;
    deleteFunctionName: string;
  }>();
  
  if (objectDef.relationships && objectDef.relationships.length > 0) {
    // Create a set of available object names for filtering relationships
    const availableObjects: Set<string> | undefined = metadata.objects && Array.isArray(metadata.objects)
      ? new Set(metadata.objects.map((obj: any) => String(obj.fullName || '')))
      : undefined;
    
    // Pre-generate sanitized names for all related objects
    if (availableObjects) {
      for (const relationship of objectDef.relationships) {
        if (availableObjects.has(relationship.relatedObject)) {
          relatedPageObjects.add(relationship.relatedObject);
          if (!relatedObjectSanitizedNames.has(relationship.relatedObject)) {
            relatedObjectSanitizedNames.set(relationship.relatedObject, {
              pageObjectClassName: generatePageObjectClassName(relationship.relatedObject),
              createFunctionName: generateTestDataFactoryFunctionName(relationship.relatedObject),
              deleteFunctionName: generateDeleteFunctionName(relationship.relatedObject),
            });
          }
        }
      }
    }
    
    const relationshipTestGroup = generateRelationshipTestGroup(
      objectDef, 
      objectDef.relationships, 
      availableObjects,
      sanitizedNames,
      relatedObjectSanitizedNames
    );
    testGroups.push(relationshipTestGroup);
  }

  // Render template
  const template = await readTemplate('test/object-test.hbs');
  // Generate page object file name (e.g., AccountPage -> account-page)
  // Reuse pageObjectClassName from sanitizedNames above
  const pageObjectFileName = generateFileNameFromClassName(pageObjectClassName, '-page');
  
  // Generate additional imports for related page objects (exclude the main object)
  const additionalImports: Array<{ className: string; fileName: string }> = [];
  for (const relatedObject of relatedPageObjects) {
    // Don't import the main object's page object again
    if (relatedObject !== objectDef.fullName) {
      const relatedClassName = generatePageObjectClassName(relatedObject);
      const relatedFileName = generateFileNameFromClassName(relatedClassName, '-page');
      additionalImports.push({ className: relatedClassName, fileName: relatedFileName });
    }
  }
  
  const content = renderTemplate(template, {
    objectName: objectDef.fullName,
    pageObjectName: pageObjectClassName,
    pageObjectFileName: pageObjectFileName,
    pageObjectImport: true,
    additionalImports,
    testGroups,
    relativePath: '../../../', // Tests/Objects/ObjectName/ -> 3 levels up
  });

  // Organize tests by object: Tests/Objects/ObjectName/object-name.spec.ts
  // Use sanitized object name for directory and file names (lowercase for consistency)
  const sanitizedObjectName = sanitizeClassName(objectDef.fullName);
  const objectTestDirName = generateFileNameFromClassName(sanitizedObjectName, ''); // Use lowercase for directory name
  const objectTestDir = join(options.outputDirectory, 'Tests', 'Objects', objectTestDirName);
  await mkdir(objectTestDir, { recursive: true });
  const fileName = generateFileNameFromClassName(sanitizedObjectName, '.spec');
  const filePath = join(objectTestDir, `${fileName}.ts`);
  await writeGeneratedFile(filePath, content, { format: true, fileType: 'typescript' });

  return { path: filePath, content };
}

/**
 * Generates a test file for a component (LWC or Aura)
 */
async function generateComponentTestFile(
  componentDef: LWCComponentDefinition | AuraComponentDefinition,
  componentType: 'LWC' | 'Aura',
  options: TestGenerationOptions
): Promise<{ path: string; content: string }> {
  const componentName = componentType === 'LWC' 
    ? String((componentDef as LWCComponentDefinition).name || 'Unknown')
    : String((componentDef as AuraComponentDefinition).metadata?.name || 'Unknown');
  
  const testGroup = generateComponentTestGroup(componentName, componentType);
  
  // Render template
  const template = await readTemplate('test/object-test.hbs');
  const content = renderTemplate(template, {
    objectName: componentName,
    pageObjectName: `${componentName}ComponentPage`,
    pageObjectFileName: `${componentName.toLowerCase()}-component-page`,
    pageObjectImport: false,
    testGroups: [testGroup],
    relativePath: '../../../', // tests/Components/lwc/ or tests/Components/aura/ -> 3 levels up to root
  });

  // Organize tests by component type: tests/Components/aura/ or tests/Components/lwc/
  const componentTestDir = join(options.outputDirectory, 'tests', 'Components', componentType.toLowerCase());
  await mkdir(componentTestDir, { recursive: true });
  const filePath = join(componentTestDir, `${componentName.toLowerCase()}.spec.ts`);
  await writeGeneratedFile(filePath, content, { format: true, fileType: 'typescript' });

  return { path: filePath, content };
}

/**
 * Generates a test file for a flow
 */
async function generateFlowTestFile(
  flowDef: FlowDefinition,
  options: TestGenerationOptions
): Promise<{ path: string; content: string }> {
  // Try fullName, then name, then apiName
  const flowName = String(
    flowDef.fullName || 
    flowDef.name || 
    (flowDef as any).apiName || 
    'Unknown'
  );
  const testGroup = generateFlowTestGroup(flowDef);
  
  // Render template
  const template = await readTemplate('test/object-test.hbs');
  const content = renderTemplate(template, {
    objectName: flowName,
    pageObjectName: `${flowName}FlowPage`,
    pageObjectFileName: `${flowName.toLowerCase()}-flow-page`,
    pageObjectImport: false,
    testGroups: [testGroup],
    relativePath: '../../../', // Tests/flows/FlowName/ -> 3 levels up
  });

  // Organize tests by flow: tests/flows/FlowName/flow-name.spec.ts
  const flowTestDir = join(options.outputDirectory, 'tests', 'flows', flowName);
  await mkdir(flowTestDir, { recursive: true });
  const filePath = join(flowTestDir, `${flowName.toLowerCase()}.spec.ts`);
  await writeGeneratedFile(filePath, content, { format: true, fileType: 'typescript' });

  return { path: filePath, content };
}

