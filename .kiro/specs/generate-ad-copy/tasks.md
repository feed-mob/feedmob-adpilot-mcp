# Implementation Plan

- [x] 1. Create ad copy schemas and types
  - [x] 1.1 Create `src/schemas/ad-copy.ts` with Zod schemas
    - Define `AdCopyVariationSchema` with headline, body_copy, cta, tone, platform_optimized fields
    - Define `AdCopyResultSchema` with variations array (length 2), recommended_variation, disclaimer
    - Define `GenerateAdCopyInputSchema` accepting campaignParameters and optional campaignReport
    - Export TypeScript types from schemas
    - _Requirements: 7.1, 7.2, 7.3_
  - [ ]* 1.2 Write property test for schema validation
    - **Property 2: Schema Validation Completeness**
    - **Validates: Requirements 7.1, 7.2, 7.3, 2.3**
  - [ ]* 1.3 Write property test for JSON round-trip
    - **Property 3: JSON Round-Trip Consistency**
    - **Validates: Requirements 7.4**

- [x] 2. Create generate-ad-copy skill plugin
  - [x] 2.1 Create plugin directory structure
    - Create `src/plugins/generate-ad-copy/skills/generate-ad-copy/SKILL.md`
    - Define skill name and description in frontmatter
    - Document workflow for generating two distinct ad copy variations
    - Include examples with input/output format
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_

- [x] 3. Create ad copy agent service
  - [x] 3.1 Create `src/services/ad-copy-agent.ts`
    - Implement `AdCopyAgent` class with `generateCopy` method
    - Resolve plugin path for generate-ad-copy skill
    - Build campaign context from parameters and research
    - Parse and validate JSON response against schema
    - Handle agent errors with appropriate error types
    - _Requirements: 1.1, 1.4, 3.1, 3.2, 3.3_

- [x] 4. Create ad copy UI factory
  - [x] 4.1 Create `src/utils/ad-copy-ui.ts` with result UI
    - Implement `createAdCopyUI` function
    - Generate side-by-side comparison layout
    - Display headline, body_copy, and CTA for each variation
    - Add selection buttons with postMessage tool calls
    - Highlight recommended variation
    - Include design system CSS variables with dark mode support
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 4.2 Add error UI function
    - Implement `createAdCopyErrorUI` function
    - Support validation, agent, timeout, and unknown error types
    - Include retry button for non-validation errors
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [ ]* 4.3 Write property test for UI structure
    - **Property 4: UI Structure Completeness**
    - **Validates: Requirements 4.1, 4.2, 4.3**
  - [ ]* 4.4 Write property test for error UI generation
    - **Property 7: Error UI Generation**
    - **Validates: Requirements 6.4**

- [x] 5. Create generateAdCopy MCP tool
  - [x] 5.1 Create `src/tools/generate-ad-copy.ts`
    - Define tool name, description, and parameters
    - Validate input using Zod schema
    - Call agent service to generate ad copy
    - Generate text summary with both variations and recommendation
    - Return text summary and UIResource
    - Handle errors with categorization (validation, agent, timeout, unknown)
    - _Requirements: 1.1, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3_
  - [ ]* 5.2 Write property test for two distinct variations
    - **Property 1: Two Distinct Variations**
    - **Validates: Requirements 1.1, 1.2**
  - [ ]* 5.3 Write property test for text summary completeness
    - **Property 5: Text Summary Completeness**
    - **Validates: Requirements 5.1, 5.2, 5.3**
  - [ ]* 5.4 Write property test for validation error handling
    - **Property 6: Validation Error Handling**
    - **Validates: Requirements 6.1**

- [x] 6. Register tool with FastMCP server
  - [x] 6.1 Update `src/index.ts` to import and register generateAdCopyTool
    - Import generateAdCopyTool from tools
    - Add tool to server using server.addTool()
    - _Requirements: 1.1_

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Integration and wiring
  - [x] 8.1 Update ad-research-ui.ts to call generateAdCopy
    - Verify the "Generate Ad Copy →" button in research report UI calls generateAdCopy tool
    - Ensure campaign report data is passed correctly
    - _Requirements: 1.4_
  - [ ]* 8.2 Write unit tests for tool integration
    - Test tool execution with valid campaign parameters
    - Test tool execution with campaign parameters and research report
    - Test error handling for invalid inputs
    - _Requirements: 1.1, 6.1_

- [x] 9. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
