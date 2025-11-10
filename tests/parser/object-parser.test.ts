/**
 * Tests for object parser
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseObjectXML } from '../../src/parser/object-parser.js';
import { parseXMLFile } from '../../src/parser/xml-parser.js';
import { XMLStructureError } from '../../src/utils/xml-errors.js';

vi.mock('../../src/parser/xml-parser.js');

describe('parseObjectXML', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse a valid object XML file', async () => {
    const mockXML = {
      CustomObject: {
        fullName: 'TestObject__c',
        label: 'Test Object',
        pluralLabel: 'Test Objects',
        fields: [
          {
            fullName: 'Name',
            type: 'String',
            label: 'Name',
            required: true,
            length: 255,
          },
        ],
        validationRules: [],
        recordTypes: [],
      },
    };

    vi.mocked(parseXMLFile).mockResolvedValue(mockXML);

    const result = await parseObjectXML('/test/TestObject__c.object-meta.xml');

    expect(result.fullName).toBe('TestObject__c');
    expect(result.label).toBe('Test Object');
    expect(result.fields).toHaveLength(1);
    expect(result.fields[0].fullName).toBe('Name');
  });

  it('should extract relationships from fields', async () => {
    const mockXML = {
      CustomObject: {
        fullName: 'TestObject__c',
        fields: [
          {
            fullName: 'Contact__c',
            type: 'Lookup',
            referenceTo: 'Contact',
            relationshipName: 'Contact',
          },
        ],
        validationRules: [],
        recordTypes: [],
      },
    };

    vi.mocked(parseXMLFile).mockResolvedValue(mockXML);

    const result = await parseObjectXML('/test/TestObject__c.object-meta.xml');

    expect(result.relationships).toHaveLength(1);
    expect(result.relationships[0].type).toBe('Lookup');
    expect(result.relationships[0].relatedObject).toBe('Contact');
  });

  it('should throw XMLStructureError for missing CustomObject', async () => {
    const mockXML = {};

    vi.mocked(parseXMLFile).mockResolvedValue(mockXML);

    await expect(parseObjectXML('/test/invalid.xml')).rejects.toThrow(XMLStructureError);
  });

  it('should parse validation rules with formula parsing', async () => {
    const mockXML = {
      CustomObject: {
        fullName: 'TestObject__c',
        fields: [],
        validationRules: [
          {
            fullName: 'TestRule',
            active: true,
            errorConditionFormula: 'ISBLANK(Name)',
            errorMessage: 'Name is required',
          },
        ],
        recordTypes: [],
      },
    };

    vi.mocked(parseXMLFile).mockResolvedValue(mockXML);

    const result = await parseObjectXML('/test/TestObject__c.object-meta.xml');

    expect(result.validationRules).toHaveLength(1);
    expect(result.validationRules[0].errorConditionFormula).toBe('ISBLANK(Name)');
  });
});

