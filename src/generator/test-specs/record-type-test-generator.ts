/**
 * Record Type Test Generator
 * Generates record type test cases for Salesforce objects
 */

import type { RecordTypeTestDefinition, TestGroupDefinition } from '../../types/test-generation.js';
import type { ObjectDefinition, RecordType } from '../../types/xml-parsed.js';
import { generateTestTags } from '../../utils/test-tag-generator.js';
import { 
  generatePageObjectClassName,
  generateTestDataFactoryFunctionName, 
  generateDeleteFunctionName 
} from '../name-sanitizer.js';

export function convertRecordTypesToTests(
  objectDef: ObjectDefinition,
  recordTypes: RecordType[],
  sanitizedNames?: {
    pageObjectClassName: string;
    createFunctionName: string;
    deleteFunctionName: string;
  }
): RecordTypeTestDefinition[] {
  const pageObjectClassName = sanitizedNames?.pageObjectClassName || generatePageObjectClassName(objectDef.fullName);
  const createFunctionName = sanitizedNames?.createFunctionName || generateTestDataFactoryFunctionName(objectDef.fullName);
  const deleteFunctionName = sanitizedNames?.deleteFunctionName || generateDeleteFunctionName(objectDef.fullName);
  
  const tests: RecordTypeTestDefinition[] = [];
  
  let testIndex = 0;
  for (const recordType of recordTypes) {
    testIndex++;
    if (!recordType.active) continue;
    
    // Creation test
    tests.push({
      name: `test-record-type-${recordType.fullName.toLowerCase()}-creation`,
      type: 'RecordType',
      recordTypeName: recordType.fullName,
      objectName: objectDef.fullName,
      testScenario: 'creation',
      testData: { RecordTypeId: recordType.fullName },
      testCase: generateRecordTypeCreationTestCase(objectDef, recordType, createFunctionName, deleteFunctionName),
      tags: generateTestTags('RecordType', { objectName: objectDef.fullName }),
    });
    
    // Field visibility test
    if (objectDef.fields && objectDef.fields.length > 0) {
      tests.push({
        name: `test-record-type-${recordType.fullName.toLowerCase()}-field-visibility`,
        type: 'RecordType',
        recordTypeName: recordType.fullName,
        objectName: objectDef.fullName,
        testScenario: 'fieldVisibility',
        testData: { RecordTypeId: recordType.fullName },
        testCase: generateRecordTypeFieldVisibilityTestCase(objectDef, recordType, testIndex, pageObjectClassName, createFunctionName, deleteFunctionName),
        tags: generateTestTags('RecordType', { objectName: objectDef.fullName }),
      });
    }
    
    // Picklist values test
    if (recordType.picklistValues && recordType.picklistValues.length > 0) {
      tests.push({
        name: `test-record-type-${recordType.fullName.toLowerCase()}-picklist-values`,
        type: 'RecordType',
        recordTypeName: recordType.fullName,
        objectName: objectDef.fullName,
        testScenario: 'picklistValues',
        testData: { RecordTypeId: recordType.fullName },
        testCase: generateRecordTypePicklistValuesTestCase(objectDef, recordType, `${testIndex}_${recordType.fullName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_pv`, pageObjectClassName, createFunctionName, deleteFunctionName),
        tags: generateTestTags('RecordType', { objectName: objectDef.fullName }),
      });
    }
    
    // Assignment test (changing record type on existing record)
    tests.push({
      name: `test-record-type-${recordType.fullName.toLowerCase()}-assignment`,
      type: 'RecordType',
      recordTypeName: recordType.fullName,
      objectName: objectDef.fullName,
      testScenario: 'assignment',
      testData: { RecordTypeId: recordType.fullName },
      testCase: generateRecordTypeAssignmentTestCase(objectDef, recordType, `${testIndex}_${recordType.fullName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_asg`, pageObjectClassName, createFunctionName, deleteFunctionName),
      tags: generateTestTags('RecordType', { objectName: objectDef.fullName }),
    });
  }
  
  return tests;
}

function generateRecordTypeCreationTestCase(
  objectDef: ObjectDefinition, 
  recordType: RecordType,
  createFunctionName: string,
  deleteFunctionName: string
): string {
  return `test('should create ${objectDef.fullName} record with record type ${recordType.fullName} @record-type @${objectDef.fullName}', async ({ page, testData }) => {
    const recordId = await testData.${createFunctionName}({
      Name: 'Test Record',
      RecordTypeId: '${recordType.fullName}',
    });
    
    await page.goto(\`/lightning/r/${objectDef.fullName}/\${recordId}/view\`);
    // Verify record type is set correctly
    await expect(page.locator('text=${recordType.label}')).toBeVisible();
    
    await testData.${deleteFunctionName}(recordId);
  });`;
}

function generateRecordTypeFieldVisibilityTestCase(
  objectDef: ObjectDefinition, 
  recordType: RecordType, 
  testIndex: string | number,
  pageObjectClassName: string,
  createFunctionName: string,
  deleteFunctionName: string
): string {
  const objectName = objectDef.fullName;
  const pageVar = `${objectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_page_rt_${testIndex}`;
  
  return `test('should verify field visibility for record type ${recordType.fullName} @record-type @${objectDef.fullName}', async ({ page, testData }) => {
    const recordId = await testData.${createFunctionName}({
      Name: 'Test Record',
      RecordTypeId: '${recordType.fullName}',
    });
    
    await page.goto(\`/lightning/r/${objectDef.fullName}/\${recordId}/view\`);
    const ${pageVar} = new ${pageObjectClassName}(page);
    
    // Click Edit to see field visibility
    await ${pageVar}.clickEdit();
    
    // Verify required fields are visible for this record type
    // Note: Field visibility is record type-specific in Salesforce
    // Adjust assertions based on your record type field configurations
    await expect(page.locator('text=Name')).toBeVisible();
    
    await testData.${deleteFunctionName}(recordId);
  });`;
}

function generateRecordTypePicklistValuesTestCase(
  objectDef: ObjectDefinition, 
  recordType: RecordType, 
  testIndex: string | number,
  pageObjectClassName: string,
  createFunctionName: string,
  deleteFunctionName: string
): string {
  const objectName = objectDef.fullName;
  const pageVar = `${objectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_page_rt_${testIndex}`;
  
  return `test('should verify picklist values for record type ${recordType.fullName} @record-type @${objectDef.fullName}', async ({ page, testData }) => {
    const recordId = await testData.${createFunctionName}({
      Name: 'Test Record',
      RecordTypeId: '${recordType.fullName}',
    });
    
    await page.goto(\`/lightning/r/${objectDef.fullName}/\${recordId}/view\`);
    const ${pageVar} = new ${pageObjectClassName}(page);
    
    // Click Edit to see picklist values
    await ${pageVar}.clickEdit();
    
    // Verify only valid picklist values for this record type are available
    ${recordType.picklistValues?.map(pv => {
      const fieldName = pv.picklist;
      const validValues = pv.values.join(', ');
      return `// Verify ${fieldName} picklist contains only valid values: ${validValues}
    const ${fieldName.toLowerCase()}Field = page.locator('[data-field="${fieldName}"]');
    await expect(${fieldName.toLowerCase()}Field).toBeVisible();`;
    }).join('\n    ') || '// No picklist values configured for this record type'}
    
    await testData.${deleteFunctionName}(recordId);
  });`;
}

function generateRecordTypeAssignmentTestCase(
  objectDef: ObjectDefinition, 
  recordType: RecordType, 
  testIndex: string | number,
  pageObjectClassName: string,
  createFunctionName: string,
  deleteFunctionName: string
): string {
  const objectName = objectDef.fullName;
  const pageVar = `${objectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_page_rt_${testIndex}`;
  
  return `test('should assign record type ${recordType.fullName} to existing record @record-type @${objectDef.fullName}', async ({ page, testData }) => {
    // Create record with default record type
    const recordId = await testData.${createFunctionName}({
      Name: 'Test Record',
    });
    
    await page.goto(\`/lightning/r/${objectDef.fullName}/\${recordId}/view\`);
    const ${pageVar} = new ${pageObjectClassName}(page);
    
    // Click Edit to change record type
    await ${pageVar}.clickEdit();
    
    // Change record type to ${recordType.fullName}
    // Note: Record type change may require specific permissions
    await page.locator('[data-field="RecordTypeId"]').selectOption('${recordType.fullName}');
    await ${pageVar}.clickSave();
    
    // Verify record type is changed
    await expect(page.locator('text=${recordType.label}')).toBeVisible();
    
    await testData.${deleteFunctionName}(recordId);
  });`;
}

export function generateRecordTypeTestGroup(
  objectDef: ObjectDefinition,
  recordTypes: RecordType[],
  sanitizedNames?: {
    pageObjectClassName: string;
    createFunctionName: string;
    deleteFunctionName: string;
  }
): TestGroupDefinition {
  const tests = convertRecordTypesToTests(objectDef, recordTypes, sanitizedNames);
  
  return {
    groupName: `Record Types - ${objectDef.fullName}`,
    testType: 'RecordType',
    tests,
    tags: generateTestTags('RecordType', { objectName: objectDef.fullName }),
  };
}

