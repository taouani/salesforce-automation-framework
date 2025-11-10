/**
 * Parser for Salesforce profile XML files
 */

import { parseXMLFile } from './xml-parser.js';
import type {
  ProfileDefinition,
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
 * Raw profile XML structure
 */
interface RawProfileXML {
  Profile?: {
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
 * Extracts fullName from file path (e.g., "path/to/Admin.profile-meta.xml" -> "Admin")
 */
function extractFullNameFromPath(filePath: string): string {
  const fileName = filePath.split('/').pop() || '';
  // Remove .profile-meta.xml extension
  return fileName.replace(/\.profile-meta\.xml$/, '');
}

/**
 * Parses a profile XML file
 */
export async function parseProfileXML(filePath: string): Promise<ProfileDefinition> {
  try {
    const rawXML = await parseXMLFile<RawProfileXML>(filePath);
    const profile = rawXML.Profile;

    if (!profile) {
      throw new XMLStructureError('Missing Profile element', filePath);
    }

    // fullName might not be in XML, extract from filename if missing
    const fullName = profile.fullName || extractFullNameFromPath(filePath);
    
    if (!fullName) {
      throw new XMLStructureError('Could not determine fullName for Profile', filePath);
    }

    // Parse object permissions
    const rawObjectPermissions = normalizeArray(profile.objectPermissions);
    const objectPermissions: ObjectPermission[] = rawObjectPermissions.map((op) => ({
      object: op.object || '',
      allowCreate: toBoolean(op.allowCreate),
      allowRead: toBoolean(op.allowRead),
      allowEdit: toBoolean(op.allowEdit),
      allowDelete: toBoolean(op.allowDelete),
      viewAllRecords: toBoolean(op.viewAllRecords),
      modifyAllRecords: toBoolean(op.modifyAllRecords),
    }));

    // Parse field permissions
    const rawFieldPermissions = normalizeArray(profile.fieldPermissions);
    const fieldPermissions: FieldPermission[] = rawFieldPermissions.map((fp) => ({
      field: fp.field || '',
      readable: toBoolean(fp.readable),
      editable: toBoolean(fp.editable),
    }));

    // Parse class accesses
    const rawClassAccesses = normalizeArray(profile.classAccesses);
    const classAccesses: ClassPermission[] = rawClassAccesses.map((ca) => ({
      apexClass: ca.apexClass || '',
      enabled: toBoolean(ca.enabled),
    }));

    // Parse page accesses
    const rawPageAccesses = normalizeArray(profile.pageAccesses);
    const pageAccesses: PagePermission[] = rawPageAccesses.map((pa) => ({
      apexPage: pa.apexPage || '',
      enabled: toBoolean(pa.enabled),
    }));

    // Parse user permissions
    const rawUserPermissions = normalizeArray(profile.userPermissions);
    const userPermissions: UserPermission[] = rawUserPermissions.map((up) => ({
      name: up.name || '',
      enabled: toBoolean(up.enabled),
    }));

    // Parse application visibilities
    const rawApplicationVisibilities = normalizeArray(profile.applicationVisibilities);
    const applicationVisibilities: ApplicationPermission[] = rawApplicationVisibilities.map(
      (av) => ({
        application: av.application || '',
        enabled: toBoolean(av.enabled),
      })
    );

    // Parse tab visibilities
    const rawTabVisibilities = normalizeArray(profile.tabVisibilities);
    const tabVisibilities: TabSetting[] = rawTabVisibilities.map((tv) => ({
      tab: tv.tab || '',
      visibility: (tv.visibility as TabSetting['visibility']) || 'Hidden',
    }));

    const profileDef: ProfileDefinition = {
      fullName,
      label: profile.label || undefined,
      description: profile.description || undefined,
      objectPermissions,
      fieldPermissions,
      classAccesses,
      pageAccesses,
      userPermissions,
      applicationVisibilities,
      tabVisibilities,
    };

    // Copy any additional properties
    for (const [key, value] of Object.entries(profile)) {
      if (!(key in profileDef)) {
        profileDef[key] = value;
      }
    }

    logger.debug({ filePath, profileName: profileDef.fullName }, 'Profile XML parsed successfully');

    return profileDef;
  } catch (error) {
    logger.warn({ filePath, error }, 'Failed to parse profile XML');
    throw error;
  }
}

