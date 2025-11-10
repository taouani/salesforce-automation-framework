/**
 * Parser for Salesforce permission set XML files
 */

import { parseXMLFile } from './xml-parser.js';
import type {
  PermissionSetDefinition,
  ObjectPermission,
  FieldPermission,
  ClassPermission,
  PagePermission,
  UserPermission,
  ApplicationPermission,
  TabSetting,
} from '../types/profile-permissions.js';
import { logger } from '../utils/logger.js';
import { XMLStructureError } from '../utils/xml-errors.js';

/**
 * Raw permission set XML structure (similar to profile)
 */
interface RawPermissionSetXML {
  PermissionSet?: {
    fullName?: string;
    label?: string;
    description?: string;
    objectPermissions?: RawObjectPermissionXML | RawObjectPermissionXML[];
    fieldPermissions?: RawFieldPermissionXML | RawFieldPermissionXML[];
    classAccesses?: RawClassPermissionXML | RawClassPermissionXML[];
    pageAccesses?: RawPagePermissionXML | RawPagePermissionXML[];
    userPermissions?: RawUserPermissionXML | RawUserPermissionXML[];
    applicationVisibilities?: RawApplicationPermissionXML | RawApplicationPermissionXML[];
    tabVisibilities?: RawTabSettingXML | RawTabSettingXML[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface RawObjectPermissionXML {
  object?: string;
  allowCreate?: boolean | string;
  allowRead?: boolean | string;
  allowEdit?: boolean | string;
  allowDelete?: boolean | string;
  viewAllRecords?: boolean | string;
  modifyAllRecords?: boolean | string;
  [key: string]: unknown;
}

interface RawFieldPermissionXML {
  field?: string;
  readable?: boolean | string;
  editable?: boolean | string;
  [key: string]: unknown;
}

interface RawClassPermissionXML {
  apexClass?: string;
  enabled?: boolean | string;
  [key: string]: unknown;
}

interface RawPagePermissionXML {
  apexPage?: string;
  enabled?: boolean | string;
  [key: string]: unknown;
}

interface RawUserPermissionXML {
  name?: string;
  enabled?: boolean | string;
  [key: string]: unknown;
}

interface RawApplicationPermissionXML {
  application?: string;
  enabled?: boolean | string;
  [key: string]: unknown;
}

interface RawTabSettingXML {
  tab?: string;
  visibility?: string;
  [key: string]: unknown;
}

/**
 * Converts boolean/string to boolean
 */
function toBoolean(value: boolean | string | undefined): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return false;
}

/**
 * Normalizes array - converts single item to array
 */
function normalizeArray<T>(item: T | T[] | undefined): T[] {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

/**
 * Extracts fullName from file path (e.g., "path/to/MyPermSet.permissionset-meta.xml" -> "MyPermSet")
 */
function extractFullNameFromPath(filePath: string): string {
  const fileName = filePath.split('/').pop() || '';
  // Remove .permissionset-meta.xml extension
  return fileName.replace(/\.permissionset-meta\.xml$/, '');
}

/**
 * Parses a permission set XML file
 */
export async function parsePermissionSetXML(filePath: string): Promise<PermissionSetDefinition> {
  try {
    // Permission sets have similar structure to profiles, reuse parsing logic
    const rawXML = await parseXMLFile<RawPermissionSetXML>(filePath);
    const permissionSet = rawXML.PermissionSet;

    if (!permissionSet) {
      throw new XMLStructureError('Missing PermissionSet element', filePath);
    }

    // fullName might not be in XML, extract from filename if missing
    const fullName = permissionSet.fullName || extractFullNameFromPath(filePath);
    
    if (!fullName) {
      throw new XMLStructureError('Could not determine fullName for PermissionSet', filePath);
    }

    // Parse permissions (same structure as profile)
    const rawObjectPermissions = normalizeArray(permissionSet.objectPermissions);
    const objectPermissions: ObjectPermission[] = rawObjectPermissions.map((op) => ({
      object: op.object || '',
      allowCreate: toBoolean(op.allowCreate),
      allowRead: toBoolean(op.allowRead),
      allowEdit: toBoolean(op.allowEdit),
      allowDelete: toBoolean(op.allowDelete),
      viewAllRecords: toBoolean(op.viewAllRecords),
      modifyAllRecords: toBoolean(op.modifyAllRecords),
    }));

    const rawFieldPermissions = normalizeArray(permissionSet.fieldPermissions);
    const fieldPermissions: FieldPermission[] = rawFieldPermissions.map((fp) => ({
      field: fp.field || '',
      readable: toBoolean(fp.readable),
      editable: toBoolean(fp.editable),
    }));

    const rawClassAccesses = normalizeArray(permissionSet.classAccesses);
    const classAccesses: ClassPermission[] = rawClassAccesses.map((ca) => ({
      apexClass: ca.apexClass || '',
      enabled: toBoolean(ca.enabled),
    }));

    const rawPageAccesses = normalizeArray(permissionSet.pageAccesses);
    const pageAccesses: PagePermission[] = rawPageAccesses.map((pa) => ({
      apexPage: pa.apexPage || '',
      enabled: toBoolean(pa.enabled),
    }));

    const rawUserPermissions = normalizeArray(permissionSet.userPermissions);
    const userPermissions: UserPermission[] = rawUserPermissions.map((up) => ({
      name: up.name || '',
      enabled: toBoolean(up.enabled),
    }));

    const rawApplicationVisibilities = normalizeArray(permissionSet.applicationVisibilities);
    const applicationVisibilities: ApplicationPermission[] = rawApplicationVisibilities.map(
      (av) => ({
        application: av.application || '',
        enabled: toBoolean(av.enabled),
      })
    );

    const rawTabVisibilities = normalizeArray(permissionSet.tabVisibilities);
    const tabVisibilities: TabSetting[] = rawTabVisibilities.map((tv) => ({
      tab: tv.tab || '',
      visibility: (tv.visibility as TabSetting['visibility']) || 'Hidden',
    }));

    const permSetDef: PermissionSetDefinition = {
      fullName,
      label: permissionSet.label || undefined,
      description: permissionSet.description || undefined,
      objectPermissions,
      fieldPermissions,
      classAccesses,
      pageAccesses,
      userPermissions,
      applicationVisibilities,
      tabVisibilities,
    };

    // Copy any additional properties
    for (const [key, value] of Object.entries(permissionSet)) {
      if (!(key in permSetDef)) {
        permSetDef[key] = value;
      }
    }

    logger.debug(
      { filePath, permissionSetName: permSetDef.fullName },
      'Permission set XML parsed successfully'
    );

    return permSetDef;
  } catch (error) {
    logger.warn({ filePath, error }, 'Failed to parse permission set XML');
    throw error;
  }
}

