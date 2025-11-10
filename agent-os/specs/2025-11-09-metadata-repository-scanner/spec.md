# Specification: Metadata Repository Scanner

## Goal
Create a metadata repository scanner that discovers and catalogs all Salesforce metadata types by traversing the Salesforce metadata directory structure, building a comprehensive registry with classification, and generating inventory reports in multiple formats.

## User Stories
- As a test automation engineer, I want to scan a Salesforce metadata repository so that I can understand what metadata types and components exist before generating tests
- As a QA lead, I want to generate an inventory report of all metadata in a Salesforce solution so that I can assess test coverage requirements

## Specific Requirements

**File System Traversal**
- Accept explicit input path to Salesforce metadata directory (e.g., `force-app/main/default/`)
- Use Node.js `fs/promises` and `path` modules for file system operations
- Use `glob` or `fast-glob` library for efficient directory pattern matching
- Traverse Salesforce metadata directory structure recursively
- Process files in parallel with configurable concurrency limit for performance
- Skip invalid or corrupted files with warning logs instead of failing completely
- Support test default path: `/Users/taouani/Projects/Salesforce/cxhhc-sf-core/force-app/main/default/`

**Metadata Discovery**
- Discover standard Salesforce metadata types by examining directory names (objects, classes, lwc, aura, flows, profiles, permissionsets, etc.)
- Detect custom or non-standard metadata types by analyzing directory structure and file patterns
- Identify metadata files by their extensions (.xml, .cls, .trigger, .js, .html, .css, .cmp, etc.)
- Catalog each discovered metadata item with file path, type, and basic properties
- Handle nested metadata structures (e.g., LWC components in folders, Aura component bundles)

**Metadata Type Registry**
- Build in-memory registry using TypeScript interfaces/objects during execution
- Store metadata items with type information, file paths, and classification data
- Persist registry to JSON file for later use and analysis
- Structure registry to support efficient querying by type and purpose
- Include metadata counts and statistics in registry

**Classification System**
- Classify metadata by type: object, class, component (LWC/Aura), flow, profile, permission set, trigger, etc.
- Classify metadata by purpose: data model, UI, business logic, permissions, configuration
- Support multiple classifications per metadata item when applicable
- Store classification data in registry for filtering and reporting

**Inventory Report Generation**
- Generate reports in multiple formats: console/terminal (human-readable), JSON, Markdown
- Allow user to choose output format(s) via configuration or CLI options
- Include summary statistics: total metadata items, counts by type, counts by purpose
- List all discovered metadata items with their classifications
- Format console output for readability with clear sections and hierarchy
- Format JSON output for programmatic consumption
- Format Markdown output for documentation purposes

**Error Handling**
- Implement structured logging using `winston` or `pino` for warnings and errors
- Skip files that cannot be read or processed, log warnings with file path and error details
- Continue processing remaining files after encountering errors
- Collect and report summary of errors/warnings at end of scan
- Follow error handling best practices: graceful degradation, specific error types

**Performance & Architecture**
- Implement parallel file processing with configurable concurrency limit
- Use TypeScript for type safety throughout the scanner
- Structure code in modular design: separate scanner, registry, classifier, and report generator modules
- Follow coding style standards: meaningful names, small focused functions, DRY principle
- Ensure code is maintainable and extensible for future metadata types

## Visual Design
No visual assets provided.

## Existing Code to Leverage
No existing code found in the codebase to reuse. This is a foundational feature that will establish patterns for future metadata processing features.

## Out of Scope
- Metadata validation (checking for required files, validating XML structure, schema validation)
- Detailed parsing of metadata file contents (extracting field definitions, validation rules, etc.)
- Test generation (that functionality is for later phases)
- File watching or change detection (optional future feature)
- Database storage for registry (JSON persistence only)
- Interactive CLI mode (batch processing only)
- Metadata modification or transformation
- Integration with Salesforce orgs (local file system only)

