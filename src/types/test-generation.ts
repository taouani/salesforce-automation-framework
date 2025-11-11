/**
 * Type definitions for Test Specification Generator structures
 */

/**
 * Test type enumeration
 */
export type TestType = 'CRUD' | 'ValidationRule' | 'RecordType' | 'FieldValidation' | 'Relationship' | 'Component' | 'Flow' | 'Permission';

/**
 * Base test definition
 */
export interface TestDefinition {
  name: string; // Test name
  type: TestType; // Test type
  description?: string; // Test description
  testCase: string; // Test case implementation
  assertions?: AssertionDefinition[]; // Test assertions
  setup?: string; // Setup code
  teardown?: string; // Teardown code
  tags?: string[]; // Test tags for filtering (e.g., ['@crud', '@object:Account'])
  [key: string]: unknown;
}

/**
 * CRUD test definition
 */
export interface CRUDTestDefinition extends TestDefinition {
  type: 'CRUD';
  operation: 'Create' | 'Read' | 'Update' | 'Delete';
  objectName: string; // Salesforce object API name
  recordId?: string; // Record ID for Read/Update/Delete operations
  testData?: Record<string, unknown>; // Test data for Create/Update operations
  [key: string]: unknown;
}

/**
 * Validation rule test definition
 */
export interface ValidationRuleTestDefinition extends TestDefinition {
  type: 'ValidationRule';
  validationRuleName: string; // Validation rule name
  validationRuleMessage?: string; // Expected error message
  isPositive: boolean; // true for positive test (valid data), false for negative test (invalid data)
  testData: Record<string, unknown>; // Test data that should pass/fail validation
  objectName: string; // Salesforce object API name
  [key: string]: unknown;
}

/**
 * Record type test definition
 */
export interface RecordTypeTestDefinition extends TestDefinition {
  type: 'RecordType';
  recordTypeName: string; // Record type name
  objectName: string; // Salesforce object API name
  testScenario: 'creation' | 'fieldVisibility' | 'picklistValues' | 'assignment';
  testData?: Record<string, unknown>; // Test data
  [key: string]: unknown;
}

/**
 * Field validation test definition
 */
export interface FieldValidationTestDefinition extends TestDefinition {
  type: 'FieldValidation';
  fieldName: string; // Field API name
  fieldType: string; // Field type
  validationType: 'required' | 'format' | 'length' | 'picklist';
  objectName: string; // Salesforce object API name
  testData?: Record<string, unknown>; // Test data that violates validation
  expectedError?: string; // Expected error message
  [key: string]: unknown;
}

/**
 * Relationship test definition
 */
export interface RelationshipTestDefinition extends TestDefinition {
  type: 'Relationship';
  relationshipName: string; // Relationship field API name
  relationshipType: 'lookup' | 'masterDetail';
  parentObject: string; // Parent object API name
  childObject: string; // Child object API name
  testScenario: 'population' | 'cascadeDelete' | 'update' | 'navigation';
  [key: string]: unknown;
}

/**
 * Component test definition
 */
export interface ComponentTestDefinition extends TestDefinition {
  type: 'Component';
  componentName: string; // Component name
  componentType: 'LWC' | 'Aura';
  testScenario: 'property' | 'event' | 'rendering' | 'interaction';
  [key: string]: unknown;
}

/**
 * Flow test definition
 */
export interface FlowTestDefinition extends TestDefinition {
  type: 'Flow';
  flowName: string; // Flow name
  testScenario: 'execution' | 'screenNavigation' | 'decisionPath' | 'errorHandling';
  flowInputs?: Record<string, unknown>; // Flow input values
  [key: string]: unknown;
}

/**
 * Permission test definition
 */
export interface PermissionTestDefinition extends TestDefinition {
  type: 'Permission';
  profileOrPermissionSet: string; // Profile or permission set name
  permissionType: 'profile' | 'permissionSet';
  testScenario: 'objectLevel' | 'fieldLevel' | 'accessControl';
  objectName?: string; // Salesforce object API name
  fieldName?: string; // Field API name (for field-level security)
  [key: string]: unknown;
}

/**
 * Assertion definition
 */
export interface AssertionDefinition {
  type: 'toBe' | 'toEqual' | 'toContain' | 'toBeVisible' | 'toBeEnabled' | 'toHaveText' | 'toHaveValue';
  expected: unknown; // Expected value
  actual?: string; // Actual value expression (if needed)
  description?: string; // Assertion description
  [key: string]: unknown;
}

/**
 * Test data factory definition
 */
export interface TestDataFactoryDefinition {
  objectName: string; // Salesforce object API name
  functionName: string; // Factory function name
  parameters?: ParameterDefinition[]; // Function parameters
  returnType: string; // Return type (typically Promise<string> for record ID)
  implementation: string; // Factory function implementation
  usesAPI: boolean; // Whether factory uses Salesforce API
  [key: string]: unknown;
}

/**
 * Test data helper definition
 */
export interface TestDataHelperDefinition {
  helperName: string; // Helper function name
  purpose: 'createRelated' | 'update' | 'delete' | 'cleanup';
  parameters?: ParameterDefinition[]; // Function parameters
  returnType: string; // Return type
  implementation: string; // Helper function implementation
  usesAPI: boolean; // Whether helper uses Salesforce API
  [key: string]: unknown;
}

/**
 * Salesforce API call definition
 */
export interface SalesforceAPICallDefinition {
  apiType: 'REST' | 'Tooling';
  endpoint: string; // API endpoint
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>; // Request headers
  body?: unknown; // Request body
  responseType?: string; // Expected response type
  [key: string]: unknown;
}

/**
 * Authentication helper definition
 */
export interface AuthenticationHelperDefinition {
  helperName: string; // Helper function name
  authType: 'usernamePassword' | 'jwt' | 'configuredConnection';
  implementation: string; // Authentication helper implementation
  configVariables?: string[]; // Required configuration variables
  [key: string]: unknown;
}

/**
 * Test fixture definition
 */
export interface TestFixtureDefinition {
  fixtureName: string; // Fixture name
  fixtureType: 'authentication' | 'pageObject' | 'testData' | 'custom';
  setup?: string; // Setup logic
  teardown?: string; // Teardown logic
  dependencies?: string[]; // Other fixtures this depends on
  [key: string]: unknown;
}

/**
 * Fixture setup definition
 */
export interface FixtureSetupDefinition {
  fixtureName: string; // Fixture name
  setupCode: string; // Setup code
  setupType: 'beforeEach' | 'beforeAll' | 'custom';
  [key: string]: unknown;
}

/**
 * Fixture teardown definition
 */
export interface FixtureTeardownDefinition {
  fixtureName: string; // Fixture name
  teardownCode: string; // Teardown code
  teardownType: 'afterEach' | 'afterAll' | 'custom';
  [key: string]: unknown;
}

/**
 * Test file definition
 */
export interface TestFileDefinition {
  fileName: string; // Test file name (e.g., "account.spec.ts")
  objectName: string; // Salesforce object API name
  testGroups: TestGroupDefinition[]; // Test groups (describe blocks)
  imports: string[]; // Required imports
  fixtures?: string[]; // Fixtures used in this test file
  [key: string]: unknown;
}

/**
 * Test suite definition
 */
export interface TestSuiteDefinition {
  suiteName: string; // Test suite name
  testFiles: TestFileDefinition[]; // Test files in the suite
  globalFixtures?: string[]; // Global fixtures for the suite
  globalSetup?: string; // Global setup code
  globalTeardown?: string; // Global teardown code
  [key: string]: unknown;
}

/**
 * Test group definition (describe block)
 */
export interface TestGroupDefinition {
  groupName: string; // Group name (describe block name)
  testType: TestType; // Test type for this group
  tests: TestDefinition[]; // Tests in this group
  beforeEach?: string; // beforeEach setup code
  afterEach?: string; // afterEach teardown code
  tags?: string[]; // Tags for the test group (e.g., ['@crud', '@object:Account'])
  [key: string]: unknown;
}

/**
 * Parameter definition (reused from page-object types)
 */
export interface ParameterDefinition {
  name: string; // Parameter name
  type: string; // Parameter type
  optional?: boolean; // Whether parameter is optional
  defaultValue?: unknown; // Default value if optional
  description?: string; // Parameter description
  [key: string]: unknown;
}

/**
 * Test generation configuration
 */
export interface TestGenerationConfig {
  outputDirectory: string; // Output directory for generated tests
  templateDirectory?: string; // Custom template directory (optional)
  testDataConfig: TestDataConfig; // Test data generation configuration
  testStructureConfig: TestStructureConfig; // Test structure configuration
  [key: string]: unknown;
}

/**
 * Test data configuration
 */
export interface TestDataConfig {
  apiType: 'REST' | 'Tooling'; // Primary API type
  useToolingAPI?: boolean; // Whether to use Tooling API when needed
  authenticationApproach: 'helpers' | 'configuredConnection' | 'both'; // Authentication approach
  [key: string]: unknown;
}

/**
 * Test structure configuration
 */
export interface TestStructureConfig {
  organizeByTestType: boolean; // Whether to organize tests by type within files
  includeFixtures: boolean; // Whether to include test fixtures
  includeComments: boolean; // Whether to include comments in generated tests
  [key: string]: unknown;
}

/**
 * Test generation result
 */
export interface TestGenerationResult {
  generatedFiles: GeneratedTestFileDefinition[]; // Generated test files
  generatedFactories: GeneratedTestFileDefinition[]; // Generated test data factories
  generatedFixtures: GeneratedTestFileDefinition[]; // Generated test fixtures
  errors: TestGenerationError[]; // Generation errors
  warnings: string[]; // Generation warnings
  summary: {
    totalFiles: number;
    successfulFiles: number;
    failedFiles: number;
    totalErrors: number;
    totalWarnings: number;
  };
  [key: string]: unknown;
}

/**
 * Generated test file definition
 */
export interface GeneratedTestFileDefinition {
  path: string; // File path
  content: string; // File content
  type: 'test' | 'factory' | 'fixture' | 'helper' | 'config'; // File type
  objectName?: string; // Associated object name (if applicable)
  [key: string]: unknown;
}

/**
 * Test generation error
 */
export interface TestGenerationError {
  file?: string; // File path where error occurred
  message: string; // Error message
  type: 'generation' | 'template' | 'metadata' | 'api' | 'validation'; // Error type
  cause?: Error; // Underlying error
  [key: string]: unknown;
}

