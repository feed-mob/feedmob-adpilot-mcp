# Design Document

## Overview

The FeedMob AdPilot MCP system is a conversational advertising assistant built using the FastMCP framework that helps advertisers create comprehensive ad campaigns through natural language interaction. The system leverages the Model Context Protocol ecosystem to provide an interactive, component-based UI experience powered by mcp-ui.

The architecture follows a modular design with clear separation between:
- **FastMCP Server**: HTTP streaming-based MCP server with built-in authentication and session management
- **MCP Tools Layer**: FastMCP tools that process campaign requests and generate creative assets
- **Claude API Integration**: Direct Claude API calls for natural language processing and content generation
- **UI Rendering**: Interactive components via @mcp-ui/server and @mcp-ui/client
- **Data Persistence**: PostgreSQL for users, campaigns, and asset storage
- **Authentication**: Google OAuth integrated through FastMCP's authentication system
- **Image Generation**: Integration with external image generation services (e.g., DALL-E, Midjourney, Stable Diffusion)

## Architecture

### High-Level Architecture

```mermaid
graph TB
    Client[MCP Client with @mcp-ui/client]
    FastMCP[FastMCP Server]
    DB[(PostgreSQL)]
    OAuth[Google OAuth]
    Claude[Claude API]
    ImgAPI[Image Generation API]
    
    subgraph "FastMCP Tools"
        Tool1[parseCampaignRequest]
        Tool2[generateAdCopy]
        Tool3[generateAdImages]
        Tool4[generateMixedMedia]
        Tool5[getCampaignHistory]
    end
    
    subgraph "Core Services"
        DBService[Database Service]
        UIService[UIResource Generator<br/>@mcp-ui/server]
        AuthService[Auth Service]
    end
    
    Client <-->|HTTP Streaming| FastMCP
    Client -->|OAuth Flow| OAuth
    OAuth -->|User Token| FastMCP
    FastMCP -->|Authenticate| AuthService
    AuthService <-->|User CRUD| DB
    
    FastMCP -->|Register| Tool1
    FastMCP -->|Register| Tool2
    FastMCP -->|Register| Tool3
    FastMCP -->|Register| Tool4
    FastMCP -->|Register| Tool5
    
    Tool1 -->|Extract Parameters| Claude
    Tool1 -->|Store Campaign| DBService
    Tool1 -->|Create UIResource| UIService
    
    Tool2 -->|Generate Copy| Claude
    Tool2 -->|Store Assets| DBService
    Tool2 -->|Create UIResource| UIService
    
    Tool3 -->|Generate Images| ImgAPI
    Tool3 -->|Store Assets| DBService
    Tool3 -->|Create UIResource| UIService
    
    Tool4 -->|Generate Images| ImgAPI
    Tool4 -->|Generate Overlay| Claude
    Tool4 -->|Store Assets| DBService
    Tool4 -->|Create UIResource| UIService
    
    Tool5 -->|Query History| DBService
    Tool5 -->|Create UIResource| UIService
    
    DBService <-->|SQL| DB
```

### Component Interaction Flow

```mermaid
sequenceDiagram
    participant User
    participant Client as MCP Client<br/>with @mcp-ui/client
    participant OAuth as Google OAuth
    participant FastMCP as FastMCP Server
    participant Tool as FastMCP Tool
    participant Claude as Claude API
    participant DB as PostgreSQL
    participant UIGen as UIResource Generator
    
    User->>Client: Authenticate
    Client->>OAuth: OAuth flow
    OAuth-->>Client: User token
    Client->>FastMCP: Connect with token
    FastMCP->>DB: Get/Create user
    
    User->>Client: Enter campaign request
    Client->>FastMCP: Call parseCampaignRequest tool
    FastMCP->>Tool: Execute tool handler
    Tool->>Claude: Extract parameters from text
    Claude-->>Tool: Structured parameters
    Tool->>DB: Store campaign data
    Tool->>UIGen: Create parameter UIResource
    UIGen-->>Tool: UIResource object
    Tool-->>FastMCP: Return UIResource
    FastMCP-->>Client: Return tool result
    Client->>Client: Render with UIResourceRenderer
    Client->>User: Display interactive UI
    
    User->>Client: Confirm parameters
    Client->>FastMCP: Call generateAdCopy tool
    FastMCP->>Tool: Execute tool handler
    Tool->>Claude: Generate ad copy
    Claude-->>Tool: Generated copy
    Tool->>DB: Store creative assets
    Tool->>UIGen: Create copy UIResource
    UIGen-->>Tool: UIResource object
    Tool-->>FastMCP: Return UIResource
    FastMCP-->>Client: Return tool result
    Client->>Client: Render with UIResourceRenderer
    Client->>User: Display editable copy
```

## Components and Interfaces

### 1. FastMCP Server Core

**Responsibilities:**
- Handle MCP protocol communication via HTTP streaming
- Register and expose FastMCP tools with Zod schemas
- Manage authentication and user sessions
- Coordinate between different system components

**Key Interfaces:**
```typescript
import { FastMCP } from 'fastmcp';
import { z } from 'zod';

interface AdPilotServerConfig {
  name: string;
  version: string;
  authenticate: (request: Request) => Promise<AuthUser>;
}

interface AuthUser {
  userId: string;
  email: string;
  name: string;
}

// FastMCP server instance
const server = new FastMCP({
  name: "FeedMob AdPilot",
  version: "1.0.0",
  authenticate: async (request) => {
    // Google OAuth authentication logic
    return { userId, email, name };
  }
});
```

### 2. FastMCP Tools Layer

**Responsibilities:**
- Define FastMCP tools with Zod schemas for type-safe parameters
- Handle tool execution with authenticated user context
- Call Claude API for natural language processing and content generation
- Call external image generation APIs
- Generate UIResources using @mcp-ui/server
- Return structured responses to MCP clients

**FastMCP Tools:**
- **parseCampaignRequest**: Extracts structured parameters from natural language using Claude API
- **generateAdCopy**: Generates ad copy using Claude API
- **generateAdImages**: Generates images using external image API
- **generateMixedMedia**: Combines image generation with text overlay
- **getCampaignHistory**: Retrieves user's campaign history from database

**Key Interfaces:**
```typescript
import { z } from 'zod';

// Tool parameter schemas
const CampaignRequestSchema = z.object({
  requestText: z.string().describe("Natural language campaign request")
});

const CampaignParamsSchema = z.object({
  campaignId: z.string().uuid()
});

// Tool execution context (provided by FastMCP)
interface ToolExecutionContext {
  user: AuthUser; // From authenticate function
  sessionId: string;
}

// Example tool definition
server.addTool({
  name: "parseCampaignRequest",
  description: "Parse natural language campaign request into structured parameters",
  parameters: CampaignRequestSchema,
  execute: async (args, context) => {
    // Tool implementation
    return uiResource;
  }
});
```

### 3. Claude API Integration

**Responsibilities:**
- Make direct API calls to Claude for natural language processing
- Extract structured data from unstructured text
- Generate creative content (ad copy, headlines, CTAs)
- Validate and refine campaign parameters
- Handle API errors and rate limiting

**Key Interfaces:**
```typescript
import Anthropic from '@anthropic-ai/sdk';

interface ClaudeService {
  client: Anthropic;
  
  // Extract campaign parameters from natural language
  extractCampaignParameters(requestText: string): Promise<CampaignParameters>;
  
  // Generate ad copy variations
  generateAdCopy(params: CampaignParameters): Promise<AdCopy>;
  
  // Generate text overlay for mixed media
  generateTextOverlay(params: CampaignParameters, imageContext: string): Promise<TextOverlay>;
  
  // Validate and suggest improvements
  validateCampaign(params: CampaignParameters): Promise<ValidationResult>;
}

interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
}
```

### 4. UI Resource Generator

**Responsibilities:**
- Create UIResource objects using @mcp-ui/server
- Format data for interactive display with editing capabilities
- Handle metadata and rendering preferences
- Support multiple content types (HTML, external URLs, Remote DOM)

**Key Interfaces:**
```typescript
import { createUIResource } from '@mcp-ui/server';

interface UIResourceGenerator {
  // Create interactive parameter display with edit/confirm buttons
  createParameterDisplay(params: CampaignParameters): UIResource;
  
  // Create editable copy display with variations
  createCopyDisplay(copy: AdCopy): UIResource;
  
  // Create image gallery with regeneration options
  createImageDisplay(images: ImageAsset[]): UIResource;
  
  // Create mixed media display with independent text/image editing
  createMixedMediaDisplay(asset: MixedMediaAsset): UIResource;
  
  // Create campaign history list
  createHistoryDisplay(campaigns: Campaign[]): UIResource;
}

// Example implementation
function createParameterDisplay(params: CampaignParameters): UIResource {
  const htmlContent = `
    <div class="campaign-params">
      <h2>Campaign Parameters</h2>
      <div class="param-group">
        <label>Target Audience:</label>
        <p>${params.targetAudience.demographics.join(', ')}</p>
      </div>
      <div class="param-group">
        <label>Budget:</label>
        <p>${params.budget.currency} ${params.budget.amount}</p>
      </div>
      <div class="actions">
        <button onclick="window.parent.postMessage({
          type: 'tool',
          payload: { toolName: 'confirmParameters', params: { campaignId: '${params.id}' } }
        }, '*')">Confirm</button>
        <button onclick="window.parent.postMessage({
          type: 'tool',
          payload: { toolName: 'editParameters', params: { campaignId: '${params.id}' } }
        }, '*')">Edit</button>
      </div>
    </div>
  `;
  
  return createUIResource({
    uri: `ui://campaign-params/${params.id}`,
    content: { type: 'rawHtml', htmlString: htmlContent },
    encoding: 'text',
    metadata: {
      title: 'Campaign Parameters',
      description: 'Review and confirm your campaign parameters'
    }
  });
}
```

### 5. Authentication Layer

**Responsibilities:**
- Handle Google OAuth authentication flow
- Manage user sessions and tokens
- Provide user information to MCP tools

**Key Interfaces:**
```typescript
interface AuthService {
  initiateOAuth(): Promise<string>; // Returns OAuth URL
  handleOAuthCallback(code: string): Promise<User>;
  validateToken(token: string): Promise<User>;
  refreshToken(refreshToken: string): Promise<string>;
}

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  createdAt: Date;
}
```

### 6. Database Layer

**Responsibilities:**
- Persist user information from Google OAuth
- Persist campaign parameters and creative assets
- Provide campaign history and retrieval
- Handle connection failures gracefully

**Key Interfaces:**
```typescript
interface DatabaseService {
  // User operations
  createUser(user: User): Promise<string>;
  getUser(userId: string): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(userId: string, updates: Partial<User>): Promise<void>;
  
  // Campaign operations
  saveCampaign(userId: string, params: CampaignParameters): Promise<string>;
  saveCreativeAsset(campaignId: string, asset: CreativeAsset): Promise<string>;
  getCampaignHistory(userId: string): Promise<Campaign[]>;
  getCampaign(campaignId: string): Promise<Campaign>;
}
```

### 7. Image Generation Service

**Responsibilities:**
- Integrate with external image generation APIs (DALL-E, Midjourney, Stable Diffusion)
- Handle platform-specific image dimensions and formats
- Manage image storage and URLs
- Handle generation failures gracefully

**Key Interfaces:**
```typescript
interface ImageGenerationService {
  // Generate images based on campaign parameters
  generateImages(params: ImageGenerationParams): Promise<ImageAsset[]>;
  
  // Get platform-specific dimensions
  getPlatformDimensions(platform: string): { width: number; height: number };
  
  // Store generated image and return URL
  storeImage(imageData: Buffer, metadata: ImageMetadata): Promise<string>;
}

interface ImageGenerationParams {
  prompt: string;
  dimensions: { width: number; height: number };
  style?: string;
  count?: number;
}

interface ImageMetadata {
  campaignId: string;
  platform: string;
  format: string;
}
```

## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  googleId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Campaign Parameters
```typescript
interface CampaignParameters {
  id?: string;
  userId: string; // Changed from advertiserId
  targetAudience: {
    demographics: string[];
    ageRange?: [number, number];
    location?: string[];
  };
  budget: {
    amount: number;
    currency: string;
  };
  platform: {
    name: string; // e.g., "TikTok", "Facebook", "Instagram"
    format: string; // e.g., "video", "image", "carousel"
  };
  kpis: string[]; // e.g., ["CTR", "installs", "conversions"]
  createdAt: Date;
  updatedAt: Date;
}
```

### Creative Assets
```typescript
interface AdCopy {
  id?: string;
  campaignId: string;
  headlines: string[];
  callsToAction: string[];
  bodyText: string[];
  variations: number;
  createdAt: Date;
}

interface ImageAsset {
  id?: string;
  campaignId: string;
  url: string;
  dimensions: {
    width: number;
    height: number;
  };
  format: string; // e.g., "png", "jpg"
  createdAt: Date;
}

interface MixedMediaAsset {
  id?: string;
  campaignId: string;
  imageUrl: string;
  overlayText: {
    headline: string;
    cta: string;
    position: string;
  };
  compositeUrl: string;
  createdAt: Date;
}
```

### Database Schema
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  picture TEXT,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  target_audience JSONB NOT NULL,
  budget JSONB NOT NULL,
  platform JSONB NOT NULL,
  kpis TEXT[] NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE creative_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),
  asset_type VARCHAR(50) NOT NULL, -- 'copy', 'image', 'mixed_media'
  asset_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_campaigns_user ON campaigns(user_id);
CREATE INDEX idx_assets_campaign ON creative_assets(campaign_id);
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Text input acceptance
*For any* text input provided as a campaign request, the system should accept and process it without throwing errors
**Validates: Requirements 1.1**

### Property 2: Sub-agent invocation
*For any* campaign request received, the system should invoke at least one sub-agent during processing
**Validates: Requirements 1.2**

### Property 3: Clarification on ambiguity
*For any* campaign request with missing required fields (budget, platform, or target audience), the system should request clarification
**Validates: Requirements 1.3**

### Property 4: Parameter extraction completeness
*For any* campaign request containing demographic information, the system should extract and include demographics in the returned CampaignParameters
**Validates: Requirements 2.1**

### Property 5: Budget extraction
*For any* campaign request containing budget information, the system should extract both amount and currency into the CampaignParameters
**Validates: Requirements 2.2**

### Property 6: Platform extraction
*For any* campaign request mentioning an advertising platform, the system should extract the platform name into the CampaignParameters
**Validates: Requirements 2.3**

### Property 7: KPI extraction
*For any* campaign request mentioning KPI metrics, the system should extract all mentioned KPIs into the CampaignParameters
**Validates: Requirements 2.4**

### Property 8: UIResource generation for parameters
*For any* extracted CampaignParameters, the system should generate a valid UIResource with uri starting with "ui://"
**Validates: Requirements 2.5**

### Property 9: Interactive parameter display
*For any* UIResource displaying CampaignParameters, the resource should include interactive elements for confirmation or modification
**Validates: Requirements 2.6**

### Property 10: Headline generation
*For any* confirmed CampaignParameters, the system should generate at least one headline in the AdCopy response
**Validates: Requirements 3.1**

### Property 11: CTA alignment with KPIs
*For any* confirmed CampaignParameters with specified KPIs, the generated call-to-action text should reference or align with at least one of the specified KPIs
**Validates: Requirements 3.2**

### Property 12: Body text generation
*For any* confirmed CampaignParameters, the system should generate body text that is non-empty
**Validates: Requirements 3.3**

### Property 13: Copy UIResource with editing
*For any* generated AdCopy, the system should return a UIResource that includes interactive editing capabilities
**Validates: Requirements 3.4**

### Property 14: All variations displayed
*For any* AdCopy generation producing N variations, the returned UIResource should display all N variations
**Validates: Requirements 3.5**

### Property 15: Image generation when required
*For any* CampaignParameters that include image requirements, the system should generate at least one ImageAsset
**Validates: Requirements 4.1**

### Property 16: Platform-appropriate dimensions
*For any* ImageAsset generated for a specific platform, the image dimensions should match the platform's standard dimensions
**Validates: Requirements 4.2**

### Property 17: Image UIResource generation
*For any* generated ImageAsset, the system should return a valid UIResource displaying the image
**Validates: Requirements 4.3**

### Property 18: Image modification options
*For any* UIResource displaying ImageAssets, the resource should include options to regenerate or modify the images
**Validates: Requirements 4.4**

### Property 19: Image generation error handling
*For any* image generation failure, the system should return an error response with alternative options rather than throwing an exception
**Validates: Requirements 4.5**

### Property 20: Mixed media combination
*For any* MixedMediaAsset generated, the asset should contain both image URL and overlay text properties
**Validates: Requirements 5.1**

### Property 21: Mixed media UIResource
*For any* generated MixedMediaAsset, the system should return a valid UIResource displaying the composite
**Validates: Requirements 5.3**

### Property 22: Independent editing for mixed media
*For any* UIResource displaying MixedMediaAsset, the resource should provide separate editing controls for text and image components
**Validates: Requirements 5.4**

### Property 23: Separate assets for non-mixed-media platforms
*For any* platform that does not support mixed media, the system should generate separate AdCopy and ImageAsset objects rather than a MixedMediaAsset
**Validates: Requirements 5.5**

### Property 24: Conversational response format
*For any* system response, the response should be formatted as a valid chat message
**Validates: Requirements 6.3**

### Property 25: UIResource embedding in chat
*For any* structured data or Creative Asset presented, the system should embed it as a UIResource within the chat response
**Validates: Requirements 6.4**

### Property 26: Campaign persistence round-trip
*For any* CampaignParameters stored in the database, retrieving the campaign by ID should return equivalent parameters
**Validates: Requirements 7.1**

### Property 27: Asset persistence
*For any* CreativeAsset stored in the database, the asset should be retrievable by campaign ID
**Validates: Requirements 7.2**

### Property 28: Campaign history retrieval
*For any* advertiser ID with stored campaigns, retrieving campaign history should return all campaigns associated with that advertiser
**Validates: Requirements 7.3**

### Property 29: Advertiser association
*For any* campaign stored with an advertiser ID, the retrieved campaign should maintain the same advertiser ID
**Validates: Requirements 7.4**

### Property 30: Database failure graceful degradation
*For any* database connection failure, the system should return a notification response and continue operating rather than crashing
**Validates: Requirements 7.5**

### Property 31: Budget validation
*For any* CampaignParameters with budget below the platform minimum, the validation should fail and return an error
**Validates: Requirements 8.1**

### Property 32: Minimum budget messaging
*For any* failed budget validation, the error response should include the minimum budget requirement for the specified platform
**Validates: Requirements 8.2**

### Property 33: Platform compatibility warnings
*For any* platform incompatible with the target audience demographics, the system should return a warning with alternative platform suggestions
**Validates: Requirements 8.3**

### Property 34: KPI expectation adjustment
*For any* KPI metrics that are unrealistic for the given budget, the system should return adjusted expectations
**Validates: Requirements 8.4**

## Error Handling

### Error Categories

1. **Input Validation Errors**
   - Missing required fields in campaign requests
   - Invalid budget amounts or currencies
   - Unsupported platforms or formats
   - Response: Return structured error with clarification prompts

2. **Sub-Agent Invocation Errors**
   - Sub-agent timeout or failure
   - Invalid sub-agent responses
   - Response: Retry with fallback agent or return error with manual input option

3. **Database Errors**
   - Connection failures
   - Query timeouts
   - Constraint violations
   - Response: Use temporary in-memory storage and notify user

4. **Creative Generation Errors**
   - Image generation service failures
   - Copy generation timeouts
   - Response: Provide fallback options or manual input alternatives

5. **MCP Protocol Errors**
   - Invalid UIResource format
   - Transport failures
   - Response: Log error and return text-based fallback

### Error Response Format

```typescript
interface ErrorResponse {
  type: 'error';
  error: {
    code: string;
    message: string;
    details?: any;
    suggestions?: string[];
  };
}
```

### Retry Strategy

- Sub-agent calls: 2 retries with exponential backoff (1s, 2s)
- Database operations: 3 retries with 500ms delay
- Image generation: 1 retry, then offer manual upload option

## Testing Strategy

### Unit Testing

The system will use **Vitest** as the testing framework for TypeScript. Unit tests will cover:

- **Parameter extraction logic**: Test individual extraction functions with various input formats
- **Validation functions**: Test budget validation, platform compatibility checks, KPI validation
- **UIResource creation**: Test that createUIResource generates valid objects
- **Database operations**: Test CRUD operations with mock database
- **Error handling**: Test error response formatting and fallback behaviors

Example unit tests:
- Test that extractBudget("$5,000 budget") returns { amount: 5000, currency: "USD" }
- Test that validatePlatformBudget("TikTok", 100) returns validation error
- Test that createParameterDisplay generates UIResource with correct mimeType

### Property-Based Testing

The system will use **fast-check** as the property-based testing library for TypeScript. Each property-based test will run a minimum of 100 iterations.

Property-based tests will verify the correctness properties defined above. Each test will be tagged with the format: **Feature: feedmob-adpilot-mcp, Property {number}: {property_text}**

Key property tests:
- **Property 1**: Generate random text inputs, verify acceptance without errors
- **Property 8**: Generate random CampaignParameters, verify UIResource has valid uri
- **Property 26**: Generate random CampaignParameters, store and retrieve, verify equivalence (round-trip)
- **Property 31**: Generate random budget/platform combinations, verify validation logic

Example property test structure:
```typescript
import fc from 'fast-check';

// Feature: feedmob-adpilot-mcp, Property 26: Campaign persistence round-trip
test('stored campaigns can be retrieved with equivalent data', async () => {
  await fc.assert(
    fc.asyncProperty(
      campaignParametersArbitrary(),
      async (params) => {
        const campaignId = await db.saveCampaign('test-advertiser', params);
        const retrieved = await db.getCampaign(campaignId);
        expect(retrieved).toMatchObject(params);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Testing

Integration tests will verify:
- End-to-end MCP tool invocation flow
- Sub-agent orchestration with real claude-agent-sdk
- Database integration with test PostgreSQL instance
- UIResource rendering in test MCP client

### Test Data Generators

For property-based testing, we'll create custom generators:
- `campaignParametersArbitrary()`: Generates valid CampaignParameters
- `campaignRequestArbitrary()`: Generates natural language campaign requests
- `budgetArbitrary()`: Generates budget objects with various amounts and currencies
- `platformArbitrary()`: Generates platform specifications

## Deployment Considerations

### Environment Configuration

```typescript
interface EnvironmentConfig {
  // Server configuration
  PORT: number;
  HOST: string;
  
  // Database configuration
  DATABASE_URL: string;
  DATABASE_POOL_SIZE: number;
  
  // Google OAuth configuration
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;
  
  // Claude API configuration
  ANTHROPIC_API_KEY: string;
  CLAUDE_MODEL: string;
  
  // Image generation service
  IMAGE_SERVICE_URL?: string;
  IMAGE_SERVICE_API_KEY?: string;
  
  // MCP configuration
  MCP_SERVER_NAME: string;
  MCP_SERVER_VERSION: string;
}
```

### Dependencies

**Core Dependencies:**
- `@modelcontextprotocol/sdk`: MCP protocol implementation
- `@mcp-ui/server`: UI resource creation
- `@anthropic-ai/claude-agent-sdk`: Sub-agent orchestration
- `pg`: PostgreSQL client
- `express`: HTTP server
- `cors`: CORS middleware
- `passport`: Authentication middleware
- `passport-google-oauth20`: Google OAuth strategy

**Development Dependencies:**
- `typescript`: Type checking
- `vitest`: Unit testing
- `fast-check`: Property-based testing
- `@types/node`: Node.js type definitions
- `@types/pg`: PostgreSQL type definitions

### Database Setup

```sql
-- Initialize database
CREATE DATABASE feedmob_adpilot;

-- Run migrations
\i migrations/001_create_users_table.sql
\i migrations/002_create_campaigns_table.sql
\i migrations/003_create_creative_assets_table.sql
\i migrations/004_create_indexes.sql
```

### MCP Server Registration

The server will be registered in the MCP client's configuration:

```json
{
  "mcpServers": {
    "feedmob-adpilot": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://localhost/feedmob_adpilot",
        "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}"
      }
    }
  }
}
```
