# Implementation Plan

- [ ] 1. Create schemas for ad research data models
  - [ ] 1.1 Create `src/schemas/ad-research.ts` with Zod schemas
    - Define `ResearchSourceSchema` for source citations (title, url, accessed_at)
    - Define `ExecutiveSummarySchema` with overview, key_findings, recommendations
    - Define `AudienceInsightsSchema` with demographics, behaviors, preferences, engagement_patterns
    - Define `PlatformStrategySchema` array with platform, trends, best_practices, optimization_tips
    - Define `CreativeDirectionSchema` with content_types, format_recommendations, tone_and_style, examples
    - Define `BudgetAllocationSchema` with total_budget, distribution array, optimization_suggestions
    - Define `PerformanceMetricsSchema` with primary_kpis, benchmarks array, tracking_recommendations
    - Define `ImplementationTimelineSchema` array with phase, duration, activities
    - Define `CampaignReportSchema` combining all sections plus sources, assumptions, disclaimer, generated_at, campaign_name
    - Define `ConductAdResearchInputSchema` for tool input validation
    - Export TypeScript types from all schemas
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 6.4_

  - [ ]* 1.2 Write property test for schema round-trip consistency
    - **Property 8: Round-Trip Consistency**
    - **Validates: Requirements 6.5**

  - [ ]* 1.3 Write property test for campaign report completeness
    - **Property 1: Campaign Report Completeness**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

- [ ] 2. Create the conduct-ad-research skill plugin
  - [ ] 2.1 Create plugin directory structure
    - Create `src/plugins/conduct-ad-research/` directory
    - Create `src/plugins/conduct-ad-research/skills/conduct-ad-research/` directory
    - _Requirements: 6.1_

  - [ ] 2.2 Create MCP configuration for web search tools
    - Create `src/plugins/conduct-ad-research/.mcp.json`
    - Configure DuckDuckGo MCP server (enabled by default)
    - Configure Tavily MCP server (disabled, requires API key)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ] 2.3 Create SKILL.md with research workflow instructions
    - Define skill name and description in frontmatter
    - Document research workflow steps (query construction, search, synthesis)
    - Include search query patterns for each research category (audience, platform, competitor, benchmarks, creative)
    - Specify CampaignReport JSON output format with all sections
    - Include copyright compliance guidelines
    - Provide 2-3 examples of input/output
    - Document fallback behavior for missing parameters and search failures
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 6.2_

  - [ ] 2.4 Update marketplace.json with plugin registration
    - Add conduct-ad-research plugin entry to `src/plugins/.claude-plugin/marketplace.json`
    - Include mcpServers reference to `.mcp.json`
    - _Requirements: 6.1_

- [ ] 3. Create the ad research agent service
  - [ ] 3.1 Create `src/services/ad-research-agent.ts`
    - Implement `AdResearchAgent` class
    - Implement `conductResearch(params: CampaignParameters): Promise<CampaignReport>` method
    - Implement `resolvePluginPath()` for plugin discovery
    - Implement `extractAssistantText()` for response parsing
    - Configure Claude Agent SDK with allowed tools including web search
    - Parse and validate JSON response against CampaignReportSchema
    - Handle agent errors and timeouts
    - Export singleton instance `adResearchAgent`
    - _Requirements: 1.1, 6.1, 6.2, 6.4_

  - [ ]* 3.2 Write property test for schema validation
    - **Property 7: Schema Validation**
    - **Validates: Requirements 6.4**

- [ ] 4. Create the UI factory for research reports
  - [ ] 4.1 Create `src/utils/ad-research-ui.ts` with report UI
    - Implement `createResearchReportUI(report: CampaignReport): UIResource`
    - Generate collapsible sections for each report section (executive summary, audience insights, etc.)
    - Include visual data representations (tables for benchmarks, budget distribution)
    - Highlight key takeaways and recommendations prominently
    - Include source citations with clickable links
    - Add action buttons to proceed to ad copy generation
    - Include copyright disclaimer section
    - Apply design system CSS variables (light/dark mode)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.4_

  - [ ] 4.2 Implement error UI in `src/utils/ad-research-ui.ts`
    - Implement `createResearchErrorUI(error: Error, errorType: ErrorType): UIResource`
    - Support error types: validation, agent, search, timeout, unknown
    - Include error message, type indicator, and retry button
    - Apply design system CSS variables
    - _Requirements: 6.3_

  - [ ]* 4.3 Write property test for UIResource structural integrity
    - **Property 2: UIResource Structural Integrity**
    - **Validates: Requirements 3.1, 3.3, 3.4, 3.5**

  - [ ]* 4.4 Write property test for source attribution validity
    - **Property 3: Source Attribution Validity**
    - **Validates: Requirements 4.2**

  - [ ]* 4.5 Write property test for copyright disclaimer presence
    - **Property 4: Copyright Disclaimer Presence**
    - **Validates: Requirements 4.4**

  - [ ]* 4.6 Write property test for error UI structure
    - **Property 6: Error UI Structure**
    - **Validates: Requirements 6.3**

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Create the MCP tool for conducting ad research
  - [ ] 6.1 Create `src/tools/conduct-ad-research.ts`
    - Define tool name, description, and parameters (ConductAdResearchInputSchema)
    - Validate input campaign parameters
    - Call `adResearchAgent.conductResearch()`
    - Generate text summary for LLM
    - Generate UIResource using `createResearchReportUI()`
    - Categorize and handle errors (validation, agent, search, timeout, unknown)
    - Return MCP response with text and UIResource content
    - _Requirements: 1.1, 3.1, 6.3_

  - [ ] 6.2 Register tool in FastMCP server
    - Import `conductAdResearchTool` in `src/index.ts`
    - Add tool to FastMCP server configuration
    - _Requirements: 6.1_

  - [ ]* 6.3 Write property test for graceful missing parameter handling
    - **Property 5: Graceful Missing Parameter Handling**
    - **Validates: Requirements 5.1, 5.2**

- [ ] 7. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
