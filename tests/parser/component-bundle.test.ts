/**
 * Tests for component bundle parser
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parseComponentBundle } from '../../src/parser/component-bundle-parser.js';
import { join } from 'path';
import { writeFile, mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';

describe('Component Bundle Parser', () => {
  const testDir = join(process.cwd(), 'test-temp-bundle');

  beforeEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
    await mkdir(join(testDir, 'lwc', 'TestComponent'), { recursive: true });
  });

  afterEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  it('should parse component bundle with all files', async () => {
    const componentDir = join(testDir, 'lwc', 'TestComponent');
    await writeFile(join(componentDir, 'TestComponent.js'), 'export default class TestComponent {}', 'utf-8');
    await writeFile(join(componentDir, 'TestComponent.html'), '<template><div>Test</div></template>', 'utf-8');
    await writeFile(join(componentDir, 'TestComponent.css'), '.test { color: red; }', 'utf-8');
    
    const result = await parseComponentBundle(componentDir);
    expect(result.metadata.name).toBe('TestComponent');
    expect(result.javascript).toBeDefined();
    expect(result.html).toBeDefined();
    expect(result.css).toBeDefined();
  });

  it('should handle component without CSS file', async () => {
    const componentDir = join(testDir, 'lwc', 'TestComponent');
    await writeFile(join(componentDir, 'TestComponent.js'), 'export default class TestComponent {}', 'utf-8');
    await writeFile(join(componentDir, 'TestComponent.html'), '<template><div>Test</div></template>', 'utf-8');
    
    const result = await parseComponentBundle(componentDir);
    expect(result.metadata.name).toBe('TestComponent');
    expect(result.javascript).toBeDefined();
    expect(result.html).toBeDefined();
    expect(result.css).toBeUndefined();
  });

  it('should extract component name from directory', async () => {
    const componentDir = join(testDir, 'lwc', 'MyComponent');
    await mkdir(componentDir, { recursive: true });
    await writeFile(join(componentDir, 'MyComponent.js'), 'export default class MyComponent {}', 'utf-8');
    await writeFile(join(componentDir, 'MyComponent.html'), '<template></template>', 'utf-8');
    
    const result = await parseComponentBundle(componentDir);
    expect(result.metadata.name).toBe('MyComponent');
  });
});

