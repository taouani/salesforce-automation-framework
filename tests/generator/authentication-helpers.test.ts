/**
 * Tests for authentication helper generators
 */

import { describe, it, expect } from 'vitest';
import {
  generateUsernamePasswordAuthHelper,
  generateJWTAuthHelper,
  generateConfiguredConnectionAuthHelper,
  generateAuthenticationHelpers,
} from '../../src/generator/test-data/authentication-helpers.js';

describe('Authentication Helper Generators', () => {
  it('should generate username/password auth helper', () => {
    const helper = generateUsernamePasswordAuthHelper();
    expect(helper.helperName).toBe('authenticateWithUsernamePassword');
    expect(helper.authType).toBe('usernamePassword');
    expect(helper.configVariables).toContain('SALESFORCE_USERNAME');
    expect(helper.configVariables).toContain('SALESFORCE_PASSWORD');
    expect(helper.implementation).toContain('authenticateWithUsernamePassword');
  });

  it('should generate JWT auth helper', () => {
    const helper = generateJWTAuthHelper();
    expect(helper.helperName).toBe('authenticateWithJWT');
    expect(helper.authType).toBe('jwt');
    expect(helper.configVariables).toContain('SALESFORCE_CLIENT_ID');
    expect(helper.configVariables).toContain('SALESFORCE_JWT_KEY_FILE');
  });

  it('should generate configured connection auth helper', () => {
    const helper = generateConfiguredConnectionAuthHelper();
    expect(helper.helperName).toBe('getConfiguredConnection');
    expect(helper.authType).toBe('configuredConnection');
    expect(helper.configVariables).toContain('SALESFORCE_ACCESS_TOKEN');
    expect(helper.configVariables).toContain('SALESFORCE_INSTANCE_URL');
  });

  it('should generate helpers for "helpers" approach', () => {
    const helpers = generateAuthenticationHelpers('helpers');
    expect(helpers.length).toBe(2);
    expect(helpers.some(h => h.authType === 'usernamePassword')).toBe(true);
    expect(helpers.some(h => h.authType === 'jwt')).toBe(true);
  });

  it('should generate helpers for "configuredConnection" approach', () => {
    const helpers = generateAuthenticationHelpers('configuredConnection');
    expect(helpers.length).toBe(1);
    expect(helpers[0].authType).toBe('configuredConnection');
  });

  it('should generate helpers for "both" approach', () => {
    const helpers = generateAuthenticationHelpers('both');
    expect(helpers.length).toBe(3);
    expect(helpers.some(h => h.authType === 'usernamePassword')).toBe(true);
    expect(helpers.some(h => h.authType === 'jwt')).toBe(true);
    expect(helpers.some(h => h.authType === 'configuredConnection')).toBe(true);
  });
});

