# Specification: XML Metadata Parser

## Goal
Create an XML parser that extracts detailed metadata from Salesforce XML files including object definitions, fields, validation rules, relationships, profiles, and permission sets, storing parsed data in both the existing registry and a separate structured format for test generation.

## User Stories
- As a test automation engineer, I want to parse Salesforce object XML files so that I can understand field definitions, validation rules, and relationships for generating accurate tests
- As a QA lead, I want to extract permission and profile data from XML so that I can generate tests that validate access control scenarios

## Specific Requirements

**XML Parsing Infrastructure**
- Use `fast-xml-parser` library for parsing Salesforce metadata XML files
- Integrate with existing file scanner to process discovered XML files
- Support parallel processing for XML parsing with configurable concurrency limit
- Skip invalid or malformed XML files with warning logs (consistent with scanner behavior)
- Use existing logger and error handling utilities from scanner module

**Object Definition Parsing**
- Parse all discovered object XML files (objects/*.object-meta.xml)
- Extract all field properties available in XML (name, type, label, required, help text, default value, formula, length, precision, scale, etc.)
- Extract validation rules with both raw formula text and parsed structure (if possible)
- Parse record type definitions including labels, descriptions, and active status
- Extract object-level properties (label, plural label, description, sharing model, etc.)

**Relationship Graph Construction**
- Extract object relationships (master-detail and lookup fields)
- Build a relationship graph/map data structure for object relationships
- Include relationship properties: type, related object, field name, cascade behaviors, delete constraints
- Support bidirectional relationship traversal (parent-to-child and child-to-parent)
- Store relationship graph separately for efficient querying

**Profile and Permission Set Parsing**
- Parse all profile XML files discovered in the repository
- Parse all permission set XML files discovered
- Extract object permissions, field permissions, class permissions, page permissions
- Extract user permissions, application permissions, and tab settings
- Parse permission set groups and their assignments
- Parse muting permissions and their configurations
- Parse custom permissions definitions

**Cross-Referencing System**
- Cross-reference profiles and permission sets with objects and components
- Build mapping between permissions and the metadata they control
- Enable queries to find which profiles/permission sets affect specific objects or fields
- Support reverse lookups (which objects are accessible by a profile)

**Data Storage Architecture**
- Extend existing MetadataRegistry with parsed XML data
- Create separate XML parsing results structure for detailed parsed data
- Store object definitions with full field and validation rule details
- Store relationship graph as separate queryable data structure
- Store profile and permission set data with cross-references
- Maintain both structures for different use cases (discovery vs detailed parsing)

**Type Definitions**
- Create TypeScript interfaces for parsed object structures (ObjectDefinition, FieldDefinition, ValidationRule, etc.)
- Create TypeScript interfaces for relationship graph structures
- Create TypeScript interfaces for profile and permission set structures
- Ensure type safety throughout parsing pipeline

**Error Handling**
- Follow error handling best practices: skip invalid files with warnings
- Collect parsing errors and warnings without stopping entire process
- Log detailed error information including file path and error message
- Report summary of errors/warnings at end of parsing

## Visual Design
No visual assets provided.

## Existing Code to Leverage

**MetadataRegistry class (src/registry/metadata-registry.ts)**
- Extend MetadataRegistry class to store parsed XML data alongside discovery metadata
- Reuse existing addItem, getItemsByType, and statistics methods
- Add new methods for storing parsed XML structures

**Type definitions (src/types/metadata.ts)**
- Extend existing MetadataType and MetadataPurpose types
- Reuse MetadataItem interface structure as base for parsed data
- Follow existing type definition patterns for consistency

**Error handling utilities (src/utils/errors.ts)**
- Reuse existing error types (ScannerError, FileReadError)
- Create new XML-specific error types following same pattern
- Use ErrorCollection for aggregating parsing errors

**File scanner (src/scanner/file-scanner.ts)**
- Integrate with scanDirectory function to get list of XML files
- Use processFilesInParallel for parallel XML parsing
- Reuse file path extraction utilities

**Logger utilities (src/utils/logger.ts)**
- Use existing logger instance for structured logging
- Follow existing log level patterns (info, warn, error)
- Maintain consistent logging format across parsing operations

## Out of Scope
- XML validation or schema validation (assume valid Salesforce metadata XML structure)
- Formula/expression evaluation (only parsing, not execution or validation)
- Test generation (that functionality is for later phases)
- UI for viewing parsed data (CLI/JSON output only, no interactive interface)
- Real-time parsing or file watching (batch processing only)
- XML transformation or modification (read-only parsing)
- Integration with Salesforce orgs (local file system only)
- Performance optimization beyond parallel processing (no caching or incremental parsing)

