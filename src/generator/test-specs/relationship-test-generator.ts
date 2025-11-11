/**
 * Relationship Test Generator
 * Generates relationship test cases
 */

import type { RelationshipTestDefinition, TestGroupDefinition } from '../../types/test-generation.js';
import type { ObjectDefinition, Relationship } from '../../types/xml-parsed.js';
import { generateTestTags } from '../../utils/test-tag-generator.js';

export function convertRelationshipsToTests(
  objectDef: ObjectDefinition,
  relationships: Relationship[]
): RelationshipTestDefinition[] {
  const tests: RelationshipTestDefinition[] = [];
  
  let testIndex = 0;
  for (const relationship of relationships) {
    testIndex++;
    const isMasterDetail = relationship.type === 'MasterDetail';
    const parentObject = isMasterDetail ? relationship.relatedObject : objectDef.fullName;
    const childObject = isMasterDetail ? objectDef.fullName : relationship.relatedObject;
    
    // Population test (existing)
    tests.push({
      name: `test-relationship-${relationship.fieldName.toLowerCase()}-population`,
      type: 'Relationship',
      relationshipName: relationship.fieldName,
      relationshipType: isMasterDetail ? 'masterDetail' : 'lookup',
      parentObject,
      childObject,
      testScenario: 'population',
      testCase: generateRelationshipTestCase(objectDef, relationship, `${testIndex}_${relationship.fieldName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_pop`),
      tags: generateTestTags('Relationship', { objectName: objectDef.fullName }),
    });
    
    // Cascade delete test (only for master-detail relationships)
    if (isMasterDetail && relationship.cascadeDelete !== false) {
      tests.push({
        name: `test-relationship-${relationship.fieldName.toLowerCase()}-cascade-delete`,
        type: 'Relationship',
        relationshipName: relationship.fieldName,
        relationshipType: 'masterDetail',
        parentObject,
        childObject,
        testScenario: 'cascadeDelete',
        testCase: generateCascadeDeleteTestCase(objectDef, relationship, `${testIndex}_${relationship.fieldName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_cd`),
        tags: generateTestTags('Relationship', { objectName: objectDef.fullName }),
      });
    }
    
    // Relationship update test
    tests.push({
      name: `test-relationship-${relationship.fieldName.toLowerCase()}-update`,
      type: 'Relationship',
      relationshipName: relationship.fieldName,
      relationshipType: isMasterDetail ? 'masterDetail' : 'lookup',
      parentObject,
      childObject,
      testScenario: 'update',
      testCase: generateRelationshipUpdateTestCase(objectDef, relationship, `${testIndex}_${relationship.fieldName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_upd`),
      tags: generateTestTags('Relationship', { objectName: objectDef.fullName }),
    });
    
    // Relationship navigation test
    tests.push({
      name: `test-relationship-${relationship.fieldName.toLowerCase()}-navigation`,
      type: 'Relationship',
      relationshipName: relationship.fieldName,
      relationshipType: isMasterDetail ? 'masterDetail' : 'lookup',
      parentObject,
      childObject,
      testScenario: 'navigation',
      testCase: generateRelationshipNavigationTestCase(objectDef, relationship, `${testIndex}_${relationship.fieldName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_nav`),
      tags: generateTestTags('Relationship', { objectName: objectDef.fullName }),
    });
  }
  
  return tests;
}

function generateRelationshipTestCase(objectDef: ObjectDefinition, relationship: Relationship, testIndex: string | number): string {
  // Generate unique variable name to avoid redeclaration
  const pageVar = `${objectDef.fullName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_page_${testIndex}`;
  const pageObjectName = `${objectDef.fullName}Page`;
  
  return `test('should populate relationship ${relationship.fieldName} @relationship @${objectDef.fullName}', async ({ page, testData }) => {
    // Create parent record
    const parentId = await testData.create${relationship.relatedObject}({
      Name: 'Parent Record',
    });
    
    // Create child record with relationship
    const childId = await testData.create${objectDef.fullName}({
      Name: 'Child Record',
      ${relationship.fieldName}: parentId,
    });
    
    await page.goto(\`/lightning/r/${objectDef.fullName}/\${childId}/view\`);
    // Verify relationship field is populated
    await expect(page.locator('text=Parent Record')).toBeVisible();
    
    // Cleanup
    await testData.delete${objectDef.fullName}(childId);
    await testData.delete${relationship.relatedObject}(parentId);
  });`;
}

function generateCascadeDeleteTestCase(objectDef: ObjectDefinition, relationship: Relationship, testIndex: string | number): string {
  const isMasterDetail = relationship.type === 'MasterDetail';
  const masterObject = isMasterDetail ? relationship.relatedObject : objectDef.fullName;
  const detailObject = isMasterDetail ? objectDef.fullName : relationship.relatedObject;
  const masterPageObjectName = `${masterObject}Page`;
  
  // Generate unique variable name to avoid redeclaration
  const masterPageVar = `${masterObject.toLowerCase().replace(/[^a-z0-9]/g, '_')}_page_${testIndex}`;
  
  return `test('should cascade delete detail records when master is deleted @relationship @${objectDef.fullName}', async ({ page, testData }) => {
    // Create master record
    const masterId = await testData.create${masterObject}({
      Name: 'Master Record',
    });
    
    // Create detail record with relationship
    const detailId = await testData.create${detailObject}({
      Name: 'Detail Record',
      ${relationship.fieldName}: masterId,
    });
    
    // Verify detail record exists
    await page.goto(\`/lightning/r/${detailObject}/\${detailId}/view\`);
    await expect(page.locator('text=Detail Record')).toBeVisible();
    
    // Delete master record
    await page.goto(\`/lightning/r/${masterObject}/\${masterId}/view\`);
    const ${masterPageVar} = new ${masterPageObjectName}(page);
    await ${masterPageVar}.clickDelete();
    await ${masterPageVar}.confirmDelete();
    
    // Verify detail record is also deleted (cascade delete)
    await page.goto(\`/lightning/r/${detailObject}/\${detailId}/view\`);
    // Should show error or redirect indicating record doesn't exist
    await expect(page.locator('text=Record Not Found')).toBeVisible();
  });`;
}

function generateRelationshipUpdateTestCase(objectDef: ObjectDefinition, relationship: Relationship, testIndex: string | number): string {
  const objectName = objectDef.fullName;
  const pageObjectName = `${objectName}Page`;
  const isMasterDetail = relationship.type === 'MasterDetail';
  
  // Generate unique variable name to avoid redeclaration
  const childPageVar = `${objectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_page_${testIndex}`;
  
  return `test('should update relationship ${relationship.fieldName} @relationship @${objectDef.fullName}', async ({ page, testData }) => {
    // Create first parent record
    const parent1Id = await testData.create${relationship.relatedObject}({
      Name: 'Parent Record 1',
    });
    
    // Create second parent record
    const parent2Id = await testData.create${relationship.relatedObject}({
      Name: 'Parent Record 2',
    });
    
    // Create child record with first parent
    const childId = await testData.create${objectDef.fullName}({
      Name: 'Child Record',
      ${relationship.fieldName}: parent1Id,
    });
    
    // Navigate to child record and update relationship
    await page.goto(\`/lightning/r/${objectDef.fullName}/\${childId}/view\`);
    const ${childPageVar} = new ${pageObjectName}(page);
    
    // Click Edit to change relationship
    await ${childPageVar}.clickEdit();
    
    // Update relationship field to second parent
    await ${childPageVar}.fillField('${relationship.fieldName}', parent2Id);
    await ${childPageVar}.clickSave();
    
    // Verify relationship is updated
    await expect(page.locator('text=Parent Record 2')).toBeVisible();
    
    // Cleanup
    await testData.delete${objectDef.fullName}(childId);
    await testData.delete${relationship.relatedObject}(parent1Id);
    await testData.delete${relationship.relatedObject}(parent2Id);
  });`;
}

function generateRelationshipNavigationTestCase(objectDef: ObjectDefinition, relationship: Relationship, testIndex: string | number): string {
  const objectName = objectDef.fullName;
  const pageObjectName = `${objectName}Page`;
  const isMasterDetail = relationship.type === 'MasterDetail';
  const relatedObjectName = relationship.relatedObject;
  const relatedPageObjectName = `${relatedObjectName}Page`;
  
  // Generate unique variable names to avoid redeclaration
  const fieldNameSanitized = relationship.fieldName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const childPageVar = `${objectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_page_${testIndex}`;
  const parentPageVar = `${relatedObjectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_page_${fieldNameSanitized}_${testIndex}`;
  
  return `test('should navigate to related record via relationship ${relationship.fieldName} @relationship @${objectDef.fullName}', async ({ page, testData }) => {
    // Create parent record
    const parentId = await testData.create${relationship.relatedObject}({
      Name: 'Parent Record',
    });
    
    // Create child record with relationship
    const childId = await testData.create${objectDef.fullName}({
      Name: 'Child Record',
      ${relationship.fieldName}: parentId,
    });
    
    // Navigate to child record
    await page.goto(\`/lightning/r/${objectDef.fullName}/\${childId}/view\`);
    const ${childPageVar} = new ${pageObjectName}(page);
    
    // Click on relationship field to navigate to parent record
    await ${childPageVar}.clickRelationship('${relationship.fieldName}');
    
    // Verify navigation to parent record
    await expect(page).toHaveURL(new RegExp('.*/${relatedObjectName}/.*'));
    const ${parentPageVar} = new ${relatedPageObjectName}(page);
    await expect(${parentPageVar}.recordHeader).toBeVisible();
    await expect(page.locator('text=Parent Record')).toBeVisible();
    
    // Cleanup
    await testData.delete${objectDef.fullName}(childId);
    await testData.delete${relationship.relatedObject}(parentId);
  });`;
}

export function generateRelationshipTestGroup(
  objectDef: ObjectDefinition,
  relationships: Relationship[],
  availableObjects?: Set<string> // Set of object API names that have factories available
): TestGroupDefinition {
  // Filter relationships to only include those where the related object has a factory
  const validRelationships = availableObjects
    ? relationships.filter(rel => {
        const parentObject = rel.type === 'MasterDetail' ? rel.relatedObject : objectDef.fullName;
        const childObject = rel.type === 'MasterDetail' ? objectDef.fullName : rel.relatedObject;
        // Both parent and child objects should have factories
        return availableObjects.has(parentObject) && availableObjects.has(childObject);
      })
    : relationships;
  
  const tests = convertRelationshipsToTests(objectDef, validRelationships);
  
  return {
    groupName: `Relationships - ${objectDef.fullName}`,
    testType: 'Relationship',
    tests,
    tags: generateTestTags('Relationship', { objectName: objectDef.fullName }),
  };
}

