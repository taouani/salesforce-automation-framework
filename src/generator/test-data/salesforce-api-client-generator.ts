/**
 * Salesforce API Client Generator
 * Generates the salesforce-api-client.ts file for the generated test project
 */

import { join } from 'path';
import { writeGeneratedFile } from '../file-generator.js';
import { logger } from '../../utils/logger.js';

/**
 * Generates salesforce-api-client.ts file
 */
export async function generateSalesforceAPIClientFile(outputDir: string): Promise<string> {
  const fileContent = `/**
 * Salesforce REST API and Tooling API client
 * Used for test data generation via Salesforce APIs
 */

/**
 * Salesforce API authentication configuration
 */
export interface SalesforceAuthConfig {
  instanceUrl: string; // Salesforce instance URL
  accessToken: string; // OAuth access token
  apiVersion?: string; // API version (default: 'v58.0')
}

/**
 * Custom error for Salesforce API operations
 */
export class SalesforceAPIError extends Error {
  constructor(
    message: string,
    public readonly apiType: 'REST' | 'Tooling',
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'SalesforceAPIError';
  }
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
      const url = \`\${this.instanceUrl}/services/data/\${this.apiVersion}\${endpoint}\`;
      console.debug('Making Salesforce REST API GET request:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': \`Bearer \${this.accessToken}\`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new SalesforceAPIError(
          \`REST API GET failed: \${response.status} \${response.statusText} - \${errorText}\`,
          'REST'
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof SalesforceAPIError) {
        throw error;
      }
      throw new SalesforceAPIError(
        \`REST API GET request failed: \${error instanceof Error ? error.message : String(error)}\`,
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
      const url = \`\${this.instanceUrl}/services/data/\${this.apiVersion}\${endpoint}\`;
      console.debug('Making Salesforce REST API POST request:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${this.accessToken}\`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new SalesforceAPIError(
          \`REST API POST failed: \${response.status} \${response.statusText} - \${errorText}\`,
          'REST'
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof SalesforceAPIError) {
        throw error;
      }
      throw new SalesforceAPIError(
        \`REST API POST request failed: \${error instanceof Error ? error.message : String(error)}\`,
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
      const url = \`\${this.instanceUrl}/services/data/\${this.apiVersion}\${endpoint}\`;
      console.debug('Making Salesforce REST API PATCH request:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': \`Bearer \${this.accessToken}\`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new SalesforceAPIError(
          \`REST API PATCH failed: \${response.status} \${response.statusText} - \${errorText}\`,
          'REST'
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof SalesforceAPIError) {
        throw error;
      }
      throw new SalesforceAPIError(
        \`REST API PATCH request failed: \${error instanceof Error ? error.message : String(error)}\`,
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
      const url = \`\${this.instanceUrl}/services/data/\${this.apiVersion}\${endpoint}\`;
      console.debug('Making Salesforce REST API DELETE request:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': \`Bearer \${this.accessToken}\`,
        },
      });

      if (!response.ok && response.status !== 204) {
        const errorText = await response.text();
        throw new SalesforceAPIError(
          \`REST API DELETE failed: \${response.status} \${response.statusText} - \${errorText}\`,
          'REST'
        );
      }
    } catch (error) {
      if (error instanceof SalesforceAPIError) {
        throw error;
      }
      throw new SalesforceAPIError(
        \`REST API DELETE request failed: \${error instanceof Error ? error.message : String(error)}\`,
        'REST',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Creates a record using REST API
   */
  async createRecord(objectType: string, recordData: Record<string, unknown>): Promise<string> {
    const response = await this.post(\`/sobjects/\${objectType}/\`, recordData) as { id: string; success: boolean; errors?: unknown[] };
    
    if (!response.success || !response.id) {
      throw new SalesforceAPIError(
        \`Failed to create \${objectType} record: \${JSON.stringify(response.errors || 'Unknown error')}\`,
        'REST'
      );
    }

    return response.id;
  }

  /**
   * Updates a record using REST API
   */
  async updateRecord(objectType: string, recordId: string, recordData: Record<string, unknown>): Promise<void> {
    await this.patch(\`/sobjects/\${objectType}/\${recordId}\`, recordData);
  }

  /**
   * Deletes a record using REST API
   */
  async deleteRecord(objectType: string, recordId: string): Promise<void> {
    await this.delete(\`/sobjects/\${objectType}/\${recordId}\`);
  }

  /**
   * Queries records using SOQL
   */
  async query(soql: string): Promise<unknown> {
    const encodedQuery = encodeURIComponent(soql);
    return await this.get(\`/query/?q=\${encodedQuery}\`);
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
      const url = \`\${this.instanceUrl}/services/data/\${this.apiVersion}/tooling\${endpoint}\`;
      console.debug('Making Salesforce Tooling API GET request:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': \`Bearer \${this.accessToken}\`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new SalesforceAPIError(
          \`Tooling API GET failed: \${response.status} \${response.statusText} - \${errorText}\`,
          'Tooling'
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof SalesforceAPIError) {
        throw error;
      }
      throw new SalesforceAPIError(
        \`Tooling API GET request failed: \${error instanceof Error ? error.message : String(error)}\`,
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
      const url = \`\${this.instanceUrl}/services/data/\${this.apiVersion}/tooling\${endpoint}\`;
      console.debug('Making Salesforce Tooling API POST request:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${this.accessToken}\`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new SalesforceAPIError(
          \`Tooling API POST failed: \${response.status} \${response.statusText} - \${errorText}\`,
          'Tooling'
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof SalesforceAPIError) {
        throw error;
      }
      throw new SalesforceAPIError(
        \`Tooling API POST request failed: \${error instanceof Error ? error.message : String(error)}\`,
        'Tooling',
        error instanceof Error ? error : undefined
      );
    }
  }
}
`;

  const filePath = join(outputDir, 'utils', 'salesforce-api-client.ts');
  await writeGeneratedFile(filePath, fileContent, { format: true, fileType: 'typescript' });
  
  logger.info({ filePath }, 'Generated Salesforce API client file');
  
  return filePath;
}

