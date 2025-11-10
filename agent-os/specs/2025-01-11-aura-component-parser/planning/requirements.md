# Spec Requirements: Aura Component Parser

## Initial Description
Parse Salesforce Aura component bundles (.cmp, .js, .css) to extract component attributes, events, and structure for generating Playwright test scripts that test Aura component interactions.

## Requirements Discussion

### First Round Questions

**Q1:** Aura components are bundles that can include multiple files: `.cmp` (component markup), `*Controller.js`, `*Helper.js`, `*Renderer.js`, `.css`, `.cmp-meta.xml`, `.design`, `.auradoc`, `.svg`, and for applications: `.app` and `.app-meta.xml`. Should we parse all files in an Aura component bundle together as a single component unit, or parse each file type independently and link them later?
**Answer:** Parse all files in an Aura component bundle together as a single component unit

**Q2:** For Aura `.cmp` files, I assume we should extract:
- `<aura:attribute>` declarations (name, type, access, default values)
- `<aura:handler>` event handlers (name, event, action)
- Component implements (flexipage:availableForRecordHome, force:hasRecordId, etc.)
- Component access level (public, global)
- Nested component usage (custom and standard Lightning components)
- Data bindings ({!v.attribute} syntax)
- Conditional rendering (aura:if, aura:iteration)
- Event firing (aura:registerEvent, component.getEvent())
- Should we also extract standard HTML elements, Lightning Design System classes, and any additional details useful for Playwright test generation?
**Answer:** Yes please

**Q3:** For Aura Controller JavaScript files (`*Controller.js`), I assume we should extract:
- Controller action methods (functions that handle events)
- Method parameters (component, event, helper)
- Event parameter extraction (event.getParam())
- Component attribute access (component.get(), component.set())
- Helper method calls
- Should we also extract any additional details useful for Playwright test generation?
**Answer:** Yes please

**Q4:** For Aura Helper JavaScript files (`*Helper.js`), I assume we should extract:
- Helper functions (reusable logic)
- Server-side calls (Apex method calls via $A.enqueueAction)
- Promise handling
- Error handling
- Should we also extract any additional details useful for Playwright test generation?
**Answer:** Yes please

**Q5:** For Aura Renderer JavaScript files (`*Renderer.js`), I assume we should extract:
- Custom render methods (render, rerender, afterRender, unrender)
- DOM manipulation logic
- Should we also extract any additional details useful for Playwright test generation?
**Answer:** Yes please

**Q6:** For Aura `.css` files, I assume we should extract:
- CSS class selectors
- CSS custom properties (CSS variables)
- Media queries
- Keyframe animations
- Styling information that might inform test generation (visibility, display properties, etc.)
- Should we parse CSS similar to how we parse LWC CSS files?
**Answer:** Yes please

**Q7:** For Aura `.cmp-meta.xml` and `.app-meta.xml` files, I assume we should extract:
- API version
- Description
- Should we also extract any additional metadata useful for test generation?
**Answer:** Yes please

**Q8:** For Aura applications (`.app` files), I assume we should extract:
- Application structure
- Component dependencies (aura:dependency)
- Application extends (ltng:outApp, etc.)
- Should we parse applications separately from components, or treat them as a special type of component?
**Answer:** Yes please (treat applications as a special type of component)

**Q9:** I assume we should extract component dependencies (which Aura components depend on other Aura components) and build a dependency graph. Should we also cross-reference Aura components with Salesforce objects (similar to how LWC components are cross-referenced)?
**Answer:** Yes please and add dependency to Apex classes if existing

**Q10:** I assume we should follow the existing parser patterns: skip invalid/malformed files with warnings, use custom error types, continue processing other files even if one fails. Should we also support parallel processing for performance (similar to Flow parser)?
**Answer:** Yes please

**Q11:** For parsing JavaScript files (Controller, Helper, Renderer), should we use the same `@babel/parser` library used for LWC parsing, or is there a better approach for Aura's JavaScript structure?
**Answer:** Please use the same library

**Q12:** Should we extract any additional details from Aura components that would be useful for generating Playwright test scripts? For example:
- Component event definitions (aura:registerEvent)
- Component interface implementations
- Component version information
- Component design attributes (from .design files)
**Answer:** Yes please

### Existing Code to Reference

**Similar Features Identified:**
- LWC Parser (`src/parser/lwc-*`) - Similar component bundle parsing approach
- JavaScript/TypeScript Parser (`src/parser/js-parser.ts`) - JavaScript parsing patterns
- HTML Parser (`src/parser/html-parser.ts`) - HTML/markup parsing patterns
- CSS Parser (`src/parser/css-parser.ts`) - CSS parsing patterns
- XML Parser (`src/parser/xml-parser.ts`) - XML metadata parsing patterns

The parser should follow patterns from existing parsers:
- File reading and error handling patterns from `src/parser/xml-parser.ts`
- File traversal patterns from `src/scanner/file-scanner.ts`
- Error handling utilities from `src/utils/errors.ts`
- Result storage patterns from `src/parser/lwc-results.ts` and `src/parser/xml-results.ts`
- Type definitions patterns from existing parser modules
- Dependency graph building from `src/parser/lwc-dependency-graph.ts`

### Visual Assets

**Files Provided:**
No visual assets provided.

**Visual Insights:**
N/A

## Requirements Summary

### Functional Requirements
- Parse Aura components as bundles (parse all files in a component bundle together as a single component unit)
- Extract comprehensive details from `.cmp` files:
  - `<aura:attribute>` declarations (name, type, access, default values)
  - `<aura:handler>` event handlers (name, event, action)
  - Component implements (flexipage:availableForRecordHome, force:hasRecordId, etc.)
  - Component access level (public, global)
  - Nested component usage (custom and standard Lightning components)
  - Data bindings ({!v.attribute} syntax)
  - Conditional rendering (aura:if, aura:iteration)
  - Event firing (aura:registerEvent, component.getEvent())
  - Standard HTML elements and their attributes
  - Lightning Design System classes
  - Any additional details useful for Playwright test generation
- Extract comprehensive details from Controller JavaScript files (`*Controller.js`):
  - Controller action methods (functions that handle events)
  - Method parameters (component, event, helper)
  - Event parameter extraction (event.getParam())
  - Component attribute access (component.get(), component.set())
  - Helper method calls
  - Any additional details useful for Playwright test generation
- Extract comprehensive details from Helper JavaScript files (`*Helper.js`):
  - Helper functions (reusable logic)
  - Server-side calls (Apex method calls via $A.enqueueAction)
  - Promise handling
  - Error handling
  - Any additional details useful for Playwright test generation
- Extract comprehensive details from Renderer JavaScript files (`*Renderer.js`):
  - Custom render methods (render, rerender, afterRender, unrender)
  - DOM manipulation logic
  - Any additional details useful for Playwright test generation
- Extract comprehensive details from CSS files:
  - CSS class selectors
  - CSS custom properties (CSS variables)
  - Media queries
  - Keyframe animations
  - Styling information that might inform test generation (visibility, display properties, etc.)
- Extract metadata from `.cmp-meta.xml` and `.app-meta.xml` files:
  - API version
  - Description
  - Any additional metadata useful for test generation
- Parse Aura applications (`.app` files) as a special type of component:
  - Application structure
  - Component dependencies (aura:dependency)
  - Application extends (ltng:outApp, etc.)
- Extract component dependencies and build dependency graph:
  - Aura component to Aura component dependencies
  - Aura component to Salesforce object cross-references
  - Aura component to Apex class dependencies
- Extract additional details useful for Playwright test generation:
  - Component event definitions (aura:registerEvent)
  - Component interface implementations
  - Component version information
  - Component design attributes (from .design files)
- Error handling:
  - Skip invalid/malformed files with warnings (like the scanner)
  - Use custom error types (AuraParseError, AuraStructureError, etc.)
  - Continue processing other files even if one fails
  - Support parallel processing for performance (similar to Flow parser)
- Data storage:
  - In-memory structures during execution (TypeScript interfaces)
  - JSON files for persistence (similar to XML parser results)
  - Cross-referenced with object definitions and Apex classes for test generation
  - Build component dependency graph (Aura-to-Aura, Aura-to-Object, Aura-to-Apex)

### Reusability Opportunities
- Reuse file reading and error handling patterns from XML parser (`src/parser/xml-parser.ts`)
- Reuse file traversal patterns from scanner (`src/scanner/file-scanner.ts`)
- Reuse error handling utilities (`src/utils/errors.ts`)
- Reuse JavaScript parsing patterns from LWC parser (`src/parser/js-parser.ts`)
- Reuse HTML/markup parsing patterns from LWC parser (`src/parser/html-parser.ts`)
- Reuse CSS parsing patterns from LWC parser (`src/parser/css-parser.ts`)
- Follow existing type definition patterns from parser modules
- Follow existing result storage patterns (`src/parser/lwc-results.ts` and `src/parser/xml-results.ts`)
- Reuse dependency graph building patterns from LWC parser (`src/parser/lwc-dependency-graph.ts`)

### Scope Boundaries
**In Scope:**
- Parsing Aura components only (not LWC components)
- Parsing all files in Aura component bundles together as a single unit
- Parsing Aura applications as a special type of component
- Extracting all details useful for Playwright test generation
- Building component dependency graph (Aura-to-Aura, Aura-to-Object, Aura-to-Apex)
- Cross-referencing with object definitions and Apex classes
- Parallel processing for performance

**Out of Scope:**
- LWC component parsing (separate feature already implemented)
- Parsing files independently (must parse as bundles)
- Generating test scripts (that's for later phases)

### Technical Considerations
- Use `@babel/parser` with `@babel/traverse` and `@babel/types` for JavaScript parsing (same library as LWC parser)
- Use `cheerio` or `jsdom` for `.cmp` markup parsing (similar to HTML parsing)
- Use `postcss` with `postcss-value-parser` or `css-tree` for CSS parsing (same as LWC parser)
- Use `fast-xml-parser` for `.cmp-meta.xml` and `.app-meta.xml` parsing (same as XML parser)
- Follow existing XML parser patterns for file reading, error handling, and result storage
- Integrate with existing logger for structured logging
- Use existing error handling patterns (custom error types extending ScannerError)
- Store parsed results in TypeScript interfaces similar to LWCComponentDefinition patterns
- Build dependency graph similar to LWC dependency graph
- Cross-reference parsed components with object definitions and Apex classes for test generation
- Support parallel processing with configurable concurrency (similar to Flow parser)

