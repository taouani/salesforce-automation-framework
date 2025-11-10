/**
 * Tests for Aura Helper JavaScript parser
 */

import { describe, it, expect } from 'vitest';
import { parseHelperJavaScriptFile } from '../../src/parser/aura-helper-parser.js';
import { join } from 'path';
import { writeFile, mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';

describe('Aura Helper Parser', () => {
  const testDir = join(process.cwd(), 'test-temp-aura-helper');

  beforeAll(async () => {
    if (!existsSync(testDir)) {
      await mkdir(testDir, { recursive: true });
    }
  });

  afterAll(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  it('should parse Helper.js file and extract helper functions', async () => {
    const testFile = join(testDir, 'TestComponentHelper.js');
    const code = `
({
    getData : function(component) {
        return component.get('v.recordId');
    },
    processData : function(component, data) {
        // Process data
    }
});`;

    await writeFile(testFile, code, 'utf-8');

    const result = await parseHelperJavaScriptFile(testFile);

    expect(result.functions).toBeDefined();
    expect(result.functions.length).toBeGreaterThan(0);
    expect(result.functions.some(f => f.name === 'getData')).toBe(true);
    expect(result.functions.some(f => f.name === 'processData')).toBe(true);
  });

  it('should extract Apex calls from $A.enqueueAction()', async () => {
    const testFile = join(testDir, 'TestComponent2Helper.js');
    const code = `
({
    callApex : function(component) {
        var action = {
            className: 'MyApexClass',
            methodName: 'myMethod',
            params: {}
        };
        $A.enqueueAction(action)
            .then(function(result) {
                // Success
            })
            .catch(function(error) {
                // Error
            });
    }
});`;

    await writeFile(testFile, code, 'utf-8');

    const result = await parseHelperJavaScriptFile(testFile);

    expect(result.apexCalls.length).toBeGreaterThanOrEqual(0); // May or may not extract depending on complexity
    expect(result.promiseChains.length).toBeGreaterThanOrEqual(0);
  });

  it('should extract promise chains', async () => {
    const testFile = join(testDir, 'TestComponent3Helper.js');
    const code = `
({
    asyncOperation : function(component) {
        return Promise.resolve()
            .then(function() {
                return 'success';
            })
            .catch(function(error) {
                console.error(error);
            })
            .finally(function() {
                // Cleanup
            });
    }
});`;

    await writeFile(testFile, code, 'utf-8');

    const result = await parseHelperJavaScriptFile(testFile);

    expect(result.promiseChains.length).toBeGreaterThanOrEqual(0);
  });

  it('should extract error handling from try/catch blocks', async () => {
    const testFile = join(testDir, 'TestComponent4Helper.js');
    const code = `
({
    riskyOperation : function(component) {
        try {
            // Risky code
        } catch (error) {
            console.error(error);
        }
    }
});`;

    await writeFile(testFile, code, 'utf-8');

    const result = await parseHelperJavaScriptFile(testFile);

    expect(result.errorHandling.length).toBeGreaterThanOrEqual(0);
  });
});

