# Spec Requirements: JavaScript/TypeScript Parser

## Initial Description
Parse Lightning Web Component JavaScript files (.js), extract component properties and methods, parse HTML templates (.html) from LWC components, parse CSS files (.css) for styling information, and extract component metadata and dependencies.

## Requirements Discussion

### First Round Questions

**Q1:** I assume we should parse LWC components as bundles (.js, .html, .css files in the same directory). Should we parse all three files together as a single component unit, or parse each file type independently and link them later?
**Answer:** Parse all three together

**Q2:** For LWC .js files, I assume we should extract @api properties, @track properties, public methods, event handlers, lifecycle hooks, wire service usage, and import statements. Is this the right scope, or should we extract more/less?
**Answer:** Please extract any additional details that will be useful for the generation of the automated playwright scripts

**Q3:** For LWC .html templates, I assume we should extract Lightning component usage, custom LWC component references, data bindings, event handlers, conditional rendering, and iteration. Should we also extract standard HTML elements and their attributes?
**Answer:** Yes please, extract any additional details that will be useful for the generation of the automated playwright scripts

**Q4:** For LWC .css files, I assume we should extract CSS custom properties, class selectors, media queries, and keyframe animations. Should we also parse CSS for styling information that might inform test generation (e.g., visibility, display properties)?
**Answer:** yes please

**Q5:** I assume we should extract component metadata like component name, API version, target configuration, and exposed properties/methods. Is this correct, or should we extract additional metadata?
**Answer:** It is correct

**Q6:** I assume we should follow the existing XML parser pattern: skip invalid/malformed files with warnings, use custom error types, continue processing other files even if one fails. Is this the right approach?
**Answer:** Yes

**Q7:** I assume parsed component data should be stored in in-memory structures during execution, JSON files for persistence, cross-referenced with object definitions, and build a component dependency graph. Should we also build a component dependency graph?
**Answer:** Yes please

**Q8:** Should this parser handle only LWC components, or also Aura components? Only .js files in lwc/ directories, or also standalone JavaScript files? TypeScript files (.ts) if present, or only JavaScript (.js)?
**Answer:** Only LWC components (there is a different feature for Aura components that will be implemented later). Only .js files in lwc/ directories. only JavaScript (.js)

### Existing Code to Reference

**Similar Features Identified:**
No similar existing features identified for reference.

The parser should follow patterns from existing XML parser:
- File reading and error handling patterns from `src/parser/xml-parser.ts`
- File traversal patterns from `src/scanner/file-scanner.ts`
- Error handling utilities from `src/utils/errors.ts` and `src/utils/xml-errors.ts`
- Result storage patterns from `src/parser/xml-results.ts`
- Type definitions patterns from existing parser modules

### Follow-up Questions

No follow-up questions needed.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A

## Requirements Summary

### Functional Requirements
- Parse LWC components as bundles (parse .js, .html, and .css files together as a single component unit)
- Extract comprehensive details from JavaScript files:
  - @api properties (public properties)
  - @track properties (reactive properties)
  - Public methods (decorated with @api or exposed)
  - Event handlers and lifecycle hooks (connectedCallback, renderedCallback, etc.)
  - Wire service usage (@wire decorators)
  - Import statements and dependencies
  - Any additional details useful for Playwright test generation
- Extract comprehensive details from HTML templates:
  - Lightning component usage (<lightning-*> elements)
  - Custom LWC component references
  - Data bindings ({property} syntax)
  - Event handlers (onclick, onchange, etc.)
  - Conditional rendering (if:true, if:false)
  - Iteration (for:each, for:item)
  - Standard HTML elements and their attributes
  - Any additional details useful for Playwright test generation
- Extract comprehensive details from CSS files:
  - CSS custom properties (CSS variables)
  - Class selectors and their properties
  - Media queries
  - Keyframe animations
  - Styling information that might inform test generation (visibility, display properties, etc.)
- Extract component metadata:
  - Component name (from folder structure)
  - API version
  - Target configuration (lightning__AppPage, lightning__RecordPage, etc.)
  - Exposed properties and methods for test generation
- Error handling:
  - Skip invalid/malformed files with warnings (like the scanner)
  - Use custom error types (JavaScriptParseError, HTMLParseError, CSSParseError)
  - Continue processing other files even if one fails
- Data storage:
  - In-memory structures during execution (TypeScript interfaces)
  - JSON files for persistence (similar to XML parser results)
  - Cross-referenced with object definitions for test generation
  - Build a component dependency graph

### Reusability Opportunities
- Reuse file reading and error handling patterns from XML parser (`src/parser/xml-parser.ts`)
- Reuse file traversal patterns from scanner (`src/scanner/file-scanner.ts`)
- Reuse error handling utilities (`src/utils/errors.ts`)
- Follow existing type definition patterns from parser modules
- Follow existing result storage patterns (`src/parser/xml-results.ts`)

### Scope Boundaries
**In Scope:**
- Parsing LWC components only (not Aura components)
- Parsing .js files in lwc/ directories only (not standalone JavaScript files)
- Parsing JavaScript (.js) files only (not TypeScript .ts files)
- Parsing component bundles (.js, .html, .css together)
- Extracting all details useful for Playwright test generation
- Building component dependency graph
- Cross-referencing with object definitions

**Out of Scope:**
- Aura component parsing (separate feature to be implemented later)
- Standalone JavaScript files outside lwc/ directories
- TypeScript (.ts) file parsing
- Parsing files independently (must parse as bundles)
- Generating test scripts (that's for later phases)

### Technical Considerations
- Use `@babel/parser` with `@babel/traverse` and `@babel/types` for JavaScript parsing (as specified in tech-stack.md)
- Use `cheerio` or `jsdom` for HTML template parsing (as specified in tech-stack.md)
- Use `postcss` with `postcss-value-parser` or `css-tree` for CSS parsing (as specified in tech-stack.md)
- Follow existing XML parser patterns for file reading, error handling, and result storage
- Integrate with existing logger for structured logging
- Use existing error handling patterns (custom error types extending ScannerError)
- Store parsed results in TypeScript interfaces similar to ObjectDefinition, ProfileDefinition patterns
- Build dependency graph similar to RelationshipGraph for objects
- Cross-reference parsed components with object definitions for test generation

