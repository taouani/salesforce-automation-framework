# Specification: Flow Parser

## Goal
Create a parser that extracts comprehensive metadata from Salesforce Flow definition files (.flow-meta.xml) to enable generation of Playwright test scripts that accurately test Flow execution, decision paths, screen navigation, and object interactions.

## User Stories
- As a test automation engineer, I want to parse Flow definition files so that I can understand flow elements, decision paths, and screen navigation for generating accurate Playwright tests
- As a QA lead, I want to extract flow metadata, inputs/outputs, and object interactions so that I can generate comprehensive test coverage for Salesforce Flows
- As a test automation engineer, I want to map flows to Salesforce objects so that I can generate tests that validate flow-object interactions

## Specific Requirements

**Unified Flow Parser**
- Parse all types of Salesforce Flow definition files (.flow-meta.xml)
- Support Screen Flows (user-interactive flows)
- Support Autolaunched Flows (background flows)
- Support Record-Triggered Flows (before save, after save, etc.)
- Support Scheduled Flows
- Support Platform Event-Triggered Flows
- Identify flow files by extension (.flow-meta.xml)
- Extract flow name from file path structure (flows/FlowName.flow-meta.xml → FlowName)
- Process all flow types through the same parsing pipeline

**Flow Element Extraction**
- Extract element types:
  - Screen elements (user input screens)
  - Decision elements (if/else logic)
  - Assignment elements (variable assignments)
  - Loop elements (for loops, while loops)
  - Action elements (Apex actions, subflows, etc.)
  - Wait elements (pauses in flow execution)
  - Record Lookup elements (SOQL queries)
  - Record Create/Update/Delete elements (DML operations)
  - Formula elements (calculations)
  - Subflow elements (nested flows)
- Extract element properties:
  - Element labels and API names
  - Field references and object references
  - Element positions and connections
  - Element descriptions
- Extract element formulas and expressions:
  - Formula fields and calculations
  - Assignment expressions
  - Decision criteria formulas
  - Screen field default values
- Extract element conditions and criteria:
  - Decision conditions (true/false paths)
  - Loop conditions
  - Entry conditions

**Flow Inputs and Outputs**
- Extract input variables:
  - Variable name and type
  - Required vs optional
  - Default values
  - Input descriptions
- Extract output variables:
  - Variable name and type
  - Assignment sources
  - Output descriptions
- Map inputs to screen fields:
  - Which screen fields use which input variables
  - Field types and validation rules
- Map outputs to flow results:
  - Which outputs are returned from the flow
  - Output assignments and sources

**Decision Path Extraction**
- Extract decision outcomes:
  - True path outcomes
  - False path outcomes
  - Default outcomes
- Extract decision criteria and formulas:
  - Condition expressions
  - Comparison operators
  - Field references in conditions
- Map decision paths to subsequent elements:
  - Which elements follow each decision outcome
  - Path connections and flow
- Build decision tree/graph structure:
  - Visual representation of decision paths
  - All possible execution paths through the flow

**Flow Entry Points**
- Identify flow start elements:
  - Entry point elements
  - Start element connections
- Identify flow triggers:
  - Record-triggered flow triggers (before save, after save, etc.)
  - Scheduled flow triggers (cron expressions)
  - Platform event triggers (event types)
  - Autolaunched flow entry points
- Extract trigger conditions:
  - Record trigger conditions (object, criteria)
  - Scheduled trigger expressions
  - Event trigger filters
- Map entry points to flow paths:
  - Which paths start from each entry point
  - Entry point to element connections

**Flow Formulas and Expressions**
- Extract formula fields and calculations:
  - Formula syntax
  - Field references in formulas
  - Function calls in formulas
- Extract assignment expressions:
  - Variable assignments
  - Field assignments
  - Expression syntax
- Extract decision criteria formulas:
  - Condition formulas
  - Comparison expressions
  - Logical operators
- Extract screen field default values:
  - Default value expressions
  - Formula-based defaults

**Subflow Handling**
- Parse subflow references:
  - Subflow names and API names
  - Subflow call locations
- Extract subflow inputs/outputs:
  - Input parameters passed to subflows
  - Output parameters received from subflows
- Build flow dependency graph:
  - Which flows call which subflows
  - Subflow dependency relationships
- Recursively parse nested subflows:
  - Parse referenced subflow files
  - Build complete flow hierarchy
  - Handle circular dependencies gracefully

**Flow-to-Object Mapping**
- Extract object references from flow elements:
  - Objects referenced in record lookups
  - Objects referenced in record create/update/delete
  - Objects referenced in field references
- Map flows to objects they create/update/delete:
  - DML operations in flows
  - Object types being modified
  - Field assignments to objects
- Map flows to objects they query:
  - Record lookup elements
  - SOQL queries in flows
  - Object types being queried
- Build flow-to-object dependency graph:
  - Similar to ApexToObjectDependencyGraph
  - Store relationships between flows and Salesforce objects
  - Support bidirectional queries (which flows use object X, which objects does flow Y use)

**Flow Error Handling**
- Extract fault paths:
  - Error handling paths
  - Fault connector destinations
- Extract error messages:
  - Error message text
  - Error message locations
- Map error handling flows:
  - Which flows handle which errors
  - Error handling flow connections
- Extract retry logic:
  - Retry conditions
  - Retry attempts
  - Retry intervals

**Additional Details for Playwright Test Generation**
- Extract screen field types and validation rules:
  - Field input types (text, number, date, picklist, etc.)
  - Field validation rules
  - Required field indicators
  - Field help text
- Extract screen navigation paths:
  - Next button destinations
  - Previous button destinations
  - Screen flow sequence
  - Navigation conditions
- Extract flow variables and their usage:
  - Variable declarations
  - Variable assignments
  - Variable usage locations
  - Variable scopes
- Extract Apex actions and invocable methods called from flows:
  - Apex action names
  - Invocable method names
  - Action input parameters
  - Action output parameters
  - Apex class references

**Error Handling**
- Follow existing XML parser pattern: skip invalid/malformed files with warnings
- Create custom error types: FlowParseError extending ScannerError
- Continue processing other files even if one fails (graceful degradation)
- Log detailed error information including file path and error message
- Collect parsing errors and warnings without stopping entire process
- Report summary of errors/warnings at end of parsing

**Data Storage Architecture**
- Create TypeScript interfaces for parsed Flow structures:
  - FlowDefinition (flow-level details)
  - FlowElementDefinition (element-level details)
  - FlowVariableDefinition (variable details)
  - FlowDecisionPathDefinition (decision path details)
  - FlowScreenDefinition (screen element details)
  - FlowSubflowDefinition (subflow reference details)
  - FlowToObjectMapping (mapping between flows and objects)
- Store parsed flows in-memory during execution (Map<string, FlowDefinition>)
- Store parsed results in JSON files for persistence (similar to XML/LWC/Apex parser results)
- Build flow dependency graph (similar to ComponentDependencyGraph for LWC, ApexToObjectDependencyGraph for Apex)
- Build flow-to-object dependency graph (similar to ApexToObjectDependencyGraph)
- Cross-reference parsed flows with object definitions and Apex classes for test generation
- Support querying flows by name, by object dependency, by flow type, by trigger type

**Type Definitions**
- Create TypeScript interfaces for Flow structures:
  - FlowDefinition (name, type, status, elements, variables, inputs, outputs)
  - FlowElementDefinition (type, label, API name, properties, formulas, conditions)
  - FlowVariableDefinition (name, type, dataType, isInput, isOutput, defaultValue)
  - FlowDecisionPathDefinition (decision element, outcomes, paths, criteria)
  - FlowScreenDefinition (screen element, fields, navigation, validation)
  - FlowSubflowDefinition (subflow name, inputs, outputs, location)
  - FlowTriggerDefinition (trigger type, object, events, conditions)
  - FlowToObjectMapping (flow name, object name, relationship type: lookup, create, update, delete, query)
- Create TypeScript interfaces for dependency graph structures:
  - FlowDependencyGraph (similar to ComponentDependencyGraph)
  - FlowToObjectDependencyGraph (similar to ApexToObjectDependencyGraph)
  - FlowDependencyNode (flow or subflow)
  - FlowDependencyEdge (relationship between flows)
  - FlowToObjectNode (flow or object)
  - FlowToObjectEdge (relationship between flow and object)
- Ensure type safety throughout parsing pipeline

**Integration with Existing Systems**
- Integrate with existing file scanner to discover Flow definition files
- Use existing logger for structured logging (follow existing log level patterns)
- Follow existing error handling patterns (custom error types extending ScannerError)
- Store parsed results similar to ParsedXMLResults, ParsedLWCResults, and ParsedApexResults structures
- Build dependency graphs similar to RelationshipGraph, ComponentDependencyGraph, and ApexToObjectDependencyGraph implementations
- Cross-reference with object definitions from XML parser for test generation
- Cross-reference with Apex class definitions for invocable method mapping
- Cross-reference with LWC component definitions for comprehensive test coverage

## Visual Design
No visual assets provided.

## Existing Code to Leverage

**XML Parser (src/parser/xml-parser.ts)**
- Reuse file reading patterns (readFile with error handling)
- Reuse fast-xml-parser configuration and usage
- Follow parallel processing approach with configurable concurrency
- Reuse skip invalid files with warnings pattern
- Follow existing error handling and logging patterns

**File Scanner (src/scanner/file-scanner.ts)**
- Integrate with scanDirectory function to discover Flow definition files
- Use processFilesInParallel for parallel Flow file parsing
- Reuse file path extraction utilities
- Follow existing file traversal patterns

**Error Handling Utilities (src/utils/errors.ts, src/utils/xml-errors.ts, src/utils/apex-errors.ts)**
- Create new error types (FlowParseError) following ScannerError pattern
- Use ErrorCollection for aggregating parsing errors
- Follow existing error handling best practices

**Type Definitions (src/types/xml-parsed.ts, src/types/lwc-parsed.ts, src/types/apex-parsed.ts)**
- Follow existing type definition patterns (ObjectDefinition, LWCComponentDefinition, ApexClassDefinition, etc.)
- Create similar structure for FlowDefinition
- Follow ParsedXMLResults, ParsedLWCResults, and ParsedApexResults patterns for storing parsed Flow results
- Create dependency graphs similar to RelationshipGraph, ComponentDependencyGraph, and ApexToObjectDependencyGraph structures

**Result Storage (src/parser/xml-results.ts, src/parser/lwc-results.ts, src/parser/apex-results.ts)**
- Follow ParsedXMLResults, ParsedLWCResults, and ParsedApexResults patterns for storing parsed flows
- Use Map<string, FlowDefinition> for in-memory storage
- Implement toJSON() method for persistence
- Store dependency graphs separately for efficient querying

**Dependency Graph (src/parser/relationship-graph.ts, src/parser/component-dependency-graph.ts, src/parser/apex-dependency-graph.ts)**
- Follow RelationshipGraph, ComponentDependencyGraph, and ApexToObjectDependencyGraph patterns
- Create FlowDependencyGraph implementation (for subflow relationships)
- Create FlowToObjectDependencyGraph implementation (for flow-object relationships)
- Support bidirectional queries (Flows → Objects, Objects → Flows)

**Logger Utilities (src/utils/logger.ts)**
- Use existing logger instance for structured logging
- Follow existing log level patterns (info, warn, error, debug)
- Maintain consistent logging format across parsing operations

## Out of Scope
- Executing or validating flows (only parsing and metadata extraction)
- Generating test scripts (that functionality is for later phases)
- Flow execution or evaluation (only parsing and metadata extraction)
- Real-time parsing or file watching (batch processing only)
- Integration with Salesforce orgs (local file system only)
- Performance optimization beyond parallel processing (no caching or incremental parsing)
- Flow performance analysis (only metadata extraction)
- Flow version comparison (only parsing current version)
- Flow migration or deployment (only parsing and metadata extraction)

