# Implementation Plan

- [x] 1. Initialize project structure and dependencies
  - Create package.json with TypeScript, FastMCP, mcp-ui, Zod, Vitest, and fast-check dependencies
  - Create tsconfig.json with strict mode and ESM configuration
  - Create vitest.config.ts for test configuration
  - Set up project directory structure (src/, tests/)
  - _Requirements: 4.1, 4.2, 5.1_

- [x] 2. Implement FastMCP server initialization
  - Create src/index.ts with FastMCP server setup
  - Configure HTTP streaming transport on port 8080
  - Set up /mcp, /sse, and /ready endpoints
  - Add server startup logging
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 3. Create UIResource factory utility
  - Create src/utils/ui-factory.ts
  - Implement createGreetingUI function with semantic URI and inline CSS
  - Implement createButtonResponseUI function
  - Implement createCounterUI function with increment/decrement buttons
  - Ensure all UIResources include metadata with title and description
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 4. Implement greeting tool
  - Create src/tools/greeting.ts
  - Define Zod schema for name parameter (non-empty string)
  - Implement tool execution logic
  - Generate UIResource with personalized greeting
  - Include interactive button that triggers button tool via postMessage
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 5.2, 5.3_

- [x]* 4.1 Write property test for greeting tool
  - **Property 1: Non-empty name validation**
  - **Validates: Requirements 1.2**

- [x] 5. Implement button tool
  - Create src/tools/button.ts
  - Define Zod schema for action and optional source parameters
  - Implement tool execution logic
  - Generate UIResource with confirmation message
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.1, 5.2, 5.3_

- [x]* 5.1 Write property test for button interaction
  - **Property 3: Button interaction round-trip**
  - **Validates: Requirements 2.2, 2.3, 2.4**

- [x] 6. Implement counter tool
  - Create src/tools/counter.ts
  - Define Zod schema for count parameter (number)
  - Implement tool execution logic
  - Generate UIResource with current count and increment/decrement buttons
  - Each button should invoke counter tool with updated value via postMessage
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3_

- [x]* 6.1 Write property test for counter state
  - **Property 4: Counter state consistency**
  - **Validates: Requirements 3.3, 3.4**

- [x] 7. Register all tools with FastMCP server
  - Import all tool modules in src/index.ts
  - Register greeting tool with server.addTool()
  - Register button tool with server.addTool()
  - Register counter tool with server.addTool()
  - Start server with HTTP streaming transport
  - _Requirements: 4.1, 4.2, 4.4_

- [x]* 8. Write property test for UIResource structure compliance
  - **Property 2: UIResource structure compliance**
  - **Validates: Requirements 6.1, 6.2, 6.3**

- [x]* 9. Write property test for parameter validation
  - **Property 5: Parameter validation enforcement**
  - **Validates: Requirements 5.2, 5.3**

- [x]* 10. Write unit tests for tools
  - Create tests/unit/greeting.test.ts for greeting tool
  - Create tests/unit/button.test.ts for button tool
  - Create tests/unit/counter.test.ts for counter tool
  - Test valid parameter scenarios
  - Test invalid parameter scenarios
  - Test UIResource structure
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 5.2, 5.3_

- [x] 11. Create README with usage instructions
  - Document project purpose and features
  - Add installation instructions
  - Add development commands (dev, build, test, mcp:inspect)
  - Add example tool invocations
  - Add testing instructions
  - _Requirements: 4.1, 4.2_

- [x] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
