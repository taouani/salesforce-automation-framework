/**
 * Tests for Salesforce API client
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SalesforceRESTAPIClient, SalesforceToolingAPIClient } from '../../src/generator/test-data/salesforce-api-client.js';
import { TestDataGenerationError } from '../../src/utils/test-generation-errors.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('Salesforce REST API Client', () => {
  const config = {
    instanceUrl: 'https://test.salesforce.com',
    accessToken: 'test-token',
    apiVersion: 'v58.0',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create REST API client with config', () => {
    const client = new SalesforceRESTAPIClient(config);
    expect(client).toBeDefined();
  });

  it('should make successful GET request', async () => {
    const mockResponse = { records: [] };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const client = new SalesforceRESTAPIClient(config);
    const result = await client.get('/sobjects/Account/');

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/services/data/v58.0/sobjects/Account/'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token',
        }),
      })
    );
  });

  it('should throw error on failed GET request', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => 'Invalid session',
    });

    const client = new SalesforceRESTAPIClient(config);
    await expect(client.get('/sobjects/Account/')).rejects.toThrow(TestDataGenerationError);
  });

  it('should create record successfully', async () => {
    const mockResponse = { id: '001000000000000AAA', success: true };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const client = new SalesforceRESTAPIClient(config);
    const recordId = await client.createRecord('Account', { Name: 'Test Account' });

    expect(recordId).toBe('001000000000000AAA');
  });
});

describe('Salesforce Tooling API Client', () => {
  const config = {
    instanceUrl: 'https://test.salesforce.com',
    accessToken: 'test-token',
    apiVersion: 'v58.0',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create Tooling API client with config', () => {
    const client = new SalesforceToolingAPIClient(config);
    expect(client).toBeDefined();
  });

  it('should make successful GET request', async () => {
    const mockResponse = { records: [] };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const client = new SalesforceToolingAPIClient(config);
    const result = await client.get('/query/?q=SELECT Id FROM ApexClass');

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/services/data/v58.0/tooling/query/'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token',
        }),
      })
    );
  });
});

