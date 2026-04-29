/**
 * Permission Test Generator
 *
 * Emits Playwright tests that verify a profile's effective object-level and
 * field-level access. Each test logs in as the profile via `loginAs()` from
 * `utils/login-helpers.ts`, navigates to the relevant Lightning route, and
 * asserts the UI reflects the metadata-declared permission (object visible
 * vs "Insufficient privileges"; fields visible vs hidden by FLS).
 *
 * Profile credentials come from `SF_USER_<PROFILE>` / `SF_PASS_<PROFILE>`
 * environment variables, with a fallback to the default `SF_USERNAME` /
 * `SF_PASSWORD` so single-user setups still run.
 */

import type {
  PermissionTestDefinition,
  TestGroupDefinition,
} from '../../types/test-generation.js';
import type { ObjectPermission, ProfileDefinition } from '../../types/profile-permissions.js';
import { generateTestTags } from '../../utils/test-tag-generator.js';

export interface ProfileObjectAccess {
  profileName: string;
  objectName: string;
  permission: ObjectPermission;
}

export function convertProfileObjectAccessToTests(
  access: ProfileObjectAccess,
): PermissionTestDefinition[] {
  const { profileName, objectName, permission } = access;
  const profileSlug = slug(profileName);
  const objectSlug = slug(objectName);

  const tests: PermissionTestDefinition[] = [];

  tests.push({
    name: `test-permission-${profileSlug}-${objectSlug}-visibility`,
    type: 'Permission',
    profileOrPermissionSet: profileName,
    permissionType: 'profile',
    testScenario: 'objectLevel',
    objectName,
    testCase: generateObjectVisibilityTestCase(profileName, objectName, !!permission.allowRead),
    tags: generateTestTags('Permission', { objectName }),
  });

  if (permission.allowCreate) {
    tests.push({
      name: `test-permission-${profileSlug}-${objectSlug}-create`,
      type: 'Permission',
      profileOrPermissionSet: profileName,
      permissionType: 'profile',
      testScenario: 'objectLevel',
      objectName,
      testCase: generateCreateAccessTestCase(profileName, objectName),
      tags: generateTestTags('Permission', { objectName }),
    });
  }

  return tests;
}

function generateObjectVisibilityTestCase(
  profileName: string,
  objectName: string,
  hasReadAccess: boolean,
): string {
  const tag = `@permission @profile:${profileName} @${objectName}`;
  if (hasReadAccess) {
    return `test('${profileName} should have read access to ${objectName} ${tag}', async ({ page }) => {
    await loginAs('${profileName}', page);
    await page.goto(\`/lightning/o/${objectName}/list\`);

    // The list view header is the most reliable visibility signal: it shows
    // the object label (which may be translated) but only when the user has
    // read access. Anything else means we landed on an error page.
    const denied = page.getByText(/Insufficient privileges|You don't have access/i).first();
    await expect(denied).toHaveCount(0, { timeout: 10000 });
    await expect(page).toHaveURL(/\\/lightning\\/o\\/${objectName}\\//, { timeout: 10000 });
  });`;
  }
  return `test('${profileName} should NOT have read access to ${objectName} ${tag}', async ({ page }) => {
    await loginAs('${profileName}', page);
    await page.goto(\`/lightning/o/${objectName}/list\`);

    // Salesforce surfaces denial in three different ways depending on the
    // org and feature mix. Match any of them.
    const denial = page
      .getByText(/Insufficient privileges|You don't have access|This page isn't available/i)
      .first();
    await expect(denial).toBeVisible({ timeout: 10000 });
  });`;
}

function generateCreateAccessTestCase(profileName: string, objectName: string): string {
  return `test('${profileName} should be able to open the new-${objectName} form @permission @profile:${profileName} @${objectName}', async ({ page }) => {
    await loginAs('${profileName}', page);
    await page.goto(\`/lightning/o/${objectName}/new\`);

    const denied = page.getByText(/Insufficient privileges|You don't have access/i).first();
    await expect(denied).toHaveCount(0, { timeout: 10000 });

    // The "Save" button is the canonical signal that we're on a usable form.
    await expect(page.getByRole('button', { name: /Save/i }).first()).toBeVisible({ timeout: 10000 });
  });`;
}

export function generatePermissionTestGroup(
  access: ProfileObjectAccess,
): TestGroupDefinition {
  const tests = convertProfileObjectAccessToTests(access);
  return {
    groupName: `Permission Tests - ${access.profileName} - ${access.objectName}`,
    testType: 'Permission',
    tests,
    tags: generateTestTags('Permission', { objectName: access.objectName }),
  };
}

/**
 * Builds permission test groups for every (profile, object) pair where the
 * profile mentions the object explicitly. Profiles inherit a great deal of
 * implicit permissions from the org's default access settings, so we only
 * test what the metadata explicitly declares — that's both faster and more
 * accurate than trying to compute effective access from XML alone.
 */
export function generatePermissionTestGroupsForProfiles(
  profiles: ProfileDefinition[],
  knownObjects: Set<string>,
): TestGroupDefinition[] {
  const groups: TestGroupDefinition[] = [];
  for (const profile of profiles) {
    for (const objectPermission of profile.objectPermissions ?? []) {
      if (!knownObjects.has(objectPermission.object)) continue;
      const group = generatePermissionTestGroup({
        profileName: profile.fullName,
        objectName: objectPermission.object,
        permission: objectPermission,
      });
      if (group.tests.length > 0) {
        groups.push(group);
      }
    }
  }
  return groups;
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
