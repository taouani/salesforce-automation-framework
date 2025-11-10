# Spec Requirements: Flow Parser

## Initial Description
Parse Salesforce Flow definition files (.flow-meta.xml) to extract flow elements, inputs/outputs, decision paths, and entry points for generating Playwright test scripts that test Flow execution.

## Requirements Discussion

### First Round Questions

**Q1:** What types of Salesforce Flows should we parse?
- Screen Flows (user-interactive flows)
- Autolaunched Flows (background flows)
- Record-Triggered Flows (before save, after save, etc.)
- Scheduled Flows
- Platform Event-Triggered Flows
- All of the above?

**Q2:** What level of detail should we extract from flow elements?
- Element types (screens, decisions, assignments, loops, etc.)
- Element properties (labels, API names, field references)
- Element formulas and expressions
- Element conditions and criteria
- All of the above?

**Q3:** How should we handle flow inputs and outputs?
- Extract input variables (types, required, default values)
- Extract output variables (types, assignments)
- Map inputs to screen fields
- Map outputs to flow results
- All of the above?

**Q4:** How should we identify and extract decision paths?
- Extract decision outcomes (true/false paths)
- Extract decision criteria and formulas
- Map decision paths to subsequent elements
- Build decision tree/graph structure
- All of the above?

**Q5:** How should we handle flow entry points?
- Identify flow start elements
- Identify flow triggers (record-triggered, scheduled, etc.)
- Extract trigger conditions
- Map entry points to flow paths
- All of the above?

**Q6:** Should we extract flow formulas and expressions?
- Formula fields and calculations
- Assignment expressions
- Decision criteria formulas
- Screen field default values
- All of the above?

**Q7:** How should we handle subflows?
- Parse subflow references
- Extract subflow inputs/outputs
- Build flow dependency graph
- Recursively parse nested subflows
- All of the above?

**Q8:** Should we map flows to Salesforce objects they interact with?
- Extract object references from flow elements
- Map flows to objects they create/update/delete
- Map flows to objects they query
- Build flow-to-object dependency graph
- All of the above?

**Q9:** How should we handle flow error handling?
- Extract fault paths
- Extract error messages
- Map error handling flows
- Extract retry logic
- All of the above?

**Q10:** What parsing library should we use for Flow XML files?
- Use existing fast-xml-parser (already used for other XML parsing)
- Use a different XML parser
- Custom parsing approach

**Q11:** Should we extract any additional details useful for Playwright test generation?
- Screen field types and validation rules
- Screen navigation paths
- Flow variables and their usage
- Apex actions and invocable methods called from flows
- Any other details?

### Visual Assets

Please provide any visual assets that would help clarify the Flow Parser requirements:
- Sample Flow XML files (.flow-meta.xml)
- Flow diagrams or documentation
- Examples of flows you want to test
- Any other relevant visual materials

If you don't have visual assets, that's fine - we can proceed with the questions above.

