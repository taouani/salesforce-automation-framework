# Product Roadmap

This roadmap outlines the phased development plan for the Salesforce Test Automation Framework. Features are ordered to deliver value incrementally while building foundational capabilities.

## Phase 1: Foundation & Core Parsing

### Metadata Repository Scanner
- [x] Create metadata repository scanner that discovers and catalogs all metadata types
- [x] Implement file system traversal for Salesforce metadata structure
- [x] Build metadata type registry and classification system
- [x] Create metadata inventory report generator

### XML Metadata Parser
- [x] Implement XML parser for object definitions (objects/*.object-meta.xml)
- [x] Parse field definitions, types, and properties
- [x] Extract validation rules and their logic
- [x] Parse record type definitions
- [x] Extract object relationships (master-detail, lookup)
- [x] Parse profile and permission set XML files
- [x] Extract permission set groups and muting permissions
- [x] Parse custom permissions

### Basic Test Structure Generator
- [x] Create folder structure generator (pages/, tests/, config/, utils/, models/, fixtures/)
- [x] Generate base Playwright configuration files
- [x] Create TypeScript project setup with dependencies
- [x] Generate base utility functions and helpers

## Phase 2: Code Parsing & Analysis

### JavaScript/TypeScript Parser
- [x] Parse Lightning Web Component JavaScript files (.js)
- [x] Extract component properties and methods
- [x] Parse HTML templates (.html) from LWC components
- [x] Parse CSS files (.css) for styling information
- [x] Extract component metadata and dependencies

### Apex Code Parser
- [x] Parse Apex class files (.cls)
- [x] Extract class methods, properties, and annotations
- [x] Parse Apex trigger files (.trigger)
- [x] Identify test classes and test methods
- [x] Extract SOQL queries and DML operations
- [x] Map Apex classes to related objects

### Flow Parser
- [x] Parse Flow definition files (.flow-meta.xml)
- [x] Extract flow elements (screens, decisions, assignments)
- [x] Map flow inputs and outputs
- [x] Identify flow entry points and decision paths
- [x] Extract flow triggers and entry points
- [x] Extract flow formulas and expressions
- [x] Handle subflows and build dependency graph
- [x] Map flows to Salesforce objects
- [x] Extract flow error handling
- [x] Extract screen details for Playwright test generation

### Aura Component Parser
- [x] Parse Aura component bundles (.cmp, .js, .css)
- [x] Extract component attributes and events
- [x] Parse Aura application definitions
- [x] Parse Controller, Helper, and Renderer JavaScript files
- [x] Extract Apex dependencies from Aura components
- [x] Build dependency graphs (Aura-to-Aura, Aura-to-Apex, Aura-to-Object)
- [x] Parse Aura application (.app) files
- [x] CLI integration with `parse-aura` command
- [x] Integration testing with real Salesforce components (57 components, 17 applications)

## Phase 3: Test Generation Engine

### Page Object Model Generator
- [x] Generate Page Object classes for Salesforce objects
- [x] Create page objects for Lightning pages and record pages
- [x] Generate page objects for custom LWC components
- [x] Create page objects for Aura components
- [x] Implement element locator generation strategies
- [x] Generate page objects for Flow screens
- [x] Implement base page object classes (BaseObjectPage, BaseLightningPage, BaseComponentPage, BaseFlowScreen)
- [x] Generate field interaction, validation, and assertion methods
- [x] Generate TypeScript type definitions and interfaces
- [x] Implement factory and builder patterns
- [x] Generate unit tests for page objects
- [x] Generate API documentation
- [x] CLI integration with `generate-page-objects` command
- [x] Integration testing with real Salesforce metadata

### Test Specification Generator
- [x] Generate test files for object CRUD operations
- [x] Create tests for validation rules
- [x] Generate tests for record types (including field visibility, picklist values, assignment)
- [x] Create tests for field-level validations (format, length, picklist restrictions)
- [x] Generate tests for object relationships (cascade delete, update, navigation)
- [x] Generate tests for LWC/Aura components (including error states)
- [x] Generate tests for Flow execution (screen navigation, decision paths, error handling)
- [x] Generate tests for permission-based scenarios
- [x] Generate test data factories and helpers
- [x] Generate Playwright test fixtures
- [x] Implement test tagging and categorization system
- [x] Organize tests into structured folder hierarchy
- [x] Generate comprehensive documentation (README, API docs, execution guide)
- [x] CLI integration with `generate-tests` command
- [x] End-to-end integration testing with real Salesforce metadata
- [x] Comprehensive unit test coverage (65+ tests across all generators)

### Test Data Generator
- [x] Generate test data factories using Salesforce REST API
- [x] Generate test data based on Salesforce field types
- [x] Create data generators that respect relationships
- [x] Generate related records respecting relationships
- [x] Create test data factories for all Salesforce objects
- [ ] Integrate faker-js for test data generation (future enhancement)
- [ ] Create data generators that respect validation rules (future enhancement)

## Phase 4: Advanced Test Scenarios

### Flow Testing
- [x] Generate tests for Flow execution
- [x] Create tests for Flow decision paths
- [x] Generate tests for Flow screen navigation
- [x] Create tests for Flow error handling

### Permission Testing
- [x] Generate tests for profile-based access control
- [x] Create tests for permission set scenarios
- [x] Generate tests for field-level security
- [x] Create tests for object-level permissions

### Component Testing
- [x] Generate component-level tests for LWC
- [x] Create tests for Aura component interactions
- [x] Generate tests for component properties and events
- [x] Create tests for component error states

### Apex Integration Testing
- [x] ~~Generate tests that invoke Apex methods~~ (Descoped - focus on UI testing, not direct Apex method invocation)
- [x] ~~Create tests for trigger execution scenarios~~ (Descoped - trigger testing covered through UI interactions)
- [x] ~~Generate tests for Apex error handling~~ (Descoped - Apex parser informs UI tests, not direct Apex testing)
- [x] ~~Create tests for bulk operations~~ (Descoped - Apex parser is supporting tool, not test generation target)

## Phase 5: Enhancement & Optimization

### Test Organization & Structure
- [x] Implement test tagging and categorization
- [x] Generate test suites and test groups
- [x] Create test execution configuration files
- [x] Generate test documentation and comments

### Customization & Configuration
- [ ] Create configuration system for test generation preferences
- [ ] Implement custom test template support
- [ ] Add support for custom test data generators
- [ ] Create hooks for custom test logic injection

### Quality & Validation
- [ ] Add validation for generated test code
- [ ] Implement test code linting and formatting
- [ ] Generate test coverage reports
- [ ] Create test execution reports

### Documentation & Developer Experience
- [x] Generate comprehensive README files
- [x] Create usage documentation and examples
- [x] Implement CLI interface for framework execution
- [x] Add progress reporting and logging

