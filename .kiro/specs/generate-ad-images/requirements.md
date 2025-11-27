# Requirements Document

## Introduction

The Generate Ad Images feature enables advertisers to generate two distinct AI-powered image variations for their advertising campaigns using Google Gemini's image generation capabilities. The system produces creative visuals based on campaign parameters and research insights, allowing users to preview, compare, and select their preferred image through an interactive UI. A companion feature, Generate Mixed Media Creatives, combines the selected image with generated ad copy to produce complete, platform-ready ad creatives.

## Glossary

- **Ad Image**: A visual asset generated for use in advertising campaigns
- **Image Variation**: A distinct version of an ad image with different visual approach, composition, or style
- **Campaign Parameters**: Structured data describing the advertising campaign (product, audience, platform, budget, etc.)
- **Campaign Report**: Research findings from the conduct-ad-research feature containing audience insights, platform strategy, and creative direction
- **Ad Copy**: The text content of an advertisement, including headlines, body text, and calls-to-action
- **Mixed Media Creative**: A composite ad asset combining an image with ad copy in a platform-specific layout
- **Platform**: The advertising channel where the ad will be displayed (e.g., TikTok, Facebook, Instagram)
- **UIResource**: An interactive UI component rendered through mcp-ui for user interaction
- **Google Gemini**: Google's multimodal AI model used for image generation
- **Image Generation Script**: A Python script that interfaces with Google Gemini API to generate images

## Requirements

### Requirement 1

**User Story:** As an advertiser, I want to generate two distinct ad image variations, so that I can choose the visual that best represents my campaign.

#### Acceptance Criteria

1. WHEN the generateAdImages tool receives valid campaign parameters THEN the Ad Image Generator SHALL produce exactly two distinct image variations
2. WHEN generating image variations THEN the Ad Image Generator SHALL ensure each variation has a different visual approach, composition, or style
3. WHEN generating images THEN the Ad Image Generator SHALL use Google Gemini's image generation API via a Python script
4. WHEN campaign research insights are provided THEN the Ad Image Generator SHALL incorporate audience insights and creative direction into the image prompts

### Requirement 2

**User Story:** As an advertiser, I want the generated images to be tailored to my target platform and audience, so that they resonate with my intended customers.

#### Acceptance Criteria

1. WHEN a platform is specified in campaign parameters THEN the Ad Image Generator SHALL adapt the image dimensions and style to platform-specific best practices
2. WHEN a target audience is specified THEN the Ad Image Generator SHALL tailor the visual style and elements to appeal to that audience
3. WHEN creative direction is provided THEN the Ad Image Generator SHALL reflect the specified tone and style in the generated images

### Requirement 3

**User Story:** As an advertiser, I want to view and compare both image variations in an interactive UI, so that I can make an informed selection.

#### Acceptance Criteria

1. WHEN image variations are generated THEN the Ad Image Generator SHALL display both variations side-by-side in a UIResource
2. WHEN displaying image variations THEN the UI SHALL show each image with a clear label (Variation A, Variation B)
3. WHEN displaying image variations THEN the UI SHALL provide a selection button for each variation
4. WHEN a user selects a variation THEN the UI SHALL trigger a tool call with the selected image data
5. WHEN neither variation is suitable THEN the UI SHALL provide a regenerate button to request new variations

### Requirement 4

**User Story:** As an advertiser, I want to receive a text summary of the generated images, so that the LLM can reference and discuss the options with me.

#### Acceptance Criteria

1. WHEN images are generated THEN the Ad Image Generator SHALL return a text summary alongside the UIResource
2. WHEN generating the text summary THEN the Ad Image Generator SHALL describe the visual approach for each variation
3. WHEN generating the text summary THEN the Ad Image Generator SHALL indicate which variation is recommended based on campaign goals

### Requirement 5

**User Story:** As a system user, I want the image generation to handle errors gracefully, so that I receive helpful feedback when issues occur.

#### Acceptance Criteria

1. IF the input validation fails THEN the Ad Image Generator SHALL return a validation error with specific field issues
2. IF the Gemini API call fails THEN the Ad Image Generator SHALL return an API error with retry guidance
3. IF a timeout occurs during generation THEN the Ad Image Generator SHALL return a timeout error with retry option
4. WHEN an error occurs THEN the Ad Image Generator SHALL display an error UI with appropriate messaging and recovery options

### Requirement 6

**User Story:** As a developer, I want the image data to be validated against a schema, so that the system maintains data integrity.

#### Acceptance Criteria

1. WHEN images are generated THEN the Ad Image Generator SHALL validate the output against a Zod schema
2. WHEN validating image data THEN the schema SHALL require image_data (base64), mime_type, and variation_id fields for each variation
3. WHEN validating image data THEN the schema SHALL require exactly two variations in the response
4. WHEN serializing image data to JSON THEN the Ad Image Generator SHALL produce valid JSON that can be parsed back to the original structure

### Requirement 7

**User Story:** As an advertiser, I want to combine my selected image with generated ad copy, so that I can create a complete ad creative.

#### Acceptance Criteria

1. WHEN the generateMixedMediaCreative tool receives a selected image and ad copy THEN the Mixed Media Generator SHALL produce a composite ad creative
2. WHEN generating the composite THEN the Mixed Media Generator SHALL overlay the ad copy (headline, body, CTA) on the selected image
3. WHEN generating the composite THEN the Mixed Media Generator SHALL apply platform-specific formatting and layout
4. WHEN the composite is generated THEN the Mixed Media Generator SHALL display a preview in a UIResource

### Requirement 8

**User Story:** As an advertiser, I want to preview the final ad creative as it would appear on my target platform, so that I can verify it meets my needs.

#### Acceptance Criteria

1. WHEN displaying the mixed media creative THEN the UI SHALL show the composite image with overlaid text
2. WHEN displaying the mixed media creative THEN the UI SHALL provide download/export options
3. WHEN displaying the mixed media creative THEN the UI SHALL provide an option to regenerate with different copy or image variations
4. WHEN a platform is specified THEN the UI SHALL format the preview to match platform-specific ad dimensions

### Requirement 9

**User Story:** As a developer, I want the image generation to use a Python script within the skill plugin, so that the system can leverage Google Gemini's capabilities.

#### Acceptance Criteria

1. WHEN the skill plugin is invoked THEN the system SHALL execute a Python script located in the skill's scripts directory
2. WHEN executing the Python script THEN the system SHALL pass the image generation prompt as input
3. WHEN the Python script completes THEN the system SHALL receive the generated image data (bytes) and mime type
4. WHEN the Python script encounters an error THEN the system SHALL capture and report the error appropriately

