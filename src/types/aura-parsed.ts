/**
 * Type definitions for parsed Aura component structures
 */

/**
 * Component type enumeration
 */
export type ComponentType = 'Component' | 'Application';

/**
 * Component access level enumeration
 */
export type ComponentAccessLevel = 'public' | 'global' | 'private';

/**
 * Attribute definition from .cmp file
 */
export interface AttributeDefinition {
  name: string;
  type: string; // String, Boolean, Object, etc.
  access: ComponentAccessLevel;
  defaultValue?: unknown;
  required?: boolean;
  description?: string;
  [key: string]: unknown;
}

/**
 * Handler definition from .cmp file
 */
export interface HandlerDefinition {
  name: string; // Handler name
  eventType: string; // Event type (init, change, etc.)
  action: string; // Controller method name
  parameters?: Record<string, unknown>;
  conditions?: string[];
  [key: string]: unknown;
}

/**
 * Component reference definition (nested component usage)
 */
export interface ComponentReferenceDefinition {
  componentName: string; // Component name (e.g., ComponentName from <c:ComponentName>)
  namespace?: string; // Namespace (c:, lightning:, ui:, etc.)
  attributes?: Record<string, string>; // Component attributes
  bindings?: BindingDefinition[]; // Data bindings
  isCustomAuraComponent: boolean; // <c:ComponentName>
  isStandardLightningComponent: boolean; // <lightning:*, <ui:*, etc.
  [key: string]: unknown;
}

/**
 * Binding definition (data bindings in .cmp file)
 */
export interface BindingDefinition {
  syntax: string; // Binding syntax ({!v.attribute}, {!v.attribute.value}, etc.)
  attributePath: string; // Attribute path (v.attribute, v.attribute.value, etc.)
  expression?: string; // Expression if any
  location?: string; // Where binding is used (attribute, text content, etc.)
  [key: string]: unknown;
}

/**
 * Conditional rendering definition
 */
export interface ConditionalRenderingDefinition {
  type: 'if' | 'iteration'; // aura:if, aura:iteration
  condition?: string; // Condition expression
  iterationVariable?: string; // Variable for iteration
  iterationItems?: string; // Items to iterate over
  [key: string]: unknown;
}

/**
 * Event definition (aura:registerEvent)
 */
export interface EventDefinition {
  name: string; // Event name
  type: string; // Event type
  registrationLocation?: string; // Where event is registered
  [key: string]: unknown;
}

/**
 * Component markup definition (aggregated .cmp structure)
 */
export interface ComponentMarkupDefinition {
  attributes: AttributeDefinition[];
  handlers: HandlerDefinition[];
  implements: string[]; // flexipage:availableForRecordHome, force:hasRecordId, etc.
  accessLevel: ComponentAccessLevel;
  componentReferences: ComponentReferenceDefinition[];
  bindings: BindingDefinition[];
  conditionalRendering: ConditionalRenderingDefinition[];
  events: EventDefinition[];
  htmlElements?: HTMLElementDefinition[]; // Standard HTML elements
  sldsClasses?: string[]; // Lightning Design System classes
  controller?: string; // Controller reference
  [key: string]: unknown;
}

/**
 * HTML element definition (standard HTML elements in .cmp)
 */
export interface HTMLElementDefinition {
  tagName: string; // input, button, div, etc.
  attributes: Record<string, string>;
  dataAttributes?: Record<string, string>; // data-* attributes
  ariaAttributes?: Record<string, string>; // aria-* attributes
  [key: string]: unknown;
}

/**
 * Action method definition from Controller.js
 */
export interface ActionMethodDefinition {
  name: string; // Method name
  parameters: ParameterDefinition[]; // component, event, helper
  eventParameters?: EventParameterDefinition[]; // event.getParam() calls
  attributeAccess?: AttributeAccessDefinition[]; // component.get(), component.set()
  helperCalls?: string[]; // helper.methodName() calls
  eventFiring?: EventFiringDefinition[]; // component.getEvent(), event.fire()
  apexCalls?: ApexCallDefinition[]; // Apex method calls (if any)
  [key: string]: unknown;
}

/**
 * Parameter definition for methods
 */
export interface ParameterDefinition {
  name: string;
  type?: string;
  optional?: boolean;
  defaultValue?: unknown;
}

/**
 * Event parameter definition
 */
export interface EventParameterDefinition {
  parameterName: string; // Parameter name from event.getParam()
  extractionMethod: string; // event.getParam('paramName')
  usage?: string; // Where parameter is used
  [key: string]: unknown;
}

/**
 * Attribute access definition
 */
export interface AttributeAccessDefinition {
  attributePath: string; // Attribute path (v.attribute, v.attribute.value, etc.)
  accessMethod: 'get' | 'set'; // component.get() or component.set()
  value?: unknown; // Value if set
  [key: string]: unknown;
}

/**
 * Event firing definition
 */
export interface EventFiringDefinition {
  eventName: string; // Event name
  eventType?: string; // Event type
  parameters?: Record<string, unknown>; // Event parameters
  [key: string]: unknown;
}

/**
 * Controller definition (aggregated Controller.js structure)
 */
export interface ControllerDefinition {
  actionMethods: ActionMethodDefinition[];
  [key: string]: unknown;
}

/**
 * Helper function definition from Helper.js
 */
export interface HelperFunctionDefinition {
  name: string; // Function name
  parameters: ParameterDefinition[];
  returnType?: string;
  logic?: string; // Function implementation details
  [key: string]: unknown;
}

/**
 * Apex call definition (from Helper.js)
 */
export interface ApexCallDefinition {
  apexClassName: string; // Apex class name
  methodName: string; // Apex method name
  parameters?: Record<string, unknown>; // Action parameters
  callbacks?: string[]; // Callback functions (success, error, etc.)
  [key: string]: unknown;
}

/**
 * Promise chain definition
 */
export interface PromiseChainDefinition {
  type: 'then' | 'catch' | 'finally';
  callback?: string; // Callback function name or implementation
  [key: string]: unknown;
}

/**
 * Helper definition (aggregated Helper.js structure)
 */
export interface HelperDefinition {
  functions: HelperFunctionDefinition[];
  apexCalls: ApexCallDefinition[];
  promiseChains: PromiseChainDefinition[];
  errorHandling?: ErrorHandlingDefinition[];
  utilityFunctions?: HelperFunctionDefinition[];
  [key: string]: unknown;
}

/**
 * Error handling definition
 */
export interface ErrorHandlingDefinition {
  type: 'tryCatch' | 'errorCallback';
  errorVariable?: string;
  errorMessage?: string;
  [key: string]: unknown;
}

/**
 * Render method definition from Renderer.js
 */
export interface RenderMethodDefinition {
  methodName: 'render' | 'rerender' | 'afterRender' | 'unrender';
  implementation?: string; // Method implementation details
  [key: string]: unknown;
}

/**
 * DOM manipulation definition
 */
export interface DOMManipulationDefinition {
  type: 'create' | 'modify' | 'remove' | 'query' | 'eventListener';
  element?: string; // Element selector or description
  operation?: string; // Operation description
  [key: string]: unknown;
}

/**
 * Renderer definition (aggregated Renderer.js structure)
 */
export interface RendererDefinition {
  renderMethods: RenderMethodDefinition[];
  domManipulation: DOMManipulationDefinition[];
  [key: string]: unknown;
}

/**
 * CSS selector definition (reused from LWC)
 */
export interface SelectorDefinition {
  selector: string; // CSS selector
  properties: Record<string, string>; // CSS properties
  pseudoClasses?: string[]; // :hover, :focus, etc.
  pseudoElements?: string[]; // ::before, ::after, etc.
  [key: string]: unknown;
}

/**
 * Media query definition (reused from LWC)
 */
export interface MediaQueryDefinition {
  condition: string; // Media query condition (e.g., "(max-width: 768px)")
  selectors: SelectorDefinition[];
  [key: string]: unknown;
}

/**
 * Keyframe definition (reused from LWC)
 */
export interface KeyframeDefinition {
  name: string; // Animation name
  keyframes: Record<string, Record<string, string>>; // Percentage -> properties
  [key: string]: unknown;
}

/**
 * CSS definition (reused from LWC, adapted for Aura)
 */
export interface CSSDefinition {
  customProperties: Record<string, string>; // CSS variables (--custom-property)
  selectors: SelectorDefinition[];
  mediaQueries: MediaQueryDefinition[];
  keyframes: KeyframeDefinition[];
  stylingForTestGeneration?: Record<string, string>; // display, visibility, opacity, etc.
  [key: string]: unknown;
}

/**
 * Component metadata
 */
export interface ComponentMetadata {
  name: string; // Component name (from directory structure)
  apiVersion?: string; // API version from .cmp-meta.xml
  description?: string; // Component description
  [key: string]: unknown;
}

/**
 * Application metadata (extends ComponentMetadata)
 */
export interface ApplicationMetadata extends ComponentMetadata {
  extends?: string; // Application extends (ltng:outApp, etc.)
  [key: string]: unknown;
}

/**
 * Design attribute definition (from .design file)
 */
export interface DesignAttributeDefinition {
  name: string; // Attribute name
  defaultValue?: unknown;
  constraints?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Application extends definition
 */
export interface ApplicationExtendsDefinition {
  extends: string; // ltng:outApp, etc.
  configuration?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Application dependency definition
 */
export interface ApplicationDependencyDefinition {
  componentName: string; // Component name from aura:dependency
  resource?: string; // Resource reference
  [key: string]: unknown;
}

/**
 * Aura component definition (combines markup, controller, helper, renderer, CSS, metadata)
 */
export interface AuraComponentDefinition {
  metadata: ComponentMetadata;
  type: ComponentType;
  markup?: ComponentMarkupDefinition;
  controller?: ControllerDefinition;
  helper?: HelperDefinition;
  renderer?: RendererDefinition;
  css?: CSSDefinition;
  designAttributes?: DesignAttributeDefinition[];
  dependencies?: string[]; // Component dependencies
  [key: string]: unknown;
}

/**
 * Application definition (extends AuraComponentDefinition)
 */
export interface ApplicationDefinition extends AuraComponentDefinition {
  metadata: ApplicationMetadata;
  extends?: ApplicationExtendsDefinition;
  componentDependencies?: ApplicationDependencyDefinition[];
  [key: string]: unknown;
}

