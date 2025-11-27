---
name: generate-ad-copy
description: Generate two distinct, creative, and copyright-compliant ad copy variations based on campaign parameters and research insights. This skill should be used when creating advertising text content including headlines, body copy, and calls-to-action. Each variation should be original, engaging, and tailored to the specified platform and target audience.
---

# Generate Ad Copy

## Overview

Generate two distinct ad copy variations with headlines, body copy, and calls-to-action based on campaign parameters and optional research insights. Each variation should be original, copyright-compliant, and optimized for the target platform and audience.

## When to Use This Skill

Use this skill when:
- Creating advertising text content for campaigns
- Generating multiple copy options for A/B testing
- Developing platform-specific ad messaging
- Producing audience-tailored advertising copy
- Creating copyright-compliant original content

## Workflow

When given campaign parameters and optional research insights, follow this workflow:

### Step 1: Analyze Campaign Context

Review the provided campaign parameters:
- **product_or_service**: What is being advertised
- **target_audience**: Who the ad is targeting
- **platform**: Where the ad will appear (TikTok, Facebook, Instagram, etc.)
- **ad_format**: Type of ad (video ad, carousel, static image, etc.)
- **creative_direction**: Tone and style requirements
- **kpi**: Success metrics (installs, conversions, engagement, etc.)
- **other_details**: Additional context

If campaign research is provided, incorporate:
- **Audience insights**: Demographics, behaviors, preferences
- **Platform strategy**: Trends, best practices, optimization tips
- **Creative direction**: Content types, tone and style recommendations

### Step 2: Generate Variation A

Create the first ad copy variation:

**Headline** (5-15 words):
- Attention-grabbing and benefit-focused
- Platform-appropriate length
- Aligned with creative direction

**Body Copy** (20-100 words depending on platform):
- Expand on the headline's promise
- Address target audience pain points or desires
- Include key product/service benefits
- Match the specified tone and style
- Platform-optimized length

**Call-to-Action (CTA)** (2-5 words):
- Clear, action-oriented
- Aligned with campaign KPI
- Platform-appropriate

**Tone**: Document the tone used (e.g., "energetic and motivating", "professional and trustworthy")

### Step 3: Generate Variation B

Create a second DISTINCT ad copy variation:

**Requirements**:
- Different messaging approach than Variation A
- Alternative headline angle or benefit focus
- Different body copy structure or emphasis
- May use different CTA phrasing
- Same tone and platform optimization as Variation A

**Ensure distinctiveness**:
- Variation B should NOT be a minor rewording of Variation A
- Use a different hook, angle, or benefit emphasis
- Provide genuine alternative messaging for A/B testing

### Step 4: Determine Recommendation

Analyze both variations and recommend one:
- Consider campaign KPI alignment
- Evaluate platform best practices
- Assess audience appeal based on insights
- Provide clear rationale for recommendation

### Step 5: Return Structured Output

Return a JSON object with this structure:

```json
{
  "generated_at": "2024-01-15T10:30:00Z",
  "campaign_name": "Campaign name from parameters or null",
  "platform": "Platform from parameters or null",
  "target_audience": "Target audience from parameters or null",
  "variations": [
    {
      "variation_id": "A",
      "headline": "Compelling headline for variation A",
      "body_copy": "Engaging body copy that expands on the headline and addresses audience needs...",
      "cta": "Action-Oriented CTA",
      "tone": "energetic and motivating",
      "platform_optimized": true
    },
    {
      "variation_id": "B",
      "headline": "Alternative headline with different angle",
      "body_copy": "Different body copy approach that provides genuine alternative messaging...",
      "cta": "Alternative CTA",
      "tone": "energetic and motivating",
      "platform_optimized": true
    }
  ],
  "recommended_variation": "A",
  "recommendation_rationale": "Variation A is recommended because it directly addresses the primary pain point identified in audience research and aligns better with the campaign's app install KPI through its action-oriented messaging.",
  "disclaimer": "This ad copy is original content generated for your campaign. All copy is copyright-compliant and does not use trademarked phrases. Please review and adapt as needed for your brand voice and legal requirements."
}
```

## Generation Guidelines

### Copyright Compliance

- **Generate original content**: Do not copy existing ad copy from competitors or other sources
- **Avoid trademarked phrases**: Unless explicitly provided in campaign parameters
- **Create unique messaging**: Use original language and creative approaches
- **Respect intellectual property**: Do not reference specific competitor campaigns or slogans

### Platform Optimization

**TikTok**:
- Short, punchy headlines (5-8 words)
- Concise body copy (20-40 words)
- Casual, energetic tone
- CTAs: "Download Now", "Try It Free", "Learn More"

**Instagram**:
- Visual-focused headlines (6-10 words)
- Medium body copy (30-60 words)
- Lifestyle-oriented messaging
- CTAs: "Shop Now", "Swipe Up", "Discover More"

**Facebook**:
- Benefit-driven headlines (8-12 words)
- Longer body copy (50-100 words)
- Conversational tone
- CTAs: "Learn More", "Sign Up", "Get Started"

**LinkedIn**:
- Professional headlines (8-12 words)
- Value-focused body copy (40-80 words)
- Business-oriented tone
- CTAs: "Request Demo", "Download Guide", "Contact Sales"

### Audience Tailoring

- **Demographics**: Adjust language complexity and references based on age, education
- **Psychographics**: Match messaging to values, interests, lifestyle
- **Pain points**: Address specific challenges or desires
- **Benefits focus**: Emphasize benefits most relevant to audience segment

### Tone and Style

Match the specified creative direction:
- **Energetic and motivating**: Active verbs, exclamation points, empowering language
- **Professional and trustworthy**: Formal language, data-driven, credibility indicators
- **Warm and inviting**: Friendly tone, inclusive language, emotional connection
- **Fun and playful**: Humor, wordplay, casual language, emojis (platform-appropriate)

## Examples

### Example 1: Fitness App - TikTok

**Input**:
```json
{
  "product_or_service": "fitness app",
  "target_audience": "women aged 25-35",
  "platform": "TikTok",
  "ad_format": "video ad",
  "creative_direction": "energetic and motivating",
  "kpi": "app installs",
  "geography": "Southeast Asia"
}
```

**Output**:
```json
{
  "generated_at": "2024-01-15T10:30:00Z",
  "campaign_name": null,
  "platform": "TikTok",
  "target_audience": "women aged 25-35",
  "variations": [
    {
      "variation_id": "A",
      "headline": "Transform Your Body in Just 15 Minutes!",
      "body_copy": "Busy schedule? No problem! Get fit with quick, effective workouts designed for real women with real lives. Join thousands crushing their fitness goals. Start your journey today!",
      "cta": "Download Free",
      "tone": "energetic and motivating",
      "platform_optimized": true
    },
    {
      "variation_id": "B",
      "headline": "Your Personal Trainer, Right in Your Pocket",
      "body_copy": "No gym? No equipment? No excuses! Access hundreds of workouts you can do anywhere, anytime. Personalized plans that fit YOUR lifestyle. Ready to feel amazing?",
      "cta": "Start Free Trial",
      "tone": "energetic and motivating",
      "platform_optimized": true
    }
  ],
  "recommended_variation": "A",
  "recommendation_rationale": "Variation A is recommended because it leads with a specific, tangible benefit (15 minutes) that addresses the time-constrained lifestyle of the target audience. The social proof element ('thousands crushing their fitness goals') aligns well with TikTok's community-driven platform culture.",
  "disclaimer": "This ad copy is original content generated for your campaign. All copy is copyright-compliant and does not use trademarked phrases. Please review and adapt as needed for your brand voice and legal requirements."
}
```

### Example 2: Coffee Brand - Instagram

**Input**:
```json
{
  "product_or_service": "organic coffee brand",
  "target_audience": "coffee enthusiasts aged 25-45",
  "platform": "Instagram",
  "ad_format": "carousel ad",
  "creative_direction": "warm and inviting",
  "kpi": "conversions",
  "geography": "United States"
}
```

**Output**:
```json
{
  "generated_at": "2024-01-15T10:35:00Z",
  "campaign_name": null,
  "platform": "Instagram",
  "target_audience": "coffee enthusiasts aged 25-45",
  "variations": [
    {
      "variation_id": "A",
      "headline": "Savor the Difference: 100% Organic, Ethically Sourced",
      "body_copy": "Every cup tells a story of sustainable farming and passionate craftsmanship. Our single-origin beans are carefully roasted to bring out rich, complex flavors that coffee lovers crave. Taste the quality, feel the warmth, support the planet.",
      "cta": "Shop Collection",
      "tone": "warm and inviting",
      "platform_optimized": true
    },
    {
      "variation_id": "B",
      "headline": "Your Morning Ritual, Elevated",
      "body_copy": "Transform your daily coffee into a moment of pure indulgence. Hand-selected organic beans, expertly roasted for exceptional flavor. Join our community of conscious coffee lovers who refuse to compromise on taste or values.",
      "cta": "Discover More",
      "tone": "warm and inviting",
      "platform_optimized": true
    }
  ],
  "recommended_variation": "B",
  "recommendation_rationale": "Variation B is recommended because it emphasizes the experiential and lifestyle aspects that resonate strongly on Instagram's visual platform. The 'morning ritual' angle creates an emotional connection and positions the product as part of a desirable lifestyle, which typically drives higher conversion rates for premium products on Instagram.",
  "disclaimer": "This ad copy is original content generated for your campaign. All copy is copyright-compliant and does not use trademarked phrases. Please review and adapt as needed for your brand voice and legal requirements."
}
```

### Example 3: SaaS Platform - LinkedIn

**Input**:
```json
{
  "product_or_service": "project management SaaS",
  "target_audience": "small business owners and team leaders",
  "platform": "LinkedIn",
  "ad_format": "sponsored content",
  "creative_direction": "professional and trustworthy",
  "kpi": "lead generation",
  "geography": "Global"
}
```

**Output**:
```json
{
  "generated_at": "2024-01-15T10:40:00Z",
  "campaign_name": null,
  "platform": "LinkedIn",
  "target_audience": "small business owners and team leaders",
  "variations": [
    {
      "variation_id": "A",
      "headline": "Streamline Projects, Boost Team Productivity by 40%",
      "body_copy": "Managing multiple projects shouldn't mean juggling multiple tools. Our integrated platform brings task management, team collaboration, and progress tracking into one intuitive workspace. Trusted by over 10,000 teams worldwide to deliver projects on time and under budget.",
      "cta": "Request Demo",
      "tone": "professional and trustworthy",
      "platform_optimized": true
    },
    {
      "variation_id": "B",
      "headline": "The Project Management Solution Built for Growing Teams",
      "body_copy": "Scale your operations without the chaos. Our platform adapts to your workflow, not the other way around. Real-time visibility, seamless collaboration, and powerful reporting help you make data-driven decisions. See why teams choose us over enterprise alternatives.",
      "cta": "Start Free Trial",
      "tone": "professional and trustworthy",
      "platform_optimized": true
    }
  ],
  "recommended_variation": "A",
  "recommendation_rationale": "Variation A is recommended for lead generation because it leads with a specific, quantifiable benefit (40% productivity boost) that immediately captures attention in LinkedIn's professional feed. The social proof element (10,000 teams) builds credibility, and the focus on ROI (on time and under budget) addresses the primary concern of small business owners.",
  "disclaimer": "This ad copy is original content generated for your campaign. All copy is copyright-compliant and does not use trademarked phrases. Please review and adapt as needed for your brand voice and legal requirements."
}
```

## Important Notes

- Always return valid JSON matching the AdCopyResult schema
- Generate exactly two variations with distinct messaging approaches
- Ensure all copy is original and copyright-compliant
- Tailor copy to the specified platform's best practices
- Match the tone and style to the creative direction
- Provide clear rationale for the recommended variation
- Include the copyright compliance disclaimer
- Keep headlines concise and benefit-focused
- Make CTAs action-oriented and KPI-aligned
- Ensure variation B is genuinely different from variation A, not just minor rewording

