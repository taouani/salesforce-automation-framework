/**
 * Type definitions for Page Object Model structures
 */

/**
 * Page object type enumeration
 */
export type PageObjectType = 'Object' | 'Lightning' | 'LWC' | 'Aura' | 'Flow';

/**
 * Locator strategy enumeration
 */
export enum LocatorStrategy {
  GET_BY_ROLE = 'getByRole',
  GET_BY_LABEL = 'getByLabel',
  GET_BY_TEST_ID = 'getByTestId',
  GET_BY_TEXT = 'getByText',
  CSS = 'css',
}

/**
 * Base locator definition
 */
export interface LocatorDefinition {
  name: string; // Locator property name (e.g., "accountNameField")
  strategy: LocatorStrategy; // Locator strategy
  selector: string; // Selector value (label, role, testid, text, or CSS selector)
  description?: string; // Description of what this locator targets
  [key: string]: unknown;
}

/**
 * Field locator definition for Salesforce fields
 */
export interface FieldLocatorDefinition extends LocatorDefinition {
  fieldName: string; // Field API name
  fieldLabel: string; // Field label
  fieldType: string; // Field type (String, Number, Date, etc.)
  isRequired?: boolean; // Whether field is required
  isReadOnly?: boolean; // Whether field is read-only
  [key: string]: unknown;
}

/**
 * Component locator definition for Lightning/Aura components
 */
export interface ComponentLocatorDefinition extends LocatorDefinition {
  componentName: string; // Component name
  componentType: 'LWC' | 'Aura' | 'Standard'; // Component type
  attributes?: Record<string, string>; // Component attributes
  [key: string]: unknown;
}

/**
 * Method parameter definition
 */
export interface ParameterDefinition {
  name: string; // Parameter name
  type: string; // Parameter type
  optional?: boolean; // Whether parameter is optional
  defaultValue?: unknown; // Default value if optional
  description?: string; // Parameter description
  [key: string]: unknown;
}

/**
 * Base method definition
 */
export interface MethodDefinition {
  name: string; // Method name
  parameters?: ParameterDefinition[]; // Method parameters
  returnType: string; // Return type (e.g., "Promise<void>", "string")
  description?: string; // Method description
  implementation?: string; // Method implementation code
  [key: string]: unknown;
}

/**
 * Navigation method definition
 */
export interface NavigationMethodDefinition extends MethodDefinition {
  type: 'navigation';
  target?: string; // Navigation target (URL, record ID, etc.)
  [key: string]: unknown;
}

/**
 * Field interaction method definition
 */
export interface FieldInteractionMethodDefinition extends MethodDefinition {
  type: 'fieldInteraction';
  fieldName?: string; // Associated field name
  operation: 'fill' | 'get' | 'set' | 'clear' | 'isVisible' | 'isEnabled' | 'isRequired';
  [key: string]: unknown;
}

/**
 * Validation method definition
 */
export interface ValidationMethodDefinition extends MethodDefinition {
  type: 'validation';
  validationType: 'isVisible' | 'isEnabled' | 'getValue' | 'getText' | 'hasClass';
  [key: string]: unknown;
}

/**
 * Assertion method definition
 */
export interface AssertionMethodDefinition extends MethodDefinition {
  type: 'assertion';
  assertionType: 'shouldBeVisible' | 'shouldHaveValue' | 'shouldHaveText' | 'shouldBeEnabled' | 'shouldBeDisabled';
  [key: string]: unknown;
}

/**
 * Base page object definition
 */
export interface PageObjectDefinition {
  name: string; // Page object class name
  type: PageObjectType; // Page object type
  locators: LocatorDefinition[]; // Page object locators
  methods: MethodDefinition[]; // Page object methods
  extends?: string; // Base class name (if any)
  imports?: string[]; // Required imports
  description?: string; // Page object description
  [key: string]: unknown;
}

/**
 * Object page definition (for Salesforce objects)
 */
export interface ObjectPageDefinition extends PageObjectDefinition {
  type: 'Object';
  objectName: string; // Salesforce object API name
  objectLabel?: string; // Salesforce object label
  fields: FieldLocatorDefinition[]; // Object field locators
  relationships?: string[]; // Related object names
  recordTypes?: string[]; // Available record types
  [key: string]: unknown;
}

/**
 * Lightning page definition
 */
export interface LightningPageDefinition extends PageObjectDefinition {
  type: 'Lightning';
  pageName: string; // Lightning page name
  pageType: 'Record' | 'Home' | 'App'; // Page type
  flexipageId?: string; // Flexipage ID if applicable
  components?: ComponentLocatorDefinition[]; // Components on the page
  [key: string]: unknown;
}

/**
 * Component page definition (for LWC and Aura components)
 */
export interface ComponentPageDefinition extends PageObjectDefinition {
  type: 'LWC' | 'Aura';
  componentName: string; // Component name
  componentType: 'LWC' | 'Aura';
  properties?: Record<string, unknown>; // Component properties/attributes
  events?: string[]; // Component events
  nestedComponents?: string[]; // Nested component names
  [key: string]: unknown;
}

/**
 * Flow screen page definition
 */
export interface FlowScreenPageDefinition extends PageObjectDefinition {
  type: 'Flow';
  flowName: string; // Flow name
  screenName: string; // Screen name
  inputs?: FlowScreenInputDefinition[]; // Screen inputs
  outputs?: FlowScreenOutputDefinition[]; // Screen outputs
  buttons?: FlowScreenButtonDefinition[]; // Screen buttons
  [key: string]: unknown;
}

/**
 * Flow screen input definition
 */
export interface FlowScreenInputDefinition {
  name: string; // Input variable name
  type: string; // Input type
  label?: string; // Input label
  required?: boolean; // Whether input is required
  [key: string]: unknown;
}

/**
 * Flow screen output definition
 */
export interface FlowScreenOutputDefinition {
  name: string; // Output variable name
  type: string; // Output type
  [key: string]: unknown;
}

/**
 * Flow screen button definition
 */
export interface FlowScreenButtonDefinition {
  label: string; // Button label
  action: string; // Button action (Next, Previous, Finish, etc.)
  [key: string]: unknown;
}

/**
 * Base page object class definition
 */
export interface BasePageObjectDefinition {
  name: string; // Base class name (e.g., "BaseObjectPage")
  type: PageObjectType; // Page object type this base class supports
  locators: LocatorDefinition[]; // Common locators
  methods: MethodDefinition[]; // Common methods
  description?: string; // Base class description
  [key: string]: unknown;
}

/**
 * Base object page definition
 */
export interface BaseObjectPageDefinition extends BasePageObjectDefinition {
  type: 'Object';
  [key: string]: unknown;
}

/**
 * Base Lightning page definition
 */
export interface BaseLightningPageDefinition extends BasePageObjectDefinition {
  type: 'Lightning';
  [key: string]: unknown;
}

/**
 * Base component page definition
 */
export interface BaseComponentPageDefinition extends BasePageObjectDefinition {
  type: 'LWC' | 'Aura';
  [key: string]: unknown;
}

/**
 * Base Flow screen definition
 */
export interface BaseFlowScreenDefinition extends BasePageObjectDefinition {
  type: 'Flow';
  [key: string]: unknown;
}

/**
 * Factory method definition
 */
export interface FactoryMethodDefinition {
  name: string; // Factory method name
  returnType: string; // Return type (page object class name)
  parameters?: ParameterDefinition[]; // Factory method parameters
  implementation?: string; // Factory method implementation
  [key: string]: unknown;
}

/**
 * Builder pattern definition
 */
export interface BuilderPatternDefinition {
  builderClassName: string; // Builder class name
  buildMethod: MethodDefinition; // Build method
  builderMethods: MethodDefinition[]; // Builder methods (fluent API)
  [key: string]: unknown;
}

/**
 * Page object factory definition
 */
export interface PageObjectFactoryDefinition {
  factoryClassName: string; // Factory class name
  factoryMethods: FactoryMethodDefinition[]; // Factory methods
  builderPatterns?: BuilderPatternDefinition[]; // Builder patterns (if any)
  [key: string]: unknown;
}

/**
 * Template variable definition
 */
export interface TemplateVariableDefinition {
  name: string; // Variable name
  type: string; // Variable type
  defaultValue?: unknown; // Default value
  description?: string; // Variable description
  [key: string]: unknown;
}

/**
 * Template context definition
 */
export interface TemplateContextDefinition {
  metadata: Record<string, unknown>; // Parsed metadata
  options: Record<string, unknown>; // Generation options
  configuration: GenerationConfig; // Generation configuration
  [key: string]: unknown;
}

/**
 * Template definition
 */
export interface TemplateDefinition {
  templatePath: string; // Path to template file
  variables: TemplateVariableDefinition[]; // Template variables
  context: TemplateContextDefinition; // Template context
  outputPath?: string; // Output file path
  [key: string]: unknown;
}

/**
 * Locator strategy configuration
 */
export interface LocatorStrategyConfig {
  primaryStrategy: LocatorStrategy; // Primary locator strategy
  fallbackStrategies?: LocatorStrategy[]; // Fallback strategies (if any)
  preferDataTestId?: boolean; // Prefer data-testid attributes
  preferAriaLabels?: boolean; // Prefer ARIA labels
  [key: string]: unknown;
}

/**
 * Method generation configuration
 */
export interface MethodGenerationConfig {
  generateAssertions?: boolean; // Generate assertion methods
  generateHelpers?: boolean; // Generate helper methods
  generateErrorHandling?: boolean; // Generate error handling methods
  generateSalesforcePatterns?: boolean; // Generate Salesforce-specific pattern methods
  [key: string]: unknown;
}

/**
 * Generation configuration
 */
export interface GenerationConfig {
  outputDirectory: string; // Output directory for generated files
  templateDirectory?: string; // Template directory (if custom templates)
  locatorStrategy?: LocatorStrategyConfig; // Locator strategy configuration
  methodGeneration?: MethodGenerationConfig; // Method generation configuration
  prettierConfig?: Record<string, unknown>; // Prettier configuration
  [key: string]: unknown;
}

/**
 * Generated file definition
 */
export interface GeneratedFileDefinition {
  path: string; // File path
  content: string; // File content
  type: 'pageObject' | 'type' | 'factory' | 'test' | 'documentation' | 'config'; // File type
  [key: string]: unknown;
}

/**
 * Generation error definition
 */
export interface GenerationError {
  file: string; // File that caused the error
  errorMessage: string; // Error message
  errorType: 'template' | 'compilation' | 'validation' | 'metadata' | 'other'; // Error type
  [key: string]: unknown;
}

/**
 * Generation result definition
 */
export interface GenerationResult {
  generatedFiles: GeneratedFileDefinition[]; // Generated files
  errors: GenerationError[]; // Generation errors
  warnings: string[]; // Generation warnings
  summary: {
    totalFiles: number;
    successfulFiles: number;
    failedFiles: number;
    totalErrors: number;
    totalWarnings: number;
  };
  [key: string]: unknown;
}

