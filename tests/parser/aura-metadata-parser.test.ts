/**
 * Tests for Aura metadata parser
 */

import { describe, it, expect } from 'vitest';
import { parseAuraComponentMetadata, parseAuraApplicationMetadata } from '../../src/parser/aura-metadata-parser.js';
import { join } from 'path';
import { writeFile, mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';

describe('Aura Metadata Parser', () => {
  const testDir = join(process.cwd(), 'test-temp-aura-metadata');

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

  it('should parse .cmp-meta.xml file and extract API version', async () => {
    const testFile = join(testDir, 'TestComponent.cmp-meta.xml');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AuraDefinitionBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>51.0</apiVersion>
    <description>Test Component</description>
</AuraDefinitionBundle>`;

    await writeFile(testFile, xml, 'utf-8');

    const result = await parseAuraComponentMetadata(testFile);

    expect(result.apiVersion).toBe('51.0');
    expect(result.description).toBe('Test Component');
  });

  it('should parse .app-meta.xml file and extract API version', async () => {
    const testFile = join(testDir, 'TestApp.app-meta.xml');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AuraDefinitionBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>61.0</apiVersion>
    <description>A Lightning Application Bundle</description>
</AuraDefinitionBundle>`;

    await writeFile(testFile, xml, 'utf-8');

    const result = await parseAuraApplicationMetadata(testFile);

    expect(result.apiVersion).toBe('61.0');
    expect(result.description).toBe('A Lightning Application Bundle');
  });

  it('should handle missing metadata file gracefully', async () => {
    const nonExistentFile = join(testDir, 'NonExistent.cmp-meta.xml');
    
    const result = await parseAuraComponentMetadata(nonExistentFile);

    expect(result).toEqual({});
  });
});

