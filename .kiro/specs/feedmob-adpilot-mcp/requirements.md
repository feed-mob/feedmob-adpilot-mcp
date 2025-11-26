# Requirements Document

## Introduction

The FeedMob AdPilot MCP system is a conversational advertising assistant that integrates with the Model Context Protocol ecosystem to help advertisers create comprehensive ad campaigns. The system interprets campaign requirements through natural language text input, generates ad copy and creative materials, and presents results through interactive UI components. Built on TypeScript with FastMCP framework and PostgreSQL, it leverages mcp-ui for interactive displays, Google OAuth for authentication, and integrates with external image generation services.

## Glossary

- **AdPilot System**: The complete MCP-based conversational advertising assistant
- **Campaign Parameters**: Structured data extracted from advertiser input including target audience, budget, platform, and KPIs
- **MCP Client**: A conversational interface that supports the Model Context Protocol
- **FastMCP**: TypeScript framework for building MCP servers with built-in authentication, sessions, and tool management
- **Creative Asset**: Generated advertising materials including copy, images, or mixed media
- **MCP-UI Component**: Interactive UI elements rendered through the mcp-ui protocol
- **UIResource**: A structured object containing interactive UI content (HTML, external URLs, or Remote DOM)
- **Campaign Request**: Natural language input from an advertiser describing their advertising needs
- **KPI**: Key Performance Indicator such as CTR, installs, or conversions

## Requirements

### Requirement 1

**User Story:** As an advertiser, I want to describe my campaign needs in natural language, so that the system can understand my requirements without requiring structured input forms.

#### Acceptance Criteria

1. WHEN an advertiser provides a campaign request through text input, THEN the AdPilot System SHALL accept and process the natural language description
2. WHEN the AdPilot System receives a campaign request, THEN the AdPilot System SHALL use Claude API to interpret the natural language content and extract structured parameters
3. WHEN the campaign request contains ambiguous information, THEN the AdPilot System SHALL prompt the advertiser for clarification through the MCP Client
4. WHEN the campaign request is successfully received, THEN the AdPilot System SHALL acknowledge receipt to the advertiser within 2 seconds

### Requirement 2

**User Story:** As an advertiser, I want the system to extract structured parameters from my description, so that I can verify the system understood my requirements correctly.

#### Acceptance Criteria

1. WHEN a campaign request is processed, THEN the AdPilot System SHALL extract the target audience demographics from the description
2. WHEN a campaign request is processed, THEN the AdPilot System SHALL extract the budget amount and currency from the description
3. WHEN a campaign request is processed, THEN the AdPilot System SHALL extract the advertising platform specifications from the description
4. WHEN a campaign request is processed, THEN the AdPilot System SHALL extract the KPI metrics from the description
5. WHEN Campaign Parameters are extracted, THEN the AdPilot System SHALL display the structured results using MCP-UI Components
6. WHEN Campaign Parameters are displayed, THEN the AdPilot System SHALL allow the advertiser to confirm or modify the extracted parameters

### Requirement 3

**User Story:** As an advertiser, I want the system to generate compelling ad copy, so that I can use professionally-written text for my campaigns.

#### Acceptance Criteria

1. WHEN Campaign Parameters are confirmed, THEN the AdPilot System SHALL generate advertising headlines appropriate for the specified platform
2. WHEN Campaign Parameters are confirmed, THEN the AdPilot System SHALL generate call-to-action text aligned with the specified KPIs
3. WHEN Campaign Parameters are confirmed, THEN the AdPilot System SHALL generate body text that addresses the target audience demographics
4. WHEN ad copy is generated, THEN the AdPilot System SHALL present the text through MCP-UI Components with interactive editing capabilities
5. WHEN multiple copy variations are generated, THEN the AdPilot System SHALL display all variations for advertiser selection

### Requirement 4

**User Story:** As an advertiser, I want the system to generate image creatives, so that I have visual assets for my advertising campaigns.

#### Acceptance Criteria

1. WHEN Campaign Parameters include image requirements, THEN the AdPilot System SHALL generate image Creative Assets matching the target audience preferences
2. WHEN Campaign Parameters include platform specifications, THEN the AdPilot System SHALL generate images with dimensions appropriate for the specified platform
3. WHEN image Creative Assets are generated, THEN the AdPilot System SHALL display the visuals using MCP-UI Components
4. WHEN image Creative Assets are displayed, THEN the AdPilot System SHALL provide options to regenerate or modify the images
5. WHEN image generation fails, THEN the AdPilot System SHALL notify the advertiser and provide alternative options

### Requirement 5

**User Story:** As an advertiser, I want the system to generate mixed media creatives combining text and images, so that I receive complete ad assets ready for deployment.

#### Acceptance Criteria

1. WHEN Campaign Parameters support mixed media, THEN the AdPilot System SHALL generate Creative Assets combining generated copy and images
2. WHEN mixed media Creative Assets are generated, THEN the AdPilot System SHALL ensure text placement does not obscure critical image elements
3. WHEN mixed media Creative Assets are generated, THEN the AdPilot System SHALL display the composite results using MCP-UI Components
4. WHEN mixed media Creative Assets are displayed, THEN the AdPilot System SHALL allow independent editing of text and image components
5. WHERE the advertising platform does not support mixed media, THEN the AdPilot System SHALL generate separate text and image Creative Assets

### Requirement 6

**User Story:** As an advertiser, I want to interact with the system through a conversational chat interface, so that I can naturally communicate my needs and receive guidance.

#### Acceptance Criteria

1. WHEN the AdPilot System starts, THEN the AdPilot System SHALL render a chat interface using scira-mcp-ui-chat
2. WHEN an advertiser sends a message, THEN the AdPilot System SHALL display the message in the chat interface within 500 milliseconds
3. WHEN the AdPilot System responds, THEN the AdPilot System SHALL display responses in conversational format through the chat interface
4. WHEN the AdPilot System presents structured data or Creative Assets, THEN the AdPilot System SHALL embed MCP-UI Components within the chat conversation flow
5. WHEN the conversation history exceeds 50 messages, THEN the AdPilot System SHALL maintain scrollable access to all previous messages

### Requirement 7

**User Story:** As an advertiser, I want the system to persist my campaign data, so that I can return to previous campaigns and track my advertising history.

#### Acceptance Criteria

1. WHEN Campaign Parameters are confirmed, THEN the AdPilot System SHALL store the parameters in the PostgreSQL database
2. WHEN Creative Assets are generated, THEN the AdPilot System SHALL store references to the assets in the PostgreSQL database
3. WHEN an advertiser requests previous campaigns, THEN the AdPilot System SHALL retrieve and display campaign history from the PostgreSQL database
4. WHEN campaign data is stored, THEN the AdPilot System SHALL associate the data with the advertiser identifier
5. WHEN the database connection fails, THEN the AdPilot System SHALL notify the advertiser and continue operating with temporary storage

### Requirement 8

**User Story:** As an advertiser, I want the system to validate my budget and platform combinations, so that I receive realistic campaign recommendations.

#### Acceptance Criteria

1. WHEN Campaign Parameters include budget and platform specifications, THEN the AdPilot System SHALL validate that the budget is sufficient for the specified platform
2. WHEN budget validation fails, THEN the AdPilot System SHALL inform the advertiser of minimum budget requirements for the platform
3. WHEN platform specifications are incompatible with target audience demographics, THEN the AdPilot System SHALL warn the advertiser and suggest alternative platforms
4. WHEN KPI metrics are unrealistic for the budget, THEN the AdPilot System SHALL provide adjusted expectations to the advertiser
