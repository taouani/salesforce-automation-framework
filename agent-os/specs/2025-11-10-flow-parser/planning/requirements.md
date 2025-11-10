# Spec Requirements: Flow Parser

## Initial Description
Parse Salesforce Flow definition files (.flow-meta.xml) to extract flow elements, inputs/outputs, decision paths, and entry points for generating Playwright test scripts that test Flow execution.

## Requirements Discussion

### First Round Questions

**Q1:** What types of Salesforce Flows should we parse?
**Answer:** All types of flows (Screen Flows, Autolaunched Flows, Record-Triggered Flows, Scheduled Flows, Platform Event-Triggered Flows)

**Q2:** What level of detail should we extract from flow elements?
**Answer:** All of the above:
- Element types (screens, decisions, assignments, loops, etc.)
- Element properties (labels, API names, field references)
- Element formulas and expressions
- Element conditions and criteria

**Q3:** How should we handle flow inputs and outputs?
**Answer:** All of the above:
- Extract input variables (types, required, default values)
- Extract output variables (types, assignments)
- Map inputs to screen fields
- Map outputs to flow results

**Q4:** How should we identify and extract decision paths?
**Answer:** All of the above:
- Extract decision outcomes (true/false paths)
- Extract decision criteria and formulas
- Map decision paths to subsequent elements
- Build decision tree/graph structure

**Q5:** How should we handle flow entry points?
**Answer:** All of the above:
- Identify flow start elements
- Identify flow triggers (record-triggered, scheduled, etc.)
- Extract trigger conditions
- Map entry points to flow paths

**Q6:** Should we extract flow formulas and expressions?
**Answer:** All of the above:
- Formula fields and calculations
- Assignment expressions
- Decision criteria formulas
- Screen field default values

**Q7:** How should we handle subflows?
**Answer:** All of the above:
- Parse subflow references
- Extract subflow inputs/outputs
- Build flow dependency graph
- Recursively parse nested subflows

**Q8:** Should we map flows to Salesforce objects they interact with?
**Answer:** All of the above:
- Extract object references from flow elements
- Map flows to objects they create/update/delete
- Map flows to objects they query
- Build flow-to-object dependency graph

**Q9:** How should we handle flow error handling?
**Answer:** All of the above:
- Extract fault paths
- Extract error messages
- Map error handling flows
- Extract retry logic

**Q10:** What parsing library should we use for Flow XML files?
**Answer:** Use existing fast-xml-parser (already used for other XML parsing). If it is not suitable, propose another library.

**Q11:** Should we extract any additional details useful for Playwright test generation?
**Answer:** Yes, please add all four bullet points:
- Screen field types and validation rules
- Screen navigation paths
- Flow variables and their usage
- Apex actions and invocable methods called from flows

### Visual Assets

No visual assets provided.

## Requirements Summary

### Functional Requirements
- Parse all types of Salesforce Flows (Screen, Autolaunched, Record-Triggered, Scheduled, Platform Event-Triggered)
- Extract comprehensive flow element details:
  - Element types (screens, decisions, assignments, loops, etc.)
  - Element properties (labels, API names, field references)
  - Element formulas and expressions
  - Element conditions and criteria
- Extract flow inputs and outputs:
  - Input variables (types, required, default values)
  - Output variables (types, assignments)
  - Map inputs to screen fields
  - Map outputs to flow results
- Extract decision paths:
  - Decision outcomes (true/false paths)
  - Decision criteria and formulas
  - Map decision paths to subsequent elements
  - Build decision tree/graph structure
- Extract flow entry points:
  - Flow start elements
  - Flow triggers (record-triggered, scheduled, etc.)
  - Trigger conditions
  - Map entry points to flow paths
- Extract flow formulas and expressions:
  - Formula fields and calculations
  - Assignment expressions
  - Decision criteria formulas
  - Screen field default values
- Handle subflows:
  - Parse subflow references
  - Extract subflow inputs/outputs
  - Build flow dependency graph
  - Recursively parse nested subflows
- Map flows to Salesforce objects:
  - Extract object references from flow elements
  - Map flows to objects they create/update/delete
  - Map flows to objects they query
  - Build flow-to-object dependency graph
- Extract flow error handling:
  - Fault paths
  - Error messages
  - Map error handling flows
  - Extract retry logic
- Extract additional details for Playwright test generation:
  - Screen field types and validation rules
  - Screen navigation paths
  - Flow variables and their usage
  - Apex actions and invocable methods called from flows

### Technical Considerations
- Use existing fast-xml-parser library (already used for other XML parsing)
- If fast-xml-parser is not suitable, evaluate and propose alternative XML parser
- Follow existing XML parser patterns for file reading, error handling, and result storage
- Integrate with existing logger for structured logging
- Use existing error handling patterns (custom error types extending ScannerError)
- Store parsed results in TypeScript interfaces similar to existing parser patterns
- Build dependency graphs similar to existing dependency graph implementations
- Cross-reference parsed flows with object definitions and Apex classes for test generation

### Reusability Opportunities
- Reuse file reading and error handling patterns from XML parser (`src/parser/xml-parser.ts`)
- Reuse file traversal patterns from scanner (`src/scanner/file-scanner.ts`)
- Reuse error handling utilities (`src/utils/errors.ts`)
- Follow existing type definition patterns from parser modules
- Follow existing result storage patterns (`src/parser/xml-results.ts`, `src/parser/lwc-results.ts`, `src/parser/apex-results.ts`)
- Follow dependency graph patterns (`src/parser/component-dependency-graph.ts`, `src/parser/apex-dependency-graph.ts`)

### Scope Boundaries
**In Scope:**
- Parsing all types of Salesforce Flow definition files (.flow-meta.xml)
- Extracting comprehensive flow element details
- Extracting flow inputs, outputs, decision paths, and entry points
- Extracting flow formulas, expressions, and error handling
- Handling subflows and building flow dependency graphs
- Mapping flows to Salesforce objects
- Extracting additional details for Playwright test generation

**Out of Scope:**
- Executing or validating flows (only parsing and metadata extraction)
- Generating test scripts (that functionality is for later phases)
- Real-time parsing or file watching (batch processing only)
- Integration with Salesforce orgs (local file system only)
- Performance optimization beyond parallel processing (no caching or incremental parsing)
