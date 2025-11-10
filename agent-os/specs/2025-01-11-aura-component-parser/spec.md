# Specification: Aura Component Parser

## Goal
Create a parser that extracts comprehensive metadata from Salesforce Aura component bundles (.cmp, .js, .css files) to enable generation of Playwright test scripts that accurately interact with Aura components, their attributes, events, controllers, helpers, renderers, and styling.

## User Stories
- As a test automation engineer, I want to parse Aura component bundles so that I can understand component attributes, event handlers, and structure for generating accurate Playwright tests
- As a QA lead, I want to extract Aura component metadata, dependencies, and Apex class interactions so that I can generate comprehensive test coverage for Aura components
- As a test automation engineer, I want to map Aura components to Salesforce objects and Apex classes so that I can generate tests that validate component-object and component-Apex interactions

## Specific Requirements

**Aura Component Bundle Parsing**
- Parse Aura components as bundles (process all files in a component bundle together as a single component unit)
- Identify component bundles by directory structure (aura/ComponentName/ComponentName.cmp, ComponentNameController.js, ComponentNameHelper.js, ComponentNameRenderer.js, ComponentName.css, ComponentName.cmp-meta.xml)
- Extract component name from folder structure (aura/ComponentName/ → ComponentName)
- Parse all files in a bundle together and link them as a unified component definition
- Support components with missing optional files (e.g., component without Renderer.js, without CSS, without Helper.js)
- Parse Aura applications (`.app` files) as a special type of component

**Component Markup (.cmp) File Parsing**
- Use `cheerio` or `jsdom` for parsing `.cmp` markup files (similar to HTML parsing)
- Extract `<aura:attribute>` declarations:
  - Attribute name, type, access level (public, private, global)
  - Default values
  - Required vs optional attributes
  - Attribute descriptions
- Extract `<aura:handler>` event handlers:
  - Handler name, event type, action (controller method)
  - Handler parameters and conditions
- Extract component implements (flexipage:availableForRecordHome, force:hasRecordId, force:hasSObjectName, etc.)
- Extract component access level (public, global)
- Extract nested component usage:
  - Custom Aura component references (<c:ComponentName>)
  - Standard Lightning component usage (<lightning:*, <ui:*, etc.)
  - Component attributes and bindings
- Extract data bindings ({!v.attribute} syntax and expressions)
- Extract conditional rendering (aura:if, aura:iteration directives)
- Extract event firing (aura:registerEvent, component.getEvent() references)
- Extract standard HTML elements and their attributes (input, button, div, etc.)
- Extract Lightning Design System classes (slds-* classes)
- Extract any additional details useful for Playwright test generation (data attributes, ARIA attributes, etc.)

**Controller JavaScript File Parsing**
- Use `@babel/parser` with `@babel/traverse` and `@babel/types` for parsing Controller JavaScript files (`*Controller.js`)
- Extract controller action methods (functions that handle events)
- Extract method parameters (component, event, helper parameters)
- Extract event parameter extraction (event.getParam() calls and parameter names)
- Extract component attribute access (component.get(), component.set() calls with attribute paths)
- Extract helper method calls (helper.methodName() calls)
- Extract event firing (component.getEvent(), event.fire() calls)
- Extract Apex method calls (if any in controller)
- Extract any additional details useful for Playwright test generation (DOM manipulation, error handling, etc.)

**Helper JavaScript File Parsing**
- Use `@babel/parser` with `@babel/traverse` and `@babel/types` for parsing Helper JavaScript files (`*Helper.js`)
- Extract helper functions (reusable logic functions)
- Extract server-side calls:
  - Apex method calls via $A.enqueueAction()
  - Apex class and method names
  - Action parameters and callbacks
- Extract Promise handling (then(), catch(), finally() chains)
- Extract error handling (try/catch blocks, error callbacks)
- Extract utility functions and helper logic
- Extract any additional details useful for Playwright test generation (data transformations, validations, etc.)

**Renderer JavaScript File Parsing**
- Use `@babel/parser` with `@babel/traverse` and `@babel/types` for parsing Renderer JavaScript files (`*Renderer.js`)
- Extract custom render methods:
  - render() method
  - rerender() method
  - afterRender() method
  - unrender() method
- Extract DOM manipulation logic:
  - Element creation and modification
  - Event listener attachments
  - DOM traversal and queries
- Extract any additional details useful for Playwright test generation

**CSS File Parsing**
- Use `postcss` with `postcss-value-parser` or `css-tree` for parsing CSS files (same as LWC parser)
- Extract CSS class selectors and their properties
- Extract CSS custom properties (CSS variables: --custom-property)
- Extract media queries and responsive breakpoints
- Extract keyframe animations and their properties
- Extract styling information that might inform test generation (display: none, visibility: hidden, opacity, etc.)
- Extract pseudo-classes and pseudo-elements
- Extract any additional details useful for Playwright test generation

**Metadata File Parsing**
- Use `fast-xml-parser` for parsing `.cmp-meta.xml` and `.app-meta.xml` files (same as XML parser)
- Extract API version from metadata files
- Extract description from metadata files
- Extract any additional metadata useful for test generation (targets, dependencies, etc.)

**Aura Application Parsing**
- Parse Aura applications (`.app` files) as a special type of component
- Extract application structure and markup
- Extract component dependencies (aura:dependency resource references)
- Extract application extends (ltng:outApp, etc.)
- Extract application attributes and configuration
- Link applications to their component dependencies

**Component Event Definitions**
- Extract component event definitions (aura:registerEvent in .cmp files)
- Extract event names and types
- Map events to their firing locations (controller methods that fire events)
- Map events to their handlers (aura:handler elements that listen to events)

**Component Interface Implementations**
- Extract component interface implementations (implements attribute in .cmp files)
- Extract interface names (flexipage:availableForRecordHome, force:hasRecordId, etc.)
- Map interfaces to component capabilities (record page support, app page support, etc.)

**Component Design Attributes**
- Parse `.design` files if present
- Extract design-time attributes and configurations
- Extract attribute default values and constraints
- Extract design-time metadata useful for test generation

**Component Dependencies and Cross-References**
- Extract Aura component to Aura component dependencies:
  - Component references in markup (<c:ComponentName>)
  - Component dependencies in applications (aura:dependency)
- Extract Aura component to Salesforce object cross-references:
  - Object references in attributes (SObject types)
  - Object references in data bindings
  - Object references in Apex calls (from Helper files)
- Extract Aura component to Apex class dependencies:
  - Apex class names from $A.enqueueAction() calls in Helper files
  - Apex controller references in component markup (controller attribute)
- Build dependency graphs:
  - Aura-to-Aura dependency graph
  - Aura-to-Object dependency graph
  - Aura-to-Apex dependency graph

**Error Handling**
- Follow existing parser pattern: skip invalid/malformed files with warnings
- Create custom error types: AuraParseError, AuraStructureError extending ScannerError
- Continue processing other files even if one fails (graceful degradation)
- Log detailed error information including file path and error message
- Collect parsing errors and warnings without stopping entire process
- Report summary of errors/warnings at end of parsing
- Support parallel processing for performance (similar to Flow parser) with configurable concurrency

**Data Storage Architecture**
- Create TypeScript interfaces for parsed component structures (AuraComponentDefinition, ComponentMarkupDefinition, ControllerDefinition, HelperDefinition, RendererDefinition, CSSDefinition, ApplicationDefinition)
- Store parsed components in-memory during execution (Map<string, AuraComponentDefinition>)
- Store parsed results in JSON files for persistence (similar to XML parser results)
- Build component dependency graphs (similar to LWC dependency graph):
  - Aura-to-Aura dependency graph
  - Aura-to-Object dependency graph
  - Aura-to-Apex dependency graph
- Cross-reference parsed components with object definitions and Apex class definitions for test generation
- Support querying components by name, by dependency, by interface implementation

**Type Definitions**
- Create TypeScript interfaces for component markup structures (AttributeDefinition, HandlerDefinition, ComponentReferenceDefinition, BindingDefinition, etc.)
- Create TypeScript interfaces for Controller JavaScript structures (ActionMethodDefinition, EventParameterDefinition, AttributeAccessDefinition, etc.)
- Create TypeScript interfaces for Helper JavaScript structures (HelperFunctionDefinition, ApexCallDefinition, PromiseChainDefinition, etc.)
- Create TypeScript interfaces for Renderer JavaScript structures (RenderMethodDefinition, DOMManipulationDefinition, etc.)
- Create TypeScript interfaces for CSS structures (SelectorDefinition, PropertyDefinition, MediaQueryDefinition, etc.)
- Create TypeScript interfaces for component metadata (ComponentMetadata, ApplicationMetadata, DependencyGraph, etc.)
- Ensure type safety throughout parsing pipeline

**Integration with Existing Systems**
- Integrate with existing file scanner to discover Aura component files
- Use existing logger for structured logging (follow existing log level patterns)
- Follow existing error handling patterns (custom error types extending ScannerError)
- Store parsed results similar to ParsedLWCResults and ParsedXMLResults structures
- Build dependency graphs similar to LWC dependency graph implementation
- Cross-reference with object definitions from XML parser for test generation
- Cross-reference with Apex class definitions from Apex parser for test generation
- Support parallel processing with configurable concurrency (similar to Flow parser)

## Visual Design
No visual assets provided.

## Existing Code to Leverage

**LWC Parser (src/parser/lwc-*)**
- Reuse component bundle parsing approach (parse all files together)
- Reuse JavaScript parsing patterns from `src/parser/js-parser.ts` (adapt for Aura Controller/Helper/Renderer structure)
- Reuse HTML/markup parsing patterns from `src/parser/html-parser.ts` (adapt for Aura .cmp markup)
- Reuse CSS parsing patterns from `src/parser/css-parser.ts` (same approach for Aura CSS)
- Reuse dependency graph building from `src/parser/lwc-dependency-graph.ts` (adapt for Aura dependencies)
- Reuse result storage patterns from `src/parser/lwc-results.ts`

**XML Parser (src/parser/xml-parser.ts)**
- Reuse file reading patterns (readFile with error handling)
- Reuse XML parsing patterns for `.cmp-meta.xml` and `.app-meta.xml` files
- Follow parallel processing approach with configurable concurrency
- Reuse skip invalid files with warnings pattern

**Apex Parser (src/parser/apex-*)**
- Reuse Apex class name extraction patterns for identifying Apex dependencies
- Cross-reference parsed Apex classes with Aura component Apex calls

**File Scanner (src/scanner/file-scanner.ts)**
- Reuse file traversal patterns for discovering Aura component directories
- Reuse directory scanning for aura/ folders

**Error Handling (src/utils/errors.ts)**
- Reuse ScannerError base class
- Create AuraParseError and AuraStructureError extending ScannerError
- Follow existing error collection and reporting patterns

**Logger (src/utils/logger.ts)**
- Reuse structured logging patterns
- Follow existing log level conventions

## Technical Stack

**JavaScript Parsing**
- Library: `@babel/parser` with `@babel/traverse` and `@babel/types`
- Purpose: Parse Controller, Helper, and Renderer JavaScript files
- Rationale: Same library as LWC parser, provides excellent AST manipulation capabilities

**Markup Parsing**
- Library: `cheerio` or `jsdom`
- Purpose: Parse Aura component `.cmp` markup files
- Rationale: jQuery-like API for server-side markup manipulation, efficient for extracting elements and attributes

**CSS Parsing**
- Library: `postcss` with `postcss-value-parser` or `css-tree`
- Purpose: Parse Aura component CSS files
- Rationale: Robust CSS parsing with AST support, same as LWC parser

**XML Parsing**
- Library: `fast-xml-parser`
- Purpose: Parse `.cmp-meta.xml` and `.app-meta.xml` metadata files
- Rationale: Fast, reliable XML parsing with good TypeScript support, same as XML parser

**File System**
- Library: Node.js `fs/promises` and `path`
- Purpose: Traverse Aura component directory structure
- Rationale: Native Node.js file system APIs

**Parallel Processing**
- Approach: Configurable concurrency with Promise.all and concurrency limiting
- Purpose: Process multiple Aura component bundles in parallel for performance
- Rationale: Similar to Flow parser approach, improves performance for large metadata repositories

## Scope Boundaries

**In Scope:**
- Parsing Aura components only (not LWC components)
- Parsing all files in Aura component bundles together as a single unit
- Parsing Aura applications as a special type of component
- Extracting all details useful for Playwright test generation
- Building component dependency graphs (Aura-to-Aura, Aura-to-Object, Aura-to-Apex)
- Cross-referencing with object definitions and Apex classes
- Parallel processing for performance
- Error handling with graceful degradation

**Out of Scope:**
- LWC component parsing (separate feature already implemented)
- Parsing files independently (must parse as bundles)
- Generating test scripts (that's for later phases)
- Visual design or UI components
- Real-time file watching (future enhancement)

## Success Criteria

1. **Comprehensive Parsing**: Successfully parse all file types in Aura component bundles (.cmp, Controller.js, Helper.js, Renderer.js, .css, .cmp-meta.xml, .app, .app-meta.xml, .design)
2. **Complete Extraction**: Extract all specified details from each file type (attributes, handlers, methods, dependencies, etc.)
3. **Dependency Mapping**: Build accurate dependency graphs for Aura-to-Aura, Aura-to-Object, and Aura-to-Apex relationships
4. **Error Resilience**: Handle invalid/malformed files gracefully without stopping the entire parsing process
5. **Performance**: Process Aura components efficiently with parallel processing support
6. **Integration**: Successfully integrate with existing parsers (XML, Apex) for cross-referencing
7. **Type Safety**: Maintain type safety throughout the parsing pipeline with comprehensive TypeScript interfaces
8. **Test Coverage**: Achieve comprehensive test coverage for all parsing functionality

