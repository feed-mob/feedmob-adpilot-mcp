# Conduct Ad Research Tool - Usage Examples

## Overview

The `conductAdResearch` tool conducts comprehensive advertising research based on confirmed campaign parameters. It uses web search tools (DuckDuckGo or Tavily) to gather insights and generates a structured campaign report.

## Tool Signature

```typescript
{
  name: 'conductAdResearch',
  description: 'Conduct comprehensive advertising research based on confirmed campaign parameters',
  parameters: {
    campaignParameters: CampaignParameters
  }
}
```

## Example 1: Complete Campaign Parameters

### Input

```json
{
  "campaignParameters": {
    "product_or_service": "fitness app",
    "product_or_service_url": "https://myfitnessapp.com",
    "campaign_name": "Southeast Asia Launch",
    "target_audience": "women aged 25-35",
    "geography": "Southeast Asia",
    "ad_format": "video ad",
    "budget": "$5,000",
    "platform": "TikTok",
    "kpi": "app installs",
    "time_period": "2 weeks",
    "creative_direction": "energetic and motivating",
    "other_details": null
  }
}
```

### Expected Output

The tool will:
1. Use web search to research:
   - Southeast Asian women 25-35 demographics and fitness app usage
   - TikTok advertising trends and video ad best practices
   - Competitor fitness app campaigns
   - App install campaign benchmarks (CTR, CPI, conversion rates)
   - Successful TikTok fitness ad examples

2. Generate a comprehensive report with:
   - **Executive Summary**: Key findings and recommendations
   - **Audience Insights**: Demographics, behaviors, preferences, engagement patterns
   - **Platform Strategy**: TikTok-specific trends, best practices, optimization tips
   - **Creative Direction**: Content types, format recommendations, tone/style, examples
   - **Budget Allocation**: Distribution across platforms (if multiple), optimization suggestions
   - **Performance Metrics**: Primary KPIs, industry benchmarks, tracking recommendations
   - **Implementation Timeline**: Phased rollout plan with activities
   - **Sources**: Cited research sources with URLs
   - **Disclaimer**: Copyright compliance notice

3. Display an interactive UI with collapsible sections

### Sample Response Text

```
Campaign Research Report Generated:

Campaign: Southeast Asia Launch
Generated: 1/15/2024, 10:30:00 AM

Executive Summary:
TikTok presents a strong opportunity for fitness app launches in Southeast Asia, 
with women aged 25-35 representing a highly engaged demographic on the platform...

Key Findings:
1. Southeast Asian women 25-35 spend average 52 minutes daily on TikTok
2. Fitness content has 3.2x higher engagement than platform average
3. User-generated content style performs 40% better than polished ads
4. Peak engagement times: 7-9 AM and 6-8 PM local time
5. Vertical video format with captions increases completion rate by 35%

Recommendations:
1. Focus on authentic, user-generated style content featuring real users
2. Leverage trending fitness challenges and hashtags (#FitTok, #WorkoutMotivation)
3. Include clear app install CTA in first 3 seconds of video
4. Test multiple creative variations with A/B testing
5. Allocate 60% of budget to top-performing creatives after first week

Platform Strategy: 1 platform(s) analyzed
Budget Allocation: 1 platform(s)
Performance Metrics: 3 primary KPIs
Implementation Timeline: 3 phase(s)
Sources: 8 source(s) cited

The complete interactive report is displayed above with detailed insights...
```

## Example 2: Partial Campaign Parameters

### Input

```json
{
  "campaignParameters": {
    "product_or_service": "organic coffee brand",
    "product_or_service_url": "https://organicbrew.com",
    "campaign_name": null,
    "target_audience": "coffee enthusiasts aged 25-45",
    "geography": null,
    "ad_format": null,
    "budget": "$10,000",
    "platform": "Instagram",
    "kpi": "conversions",
    "time_period": null,
    "creative_direction": "warm and inviting",
    "other_details": null
  }
}
```

### What Happens

The tool will:
1. Note missing parameters (geography, ad_format, time_period, campaign_name)
2. Make reasonable assumptions:
   - Geography: Assume US/North America market
   - Ad format: Recommend multiple Instagram formats (feed, stories, reels)
   - Time period: Suggest 4-week campaign based on budget
3. Conduct research with available information
4. Include assumptions in the report

### Sample Assumptions in Report

```json
{
  "assumptions": [
    "Geography assumed to be United States/North America market based on typical Instagram advertising patterns",
    "Multiple ad formats recommended (feed posts, stories, reels) as no specific format was provided",
    "4-week campaign duration suggested based on $10,000 budget and platform best practices",
    "Campaign name can be determined during creative development phase"
  ]
}
```

## Example 3: Minimal Campaign Parameters

### Input

```json
{
  "campaignParameters": {
    "product_or_service": "SaaS platform",
    "product_or_service_url": "https://saasplatform.com",
    "campaign_name": null,
    "target_audience": null,
    "geography": null,
    "ad_format": null,
    "budget": null,
    "platform": null,
    "kpi": "lead generation",
    "time_period": null,
    "creative_direction": null,
    "other_details": null
  }
}
```

### What Happens

The tool will:
1. Identify this as a B2B SaaS lead generation campaign
2. Make extensive assumptions about:
   - Target audience: B2B decision-makers, IT managers
   - Geography: Global/US market
   - Platforms: LinkedIn, Google Ads (B2B focused)
   - Budget: Provide percentage-based recommendations
   - Ad formats: Multiple formats per platform
3. Provide cross-platform strategy recommendations
4. Include detailed assumptions list

## Example 4: Using with parseAdRequirements

### Workflow

```javascript
// Step 1: Parse natural language requirements
const parseResult = await parseAdRequirements({
  requestText: "Create a TikTok video ad for my fitness app targeting Southeast Asian women aged 25-35 with a $5,000 budget. The goal is to drive app installs with an energetic and motivating tone."
});

// parseResult.parameters contains:
// {
//   product_or_service: "fitness app",
//   target_audience: "Southeast Asian women aged 25-35",
//   geography: "Southeast Asia",
//   platform: "TikTok",
//   ad_format: "video ad",
//   budget: "$5,000",
//   kpi: "app installs",
//   creative_direction: "energetic and motivating",
//   ...
// }

// Step 2: Conduct research with parsed parameters
const researchReport = await conductAdResearch({
  campaignParameters: parseResult.parameters
});

// researchReport contains comprehensive campaign report
```

## Testing with MCP Inspector

### Start the Inspector

```bash
npm run mcp:inspect
```

### Test the Tool

1. Select `conductAdResearch` from the tools list
2. Provide campaign parameters in JSON format
3. Click "Execute"
4. View the interactive research report

### Sample Test Input

```json
{
  "campaignParameters": {
    "product_or_service": "eco-friendly water bottle",
    "product_or_service_url": "https://ecobottle.com",
    "campaign_name": "Summer Hydration Campaign",
    "target_audience": "environmentally conscious millennials",
    "geography": "United States",
    "ad_format": "carousel ad",
    "budget": "$8,000",
    "platform": "Instagram",
    "kpi": "website traffic",
    "time_period": "3 weeks",
    "creative_direction": "fresh, sustainable, lifestyle-focused",
    "other_details": "Emphasize plastic reduction and sustainability"
  }
}
```

## Error Handling

### Validation Error

If invalid parameters are provided:

```json
{
  "campaignParameters": {
    "product_or_service": "",  // Empty string - invalid
    "product_or_service_url": "not-a-url",  // Invalid URL format
    ...
  }
}
```

**Result**: Error UI with validation message

### Search Tool Failure

If web search tools are unavailable or fail:

**Result**: Error UI with search error message and retry option

### Agent Timeout

If research takes too long:

**Result**: Error UI with timeout message and retry option

## Interactive UI Features

The generated report includes:

### Collapsible Sections
- Click section headers to expand/collapse
- Sources section collapsed by default
- All other sections expanded by default

### Action Buttons
- **Generate Ad Copy →**: Proceeds to ad copy generation (calls `generateAdCopy` tool)
- **Export Report**: Exports report (coming soon)

### Visual Elements
- Tables for budget allocation and performance benchmarks
- Tag lists for content types and KPIs
- Timeline phases with numbered indicators
- Clickable source citations

### Dark Mode Support
- Automatically adapts to system theme
- Uses design system CSS variables

## Integration with Other Tools

### Typical Workflow

```
1. parseAdRequirements
   ↓ (campaign parameters)
2. conductAdResearch
   ↓ (research report)
3. generateAdCopy (coming soon)
   ↓ (ad copy variations)
4. generateAdImages (coming soon)
   ↓ (image creatives)
5. generateMixedMedia (coming soon)
```

## Notes

- **Web Search Required**: The tool requires DuckDuckGo or Tavily MCP server to be configured
- **Research Time**: Typically takes 30-60 seconds depending on search complexity
- **Source Citations**: All research findings include source URLs for verification
- **Copyright Compliance**: Report includes disclaimer about copyright and IP considerations
- **Assumptions Transparency**: Missing parameters are clearly noted with assumptions made

## Troubleshooting

### "Plugin not found" Error

**Solution**: Ensure the plugin exists at:
```
src/plugins/conduct-ad-research/skills/conduct-ad-research/SKILL.md
```

### "Search tool unavailable" Error

**Solution**: Configure DuckDuckGo or Tavily MCP server in your MCP configuration

### "No JSON found in agent response" Error

**Solution**: The agent may need more turns. Check the `maxTurns` setting in the agent service (currently set to 20)

## API Reference

### Input Schema

```typescript
interface ConductAdResearchInput {
  campaignParameters: {
    product_or_service: string | null;
    product_or_service_url: string | null;
    campaign_name: string | null;
    target_audience: string | null;
    geography: string | null;
    ad_format: string | null;
    budget: string | null;
    platform: string | null;
    kpi: string | null;
    time_period: string | null;
    creative_direction: string | null;
    other_details: string | null;
  }
}
```

### Output Schema

```typescript
interface CampaignReport {
  generated_at: string;  // ISO datetime
  campaign_name: string | null;
  executive_summary: {
    overview: string;
    key_findings: string[];
    recommendations: string[];
  };
  audience_insights: {
    demographics: string;
    behaviors: string;
    preferences: string;
    engagement_patterns: string;
  };
  platform_strategy: Array<{
    platform: string;
    trends: string;
    best_practices: string;
    optimization_tips: string;
  }>;
  creative_direction: {
    content_types: string[];
    format_recommendations: string;
    tone_and_style: string;
    examples: string[];
  };
  budget_allocation: {
    total_budget: string | null;
    distribution: Array<{
      platform: string;
      percentage: number;
      rationale: string;
    }>;
    optimization_suggestions: string;
  };
  performance_metrics: {
    primary_kpis: string[];
    benchmarks: Array<{
      metric: string;
      industry_average: string;
      target: string;
    }>;
    tracking_recommendations: string;
  };
  implementation_timeline: Array<{
    phase: string;
    duration: string;
    activities: string[];
  }>;
  sources: Array<{
    title: string;
    url: string;
    accessed_at: string;
  }>;
  assumptions: string[];
  disclaimer: string;
}
```
