/**
 * Type definitions for profile and permission set structures
 */

/**
 * Object permission definition
 */
export interface ObjectPermission {
  object: string;
  allowCreate?: boolean;
  allowRead?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  viewAllRecords?: boolean;
  modifyAllRecords?: boolean;
}

/**
 * Field permission definition
 */
export interface FieldPermission {
  field: string;
  readable?: boolean;
  editable?: boolean;
}

/**
 * Class permission definition
 */
export interface ClassPermission {
  apexClass: string;
  enabled: boolean;
}

/**
 * Page permission definition
 */
export interface PagePermission {
  apexPage: string;
  enabled: boolean;
}

/**
 * User permission definition
 */
export interface UserPermission {
  name: string;
  enabled: boolean;
}

/**
 * Application permission definition
 */
export interface ApplicationPermission {
  application: string;
  enabled: boolean;
}

/**
 * Tab setting definition
 */
export interface TabSetting {
  tab: string;
  visibility: 'Hidden' | 'DefaultOff' | 'DefaultOn';
}

/**
 * Profile definition parsed from XML
 */
export interface ProfileDefinition {
  fullName: string;
  label?: string;
  description?: string;
  objectPermissions: ObjectPermission[];
  fieldPermissions: FieldPermission[];
  classAccesses: ClassPermission[];
  pageAccesses: PagePermission[];
  userPermissions: UserPermission[];
  applicationVisibilities: ApplicationPermission[];
  tabVisibilities: TabSetting[];
  [key: string]: unknown; // Allow additional properties from XML
}

/**
 * Permission set definition parsed from XML
 */
export interface PermissionSetDefinition {
  fullName: string;
  label?: string;
  description?: string;
  objectPermissions: ObjectPermission[];
  fieldPermissions: FieldPermission[];
  classAccesses: ClassPermission[];
  pageAccesses: PagePermission[];
  userPermissions: UserPermission[];
  applicationVisibilities: ApplicationPermission[];
  tabVisibilities: TabSetting[];
  [key: string]: unknown; // Allow additional properties from XML
}

/**
 * Permission set group definition
 */
export interface PermissionSetGroup {
  fullName: string;
  label?: string;
  description?: string;
  permissionSets: string[];
  mutingPermissions?: MutingPermission[];
}

/**
 * Muting permission definition
 */
export interface MutingPermission {
  permissionSet: string;
  mutingPermissionSet: string;
}

/**
 * Custom permission definition
 */
export interface CustomPermission {
  fullName: string;
  label?: string;
  description?: string;
}

