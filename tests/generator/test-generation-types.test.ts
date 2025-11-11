/**
 * Tests for test generation type definitions
 */

import { describe, it, expect } from 'vitest';
import type {
  TestDefinition,
  CRUDTestDefinition,
  ValidationRuleTestDefinition,
  RecordTypeTestDefinition,
  FieldValidationTestDefinition,
  RelationshipTestDefinition,
  ComponentTestDefinition,
  FlowTestDefinition,
  PermissionTestDefinition,
  TestDataFactoryDefinition,
  TestDataHelperDefinition,
  TestFixtureDefinition,
  TestFileDefinition,
  TestGenerationConfig,
  TestGenerationResult,
} from '../../src/types/test-generation.js';

describe('Test Generation Type Definitions', () => {
  it('should define base TestDefinition interface', () => {
    const test: TestDefinition = {
      name: 'test-create-account',
      type: 'CRUD',
      description: 'Test account creation',
      testCase: "test('should create account', async () => {})",
    };
    expect(test.name).toBe('test-create-account');
    expect(test.type).toBe('CRUD');
  });

  it('should define CRUDTestDefinition interface', () => {
    const crudTest: CRUDTestDefinition = {
      name: 'test-create-account',
      type: 'CRUD',
      operation: 'Create',
      objectName: 'Account',
      testData: { Name: 'Test Account' },
      testCase: "test('should create account', async () => {})",
    };
    expect(crudTest.operation).toBe('Create');
    expect(crudTest.objectName).toBe('Account');
  });

  it('should define ValidationRuleTestDefinition interface', () => {
    const validationTest: ValidationRuleTestDefinition = {
      name: 'test-validation-rule',
      type: 'ValidationRule',
      validationRuleName: 'AccountNameRequired',
      isPositive: false,
      objectName: 'Account',
      testData: {},
      testCase: "test('should trigger validation', async () => {})",
    };
    expect(validationTest.isPositive).toBe(false);
    expect(validationTest.validationRuleName).toBe('AccountNameRequired');
  });

  it('should define TestDataFactoryDefinition interface', () => {
    const factory: TestDataFactoryDefinition = {
      objectName: 'Account',
      functionName: 'createAccount',
      returnType: 'Promise<string>',
      implementation: 'async function createAccount() { return "001"; }',
      usesAPI: true,
    };
    expect(factory.objectName).toBe('Account');
    expect(factory.usesAPI).toBe(true);
  });

  it('should define TestFixtureDefinition interface', () => {
    const fixture: TestFixtureDefinition = {
      fixtureName: 'authenticatedPage',
      fixtureType: 'authentication',
      setup: 'await login()',
    };
    expect(fixture.fixtureName).toBe('authenticatedPage');
    expect(fixture.fixtureType).toBe('authentication');
  });

  it('should define TestFileDefinition interface', () => {
    const testFile: TestFileDefinition = {
      fileName: 'account.spec.ts',
      objectName: 'Account',
      testGroups: [],
      imports: ['@playwright/test'],
    };
    expect(testFile.fileName).toBe('account.spec.ts');
    expect(testFile.objectName).toBe('Account');
  });

  it('should define TestGenerationConfig interface', () => {
    const config: TestGenerationConfig = {
      outputDirectory: './tests',
      testDataConfig: {
        apiType: 'REST',
        authenticationApproach: 'helpers',
      },
      testStructureConfig: {
        organizeByTestType: true,
        includeFixtures: true,
        includeComments: true,
      },
    };
    expect(config.outputDirectory).toBe('./tests');
    expect(config.testDataConfig.apiType).toBe('REST');
  });

  it('should define TestGenerationResult interface', () => {
    const result: TestGenerationResult = {
      generatedFiles: [],
      generatedFactories: [],
      generatedFixtures: [],
      errors: [],
      warnings: [],
      summary: {
        totalFiles: 0,
        successfulFiles: 0,
        failedFiles: 0,
        totalErrors: 0,
        totalWarnings: 0,
      },
    };
    expect(result.generatedFiles).toEqual([]);
    expect(result.summary.totalFiles).toBe(0);
  });
});

