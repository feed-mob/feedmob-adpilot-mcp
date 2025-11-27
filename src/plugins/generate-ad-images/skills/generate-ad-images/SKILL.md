---
name: generate-ad-images
description: Generate two distinct, AI-powered image variations for advertising campaigns using Google Gemini's image generation capabilities. Use when creating visual assets for ads based on campaign parameters and research insights. Triggers on requests to generate ad images, create visual assets, produce image variations for A/B testing, or develop platform-specific ad visuals.
---

# Generate Ad Images

Generate two distinct image variations for advertising campaigns using Google Gemini API. Each variation should be visually distinct, platform-optimized, and aligned with campaign goals.

## Workflow

### Step 1: Analyze Campaign Context

Extract from provided parameters:
- **product_or_service**: What is being advertised
- **target_audience**: Who the ad targets
- **platform**: Where ad appears (TikTok, Facebook, Instagram, LinkedIn)
- **creative_direction**: Tone and style requirements
- **kpi**: Success metrics

If research insights provided, incorporate audience behaviors, platform trends, and creative recommendations.

### Step 2: Determine Dimensions

Select dimensions based on platform. See [references/platform-guidelines.md](references/platform-guidelines.md) for full details.

| Platform | Dimensions | Aspect Ratio |
|----------|------------|--------------|
| TikTok | 1080×1920 | 9:16 |
| Instagram Feed | 1080×1080 | 1:1 |
| Instagram Story | 1080×1920 | 9:16 |
| Facebook Feed | 1200×628 | 1.91:1 |
| LinkedIn | 1200×627 | 1.91:1 |

Default to 1080×1080 if no platform specified.

### Step 3: Create Variation A Prompt

Build a detailed image generation prompt including:
- Product/service representation
- Target audience representation (if appropriate)
- Platform-appropriate composition
- Style matching creative direction
- Dimensions specification
- "No text overlays" instruction
- "Leave space for text" instruction

### Step 4: Execute Script for Variation A

Run the Python script:

```bash
python scripts/generate_image.py --prompt "[your prompt]" --variation "A" --aspect-ratio "[ratio]"
```

Aspect ratio options: `1:1`, `3:4`, `4:3`, `9:16`, `16:9`

The script returns JSON with `image_data` (base64), `mime_type`, and `variation_id`.

### Step 5: Create Variation B Prompt

Create a DISTINCT prompt with different:
- Composition or angle
- Visual style or mood
- Focus or emphasis

Variation B must NOT be a minor variation of A. Provide genuine alternative for A/B testing.

### Step 6: Execute Script for Variation B

```bash
python scripts/generate_image.py --prompt "[your prompt]" --variation "B" --aspect-ratio "[ratio]"
```

### Step 7: Determine Recommendation

Analyze both variations and recommend one based on:
- Campaign KPI alignment
- Platform best practices
- Audience appeal from insights

### Step 8: Return JSON Output

**CRITICAL**: Return a raw JSON object (NOT in a code block). The output must be valid JSON that can be parsed directly.

Return this exact structure:

{
  "generated_at": "ISO timestamp",
  "campaign_name": "name or null",
  "platform": "platform name",
  "target_audience": "audience description",
  "variations": [
    {
      "variation_id": "A",
      "image_url": "URL from script output",
      "thumbnail_url": "thumbnail URL from script or null",
      "file_id": "file ID from script or null",
      "mime_type": "image/png",
      "prompt_used": "prompt used",
      "visual_approach": "description of approach",
      "dimensions": { "width": 1080, "height": 1920 }
    },
    {
      "variation_id": "B",
      "image_url": "URL from script output",
      "thumbnail_url": "thumbnail URL from script or null",
      "file_id": "file ID from script or null",
      "mime_type": "image/png",
      "prompt_used": "prompt used",
      "visual_approach": "description of approach",
      "dimensions": { "width": 1080, "height": 1920 }
    }
  ],
  "recommended_variation": "A or B",
  "recommendation_rationale": "why this variation is recommended"
}

## References

- **Platform Guidelines**: See [references/platform-guidelines.md](references/platform-guidelines.md) for platform-specific dimensions, optimization tips, and creative direction alignment
- **Examples**: See [references/examples.md](references/examples.md) for complete input/output examples

## Important Notes

- Return raw JSON only, not wrapped in code blocks
- Generate exactly two variations with distinct visual approaches
- Ensure images are platform-optimized with correct dimensions
- Leave space for text overlays (headlines, CTAs)
- Avoid text, logos, or copyrighted elements in generated images
- Match tone and style to creative direction
- Provide clear rationale for recommendation
- Ensure variation B is genuinely different from A
