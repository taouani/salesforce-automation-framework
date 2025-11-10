# Specification: JavaScript/TypeScript Parser

## Goal
Create a parser that extracts comprehensive metadata from Lightning Web Component bundles (.js, .html, .css files) to enable generation of Playwright test scripts that accurately interact with LWC components and their properties, methods, templates, and styling.

## User Stories
- As a test automation engineer, I want to parse LWC component JavaScript files so that I can understand component properties, methods, and event handlers for generating accurate Playwright tests
- As a QA lead, I want to extract component metadata and dependencies so that I can generate comprehensive test coverage for Lightning Web Components

## Specific Requirements

**LWC Component Bundle Parsing**
- Parse LWC components as bundles (process .js, .html, and .css files together as a single component unit)
- Identify component bundles by directory structure (lwc/ComponentName/ComponentName.js, ComponentName.html, ComponentName.css)
- Extract component name from folder structure (lwc/ComponentName/ → ComponentName)
- Parse all three files (.js, .html, .css) together and link them as a unified component definition
- Support components with missing optional files (e.g., component without CSS file)

**JavaScript File Parsing**
- Use `@babel/parser` with `@babel/traverse` and `@babel/types` for parsing JavaScript files
- Extract @api properties (public properties exposed to parent components)
- Extract @track properties (reactive properties that trigger re-renders)
- Extract public methods decorated with @api or otherwise exposed
- Extract event handlers and lifecycle hooks (connectedCallback, renderedCallback, disconnectedCallback, errorCallback)
- Extract wire service usage (@wire decorators and wire adapters)
- Extract import statements and dependencies (ES6 imports, Lightning imports, custom LWC imports)
- Extract computed properties and getters
- Extract event dispatchers (CustomEvent creation and dispatch)
- Extract any additional details useful for Playwright test generation (element references, query selectors, etc.)

**HTML Template Parsing**
- Use `cheerio` or `jsdom` for parsing HTML template files
- Extract Lightning component usage (<lightning-*> elements with their attributes)
- Extract custom LWC component references (<c-component-name> elements)
- Extract data bindings ({property} syntax and expressions)
- Extract event handlers (onclick, onchange, onkeypress, etc.)
- Extract conditional rendering directives (if:true, if:false, lwc:if)
- Extract iteration directives (for:each, for:item, iterator directives)
- Extract standard HTML elements and their attributes (input, button, div, etc.)
- Extract template references (lwc:dom="manual" and querySelector usage)
- Extract any additional details useful for Playwright test generation (data attributes, ARIA attributes, etc.)

**CSS File Parsing**
- Use `postcss` with `postcss-value-parser` or `css-tree` for parsing CSS files
- Extract CSS custom properties (CSS variables: --custom-property)
- Extract class selectors and their properties
- Extract media queries and responsive breakpoints
- Extract keyframe animations and their properties
- Extract styling information that might inform test generation (display: none, visibility: hidden, opacity, etc.)
- Extract pseudo-classes and pseudo-elements
- Extract any additional details useful for Playwright test generation

**Component Metadata Extraction**
- Extract component name from directory structure (lwc/ComponentName/)
- Extract API version from .js-meta.xml file if present
- Extract target configuration from .js-meta.xml (lightning__AppPage, lightning__RecordPage, lightning__HomePage, etc.)
- Extract exposed properties and methods for test generation
- Extract component description and documentation if available
- Build component dependency graph (which components this component depends on)

**Error Handling**
- Follow existing XML parser pattern: skip invalid/malformed files with warnings
- Create custom error types: JavaScriptParseError, HTMLParseError, CSSParseError extending ScannerError
- Continue processing other files even if one fails (graceful degradation)
- Log detailed error information including file path and error message
- Collect parsing errors and warnings without stopping entire process
- Report summary of errors/warnings at end of parsing

**Data Storage Architecture**
- Create TypeScript interfaces for parsed component structures (LWCComponentDefinition, JavaScriptDefinition, HTMLTemplateDefinition, CSSDefinition)
- Store parsed components in-memory during execution (Map<string, LWCComponentDefinition>)
- Store parsed results in JSON files for persistence (similar to XML parser results)
- Build component dependency graph (similar to RelationshipGraph for objects)
- Cross-reference parsed components with object definitions for test generation
- Support querying components by name, by dependency, by target configuration

**Type Definitions**
- Create TypeScript interfaces for JavaScript AST structures (PropertyDefinition, MethodDefinition, EventHandlerDefinition, etc.)
- Create TypeScript interfaces for HTML template structures (ElementDefinition, BindingDefinition, DirectiveDefinition, etc.)
- Create TypeScript interfaces for CSS structures (SelectorDefinition, PropertyDefinition, MediaQueryDefinition, etc.)
- Create TypeScript interfaces for component metadata (ComponentMetadata, DependencyGraph, etc.)
- Ensure type safety throughout parsing pipeline

**Integration with Existing Systems**
- Integrate with existing file scanner to discover LWC component files
- Use existing logger for structured logging (follow existing log level patterns)
- Follow existing error handling patterns (custom error types extending ScannerError)
- Store parsed results similar to ParsedXMLResults structure
- Build dependency graph similar to RelationshipGraph implementation
- Cross-reference with object definitions from XML parser for test generation

## Visual Design
No visual assets provided.

## Existing Code to Leverage

**XML Parser (src/parser/xml-parser.ts)**
- Reuse file reading patterns (readFile with error handling)
- Follow parallel processing approach with configurable concurrency
- Reuse skip invalid files with warnings pattern
- Follow existing error handling and logging patterns

**File Scanner (src/scanner/file-scanner.ts)**
- Integrate with scanDirectory function to discover LWC component files
- Use processFilesInParallel for parallel component parsing
- Reuse file path extraction utilities
- Follow existing file traversal patterns

**Error Handling Utilities (src/utils/errors.ts, src/utils/xml-errors.ts)**
- Create new error types (JavaScriptParseError, HTMLParseError, CSSParseError) following ScannerError pattern
- Use ErrorCollection for aggregating parsing errors
- Follow existing error handling best practices

**Type Definitions (src/types/xml-parsed.ts, src/types/xml-results.ts)**
- Follow existing type definition patterns (ObjectDefinition, FieldDefinition, etc.)
- Create similar structure for LWCComponentDefinition
- Follow ParsedXMLResults pattern for storing parsed component results
- Create dependency graph similar to RelationshipGraph structure

**Result Storage (src/parser/xml-results.ts)**
- Follow ParsedXMLResults pattern for storing parsed components
- Use Map<string, LWCComponentDefinition> for in-memory storage
- Implement toJSON() method for persistence
- Store dependency graph separately for efficient querying

**Logger Utilities (src/utils/logger.ts)**
- Use existing logger instance for structured logging
- Follow existing log level patterns (info, warn, error, debug)
- Maintain consistent logging format across parsing operations

## Out of Scope
- Aura component parsing (separate feature to be implemented later)
- Standalone JavaScript files outside lwc/ directories
- TypeScript (.ts) file parsing (only JavaScript .js files)
- Parsing files independently (must parse as bundles)
- Generating test scripts (that functionality is for later phases)
- JavaScript execution or evaluation (only parsing and AST extraction)
- HTML/CSS rendering or validation (only parsing structure)
- Component testing or validation (only metadata extraction)
- Real-time parsing or file watching (batch processing only)
- Integration with Salesforce orgs (local file system only)
- Performance optimization beyond parallel processing (no caching or incremental parsing)

