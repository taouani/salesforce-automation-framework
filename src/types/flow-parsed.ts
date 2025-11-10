/**
 * Type definitions for parsed Flow structures
 */

/**
 * Flow type enumeration
 */
export type FlowType = 
  | 'Screen'
  | 'Autolaunched'
  | 'RecordTriggered'
  | 'Scheduled'
  | 'PlatformEventTriggered';

/**
 * Flow status enumeration
 */
export type FlowStatus = 'Active' | 'Draft' | 'Obsolete';

/**
 * Flow element type enumeration
 */
export type FlowElementType = 
  | 'Screen'
  | 'Decision'
  | 'Assignment'
  | 'Loop'
  | 'Action'
  | 'Wait'
  | 'RecordLookup'
  | 'RecordCreate'
  | 'RecordUpdate'
  | 'RecordDelete'
  | 'Formula'
  | 'Subflow';

/**
 * Flow variable type enumeration
 */
export type FlowVariableType = 
  | 'String'
  | 'Number'
  | 'Boolean'
  | 'Date'
  | 'DateTime'
  | 'Currency'
  | 'Picklist'
  | 'MultiSelectPicklist'
  | 'Record'
  | 'RecordCollection'
  | 'Text'
  | 'Email'
  | 'Phone'
  | 'URL'
  | 'Percent'
  | 'Time'
  | 'Address'
  | 'Location'
  | 'Complex';

/**
 * Flow decision outcome type enumeration
 */
export type FlowDecisionOutcomeType = 'True' | 'False' | 'Default';

/**
 * Flow trigger type enumeration
 */
export type FlowTriggerType = 
  | 'RecordTriggered'
  | 'Scheduled'
  | 'PlatformEvent'
  | 'Autolaunched';

/**
 * Flow trigger event enumeration
 */
export type FlowTriggerEvent = 
  | 'BeforeSave'
  | 'AfterSave'
  | 'BeforeDelete'
  | 'AfterDelete'
  | 'AfterUndelete';

/**
 * Flow-to-object relationship type enumeration
 */
export type FlowToObjectRelationshipType = 
  | 'lookup'
  | 'create'
  | 'update'
  | 'delete'
  | 'query'
  | 'fieldReference';

/**
 * Flow element connector definition
 */
export interface FlowElementConnector {
  connectorType: string; // next, previous, true, false, default, fault
  targetElement?: string; // API name of target element
  label?: string; // Connector label
  [key: string]: unknown;
}

/**
 * Flow element definition
 */
export interface FlowElementDefinition {
  type: FlowElementType;
  label?: string;
  apiName: string; // Element API name
  properties?: Record<string, unknown>; // Element-specific properties
  formulas?: FlowFormulaDefinition[]; // Formulas used in element
  conditions?: FlowExpressionDefinition[]; // Conditions for element
  connectors?: FlowElementConnector[]; // Connectors to other elements
  description?: string;
  [key: string]: unknown;
}

/**
 * Flow variable definition
 */
export interface FlowVariableDefinition {
  name: string;
  type: FlowVariableType;
  dataType?: string; // Specific data type (e.g., SObject type for Record)
  isInput: boolean;
  isOutput: boolean;
  defaultValue?: unknown;
  description?: string;
  scope?: string; // flow, screen, element
  [key: string]: unknown;
}

/**
 * Flow decision outcome definition
 */
export interface FlowDecisionOutcome {
  outcomeType: FlowDecisionOutcomeType;
  label?: string;
  criteria?: FlowExpressionDefinition; // Condition criteria
  targetElement?: string; // Target element API name
  [key: string]: unknown;
}

/**
 * Flow decision path definition
 */
export interface FlowDecisionPathDefinition {
  decisionElement: string; // Decision element API name
  outcomes: FlowDecisionOutcome[];
  paths: FlowElementConnector[]; // Paths from decision
  criteria?: FlowExpressionDefinition; // Decision criteria
  [key: string]: unknown;
}

/**
 * Flow screen field definition
 */
export interface FlowScreenFieldDefinition {
  name: string;
  label?: string;
  type: string; // text, number, date, picklist, etc.
  required?: boolean;
  defaultValue?: unknown;
  validationRules?: string[]; // Validation rule names or expressions
  helpText?: string;
  [key: string]: unknown;
}

/**
 * Flow screen navigation definition
 */
export interface FlowScreenNavigationDefinition {
  nextButton?: {
    label?: string;
    targetElement?: string;
    conditions?: FlowExpressionDefinition[];
  };
  previousButton?: {
    label?: string;
    targetElement?: string;
  };
  navigationConditions?: FlowExpressionDefinition[];
  [key: string]: unknown;
}

/**
 * Flow screen definition
 */
export interface FlowScreenDefinition {
  screenElement: string; // Screen element API name
  fields: FlowScreenFieldDefinition[];
  navigation?: FlowScreenNavigationDefinition;
  validation?: {
    validationRules?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Flow trigger definition
 */
export interface FlowTriggerDefinition {
  triggerType: FlowTriggerType;
  object?: string; // Object name for record-triggered flows
  events?: FlowTriggerEvent[]; // Trigger events
  conditions?: FlowExpressionDefinition[]; // Trigger conditions
  entryPoint?: string; // Entry point element API name
  cronExpression?: string; // For scheduled flows
  eventType?: string; // For platform event flows
  [key: string]: unknown;
}

/**
 * Flow subflow input definition
 */
export interface FlowSubflowInputDefinition {
  parameterName: string; // Subflow input parameter name
  variableName?: string; // Flow variable name
  value?: unknown; // Direct value
  [key: string]: unknown;
}

/**
 * Flow subflow output definition
 */
export interface FlowSubflowOutputDefinition {
  parameterName: string; // Subflow output parameter name
  variableName?: string; // Flow variable name to assign to
  [key: string]: unknown;
}

/**
 * Flow subflow definition
 */
export interface FlowSubflowDefinition {
  subflowName: string; // Subflow name
  apiName: string; // Subflow API name
  inputs?: FlowSubflowInputDefinition[];
  outputs?: FlowSubflowOutputDefinition[];
  location?: string; // Location in flow where subflow is called
  callContext?: Record<string, unknown>; // Additional call context
  [key: string]: unknown;
}

/**
 * Flow formula definition
 */
export interface FlowFormulaDefinition {
  formulaText: string; // Formula text
  fieldReferences?: string[]; // Field references in formula
  functionCalls?: string[]; // Function calls in formula
  syntax?: string; // Formula syntax type
  [key: string]: unknown;
}

/**
 * Flow expression definition
 */
export interface FlowExpressionDefinition {
  expressionText: string; // Expression text
  type?: string; // Expression type
  fieldReferences?: string[]; // Field references in expression
  [key: string]: unknown;
}

/**
 * Flow assignment definition
 */
export interface FlowAssignmentDefinition {
  variableName: string; // Variable being assigned
  expression?: FlowExpressionDefinition; // Assignment expression
  fieldReference?: string; // Field reference if assigning to field
  [key: string]: unknown;
}

/**
 * Flow fault path definition
 */
export interface FlowFaultPathDefinition {
  faultConnector?: string; // Fault connector type
  errorMessage?: string; // Error message
  targetElement?: string; // Target element for fault path
  [key: string]: unknown;
}

/**
 * Flow retry logic definition
 */
export interface FlowRetryLogicDefinition {
  retryConditions?: FlowExpressionDefinition[]; // Conditions for retry
  retryAttempts?: number; // Number of retry attempts
  retryIntervals?: number[]; // Retry intervals in milliseconds
  [key: string]: unknown;
}

/**
 * Flow error handling definition
 */
export interface FlowErrorHandlingDefinition {
  faultPaths?: FlowFaultPathDefinition[]; // Fault paths
  errorMessages?: string[]; // Error messages
  retryLogic?: FlowRetryLogicDefinition; // Retry logic
  [key: string]: unknown;
}

/**
 * Flow-to-object mapping definition
 */
export interface FlowToObjectMapping {
  flowName: string; // Flow name
  objectName: string; // Salesforce object name
  relationshipType: FlowToObjectRelationshipType;
  details?: Record<string, unknown>; // Additional relationship details
  [key: string]: unknown;
}

/**
 * Flow definition (complete flow structure)
 */
export interface FlowDefinition {
  name: string; // Flow name
  apiName?: string; // Flow API name
  type: FlowType;
  status?: FlowStatus;
  label?: string;
  description?: string;
  elements: FlowElementDefinition[];
  variables?: FlowVariableDefinition[];
  inputs?: FlowVariableDefinition[]; // Input variables
  outputs?: FlowVariableDefinition[]; // Output variables
  triggers?: FlowTriggerDefinition[];
  decisionPaths?: FlowDecisionPathDefinition[];
  screens?: FlowScreenDefinition[];
  subflows?: FlowSubflowDefinition[];
  errorHandling?: FlowErrorHandlingDefinition;
  formulas?: FlowFormulaDefinition[];
  assignments?: FlowAssignmentDefinition[];
  [key: string]: unknown;
}

