# Spec Requirements: Apex Integration Testing

## Initial Description

Apex Integration Testing - A feature that generates automated test specifications (Playwright test files) for testing Apex code integration with Salesforce UI.

## Requirements Discussion

### Decision: Feature Descoped

**Q: Should we proceed with Apex Integration Testing?**

**Answer:** No, this feature should be descoped.

**Reasoning:**
- The product's primary goal is to generate Playwright automated tests for the **web UI**
- Apex code parsing serves to **understand how code interacts with app components** to help generate relevant automated UI tests
- The framework is not designed to generate tests that directly invoke Apex methods or test Apex code behavior
- Apex parser is a **supporting tool** to understand business logic and relationships, not a target for test generation

**What Apex Parser Provides (Supporting Role):**
- Understanding business logic and relationships between Apex classes and Salesforce objects
- Identifying which UI components call which Apex methods (via @AuraEnabled, @InvocableMethod annotations)
- Mapping Apex triggers to objects to understand data flow
- Informing UI test generation with context about underlying business logic

**What This Means for Test Generation:**
- Apex parser output is used to **inform** UI test generation (e.g., understanding which buttons trigger which Apex methods)
- Tests generated will focus on **UI interactions** that happen to call Apex methods, not on testing Apex methods directly
- No need to generate tests that invoke Apex methods via API or test Apex error handling directly
- Trigger testing is covered through UI interactions (creating/updating records that trigger Apex logic)

## Conclusion

This feature is **descoped** and will not be implemented. The Apex Code Parser remains valuable as a supporting tool, but does not require a dedicated "Apex Integration Testing" feature.



