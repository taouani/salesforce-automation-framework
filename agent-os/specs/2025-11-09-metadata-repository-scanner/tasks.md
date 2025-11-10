# Task Breakdown: Metadata Repository Scanner

## Overview
Total Tasks: 8 task groups

## Task List

### Project Setup & Configuration

#### Task Group 1: Project Initialization
**Dependencies:** None

- [x] 1.0 Complete project setup
  - [x] 1.1 Initialize TypeScript project with tsconfig.json
    - Configure for Node.js v18+
    - Enable strict mode
    - Set up module resolution
  - [x] 1.2 Install core dependencies
    - `fast-glob` or `glob` for file system traversal
    - `winston` or `pino` for structured logging
    - TypeScript and type definitions
  - [x] 1.3 Set up project structure
    - Create `src/` directory for source code
    - Create modular folders: `scanner/`, `registry/`, `classifier/`, `reporter/`, `types/`
    - Create `tests/` directory for test files
  - [x] 1.4 Configure build and development tools
    - Set up `tsx` or `ts-node` for development
    - Configure `tsc` for production builds
    - Add npm scripts for build, test, and run

**Acceptance Criteria:**
- TypeScript project compiles successfully
- Dependencies installed and working
- Project structure follows modular design
- Build scripts execute correctly

### Core Infrastructure

#### Task Group 2: Type Definitions & Error Handling
**Dependencies:** Task Group 1

- [x] 2.0 Complete core infrastructure
  - [x] 2.1 Write 2-8 focused tests for core types and error handling
    - Test TypeScript interfaces for metadata items
    - Test error handling for invalid file paths
    - Test logging functionality
    - Limit to critical behaviors only
  - [x] 2.2 Create TypeScript interfaces for metadata structures
    - `MetadataItem` interface with type, path, classifications
    - `MetadataRegistry` interface for in-memory storage
    - `Classification` interface for type and purpose
    - `ScanResult` interface for scan statistics
  - [x] 2.3 Implement error handling utilities
    - Custom error types for scanner errors
    - Error collection and reporting mechanism
    - Follow error handling best practices: graceful degradation, specific error types
  - [x] 2.4 Set up structured logging system
    - Configure `winston` or `pino` logger
    - Create log levels for info, warning, error
    - Implement log formatting for console output
  - [x] 2.5 Ensure core infrastructure tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify type definitions compile correctly
    - Verify error handling works as expected
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- TypeScript interfaces compile without errors
- Error handling gracefully handles invalid inputs
- Logging system outputs structured logs

### File System Traversal

#### Task Group 3: Directory Scanner Module
**Dependencies:** Task Group 2

- [x] 3.0 Complete file system traversal module
  - [x] 3.1 Write 2-8 focused tests for file system traversal
    - Test directory path validation
    - Test recursive directory traversal
    - Test file discovery with glob patterns
    - Test parallel processing with concurrency limit
    - Limit to critical behaviors only
  - [x] 3.2 Implement path input validation
    - Accept explicit input path parameter
    - Validate path exists and is accessible
    - Support test default path for development
  - [x] 3.3 Create directory traversal function
    - Use `fast-glob` or `glob` for pattern matching
    - Traverse Salesforce metadata structure recursively
    - Handle nested structures (LWC folders, Aura bundles)
  - [x] 3.4 Implement parallel file processing
    - Process files in parallel with configurable concurrency limit
    - Use Promise.all or similar for parallel execution
    - Handle errors without stopping entire scan
  - [x] 3.5 Add file filtering and discovery
    - Filter by Salesforce metadata file extensions (.xml, .cls, .trigger, .js, .html, .css, .cmp)
    - Identify metadata types by directory names
    - Skip non-metadata files
  - [x] 3.6 Ensure file system traversal tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify directory traversal works correctly
    - Verify parallel processing handles errors gracefully
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- Directory traversal discovers all metadata files
- Parallel processing improves performance
- Invalid files are skipped with warnings

### Metadata Classification

#### Task Group 4: Classification System
**Dependencies:** Task Group 3

- [x] 4.0 Complete classification system
  - [x] 4.1 Write 2-8 focused tests for classification
    - Test type classification (object, class, component, etc.)
    - Test purpose classification (data model, UI, business logic, permissions)
    - Test multiple classifications per item
    - Limit to critical behaviors only
  - [x] 4.2 Implement type classifier
    - Classify by directory name (objects, classes, lwc, aura, flows, profiles, etc.)
    - Classify by file extension (.cls = class, .trigger = trigger, etc.)
    - Detect custom/non-standard metadata types
  - [x] 4.3 Implement purpose classifier
    - Map types to purposes (data model, UI, business logic, permissions, configuration)
    - Support multiple purposes per metadata item
    - Handle edge cases for ambiguous classifications
  - [x] 4.4 Create classification mapping logic
    - Define mapping rules for standard Salesforce metadata types
    - Create extensible system for custom metadata types
    - Store classification data with metadata items
  - [x] 4.5 Ensure classification tests pass
    - Run ONLY the 2-8 tests written in 4.1
    - Verify correct classification by type and purpose
    - Verify custom metadata types are detected
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 4.1 pass
- Metadata items are correctly classified by type
- Metadata items are correctly classified by purpose
- Custom metadata types are detected and classified

### Registry System

#### Task Group 5: Metadata Registry Module
**Dependencies:** Task Group 4

- [x] 5.0 Complete registry system
  - [x] 5.1 Write 2-8 focused tests for registry
    - Test in-memory registry storage
    - Test JSON persistence
    - Test registry querying by type and purpose
    - Test statistics calculation
    - Limit to critical behaviors only
  - [x] 5.2 Implement in-memory registry
    - Store metadata items with TypeScript interfaces
    - Support efficient querying by type and purpose
    - Calculate counts and statistics
  - [x] 5.3 Implement JSON persistence
    - Serialize registry to JSON format
    - Save to file with configurable output path
    - Handle file write errors gracefully
  - [x] 5.4 Add registry query methods
    - Query by metadata type
    - Query by purpose
    - Get statistics (total count, counts by type, counts by purpose)
  - [x] 5.5 Ensure registry tests pass
    - Run ONLY the 2-8 tests written in 5.1
    - Verify in-memory registry stores items correctly
    - Verify JSON persistence saves and loads correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 5.1 pass
- Registry stores metadata items correctly
- JSON persistence works correctly
- Query methods return correct results

### Report Generation

#### Task Group 6: Report Generator Module
**Dependencies:** Task Group 5

- [x] 6.0 Complete report generation module
  - [x] 6.1 Write 2-8 focused tests for report generation
    - Test console output formatting
    - Test JSON report generation
    - Test Markdown report generation
    - Test report statistics inclusion
    - Limit to critical behaviors only
  - [x] 6.2 Implement console report generator
    - Format output for human readability
    - Include clear sections and hierarchy
    - Display summary statistics
    - List metadata items with classifications
  - [x] 6.3 Implement JSON report generator
    - Generate structured JSON output
    - Include all registry data
    - Format for programmatic consumption
  - [x] 6.4 Implement Markdown report generator
    - Format as Markdown document
    - Include headers, lists, and tables
    - Suitable for documentation purposes
  - [x] 6.5 Add report format selection
    - Allow user to choose output format(s)
    - Support multiple formats in single run
    - Configure via options or parameters
  - [x] 6.6 Ensure report generation tests pass
    - Run ONLY the 2-8 tests written in 6.1
    - Verify all three formats generate correctly
    - Verify statistics are included in reports
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 6.1 pass
- Console output is readable and well-formatted
- JSON output is valid and structured
- Markdown output is properly formatted
- User can select output format(s)

### CLI Interface

#### Task Group 7: Command-Line Interface
**Dependencies:** Task Group 6

- [x] 7.0 Complete CLI interface
  - [x] 7.1 Write 2-8 focused tests for CLI
    - Test CLI argument parsing
    - Test path input handling
    - Test output format selection
    - Test error handling in CLI
    - Limit to critical behaviors only
  - [x] 7.2 Set up CLI framework
    - Install and configure `commander` or `yargs`
    - Define CLI command structure
    - Add help text and usage documentation
  - [x] 7.3 Implement CLI arguments
    - Accept metadata directory path as required argument
    - Add option for output format selection (console, JSON, Markdown)
    - Add option for output file path (for JSON/Markdown)
    - Add option for concurrency limit
  - [x] 7.4 Integrate scanner with CLI
    - Connect CLI arguments to scanner module
    - Handle scan execution and error reporting
    - Display progress and results
  - [x] 7.5 Add progress reporting (optional)
    - Use `ora` or `cli-progress` for progress indication
    - Show scan progress during execution
    - Display summary at completion
  - [x] 7.6 Ensure CLI tests pass
    - Run ONLY the 2-8 tests written in 7.1
    - Verify CLI accepts arguments correctly
    - Verify scanner integration works
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 7.1 pass
- CLI accepts required arguments
- Scanner executes via CLI successfully
- Output formats work correctly from CLI

### Integration & Testing

#### Task Group 8: Integration Testing & Gap Analysis
**Dependencies:** Task Groups 1-7

- [x] 8.0 Review existing tests and fill critical gaps only
  - [x] 8.1 Review tests from Task Groups 2-7
    - Review the 2-8 tests written by core-infrastructure (Task 2.1)
    - Review the 2-8 tests written by file-system-traversal (Task 3.1)
    - Review the 2-8 tests written by classification (Task 4.1)
    - Review the 2-8 tests written by registry (Task 5.1)
    - Review the 2-8 tests written by report-generation (Task 6.1)
    - Review the 2-8 tests written by CLI (Task 7.1)
    - Total existing tests: approximately 12-48 tests
  - [x] 8.2 Analyze test coverage gaps for THIS feature only
    - Identify critical end-to-end workflows that lack test coverage
    - Focus ONLY on gaps related to metadata scanner requirements
    - Do NOT assess entire application test coverage
    - Prioritize integration tests over unit test gaps
  - [x] 8.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on end-to-end scan workflow
    - Test integration between modules
    - Skip edge cases unless business-critical
  - [x] 8.4 Run feature-specific tests only
    - Run ONLY tests related to this spec's feature (tests from 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, and 8.3)
    - Expected total: approximately 22-58 tests maximum
    - Do NOT run the entire application test suite
    - Verify end-to-end scanner workflow passes
  - [x] 8.5 Test with real Salesforce metadata repository
    - Use test default path: `/Users/taouani/Projects/Salesforce/cxhhc-sf-core/force-app/main/default/`
    - Verify scanner discovers all metadata types
    - Verify reports generate correctly
    - Verify JSON persistence works

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 22-58 tests total)
- Critical end-to-end workflows for this feature are covered
- No more than 10 additional tests added when filling in testing gaps
- Scanner works correctly with real Salesforce metadata repository
- Testing focused exclusively on this spec's feature requirements

## Execution Order

Recommended implementation sequence:
1. Project Setup & Configuration (Task Group 1)
2. Core Infrastructure (Task Group 2)
3. File System Traversal (Task Group 3)
4. Metadata Classification (Task Group 4)
5. Registry System (Task Group 5)
6. Report Generation (Task Group 6)
7. CLI Interface (Task Group 7)
8. Integration Testing & Gap Analysis (Task Group 8)

