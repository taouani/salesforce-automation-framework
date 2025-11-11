/**
 * Record Type Test Generator
 * Generates record type test cases for Salesforce objects
 */

import type { RecordTypeTestDefinition, TestGroupDefinition } from '../../types/test-generation.js';
import type { ObjectDefinition, RecordType } from '../../types/xml-parsed.js';

export function convertRecordTypesToTests(
  objectDef: ObjectDefinition,
  recordTypes: RecordType[]
): RecordTypeTestDefinition[] {
  const tests: RecordTypeTestDefinition[] = [];
  
  for (const recordType of recordTypes) {
    if (!recordType.active) continue;
    
    tests.push({
      name: `test-record-type-${recordType.fullName.toLowerCase()}-creation`,
      type: 'RecordType',
      recordTypeName: recordType.fullName,
      objectName: objectDef.fullName,
      testScenario: 'creation',
      testData: { RecordTypeId: recordType.fullName },
      testCase: generateRecordTypeCreationTestCase(objectDef, recordType),
    });
  }
  
  return tests;
}

function generateRecordTypeCreationTestCase(objectDef: ObjectDefinition, recordType: RecordType): string {
  return `test('should create ${objectDef.fullName} record with record type ${recordType.fullName}', async ({ page, testData }) => {
    const recordId = await testData.create${objectDef.fullName}({
      Name: 'Test Record',
      RecordTypeId: '${recordType.fullName}',
    });
    
    await page.goto(\`/lightning/r/${objectDef.fullName}/\${recordId}/view\`);
    // Verify record type is set correctly
    await expect(page.locator('text=${recordType.label}')).toBeVisible();
    
    await testData.delete${objectDef.fullName}(recordId);
  });`;
}

export function generateRecordTypeTestGroup(
  objectDef: ObjectDefinition,
  recordTypes: RecordType[]
): TestGroupDefinition {
  const tests = convertRecordTypesToTests(objectDef, recordTypes);
  
  return {
    groupName: `Record Types - ${objectDef.fullName}`,
    testType: 'RecordType',
    tests,
  };
}

