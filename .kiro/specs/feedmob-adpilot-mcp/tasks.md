# Implementation Plan

- [x] 1. Set up project structure and core dependencies
  - Initialize TypeScript project with proper configuration
  - Install core dependencies: @modelcontextprotocol/sdk, @mcp-ui/server, @anthropic-ai/claude-agent-sdk, pg, express, cors, passport, passport-google-oauth20
  - Set up build and development scripts
  - Create directory structure for server, agents, tools, database, and auth modules
  - _Requirements: All_

- [ ] 2. Set up database layer
  - Create PostgreSQL database schema with users, campaigns, and creative_assets tables
  - Implement database connection pool and configuration
  - Create database service interface with user and campaign operations
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ]* 2.1 Write property test for database operations
  - **Property 26: Campaign persistence round-trip**
  - **Validates: Requirements 7.1**

- [ ]* 2.2 Write property test for user association
  - **Property 29: Advertiser association**
  - **Validates: Requirements 7.4**

- [ ]* 2.3 Write property test for campaign history
  - **Property 28: Campaign history retrieval**
  - **Validates: Requirements 7.3**

- [ ] 3. Implement Google OAuth authentication
  - Set up Passport.js with Google OAuth strategy
  - Create authentication routes (login, callback, logout)
  - Implement user session management
  - Create middleware for protecting authenticated routes
  - Integrate user creation/retrieval with database layer
  - _Requirements: 7.4_

- [ ]* 3.1 Write unit tests for authentication flow
  - Test OAuth callback handling
  - Test user creation on first login
  - Test session validation

- [ ] 4. Set up MCP server core
  - Initialize MCP server with StreamableHTTPServerTransport
  - Set up Express server with CORS and authentication middleware
  - Create MCP session management
  - Implement health check endpoint
  - _Requirements: 1.1, 6.1_

- [ ]* 4.1 Write unit tests for MCP server initialization
  - Test server starts successfully
  - Test MCP transport configuration
  - Test session creation

- [ ] 5. Implement sub-agent wrapper infrastructure
  - Create SubAgentWrapper class for building agents with claude-agent-sdk
  - Implement agent configuration loading (instructions, plugins, skills)
  - Create method to wrap sub-agents as callable functions
  - Implement error handling and retry logic for sub-agent invocations
  - _Requirements: 1.2_

- [ ]* 5.1 Write property test for sub-agent invocation
  - **Property 2: Sub-agent invocation**
  - **Validates: Requirements 1.2**

- [ ] 6. Build Parameter Parser sub-agent
  - Define agent instructions for extracting campaign parameters from natural language
  - Configure NLP skills and validation capabilities
  - Implement parameter extraction logic (demographics, budget, platform, KPIs)
  - Add validation for budget/platform combinations
  - Add clarification prompts for ambiguous inputs
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 8.1, 8.2, 8.3, 8.4_

- [ ]* 6.1 Write property test for parameter extraction
  - **Property 4: Parameter extraction completeness**
  - **Validates: Requirements 2.1**

- [ ]* 6.2 Write property test for budget extraction
  - **Property 5: Budget extraction**
  - **Validates: Requirements 2.2**

- [ ]* 6.3 Write property test for platform extraction
  - **Property 6: Platform extraction**
  - **Validates: Requirements 2.3**

- [ ]* 6.4 Write property test for KPI extraction
  - **Property 7: KPI extraction**
  - **Validates: Requirements 2.4**

- [ ]* 6.5 Write property test for budget validation
  - **Property 31: Budget validation**
  - **Validates: Requirements 8.1**

- [ ]* 6.6 Write property test for clarification on ambiguity
  - **Property 3: Clarification on ambiguity**
  - **Validates: Requirements 1.3**

- [ ] 7. Build Copy Generator sub-agent
  - Define agent instructions for creating advertising copy
  - Configure creative writing skills and platform-specific plugins
  - Implement headline generation logic
  - Implement CTA generation aligned with KPIs
  - Implement body text generation for target audiences
  - Support multiple copy variations
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [ ]* 7.1 Write property test for headline generation
  - **Property 10: Headline generation**
  - **Validates: Requirements 3.1**

- [ ]* 7.2 Write property test for CTA alignment
  - **Property 11: CTA alignment with KPIs**
  - **Validates: Requirements 3.2**

- [ ]* 7.3 Write property test for body text generation
  - **Property 12: Body text generation**
  - **Validates: Requirements 3.3**

- [ ]* 7.4 Write property test for variations display
  - **Property 14: All variations displayed**
  - **Validates: Requirements 3.5**

- [ ] 8. Build Image Generator sub-agent
  - Define agent instructions for generating image creatives
  - Configure image generation plugins
  - Implement image generation based on target audience
  - Implement platform-specific dimension handling
  - Add error handling for generation failures
  - _Requirements: 4.1, 4.2, 4.5_

- [ ]* 8.1 Write property test for image generation
  - **Property 15: Image generation when required**
  - **Validates: Requirements 4.1**

- [ ]* 8.2 Write property test for platform dimensions
  - **Property 16: Platform-appropriate dimensions**
  - **Validates: Requirements 4.2**

- [ ]* 8.3 Write property test for error handling
  - **Property 19: Image generation error handling**
  - **Validates: Requirements 4.5**

- [ ] 9. Implement UI Resource Generator
  - Create UIResourceGenerator class using @mcp-ui/server
  - Implement createParameterDisplay for CampaignParameters with interactive editing
  - Implement createCopyDisplay for AdCopy with editing capabilities
  - Implement createImageDisplay for ImageAssets with regeneration options
  - Implement createMixedMediaDisplay for MixedMediaAssets with independent editing
  - Add metadata configuration for all UIResources
  - _Requirements: 2.5, 2.6, 3.4, 4.3, 4.4, 5.3, 5.4_

- [ ]* 9.1 Write property test for UIResource generation
  - **Property 8: UIResource generation for parameters**
  - **Validates: Requirements 2.5**

- [ ]* 9.2 Write property test for interactive elements
  - **Property 9: Interactive parameter display**
  - **Validates: Requirements 2.6**

- [ ]* 9.3 Write property test for copy UIResource
  - **Property 13: Copy UIResource with editing**
  - **Validates: Requirements 3.4**

- [ ]* 9.4 Write property test for image UIResource
  - **Property 17: Image UIResource generation**
  - **Validates: Requirements 4.3**

- [ ] 10. Implement parseCampaignRequest MCP tool
  - Create tool definition with input schema for campaign request text
  - Implement tool handler that invokes Parameter Parser sub-agent
  - Store extracted and validated CampaignParameters in database
  - Generate UIResource for parameter display
  - Return UIResource to MCP client
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 7.1, 8.1, 8.2, 8.3, 8.4_

- [ ]* 10.1 Write property test for text input acceptance
  - **Property 1: Text input acceptance**
  - **Validates: Requirements 1.1**

- [ ]* 10.2 Write property test for validation messaging
  - **Property 32: Minimum budget messaging**
  - **Validates: Requirements 8.2**

- [ ]* 10.3 Write property test for compatibility warnings
  - **Property 33: Platform compatibility warnings**
  - **Validates: Requirements 8.3**

- [ ]* 10.4 Write property test for KPI expectations
  - **Property 34: KPI expectation adjustment**
  - **Validates: Requirements 8.4**

- [ ] 11. Implement generateAdCopy MCP tool
  - Create tool definition with input schema for confirmed CampaignParameters
  - Implement tool handler that invokes Copy Generator sub-agent
  - Store generated AdCopy in database as creative asset
  - Generate UIResource for copy display with editing
  - Return UIResource to MCP client
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.2_

- [ ] 12. Implement generateAdImages MCP tool
  - Create tool definition with input schema for confirmed CampaignParameters
  - Implement tool handler that invokes Image Generator sub-agent
  - Store generated ImageAssets in database
  - Generate UIResource for image display with modification options
  - Return UIResource to MCP client
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 7.2_

- [ ]* 12.1 Write property test for image modification options
  - **Property 18: Image modification options**
  - **Validates: Requirements 4.4**

- [ ] 13. Implement generateMixedMedia MCP tool
  - Create tool definition with input schema for confirmed CampaignParameters
  - Implement tool handler that invokes Image Generator sub-agent with copy overlay
  - Check platform support for mixed media
  - Generate MixedMediaAsset or separate assets based on platform
  - Store assets in database
  - Generate UIResource for display with independent editing
  - Return UIResource to MCP client
  - _Requirements: 5.1, 5.3, 5.4, 5.5, 7.2_

- [ ]* 13.1 Write property test for mixed media combination
  - **Property 20: Mixed media combination**
  - **Validates: Requirements 5.1**

- [ ]* 13.2 Write property test for mixed media UIResource
  - **Property 21: Mixed media UIResource**
  - **Validates: Requirements 5.3**

- [ ]* 13.3 Write property test for independent editing
  - **Property 22: Independent editing for mixed media**
  - **Validates: Requirements 5.4**

- [ ]* 13.4 Write property test for platform-based asset generation
  - **Property 23: Separate assets for non-mixed-media platforms**
  - **Validates: Requirements 5.5**

- [ ] 14. Implement getCampaignHistory MCP tool
  - Create tool definition with input schema (no parameters needed, uses authenticated user)
  - Implement tool handler that calls database service
  - Retrieve campaign history for authenticated user
  - Format campaigns as UIResource for display
  - Return UIResource to MCP client
  - _Requirements: 7.3_

- [ ] 15. Implement chat interface integration
  - Set up scira-mcp-ui-chat for conversational UI
  - Implement message formatting for system responses
  - Implement UIResource embedding within chat flow
  - Add conversation history management
  - _Requirements: 6.1, 6.3, 6.4_

- [ ]* 15.1 Write property test for conversational format
  - **Property 24: Conversational response format**
  - **Validates: Requirements 6.3**

- [ ]* 15.2 Write property test for UIResource embedding
  - **Property 25: UIResource embedding in chat**
  - **Validates: Requirements 6.4**

- [ ] 16. Implement error handling and graceful degradation
  - Add error handling for sub-agent failures with retry logic
  - Implement database connection failure handling with temporary storage
  - Add error response formatting for all tool handlers
  - Implement fallback options for creative generation failures
  - _Requirements: 4.5, 7.5_

- [ ]* 16.1 Write property test for database failure handling
  - **Property 30: Database failure graceful degradation**
  - **Validates: Requirements 7.5**

- [ ] 17. Implement asset persistence
  - Ensure all creative assets are stored with campaign references
  - Implement asset retrieval by campaign ID
  - Add asset metadata storage
  - _Requirements: 7.2_

- [ ]* 17.1 Write property test for asset persistence
  - **Property 27: Asset persistence**
  - **Validates: Requirements 7.2**

- [ ] 18. Create environment configuration and deployment setup
  - Create .env.example with all required environment variables
  - Document Google OAuth setup process
  - Create database migration scripts
  - Write deployment documentation
  - Create MCP server registration configuration example
  - _Requirements: All_

- [ ] 19. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
