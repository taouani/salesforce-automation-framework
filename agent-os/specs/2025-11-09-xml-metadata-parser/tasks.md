# Task Breakdown: XML Metadata Parser

## Overview
Total Tasks: 7 task groups

## Task List

### Type Definitions & XML Parser Infrastructure

#### Task Group 1: Type Definitions and XML Parser Setup
**Dependencies:** None

- [x] 1.0 Complete type definitions and XML parser infrastructure
  - [x] 1.1 Write 2-8 focused tests for XML parser and type definitions
    - Test XML parsing with fast-xml-parser
    - Test type definitions for parsed structures
    - Test error handling for invalid XML
    - Limit to critical behaviors only
  - [x] 1.2 Install fast-xml-parser dependency
    - Add to package.json dependencies
    - Install package
  - [x] 1.3 Create TypeScript interfaces for parsed XML structures
    - ObjectDefinition interface (label, pluralLabel, description, sharingModel, etc.)
    - FieldDefinition interface (all properties from XML)
    - ValidationRule interface (raw formula and parsed structure)
    - RecordType interface (label, description, active status)
    - Relationship interface (type, relatedObject, cascade behaviors)
  - [x] 1.4 Create TypeScript interfaces for relationship graph
    - RelationshipGraph interface for storing relationship map
    - RelationshipNode interface for graph nodes
    - Support bidirectional traversal
  - [x] 1.5 Create TypeScript interfaces for profile and permission structures
    - ProfileDefinition interface
    - PermissionSetDefinition interface
    - PermissionSetGroup interface
    - CustomPermission interface
  - [x] 1.6 Create XML parsing error types
    - XMLParseError extending ScannerError
    - Follow existing error handling patterns
  - [x] 1.7 Create base XML parser utility module
    - Setup fast-xml-parser configuration
    - Create parseXMLFile function with error handling
    - Integrate with existing logger
  - [x] 1.8 Ensure type definitions and parser infrastructure tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify type definitions compile correctly
    - Verify XML parser handles errors gracefully
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- fast-xml-parser installed and working
- All TypeScript interfaces compile without errors
- XML parser utility handles invalid XML with warnings

### Object Definition Parser

#### Task Group 2: Object XML Parser
**Dependencies:** Task Group 1

- [x] 2.0 Complete object definition parser
  - [x] 2.1 Write 2-8 focused tests for object parser
    - Test parsing object XML files
    - Test field extraction (all properties)
    - Test validation rule extraction (raw and parsed)
    - Test record type extraction
    - Limit to critical behaviors only
  - [x] 2.2 Implement object XML file parser
    - Parse object-meta.xml files
    - Extract object-level properties
    - Handle standard and custom objects
  - [x] 2.3 Implement field definition parser
    - Extract all field properties from XML
    - Handle different field types (text, number, date, picklist, etc.)
    - Extract formulas, default values, help text
  - [x] 2.4 Implement validation rule parser
    - Extract raw formula/expression text
    - Attempt basic parsing of formula structure (if possible)
    - Store both raw and parsed versions
  - [x] 2.5 Implement record type parser
    - Extract record type definitions
    - Parse labels, descriptions, active status
    - Extract picklist value assignments
  - [x] 2.6 Integrate with file scanner
    - Use scanDirectory to find object XML files
    - Process files in parallel with concurrency limit
    - Skip invalid XML files with warnings
  - [x] 2.7 Ensure object parser tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify object parsing extracts all properties
    - Verify error handling works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- Object XML files parsed successfully
- All field properties extracted
- Validation rules extracted with raw and parsed structure
- Record types extracted correctly

### Relationship Graph Builder

#### Task Group 3: Relationship Graph Construction
**Dependencies:** Task Group 2

- [x] 3.0 Complete relationship graph builder
  - [x] 3.1 Write 2-8 focused tests for relationship graph
    - Test relationship extraction from fields
    - Test graph construction
    - Test bidirectional traversal
    - Test relationship properties (cascade, delete constraints)
    - Limit to critical behaviors only
  - [x] 3.2 Implement relationship extraction from object fields
    - Identify master-detail relationships
    - Identify lookup relationships
    - Extract relationship properties
  - [x] 3.3 Implement relationship graph data structure
    - Create graph nodes for objects
    - Create edges for relationships
    - Store relationship properties on edges
  - [x] 3.4 Implement bidirectional traversal support
    - Support parent-to-child queries
    - Support child-to-parent queries
    - Enable efficient relationship lookups
  - [x] 3.5 Add relationship query methods
    - Get relationships for an object
    - Get related objects (by relationship type)
    - Get relationship properties
  - [x] 3.6 Ensure relationship graph tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify graph construction works correctly
    - Verify traversal methods work
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- Relationships extracted from object fields
- Graph structure built correctly
- Bidirectional traversal works
- Relationship properties stored correctly

### Profile & Permission Set Parser

#### Task Group 4: Profile and Permission Set Parsing
**Dependencies:** Task Group 1

- [x] 4.0 Complete profile and permission set parser
  - [x] 4.1 Write 2-8 focused tests for profile/permission parser
    - Test profile XML parsing
    - Test permission set XML parsing
    - Test permission extraction (object, field, class, page)
    - Test permission set groups parsing
    - Limit to critical behaviors only
  - [x] 4.2 Implement profile XML parser
    - Parse profile XML files
    - Extract object permissions
    - Extract field permissions
    - Extract class and page permissions
  - [x] 4.3 Implement permission set XML parser
    - Parse permission set XML files
    - Extract all permission types
    - Extract user permissions and application permissions
  - [x] 4.4 Implement permission set group parser
    - Parse permission set group XML files
    - Extract group assignments
    - Extract muting permissions
  - [x] 4.5 Implement custom permission parser
    - Parse custom permission XML files
    - Extract permission definitions
  - [x] 4.6 Integrate with file scanner
    - Use scanDirectory to find profile/permission XML files
    - Process files in parallel
    - Skip invalid XML files with warnings
  - [x] 4.7 Ensure profile/permission parser tests pass
    - Run ONLY the 2-8 tests written in 4.1
    - Verify profile parsing works correctly
    - Verify permission set parsing works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 4.1 pass
- Profile XML files parsed successfully
- Permission set XML files parsed successfully
- All permission types extracted correctly
- Permission set groups and custom permissions parsed

### Cross-Referencing System

#### Task Group 5: Cross-Referencing Implementation
**Dependencies:** Task Groups 2, 4

- [x] 5.0 Complete cross-referencing system
  - [x] 5.1 Write 2-8 focused tests for cross-referencing
    - Test profile-to-object mapping
    - Test permission-set-to-object mapping
    - Test reverse lookups (object-to-profiles)
    - Test cross-reference queries
    - Limit to critical behaviors only
  - [x] 5.2 Implement profile-to-object cross-referencing
    - Build mapping between profiles and objects they control
    - Build mapping between profiles and fields they control
    - Store cross-reference data
  - [x] 5.3 Implement permission-set-to-object cross-referencing
    - Build mapping between permission sets and objects
    - Build mapping between permission sets and fields
    - Store cross-reference data
  - [x] 5.4 Implement reverse lookup queries
    - Query which profiles affect an object
    - Query which permission sets affect an object
    - Query which profiles/permission sets affect a field
  - [x] 5.5 Add cross-reference query methods
    - Get profiles for object
    - Get permission sets for object
    - Get permissions for field
  - [x] 5.6 Ensure cross-referencing tests pass
    - Run ONLY the 2-8 tests written in 5.1
    - Verify cross-referencing works correctly
    - Verify reverse lookups work
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 5.1 pass
- Cross-referencing between profiles/permission sets and objects works
- Reverse lookups work correctly
- Query methods return correct results

### Data Storage & Registry Extension

#### Task Group 6: Data Storage Architecture
**Dependencies:** Task Groups 2, 3, 4, 5

- [x] 6.0 Complete data storage and registry extension
  - [x] 6.1 Write 2-8 focused tests for data storage
    - Test registry extension with parsed data
    - Test separate XML parsing results structure
    - Test data persistence
    - Test query methods
    - Limit to critical behaviors only
  - [x] 6.2 Extend MetadataRegistry with parsed XML data
    - Add methods to store parsed object definitions
    - Add methods to store parsed profile/permission data
    - Maintain backward compatibility with existing registry
  - [x] 6.3 Create separate XML parsing results structure
    - Create ParsedXMLResults interface
    - Store detailed parsed data separately
    - Support efficient querying of parsed data
  - [x] 6.4 Implement relationship graph storage
    - Store relationship graph in separate structure
    - Support graph persistence (JSON)
    - Enable graph loading and querying
  - [x] 6.5 Add query methods for parsed data
    - Query objects by name
    - Query fields by object
    - Query validation rules by object
    - Query relationships by object
  - [x] 6.6 Implement data persistence
    - Save parsed XML results to JSON file
    - Save relationship graph to JSON file
    - Handle file write errors gracefully
  - [x] 6.7 Ensure data storage tests pass
    - Run ONLY the 2-8 tests written in 6.1
    - Verify registry extension works correctly
    - Verify separate structure works correctly
    - Verify persistence works
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 6.1 pass
- MetadataRegistry extended successfully
- Separate XML parsing results structure works
- Relationship graph stored and queryable
- Data persistence works correctly

### Integration & Testing

#### Task Group 7: Integration Testing & Gap Analysis
**Dependencies:** Task Groups 1-6

- [x] 7.0 Review existing tests and fill critical gaps only
  - [x] 7.1 Review tests from Task Groups 1-6
    - Review the 2-8 tests written by type-definitions (Task 1.1)
    - Review the 2-8 tests written by object-parser (Task 2.1)
    - Review the 2-8 tests written by relationship-graph (Task 3.1)
    - Review the 2-8 tests written by profile-parser (Task 4.1)
    - Review the 2-8 tests written by cross-referencing (Task 5.1)
    - Review the 2-8 tests written by data-storage (Task 6.1)
    - Total existing tests: approximately 12-48 tests
  - [x] 7.2 Analyze test coverage gaps for THIS feature only
    - Identify critical end-to-end workflows that lack test coverage
    - Focus ONLY on gaps related to XML parser requirements
    - Do NOT assess entire application test coverage
    - Prioritize integration tests over unit test gaps
  - [x] 7.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on end-to-end XML parsing workflow
    - Test integration between parser modules
    - Test integration with existing scanner
    - Skip edge cases unless business-critical
  - [x] 7.4 Run feature-specific tests only
    - Run ONLY tests related to this spec's feature (tests from 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, and 7.3)
    - Expected total: approximately 22-58 tests maximum
    - Do NOT run the entire application test suite
    - Verify end-to-end XML parsing workflow passes
  - [x] 7.5 Test with real Salesforce metadata repository
    - Use test default path: `/Users/taouani/Projects/Salesforce/cxhhc-sf-core/force-app/main/default/`
    - Verify object XML files parsed correctly
    - Verify profile/permission XML files parsed correctly
    - Verify relationship graph constructed correctly
    - Verify cross-referencing works correctly

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 22-58 tests total)
- Critical end-to-end workflows for this feature are covered
- No more than 10 additional tests added when filling in testing gaps
- XML parser works correctly with real Salesforce metadata repository
- Testing focused exclusively on this spec's feature requirements

## Execution Order

Recommended implementation sequence:
1. Type Definitions & XML Parser Infrastructure (Task Group 1)
2. Object Definition Parser (Task Group 2)
3. Relationship Graph Builder (Task Group 3)
4. Profile & Permission Set Parser (Task Group 4)
5. Cross-Referencing System (Task Group 5)
6. Data Storage & Registry Extension (Task Group 6)
7. Integration Testing & Gap Analysis (Task Group 7)

