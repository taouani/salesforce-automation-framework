/**
 * Type definitions for XML parsing results structure
 */

import type { ObjectDefinition } from './xml-parsed.js';
import type { ProfileDefinition, PermissionSetDefinition } from './profile-permissions.js';
import type { RelationshipGraph } from './relationship-graph.js';

/**
 * Complete XML parsing results
 */
export interface ParsedXMLResults {
  objects: Map<string, ObjectDefinition>;
  profiles: Map<string, ProfileDefinition>;
  permissionSets: Map<string, PermissionSetDefinition>;
  relationshipGraph: RelationshipGraph;
  parsedAt: string;
  toJSON(): ParsedXMLResultsJSON;
}

/**
 * JSON representation of parsed XML results for persistence
 */
export interface ParsedXMLResultsJSON {
  objects: ObjectDefinition[];
  profiles: ProfileDefinition[];
  permissionSets: PermissionSetDefinition[];
  relationshipGraph: unknown; // RelationshipGraphJSON
  parsedAt: string;
}

