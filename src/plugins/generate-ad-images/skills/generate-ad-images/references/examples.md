# Image Generation Examples

## Example 1: Fitness App - TikTok

### Input
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

### Variation A Prompt
```
Create a vibrant, energetic fitness image for TikTok (1080x1920 vertical).
Show a diverse group of Southeast Asian women aged 25-35 doing a quick HIIT workout
in a modern, bright gym setting. Use warm, motivating colors (orange, yellow, pink).
Photorealistic style. Dynamic poses showing movement and energy. No text overlays.
Leave space at top and bottom for text. Focus on joy and community.
```

### Variation B Prompt
```
Create an aspirational fitness image for TikTok (1080x1920 vertical).
Show a single Southeast Asian woman aged 25-35 checking her fitness app on her phone
after a workout, smiling with satisfaction. Modern home setting with natural light.
Use soft, warm colors. Photorealistic style. Relaxed, confident pose. No text overlays.
Leave space at top and bottom for text. Focus on achievement and self-care.
```

### Output
```json
{
  "generated_at": "2024-01-15T10:30:00Z",
  "campaign_name": null,
  "platform": "tiktok",
  "target_audience": "women aged 25-35",
  "variations": [
    {
      "variation_id": "A",
      "image_url": "https://ik.imagekit.io/your_id/ad-images/campaign/fitness_A.png",
      "thumbnail_url": "https://ik.imagekit.io/your_id/tr:n-ik_ml_thumbnail/ad-images/campaign/fitness_A.png",
      "file_id": "abc123",
      "mime_type": "image/png",
      "prompt_used": "Create a vibrant, energetic fitness image...",
      "visual_approach": "Energetic group HIIT workout with diverse Southeast Asian women, bright modern gym, warm motivating colors, dynamic movement",
      "dimensions": { "width": 1080, "height": 1920 }
    },
    {
      "variation_id": "B",
      "image_url": "https://ik.imagekit.io/your_id/ad-images/campaign/fitness_B.png",
      "thumbnail_url": "https://ik.imagekit.io/your_id/tr:n-ik_ml_thumbnail/ad-images/campaign/fitness_B.png",
      "file_id": "def456",
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

---

## Example 2: Coffee Brand - Instagram Feed

### Input
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

### Variation A Prompt
```
Create a warm, inviting coffee image for Instagram Feed (1080x1080 square).
Show a beautifully styled coffee cup on a rustic wooden table with coffee beans
scattered around. Morning sunlight streaming through a window. Use warm earth tones
(brown, cream, gold). Photorealistic style. Overhead angle. No text overlays.
Leave space at top for headline. Focus on craftsmanship and quality.
```

### Variation B Prompt
```
Create a lifestyle coffee image for Instagram Feed (1080x1080 square).
Show hands holding a coffee cup in a cozy home setting with a book and plants nearby.
Soft, natural lighting. Use warm, muted colors (sage green, cream, terracotta).
Photorealistic style. Close-up, intimate angle. No text overlays.
Leave space at top for headline. Focus on ritual and comfort.
```

### Output
```json
{
  "generated_at": "2024-01-15T10:35:00Z",
  "campaign_name": null,
  "platform": "instagram_feed",
  "target_audience": "coffee enthusiasts aged 25-45",
  "variations": [
    {
      "variation_id": "A",
      "image_url": "https://ik.imagekit.io/your_id/ad-images/campaign/coffee_A.jpg",
      "thumbnail_url": "https://ik.imagekit.io/your_id/tr:n-ik_ml_thumbnail/ad-images/campaign/coffee_A.jpg",
      "file_id": "ghi789",
      "mime_type": "image/jpeg",
      "prompt_used": "Create a warm, inviting coffee image...",
      "visual_approach": "Styled product shot with coffee cup and beans on rustic wood, morning sunlight, warm earth tones, overhead angle emphasizing craftsmanship",
      "dimensions": { "width": 1080, "height": 1080 }
    },
    {
      "variation_id": "B",
      "image_url": "https://ik.imagekit.io/your_id/ad-images/campaign/coffee_B.jpg",
      "thumbnail_url": "https://ik.imagekit.io/your_id/tr:n-ik_ml_thumbnail/ad-images/campaign/coffee_B.jpg",
      "file_id": "jkl012",
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

---

## Example 3: B2B SaaS - LinkedIn

### Input
```json
{
  "product_or_service": "project management software",
  "target_audience": "project managers and team leads aged 30-50",
  "platform": "LinkedIn",
  "ad_format": "single image ad",
  "creative_direction": "professional and trustworthy",
  "kpi": "demo requests",
  "geography": "Global"
}
```

### Variation A Prompt
```
Create a professional business image for LinkedIn (1200x627 landscape).
Show a diverse team of professionals collaborating around a modern conference table
with laptops and digital displays showing project timelines. Clean, modern office
with natural light. Use professional colors (blue, white, gray). Photorealistic style.
Wide angle showing teamwork. No text overlays. Leave space on left for headline.
Focus on collaboration and efficiency.
```

### Variation B Prompt
```
Create a professional business image for LinkedIn (1200x627 landscape).
Show a confident project manager (woman, 35-40) presenting to stakeholders on a
large screen displaying project metrics and success indicators. Modern boardroom
setting. Use professional colors (navy, white, subtle green accents). Photorealistic
style. Medium shot focusing on presenter. No text overlays. Leave space on right
for headline. Focus on leadership and results.
```

### Output
```json
{
  "generated_at": "2024-01-15T10:40:00Z",
  "campaign_name": null,
  "platform": "linkedin",
  "target_audience": "project managers and team leads aged 30-50",
  "variations": [
    {
      "variation_id": "A",
      "image_url": "https://ik.imagekit.io/your_id/ad-images/campaign/saas_A.png",
      "thumbnail_url": "https://ik.imagekit.io/your_id/tr:n-ik_ml_thumbnail/ad-images/campaign/saas_A.png",
      "file_id": "mno345",
      "mime_type": "image/png",
      "prompt_used": "Create a professional business image...",
      "visual_approach": "Diverse team collaboration around conference table, modern office, professional blue tones, wide angle emphasizing teamwork",
      "dimensions": { "width": 1200, "height": 627 }
    },
    {
      "variation_id": "B",
      "image_url": "https://ik.imagekit.io/your_id/ad-images/campaign/saas_B.png",
      "thumbnail_url": "https://ik.imagekit.io/your_id/tr:n-ik_ml_thumbnail/ad-images/campaign/saas_B.png",
      "file_id": "pqr678",
      "mime_type": "image/png",
      "prompt_used": "Create a professional business image...",
      "visual_approach": "Confident female project manager presenting success metrics, modern boardroom, navy and green accents, leadership focus",
      "dimensions": { "width": 1200, "height": 627 }
    }
  ],
  "recommended_variation": "B",
  "recommendation_rationale": "Variation B is recommended because it directly addresses the demo request KPI by showing measurable results on screen. The leadership-focused imagery resonates with decision-makers on LinkedIn, and the confident presenter creates aspirational appeal for project managers seeking to improve their outcomes."
}
```
