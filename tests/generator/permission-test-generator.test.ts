/**
 * Tests for permission test generator
 */

import { describe, it, expect } from 'vitest';
import {
  convertPermissionsToTests,
  generatePermissionTestGroup,
} from '../../src/generator/test-specs/permission-test-generator.js';

describe('Permission Test Generator', () => {
  describe('convertPermissionsToTests', () => {
    it('should generate test for profile and object combination', () => {
      const tests = convertPermissionsToTests('System Administrator', 'Account');

      expect(tests).toHaveLength(1);
      expect(tests[0].profileOrPermissionSet).toBe('System Administrator');
      expect(tests[0].objectName).toBe('Account');
      expect(tests[0].permissionType).toBe('profile');
      expect(tests[0].testScenario).toBe('objectLevel');
    });

    it('should include tags in test definitions', () => {
      const tests = convertPermissionsToTests('System Administrator', 'Account');

      expect(tests[0].tags).toBeDefined();
      expect(tests[0].tags).toContain('@permission');
      expect(tests[0].tags).toContain('@Account');
    });

    it('should generate test names with profile and object names', () => {
      const tests = convertPermissionsToTests('System Administrator', 'Account');

      expect(tests[0].name).toContain('permission');
      expect(tests[0].name).toContain('system administrator');
      expect(tests[0].name).toContain('account');
    });
  });

  describe('generatePermissionTestGroup', () => {
    it('should generate test group with correct structure', () => {
      const testGroup = generatePermissionTestGroup('System Administrator', 'Account');

      expect(testGroup.groupName).toBe('Permission Tests - System Administrator - Account');
      expect(testGroup.testType).toBe('Permission');
      expect(testGroup.tests).toHaveLength(1);
      expect(testGroup.tags).toBeDefined();
      expect(testGroup.tags).toContain('@permission');
      expect(testGroup.tags).toContain('@Account');
    });

    it('should include tags in test case', () => {
      const testGroup = generatePermissionTestGroup('System Administrator', 'Account');

      expect(testGroup.tests[0].testCase).toContain('@permission');
      expect(testGroup.tests[0].testCase).toContain('@Account');
    });
  });
});

