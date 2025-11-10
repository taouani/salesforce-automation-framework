/**
 * Integration tests for Apex parser
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { parseAllApexFiles } from '../../src/parser/apex-parser-integration.js';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';

describe('Apex Parser Integration', () => {
  const testDir = join(process.cwd(), 'test-temp-apex-integration');
  const classesDir = join(testDir, 'force-app', 'main', 'default', 'classes');
  const triggersDir = join(testDir, 'force-app', 'main', 'default', 'triggers');
  
  beforeAll(async () => {
    await mkdir(classesDir, { recursive: true });
    await mkdir(triggersDir, { recursive: true });
    
    // Create test Apex class
    const testClass = `
@isTest
public class TestClass {
    public String name;
    
    @Test
    public static void testMethod() {
        List<Account> accounts = [SELECT Id, Name FROM Account LIMIT 10];
        insert accounts;
    }
}
`;
    await writeFile(join(classesDir, 'TestClass.cls'), testClass);
    
    // Create test trigger
    const testTrigger = `
trigger TestTrigger on Account (before insert, after update) {
    if (Trigger.isBefore) {
        // Before insert logic
    }
}
`;
    await writeFile(join(triggersDir, 'TestTrigger.trigger'), testTrigger);
  });
  
  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });
  
  it('should parse Apex classes and triggers', async () => {
    const result = await parseAllApexFiles({
      metadataPath: testDir,
      concurrency: 5,
    });
    
    expect(result.classes.length).toBeGreaterThan(0);
    expect(result.triggers.length).toBeGreaterThan(0);
    expect(result.results).toBeDefined();
    expect(result.results.dependencyGraph).toBeDefined();
  });
  
  it('should extract test classes correctly', async () => {
    const result = await parseAllApexFiles({
      metadataPath: testDir,
      concurrency: 5,
    });
    
    const testClass = result.classes.find((c) => c.name === 'TestClass');
    expect(testClass).toBeDefined();
    expect(testClass?.isTestClass).toBe(true);
    expect(testClass?.methods.some((m) => m.isTestMethod)).toBe(true);
  });
  
  it('should extract trigger events correctly', async () => {
    const result = await parseAllApexFiles({
      metadataPath: testDir,
      concurrency: 5,
    });
    
    const trigger = result.triggers.find((t) => t.name === 'TestTrigger');
    expect(trigger).toBeDefined();
    expect(trigger?.objects).toContain('Account');
    expect(trigger?.events).toContain('before insert');
    expect(trigger?.events).toContain('after update');
  });
  
  it('should build dependency graph', async () => {
    const result = await parseAllApexFiles({
      metadataPath: testDir,
      concurrency: 5,
    });
    
    const graph = result.results.dependencyGraph;
    const relationships = graph.getRelationships('TestClass');
    expect(relationships.length).toBeGreaterThan(0);
    
    // Should have SOQL relationship to Account
    const accountRelationships = relationships.filter((r) => r.objectName === 'Account');
    expect(accountRelationships.length).toBeGreaterThan(0);
  });
});

