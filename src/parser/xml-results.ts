/**
 * XML parsing results structure implementation
 */

import type { ObjectDefinition } from '../types/xml-parsed.js';
import type {
  ProfileDefinition,
  PermissionSetDefinition,
} from '../types/profile-permissions.js';
import type { RelationshipGraph } from '../types/relationship-graph.js';
import type { ParsedXMLResults, ParsedXMLResultsJSON } from '../types/xml-results.js';

/**
 * Implementation of ParsedXMLResults
 */
export class ParsedXMLResultsImpl implements ParsedXMLResults {
  objects: Map<string, ObjectDefinition> = new Map();
  profiles: Map<string, ProfileDefinition> = new Map();
  permissionSets: Map<string, PermissionSetDefinition> = new Map();
  relationshipGraph: RelationshipGraph;
  parsedAt: string;

  constructor(relationshipGraph: RelationshipGraph) {
    this.relationshipGraph = relationshipGraph;
    this.parsedAt = new Date().toISOString();
  }

  /**
   * Adds an object definition
   */
  addObject(object: ObjectDefinition): void {
    this.objects.set(object.fullName, object);
  }

  /**
   * Adds a profile definition
   */
  addProfile(profile: ProfileDefinition): void {
    this.profiles.set(profile.fullName, profile);
  }

  /**
   * Adds a permission set definition
   */
  addPermissionSet(permissionSet: PermissionSetDefinition): void {
    this.permissionSets.set(permissionSet.fullName, permissionSet);
  }

  /**
   * Gets an object by name
   */
  getObject(objectName: string): ObjectDefinition | undefined {
    return this.objects.get(objectName);
  }

  /**
   * Gets a profile by name
   */
  getProfile(profileName: string): ProfileDefinition | undefined {
    return this.profiles.get(profileName);
  }

  /**
   * Gets a permission set by name
   */
  getPermissionSet(permSetName: string): PermissionSetDefinition | undefined {
    return this.permissionSets.get(permSetName);
  }

  /**
   * Gets fields for an object
   */
  getFieldsForObject(objectName: string) {
    const obj = this.getObject(objectName);
    return obj ? obj.fields : [];
  }

  /**
   * Gets validation rules for an object
   */
  getValidationRulesForObject(objectName: string) {
    const obj = this.getObject(objectName);
    return obj ? obj.validationRules : [];
  }

  /**
   * Gets relationships for an object
   */
  getRelationshipsForObject(objectName: string) {
    return this.relationshipGraph.getRelationships(objectName);
  }

  /**
   * Gets all parsed objects
   */
  getAllParsedObjects(): ObjectDefinition[] {
    return Array.from(this.objects.values());
  }

  /**
   * Gets all parsed profiles
   */
  getAllParsedProfiles(): ProfileDefinition[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Gets all parsed permission sets
   */
  getAllParsedPermissionSets(): PermissionSetDefinition[] {
    return Array.from(this.permissionSets.values());
  }

  /**
   * Converts to JSON format
   */
  toJSON(): ParsedXMLResultsJSON {
    return {
      objects: Array.from(this.objects.values()),
      profiles: Array.from(this.profiles.values()),
      permissionSets: Array.from(this.permissionSets.values()),
      relationshipGraph: this.relationshipGraph.toJSON(),
      parsedAt: this.parsedAt,
    };
  }
}

