/**
 * Type definitions for parsed Apex code structures
 */

/**
 * Access modifier types
 */
export type AccessModifier = 'public' | 'private' | 'global' | 'protected';

/**
 * Sharing modifier types
 */
export type SharingModifier = 'with sharing' | 'without sharing' | 'inherited sharing';

/**
 * Annotation definition
 */
export interface AnnotationDefinition {
  name: string; // @isTest, @RestResource, etc.
  parameters?: Record<string, unknown>; // Annotation parameters if any
  [key: string]: unknown;
}

/**
 * Apex property definition
 */
export interface ApexPropertyDefinition {
  name: string;
  type?: string; // Property type
  accessModifier?: AccessModifier;
  isStatic: boolean;
  isFinal: boolean;
  isTransient?: boolean; // transient keyword
  defaultValue?: unknown; // Initial value if present
  annotations?: AnnotationDefinition[];
  [key: string]: unknown;
}

/**
 * Apex method parameter definition
 */
export interface ApexParameterDefinition {
  name: string;
  type?: string; // Parameter type
  defaultValue?: unknown; // Default value if any
  [key: string]: unknown;
}

/**
 * Apex method definition
 */
export interface ApexMethodDefinition {
  name: string;
  parameters: ApexParameterDefinition[];
  returnType?: string; // Return type (void, primitive, SObject, custom)
  accessModifier?: AccessModifier;
  isStatic: boolean;
  annotations?: AnnotationDefinition[];
  exceptions?: string[]; // Thrown exceptions (throws clause)
  isTestMethod: boolean; // @isTest or testMethod
  isTestSetup: boolean; // @TestSetup
  [key: string]: unknown;
}

/**
 * Inner class definition (nested classes)
 */
export interface InnerClassDefinition {
  name: string;
  accessModifier?: AccessModifier;
  annotations?: AnnotationDefinition[];
  methods: ApexMethodDefinition[];
  properties: ApexPropertyDefinition[];
  innerClasses?: InnerClassDefinition[]; // Nested inner classes
  [key: string]: unknown;
}

/**
 * Apex class definition
 */
export interface ApexClassDefinition {
  name: string; // Class name
  annotations?: AnnotationDefinition[]; // @isTest, @RestResource, etc.
  accessModifier?: AccessModifier; // public, private, global
  sharingModifier?: SharingModifier; // with sharing, without sharing
  superclass?: string; // extends keyword
  interfaces?: string[]; // implements keyword
  methods: ApexMethodDefinition[];
  properties: ApexPropertyDefinition[];
  innerClasses?: InnerClassDefinition[];
  isTestClass: boolean; // @isTest annotation
  implementsBatchable?: boolean; // Database.Batchable
  implementsQueueable?: boolean; // Queueable
  implementsSchedulable?: boolean; // Schedulable
  [key: string]: unknown;
}

/**
 * Trigger event type
 */
export type TriggerEventType = 
  | 'before insert'
  | 'after insert'
  | 'before update'
  | 'after update'
  | 'before delete'
  | 'after delete'
  | 'after undelete';

/**
 * Trigger event definition
 */
export interface TriggerEventDefinition {
  type: TriggerEventType;
  [key: string]: unknown;
}

/**
 * Apex trigger definition
 */
export interface ApexTriggerDefinition {
  name: string; // Trigger name
  objects: string[]; // Object(s) the trigger operates on
  events: TriggerEventType[]; // Trigger events
  usesTriggerNew?: boolean; // Uses Trigger.new
  usesTriggerOld?: boolean; // Uses Trigger.old
  usesTriggerNewMap?: boolean; // Uses Trigger.newMap
  usesTriggerOldMap?: boolean; // Uses Trigger.oldMap
  dmlOperations?: DMLOperationDefinition[]; // DML operations in trigger
  [key: string]: unknown;
}

/**
 * SOQL clause definition
 */
export interface SOQLClauseDefinition {
  type: 'WHERE' | 'ORDER BY' | 'GROUP BY' | 'HAVING' | 'LIMIT';
  content: string; // Clause content
  parsed?: Record<string, unknown>; // Parsed structure if available
  [key: string]: unknown;
}

/**
 * SOQL query definition
 */
export interface SOQLQueryDefinition {
  queryString: string; // Full query string
  object?: string; // Object being queried (FROM clause)
  fields?: string[]; // Fields selected (SELECT clause)
  whereClause?: SOQLClauseDefinition; // WHERE clause
  orderByClause?: SOQLClauseDefinition; // ORDER BY clause
  groupByClause?: SOQLClauseDefinition; // GROUP BY clause
  havingClause?: SOQLClauseDefinition; // HAVING clause
  limitClause?: SOQLClauseDefinition; // LIMIT clause
  isDynamic: boolean; // Dynamic SOQL (Database.query) vs static ([SELECT ...])
  context?: string; // Method where query is executed
  [key: string]: unknown;
}

/**
 * DML operation type
 */
export type DMLOperationType = 'insert' | 'update' | 'upsert' | 'delete' | 'undelete';

/**
 * DML options definition
 */
export interface DMLOptionsDefinition {
  allOrNothing?: boolean; // Database.insert/update allOrNothing parameter
  externalIdField?: string; // Database.upsert externalIdField parameter
  [key: string]: unknown;
}

/**
 * DML operation definition
 */
export interface DMLOperationDefinition {
  operationType: DMLOperationType;
  objects?: string[]; // Objects/records being operated on
  isBulk: boolean; // Bulk operation (List) vs single record
  isDatabaseMethod: boolean; // Database.insert vs insert
  options?: DMLOptionsDefinition; // Database method options
  context?: string; // Method where DML is executed
  [key: string]: unknown;
}

/**
 * Apex-to-object relationship type
 */
export type ApexToObjectRelationshipType = 
  | 'SOQL' 
  | 'DML' 
  | 'parameter' 
  | 'return type' 
  | 'trigger';

/**
 * Apex-to-object mapping definition
 */
export interface ApexToObjectMapping {
  apexClassName: string; // Apex class or trigger name
  objectName: string; // Salesforce object name
  relationshipType: ApexToObjectRelationshipType;
  details?: Record<string, unknown>; // Additional relationship details
  [key: string]: unknown;
}

/**
 * HTTP callout definition
 */
export interface HTTPCalloutDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint?: string; // REST API endpoint
  annotations?: AnnotationDefinition[]; // @HttpPost, @HttpGet, etc.
  context?: string; // Method where callout is made
  [key: string]: unknown;
}

/**
 * Batch class definition
 */
export interface BatchClassDefinition {
  className: string;
  implementsBatchable: boolean;
  batchSize?: number; // If specified
  [key: string]: unknown;
}

/**
 * Queueable class definition
 */
export interface QueueableClassDefinition {
  className: string;
  implementsQueueable: boolean;
  [key: string]: unknown;
}

/**
 * Schedulable class definition
 */
export interface SchedulableClassDefinition {
  className: string;
  implementsSchedulable: boolean;
  scheduleExpression?: string; // Cron expression if available
  [key: string]: unknown;
}

/**
 * Invocable method definition
 */
export interface InvocableMethodDefinition {
  methodName: string;
  className: string;
  label?: string; // Invocable method label
  description?: string; // Invocable method description
  [key: string]: unknown;
}

/**
 * Aura-enabled method definition
 */
export interface AuraEnabledMethodDefinition {
  methodName: string;
  className: string;
  cacheable?: boolean; // @AuraEnabled(cacheable=true)
  [key: string]: unknown;
}

