# Task Breakdown: Aura Component Parser

## Overview
Total Tasks: 14 task groups

## Task List

### Dependencies & Type Definitions

#### Task Group 1: Type Definitions Setup
**Dependencies:** None

- [x] 1.0 Complete type definitions infrastructure
  - [x] 1.1 Write 2-8 focused tests for type definitions
    - Test type definitions for parsed Aura component structures
    - Test type compilation
    - Limit to critical behaviors only
  - [x] 1.2 Create TypeScript interfaces for Aura component structures
    - AuraComponentDefinition interface (combines markup, controller, helper, renderer, CSS, metadata)
    - ComponentType enum (Component, Application)
    - ComponentAccessLevel enum (public, global, private)
  - [x] 1.3 Create TypeScript interfaces for component markup structures
    - ComponentMarkupDefinition interface (attributes, handlers, implements, access level, nested components)
    - AttributeDefinition interface (name, type, access, default value, required, description)
    - HandlerDefinition interface (name, event type, action, parameters, conditions)
    - ComponentReferenceDefinition interface (component name, namespace, attributes, bindings)
    - BindingDefinition interface (binding syntax, attribute path, expression)
    - ConditionalRenderingDefinition interface (aura:if, aura:iteration directives)
    - EventDefinition interface (event name, type, registration location)
  - [x] 1.4 Create TypeScript interfaces for Controller JavaScript structures
    - ControllerDefinition interface (action methods, event handling, attribute access)
    - ActionMethodDefinition interface (method name, parameters, event parameters, helper calls)
    - EventParameterDefinition interface (parameter name, extraction method, usage)
    - AttributeAccessDefinition interface (attribute path, access method, value)
  - [x] 1.5 Create TypeScript interfaces for Helper JavaScript structures
    - HelperDefinition interface (helper functions, Apex calls, promise handling)
    - HelperFunctionDefinition interface (function name, parameters, return type, logic)
    - ApexCallDefinition interface (Apex class name, method name, parameters, callbacks)
    - PromiseChainDefinition interface (then/catch/finally chains, error handling)
  - [x] 1.6 Create TypeScript interfaces for Renderer JavaScript structures
    - RendererDefinition interface (render methods, DOM manipulation)
    - RenderMethodDefinition interface (method name: render, rerender, afterRender, unrender, implementation)
    - DOMManipulationDefinition interface (element creation, modification, event listeners, queries)
  - [x] 1.7 Create TypeScript interfaces for CSS structures
    - CSSDefinition interface (selectors, properties, media queries, animations)
    - SelectorDefinition interface (class selectors, pseudo-classes, pseudo-elements)
    - PropertyDefinition interface (CSS properties, values)
    - MediaQueryDefinition interface (breakpoints, conditions)
    - KeyframeDefinition interface (animation names, keyframes, properties)
  - [x] 1.8 Create TypeScript interfaces for metadata structures
    - ComponentMetadata interface (name, API version, description, additional metadata)
    - ApplicationMetadata interface (extends ComponentMetadata, application-specific fields)
    - DesignAttributeDefinition interface (design-time attributes, constraints, defaults)
  - [x] 1.9 Create TypeScript interfaces for application structures
    - ApplicationDefinition interface (extends AuraComponentDefinition, application-specific fields)
    - ApplicationExtendsDefinition interface (extends value, configuration)
    - ApplicationDependencyDefinition interface (component dependencies, resource references)
  - [x] 1.10 Create TypeScript interfaces for dependency graph structures
    - AuraDependencyGraph interface (Aura-to-Aura component dependencies)
    - AuraToObjectDependencyGraph interface (Aura component to Salesforce object relationships)
    - AuraToApexDependencyGraph interface (Aura component to Apex class relationships)
    - AuraDependencyNode interface (component or application)
    - AuraDependencyEdge interface (relationship between components)
    - AuraToObjectNode interface (component or object)
    - AuraToObjectEdge interface (relationship between component and object)
    - AuraToApexNode interface (component or Apex class)
    - AuraToApexEdge interface (relationship between component and Apex class)
  - [x] 1.11 Create TypeScript interfaces for result storage
    - ParsedAuraResults interface (components Map, applications Map, dependencyGraphs, parsedAt)
    - ParsedAuraResultsJSON interface (JSON representation)
  - [x] 1.12 Ensure type definitions tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify all type definitions compile without errors
    - Verify type definitions cover all required structures
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- All TypeScript interfaces compile without errors
- Type definitions cover all required Aura component structures
- Type definitions follow existing parser patterns

### Error Handling

#### Task Group 2: Error Types for Aura Parsing
**Dependencies:** Task Group 1

- [x] 2.0 Complete error handling for Aura parsing
  - [x] 2.1 Write 2-8 focused tests for error handling
    - Test AuraParseError
    - Test AuraStructureError
    - Test error collection and reporting
    - Limit to critical behaviors only
  - [x] 2.2 Create AuraParseError extending ScannerError
    - Follow existing XMLParseError/ApexParseError pattern
    - Include file path and error details
  - [x] 2.3 Create AuraStructureError for markup/XML structure issues
    - Extend AuraParseError
    - Handle missing required elements in .cmp files
    - Handle malformed XML in metadata files
  - [x] 2.4 Create AuraJavaScriptParseError for JavaScript parsing issues
    - Extend AuraParseError
    - Handle Controller/Helper/Renderer JavaScript parsing errors
  - [x] 2.5 Create AuraMarkupParseError for .cmp markup parsing issues
    - Extend AuraParseError
    - Handle markup parsing errors
  - [x] 2.6 Create AuraCSSParseError for CSS parsing issues
    - Extend AuraParseError
    - Handle CSS parsing errors
  - [x] 2.7 Integrate error handling with existing ErrorCollection
    - Use ErrorCollection for aggregating parsing errors
    - Follow existing error handling best practices
  - [x] 2.8 Ensure error handling tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify error types work correctly
    - Verify error collection works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- All error types extend ScannerError correctly
- Error collection aggregates errors without stopping process
- Error handling follows existing patterns

### Component Markup Parser

#### Task Group 3: Component Markup (.cmp) File Parser
**Dependencies:** Task Groups 1, 2

- [x] 3.0 Complete component markup parser
  - [x] 3.1 Write 2-8 focused tests for component markup parser
    - Test .cmp file parsing
    - Test attribute extraction
    - Test handler extraction
    - Test component reference extraction
    - Limit to critical behaviors only
  - [x] 3.2 Evaluate cheerio or jsdom for .cmp markup parsing
    - Test cheerio/jsdom with sample .cmp files
    - Verify it handles Aura markup structure correctly
    - Choose appropriate library
  - [x] 3.3 Implement .cmp file reader
    - Read .cmp files from file system
    - Handle file encoding and line endings
    - Follow existing file reading patterns
  - [x] 3.4 Implement basic .cmp markup parsing
    - Parse aura:component root element
    - Extract component name, access level, implements
    - Extract controller reference if present
    - Handle missing or malformed markup gracefully
  - [x] 3.5 Implement attribute extraction
    - Extract <aura:attribute> declarations
    - Extract attribute name, type, access level, default value
    - Extract required vs optional attributes
    - Extract attribute descriptions
  - [x] 3.6 Implement handler extraction
    - Extract <aura:handler> event handlers
    - Extract handler name, event type, action (controller method)
    - Extract handler parameters and conditions
  - [x] 3.7 Implement component implements extraction
    - Extract implements attribute (flexipage:availableForRecordHome, force:hasRecordId, etc.)
    - Map interfaces to component capabilities
  - [x] 3.8 Implement component access level extraction
    - Extract access attribute (public, global)
  - [x] 3.9 Implement nested component usage extraction
    - Extract custom Aura component references (<c:ComponentName>)
    - Extract standard Lightning component usage (<lightning:*, <ui:*, etc.)
    - Extract component attributes and bindings
  - [x] 3.10 Implement data binding extraction
    - Extract data bindings ({!v.attribute} syntax and expressions)
    - Extract binding paths and expressions
  - [x] 3.11 Implement conditional rendering extraction
    - Extract aura:if directives
    - Extract aura:iteration directives
    - Extract conditional logic
  - [x] 3.12 Implement event firing extraction
    - Extract aura:registerEvent definitions
    - Extract component.getEvent() references
    - Map events to their firing locations
  - [x] 3.13 Implement standard HTML element extraction
    - Extract standard HTML elements and their attributes
    - Extract Lightning Design System classes (slds-* classes)
    - Extract data attributes, ARIA attributes
  - [x] 3.14 Ensure component markup parser tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify markup parsing works correctly
    - Verify all extraction methods work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- .cmp files parsed successfully
- All specified details extracted correctly
- Error handling works correctly

### Controller JavaScript Parser

#### Task Group 4: Controller JavaScript File Parser
**Dependencies:** Task Groups 1, 2

- [ ] 4.0 Complete Controller JavaScript parser
  - [ ] 4.1 Write 2-8 focused tests for Controller JavaScript parser
    - Test Controller.js file parsing
    - Test action method extraction
    - Test event parameter extraction
    - Test attribute access extraction
    - Limit to critical behaviors only
  - [ ] 4.2 Reuse @babel/parser setup from LWC parser
    - Adapt Babel parser configuration for Aura Controller structure
    - Create parseControllerJavaScriptFile function
    - Integrate with existing logger
  - [ ] 4.3 Implement Controller.js file reader
    - Read *Controller.js files from file system
    - Handle file encoding and line endings
    - Follow existing file reading patterns
  - [ ] 4.4 Implement action method extraction
    - Extract controller action methods (functions that handle events)
    - Extract method names, parameters (component, event, helper)
    - Extract method implementations
  - [ ] 4.5 Implement event parameter extraction
    - Extract event.getParam() calls
    - Extract parameter names and usage
    - Map parameters to their extraction locations
  - [ ] 4.6 Implement component attribute access extraction
    - Extract component.get() calls with attribute paths
    - Extract component.set() calls with attribute paths and values
    - Map attribute access to attribute definitions
  - [ ] 4.7 Implement helper method call extraction
    - Extract helper.methodName() calls
    - Map helper calls to helper function definitions
  - [ ] 4.8 Implement event firing extraction
    - Extract component.getEvent() calls
    - Extract event.fire() calls
    - Map events to event definitions
  - [ ] 4.9 Implement Apex method call extraction (if any in controller)
    - Extract Apex method calls in controller
    - Extract Apex class and method names
  - [ ] 4.10 Implement additional extraction for Playwright test generation
    - Extract DOM manipulation (if any)
    - Extract error handling patterns
    - Extract any other details useful for test generation
  - [ ] 4.11 Ensure Controller JavaScript parser tests pass
    - Run ONLY the 2-8 tests written in 4.1
    - Verify Controller parsing works correctly
    - Verify all extraction methods work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 4.1 pass
- Controller.js files parsed successfully
- All specified details extracted correctly
- Error handling works correctly

### Helper JavaScript Parser

#### Task Group 5: Helper JavaScript File Parser
**Dependencies:** Task Groups 1, 2

- [ ] 5.0 Complete Helper JavaScript parser
  - [ ] 5.1 Write 2-8 focused tests for Helper JavaScript parser
    - Test Helper.js file parsing
    - Test helper function extraction
    - Test Apex call extraction
    - Test promise handling extraction
    - Limit to critical behaviors only
  - [ ] 5.2 Reuse @babel/parser setup from LWC parser
    - Adapt Babel parser configuration for Aura Helper structure
    - Create parseHelperJavaScriptFile function
    - Integrate with existing logger
  - [ ] 5.3 Implement Helper.js file reader
    - Read *Helper.js files from file system
    - Handle file encoding and line endings
    - Follow existing file reading patterns
  - [ ] 5.4 Implement helper function extraction
    - Extract helper functions (reusable logic functions)
    - Extract function names, parameters, return types
    - Extract function implementations
  - [ ] 5.5 Implement server-side Apex call extraction
    - Extract Apex method calls via $A.enqueueAction()
    - Extract Apex class names and method names
    - Extract action parameters and callbacks
    - Map Apex calls to Apex class definitions
  - [ ] 5.6 Implement promise handling extraction
    - Extract then() chains
    - Extract catch() chains
    - Extract finally() chains
    - Extract promise error handling
  - [ ] 5.7 Implement error handling extraction
    - Extract try/catch blocks
    - Extract error callbacks
    - Extract error handling patterns
  - [ ] 5.8 Implement utility function extraction
    - Extract utility functions and helper logic
    - Extract data transformation functions
    - Extract validation functions
  - [ ] 5.9 Implement additional extraction for Playwright test generation
    - Extract any other details useful for test generation
  - [ ] 5.10 Ensure Helper JavaScript parser tests pass
    - Run ONLY the 2-8 tests written in 5.1
    - Verify Helper parsing works correctly
    - Verify all extraction methods work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 5.1 pass
- Helper.js files parsed successfully
- All specified details extracted correctly
- Apex call extraction works correctly
- Error handling works correctly

### Renderer JavaScript Parser

#### Task Group 6: Renderer JavaScript File Parser
**Dependencies:** Task Groups 1, 2

- [ ] 6.0 Complete Renderer JavaScript parser
  - [ ] 6.1 Write 2-8 focused tests for Renderer JavaScript parser
    - Test Renderer.js file parsing
    - Test render method extraction
    - Test DOM manipulation extraction
    - Limit to critical behaviors only
  - [ ] 6.2 Reuse @babel/parser setup from LWC parser
    - Adapt Babel parser configuration for Aura Renderer structure
    - Create parseRendererJavaScriptFile function
    - Integrate with existing logger
  - [ ] 6.3 Implement Renderer.js file reader
    - Read *Renderer.js files from file system
    - Handle file encoding and line endings
    - Follow existing file reading patterns
  - [ ] 6.4 Implement custom render method extraction
    - Extract render() method
    - Extract rerender() method
    - Extract afterRender() method
    - Extract unrender() method
  - [ ] 6.5 Implement DOM manipulation extraction
    - Extract element creation and modification
    - Extract event listener attachments
    - Extract DOM traversal and queries
  - [ ] 6.6 Implement additional extraction for Playwright test generation
    - Extract any other details useful for test generation
  - [ ] 6.7 Ensure Renderer JavaScript parser tests pass
    - Run ONLY the 2-8 tests written in 6.1
    - Verify Renderer parsing works correctly
    - Verify all extraction methods work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 6.1 pass
- Renderer.js files parsed successfully
- All specified details extracted correctly
- Error handling works correctly

### CSS Parser

#### Task Group 7: CSS File Parser
**Dependencies:** Task Groups 1, 2

- [ ] 7.0 Complete CSS parser (reuse from LWC parser)
  - [ ] 7.1 Write 2-8 focused tests for CSS parser
    - Test CSS file parsing
    - Test selector extraction
    - Test property extraction
    - Limit to critical behaviors only
  - [ ] 7.2 Reuse CSS parser from LWC parser
    - Adapt parseCSSFile function for Aura components
    - Ensure it works with Aura CSS files
    - Integrate with existing logger
  - [ ] 7.3 Implement CSS file reader for Aura components
    - Read .css files from Aura component directories
    - Handle file encoding and line endings
    - Follow existing file reading patterns
  - [ ] 7.4 Verify CSS extraction works for Aura components
    - Extract CSS class selectors
    - Extract CSS custom properties (CSS variables)
    - Extract media queries and responsive breakpoints
    - Extract keyframe animations
    - Extract styling information for test generation
  - [ ] 7.5 Ensure CSS parser tests pass
    - Run ONLY the 2-8 tests written in 7.1
    - Verify CSS parsing works correctly for Aura components
    - Verify all extraction methods work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 7.1 pass
- CSS files parsed successfully
- All specified details extracted correctly
- CSS parser reused effectively from LWC parser

### Metadata Parser

#### Task Group 8: Metadata File Parser
**Dependencies:** Task Groups 1, 2

- [ ] 8.0 Complete metadata parser
  - [ ] 8.1 Write 2-8 focused tests for metadata parser
    - Test .cmp-meta.xml file parsing
    - Test .app-meta.xml file parsing
    - Test API version extraction
    - Limit to critical behaviors only
  - [ ] 8.2 Reuse fast-xml-parser from XML parser
    - Adapt XML parser configuration for Aura metadata files
    - Create parseAuraMetadataFile function
    - Integrate with existing logger
  - [ ] 8.3 Implement .cmp-meta.xml file reader
    - Read .cmp-meta.xml files from file system
    - Handle file encoding and line endings
    - Follow existing file reading patterns
  - [ ] 8.4 Implement .app-meta.xml file reader
    - Read .app-meta.xml files from file system
    - Handle file encoding and line endings
    - Follow existing file reading patterns
  - [ ] 8.5 Implement metadata extraction
    - Extract API version from metadata files
    - Extract description from metadata files
    - Extract any additional metadata useful for test generation
  - [ ] 8.6 Ensure metadata parser tests pass
    - Run ONLY the 2-8 tests written in 8.1
    - Verify metadata parsing works correctly
    - Verify all extraction methods work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 8.1 pass
- Metadata files parsed successfully
- All specified details extracted correctly
- Error handling works correctly

### Application Parser

#### Task Group 9: Aura Application Parser
**Dependencies:** Task Groups 1, 2, 3

- [ ] 9.0 Complete Aura application parser
  - [ ] 9.1 Write 2-8 focused tests for application parser
    - Test .app file parsing
    - Test application structure extraction
    - Test component dependency extraction
    - Limit to critical behaviors only
  - [ ] 9.2 Implement .app file reader
    - Read .app files from file system
    - Handle file encoding and line endings
    - Follow existing file reading patterns
  - [ ] 9.3 Implement application structure extraction
    - Parse aura:application root element
    - Extract application name, extends, access level
    - Extract application attributes and configuration
  - [ ] 9.4 Implement component dependency extraction
    - Extract aura:dependency resource references
    - Extract component dependencies
    - Map dependencies to component definitions
  - [ ] 9.5 Implement application extends extraction
    - Extract application extends (ltng:outApp, etc.)
    - Extract extends configuration
  - [ ] 9.6 Link applications to component dependencies
    - Build application-to-component dependency relationships
    - Store in dependency graph
  - [ ] 9.7 Ensure application parser tests pass
    - Run ONLY the 2-8 tests written in 9.1
    - Verify application parsing works correctly
    - Verify all extraction methods work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 9.1 pass
- .app files parsed successfully
- All specified details extracted correctly
- Applications treated as special type of component
- Error handling works correctly

### Component Bundle Parser

#### Task Group 10: Component Bundle Parser
**Dependencies:** Task Groups 3, 4, 5, 6, 7, 8

- [ ] 10.0 Complete component bundle parser
  - [ ] 10.1 Write 2-8 focused tests for component bundle parser
    - Test component bundle parsing
    - Test component name extraction from directory
    - Test linking files together as unified component
    - Test handling missing optional files
    - Limit to critical behaviors only
  - [ ] 10.2 Create component bundle discovery module
    - Identify component bundles by directory structure (aura/ComponentName/)
    - Find ComponentName.cmp, ComponentNameController.js, ComponentNameHelper.js, ComponentNameRenderer.js, ComponentName.css, ComponentName.cmp-meta.xml files
    - Handle components with missing optional files
  - [ ] 10.3 Implement component bundle parser
    - Parse all files in a bundle together
    - Link parsed structures into unified AuraComponentDefinition
    - Extract component name from directory structure
  - [ ] 10.4 Integrate markup, Controller, Helper, Renderer, CSS, and metadata parsers
    - Call markup parser for .cmp file
    - Call Controller parser for *Controller.js file (if present)
    - Call Helper parser for *Helper.js file (if present)
    - Call Renderer parser for *Renderer.js file (if present)
    - Call CSS parser for .css file (if present)
    - Call metadata parser for .cmp-meta.xml file (if present)
    - Combine results into single component definition
  - [ ] 10.5 Implement component metadata extraction from directory
    - Extract component name from folder structure (aura/ComponentName/ → ComponentName)
    - Handle nested component directories if present
  - [ ] 10.6 Integrate with file scanner for component discovery
    - Use scanDirectory to find aura/ directories
    - Process component bundles in parallel with concurrency limit
    - Skip invalid bundles with warnings
  - [ ] 10.7 Ensure component bundle parser tests pass
    - Run ONLY the 2-8 tests written in 10.1
    - Verify component bundles parsed correctly
    - Verify files linked together correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 10.1 pass
- Component bundles identified correctly by directory structure
- All files in bundle parsed and linked together
- Component name extracted correctly from directory
- Missing optional files handled gracefully

### Dependency Graph Building

#### Task Group 11: Dependency Graph Building
**Dependencies:** Task Groups 10, 9

- [ ] 11.0 Complete dependency graph building
  - [ ] 11.1 Write 2-8 focused tests for dependency graph building
    - Test Aura-to-Aura dependency graph building
    - Test Aura-to-Object dependency graph building
    - Test Aura-to-Apex dependency graph building
    - Limit to critical behaviors only
  - [ ] 11.2 Create Aura-to-Aura dependency graph implementation
    - Extract component references from markup (<c:ComponentName>)
    - Extract component dependencies from applications (aura:dependency)
    - Build dependency graph similar to LWC dependency graph
    - Support bidirectional queries
  - [ ] 11.3 Create Aura-to-Object dependency graph implementation
    - Extract object references from attributes (SObject types)
    - Extract object references from data bindings
    - Extract object references from Apex calls (from Helper files)
    - Build dependency graph similar to ApexToObjectDependencyGraph
    - Support bidirectional queries
  - [ ] 11.4 Create Aura-to-Apex dependency graph implementation
    - Extract Apex class names from $A.enqueueAction() calls in Helper files
    - Extract Apex controller references from component markup (controller attribute)
    - Build dependency graph similar to ApexToObjectDependencyGraph
    - Support bidirectional queries
  - [ ] 11.5 Integrate dependency graph building with component bundle parser
    - Build dependency graphs during component parsing
    - Store dependency graphs separately for efficient querying
  - [ ] 11.6 Cross-reference with object definitions
    - Cross-reference Aura components with object definitions from XML parser
    - Validate object references
  - [ ] 11.7 Cross-reference with Apex class definitions
    - Cross-reference Aura components with Apex class definitions from Apex parser
    - Validate Apex class references
  - [ ] 11.8 Ensure dependency graph building tests pass
    - Run ONLY the 2-8 tests written in 11.1
    - Verify dependency graphs built correctly
    - Verify cross-referencing works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 11.1 pass
- Aura-to-Aura dependency graph built correctly
- Aura-to-Object dependency graph built correctly
- Aura-to-Apex dependency graph built correctly
- Cross-referencing with object and Apex definitions works correctly

### Result Storage

#### Task Group 12: Result Storage and Persistence
**Dependencies:** Task Groups 10, 11

- [ ] 12.0 Complete result storage and persistence
  - [ ] 12.1 Write 2-8 focused tests for result storage
    - Test in-memory storage
    - Test JSON persistence
    - Test result querying
    - Limit to critical behaviors only
  - [ ] 12.2 Create ParsedAuraResults implementation
    - Store parsed components in Map<string, AuraComponentDefinition>
    - Store parsed applications in Map<string, ApplicationDefinition>
    - Store dependency graphs (Aura-to-Aura, Aura-to-Object, Aura-to-Apex)
    - Store parsedAt timestamp
  - [ ] 12.3 Implement toJSON() method for persistence
    - Convert in-memory structures to JSON
    - Follow ParsedLWCResults and ParsedXMLResults patterns
  - [ ] 12.4 Implement result querying methods
    - Query components by name
    - Query components by dependency
    - Query components by interface implementation
    - Query components by Apex dependency
    - Query components by object dependency
  - [ ] 12.5 Implement result persistence to JSON files
    - Save parsed results to JSON files
    - Save dependency graphs to separate JSON files
    - Follow existing persistence patterns
  - [ ] 12.6 Ensure result storage tests pass
    - Run ONLY the 2-8 tests written in 12.1
    - Verify in-memory storage works correctly
    - Verify JSON persistence works correctly
    - Verify result querying works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 12.1 pass
- Parsed results stored correctly in-memory
- JSON persistence works correctly
- Result querying works correctly

### Integration & CLI

#### Task Group 13: Integration and CLI Command
**Dependencies:** Task Groups 10, 11, 12

- [ ] 13.0 Complete integration and CLI command
  - [ ] 13.1 Write 2-8 focused tests for integration
    - Test end-to-end component parsing
    - Test CLI command execution
    - Test parallel processing
    - Limit to critical behaviors only
  - [ ] 13.2 Create parseAllAuraComponents function
    - Discover Aura component bundles in aura/ directories
    - Process components in parallel with configurable concurrency
    - Build dependency graphs
    - Cross-reference with object and Apex definitions
    - Return ParsedAuraResults
  - [ ] 13.3 Integrate with file scanner
    - Use scanDirectory to find aura/ directories
    - Process component bundles in parallel
    - Skip invalid bundles with warnings
  - [ ] 13.4 Implement parallel processing
    - Process multiple component bundles in parallel
    - Support configurable concurrency (similar to Flow parser)
    - Handle errors gracefully without stopping entire process
  - [ ] 13.5 Add parse-aura command to CLI
    - Add parse-aura command with [path] option
    - Add --output option for output directory
    - Add --dependencies option to save dependency graphs
    - Add --to-object option to save Aura-to-Object dependency graph
    - Add --to-apex option to save Aura-to-Apex dependency graph
    - Add --concurrency option for parallel processing
  - [ ] 13.6 Implement CLI command action
    - Call parseAllAuraComponents
    - Save parsed results to JSON files
    - Save dependency graphs to JSON files
    - Report parsing summary (components parsed, errors, warnings)
  - [ ] 13.7 Ensure integration tests pass
    - Run ONLY the 2-8 tests written in 13.1
    - Verify end-to-end parsing works correctly
    - Verify CLI command works correctly
    - Verify parallel processing works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 13.1 pass
- End-to-end component parsing works correctly
- CLI command works correctly
- Parallel processing works correctly
- Error handling works correctly

### Testing & Verification

#### Task Group 14: Integration Testing & Gap Analysis
**Dependencies:** Task Groups 13

- [ ] 14.0 Complete integration testing and gap analysis
  - [ ] 14.1 Write comprehensive integration tests
    - Test parsing all Aura component types (components, applications)
    - Test parsing components with all file types present
    - Test parsing components with missing optional files
    - Test dependency graph building
    - Test cross-referencing with objects and Apex classes
    - Test error handling with invalid/malformed files
    - Test parallel processing with various concurrency levels
    - Test CLI command with real Aura component files
  - [ ] 14.2 Test with real Aura component files
    - Test parser with real Aura component files from Salesforce metadata repository
    - Verify all extraction methods work correctly
    - Verify dependency graphs built correctly
    - Verify cross-referencing works correctly
  - [ ] 14.3 Perform gap analysis
    - Document what features are implemented
    - Document any limitations or edge cases
    - Document recommendations for future enhancements
  - [ ] 14.4 Run full test suite
    - Run all tests for Aura Component Parser
    - Verify all tests pass
    - Fix any failing tests
  - [ ] 14.5 Generate final verification report
    - Document implementation status
    - Document test results
    - Document performance metrics
    - Document gap analysis results

**Acceptance Criteria:**
- All integration tests pass
- Parser works correctly with real Aura component files
- Dependency graphs built correctly
- Cross-referencing works correctly
- Error handling works correctly
- Performance is acceptable
- Gap analysis completed

