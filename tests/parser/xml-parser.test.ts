/**
 * Tests for XML parser
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseXMLFile, parseXMLContent } from '../../src/parser/xml-parser.js';
import { XMLParseError } from '../../src/utils/xml-errors.js';
import { readFile } from 'fs/promises';

vi.mock('fs/promises');

describe('parseXMLFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse a valid XML file', async () => {
    const mockXML = '<?xml version="1.0"?><root><name>Test</name></root>';
    vi.mocked(readFile).mockResolvedValue(mockXML);

    const result = await parseXMLFile('/test/path.xml');

    expect(result).toBeDefined();
    expect(result).toHaveProperty('root');
  });

  it('should throw XMLParseError for invalid XML', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('Parse error'));

    await expect(parseXMLFile('/test/invalid.xml')).rejects.toThrow(XMLParseError);
  });

  it('should throw XMLParseError for file read errors', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('File not found'));

    await expect(parseXMLFile('/test/missing.xml')).rejects.toThrow(XMLParseError);
  });
});

describe('parseXMLContent', () => {
  it('should parse valid XML content', () => {
    const xmlContent = '<?xml version="1.0"?><root><name>Test</name></root>';
    const result = parseXMLContent(xmlContent);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('root');
  });

  it('should handle XML content parsing', () => {
    const xmlContent = '<?xml version="1.0"?><root><name>Test</name></root>';
    const result = parseXMLContent(xmlContent);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('root');
  });
});

