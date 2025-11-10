# Specification: Apex Code Parser

## Goal
Create a parser that extracts comprehensive metadata from Apex class files (.cls) and Apex trigger files (.trigger) to enable generation of Playwright test scripts that accurately interact with Apex classes, their methods, SOQL queries, DML operations, and their relationships to Salesforce objects.

## User Stories
- As a test automation engineer, I want to parse Apex class files so that I can understand class methods, properties, and annotations for generating accurate Playwright tests
- As a QA lead, I want to extract Apex class metadata, SOQL queries, and DML operations so that I can generate comprehensive test coverage for Apex code
- As a test automation engineer, I want to map Apex classes to Salesforce objects so that I can generate tests that validate object interactions

## Specific Requirements

**Unified Apex Parser**
- Parse Apex class files (.cls) and trigger files (.trigger) together as a unified parser
- Identify Apex files by file extension (.cls for classes, .trigger for triggers)
- Extract file name from path structure (classes/ClassName.cls → ClassName)
- Process both file types through the same parsing pipeline
- Support parsing files independently (unlike LWC bundles which must be parsed together)

**Apex Class File Parsing**
- Use an existing Apex parser library if available, otherwise use a library with balance of efficiency and easiness
- Extract class-level details:
  - Class name
  - Annotations (@isTest, @RestResource, @HttpPost, @HttpGet, etc.)
  - Access modifiers (public, private, global, with sharing, without sharing)
  - Superclasses (extends keyword)
  - Interfaces (implements keyword)
- Extract method-level details:
  - Method name
  - Parameters (name, type, default values if any)
  - Return type (void, primitive types, SObject types, custom types)
  - Access modifiers (public, private, global, protected)
  - Annotations (@Test, @future, @invocable, @AuraEnabled, @ReadOnly, etc.)
  - Exception handling (throws clause, try-catch blocks)
  - Static modifier
- Extract property-level details:
  - Property name
  - Property type
  - Access modifiers (public, private, global, protected)
  - Static modifier
  - Final modifier
  - Initial values if present
- Extract inner classes if present:
  - Same level of detail as outer classes
- Extract comments/documentation only if judged useful for test generation

**Apex Trigger File Parsing**
- Extract trigger metadata:
  - Trigger name
  - Object(s) the trigger operates on (from trigger declaration: `trigger TriggerName on ObjectName`)
  - Trigger events (before insert, after insert, before update, after update, before delete, after delete, after undelete)
  - Trigger context variables usage (Trigger.new, Trigger.old, Trigger.newMap, Trigger.oldMap)
- Extract trigger logic and DML operations:
  - DML operations within trigger (insert, update, upsert, delete, undelete)
  - Database methods (Database.insert, Database.update, etc.)
  - Objects being operated on
  - Bulk vs single record operations
- Do NOT extract trigger body content (only metadata and DML operations)

**Test Class Identification**
- Identify test classes:
  - Look for `@isTest` annotation on class declaration
  - Mark class as test class
- Identify test methods:
  - Look for `@isTest` annotation on method declaration
  - Look for `testMethod` keyword (legacy syntax)
  - Mark method as test method
- Extract test setup methods:
  - Methods annotated with `@TestSetup`
  - Methods that create test data
- Extract test data factories:
  - Methods that return test data objects
  - Methods that create test records
- Extract test utility methods:
  - Helper methods used in test classes
  - Methods that assist with test data creation or assertions

**SOQL Query Extraction**
- Extract SOQL query details (if useful for core functionality):
  - Query string (full query text)
  - Parsed query structure:
    - Object(s) being queried (FROM clause)
    - Fields selected (SELECT clause)
    - WHERE clause conditions (field comparisons, logical operators)
    - ORDER BY clauses (field and direction)
    - LIMIT clause
    - GROUP BY clause
    - HAVING clause
  - Handle both static SOQL (queries in square brackets: `[SELECT ...]`)
  - Handle dynamic SOQL (string concatenation: `Database.query(...)`)
  - Extract SOSL queries if present
  - Extract query context (method where query is executed)

**DML Operation Extraction**
- Extract DML operation details (if useful for core functionality):
  - Operation type: insert, update, upsert, delete, undelete
  - Objects/records being operated on
  - Single record operations vs bulk operations (lists)
  - Database methods with options:
    - `Database.insert(records, allOrNothing)`
    - `Database.update(records, allOrNothing)`
    - `Database.upsert(records, externalIdField, allOrNothing)`
  - Extract DML context (method where DML is executed)
  - Extract error handling around DML operations

**Apex-to-Object Mapping**
- Parse SOQL queries to identify objects:
  - Extract object names from FROM clauses
  - Map classes to objects they query
- Parse DML operations to identify objects:
  - Extract object types from DML operations
  - Map classes to objects they modify
- Parse method parameters/return types:
  - Identify SObject types in method signatures
  - Map classes to objects they accept/return
- Parse trigger definitions:
  - Extract object names from trigger declarations
  - Map triggers to objects they operate on
- Build Apex-to-object dependency graph:
  - Similar to ComponentDependencyGraph for LWC components
  - Store relationships between Apex classes and Salesforce objects
  - Support bidirectional queries (which classes use object X, which objects does class Y use)

**Additional Details Extraction**
- Extract HTTP callouts:
  - Methods annotated with `@HttpPost`, `@HttpGet`, `@HttpPut`, `@HttpDelete`
  - REST API endpoints
  - Web service callouts (`HttpRequest`, `HttpResponse`)
- Extract batch classes:
  - Classes implementing `Database.Batchable`
  - Batch job details
- Extract queueable classes:
  - Classes implementing `Queueable`
  - Asynchronous job details
- Extract schedulable classes:
  - Classes implementing `Schedulable`
  - Scheduled job details
- Extract invocable methods:
  - Methods annotated with `@InvocableMethod`
  - Flow integration points
- Extract Aura-enabled methods:
  - Methods annotated with `@AuraEnabled`
  - Lightning component integration points
- Extract any other details useful for Playwright test generation

**Error Handling**
- Follow existing XML/JavaScript parser pattern: skip invalid/malformed files with warnings
- Create custom error types: ApexParseError extending ScannerError
- Continue processing other files even if one fails (graceful degradation)
- Log detailed error information including file path and error message
- Collect parsing errors and warnings without stopping entire process
- Report summary of errors/warnings at end of parsing

**Data Storage Architecture**
- Create TypeScript interfaces for parsed Apex structures:
  - ApexClassDefinition (class-level details)
  - ApexMethodDefinition (method-level details)
  - ApexPropertyDefinition (property-level details)
  - ApexTriggerDefinition (trigger-level details)
  - SOQLQueryDefinition (SOQL query details)
  - DMLOperationDefinition (DML operation details)
  - ApexToObjectMapping (mapping between Apex and objects)
- Store parsed Apex classes and triggers in-memory during execution (Map<string, ApexClassDefinition>, Map<string, ApexTriggerDefinition>)
- Store parsed results in JSON files for persistence (similar to XML/LWC parser results)
- Build Apex-to-object dependency graph (similar to RelationshipGraph for objects, ComponentDependencyGraph for LWC)
- Cross-reference parsed Apex classes with object definitions for test generation
- Support querying Apex classes by name, by object dependency, by annotation type

**Type Definitions**
- Create TypeScript interfaces for Apex class structures:
  - ApexClassDefinition (name, annotations, access modifiers, superclasses, interfaces, methods, properties)
  - ApexMethodDefinition (name, parameters, return type, access modifiers, annotations, exceptions)
  - ApexPropertyDefinition (name, type, access modifiers, static/final modifiers)
  - ApexTriggerDefinition (name, objects, events, DML operations)
  - SOQLQueryDefinition (query string, object, fields, WHERE clause, ORDER BY, LIMIT, GROUP BY)
  - DMLOperationDefinition (operation type, objects, bulk vs single, database method options)
  - ApexToObjectMapping (class name, object name, relationship type: SOQL, DML, parameter, return type, trigger)
- Create TypeScript interfaces for dependency graph structures:
  - ApexToObjectDependencyGraph (similar to ComponentDependencyGraph)
  - ApexToObjectNode (Apex class or trigger)
  - ApexToObjectEdge (relationship between Apex and object)
- Ensure type safety throughout parsing pipeline

**Integration with Existing Systems**
- Integrate with existing file scanner to discover Apex class and trigger files
- Use existing logger for structured logging (follow existing log level patterns)
- Follow existing error handling patterns (custom error types extending ScannerError)
- Store parsed results similar to ParsedXMLResults and ParsedLWCResults structures
- Build dependency graph similar to RelationshipGraph and ComponentDependencyGraph implementations
- Cross-reference with object definitions from XML parser for test generation
- Cross-reference with LWC component definitions for comprehensive test coverage

## Visual Design
No visual assets provided.

## Existing Code to Leverage

**JavaScript/TypeScript Parser (src/parser/javascript-parser.ts)**
- Reuse AST-based parsing approach (if Apex parser uses AST)
- Follow method/property extraction patterns
- Reuse annotation extraction logic
- Follow error handling and logging patterns

**XML Parser (src/parser/xml-parser.ts)**
- Reuse file reading patterns (readFile with error handling)
- Follow parallel processing approach with configurable concurrency
- Reuse skip invalid files with warnings pattern
- Follow existing error handling and logging patterns

**File Scanner (src/scanner/file-scanner.ts)**
- Integrate with scanDirectory function to discover Apex class and trigger files
- Use processFilesInParallel for parallel Apex file parsing
- Reuse file path extraction utilities
- Follow existing file traversal patterns

**Error Handling Utilities (src/utils/errors.ts, src/utils/lwc-errors.ts)**
- Create new error types (ApexParseError) following ScannerError pattern
- Use ErrorCollection for aggregating parsing errors
- Follow existing error handling best practices

**Type Definitions (src/types/xml-parsed.ts, src/types/lwc-parsed.ts)**
- Follow existing type definition patterns (ObjectDefinition, LWCComponentDefinition, etc.)
- Create similar structure for ApexClassDefinition and ApexTriggerDefinition
- Follow ParsedXMLResults and ParsedLWCResults patterns for storing parsed Apex results
- Create dependency graph similar to RelationshipGraph and ComponentDependencyGraph structures

**Result Storage (src/parser/xml-results.ts, src/parser/lwc-results.ts)**
- Follow ParsedXMLResults and ParsedLWCResults patterns for storing parsed Apex classes and triggers
- Use Map<string, ApexClassDefinition> and Map<string, ApexTriggerDefinition> for in-memory storage
- Implement toJSON() method for persistence
- Store dependency graph separately for efficient querying

**Dependency Graph (src/parser/relationship-graph.ts, src/parser/component-dependency-graph.ts)**
- Follow RelationshipGraph and ComponentDependencyGraph patterns
- Create ApexToObjectDependencyGraph implementation
- Support bidirectional queries (Apex → Objects, Objects → Apex)

**Logger Utilities (src/utils/logger.ts)**
- Use existing logger instance for structured logging
- Follow existing log level patterns (info, warn, error, debug)
- Maintain consistent logging format across parsing operations

## Out of Scope
- Extracting trigger body content (only metadata and DML operations)
- Extracting comments/documentation unless useful for test generation
- Executing or validating Apex code (only parsing and metadata extraction)
- Generating test scripts (that functionality is for later phases)
- Apex code execution or evaluation (only parsing and AST extraction)
- Code coverage analysis (only metadata extraction)
- Real-time parsing or file watching (batch processing only)
- Integration with Salesforce orgs (local file system only)
- Performance optimization beyond parallel processing (no caching or incremental parsing)
- Parsing Apex test execution results (only parsing source code)
- Code quality analysis or linting (only metadata extraction)

