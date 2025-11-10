/**
 * Tests for Aura application parser
 */

import { describe, it, expect } from 'vitest';
import { parseAuraApplication } from '../../src/parser/aura-application-parser.js';
import { join } from 'path';
import { writeFile, mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';

describe('Aura Application Parser', () => {
  const testDir = join(process.cwd(), 'test-temp-aura-app');

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

  it('should parse .app file and extract application structure', async () => {
    const testFile = join(testDir, 'TestApp.app');
    const appDir = testDir;
    const appName = 'TestApp';
    const markup = `
<aura:application extends="ltng:outApp" access="Global">
    <aura:dependency resource="c:CustomComponent"/>
</aura:application>`;

    await writeFile(testFile, markup, 'utf-8');

    const result = await parseAuraApplication(testFile, appDir, appName);

    expect(result.type).toBe('Application');
    expect(result.metadata.name).toBe('TestApp');
    expect(result.extends?.extends).toBe('ltng:outApp');
    expect(result.componentDependencies).toBeDefined();
    expect(result.componentDependencies?.length).toBeGreaterThan(0);
  });

  it('should extract component dependencies from aura:dependency', async () => {
    const testFile = join(testDir, 'TestApp2.app');
    const appDir = testDir;
    const appName = 'TestApp2';
    const markup = `
<aura:application extends="ltng:outApp">
    <aura:dependency resource="c:Component1"/>
    <aura:dependency resource="c:Component2"/>
</aura:application>`;

    await writeFile(testFile, markup, 'utf-8');

    const result = await parseAuraApplication(testFile, appDir, appName);

    expect(result.componentDependencies).toBeDefined();
    expect(result.componentDependencies?.length).toBeGreaterThanOrEqual(2);
  });

  it('should throw error for missing aura:application element', async () => {
    const testFile = join(testDir, 'InvalidApp.app');
    const appDir = testDir;
    const appName = 'InvalidApp';
    const markup = '<div>No application</div>';

    await writeFile(testFile, markup, 'utf-8');

    await expect(parseAuraApplication(testFile, appDir, appName)).rejects.toThrow();
  });
});

