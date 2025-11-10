# Spec Requirements: Metadata Repository Scanner

## Initial Description
Create metadata repository scanner that discovers and catalogs all metadata types. This includes:
- Implement file system traversal for Salesforce metadata structure
- Build metadata type registry and classification system
- Create metadata inventory report generator

## Requirements Discussion

### First Round Questions

**Q1:** I assume the scanner accepts a path to the Salesforce metadata directory (like `/Users/taouani/Projects/Salesforce/cxhhc-sf-core/force-app/main/default/`). Should it default to this path if not provided, or always require explicit input?

**Answer:** Always require explicit input but for testing you can default to that path

**Q2:** I'm thinking the scanner should discover all standard Salesforce metadata types (objects, classes, LWC, Aura, flows, profiles, etc.) by examining directory names and file extensions. Should it also detect custom or non-standard metadata types, or focus on the standard set first?

**Answer:** It should also include custom or non-standard metadata types

**Q3:** For the metadata type registry, should we store it as: An in-memory data structure (TypeScript objects/interfaces), A JSON file for persistence, or Both (in-memory during execution, JSON for persistence)?

**Answer:** Both (in-memory during execution, JSON for persistence)

**Q4:** For the metadata inventory report generator, should it output: Console/terminal output (human-readable), JSON file, Markdown file, or Multiple formats (user choice)?

**Answer:** Multiple formats (user choice)

**Q5:** I'm assuming the scanner should skip invalid or corrupted metadata files and log warnings, rather than failing completely. Is that correct, or should it fail fast on the first error?

**Answer:** Yes, skip with warning

**Q6:** Should the scanner process files sequentially (one at a time) or in parallel (for better performance on large repositories)? I'm leaning toward parallel processing with a configurable concurrency limit.

**Answer:** In parallel

**Q7:** For the classification system, should it categorize metadata by: Type (object, class, component, etc.), Purpose (data model, UI, business logic, permissions), or Both?

**Answer:** Both

**Q8:** Should this scanner only discover and catalog metadata, or also perform basic validation (e.g., check for required files, validate XML structure)? I'm assuming discovery/cataloging only for now—is that correct?

**Answer:** Yes, that's correct

### Existing Code to Reference

No similar existing features identified for reference.

### Follow-up Questions

No follow-up questions needed.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A

## Requirements Summary

### Functional Requirements
- Accept explicit input path to Salesforce metadata directory (with test default to `/Users/taouani/Projects/Salesforce/cxhhc-sf-core/force-app/main/default/`)
- Discover and catalog all Salesforce metadata types including standard types (objects, classes, LWC, Aura, flows, profiles, permission sets, etc.) and custom/non-standard metadata types
- Implement file system traversal for Salesforce metadata directory structure
- Build metadata type registry system that stores data both in-memory (TypeScript objects/interfaces) during execution and persists to JSON file
- Create classification system that categorizes metadata by both:
  - Type (object, class, component, flow, profile, etc.)
  - Purpose (data model, UI, business logic, permissions)
- Generate metadata inventory reports in multiple output formats (user choice: console/terminal, JSON, Markdown)
- Process files in parallel for better performance on large repositories
- Handle errors gracefully: skip invalid or corrupted metadata files and log warnings rather than failing completely
- Focus on discovery and cataloging only (no validation in this phase)

### Reusability Opportunities
No existing similar features identified in the codebase.

### Scope Boundaries
**In Scope:**
- File system traversal of Salesforce metadata structure
- Discovery and cataloging of all metadata types (standard and custom)
- Metadata type registry (in-memory + JSON persistence)
- Classification system (by type and purpose)
- Inventory report generation (multiple format support)
- Parallel file processing
- Error handling with warnings for invalid files

**Out of Scope:**
- Metadata validation (checking for required files, validating XML structure)
- Metadata parsing (detailed parsing of file contents - that's for later phases)
- Test generation (that's for later phases)

### Technical Considerations
- Use Node.js `fs/promises` and `path` for file system operations
- Use `glob` or `fast-glob` for directory traversal
- Implement parallel processing with configurable concurrency limit
- Use TypeScript for type safety
- Registry should use TypeScript interfaces for in-memory representation
- JSON persistence for registry data
- Support multiple report output formats (console, JSON, Markdown)
- Implement structured logging for warnings and errors
- Follow error handling best practices: skip invalid files with warnings, don't fail completely

