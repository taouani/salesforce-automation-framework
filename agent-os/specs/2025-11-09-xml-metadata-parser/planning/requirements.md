# Spec Requirements: XML Metadata Parser

## Initial Description
Implement XML parser for object definitions (objects/*.object-meta.xml). This includes:
- Parse field definitions, types, and properties
- Extract validation rules and their logic
- Parse record type definitions
- Extract object relationships (master-detail, lookup)
- Parse profile and permission set XML files
- Extract permission set groups and muting permissions
- Parse custom permissions

## Requirements Discussion

### First Round Questions

**Q1:** The tech stack mentions `fast-xml-parser` or `xml2js`. Should we use `fast-xml-parser` for performance, or do you prefer `xml2js`? I'm leaning toward `fast-xml-parser` for speed and TypeScript support.

**Answer:** fast-xml-parser

**Q2:** Should parsed XML data be stored: In the existing `MetadataRegistry` (extend it), In a separate XML parsing results structure, or Both (registry for discovery, separate structure for detailed parsing)?

**Answer:** Both

**Q3:** Should we parse all object definition XML files, or start with a subset (e.g., custom objects first, then standard objects)? I'm assuming we parse all discovered object XML files—is that correct?

**Answer:** Please parse all discovered object XML files

**Q4:** For field definitions, should we extract: Basic properties (name, type, label, required), All properties (help text, default value, formula, etc.), or Everything available in the XML?

**Answer:** Everything available in the XML

**Q5:** For validation rules, should we: Extract the full formula/expression as-is, Attempt to parse/formula structure, or Both (raw formula + basic parsing if possible)?

**Answer:** Both

**Q6:** For object relationships (master-detail, lookup), should we: Extract basic relationship info (type, related object, field name), Include cascade behaviors and delete constraints, or Build a relationship graph/map for later use?

**Answer:** Build a relationship graph/map for later use

**Q7:** Should we parse: All profile/permission set XML files discovered, Only those referenced by objects/components we're parsing, or Both, with cross-referencing?

**Answer:** Both, with cross-referencing

**Q8:** Should the parser: Skip invalid/malformed XML files with warnings (like the scanner), Fail fast on the first XML parsing error, or Collect all errors and report at the end?

**Answer:** Skip invalid/malformed XML files with warnings (like the scanner)

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
- Use `fast-xml-parser` library for XML parsing
- Parse all discovered object XML files (objects/*.object-meta.xml)
- Extract all field properties available in XML (name, type, label, required, help text, default value, formula, etc.)
- Extract validation rules with both raw formula and parsed structure (if possible)
- Parse record type definitions from object XML files
- Extract object relationships (master-detail, lookup) and build a relationship graph/map
- Parse all profile XML files discovered
- Parse all permission set XML files discovered
- Parse permission set groups and muting permissions
- Parse custom permissions
- Cross-reference profiles/permission sets with objects/components
- Store parsed data both in existing MetadataRegistry (extended) and separate XML parsing results structure
- Skip invalid/malformed XML files with warnings (consistent with scanner behavior)
- Handle errors gracefully without stopping entire parsing process

### Reusability Opportunities
No existing similar features identified in the codebase.

### Scope Boundaries
**In Scope:**
- XML parsing using fast-xml-parser
- Object definition parsing (all fields, validation rules, record types, relationships)
- Profile and permission set XML parsing
- Permission set groups and muting permissions parsing
- Custom permissions parsing
- Relationship graph/map construction
- Cross-referencing between metadata types
- Extended MetadataRegistry for parsed XML data
- Separate XML parsing results structure
- Error handling with warnings for invalid XML

**Out of Scope:**
- XML validation/schema validation (assume valid Salesforce metadata XML structure)
- Formula/expression evaluation (only parsing, not execution)
- Test generation (that's for later phases)
- UI for viewing parsed data (CLI/JSON output only)

### Technical Considerations
- Use `fast-xml-parser` library (already in tech stack)
- Extend existing MetadataRegistry with parsed XML data
- Create separate TypeScript interfaces for parsed XML structures
- Build relationship graph/map data structure for object relationships
- Implement cross-referencing logic between profiles, permission sets, and objects
- Follow error handling best practices: skip invalid files with warnings
- Use existing logger and error handling utilities from scanner
- Integrate with existing file scanner to process discovered XML files
- Support parallel processing for XML parsing (like file scanner)
- Store parsed data in both registry and separate structure for different use cases

