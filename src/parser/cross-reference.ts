/**
 * Cross-referencing system for profiles, permission sets, and objects
 */

import type { ProfileDefinition, PermissionSetDefinition } from '../types/profile-permissions.js';
import type { ObjectDefinition } from '../types/xml-parsed.js';

/**
 * Cross-reference mapping structure
 */
export interface CrossReferenceMap {
  objectToProfiles: Map<string, Set<string>>;
  objectToPermissionSets: Map<string, Set<string>>;
  fieldToProfiles: Map<string, Set<string>>;
  fieldToPermissionSets: Map<string, Set<string>>;
  profileToObjects: Map<string, Set<string>>;
  profileToFields: Map<string, Set<string>>;
  permissionSetToObjects: Map<string, Set<string>>;
  permissionSetToFields: Map<string, Set<string>>;
}

/**
 * Cross-reference builder
 */
export class CrossReferenceBuilder {
  private map: CrossReferenceMap = {
    objectToProfiles: new Map(),
    objectToPermissionSets: new Map(),
    fieldToProfiles: new Map(),
    fieldToPermissionSets: new Map(),
    profileToObjects: new Map(),
    profileToFields: new Map(),
    permissionSetToObjects: new Map(),
    permissionSetToFields: new Map(),
  };

  /**
   * Builds cross-references from profiles and objects
   */
  buildCrossReferences(
    profiles: ProfileDefinition[],
    permissionSets: PermissionSetDefinition[],
    objects: ObjectDefinition[]
  ): void {
    // Build object name set for quick lookup
    const objectNames = new Set(objects.map((obj) => obj.fullName));

    // Process profiles
    for (const profile of profiles) {
      const profileName = profile.fullName;

      // Process object permissions
      for (const objPerm of profile.objectPermissions) {
        if (objectNames.has(objPerm.object)) {
          // Object to profile mapping
          if (!this.map.objectToProfiles.has(objPerm.object)) {
            this.map.objectToProfiles.set(objPerm.object, new Set());
          }
          this.map.objectToProfiles.get(objPerm.object)!.add(profileName);

          // Profile to object mapping
          if (!this.map.profileToObjects.has(profileName)) {
            this.map.profileToObjects.set(profileName, new Set());
          }
          this.map.profileToObjects.get(profileName)!.add(objPerm.object);
        }
      }

      // Process field permissions
      for (const fieldPerm of profile.fieldPermissions) {
        const fieldKey = this.getFieldKey(fieldPerm.field);
        if (fieldKey) {
          // Field to profile mapping
          if (!this.map.fieldToProfiles.has(fieldKey)) {
            this.map.fieldToProfiles.set(fieldKey, new Set());
          }
          this.map.fieldToProfiles.get(fieldKey)!.add(profileName);

          // Profile to field mapping
          if (!this.map.profileToFields.has(profileName)) {
            this.map.profileToFields.set(profileName, new Set());
          }
          this.map.profileToFields.get(profileName)!.add(fieldKey);
        }
      }
    }

    // Process permission sets
    for (const permSet of permissionSets) {
      const permSetName = permSet.fullName;

      // Process object permissions
      for (const objPerm of permSet.objectPermissions) {
        if (objectNames.has(objPerm.object)) {
          // Object to permission set mapping
          if (!this.map.objectToPermissionSets.has(objPerm.object)) {
            this.map.objectToPermissionSets.set(objPerm.object, new Set());
          }
          this.map.objectToPermissionSets.get(objPerm.object)!.add(permSetName);

          // Permission set to object mapping
          if (!this.map.permissionSetToObjects.has(permSetName)) {
            this.map.permissionSetToObjects.set(permSetName, new Set());
          }
          this.map.permissionSetToObjects.get(permSetName)!.add(objPerm.object);
        }
      }

      // Process field permissions
      for (const fieldPerm of permSet.fieldPermissions) {
        const fieldKey = this.getFieldKey(fieldPerm.field);
        if (fieldKey) {
          // Field to permission set mapping
          if (!this.map.fieldToPermissionSets.has(fieldKey)) {
            this.map.fieldToPermissionSets.set(fieldKey, new Set());
          }
          this.map.fieldToPermissionSets.get(fieldKey)!.add(permSetName);

          // Permission set to field mapping
          if (!this.map.permissionSetToFields.has(permSetName)) {
            this.map.permissionSetToFields.set(permSetName, new Set());
          }
          this.map.permissionSetToFields.get(permSetName)!.add(fieldKey);
        }
      }
    }
  }

  /**
   * Extracts object and field name from field permission field name (e.g., "Account.Name")
   */
  private getFieldKey(fieldName: string): string | null {
    if (!fieldName || !fieldName.includes('.')) {
      return null;
    }
    return fieldName; // Return full field name like "Account.Name"
  }

  /**
   * Gets profiles that affect an object
   */
  getProfilesForObject(objectName: string): string[] {
    const profiles = this.map.objectToProfiles.get(objectName);
    return profiles ? Array.from(profiles) : [];
  }

  /**
   * Gets permission sets that affect an object
   */
  getPermissionSetsForObject(objectName: string): string[] {
    const permSets = this.map.objectToPermissionSets.get(objectName);
    return permSets ? Array.from(permSets) : [];
  }

  /**
   * Gets profiles/permission sets that affect a field
   */
  getProfilesForField(fieldKey: string): string[] {
    const profiles = this.map.fieldToProfiles.get(fieldKey);
    return profiles ? Array.from(profiles) : [];
  }

  /**
   * Gets permission sets that affect a field
   */
  getPermissionSetsForField(fieldKey: string): string[] {
    const permSets = this.map.fieldToPermissionSets.get(fieldKey);
    return permSets ? Array.from(permSets) : [];
  }

  /**
   * Gets objects accessible by a profile
   */
  getObjectsForProfile(profileName: string): string[] {
    const objects = this.map.profileToObjects.get(profileName);
    return objects ? Array.from(objects) : [];
  }

  /**
   * Gets fields accessible by a profile
   */
  getFieldsForProfile(profileName: string): string[] {
    const fields = this.map.profileToFields.get(profileName);
    return fields ? Array.from(fields) : [];
  }

  /**
   * Gets objects accessible by a permission set
   */
  getObjectsForPermissionSet(permSetName: string): string[] {
    const objects = this.map.permissionSetToObjects.get(permSetName);
    return objects ? Array.from(objects) : [];
  }

  /**
   * Gets fields accessible by a permission set
   */
  getFieldsForPermissionSet(permSetName: string): string[] {
    const fields = this.map.permissionSetToFields.get(permSetName);
    return fields ? Array.from(fields) : [];
  }

  /**
   * Gets the cross-reference map
   */
  getMap(): CrossReferenceMap {
    return this.map;
  }
}

