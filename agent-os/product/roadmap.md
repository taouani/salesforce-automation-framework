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
- [ ] Parse Aura component bundles (.cmp, .js, .css)
- [ ] Extract component attributes and events
- [ ] Parse Aura application definitions

## Phase 3: Test Generation Engine

### Page Object Model Generator
- [ ] Generate Page Object classes for Salesforce objects
- [ ] Create page objects for Lightning pages and record pages
- [ ] Generate page objects for custom LWC components
- [ ] Create page objects for Aura components
- [ ] Implement element locator generation strategies

### Test Specification Generator
- [ ] Generate test files for object CRUD operations
- [ ] Create tests for validation rules
- [ ] Generate tests for record types
- [ ] Create tests for field-level validations
- [ ] Generate tests for object relationships

### Test Data Generator
- [ ] Integrate faker-js for test data generation
- [ ] Generate test data based on Salesforce field types
- [ ] Create data generators that respect validation rules
- [ ] Generate related records respecting relationships
- [ ] Create test data factories for common scenarios

## Phase 4: Advanced Test Scenarios

### Flow Testing
- [ ] Generate tests for Flow execution
- [ ] Create tests for Flow decision paths
- [ ] Generate tests for Flow screen navigation
- [ ] Create tests for Flow error handling

### Permission Testing
- [ ] Generate tests for profile-based access control
- [ ] Create tests for permission set scenarios
- [ ] Generate tests for field-level security
- [ ] Create tests for object-level permissions

### Component Testing
- [ ] Generate component-level tests for LWC
- [ ] Create tests for Aura component interactions
- [ ] Generate tests for component properties and events
- [ ] Create tests for component error states

### Apex Integration Testing
- [ ] Generate tests that invoke Apex methods
- [ ] Create tests for trigger execution scenarios
- [ ] Generate tests for Apex error handling
- [ ] Create tests for bulk operations

## Phase 5: Enhancement & Optimization

### Test Organization & Structure
- [ ] Implement test tagging and categorization
- [ ] Generate test suites and test groups
- [ ] Create test execution configuration files
- [ ] Generate test documentation and comments

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
- [ ] Generate comprehensive README files
- [ ] Create usage documentation and examples
- [ ] Implement CLI interface for framework execution
- [ ] Add progress reporting and logging

