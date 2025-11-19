# Apex Integration Testing - Initial Idea

## Feature Description

**STATUS: DESCOPED**

Apex Integration Testing was initially considered as a feature to generate automated test specifications (Playwright test files) for testing Apex code integration with Salesforce UI.

## Decision: Feature Descoped

After requirements discussion, this feature has been descoped because:

**Product Goal Clarification:**
- The primary goal of the Salesforce Test Automation Framework is to generate Playwright automated tests for the **web UI**
- Apex code parsing is intended to **understand how Apex code interacts with app components** to help generate relevant automated UI tests
- The framework is not designed to generate tests that directly invoke Apex methods or test Apex code behavior
- Apex parser serves as a **supporting tool** to understand business logic and relationships, not as a target for test generation

**What Apex Parser Provides:**
- Understanding business logic and relationships between Apex classes and Salesforce objects
- Identifying which UI components call which Apex methods (via @AuraEnabled, @InvocableMethod)
- Mapping Apex triggers to objects to understand data flow
- Informing UI test generation with context about underlying business logic

**What This Means:**
- Apex parser output is used to **inform** UI test generation (e.g., understanding which buttons trigger which Apex methods)
- Tests generated will focus on **UI interactions** that happen to call Apex methods, not on testing Apex methods directly
- No need to generate tests that invoke Apex methods via API or test Apex error handling directly
- Trigger testing is covered through UI interactions (creating/updating records that trigger Apex logic)

## Context

This feature was originally planned as part of Phase 4: Advanced Test Scenarios in the product roadmap. However, after clarifying the product's focus on UI testing, this feature is no longer needed.

The Apex Code Parser remains valuable as a supporting tool to understand business logic and inform UI test generation, but does not require a dedicated "Apex Integration Testing" feature.

