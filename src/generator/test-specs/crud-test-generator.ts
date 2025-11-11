/**
 * CRUD Test Generator
 * Generates CRUD operation test cases for Salesforce objects
 */

import type { CRUDTestDefinition, TestGroupDefinition } from '../../types/test-generation.js';
import type { ObjectDefinition } from '../../types/xml-parsed.js';

/**
 * Converts object metadata to CRUD test definitions
 */
export function convertObjectToCRUDTests(objectDef: ObjectDefinition): CRUDTestDefinition[] {
  const tests: CRUDTestDefinition[] = [];
  
  // Create test
  tests.push({
    name: `test-create-${objectDef.fullName.toLowerCase()}`,
    type: 'CRUD',
    operation: 'Create',
    objectName: objectDef.fullName,
    testData: { Name: `Test ${objectDef.label || objectDef.fullName}` },
    testCase: generateCreateTestCase(objectDef),
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
    testCase: generateReadTestCase(objectDef),
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
    testCase: generateUpdateTestCase(objectDef),
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
    testCase: generateDeleteTestCase(objectDef),
    assertions: [
      { type: 'toBeVisible', expected: true, description: 'Record should be deleted successfully' },
    ],
  });
  
  return tests;
}

/**
 * Generates Create test case
 */
function generateCreateTestCase(objectDef: ObjectDefinition): string {
  const objectName = objectDef.fullName;
  const pageObjectName = `${objectName}Page`;
  
  return `test('should create ${objectName} record', async ({ page, testData }) => {
    // Create test record via API
    const recordId = await testData.create${objectName}({
      Name: 'Test ${objectDef.label || objectName}',
    });
    
    // Navigate to record detail page
    await page.goto(\`/lightning/r/${objectName}/\${recordId}/view\`);
    
    // Verify record is displayed
    const ${pageObjectName.toLowerCase()} = new ${pageObjectName}(page);
    await expect(${pageObjectName.toLowerCase()}.recordHeader).toBeVisible();
  });`;
}

/**
 * Generates Read test case
 */
function generateReadTestCase(objectDef: ObjectDefinition): string {
  const objectName = objectDef.fullName;
  const pageObjectName = `${objectName}Page`;
  
  return `test('should read ${objectName} record', async ({ page, testData }) => {
    // Create test record via API
    const recordId = await testData.create${objectName}({
      Name: 'Test ${objectDef.label || objectName}',
    });
    
    // Navigate to record detail page
    await page.goto(\`/lightning/r/${objectName}/\${recordId}/view\`);
    
    // Verify record details are displayed
    const ${pageObjectName.toLowerCase()} = new ${pageObjectName}(page);
    await expect(${pageObjectName.toLowerCase()}.recordHeader).toBeVisible();
    
    // Cleanup
    await testData.delete${objectName}(recordId);
  });`;
}

/**
 * Generates Update test case
 */
function generateUpdateTestCase(objectDef: ObjectDefinition): string {
  const objectName = objectDef.fullName;
  const pageObjectName = `${objectName}Page`;
  
  return `test('should update ${objectName} record', async ({ page, testData }) => {
    // Create test record via API
    const recordId = await testData.create${objectName}({
      Name: 'Test ${objectDef.label || objectName}',
    });
    
    // Navigate to record detail page
    await page.goto(\`/lightning/r/${objectName}/\${recordId}/view\`);
    
    // Click Edit button
    const ${pageObjectName.toLowerCase()} = new ${pageObjectName}(page);
    await ${pageObjectName.toLowerCase()}.clickEdit();
    
    // Update record
    await ${pageObjectName.toLowerCase()}.fillName('Updated ${objectDef.label || objectName}');
    await ${pageObjectName.toLowerCase()}.clickSave();
    
    // Verify update
    await expect(${pageObjectName.toLowerCase()}.nameField).toHaveValue('Updated ${objectDef.label || objectName}');
    
    // Cleanup
    await testData.delete${objectName}(recordId);
  });`;
}

/**
 * Generates Delete test case
 */
function generateDeleteTestCase(objectDef: ObjectDefinition): string {
  const objectName = objectDef.fullName;
  const pageObjectName = `${objectName}Page`;
  
  return `test('should delete ${objectName} record', async ({ page, testData }) => {
    // Create test record via API
    const recordId = await testData.create${objectName}({
      Name: 'Test ${objectDef.label || objectName}',
    });
    
    // Navigate to record detail page
    await page.goto(\`/lightning/r/${objectName}/\${recordId}/view\`);
    
    // Delete record
    const ${pageObjectName.toLowerCase()} = new ${pageObjectName}(page);
    await ${pageObjectName.toLowerCase()}.clickDelete();
    await ${pageObjectName.toLowerCase()}.confirmDelete();
    
    // Verify deletion (should redirect or show error)
    await expect(page).toHaveURL(new RegExp('.*/home.*'));
  });`;
}

/**
 * Generates CRUD test group for an object
 */
export function generateCRUDTestGroup(objectDef: ObjectDefinition): TestGroupDefinition {
  const tests = convertObjectToCRUDTests(objectDef);
  
  return {
    groupName: `CRUD Operations - ${objectDef.fullName}`,
    testType: 'CRUD',
    tests,
    beforeEach: `// Setup: Create test data via API if needed
    // Test data is created in each test case`,
    afterEach: `// Cleanup: Delete test data
    // Cleanup is handled in each test case`,
  };
}

