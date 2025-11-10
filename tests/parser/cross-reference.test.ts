/**
 * Tests for cross-referencing system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CrossReferenceBuilder } from '../../src/parser/cross-reference.js';
import type { ProfileDefinition, PermissionSetDefinition } from '../../src/types/profile-permissions.js';
import type { ObjectDefinition } from '../../src/types/xml-parsed.js';

describe('CrossReferenceBuilder', () => {
  let builder: CrossReferenceBuilder;

  beforeEach(() => {
    builder = new CrossReferenceBuilder();
  });

  it('should build cross-references between profiles and objects', () => {
    const profiles: ProfileDefinition[] = [
      {
        fullName: 'Admin',
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
    ];

    const objects: ObjectDefinition[] = [
      {
        fullName: 'Account',
        fields: [],
        validationRules: [],
        recordTypes: [],
        relationships: [],
      },
    ];

    builder.buildCrossReferences(profiles, [], objects);

    const profilesForAccount = builder.getProfilesForObject('Account');
    expect(profilesForAccount).toContain('Admin');

    const objectsForAdmin = builder.getObjectsForProfile('Admin');
    expect(objectsForAdmin).toContain('Account');
  });

  it('should build cross-references between permission sets and objects', () => {
    const permissionSets: PermissionSetDefinition[] = [
      {
        fullName: 'CustomPermSet',
        objectPermissions: [
          {
            object: 'Contact',
            allowCreate: true,
            allowRead: true,
          },
        ],
        fieldPermissions: [],
        classAccesses: [],
        pageAccesses: [],
        userPermissions: [],
        applicationVisibilities: [],
        tabVisibilities: [],
      },
    ];

    const objects: ObjectDefinition[] = [
      {
        fullName: 'Contact',
        fields: [],
        validationRules: [],
        recordTypes: [],
        relationships: [],
      },
    ];

    builder.buildCrossReferences([], permissionSets, objects);

    const permSetsForContact = builder.getPermissionSetsForObject('Contact');
    expect(permSetsForContact).toContain('CustomPermSet');
  });

  it('should build field-level cross-references', () => {
    const profiles: ProfileDefinition[] = [
      {
        fullName: 'Admin',
        objectPermissions: [],
        fieldPermissions: [
          {
            field: 'Account.Name',
            readable: true,
            editable: true,
          },
        ],
        classAccesses: [],
        pageAccesses: [],
        userPermissions: [],
        applicationVisibilities: [],
        tabVisibilities: [],
      },
    ];

    builder.buildCrossReferences(profiles, [], []);

    const profilesForField = builder.getProfilesForField('Account.Name');
    expect(profilesForField).toContain('Admin');
  });
});

