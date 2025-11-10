# Task Breakdown: Apex Code Parser

## Overview
Total Tasks: 10 task groups

## Task List

### Dependencies & Type Definitions

#### Task Group 1: Parsing Library and Type Definitions Setup
**Dependencies:** None

- [x] 1.0 Complete parsing library and type definitions infrastructure
  - [x] 1.1 Write 2-8 focused tests for parsing library and type definitions
    - Test Apex parser library setup
    - Test type definitions for parsed structures
    - Limit to critical behaviors only
  - [x] 1.2 Research and select Apex parser library
    - Research existing Apex parser libraries (Java-based or JavaScript-based)
    - Evaluate options for efficiency and ease of use
    - Select appropriate library or determine if custom parser needed
  - [x] 1.3 Install selected Apex parser library dependency
    - Add to package.json dependencies
    - Install package
    - Add type definitions if available
  - [x] 1.4 Create TypeScript interfaces for Apex class structures
    - ApexClassDefinition interface (name, annotations, access modifiers, superclasses, interfaces, methods, properties)
    - ApexMethodDefinition interface (name, parameters, return type, access modifiers, annotations, exceptions)
    - ApexPropertyDefinition interface (name, type, access modifiers, static/final modifiers)
    - InnerClassDefinition interface (nested classes)
  - [x] 1.5 Create TypeScript interfaces for Apex trigger structures
    - ApexTriggerDefinition interface (name, objects, events, DML operations)
    - TriggerEventDefinition interface (event types: before insert, after update, etc.)
  - [x] 1.6 Create TypeScript interfaces for SOQL query structures
    - SOQLQueryDefinition interface (query string, object, fields, WHERE clause, ORDER BY, LIMIT, GROUP BY, HAVING)
    - SOQLClauseDefinition interface (WHERE, ORDER BY, etc.)
  - [x] 1.7 Create TypeScript interfaces for DML operation structures
    - DMLOperationDefinition interface (operation type, objects, bulk vs single, database method options)
    - DMLOptionsDefinition interface (allOrNothing, etc.)
  - [x] 1.8 Create TypeScript interfaces for Apex-to-object mapping
    - ApexToObjectMapping interface (class name, object name, relationship type: SOQL, DML, parameter, return type, trigger)
    - ApexToObjectDependencyGraph interface (similar to ComponentDependencyGraph)
    - ApexToObjectNode interface (Apex class or trigger)
    - ApexToObjectEdge interface (relationship between Apex and object)
  - [x] 1.9 Create TypeScript interfaces for additional details
    - HTTPCalloutDefinition interface (@HttpPost, @HttpGet, REST endpoints)
    - BatchClassDefinition interface (Database.Batchable implementation)
    - QueueableClassDefinition interface (Queueable implementation)
    - SchedulableClassDefinition interface (Schedulable implementation)
    - InvocableMethodDefinition interface (@InvocableMethod)
    - AuraEnabledMethodDefinition interface (@AuraEnabled)
  - [x] 1.10 Ensure parsing library and type definitions tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify all dependencies installed correctly
    - Verify type definitions compile without errors
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- Apex parser library selected and installed
- All TypeScript interfaces compile without errors
- Type definitions cover all required structures

### Error Handling

#### Task Group 2: Error Types for Apex Parsing
**Dependencies:** Task Group 1

- [x] 2.0 Complete error handling for Apex parsing
  - [x] 2.1 Write 2-8 focused tests for error handling
    - Test ApexParseError
    - Test error collection and reporting
    - Limit to critical behaviors only
  - [x] 2.2 Create ApexParseError extending ScannerError
    - Follow existing XMLParseError/JavaScriptParseError pattern
    - Include file path and error details
  - [x] 2.3 Integrate error handling with existing ErrorCollection
    - Use ErrorCollection for aggregating parsing errors
    - Follow existing error handling best practices
  - [x] 2.4 Ensure error handling tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify error types work correctly
    - Verify error collection works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- ApexParseError extends ScannerError correctly
- Error collection aggregates errors without stopping process
- Error handling follows existing patterns

### Apex Class Parser

#### Task Group 3: Apex Class File Parser
**Dependencies:** Task Groups 1, 2

- [x] 3.0 Complete Apex class file parser
  - [x] 3.1 Write 2-8 focused tests for Apex class parser
    - Test class-level extraction (name, annotations, access modifiers)
    - Test method-level extraction (name, parameters, return type, annotations)
    - Test property-level extraction (name, type, modifiers)
    - Test inner class extraction
    - Limit to critical behaviors only
  - [x] 3.2 Implement Apex class file reader
    - Read .cls files from file system
    - Handle file encoding and line endings
    - Follow existing file reading patterns
  - [x] 3.3 Implement class-level detail extraction
    - Extract class name
    - Extract annotations (@isTest, @RestResource, @HttpPost, @HttpGet, etc.)
    - Extract access modifiers (public, private, global, with sharing, without sharing)
    - Extract superclasses (extends keyword)
    - Extract interfaces (implements keyword)
  - [x] 3.4 Implement method-level detail extraction
    - Extract method name
    - Extract parameters (name, type, default values)
    - Extract return type (void, primitive types, SObject types, custom types)
    - Extract access modifiers (public, private, global, protected)
    - Extract annotations (@Test, @future, @invocable, @AuraEnabled, @ReadOnly, etc.)
    - Extract exception handling (throws clause, try-catch blocks)
    - Extract static modifier
  - [x] 3.5 Implement property-level detail extraction
    - Extract property name
    - Extract property type
    - Extract access modifiers (public, private, global, protected)
    - Extract static modifier
    - Extract final modifier
    - Extract initial values if present
  - [x] 3.6 Implement inner class extraction
    - Detect inner classes
    - Extract same level of detail as outer classes
    - Store inner classes within parent class definition
  - [x] 3.7 Implement comment/documentation extraction (if useful)
    - Extract comments only if judged useful for test generation
    - Store comment context (method, class, property)
  - [x] 3.8 Ensure Apex class parser tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify class, method, property extraction works correctly
    - Verify error handling works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- Apex class files parsed successfully
- All class-level properties extracted
- All method-level properties extracted
- All property-level properties extracted
- Inner classes extracted correctly

### Apex Trigger Parser

#### Task Group 4: Apex Trigger File Parser
**Dependencies:** Task Groups 1, 2

- [x] 4.0 Complete Apex trigger file parser
  - [x] 4.1 Write 2-8 focused tests for Apex trigger parser
    - Test trigger metadata extraction (name, objects, events)
    - Test trigger context variable detection
    - Test DML operation extraction from triggers
    - Limit to critical behaviors only
  - [x] 4.2 Implement Apex trigger file reader
    - Read .trigger files from file system
    - Handle file encoding and line endings
    - Follow existing file reading patterns
  - [x] 4.3 Implement trigger metadata extraction
    - Extract trigger name from declaration (`trigger TriggerName on ObjectName`)
    - Extract object(s) the trigger operates on
    - Extract trigger events (before insert, after insert, before update, after update, before delete, after delete, after undelete)
    - Parse trigger declaration syntax
  - [x] 4.4 Implement trigger context variable detection
    - Detect usage of Trigger.new, Trigger.old, Trigger.newMap, Trigger.oldMap
    - Store context variable usage patterns
  - [x] 4.5 Implement trigger DML operation extraction
    - Extract DML operations within trigger (insert, update, upsert, delete, undelete)
    - Extract Database methods (Database.insert, Database.update, etc.)
    - Extract objects being operated on
    - Detect bulk vs single record operations
    - Do NOT extract trigger body content (only metadata and DML)
  - [x] 4.6 Ensure Apex trigger parser tests pass
    - Run ONLY the 2-8 tests written in 4.1
    - Verify trigger metadata extraction works correctly
    - Verify DML extraction works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 4.1 pass
- Apex trigger files parsed successfully
- Trigger metadata extracted correctly
- Trigger events extracted correctly
- DML operations extracted correctly

### SOQL Query Extraction

#### Task Group 5: SOQL Query Parser
**Dependencies:** Task Groups 3, 4

- [x] 5.0 Complete SOQL query extraction
  - [x] 5.1 Write 2-8 focused tests for SOQL query extraction
    - Test static SOQL extraction ([SELECT ...])
    - Test dynamic SOQL extraction (Database.query)
    - Test SOQL clause parsing (WHERE, ORDER BY, LIMIT, etc.)
    - Limit to critical behaviors only
  - [x] 5.2 Implement static SOQL query extraction
    - Detect SOQL queries in square brackets: `[SELECT ... FROM ...]`
    - Extract full query string
    - Parse query structure
  - [x] 5.3 Implement SOQL query structure parsing
    - Extract object(s) being queried (FROM clause)
    - Extract fields selected (SELECT clause)
    - Extract WHERE clause conditions (field comparisons, logical operators)
    - Extract ORDER BY clauses (field and direction)
    - Extract LIMIT clause
    - Extract GROUP BY clause
    - Extract HAVING clause
  - [x] 5.4 Implement dynamic SOQL query extraction
    - Detect Database.query() calls
    - Extract query string from string concatenation
    - Handle variable-based query construction
    - Extract query context (method where query is executed)
  - [x] 5.5 Implement SOSL query extraction (if present)
    - Detect SOSL queries (FIND ... IN ...)
    - Extract SOSL query structure
  - [x] 5.6 Ensure SOQL query extraction tests pass
    - Run ONLY the 2-8 tests written in 5.1
    - Verify static SOQL extraction works correctly
    - Verify dynamic SOQL extraction works correctly
    - Verify query structure parsing works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 5.1 pass
- Static SOQL queries extracted successfully
- Dynamic SOQL queries extracted successfully
- Query structure parsed correctly
- All SOQL clauses extracted

### DML Operation Extraction

#### Task Group 6: DML Operation Parser
**Dependencies:** Task Groups 3, 4

- [x] 6.0 Complete DML operation extraction
  - [x] 6.1 Write 2-8 focused tests for DML operation extraction
    - Test insert operation extraction
    - Test update operation extraction
    - Test bulk vs single record detection
    - Test Database method extraction
    - Limit to critical behaviors only
  - [x] 6.2 Implement basic DML operation extraction
    - Extract insert operations
    - Extract update operations
    - Extract upsert operations
    - Extract delete operations
    - Extract undelete operations
  - [x] 6.3 Implement DML object extraction
    - Extract objects/records being operated on
    - Identify SObject types from DML operations
    - Handle both direct SObject types and variables
  - [x] 6.4 Implement bulk vs single record detection
    - Detect single record operations (single SObject)
    - Detect bulk operations (List<SObject>, Set<SObject>)
    - Store operation type (single vs bulk)
  - [x] 6.5 Implement Database method extraction
    - Extract Database.insert() calls with options
    - Extract Database.update() calls with options
    - Extract Database.upsert() calls with options
    - Extract allOrNothing parameter
    - Extract externalIdField parameter (for upsert)
  - [x] 6.6 Implement DML context extraction
    - Extract method where DML is executed
    - Extract error handling around DML operations
    - Store DML context information
  - [x] 6.7 Ensure DML operation extraction tests pass
    - Run ONLY the 2-8 tests written in 6.1
    - Verify DML operation extraction works correctly
    - Verify object extraction works correctly
    - Verify bulk detection works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 6.1 pass
- All DML operation types extracted successfully
- Objects being operated on identified correctly
- Bulk vs single record operations detected correctly
- Database methods with options extracted correctly

### Test Class Identification

#### Task Group 7: Test Class and Method Identification
**Dependencies:** Task Group 3

- [x] 7.0 Complete test class and method identification
  - [x] 7.1 Write 2-8 focused tests for test identification
    - Test @isTest annotation detection on classes
    - Test @isTest annotation detection on methods
    - Test testMethod keyword detection (legacy)
    - Test test setup method extraction
    - Limit to critical behaviors only
  - [x] 7.2 Implement test class identification
    - Look for @isTest annotation on class declaration
    - Mark class as test class
    - Store test class flag
  - [x] 7.3 Implement test method identification
    - Look for @isTest annotation on method declaration
    - Look for testMethod keyword (legacy syntax)
    - Mark method as test method
    - Store test method flag
  - [x] 7.4 Implement test setup method extraction
    - Detect methods annotated with @TestSetup
    - Identify methods that create test data
    - Store test setup method information
  - [x] 7.5 Implement test data factory extraction
    - Identify methods that return test data objects
    - Identify methods that create test records
    - Store test data factory information
  - [x] 7.6 Implement test utility method extraction
    - Identify helper methods used in test classes
    - Identify methods that assist with test data creation
    - Identify methods that assist with assertions
    - Store test utility method information
  - [x] 7.7 Ensure test identification tests pass
    - Run ONLY the 2-8 tests written in 7.1
    - Verify test class identification works correctly
    - Verify test method identification works correctly
    - Verify test setup/factory/utility extraction works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 7.1 pass
- Test classes identified correctly via @isTest annotation
- Test methods identified correctly via @isTest annotation or testMethod keyword
- Test setup methods extracted correctly
- Test data factories extracted correctly
- Test utility methods extracted correctly

### Additional Details Extraction

#### Task Group 8: Additional Apex Details Extraction
**Dependencies:** Task Groups 3, 4

- [x] 8.0 Complete additional details extraction
  - [x] 8.1 Write 2-8 focused tests for additional details extraction
    - Test HTTP callout extraction
    - Test batch class detection
    - Test queueable class detection
    - Test invocable method extraction
    - Limit to critical behaviors only
  - [x] 8.2 Implement HTTP callout extraction
    - Detect methods annotated with @HttpPost, @HttpGet, @HttpPut, @HttpDelete
    - Extract REST API endpoints
    - Extract web service callouts (HttpRequest, HttpResponse)
    - Store HTTP callout information
  - [x] 8.3 Implement batch class detection
    - Detect classes implementing Database.Batchable
    - Extract batch job details
    - Store batch class information
  - [x] 8.4 Implement queueable class detection
    - Detect classes implementing Queueable
    - Extract asynchronous job details
    - Store queueable class information
  - [x] 8.5 Implement schedulable class detection
    - Detect classes implementing Schedulable
    - Extract scheduled job details
    - Store schedulable class information
  - [x] 8.6 Implement invocable method extraction
    - Detect methods annotated with @InvocableMethod
    - Extract Flow integration points
    - Store invocable method information
  - [x] 8.7 Implement Aura-enabled method extraction
    - Detect methods annotated with @AuraEnabled
    - Extract Lightning component integration points
    - Store Aura-enabled method information
  - [x] 8.8 Ensure additional details extraction tests pass
    - Run ONLY the 2-8 tests written in 8.1
    - Verify HTTP callout extraction works correctly
    - Verify batch/queueable/schedulable detection works correctly
    - Verify invocable/Aura-enabled extraction works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 8.1 pass
- HTTP callouts extracted successfully
- Batch classes detected correctly
- Queueable classes detected correctly
- Schedulable classes detected correctly
- Invocable methods extracted correctly
- Aura-enabled methods extracted correctly

### Apex-to-Object Mapping & Dependency Graph

#### Task Group 9: Apex-to-Object Mapping and Dependency Graph
**Dependencies:** Task Groups 3, 4, 5, 6

- [x] 9.0 Complete Apex-to-object mapping and dependency graph
  - [x] 9.1 Write 2-8 focused tests for Apex-to-object mapping
    - Test SOQL-based object mapping
    - Test DML-based object mapping
    - Test parameter/return type-based mapping
    - Test trigger-based object mapping
    - Test dependency graph construction
    - Limit to critical behaviors only
  - [x] 9.2 Implement SOQL-based object mapping
    - Extract object names from SOQL FROM clauses
    - Map classes to objects they query
    - Store SOQL-based relationships
  - [x] 9.3 Implement DML-based object mapping
    - Extract object types from DML operations
    - Map classes to objects they modify
    - Store DML-based relationships
  - [x] 9.4 Implement parameter/return type-based mapping
    - Identify SObject types in method parameters
    - Identify SObject types in method return types
    - Map classes to objects they accept/return
    - Store parameter/return type-based relationships
  - [x] 9.5 Implement trigger-based object mapping
    - Extract object names from trigger declarations
    - Map triggers to objects they operate on
    - Store trigger-based relationships
  - [x] 9.6 Implement Apex-to-object dependency graph data structure
    - Create ApexToObjectDependencyGraph class (similar to ComponentDependencyGraph)
    - Create graph nodes for Apex classes/triggers
    - Create edges for Apex-to-object relationships
    - Store relationship types (SOQL, DML, parameter, return type, trigger)
  - [x] 9.7 Implement bidirectional query support
    - Support queries: which classes use object X
    - Support queries: which objects does class Y use
    - Implement efficient lookup methods
  - [x] 9.8 Implement dependency graph persistence
    - Implement toJSON() method for dependency graph
    - Store graph structure for efficient querying
  - [x] 9.9 Ensure Apex-to-object mapping tests pass
    - Run ONLY the 2-8 tests written in 9.1
    - Verify object mapping works correctly
    - Verify dependency graph construction works correctly
    - Verify bidirectional queries work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 9.1 pass
- Objects mapped from SOQL queries correctly
- Objects mapped from DML operations correctly
- Objects mapped from parameters/return types correctly
- Objects mapped from triggers correctly
- Dependency graph built correctly
- Bidirectional queries work correctly

### Result Storage & CLI Integration

#### Task Group 10: Result Storage and CLI Integration
**Dependencies:** Task Groups 3, 4, 5, 6, 7, 8, 9

- [x] 10.0 Complete result storage and CLI integration
  - [x] 10.1 Write 2-8 focused tests for result storage
    - Test ParsedApexResults structure
    - Test result persistence (toJSON)
    - Test result querying methods
    - Limit to critical behaviors only
  - [x] 10.2 Create ParsedApexResults interface and implementation
    - Create ParsedApexResults interface (similar to ParsedXMLResults, ParsedLWCResults)
    - Create ParsedApexResultsImpl class
    - Store parsed classes in Map<string, ApexClassDefinition>
    - Store parsed triggers in Map<string, ApexTriggerDefinition>
    - Include dependency graph
    - Include parsedAt timestamp
  - [x] 10.3 Implement result storage methods
    - addClass(apexClass: ApexClassDefinition): void
    - addTrigger(trigger: ApexTriggerDefinition): void
    - getClass(className: string): ApexClassDefinition | undefined
    - getTrigger(triggerName: string): ApexTriggerDefinition | undefined
    - getAllClasses(): ApexClassDefinition[]
    - getAllTriggers(): ApexTriggerDefinition[]
    - toJSON(): ParsedApexResultsJSON
  - [x] 10.4 Create result persistence utilities
    - Create saveParsedApexResults function (similar to saveParsedXMLResults, saveParsedLWCResults)
    - Implement JSON file writing with proper formatting
    - Handle directory creation
    - Follow existing persistence patterns
  - [x] 10.5 Create Apex parser integration module
    - Create parseAllApexFiles function (similar to parseAllLWCComponents)
    - Integrate with file scanner to discover .cls and .trigger files
    - Process files in parallel with configurable concurrency
    - Aggregate parsing results
    - Handle errors gracefully
  - [x] 10.6 Integrate with CLI
    - Add parse-apex command to CLI
    - Support path argument (optional with --test-default)
    - Support output directory option (-o, --output)
    - Support dependency graph output option (-d, --dependencies)
    - Support concurrency option (-c, --concurrency)
    - Support --test-default flag
    - Follow existing CLI command patterns
  - [x] 10.7 Ensure result storage and CLI integration tests pass
    - Run ONLY the 2-8 tests written in 10.1
    - Verify result storage works correctly
    - Verify persistence works correctly
    - Verify CLI integration works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 10.1 pass
- ParsedApexResults structure works correctly
- Result persistence works correctly
- CLI command works correctly
- Files saved to correct locations

### Integration Testing & Gap Analysis

#### Task Group 11: Integration Testing & Gap Analysis
**Dependencies:** All previous task groups

- [x] 11.0 Complete integration testing and gap analysis
  - [x] 11.1 Write integration tests for end-to-end Apex parsing
    - Test parsing multiple Apex class files
    - Test parsing multiple Apex trigger files
    - Test parsing mixed files (.cls and .trigger)
    - Test error handling with invalid files
    - Test dependency graph construction
    - Test result persistence
    - Test CLI command execution
  - [x] 11.2 Test cross-referencing with object definitions
    - Test mapping Apex classes to parsed objects
    - Test querying objects used by Apex classes
    - Test querying Apex classes that use specific objects
  - [x] 11.3 Test cross-referencing with LWC component definitions
    - Test mapping Apex classes to LWC components (if applicable)
    - Test integration points (@AuraEnabled methods)
  - [x] 11.4 Run full test suite
    - Run all unit tests for Apex parser
    - Run all integration tests
    - Verify all tests pass
    - Fix any failing tests
  - [x] 11.5 Perform gap analysis
    - Review parsed results against requirements
    - Identify any missing functionality
    - Document any limitations or known issues
    - Create gap analysis report
  - [x] 11.6 Ensure integration tests pass
    - Verify end-to-end parsing works correctly
    - Verify cross-referencing works correctly
    - Verify CLI integration works correctly
    - Verify all acceptance criteria met

**Acceptance Criteria:**
- All integration tests pass
- End-to-end parsing works correctly
- Cross-referencing with objects works correctly
- Cross-referencing with LWC components works correctly
- CLI command works correctly
- Gap analysis completed
- All acceptance criteria from previous task groups met

