# Mixed Media Generation Examples

## Example 1: Fitness App - TikTok

### Input
```json
{
  "selectedImage": {
    "variation_id": "A",
    "image_url": "https://ik.imagekit.io/example/fitness_A.png",
    "mime_type": "image/png",
    "prompt_used": "Energetic group HIIT workout...",
    "visual_approach": "Dynamic group workout scene",
    "dimensions": { "width": 1080, "height": 1920 }
  },
  "adCopy": {
    "variation_id": "A",
    "headline": "Transform Your Body in 15 Minutes",
    "body_copy": "Join thousands of women crushing their fitness goals with quick, effective HIIT workouts designed for busy schedules.",
    "cta": "Start Free Trial",
    "tone": "energetic and motivating",
    "platform_optimized": true
  },
  "platform": "tiktok"
}
```

### Output
```json
{
  "generated_at": "2024-01-15T10:45:00Z",
  "composite_image_url": "https://ik.imagekit.io/example/fitness_composite.png",
  "thumbnail_url": "https://ik.imagekit.io/example/tr:n-ik_ml_thumbnail/fitness_composite.png",
  "mime_type": "image/png",
  "platform": "tiktok",
  "dimensions": { "width": 1080, "height": 1920 },
  "source_image_variation": "A",
  "ad_copy_used": {
    "headline": "Transform Your Body in 15 Minutes",
    "body_copy": "Join thousands of women crushing their fitness goals with quick, effective HIIT workouts designed for busy schedules.",
    "cta": "Start Free Trial"
  }
}
```

---

## Example 2: Coffee Brand - Instagram Feed

### Input
```json
{
  "selectedImage": {
    "variation_id": "B",
    "image_url": "https://ik.imagekit.io/example/coffee_B.jpg",
    "mime_type": "image/jpeg",
    "prompt_used": "Lifestyle coffee moment...",
    "visual_approach": "Cozy home setting with hands holding cup",
    "dimensions": { "width": 1080, "height": 1080 }
  },
  "adCopy": {
    "variation_id": "A",
    "headline": "Your Morning Ritual, Elevated",
    "body_copy": "Organic, single-origin beans roasted to perfection. Because your first cup deserves to be extraordinary.",
    "cta": "Shop Now",
    "tone": "warm and inviting",
    "platform_optimized": true
  },
  "platform": "instagram_feed"
}
```

### Output
```json
{
  "generated_at": "2024-01-15T10:50:00Z",
  "composite_image_url": "https://ik.imagekit.io/example/coffee_composite.jpg",
  "thumbnail_url": "https://ik.imagekit.io/example/tr:n-ik_ml_thumbnail/coffee_composite.jpg",
  "mime_type": "image/jpeg",
  "platform": "instagram_feed",
  "dimensions": { "width": 1080, "height": 1080 },
  "source_image_variation": "B",
  "ad_copy_used": {
    "headline": "Your Morning Ritual, Elevated",
    "body_copy": "Organic, single-origin beans roasted to perfection. Because your first cup deserves to be extraordinary.",
    "cta": "Shop Now"
  }
}
```

---

## Example 3: B2B SaaS - LinkedIn

### Input
```json
{
  "selectedImage": {
    "variation_id": "B",
    "image_url": "https://ik.imagekit.io/example/saas_B.png",
    "mime_type": "image/png",
    "prompt_used": "Professional presenter with metrics...",
    "visual_approach": "Confident project manager presenting success metrics",
    "dimensions": { "width": 1200, "height": 627 }
  },
  "adCopy": {
    "variation_id": "B",
    "headline": "Deliver Projects 40% Faster",
    "body_copy": "Leading teams trust our platform to streamline workflows, reduce bottlenecks, and hit every deadline. See the difference data-driven project management makes.",
    "cta": "Request Demo",
    "tone": "professional and trustworthy",
    "platform_optimized": true
  },
  "platform": "linkedin"
}
```

### Output
```json
{
  "generated_at": "2024-01-15T10:55:00Z",
  "composite_image_url": "https://ik.imagekit.io/example/saas_composite.png",
  "thumbnail_url": "https://ik.imagekit.io/example/tr:n-ik_ml_thumbnail/saas_composite.png",
  "mime_type": "image/png",
  "platform": "linkedin",
  "dimensions": { "width": 1200, "height": 627 },
  "source_image_variation": "B",
  "ad_copy_used": {
    "headline": "Deliver Projects 40% Faster",
    "body_copy": "Leading teams trust our platform to streamline workflows, reduce bottlenecks, and hit every deadline. See the difference data-driven project management makes.",
    "cta": "Request Demo"
  }
}
```

---

## Text Placement Examples

### TikTok Vertical (9:16)
```
┌─────────────────────┐
│   [Status Bar]      │  ← 150px safe zone
├─────────────────────┤
│                     │
│     HEADLINE        │  ← Top text zone
│     Body copy       │
│                     │
│                     │
│   [Main Image]      │  ← Center 50%
│                     │
│                     │
│                     │
│      [CTA]          │  ← Bottom text zone
│   [UI Elements]     │  ← 300px safe zone
└─────────────────────┘
```

### Instagram Square (1:1)
```
┌─────────────────────┐
│                     │
│     HEADLINE        │  ← Top 15%
│                     │
│                     │
│   [Main Image]      │  ← Center
│                     │
│                     │
│     Body copy       │  ← Bottom 25%
│      [CTA]          │
└─────────────────────┘
```

### LinkedIn Landscape (1.91:1)
```
┌─────────────────────────────────────┐
│                                     │
│  HEADLINE          [Main Image]     │
│  Body copy                          │
│  [CTA]                              │
│                                     │
└─────────────────────────────────────┘
     ↑ Left 35%           Right 65% ↑
```
