/**
 * CRUD Test Generator
 * Generates CRUD operation test cases for Salesforce objects
 */

import type { CRUDTestDefinition, TestGroupDefinition } from '../../types/test-generation.js';
import type { ObjectDefinition } from '../../types/xml-parsed.js';
import { generateTestTags } from '../../utils/test-tag-generator.js';
import { 
  generatePageObjectClassName, 
  generateTestDataFactoryFunctionName, 
  generateDeleteFunctionName 
} from '../name-sanitizer.js';

/**
 * Converts object metadata to CRUD test definitions
 */
export function convertObjectToCRUDTests(
  objectDef: ObjectDefinition,
  sanitizedNames?: {
    pageObjectClassName: string;
    createFunctionName: string;
    deleteFunctionName: string;
  }
): CRUDTestDefinition[] {
  // Use provided sanitized names or generate them
  const pageObjectClassName = sanitizedNames?.pageObjectClassName || generatePageObjectClassName(objectDef.fullName);
  const createFunctionName = sanitizedNames?.createFunctionName || generateTestDataFactoryFunctionName(objectDef.fullName);
  const deleteFunctionName = sanitizedNames?.deleteFunctionName || generateDeleteFunctionName(objectDef.fullName);
  
  const tests: CRUDTestDefinition[] = [];
  
  // Create test
  tests.push({
    name: `test-create-${objectDef.fullName.toLowerCase()}`,
    type: 'CRUD',
    operation: 'Create',
    objectName: objectDef.fullName,
    testData: { Name: `Test ${objectDef.label || objectDef.fullName}` },
    testCase: generateCreateTestCase(objectDef, pageObjectClassName, createFunctionName),
    tags: generateTestTags('CRUD', { objectName: objectDef.fullName }),
    assertions: [
      { type: 'toBeVisible', expected: true, description: 'Record should be created successfully' },
    ],
  });
  
  // Read test
  tests.push({
    name: `test-read-${objectDef.fullName.toLowerCase()}`,
    type: 'CRUD',
    operation: 'Read',
    objectName: objectDef.fullName,
    testCase: generateReadTestCase(objectDef, pageObjectClassName, createFunctionName, deleteFunctionName),
    tags: generateTestTags('CRUD', { objectName: objectDef.fullName }),
    assertions: [
      { type: 'toBeVisible', expected: true, description: 'Record details should be displayed' },
    ],
  });
  
  // Update test
  tests.push({
    name: `test-update-${objectDef.fullName.toLowerCase()}`,
    type: 'CRUD',
    operation: 'Update',
    objectName: objectDef.fullName,
    testData: { Name: `Updated ${objectDef.label || objectDef.fullName}` },
    testCase: generateUpdateTestCase(objectDef, pageObjectClassName, createFunctionName, deleteFunctionName),
    tags: generateTestTags('CRUD', { objectName: objectDef.fullName }),
    assertions: [
      { type: 'toHaveValue', expected: `Updated ${objectDef.label || objectDef.fullName}`, description: 'Record should be updated' },
    ],
  });
  
  // Delete test
  tests.push({
    name: `test-delete-${objectDef.fullName.toLowerCase()}`,
    type: 'CRUD',
    operation: 'Delete',
    objectName: objectDef.fullName,
    testCase: generateDeleteTestCase(objectDef, pageObjectClassName, createFunctionName),
    tags: generateTestTags('CRUD', { objectName: objectDef.fullName }),
    assertions: [
      { type: 'toBeVisible', expected: true, description: 'Record should be deleted successfully' },
    ],
  });
  
  return tests;
}

/**
 * Generates Create test case
 */
function generateCreateTestCase(
  objectDef: ObjectDefinition,
  pageObjectClassName: string,
  createFunctionName: string
): string {
  const objectName = objectDef.fullName;
  const pageVar = `${objectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_page_create`;
  
  return `test('should create ${objectName} record @crud @${objectName}', async ({ page, testData }) => {
    // Create test record via API
    const recordId = await testData.${createFunctionName}({
      Name: 'Test ${objectDef.label || objectName}',
    });
    
    // Navigate to record detail page
    await page.goto(\`/lightning/r/${objectName}/\${recordId}/view\`);
    
    // Verify record is displayed
    const ${pageVar} = new ${pageObjectClassName}(page);
    await expect(${pageVar}.recordHeader).toBeVisible();
  });`;
}

/**
 * Generates Read test case
 */
function generateReadTestCase(
  objectDef: ObjectDefinition,
  pageObjectClassName: string,
  createFunctionName: string,
  deleteFunctionName: string
): string {
  const objectName = objectDef.fullName;
  const pageVar = `${objectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_page_read`;
  
  return `test('should read ${objectName} record @crud @${objectName}', async ({ page, testData }) => {
    // Create test record via API
    const recordId = await testData.${createFunctionName}({
      Name: 'Test ${objectDef.label || objectName}',
    });
    
    // Navigate to record detail page
    await page.goto(\`/lightning/r/${objectName}/\${recordId}/view\`);
    
    // Verify record details are displayed
    const ${pageVar} = new ${pageObjectClassName}(page);
    await expect(${pageVar}.recordHeader).toBeVisible();
    
    // Cleanup
    await testData.${deleteFunctionName}(recordId);
  });`;
}

/**
 * Generates Update test case
 */
function generateUpdateTestCase(
  objectDef: ObjectDefinition,
  pageObjectClassName: string,
  createFunctionName: string,
  deleteFunctionName: string
): string {
  const objectName = objectDef.fullName;
  const pageVar = `${objectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_page_update`;
  
  return `test('should update ${objectName} record @crud @${objectName}', async ({ page, testData }) => {
    // Create test record via API
    const recordId = await testData.${createFunctionName}({
      Name: 'Test ${objectDef.label || objectName}',
    });
    
    // Navigate to record detail page
    await page.goto(\`/lightning/r/${objectName}/\${recordId}/view\`);
    
    // Click Edit button
    const ${pageVar} = new ${pageObjectClassName}(page);
    await ${pageVar}.clickEdit();
    
    // Update record
    await ${pageVar}.fillName('Updated ${objectDef.label || objectName}');
    await ${pageVar}.clickSave();
    
    // Verify update
    await expect(${pageVar}.nameField).toHaveValue('Updated ${objectDef.label || objectName}');
    
    // Cleanup
    await testData.${deleteFunctionName}(recordId);
  });`;
}

/**
 * Generates Delete test case
 */
function generateDeleteTestCase(
  objectDef: ObjectDefinition,
  pageObjectClassName: string,
  createFunctionName: string
): string {
  const objectName = objectDef.fullName;
  const pageVar = `${objectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_page_delete`;
  
  return `test('should delete ${objectName} record @crud @${objectName}', async ({ page, testData }) => {
    // Create test record via API
    const recordId = await testData.${createFunctionName}({
      Name: 'Test ${objectDef.label || objectName}',
    });
    
    // Navigate to record detail page
    await page.goto(\`/lightning/r/${objectName}/\${recordId}/view\`);
    
    // Delete record
    const ${pageVar} = new ${pageObjectClassName}(page);
    await ${pageVar}.clickDelete();
    await ${pageVar}.confirmDelete();
    
    // Verify deletion (should redirect or show error)
    await expect(page).toHaveURL(new RegExp('.*/home.*'));
  });`;
}

/**
 * Generates CRUD test group for an object
 */
export function generateCRUDTestGroup(
  objectDef: ObjectDefinition,
  sanitizedNames?: {
    pageObjectClassName: string;
    createFunctionName: string;
    deleteFunctionName: string;
  }
): TestGroupDefinition {
  const tests = convertObjectToCRUDTests(objectDef, sanitizedNames);
  
  return {
    groupName: `CRUD Operations - ${objectDef.fullName}`,
    testType: 'CRUD',
    tests,
    tags: generateTestTags('CRUD', { objectName: objectDef.fullName }),
    beforeEach: `// Setup: Create test data via API if needed
    // Test data is created in each test case`,
    afterEach: `// Cleanup: Delete test data
    // Cleanup is handled in each test case`,
  };
}

