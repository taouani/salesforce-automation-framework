/**
 * Extended MetadataRegistry with parsed XML data support
 */

import { MetadataRegistry } from './metadata-registry.js';
import type { ObjectDefinition } from '../types/xml-parsed.js';
import type {
  ProfileDefinition,
  PermissionSetDefinition,
} from '../types/profile-permissions.js';

/**
 * Extended metadata registry that stores parsed XML data alongside discovery metadata
 */
export class ExtendedMetadataRegistry extends MetadataRegistry {
  private parsedObjects: Map<string, ObjectDefinition> = new Map();
  private parsedProfiles: Map<string, ProfileDefinition> = new Map();
  private parsedPermissionSets: Map<string, PermissionSetDefinition> = new Map();

  /**
   * Stores a parsed object definition
   */
  addParsedObject(object: ObjectDefinition): void {
    this.parsedObjects.set(object.fullName, object);
  }

  /**
   * Stores a parsed profile definition
   */
  addParsedProfile(profile: ProfileDefinition): void {
    this.parsedProfiles.set(profile.fullName, profile);
  }

  /**
   * Stores a parsed permission set definition
   */
  addParsedPermissionSet(permissionSet: PermissionSetDefinition): void {
    this.parsedPermissionSets.set(permissionSet.fullName, permissionSet);
  }

  /**
   * Gets a parsed object definition
   */
  getParsedObject(objectName: string): ObjectDefinition | undefined {
    return this.parsedObjects.get(objectName);
  }

  /**
   * Gets a parsed profile definition
   */
  getParsedProfile(profileName: string): ProfileDefinition | undefined {
    return this.parsedProfiles.get(profileName);
  }

  /**
   * Gets a parsed permission set definition
   */
  getParsedPermissionSet(permSetName: string): PermissionSetDefinition | undefined {
    return this.parsedPermissionSets.get(permSetName);
  }

  /**
   * Gets all parsed objects
   */
  getAllParsedObjects(): ObjectDefinition[] {
    return Array.from(this.parsedObjects.values());
  }

  /**
   * Gets all parsed profiles
   */
  getAllParsedProfiles(): ProfileDefinition[] {
    return Array.from(this.parsedProfiles.values());
  }

  /**
   * Gets all parsed permission sets
   */
  getAllParsedPermissionSets(): PermissionSetDefinition[] {
    return Array.from(this.parsedPermissionSets.values());
  }
}

