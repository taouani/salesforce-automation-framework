/**
 * Tests for Apex class parser
 */

import { describe, it, expect } from 'vitest';
import { parseApexClassFile } from '../../src/parser/apex-class-parser.js';
import { ApexClassParseError } from '../../src/utils/apex-errors.js';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';

describe('Apex Class Parser', () => {
  const testDir = join(process.cwd(), 'test-temp-apex-parser');
  
  beforeAll(async () => {
    await mkdir(testDir, { recursive: true });
  });
  
  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });
  
  it('should parse a simple Apex class', async () => {
    const testClass = `
public class TestClass {
    public String name;
    
    public void testMethod() {
        // Test
    }
}
`;
    const filePath = join(testDir, 'TestClass.cls');
    await writeFile(filePath, testClass);
    
    const result = await parseApexClassFile(filePath);
    
    expect(result.name).toBe('TestClass');
    expect(result.accessModifier).toBe('public');
    expect(result.properties).toHaveLength(1);
    expect(result.properties[0].name).toBe('name');
    expect(result.methods).toHaveLength(1);
    expect(result.methods[0].name).toBe('testMethod');
  });
  
  it('should parse class with annotations', async () => {
    const testClass = `
@isTest
public class TestClass {
    @Test
    public static void testMethod() {
        // Test
    }
}
`;
    const filePath = join(testDir, 'TestClassAnnotated.cls');
    await writeFile(filePath, testClass);
    
    const result = await parseApexClassFile(filePath);
    
    expect(result.isTestClass).toBe(true);
    expect(result.annotations).toBeDefined();
    expect(result.annotations?.some((ann) => ann.name === 'isTest')).toBe(true);
    expect(result.methods[0].isTestMethod).toBe(true);
  });
  
  it('should parse class with extends and implements', async () => {
    const testClass = `
public class TestClass extends BaseClass implements Interface1, Interface2 {
}
`;
    const filePath = join(testDir, 'TestClassExtends.cls');
    await writeFile(filePath, testClass);
    
    const result = await parseApexClassFile(filePath);
    
    expect(result.superclass).toBe('BaseClass');
    expect(result.interfaces).toContain('Interface1');
    expect(result.interfaces).toContain('Interface2');
  });
  
  it('should throw error for invalid file', async () => {
    const filePath = join(testDir, 'NonExistent.cls');
    
    await expect(parseApexClassFile(filePath)).rejects.toThrow(ApexClassParseError);
  });
});

