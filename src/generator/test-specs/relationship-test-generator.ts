/**
 * Relationship Test Generator
 * Generates relationship test cases
 */

import type { RelationshipTestDefinition, TestGroupDefinition } from '../../types/test-generation.js';
import type { ObjectDefinition, Relationship } from '../../types/xml-parsed.js';

export function convertRelationshipsToTests(
  objectDef: ObjectDefinition,
  relationships: Relationship[]
): RelationshipTestDefinition[] {
  const tests: RelationshipTestDefinition[] = [];
  
  for (const relationship of relationships) {
    tests.push({
      name: `test-relationship-${relationship.fieldName.toLowerCase()}`,
      type: 'Relationship',
      relationshipName: relationship.fieldName,
      relationshipType: relationship.type === 'MasterDetail' ? 'masterDetail' : 'lookup',
      parentObject: relationship.type === 'MasterDetail' ? relationship.relatedObject : objectDef.fullName,
      childObject: relationship.type === 'MasterDetail' ? objectDef.fullName : relationship.relatedObject,
      testScenario: 'population',
      testCase: generateRelationshipTestCase(objectDef, relationship),
    });
  }
  
  return tests;
}

function generateRelationshipTestCase(objectDef: ObjectDefinition, relationship: Relationship): string {
  return `test('should populate relationship ${relationship.fieldName}', async ({ page, testData }) => {
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
  };
}

