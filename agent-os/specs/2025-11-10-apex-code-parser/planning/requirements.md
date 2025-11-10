# Spec Requirements: Apex Code Parser

## Initial Description
Parse Apex class files (.cls) and Apex trigger files (.trigger) to extract class methods, properties, annotations, SOQL queries, DML operations, and map Apex classes to related Salesforce objects for test generation purposes.

## Requirements Discussion

### First Round Questions

**Q1:** Should we parse Apex class files (.cls) and trigger files (.trigger) together as a unified parser, or create separate parsers for each file type?
**Answer:** Parse Apex class files (.cls) and trigger files (.trigger) together

**Q2:** For Apex class parsing, what level of detail should we extract?
**Answer:** 
- Class-level: name, annotations (@isTest, @RestResource, etc.), access modifiers (public, private, global), superclasses/interfaces
- Method-level: name, parameters, return type, access modifiers, annotations (@Test, @future, @invocable, etc.), exception handling
- Property-level: name, type, access modifiers, static/final modifiers
- Ignore comments/documentation unless judged useful for test generation

**Q3:** For Apex triggers, what should we extract?
**Answer:** Extract everything mentioned:
- Trigger name, object(s) it operates on, trigger events (before insert, after update, etc.)
- Trigger logic and DML operations
- Do NOT extract trigger body content

**Q4:** For test class identification, how should we identify test classes and test methods?
**Answer:** 
- Look for `@isTest` annotation on both classes and methods
- Extract test setup methods, test data factories, and test utility methods if useful for Playwright test script generation and/or will help understand the logic for test script generation

**Q5:** For SOQL query extraction, what details should we capture?
**Answer:** If useful for core functionality, capture all details mentioned:
- Query string (full or parsed structure)
- Object(s) being queried
- Fields selected
- WHERE clause conditions
- ORDER BY, LIMIT, GROUP BY clauses
- Extract dynamic SOQL (string concatenation) or only static queries

**Q6:** For DML operations, which operations should we track?
**Answer:** If useful for core functionality, track all details mentioned:
- insert, update, upsert, delete, undelete
- Extract the objects/records being operated on
- Track bulk operations vs single record operations
- Track database methods (Database.insert, Database.update with allOrNothing)

**Q7:** For mapping Apex classes to Salesforce objects, how should we establish relationships?
**Answer:** Yes to all approaches:
- Parse SOQL queries to identify objects
- Parse DML operations to identify objects
- Parse method parameters/return types that reference SObject types
- Parse trigger definitions to map triggers to objects
- Build a dependency graph similar to the component dependency graph

**Q8:** Should we follow the existing parser patterns (skip invalid files with warnings, use custom error types, continue processing other files even if one fails)?
**Answer:** Yes please

**Q9:** What parsing library should we use for Apex code?
**Answer:** Use an existing Apex parser library. If none exists, use a library with a balance of efficiency and easiness.

**Q10:** Should we extract any additional details that would be useful for generating Playwright test scripts?
**Answer:** Yes please (e.g., HTTP callouts, batch classes, queueable classes, schedulable classes, etc.)

### Existing Code to Reference

**Similar Features Identified:**
- JavaScript/TypeScript Parser (`src/parser/javascript-parser.ts`) - Similar AST-based parsing approach
- XML Parser (`src/parser/xml-parser.ts`) - File reading and error handling patterns
- Component Bundle Parser (`src/parser/component-bundle-parser.ts`) - Bundle parsing pattern

The parser should follow patterns from existing parsers:
- File reading and error handling patterns from `src/parser/xml-parser.ts`
- File traversal patterns from `src/scanner/file-scanner.ts`
- Error handling utilities from `src/utils/errors.ts` and `src/utils/lwc-errors.ts`
- Result storage patterns from `src/parser/xml-results.ts` and `src/parser/lwc-results.ts`
- Type definitions patterns from existing parser modules
- Dependency graph patterns from `src/parser/component-dependency-graph.ts`

### Follow-up Questions

No follow-up questions needed.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A

## Requirements Summary

### Functional Requirements
- Parse Apex class files (.cls) and trigger files (.trigger) together
- Extract comprehensive class-level details:
  - Class name, annotations (@isTest, @RestResource, etc.)
  - Access modifiers (public, private, global)
  - Superclasses and interfaces
- Extract comprehensive method-level details:
  - Method name, parameters, return type
  - Access modifiers
  - Annotations (@Test, @future, @invocable, etc.)
  - Exception handling
- Extract comprehensive property-level details:
  - Property name, type
  - Access modifiers
  - Static/final modifiers
- Extract trigger details:
  - Trigger name, object(s), trigger events
  - Trigger logic and DML operations
  - Do NOT extract trigger body content
- Identify test classes and methods:
  - Look for `@isTest` annotation on classes and methods
  - Extract test setup methods, test data factories, test utility methods if useful
- Extract SOQL query details (if useful for core functionality):
  - Query string, objects, fields, WHERE clause, ORDER BY, LIMIT, GROUP BY
  - Handle both static and dynamic SOQL
- Extract DML operation details (if useful for core functionality):
  - insert, update, upsert, delete, undelete operations
  - Objects/records being operated on
  - Bulk vs single record operations
  - Database methods with options
- Map Apex classes to Salesforce objects:
  - Parse SOQL queries to identify objects
  - Parse DML operations to identify objects
  - Parse method parameters/return types referencing SObject types
  - Parse trigger definitions to map triggers to objects
  - Build dependency graph similar to component dependency graph
- Extract additional details useful for Playwright test generation:
  - HTTP callouts, batch classes, queueable classes, schedulable classes, etc.
- Error handling:
  - Skip invalid/malformed files with warnings (like existing parsers)
  - Use custom error types (ApexParseError extending ScannerError)
  - Continue processing other files even if one fails
- Data storage:
  - In-memory structures during execution (TypeScript interfaces)
  - JSON files for persistence (similar to XML/LWC parser results)
  - Cross-referenced with object definitions for test generation
  - Build Apex-to-object dependency graph

### Reusability Opportunities
- Reuse file reading and error handling patterns from XML parser (`src/parser/xml-parser.ts`)
- Reuse file traversal patterns from scanner (`src/scanner/file-scanner.ts`)
- Reuse error handling utilities (`src/utils/errors.ts`)
- Follow existing type definition patterns from parser modules
- Follow existing result storage patterns (`src/parser/xml-results.ts`, `src/parser/lwc-results.ts`)
- Follow dependency graph patterns (`src/parser/component-dependency-graph.ts`)

### Scope Boundaries
**In Scope:**
- Parsing Apex class files (.cls) and trigger files (.trigger) together
- Extracting class, method, and property-level details
- Extracting trigger metadata (name, objects, events, logic, DML)
- Identifying test classes and methods via @isTest annotation
- Extracting test setup methods, test data factories, test utility methods if useful
- Extracting SOQL query details if useful for core functionality
- Extracting DML operation details if useful for core functionality
- Mapping Apex classes to Salesforce objects
- Building Apex-to-object dependency graph
- Extracting additional details useful for Playwright test generation

**Out of Scope:**
- Extracting trigger body content
- Extracting comments/documentation unless useful for test generation
- Executing or validating Apex code (only parsing and metadata extraction)
- Real-time parsing or file watching (batch processing only)

### Technical Considerations
- Use existing Apex parser library if available, otherwise use a library with balance of efficiency and easiness
- Follow existing XML/JavaScript parser patterns for file reading, error handling, and result storage
- Integrate with existing logger for structured logging
- Use existing error handling patterns (custom error types extending ScannerError)
- Store parsed results in TypeScript interfaces similar to ObjectDefinition, LWCComponentDefinition patterns
- Build dependency graph similar to ComponentDependencyGraph for LWC components
- Cross-reference parsed Apex classes with object definitions for test generation

