/**
 * Salesforce REST API and Tooling API client
 * Used for test data generation via Salesforce APIs
 */

import { logger } from '../../utils/logger.js';
import { TestDataGenerationError } from '../../utils/test-generation-errors.js';

/**
 * Salesforce API authentication configuration
 */
export interface SalesforceAuthConfig {
  instanceUrl: string; // Salesforce instance URL
  accessToken: string; // OAuth access token
  apiVersion?: string; // API version (default: 'v58.0')
}

/**
 * Salesforce REST API client
 */
export class SalesforceRESTAPIClient {
  private instanceUrl: string;
  private accessToken: string;
  private apiVersion: string;

  constructor(config: SalesforceAuthConfig) {
    this.instanceUrl = config.instanceUrl;
    this.accessToken = config.accessToken;
    this.apiVersion = config.apiVersion || 'v58.0';
  }

  /**
   * Makes a GET request to Salesforce REST API
   */
  async get(endpoint: string): Promise<unknown> {
    try {
      const url = `${this.instanceUrl}/services/data/${this.apiVersion}${endpoint}`;
      logger.debug({ url, method: 'GET' }, 'Making Salesforce REST API request');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new TestDataGenerationError(
          `REST API GET failed: ${response.status} ${response.statusText} - ${errorText}`,
          'REST'
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TestDataGenerationError) {
        throw error;
      }
      throw new TestDataGenerationError(
        `REST API GET request failed: ${error instanceof Error ? error.message : String(error)}`,
        'REST',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Makes a POST request to Salesforce REST API
   */
  async post(endpoint: string, body: unknown): Promise<unknown> {
    try {
      const url = `${this.instanceUrl}/services/data/${this.apiVersion}${endpoint}`;
      logger.debug({ url, method: 'POST' }, 'Making Salesforce REST API request');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new TestDataGenerationError(
          `REST API POST failed: ${response.status} ${response.statusText} - ${errorText}`,
          'REST'
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TestDataGenerationError) {
        throw error;
      }
      throw new TestDataGenerationError(
        `REST API POST request failed: ${error instanceof Error ? error.message : String(error)}`,
        'REST',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Makes a PATCH request to Salesforce REST API
   */
  async patch(endpoint: string, body: unknown): Promise<unknown> {
    try {
      const url = `${this.instanceUrl}/services/data/${this.apiVersion}${endpoint}`;
      logger.debug({ url, method: 'PATCH' }, 'Making Salesforce REST API request');

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new TestDataGenerationError(
          `REST API PATCH failed: ${response.status} ${response.statusText} - ${errorText}`,
          'REST'
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TestDataGenerationError) {
        throw error;
      }
      throw new TestDataGenerationError(
        `REST API PATCH request failed: ${error instanceof Error ? error.message : String(error)}`,
        'REST',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Makes a DELETE request to Salesforce REST API
   */
  async delete(endpoint: string): Promise<void> {
    try {
      const url = `${this.instanceUrl}/services/data/${this.apiVersion}${endpoint}`;
      logger.debug({ url, method: 'DELETE' }, 'Making Salesforce REST API request');

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok && response.status !== 204) {
        const errorText = await response.text();
        throw new TestDataGenerationError(
          `REST API DELETE failed: ${response.status} ${response.statusText} - ${errorText}`,
          'REST'
        );
      }
    } catch (error) {
      if (error instanceof TestDataGenerationError) {
        throw error;
      }
      throw new TestDataGenerationError(
        `REST API DELETE request failed: ${error instanceof Error ? error.message : String(error)}`,
        'REST',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Creates a record using REST API
   */
  async createRecord(objectType: string, recordData: Record<string, unknown>): Promise<string> {
    const response = await this.post(`/sobjects/${objectType}/`, recordData) as { id: string; success: boolean; errors?: unknown[] };
    
    if (!response.success || !response.id) {
      throw new TestDataGenerationError(
        `Failed to create ${objectType} record: ${JSON.stringify(response.errors || 'Unknown error')}`,
        'REST'
      );
    }

    return response.id;
  }

  /**
   * Updates a record using REST API
   */
  async updateRecord(objectType: string, recordId: string, recordData: Record<string, unknown>): Promise<void> {
    await this.patch(`/sobjects/${objectType}/${recordId}`, recordData);
  }

  /**
   * Deletes a record using REST API
   */
  async deleteRecord(objectType: string, recordId: string): Promise<void> {
    await this.delete(`/sobjects/${objectType}/${recordId}`);
  }

  /**
   * Queries records using SOQL
   */
  async query(soql: string): Promise<unknown> {
    const encodedQuery = encodeURIComponent(soql);
    return await this.get(`/query/?q=${encodedQuery}`);
  }
}

/**
 * Salesforce Tooling API client
 */
export class SalesforceToolingAPIClient {
  private instanceUrl: string;
  private accessToken: string;
  private apiVersion: string;

  constructor(config: SalesforceAuthConfig) {
    this.instanceUrl = config.instanceUrl;
    this.accessToken = config.accessToken;
    this.apiVersion = config.apiVersion || 'v58.0';
  }

  /**
   * Makes a GET request to Salesforce Tooling API
   */
  async get(endpoint: string): Promise<unknown> {
    try {
      const url = `${this.instanceUrl}/services/data/${this.apiVersion}/tooling${endpoint}`;
      logger.debug({ url, method: 'GET' }, 'Making Salesforce Tooling API request');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new TestDataGenerationError(
          `Tooling API GET failed: ${response.status} ${response.statusText} - ${errorText}`,
          'Tooling'
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TestDataGenerationError) {
        throw error;
      }
      throw new TestDataGenerationError(
        `Tooling API GET request failed: ${error instanceof Error ? error.message : String(error)}`,
        'Tooling',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Makes a POST request to Salesforce Tooling API
   */
  async post(endpoint: string, body: unknown): Promise<unknown> {
    try {
      const url = `${this.instanceUrl}/services/data/${this.apiVersion}/tooling${endpoint}`;
      logger.debug({ url, method: 'POST' }, 'Making Salesforce Tooling API request');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new TestDataGenerationError(
          `Tooling API POST failed: ${response.status} ${response.statusText} - ${errorText}`,
          'Tooling'
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TestDataGenerationError) {
        throw error;
      }
      throw new TestDataGenerationError(
        `Tooling API POST request failed: ${error instanceof Error ? error.message : String(error)}`,
        'Tooling',
        error instanceof Error ? error : undefined
      );
    }
  }
}

