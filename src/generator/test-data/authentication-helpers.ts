/**
 * Authentication helper generators for Salesforce API access
 * Generates authentication helper functions for test data factories
 */

import type { AuthenticationHelperDefinition } from '../../types/test-generation.js';
import { logger } from '../../utils/logger.js';

/**
 * Generates authentication helper for username/password OAuth flow
 */
export function generateUsernamePasswordAuthHelper(): AuthenticationHelperDefinition {
  return {
    helperName: 'authenticateWithUsernamePassword',
    authType: 'usernamePassword',
    configVariables: ['SALESFORCE_USERNAME', 'SALESFORCE_PASSWORD', 'SALESFORCE_SECURITY_TOKEN', 'SALESFORCE_LOGIN_URL'],
    implementation: `/**
 * Authenticates with Salesforce using username/password OAuth flow
 * @returns Promise with access token and instance URL
 */
export async function authenticateWithUsernamePassword(): Promise<{ accessToken: string; instanceUrl: string }> {
  const username = process.env.SALESFORCE_USERNAME;
  const password = process.env.SALESFORCE_PASSWORD;
  const securityToken = process.env.SALESFORCE_SECURITY_TOKEN;
  const loginUrl = process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com';

  if (!username || !password) {
    throw new Error('SALESFORCE_USERNAME and SALESFORCE_PASSWORD environment variables are required');
  }

  const response = await fetch(\`\${loginUrl}/services/oauth2/token\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: process.env.SALESFORCE_CLIENT_ID || '',
      client_secret: process.env.SALESFORCE_CLIENT_SECRET || '',
      username: username,
      password: password + (securityToken || ''),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(\`Authentication failed: \${response.status} \${response.statusText} - \${errorText}\`);
  }

  const data = await response.json() as { access_token: string; instance_url: string };
  return {
    accessToken: data.access_token,
    instanceUrl: data.instance_url,
  };
}`,
  };
}

/**
 * Generates authentication helper for configured org connection
 */
export function generateConfiguredConnectionAuthHelper(): AuthenticationHelperDefinition {
  return {
    helperName: 'getConfiguredConnection',
    authType: 'configuredConnection',
    configVariables: ['SALESFORCE_ACCESS_TOKEN', 'SALESFORCE_INSTANCE_URL'],
    implementation: `/**
 * Gets authentication from configured Salesforce org connection
 * @returns Promise with access token and instance URL
 */
export async function getConfiguredConnection(): Promise<{ accessToken: string; instanceUrl: string }> {
  const accessToken = process.env.SALESFORCE_ACCESS_TOKEN;
  const instanceUrl = process.env.SALESFORCE_INSTANCE_URL;

  if (!accessToken || !instanceUrl) {
    throw new Error('SALESFORCE_ACCESS_TOKEN and SALESFORCE_INSTANCE_URL environment variables are required');
  }

  return {
    accessToken,
    instanceUrl,
  };
}`,
  };
}

/**
 * Generates all authentication helpers based on configuration
 */
export function generateAuthenticationHelpers(
  authApproach: 'helpers' | 'configuredConnection' | 'both'
): AuthenticationHelperDefinition[] {
  const helpers: AuthenticationHelperDefinition[] = [];

  if (authApproach === 'helpers' || authApproach === 'both') {
    helpers.push(generateUsernamePasswordAuthHelper());
  }

  if (authApproach === 'configuredConnection' || authApproach === 'both') {
    helpers.push(generateConfiguredConnectionAuthHelper());
  }

  logger.debug({ authApproach, helperCount: helpers.length }, 'Generated authentication helpers');
  return helpers;
}

