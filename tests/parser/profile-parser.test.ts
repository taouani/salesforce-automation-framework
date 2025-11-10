/**
 * Tests for profile parser
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseProfileXML } from '../../src/parser/profile-parser.js';
import { parseXMLFile } from '../../src/parser/xml-parser.js';
import { XMLStructureError } from '../../src/utils/xml-errors.js';

vi.mock('../../src/parser/xml-parser.js');

describe('parseProfileXML', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse a valid profile XML file', async () => {
    const mockXML = {
      Profile: {
        fullName: 'Admin',
        label: 'System Administrator',
        objectPermissions: [
          {
            object: 'Account',
            allowCreate: true,
            allowRead: true,
            allowEdit: true,
            allowDelete: true,
          },
        ],
        fieldPermissions: [],
        classAccesses: [],
        pageAccesses: [],
        userPermissions: [],
        applicationVisibilities: [],
        tabVisibilities: [],
      },
    };

    vi.mocked(parseXMLFile).mockResolvedValue(mockXML);

    const result = await parseProfileXML('/test/Admin.profile-meta.xml');

    expect(result.fullName).toBe('Admin');
    expect(result.objectPermissions).toHaveLength(1);
    expect(result.objectPermissions[0].object).toBe('Account');
  });

  it('should throw XMLStructureError for missing Profile element', async () => {
    const mockXML = {};

    vi.mocked(parseXMLFile).mockResolvedValue(mockXML);

    await expect(parseProfileXML('/test/invalid.xml')).rejects.toThrow(XMLStructureError);
  });
});

