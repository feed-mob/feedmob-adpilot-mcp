---
name: generate-ad-images
description: Generate two distinct, AI-powered image variations for advertising campaigns using Google Gemini's image generation capabilities. This skill should be used when creating visual assets for ads based on campaign parameters and research insights. Each variation should have a different visual approach, composition, or style tailored to the target platform and audience.
---

# Generate Ad Images

## Overview

Generate two distinct image variations for advertising campaigns using Google Gemini's image generation API. Each variation should be visually distinct, platform-optimized, and aligned with campaign goals and creative direction.

## When to Use This Skill

Use this skill when:
- Creating visual assets for advertising campaigns
- Generating multiple image options for A/B testing
- Developing platform-specific ad visuals
- Producing audience-tailored advertising images
- Creating images that align with research insights and creative direction

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

### Step 2: Determine Platform-Specific Dimensions

Select appropriate image dimensions based on the platform:

**TikTok**: 1080x1920 (9:16 vertical)
**Instagram Feed**: 1080x1080 (1:1 square)
**Instagram Story**: 1080x1920 (9:16 vertical)
**Facebook Feed**: 1200x628 (1.91:1 landscape)
**Facebook Story**: 1080x1920 (9:16 vertical)
**LinkedIn**: 1200x627 (1.91:1 landscape)

If no platform is specified, default to 1080x1080 (square format).

### Step 3: Generate Image Prompt for Variation A

Create a detailed image generation prompt that includes:

**Visual Elements**:
- Product or service representation
- Target audience representation (if appropriate)
- Brand colors or style (if specified in creative direction)
- Platform-appropriate composition

**Style and Tone**:
- Match the creative direction (energetic, professional, warm, playful, etc.)
- Consider audience preferences from research
- Align with platform best practices

**Technical Requirements**:
- Specify dimensions
- Specify style (photorealistic, illustration, 3D render, etc.)
- Avoid text in the image (text will be overlaid later)

**Example Prompt**:
```
Create a vibrant, energetic fitness image for TikTok (1080x1920 vertical). 
Show a diverse group of women aged 25-35 doing a quick workout in a modern, 
bright setting. Use warm, motivating colors. Photorealistic style. 
No text overlays. Focus on movement and energy.
```

### Step 4: Execute Python Script for Variation A

Call the `generate_image.py` script with the prompt:

```python
python scripts/generate_image.py --prompt "[your prompt]" --variation "A"
```

The script will:
1. Connect to Google Gemini API
2. Generate the image
3. Return JSON with base64-encoded image data and mime type

### Step 5: Generate Image Prompt for Variation B

Create a DISTINCT prompt with a different visual approach:

**Requirements**:
- Different composition or angle
- Alternative visual style or mood
- Different focus or emphasis
- Same platform dimensions and technical specs

**Ensure distinctiveness**:
- Variation B should NOT be a minor variation of A
- Use a different visual concept or approach
- Provide genuine alternative for A/B testing

**Example Prompt for Variation B**:
```
Create a calm, aspirational fitness image for TikTok (1080x1920 vertical).
Show a single woman aged 25-35 in a peaceful home setting doing yoga at sunrise.
Use soft, natural lighting and pastel colors. Photorealistic style.
No text overlays. Focus on tranquility and self-care.
```

### Step 6: Execute Python Script for Variation B

Call the `generate_image.py` script with the second prompt:

```python
python scripts/generate_image.py --prompt "[your prompt]" --variation "B"
```

### Step 7: Determine Recommendation

Analyze both variations and recommend one:
- Consider campaign KPI alignment
- Evaluate platform best practices
- Assess audience appeal based on insights
- Provide clear rationale for recommendation

### Step 8: Return Structured Output

Return a JSON object with this structure:

```json
{
  "generated_at": "2024-01-15T10:30:00Z",
  "campaign_name": "Campaign name from parameters or null",
  "platform": "tiktok",
  "target_audience": "women aged 25-35",
  "variations": [
    {
      "variation_id": "A",
      "image_data": "base64_encoded_image_data...",
      "mime_type": "image/png",
      "prompt_used": "Create a vibrant, energetic fitness image...",
      "visual_approach": "Energetic group workout scene with diverse women, bright modern setting, warm motivating colors",
      "dimensions": {
        "width": 1080,
        "height": 1920
      }
    },
    {
      "variation_id": "B",
      "image_data": "base64_encoded_image_data...",
      "mime_type": "image/png",
      "prompt_used": "Create a calm, aspirational fitness image...",
      "visual_approach": "Peaceful solo yoga at sunrise, home setting, soft natural lighting, pastel colors",
      "dimensions": {
        "width": 1080,
        "height": 1920
      }
    }
  ],
  "recommended_variation": "A",
  "recommendation_rationale": "Variation A is recommended because the energetic group setting aligns better with TikTok's community-driven platform culture and the campaign's app install KPI. The vibrant colors and movement will capture attention in the fast-scrolling TikTok feed."
}
```

## Image Generation Guidelines

### Platform Optimization

**TikTok**:
- Vertical format (9:16)
- Bold, eye-catching visuals
- Movement and energy
- Authentic, relatable scenes
- Bright, vibrant colors

**Instagram Feed**:
- Square format (1:1)
- Aesthetic, polished visuals
- Lifestyle-oriented scenes
- Cohesive color palette
- High-quality, professional look

**Instagram Story**:
- Vertical format (9:16)
- Immersive, full-screen visuals
- Personal, behind-the-scenes feel
- Interactive elements (space for stickers)

**Facebook Feed**:
- Landscape format (1.91:1)
- Clear, easy-to-understand visuals
- Diverse audience appeal
- Informative scenes
- Balanced composition

**LinkedIn**:
- Landscape format (1.91:1)
- Professional, business-oriented
- Clean, modern aesthetic
- Industry-relevant imagery
- Credibility and trust

### Audience Tailoring

- **Demographics**: Adjust visual elements based on age, gender, location
- **Psychographics**: Match imagery to values, interests, lifestyle
- **Behaviors**: Show relevant use cases or scenarios
- **Preferences**: Incorporate style preferences from research

### Creative Direction Alignment

Match the specified tone and style:
- **Energetic and motivating**: Dynamic poses, bright colors, action shots
- **Professional and trustworthy**: Clean lines, business settings, confident subjects
- **Warm and inviting**: Soft lighting, friendly faces, comfortable environments
- **Fun and playful**: Vibrant colors, unexpected angles, joyful expressions

### Technical Best Practices

- **No text in images**: Text will be overlaid later in mixed media generation
- **Leave space for text**: Consider where headlines and CTAs will be placed
- **High resolution**: Generate at platform-specific dimensions
- **Appropriate file format**: PNG for graphics, JPEG for photos
- **Avoid copyrighted elements**: No brand logos, trademarked characters, or recognizable people

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

**Variation A Prompt**:
```
Create a vibrant, energetic fitness image for TikTok (1080x1920 vertical).
Show a diverse group of Southeast Asian women aged 25-35 doing a quick HIIT workout
in a modern, bright gym setting. Use warm, motivating colors (orange, yellow, pink).
Photorealistic style. Dynamic poses showing movement and energy. No text overlays.
Leave space at top and bottom for text. Focus on joy and community.
```

**Variation B Prompt**:
```
Create an aspirational fitness image for TikTok (1080x1920 vertical).
Show a single Southeast Asian woman aged 25-35 checking her fitness app on her phone
after a workout, smiling with satisfaction. Modern home setting with natural light.
Use soft, warm colors. Photorealistic style. Relaxed, confident pose. No text overlays.
Leave space at top and bottom for text. Focus on achievement and self-care.
```

**Output**:
```json
{
  "generated_at": "2024-01-15T10:30:00Z",
  "campaign_name": null,
  "platform": "tiktok",
  "target_audience": "women aged 25-35",
  "variations": [
    {
      "variation_id": "A",
      "image_data": "[base64_encoded_image]",
      "mime_type": "image/png",
      "prompt_used": "Create a vibrant, energetic fitness image...",
      "visual_approach": "Energetic group HIIT workout with diverse Southeast Asian women, bright modern gym, warm motivating colors, dynamic movement",
      "dimensions": { "width": 1080, "height": 1920 }
    },
    {
      "variation_id": "B",
      "image_data": "[base64_encoded_image]",
      "mime_type": "image/png",
      "prompt_used": "Create an aspirational fitness image...",
      "visual_approach": "Solo achievement moment with woman checking fitness app, modern home setting, soft natural lighting, satisfied expression",
      "dimensions": { "width": 1080, "height": 1920 }
    }
  ],
  "recommended_variation": "A",
  "recommendation_rationale": "Variation A is recommended because the energetic group setting aligns better with TikTok's community-driven platform culture and the campaign's app install KPI. The vibrant colors and movement will capture attention in the fast-scrolling TikTok feed, and the diverse representation resonates with the Southeast Asian target audience."
}
```

### Example 2: Coffee Brand - Instagram Feed

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

**Variation A Prompt**:
```
Create a warm, inviting coffee image for Instagram Feed (1080x1080 square).
Show a beautifully styled coffee cup on a rustic wooden table with coffee beans
scattered around. Morning sunlight streaming through a window. Use warm earth tones
(brown, cream, gold). Photorealistic style. Overhead angle. No text overlays.
Leave space at top for headline. Focus on craftsmanship and quality.
```

**Variation B Prompt**:
```
Create a lifestyle coffee image for Instagram Feed (1080x1080 square).
Show hands holding a coffee cup in a cozy home setting with a book and plants nearby.
Soft, natural lighting. Use warm, muted colors (sage green, cream, terracotta).
Photorealistic style. Close-up, intimate angle. No text overlays.
Leave space at top for headline. Focus on ritual and comfort.
```

**Output**:
```json
{
  "generated_at": "2024-01-15T10:35:00Z",
  "campaign_name": null,
  "platform": "instagram_feed",
  "target_audience": "coffee enthusiasts aged 25-45",
  "variations": [
    {
      "variation_id": "A",
      "image_data": "[base64_encoded_image]",
      "mime_type": "image/jpeg",
      "prompt_used": "Create a warm, inviting coffee image...",
      "visual_approach": "Styled product shot with coffee cup and beans on rustic wood, morning sunlight, warm earth tones, overhead angle emphasizing craftsmanship",
      "dimensions": { "width": 1080, "height": 1080 }
    },
    {
      "variation_id": "B",
      "image_data": "[base64_encoded_image]",
      "mime_type": "image/jpeg",
      "prompt_used": "Create a lifestyle coffee image...",
      "visual_approach": "Lifestyle moment with hands holding cup in cozy home, book and plants, soft natural light, warm muted colors, intimate close-up emphasizing ritual",
      "dimensions": { "width": 1080, "height": 1080 }
    }
  ],
  "recommended_variation": "B",
  "recommendation_rationale": "Variation B is recommended because the lifestyle approach resonates better with Instagram's visual storytelling culture and the conversion KPI. The intimate, relatable scene creates an emotional connection that encourages purchase behavior, and the cozy home setting aligns with the 'morning ritual' positioning that drives premium coffee sales."
}
```

## Important Notes

- Always return valid JSON matching the AdImagesResult schema
- Generate exactly two variations with distinct visual approaches
- Ensure images are platform-optimized with correct dimensions
- Leave space for text overlays (headlines, body copy, CTAs)
- Avoid text, logos, or copyrighted elements in generated images
- Match the tone and style to the creative direction
- Provide clear rationale for the recommended variation
- Use the Python script for actual image generation via Gemini API
- Ensure variation B is genuinely different from variation A, not just minor changes
- Consider audience insights and platform best practices in visual approach
