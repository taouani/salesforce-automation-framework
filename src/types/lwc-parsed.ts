/**
 * Type definitions for parsed LWC component structures
 */

/**
 * Property definition from JavaScript file
 */
export interface PropertyDefinition {
  name: string;
  type?: string;
  decorators: string[]; // @api, @track, etc.
  defaultValue?: unknown;
  isPublic: boolean; // @api decorated
  isReactive: boolean; // @track decorated
  [key: string]: unknown;
}

/**
 * Method definition from JavaScript file
 */
export interface MethodDefinition {
  name: string;
  parameters: ParameterDefinition[];
  returnType?: string;
  decorators: string[]; // @api, etc.
  isPublic: boolean; // @api decorated
  isLifecycleHook: boolean; // connectedCallback, renderedCallback, etc.
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
 * Event handler definition
 */
export interface EventHandlerDefinition {
  name: string; // Event name or handler method name
  type: 'lifecycle' | 'custom' | 'wire';
  handler?: string; // Handler method name
  [key: string]: unknown;
}

/**
 * Wire service definition
 */
export interface WireDefinition {
  propertyOrMethod: string; // Property or method name
  adapter: string; // Wire adapter (e.g., getRecord, getObjectInfo)
  params?: Record<string, unknown>; // Wire adapter parameters
  [key: string]: unknown;
}

/**
 * Import statement definition
 */
export interface ImportDefinition {
  source: string; // Import source (e.g., 'lightning/uiRecordApi', 'c/myComponent')
  specifiers: ImportSpecifier[]; // Named imports
  defaultImport?: string; // Default import
  isLightningImport: boolean; // lightning/* imports
  isLWCImport: boolean; // c/* imports (custom LWC components)
  [key: string]: unknown;
}

/**
 * Import specifier (named import)
 */
export interface ImportSpecifier {
  imported: string; // Imported name
  local?: string; // Local alias
}

/**
 * JavaScript definition (aggregated JS structure)
 */
export interface JavaScriptDefinition {
  properties: PropertyDefinition[];
  methods: MethodDefinition[];
  eventHandlers: EventHandlerDefinition[];
  wireServices: WireDefinition[];
  imports: ImportDefinition[];
  computedProperties?: PropertyDefinition[]; // Getters
  eventDispatchers?: EventHandlerDefinition[]; // CustomEvent dispatchers
  elementReferences?: string[]; // querySelector patterns
  [key: string]: unknown;
}

/**
 * HTML element definition
 */
export interface ElementDefinition {
  tagName: string; // lightning-button, c-my-component, div, etc.
  attributes: Record<string, string>; // All attributes
  isLightningComponent: boolean; // <lightning-*>
  isLWCComponent: boolean; // <c-*>
  isStandardHTML: boolean; // Standard HTML elements
  dataAttributes?: Record<string, string>; // data-* attributes
  ariaAttributes?: Record<string, string>; // aria-* attributes
  [key: string]: unknown;
}

/**
 * Data binding definition
 */
export interface BindingDefinition {
  expression: string; // Binding expression ({property}, {property.value}, etc.)
  target: string; // Where binding is used (attribute, text content, etc.)
  [key: string]: unknown;
}

/**
 * Directive definition (if:true, for:each, etc.)
 */
export interface DirectiveDefinition {
  type: 'if' | 'for' | 'iterator' | 'dom'; // if:true, for:each, lwc:dom, etc.
  condition?: string; // Condition expression
  iterator?: string; // Iterator variable
  item?: string; // Item variable
  [key: string]: unknown;
}

/**
 * HTML template definition (aggregated HTML structure)
 */
export interface HTMLTemplateDefinition {
  elements: ElementDefinition[];
  bindings: BindingDefinition[];
  directives: DirectiveDefinition[];
  eventHandlers: EventHandlerDefinition[];
  templateReferences?: string[]; // lwc:dom="manual" and querySelector patterns
  [key: string]: unknown;
}

/**
 * CSS selector definition
 */
export interface SelectorDefinition {
  selector: string; // CSS selector
  properties: Record<string, string>; // CSS properties
  pseudoClasses?: string[]; // :hover, :focus, etc.
  pseudoElements?: string[]; // ::before, ::after, etc.
  [key: string]: unknown;
}

/**
 * Media query definition
 */
export interface MediaQueryDefinition {
  condition: string; // Media query condition (e.g., "(max-width: 768px)")
  selectors: SelectorDefinition[];
  [key: string]: unknown;
}

/**
 * Keyframe animation definition
 */
export interface KeyframeDefinition {
  name: string; // Animation name
  keyframes: Record<string, Record<string, string>>; // Percentage -> properties
  [key: string]: unknown;
}

/**
 * CSS definition (aggregated CSS structure)
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
  apiVersion?: string; // API version from .js-meta.xml
  targetConfig?: string[]; // lightning__AppPage, lightning__RecordPage, etc.
  description?: string; // Component description
  [key: string]: unknown;
}

/**
 * LWC component definition (combines JS, HTML, CSS, metadata)
 */
export interface LWCComponentDefinition {
  metadata: ComponentMetadata;
  javascript?: JavaScriptDefinition;
  html?: HTMLTemplateDefinition;
  css?: CSSDefinition;
  dependencies?: string[]; // Component dependencies (from imports)
  [key: string]: unknown;
}

